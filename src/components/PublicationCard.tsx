"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import type { Publication } from "@/lib/content";

type PublicationCardProps = {
  publication: Publication;
  highlightAuthor?: string;
};

const typeLabel: Record<NonNullable<Publication["type"]>, string> = {
  journal: "Journal",
  conference: "Conference",
  workshop: "Workshop",
  dissertation: "Dissertation",
  patent: "Patent",
};

// Left-only accent border — the canonical research-site pattern
const typeBorderClasses: Record<NonNullable<Publication["type"]>, string> = {
  journal: "border-l-emerald-500/90 dark:border-l-emerald-400/80",
  conference: "border-l-cyan-500/90 dark:border-l-cyan-400/80",
  workshop: "border-l-amber-500/90 dark:border-l-amber-400/80",
  dissertation: "border-l-fuchsia-500/90 dark:border-l-fuchsia-400/80",
  patent: "border-l-rose-500/90 dark:border-l-rose-400/80",
};

// Light mode: outline only. Dark mode: subtle dark tinted fill.
const typeBadgeClasses: Record<NonNullable<Publication["type"]>, string> = {
  journal:
    "bg-transparent! text-emerald-700 border-emerald-400/70 dark:bg-emerald-950/40! dark:text-emerald-300 dark:border-emerald-700/50",
  conference:
    "bg-transparent! text-cyan-700 border-cyan-400/70 dark:bg-cyan-950/40! dark:text-cyan-300 dark:border-cyan-700/50",
  workshop:
    "bg-transparent! text-amber-700 border-amber-400/70 dark:bg-amber-950/40! dark:text-amber-300 dark:border-amber-700/50",
  dissertation:
    "bg-transparent! text-fuchsia-700 border-fuchsia-400/70 dark:bg-fuchsia-950/40! dark:text-fuchsia-300 dark:border-fuchsia-700/50",
  patent:
    "bg-transparent! text-rose-700 border-rose-400/70 dark:bg-rose-950/40! dark:text-rose-300 dark:border-rose-700/50",
};

function formatAuthors(authors: string, highlightName?: string): ReactNode {
  const list = authors.split(",").map((a) => a.trim()).filter(Boolean);
  const display = list.length > 4 ? [...list.slice(0, 4), "et al."] : list;

  if (!highlightName) return display.join(", ");

  const lowerHighlight = highlightName.toLowerCase();
  return (
    <>
      {display.map((author, i) => {
        const isMe = author.toLowerCase().includes(lowerHighlight);
        return (
          <span key={author}>
            {isMe ? (
              <strong className="font-semibold text-(--text)">{author}</strong>
            ) : (
              author
            )}
            {i < display.length - 1 && ", "}
          </span>
        );
      })}
    </>
  );
}

function getBibtexEntryType(type: Publication["type"]): string {
  if (type === "journal") return "article";
  if (type === "conference" || type === "workshop") return "inproceedings";
  if (type === "dissertation") return "phdthesis";
  return "misc";
}

function getBibtexVenueField(type: Publication["type"]): string {
  if (type === "journal") return "journal";
  if (type === "dissertation") return "school";
  return "booktitle";
}

function buildBibtex(publication: Publication) {
  const authors = publication.authors
    .split(",")
    .map((author) => author.trim())
    .filter(Boolean)
    .join(" and ");
  const year = publication.year ?? "n.d.";
  const keyRoot = `${publication.authors.split(",")[0]?.trim().split(" ").at(-1)?.toLowerCase() ?? "paper"}${publication.year ?? ""}${publication.title
    .split(/\s+/)[0]
    ?.replaceAll(/[^a-z0-9]/gi, "")
    .toLowerCase()}`;
  const entryType = getBibtexEntryType(publication.type);
  const venueField = getBibtexVenueField(publication.type);

  return `@${entryType}{${keyRoot},
  title = {${publication.title}},
  author = {${authors}},
  year = {${year}},
  ${publication.venue ? `${venueField} = {${publication.venue}},` : ""}
}`;
}

function PrimaryActionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-1 rounded-full border border-(--border) px-2.5 py-1.5 text-xs font-medium text-(--text) transition-all hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--surface-muted) sm:px-3 sm:py-2"
    >
      {children}
    </a>
  );
}

function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center rounded-full border border-(--border) px-2.5 py-1.5 text-xs font-medium text-(--text) transition-all hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--surface-muted) sm:px-3 sm:py-2"
    >
      {children}
    </a>
  );
}

function ActionButton({
  onClick,
  expanded,
  controls,
  children,
}: {
  onClick: () => void;
  expanded: boolean;
  controls: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={controls}
      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-(--border) px-2.5 py-1.5 text-xs font-medium text-(--text) transition-all hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--surface-muted) sm:px-3 sm:py-2"
    >
      {children}
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        className={`h-3 w-3 opacity-50 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        aria-hidden
      >
        <path d="M8 10.94L2.53 5.47l1.06-1.06L8 8.82l4.41-4.41 1.06 1.06z" />
      </svg>
    </button>
  );
}

export default function PublicationCard({ publication, highlightAuthor }: Readonly<PublicationCardProps>) {
  const [showBibtex, setShowBibtex] = useState(false);
  const bibtexId = useId();

  const borderClass = publication.type
    ? typeBorderClasses[publication.type]
    : "border-l-(--border)";

  function toggleBibtex() {
    setShowBibtex((v) => !v);
  }

  return (
    <article
      id={publication.id}
      className={`group rounded-2xl border border-(--border) border-l-4 bg-(--surface-raised) p-3 shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition-all hover:shadow-[0_16px_36px_rgba(15,23,42,0.07)] sm:rounded-[1.6rem] sm:p-5 ${borderClass}`}
    >
      <div className="space-y-2 sm:space-y-2.5">
        {/* Type badge + year */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          {publication.type ? (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest ${typeBadgeClasses[publication.type]}`}
            >
              {typeLabel[publication.type]}
            </span>
          ) : null}
          {publication.year ? (
            <span className="text-xs font-medium text-(--muted-text) sm:text-sm">{publication.year}</span>
          ) : null}
        </div>

        {/* Title, venue, authors — venue sits between title and authors for prominence */}
        <div className="space-y-1">
          <h3 className="max-w-4xl text-[0.9rem]! leading-snug! font-semibold text-(--text) sm:text-[1rem]!">
            {publication.pdf ? (
              <a href={publication.pdf} target="_blank" rel="noreferrer" className="text-(--text)! hover:underline decoration-1 underline-offset-2">
                {publication.title}
              </a>
            ) : publication.title}
          </h3>
          {publication.venue ? (
            <p className="text-xs font-medium text-(--muted-text) sm:text-sm">{publication.venue}</p>
          ) : null}
          <p className="text-xs leading-5 text-(--muted-text) sm:text-sm sm:leading-6">
            {formatAuthors(publication.authors, highlightAuthor)}
          </p>
        </div>

        {/* Tags — smaller, borderless pills to reduce visual noise */}
        {publication.tags?.length ? (
          <ul className="hidden flex-wrap gap-1 sm:flex" aria-label="Publication topics">
            {publication.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-(--border) bg-(--surface-muted) px-2 py-px text-[0.7rem] text-(--muted-text)"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {/* Action row */}
        <div className="flex flex-wrap gap-1.5 pt-0.5 sm:gap-2">
          {publication.pdf ? (
            <PrimaryActionLink href={publication.pdf}><span className="text-red-600 dark:text-red-400">PDF</span></PrimaryActionLink>
          ) : null}
          {publication.preprint ? (
            <PrimaryActionLink href={publication.preprint}>Preprint</PrimaryActionLink>
          ) : null}
          {publication.doi ? <ActionLink href={publication.doi}>DOI</ActionLink> : null}
          {publication.code ? <ActionLink href={publication.code}>Code</ActionLink> : null}
          {publication.summary ? (
            <details className="contents group/abstract">
              <summary className="inline-flex cursor-pointer list-none items-center justify-center gap-1.5 rounded-full border border-(--border) px-2.5 py-1.5 text-xs font-medium text-(--text) transition-all hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--surface-muted) sm:px-3 sm:py-2 [&::-webkit-details-marker]:hidden">
                Abstract
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3 w-3 opacity-50 transition-transform duration-200 group-open/abstract:rotate-180"
                  aria-hidden
                >
                  <path d="M8 10.94L2.53 5.47l1.06-1.06L8 8.82l4.41-4.41 1.06 1.06z" />
                </svg>
              </summary>
              <p className="basis-full rounded-2xl border border-(--border) bg-(--surface-muted) px-3 py-2.5 text-xs leading-5 text-(--muted-text) sm:px-4 sm:py-3 sm:text-sm sm:leading-6">
                {publication.summary}
              </p>
            </details>
          ) : null}
          <ActionButton onClick={toggleBibtex} expanded={showBibtex} controls={bibtexId}>
            BibTeX
          </ActionButton>
        </div>

        {showBibtex ? (
          <pre
            id={bibtexId}
            className="overflow-x-auto rounded-2xl border border-(--border) bg-(--surface-muted) px-3 py-2.5 font-mono text-[0.68rem] leading-5 text-(--muted-text) sm:px-4 sm:py-3 sm:text-xs sm:leading-6"
          >
            {buildBibtex(publication)}
          </pre>
        ) : null}
      </div>
    </article>
  );
}
