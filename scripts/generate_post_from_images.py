#!/usr/bin/env python3
"""
Generate an AI-powered blog post from a PDF + manually-placed images.

Workflow
--------
1. PREPARE — create the image folder and print instructions:
       python scripts/generate_post_from_images.py public/pdfs/my-paper.pdf --prepare

2. Add your figures (fig_01.png, fig_02.png, …) to:
       public/blog-images/{slug}/

3. GENERATE — read PDF text + images from that folder, call the AI:
       python scripts/generate_post_from_images.py public/pdfs/my-paper.pdf

Options
-------
    --prepare          Only create the image folder and print the slug; do not call AI.
    --title            Paper title (auto-detected from PDF text if omitted).
    --slug             URL slug (derived from title if omitted).
    --date             Post date YYYY-MM-DD (defaults to today).
    --provider         anthropic | openai  (default: anthropic)
    --pub-id           Publication ID from publications.json for metadata.
    --pdf-link         Web path to the paper PDF, e.g. /pdfs/my-paper.pdf
    --max-figures      Maximum figures to include (default: 10)

Dependencies:
    pip install pymupdf anthropic openai
"""

import argparse
import base64
import json
import random
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

import fitz  # PyMuPDF — used only for text extraction

REPO_ROOT = Path(__file__).resolve().parent.parent
POSTS_JSON = REPO_ROOT / "src" / "data" / "posts.json"
PUBS_JSON = REPO_ROOT / "src" / "data" / "publications.json"
PUBLIC_IMAGES_DIR = REPO_ROOT / "public" / "blog-images"

# Max paper text chars sent to AI (~4k tokens)
MAX_TEXT_CHARS = 16000

# Image extensions to look for in the folder
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


# ── Helpers ──────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    # Normalize Unicode (e.g. fi ligature \ufb01 -> fi) before processing
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text)[:80].strip("-")


def to_b64(img_bytes: bytes) -> str:
    return base64.b64encode(img_bytes).decode()


def media_type(path: Path) -> str:
    return {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }.get(path.suffix.lower(), "image/png")


# ── PDF text extraction ───────────────────────────────────────────────────────

def extract_text(pdf_path: Path) -> str:
    """Return full text from the PDF (no image extraction)."""
    doc = fitz.open(str(pdf_path))
    text = "\n".join(page.get_text() for page in doc)
    doc.close()
    return text


def autodetect_title(text: str, fallback: str) -> str:
    for line in text.splitlines():
        line = line.strip()
        if len(line) > 15:
            return line[:120]
    return fallback


# ── Image folder helpers ──────────────────────────────────────────────────────

def image_folder(slug: str) -> Path:
    return PUBLIC_IMAGES_DIR / slug


def list_images(slug: str) -> list[Path]:
    """Return sorted image files from the blog-images folder for this slug."""
    folder = image_folder(slug)
    if not folder.exists():
        return []
    files = sorted(
        f for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in IMAGE_EXTS
    )
    return files


def load_figures(image_files: list[Path], slug: str) -> tuple[list[dict], list[str]]:
    """
    Read image bytes from disk.
    Returns (figures, web_paths).
    figures: list of {bytes, media_type, filename}
    web_paths: list of /blog-images/{slug}/filename strings
    """
    figures = []
    web_paths = []
    for f in image_files:
        figures.append({
            "bytes": f.read_bytes(),
            "media_type": media_type(f),
            "filename": f.name,
        })
        web_paths.append(f"/blog-images/{slug}/{f.name}")
    return figures, web_paths


# ── Publication lookup ────────────────────────────────────────────────────────

def lookup_publication(pub_id_arg: str | None, pdf_path: Path) -> dict | None:
    if not PUBS_JSON.exists():
        return None
    with open(PUBS_JSON, encoding="utf-8") as f:
        pubs = json.load(f)

    if pub_id_arg:
        match = next((p for p in pubs if p.get("id") == pub_id_arg), None)
        if not match:
            print(f"  [warn] --pub-id '{pub_id_arg}' not found in publications.json")
        return match

    # Auto-match by PDF filename
    fname = pdf_path.name.lower()
    for pub in pubs:
        pub_pdf = pub.get("pdf", "").lower()
        if pub_pdf and (fname in pub_pdf or Path(pub_pdf).name == fname):
            print(f"  Auto-matched publication: {pub.get('id')}")
            return pub

    return None


# ── Prompt ────────────────────────────────────────────────────────────────────

# Each angle produces a structurally different post, not just a different tone.
# One is picked at random per run to prevent all posts from reading the same.
ANGLES = [
    (
        "production-pain",
        "Write for an engineer who has been burned by this exact problem in production. "
        "Open with the pain — the 3am page, the mysterious slowdown, the cost spike nobody could explain. "
        "Then show how this work would have changed the outcome. Make it visceral and specific."
    ),
    (
        "contrarian",
        "Write as if everyone has been solving this wrong, and you're here to say so. "
        "Be direct and a little provocative. Name the conventional wisdom, then dismantle it with the results. "
        "Don't hedge. The reader should finish thinking 'huh, I need to rethink this.'"
    ),
    (
        "postmortem",
        "Structure this as a research postmortem: what we assumed going in, what failed, "
        "what surprised us, what finally worked, and what we'd do differently. "
        "Be honest about the false starts. The messiness is what makes it credible."
    ),
    (
        "skeptic-rebuttal",
        "Write for a skeptical reader who doesn't believe this approach actually works at scale. "
        "Surface their objections early, then address each one head-on with evidence from the experiments. "
        "The structure should feel like a debate where you win by the end."
    ),
    (
        "counterintuitive-result",
        "Lead with the single most counterintuitive result in the paper. "
        "Build the entire post around explaining why that result is actually right. "
        "Everything, including the system description, should serve the explanation of that one surprising finding."
    ),
    (
        "practitioner",
        "Write for someone who will read this and immediately ask 'ok but what do I actually do differently on Monday?' "
        "Every section should move toward actionable implications. "
        "Skip anything that doesn't change how a practitioner would design, build, or operate a system."
    ),
    (
        "slow-burn",
        "Don't reveal the main finding immediately. Open by establishing why the problem is hard, "
        "build tension through the experimental setup, then let the result land with weight. "
        "Pacing matters. The reader should feel the payoff."
    ),
]


def make_prompt(title: str, text: str, image_paths: list[str]) -> str:
    has_figures = bool(image_paths)
    figure_context = ""
    figure_rules = ""
    inline_note = ""

    if has_figures:
        paths_list = "\n".join(f"  {p}" for p in image_paths)
        figure_context = f"""
The figures for this paper are provided as images above (in order).
Their exact web paths are:
{paths_list}
"""
        figure_rules = """
CRITICAL — figure placement rules (follow exactly):
- Place each figure IMMEDIATELY after the paragraph that discusses it
- Use this exact syntax on its OWN LINE with blank lines before and after:
  ![One or two sentence caption describing what the figure shows and what to notice](exact_path_from_list_above)
- The alt text IS the caption — do NOT add any separate caption line after the image
- Do NOT group all figures at the end under any heading
- Do NOT wrap captions in asterisks (*caption*)
- Only use a figure if it genuinely supports the surrounding paragraph
- Write captions that tell the reader what to look for, not just what the figure is
"""
        inline_note = "Embed relevant figures inline as you describe each result. Each figure should appear immediately after the paragraph discussing it."

    angle_key, angle_text = random.choice(ANGLES)
    print(f"  Writing angle: {angle_key}")

    return f"""You are a staff engineer and technical writer who has published on the Anthropic, Meta, and NVIDIA engineering blogs.
Your job: write a blog post about this research paper that a senior ML engineer would actually want to read.
Not a summary. Not a structured report. A post with a point of view, a clear narrative arc, and concrete insights.

This post is written in FIRST PERSON as the paper's authors.
ALWAYS use "we", "our", "us". NEVER use "the researchers", "the authors", "the paper", "they show", or any third-person framing.

=== WRITING ANGLE (this shapes everything — structure, emphasis, voice) ===
{angle_text}

Paper title: {title}

Paper text (may be truncated):
{text[:MAX_TEXT_CHARS]}
{figure_context}
=== WRITING RULES ===

Voice & tone:
- Write like a staff engineer explaining results to a smart colleague. Confident, direct, slightly opinionated.
- Short paragraphs (2–4 sentences max). Every paragraph earns its place.
- Bold (**like this**) key numbers, surprising findings, and terms worth remembering.
- Do NOT use em dashes (—). Use a comma, period, or rewrite.
- Do NOT use *italic* — no asterisks around words whatsoever.
- Avoid: "this paper demonstrates", "we observe that", "it is worth noting", "in this work we present"
- Prefer: "The key insight is...", "What surprised us:", "This matters because...", "The uncomfortable truth is..."

Opening rules:
- Do NOT open with an industry statistic ("Data centers consume X% of electricity...")
- Do NOT open with a definition or background
- OPEN in a way that serves the writing angle above — tension, a surprising result, a provocative claim, the pain
- BAD: "Data centers are under increasing pressure to optimize both performance and energy use."
- GOOD: "We cap GPU power at 400W and throughput goes up. That sentence shouldn't make sense, but it does."

Accuracy:
- Only state things explicitly supported by the paper text above
- Do NOT invent numbers, benchmarks, or comparisons not in the paper
- Takeaways must only reflect what is in the paper

{figure_rules}
=== STRUCTURE ===

Required sections (order and heading names are YOURS to decide based on the angle and this paper's story):
1. An opening with no heading — 3–4 sentences, no easing in
2. A TL;DR — 4–6 bullets, bold the key number in each, reward skimmers not summarizers
3. The core idea — what is the key insight in plain terms? Use a concrete example from the paper if it's clearer than an analogy. No forced analogies.
4. The experimental story — don't enumerate results. For each major finding: what did we expect, what happened, what does it reveal? {inline_note}
5. How it works — key design decisions and why, inputs/outputs, what makes this different from the naive approach
6. Key results — bullet list, bold the number, one "so what" sentence per bullet
7. Takeaways — what we're confident about, what the limits are, what's still open. End on something worth remembering.

Do NOT write a top-level title heading (the site renders it already).
Use ## for section headings, ### for sub-headings.
Target 1000–1300 words. Every section should feel necessary."""


# ── AI generation ─────────────────────────────────────────────────────────────

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
                "media_type": fig["media_type"],
                "data": to_b64(fig["bytes"]),
            },
        })

    content.append({"type": "text", "text": make_prompt(title, text, image_paths)})

    print(f"  Calling Claude with {len(figures)} figure(s)...")
    msg = anthropic.Anthropic().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=6000,
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
            "image_url": {"url": f"data:{fig['media_type']};base64,{to_b64(fig['bytes'])}"},
        })

    content.append({"type": "text", "text": make_prompt(title, text, image_paths)})

    print(f"  Calling GPT-4o with {len(figures)} figure(s)...")
    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=4000,
        messages=[{"role": "user", "content": content}],
    )
    return response.choices[0].message.content.strip()


# ── Post-processing ───────────────────────────────────────────────────────────

def clean_content(md: str) -> str:
    lines = md.splitlines()
    cleaned: list[str] = []
    prev_was_image = False

    figure_section = re.compile(
        r"^##\s+(figures?(&|\s+and\s+)tables?|figures?)\s*$", re.IGNORECASE
    )
    italic_line = re.compile(r"^\*[^*].+[^*]\*$")

    for line in lines:
        if figure_section.match(line.strip()):
            continue
        if prev_was_image and italic_line.match(line.strip()):
            continue
        prev_was_image = bool(re.match(r"^!\[", line.strip()))
        cleaned.append(line)

    result = "\n".join(cleaned)

    # Replace em dashes with comma+space (catches — and its HTML entity lookalikes)
    result = result.replace("\u2014", ",")   # —
    result = result.replace("\u2013", "-")   # –

    # Fix third-person phrases
    subs = [
        (r"\bthe researchers\b", "we"),
        (r"\bthe authors\b", "we"),
        (r"\bthis paper\b", "this work"),
        (r"\bthe paper\b", "this work"),
        (r"\bthe proposed (system|approach|method|framework|technique)\b", r"our \1"),
        (r"\bthey (show|demonstrate|find|observe|propose|present|introduce|evaluate)\b", r"we \1"),
    ]
    for pattern, repl in subs:
        result = re.sub(pattern, repl, result, flags=re.IGNORECASE)

    return result


def first_paragraph(md: str) -> str:
    for line in md.splitlines():
        line = line.strip()
        if line and not line.startswith("#") and not line.startswith("!"):
            return line[:220]
    return ""


# ── posts.json helpers ────────────────────────────────────────────────────────

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
    parser = argparse.ArgumentParser(
        description="Generate a blog post from a PDF + manually-placed images."
    )
    parser.add_argument("pdf", help="Path to the PDF file")
    parser.add_argument(
        "--prepare", action="store_true",
        help="Create the image folder and print the slug, then exit (no AI call)",
    )
    parser.add_argument("--title", help="Paper title (auto-detected if omitted)")
    parser.add_argument("--slug", help="URL slug (derived from title if omitted)")
    parser.add_argument("--date", default=str(date.today()), help="Post date YYYY-MM-DD")
    parser.add_argument(
        "--provider", choices=["anthropic", "openai"], default="anthropic",
        help="AI provider (default: anthropic)",
    )
    parser.add_argument("--pub-id", help="Publication ID from publications.json")
    parser.add_argument("--pdf-link", help="Web path to the PDF, e.g. /pdfs/my-paper.pdf")
    parser.add_argument(
        "--max-figures", type=int, default=10,
        help="Max figures to pass to the AI (default: 10)",
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.is_file():
        sys.exit(f"Error: file not found: {pdf_path}")

    # ── 1. Extract text + resolve title/slug ─────────────────────────────────
    print(f"\n[1] Reading PDF text from {pdf_path.name}...")
    text = extract_text(pdf_path)

    # Look up publication early so its title drives the slug
    pub = lookup_publication(args.pub_id, pdf_path)

    if args.title:
        title = args.title
    elif pub and pub.get("title"):
        title = pub["title"]
        print(f"  Title (from publications.json): {title!r}")
    else:
        title = autodetect_title(text, pdf_path.stem)
        print(f"  Title (auto-detected): {title!r}")

    slug = args.slug or slugify(title)
    print(f"  Slug:  {slug}")

    # ── 2. Prepare mode: create folder and exit ───────────────────────────────
    folder = image_folder(slug)
    folder.mkdir(parents=True, exist_ok=True)

    if args.prepare:
        print(f"\nImage folder ready: {folder}")
        print(f"\nNext steps:")
        print(f"  1. Add your figures to: {folder}")
        print(f"     Name them fig_01.png, fig_02.png, ... (or any name; sorted alphabetically)")
        print(f"  2. Run again without --prepare to generate the post:")
        print(f"     python scripts/generate_post_from_images.py {args.pdf}")
        return

    # ── 3. Load images from folder ────────────────────────────────────────────
    image_files = list_images(slug)
    print(f"\n[2] Found {len(image_files)} image(s) in {folder.name}/")
    if not image_files:
        print("  No images found. Add images to the folder or run with --prepare for instructions.")
        print("  Continuing without figures...")

    if len(image_files) > args.max_figures:
        print(f"  Using first {args.max_figures} of {len(image_files)} images.")
        image_files = image_files[: args.max_figures]

    figures, image_paths = load_figures(image_files, slug)

    # ── 4. Generate post ──────────────────────────────────────────────────────
    print(f"\n[3] Generating post ({args.provider})...")
    if args.provider == "anthropic":
        content_md = generate_post_anthropic(text, title, figures, image_paths)
    else:
        content_md = generate_post_openai(text, title, figures, image_paths)

    content_md = clean_content(content_md)

    # ── 5. Write to posts.json ────────────────────────────────────────────────
    print("\n[4] Updating posts.json...")

    entry: dict = {
        "slug": slug,
        "title": title,
        "date": args.date,
        "summary": first_paragraph(content_md),
        "content": content_md,
    }
    if args.pdf_link:
        entry["paperPdf"] = args.pdf_link
    if pub:
        if pub.get("title"):
            entry["title"] = pub["title"]
        if pub.get("authors"):
            entry["authors"] = pub["authors"]
        if pub.get("year"):
            entry["year"] = pub["year"]
        if pub.get("venue"):
            entry["venue"] = pub["venue"]
        if not args.pdf_link and pub.get("pdf"):
            entry["paperPdf"] = pub["pdf"]

    append_post(entry)
    print(f"\nDone!  ->  /articles/{slug}")


if __name__ == "__main__":
    main()