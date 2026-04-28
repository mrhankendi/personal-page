#!/usr/bin/env python3
"""
extract_ieee_figures.py
-----------------------
Extracts figures from IEEE-style 2-column PDF papers.

Strategy:
  1. Find figure captions ("Figure N:" / "Fig. N:") via text block scan.
  2. Locate figure content using vector drawing bounding boxes:
       - Collect drawing paths above each caption in the matching column.
       - The union of those paths gives the figure region.
       - Falls back to raster-image bboxes, then a fixed-height crop.
  3. Render the page at high DPI, crop, and save as PNG.

Usage:
    python extract_ieee_figures.py paper.pdf [--dpi 200] [--out figures/] [--margin 4]
"""

import argparse
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF


# ── regex ─────────────────────────────────────────────────────────────────────

CAPTION_RE = re.compile(r"^(fig(?:ure)?\.?\s*\d+)", re.IGNORECASE)


# ── helpers ───────────────────────────────────────────────────────────────────

def is_caption_block(text: str) -> bool:
    return bool(CAPTION_RE.match(text.strip()))


def caption_number(text: str) -> str:
    m = re.search(r"(\d+)", text)
    return m.group(1) if m else "?"


def col_band(x0: float, x1: float, page_w: float, margin: float = 36) -> str:
    """Classify the horizontal span: 'left', 'right', or 'full'."""
    mid = page_w / 2
    if x0 < mid - margin and x1 > mid + margin:
        return "full"
    if x1 <= mid + margin:
        return "left"
    return "right"


def band_x_range(band: str, page_w: float, pad: float = 2):
    """Return (x_lo, x_hi) for a named band with optional inward padding."""
    mid = page_w / 2
    if band == "full":
        return pad, page_w - pad
    if band == "left":
        return pad, mid - pad
    return mid + pad, page_w - pad


def drawing_bbox_in_band(drawings, band, page_w, y_min=0.0, y_max=1e9):
    """Union bounding box of drawing paths that fall within the column band
    and the given y window. Returns None if no drawings qualify."""
    x_lo, x_hi = band_x_range(band, page_w, pad=0)
    union = None
    for d in drawings:
        r = d["rect"]
        if r.height < 1 or r.width < 1:          # degenerate
            continue
        if r.y1 < y_min or r.y0 > y_max:         # outside y window
            continue
        # Allow slight bleed across column boundary (e.g., border lines)
        if r.x1 < x_lo - 10 or r.x0 > x_hi + 10:
            continue
        union = r if union is None else union | r
    return union


# ── main extraction ───────────────────────────────────────────────────────────

def extract_figures(pdf_path: str, out_dir: str, dpi: int = 200, margin: int = 4):
    doc = fitz.open(pdf_path)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)

    figures_found = []

    for page_idx in range(len(doc)):
        page    = doc[page_idx]
        page_w  = page.rect.width
        page_h  = page.rect.height

        # Collect text blocks sorted top-to-bottom
        text_blocks = sorted(
            [b for b in page.get_text("blocks") if b[6] == 0],
            key=lambda b: b[1],
        )

        # All vector drawing paths on this page
        drawings = page.get_drawings()

        # Identify captions in top-to-bottom order
        captions = []
        for b in text_blocks:
            bx0, by0, bx1, by1, btext = b[:5]
            if is_caption_block(btext.strip()):
                captions.append({
                    "num":  caption_number(btext),
                    "x0":   bx0, "y0": by0,
                    "x1":   bx1, "y1": by1,
                    "band": col_band(bx0, bx1, page_w),
                })

        for ci, cap in enumerate(captions):
            fig_num = cap["num"]
            band    = cap["band"]
            cap_top = cap["y0"]
            cap_bot = cap["y1"]

            # Upper y boundary: bottom of the previous caption that could
            # share the same column (so we don't grab earlier figure's paths)
            y_search_top = 0.0
            for prev_cap in reversed(captions[:ci]):
                cols_overlap = (
                    prev_cap["band"] == band
                    or band == "full"
                    or prev_cap["band"] == "full"
                )
                if cols_overlap:
                    y_search_top = prev_cap["y1"]
                    break

            # --- Primary: use vector drawing bounding box ---
            draw_rect = drawing_bbox_in_band(
                drawings, band, page_w,
                y_min=y_search_top,
                y_max=cap_top,
            )

            # --- Fallback 1: raster images ---
            if draw_rect is None:
                x_lo, x_hi = band_x_range(band, page_w, pad=0)
                img_rects = []
                for img in page.get_images(full=True):
                    try:
                        ir = page.get_image_bbox(img)
                        if (ir.y1 <= cap_top and ir.y0 >= y_search_top
                                and ir.x1 >= x_lo - 10
                                and ir.x0 <= x_hi + 10):
                            img_rects.append(ir)
                    except Exception:
                        pass
                if img_rects:
                    draw_rect = img_rects[0]
                    for r in img_rects[1:]:
                        draw_rect = draw_rect | r

            # --- Fallback 2: fixed region above caption ---
            if draw_rect is None:
                x_lo, x_hi = band_x_range(band, page_w, pad=margin)
                draw_rect = fitz.Rect(
                    x_lo,
                    max(y_search_top, cap_top - 200),
                    x_hi,
                    cap_top,
                )

            # Build final crop rect: figure content + caption line
            x_lo, x_hi = band_x_range(band, page_w, pad=margin)
            fig_rect = fitz.Rect(
                min(x_lo, draw_rect.x0 - margin),
                draw_rect.y0 - margin,
                max(x_hi, draw_rect.x1 + margin),
                cap_bot + margin,
            )
            fig_rect = fig_rect & page.rect   # clamp to page bounds

            if fig_rect.height < 20 or fig_rect.width < 20:
                print(f"  [skip] Figure {fig_num} on page {page_idx+1}: "
                      f"region {fig_rect.height:.1f}×{fig_rect.width:.1f} pt too small")
                continue

            # Render
            scale = dpi / 72
            pix   = page.get_pixmap(matrix=fitz.Matrix(scale, scale),
                                    clip=fig_rect, alpha=False)

            fname = out / f"fig{fig_num.zfill(2)}_p{page_idx+1}.png"
            pix.save(str(fname))

            figures_found.append({
                "fig":  fig_num,
                "page": page_idx + 1,
                "band": band,
                "rect": tuple(round(v, 1) for v in fig_rect),
                "file": str(fname),
            })
            print(f"  Figure {fig_num}  page {page_idx+1}  [{band:5s}]  "
                  f"{fig_rect.width:.0f}×{fig_rect.height:.0f} pt  → {fname.name}")

    print(f"\nExtracted {len(figures_found)} figure(s) to '{out_dir}'")
    return figures_found


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(
        description="Extract figures from IEEE 2-column PDF papers."
    )
    ap.add_argument("pdf",       help="Input PDF file")
    ap.add_argument("--dpi",    type=int, default=200,
                    help="Render resolution in DPI (default: 200)")
    ap.add_argument("--out",    default="figures",
                    help="Output directory (default: figures/)")
    ap.add_argument("--margin", type=int, default=4,
                    help="Padding around figure in pt (default: 4)")
    args = ap.parse_args()

    if not Path(args.pdf).exists():
        print(f"Error: file not found: {args.pdf}", file=sys.stderr)
        sys.exit(1)

    print(f"Processing: {args.pdf}  ({args.dpi} DPI)")
    extract_figures(args.pdf, args.out, dpi=args.dpi, margin=args.margin)


if __name__ == "__main__":
    main()
