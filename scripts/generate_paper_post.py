#!/usr/bin/env python3
"""
Generate an AI-powered blog post from an academic PDF paper.

Extracts embedded figures (using PyMuPDF), skips all-black/blank images, then
sends all figures + paper text to Claude or GPT-4o in a single vision call.
The AI writes a detailed first-person blog post with figures placed inline.
Metadata (authors, year, venue) is auto-matched from publications.json.
Images are saved to public/blog-images/{slug}/ and an entry is added to
src/data/posts.json.

Dependencies:
    pip install pymupdf anthropic openai

Usage:
    python scripts/generate_paper_post.py public/pdfs/my-paper.pdf
    python scripts/generate_paper_post.py public/pdfs/my-paper.pdf \\
        --title "Exact Title" --slug my-slug --pub-id my-pub-id \\
        --pdf-link /pdfs/my-paper.pdf --provider openai --max-figures 8
"""

import argparse
import base64
import json
import re
import sys
from datetime import date
from pathlib import Path

import fitz  # PyMuPDF

REPO_ROOT = Path(__file__).resolve().parent.parent
POSTS_JSON = REPO_ROOT / "src" / "data" / "posts.json"
PUBS_JSON = REPO_ROOT / "src" / "data" / "publications.json"
PUBLIC_IMAGES_DIR = REPO_ROOT / "public" / "blog-images"

# Skip figures smaller than this (icons, logos, decorations)
MIN_WIDTH = 200
MIN_HEIGHT = 150

# Mean pixel channel value below this → image is mostly black, skip it
# 0–255 scale; ~5% brightness threshold
BLACK_THRESHOLD = 12.0

# Max paper text chars sent to AI (~4k tokens)
MAX_TEXT_CHARS = 16000


# ── Helpers ──────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text)[:60].strip("-")


def to_b64(img_bytes: bytes) -> str:
    return base64.b64encode(img_bytes).decode()


# ── Black image detection ─────────────────────────────────────────────────────

def is_mostly_black(pix: fitz.Pixmap) -> bool:
    """Return True if the image is predominantly black/empty."""
    samples = pix.samples
    n = len(samples)
    if n == 0:
        return True
    # Sample up to ~2000 values evenly across the image for speed
    step = max(1, n // 2000)
    sampled = bytearray(samples)[::step]
    avg = sum(sampled) / len(sampled)
    return avg < BLACK_THRESHOLD


# ── PDF extraction ────────────────────────────────────────────────────────────

def extract_pdf(pdf_path: Path) -> tuple[str, list[dict]]:
    """Return (full_text, list_of_valid_figure_dicts)."""
    doc = fitz.open(str(pdf_path))

    pages_text = [page.get_text() for page in doc]
    full_text = "\n".join(pages_text)

    figures: list[dict] = []
    seen: set[int] = set()

    for page_num, page in enumerate(doc):
        for img_info in page.get_images(full=True):
            xref = img_info[0]
            if xref in seen:
                continue
            seen.add(xref)

            try:
                pix = fitz.Pixmap(doc, xref)
                # Normalise to RGB
                if pix.n not in (3, 4):
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                elif pix.n == 4:
                    pix = fitz.Pixmap(fitz.csRGB, pix)

                if pix.width < MIN_WIDTH or pix.height < MIN_HEIGHT:
                    continue

                if is_mostly_black(pix):
                    print(f"  [skip] xref={xref} page={page_num + 1} — mostly black")
                    continue

                figures.append({
                    "xref": xref,
                    "page": page_num + 1,
                    "width": pix.width,
                    "height": pix.height,
                    "bytes": pix.tobytes("png"),
                    "index": len(figures) + 1,
                })
            except Exception as exc:
                print(f"  [warn] xref={xref}: {exc}", file=sys.stderr)

    doc.close()
    return full_text, figures


# ── Save figures ──────────────────────────────────────────────────────────────

def save_figures(figures: list[dict], slug: str) -> list[str]:
    """Save PNGs; return web paths like /blog-images/{slug}/fig_01.png."""
    out_dir = PUBLIC_IMAGES_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    paths = []
    for fig in figures:
        filename = f"fig_{fig['index']:02d}.png"
        (out_dir / filename).write_bytes(fig["bytes"])
        paths.append(f"/blog-images/{slug}/{filename}")

    print(f"  Saved {len(paths)} figure(s) → public/blog-images/{slug}/")
    return paths


# ── Publication lookup ────────────────────────────────────────────────────────

def lookup_publication(pub_id_arg: str | None, pdf_path: Path) -> dict | None:
    """Try to find the matching entry in publications.json."""
    if not PUBS_JSON.exists():
        return None

    with open(PUBS_JSON, encoding="utf-8") as f:
        pubs = json.load(f)

    if pub_id_arg:
        match = next((p for p in pubs if p.get("id") == pub_id_arg), None)
        if not match:
            print(f"  [warn] --pub-id '{pub_id_arg}' not found in publications.json")
        return match

    # Auto-match: compare input filename against the pdf field in each publication
    fname = pdf_path.name.lower()
    for pub in pubs:
        pub_pdf = pub.get("pdf", "").lower()
        if pub_pdf and (fname in pub_pdf or Path(pub_pdf).name == fname):
            print(f"  Auto-matched publication: {pub.get('id')}")
            return pub

    return None


# ── Prompt ────────────────────────────────────────────────────────────────────

def make_prompt(title: str, text: str, image_paths: list[str]) -> str:
    has_figures = bool(image_paths)

    figure_context = ""
    figure_rules = ""
    inline_note = ""

    if has_figures:
        paths_list = "\n".join(f"  {p}" for p in image_paths)
        figure_context = f"""
The figures extracted from this paper are provided as images above (in order).
Their exact web paths are:
{paths_list}
"""
        figure_rules = """
CRITICAL — figure placement rules (you MUST follow these exactly):
- Place each figure IMMEDIATELY after the paragraph in the text that discusses it
- Use this exact syntax on its OWN LINE with blank lines before and after:
  ![One or two sentence caption](exact_path_from_list_above)
- The alt text IS the full caption — do NOT add any separate text after the image line
- Do NOT create a "Figures", "Figures & Tables", or any other figure-grouping section
- Do NOT put all images at the end — they must be distributed throughout the body
- Do NOT wrap the caption in asterisks (*caption*) — plain text only inside []
- Only use figures that genuinely support the paragraph they follow
"""
        inline_note = "Embed relevant figures inline as you describe each component."

    return f"""You are a staff engineer and technical writer who deeply understands systems research.
Your job is to write an outstanding blog post about a research paper — the kind you'd find on
the Anthropic, Meta, or NVIDIA engineering blogs. Smart, clear, opinionated, skimmable.

This post is written in FIRST PERSON as the paper's authors.
ALWAYS use "we", "our", "us". NEVER use "the researchers", "the authors", "the paper",
"they show", or any third-person framing.

Paper title: {title}

Paper text (may be truncated):
{text[:MAX_TEXT_CHARS]}
{figure_context}
=== WRITING RULES (follow ALL of these) ===

Voice & tone:
- Write like a staff engineer explaining a classic paper to a smart colleague
- Confident and direct. Slightly opinionated is GOOD.
- Short paragraphs (2–4 sentences max). Use white space generously.
- Bold (**like this**) key ideas, surprising findings, and important numbers
- NEVER use *italic* — no asterisks around words, no *emphasis*, no *caption lines*
- Avoid academic filler: "this paper demonstrates", "we observe that", "it is worth noting"
- Prefer: "The key idea is…", "What's surprising is…", "This matters because…"

Structure:
- Do NOT write a top-level title heading (the site renders the title already)
- Use ## for all section headings
- Minimum 1000 words — go deep, don't be surface-level

Specificity:
- Always include real numbers, percentages, system names, benchmark names
- Explain WHY each result matters, not just what it is
- Connect findings to modern relevance (LLM inference, GPU power caps, data center ops)
{figure_rules}
=== REQUIRED STRUCTURE ===

## Hook
2–3 punchy sentences. Why should anyone care about this TODAY?
Connect the core idea to something modern and relevant — LLMs, GPUs, power-constrained AI.
No background. No definitions. Just the hook.

## TL;DR
4–6 crisp bullet points. Key numbers included. Each bullet is one standalone insight.
Example format:
- **Adding thread packing to DVFS expands the achievable power range by 21%** — something frequency scaling alone cannot do.

## The Core Idea
Explain the key insight intuitively BEFORE any system detail.
Use an analogy. Give the reader a mental model.
Example mental models: "fewer hotter cores vs. many cooler cores", "batching requests to amortize fixed costs"
1–2 short paragraphs.

## Why This Still Matters
Connect this 2011 work to today's problems.
Think: GPU power caps, LLM inference batching, tokens-per-joule, data center power budgets.
Be opinionated. What did this work get right that the field ignored for years?
1–2 paragraphs.

## Key Insights from the Experiments
Walk through the most important experimental findings.
Don't just restate numbers — explain what they reveal about the system's behavior.
Use figures inline where they support the point. {inline_note}
2–4 paragraphs.

## How It Works (System Design)
What did we actually build? Keep it simple.
Focus on the control loop and the key design decisions — skip classifier math.
What inputs does it use? What does it output? Why those choices?
2–3 paragraphs.

## Key Results
Bullet list. Bold the number or key finding in each bullet. Explain the "so what" after the number.

## My Takeaways
Be honest. What aged well? What would you do differently today?
What's missing that matters now — GPUs, heterogeneous cores, LLM batching, MoE routing?
1–2 paragraphs. First person ("Looking back…", "If we were building this today…")"""


# ── AI generation (single combined call) ─────────────────────────────────────

def generate_post_anthropic(
    text: str, title: str, figures: list[dict], image_paths: list[str]
) -> str:
    import anthropic

    client = anthropic.Anthropic()
    content: list[dict] = []

    for i, (fig, path) in enumerate(zip(figures, image_paths)):
        content.append({"type": "text", "text": f"[Figure {i + 1} — path: {path}]"})
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/png",
                "data": to_b64(fig["bytes"]),
            },
        })

    content.append({"type": "text", "text": make_prompt(title, text, image_paths)})

    print(f"  Calling Claude with {len(figures)} figure(s)…")
    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=3000,
        messages=[{"role": "user", "content": content}],
    )
    return msg.content[0].text.strip()


def generate_post_openai(
    text: str, title: str, figures: list[dict], image_paths: list[str]
) -> str:
    from openai import OpenAI

    client = OpenAI()
    content: list[dict] = []

    for i, (fig, path) in enumerate(zip(figures, image_paths)):
        content.append({"type": "text", "text": f"[Figure {i + 1} — path: {path}]"})
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/png;base64,{to_b64(fig['bytes'])}"},
        })

    content.append({"type": "text", "text": make_prompt(title, text, image_paths)})

    print(f"  Calling GPT-4o with {len(figures)} figure(s)…")
    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=3000,
        messages=[{"role": "user", "content": content}],
    )
    return response.choices[0].message.content.strip()


# ── Post-processing cleanup ──────────────────────────────────────────────────

def clean_content(md: str) -> str:
    """
    Strip artefacts that the AI sometimes produces despite instructions:
    - *italic caption* lines that immediately follow an image
    - Standalone ## Figures / ## Figures & Tables section headings
    - Third-person phrases replaced with first-person equivalents
    """
    lines = md.splitlines()
    cleaned: list[str] = []
    prev_was_image = False

    figure_section = re.compile(
        r'^##\s+(figures?(&|\s+and\s+)tables?|figures?)\s*$', re.IGNORECASE
    )
    italic_line = re.compile(r'^\*[^*].+[^*]\*$')

    for line in lines:
        # Drop standalone ## Figures / ## Figures & Tables headings
        if figure_section.match(line.strip()):
            continue
        # Drop *italic caption* lines that follow an image
        if prev_was_image and italic_line.match(line.strip()):
            continue

        prev_was_image = bool(re.match(r'^!\[', line.strip()))
        cleaned.append(line)

    result = "\n".join(cleaned)

    # Fix third-person phrases
    replacements = [
        (r'\bthe researchers\b', 'we'),
        (r'\bthe authors\b', 'we'),
        (r'\bthis paper\b', 'this work'),
        (r'\bthe paper\b', 'this work'),
        (r'\bthe proposed (system|approach|method|framework|technique)\b', r'our \1'),
        (r'\bthey (show|demonstrate|find|observe|propose|present|introduce|evaluate)\b', r'we \1'),
    ]
    for pattern, repl in replacements:
        result = re.sub(pattern, repl, result, flags=re.IGNORECASE)

    return result


def first_paragraph(md: str) -> str:
    """Extract the first non-heading, non-image paragraph for the short summary."""
    for line in md.splitlines():
        line = line.strip()
        if line and not line.startswith("#") and not line.startswith("!"):
            return line[:220]
    return ""


def append_post(entry: dict) -> None:
    with open(POSTS_JSON, "r", encoding="utf-8-sig") as f:
        posts = json.load(f)

    if any(p["slug"] == entry["slug"] for p in posts):
        print(f"  [warn] Slug '{entry['slug']}' already exists — skipping posts.json update.")
        return

    posts.insert(0, entry)

    with open(POSTS_JSON, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

    print(f"  Added '{entry['title']}' to posts.json")


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a blog post from an academic PDF.")
    parser.add_argument("pdf", help="Path to the PDF file")
    parser.add_argument("--title", help="Paper title (auto-detected if omitted)")
    parser.add_argument("--slug", help="URL slug (derived from title if omitted)")
    parser.add_argument("--date", default=str(date.today()), help="Post date YYYY-MM-DD")
    parser.add_argument(
        "--provider", choices=["anthropic", "openai"], default="anthropic",
        help="AI provider (default: anthropic)",
    )
    parser.add_argument(
        "--pub-id",
        help="Publication ID from publications.json to pull author/year/venue metadata",
    )
    parser.add_argument(
        "--pdf-link",
        help="Web path to the paper PDF, e.g. /pdfs/my-paper.pdf",
    )
    parser.add_argument(
        "--max-figures", type=int, default=8,
        help="Maximum figures to include in the post (default: 8)",
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.is_file():
        sys.exit(f"Error: file not found: {pdf_path}")

    # ── 1. Extract ────────────────────────────────────────────────────────────
    print(f"\n[1/4] Extracting from {pdf_path.name}…")
    text, figures = extract_pdf(pdf_path)

    if len(figures) > args.max_figures:
        print(f"  Keeping top {args.max_figures} of {len(figures)} figures.")
        figures = figures[: args.max_figures]
    else:
        print(f"  {len(figures)} usable figure(s) found.")

    title = args.title
    if not title:
        for line in text.splitlines():
            line = line.strip()
            if len(line) > 15:
                title = line[:120]
                break
        print(f"  Auto-detected title: {title!r}")

    slug = args.slug or slugify(title or pdf_path.stem)
    print(f"  Slug: {slug}")

    # ── 2. Save figures ───────────────────────────────────────────────────────
    print("\n[2/4] Saving figures…")
    image_paths = save_figures(figures, slug)

    # ── 3. Generate post (single AI call with all figures inline) ─────────────
    print(f"\n[3/4] Generating post ({args.provider})…")
    if args.provider == "anthropic":
        content_md = generate_post_anthropic(text, title or "", figures, image_paths)
    else:
        content_md = generate_post_openai(text, title or "", figures, image_paths)

    content_md = clean_content(content_md)

    # ── 4. Write to posts.json ────────────────────────────────────────────────
    print("\n[4/4] Updating posts.json…")
    pub = lookup_publication(args.pub_id, pdf_path)

    entry: dict = {
        "slug": slug,
        "title": title or slug,
        "date": args.date,
        "summary": first_paragraph(content_md),
        "content": content_md,
    }
    if args.pdf_link:
        entry["paperPdf"] = args.pdf_link
    if pub:
        if pub.get("authors"):
            entry["authors"] = pub["authors"]
        if pub.get("year"):
            entry["year"] = pub["year"]
        if pub.get("venue"):
            entry["venue"] = pub["venue"]
        # Fall back to pub's pdf path if no --pdf-link was given
        if not args.pdf_link and pub.get("pdf"):
            entry["paperPdf"] = pub["pdf"]

    append_post(entry)

    print(f"\nDone!  →  /blog/{slug}")


if __name__ == "__main__":
    main()
