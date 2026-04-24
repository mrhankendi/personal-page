import { Fragment } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { getPublications, getNews, getSummary } from "@/lib/content";
import NewsSection from "@/components/NewsSection";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import EducationList from "@/components/EducationList";

function renderWithBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

const pubTypeBadge: Record<string, string> = {
  journal:
    "text-emerald-700 border-emerald-400/70 dark:text-emerald-300 dark:border-emerald-700/50",
  conference:
    "text-cyan-700 border-cyan-400/70 dark:text-cyan-300 dark:border-cyan-700/50",
  workshop:
    "text-amber-700 border-amber-400/70 dark:text-amber-300 dark:border-amber-700/50",
  patent:
    "text-rose-700 border-rose-400/70 dark:text-rose-300 dark:border-rose-700/50",
  dissertation:
    "text-fuchsia-700 border-fuchsia-400/70 dark:text-fuchsia-300 dark:border-fuchsia-700/50",
};

const pubTypeLabel: Record<string, string> = {
  journal: "Journal",
  conference: "Conference",
  workshop: "Workshop",
  patent: "Patent",
  dissertation: "Dissertation",
};

function SectionPanel({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <section className="rounded-2xl border border-(--border) bg-(--surface-raised) p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-6">
      {children}
    </section>
  );
}

function DisclosureIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-4 w-4 text-(--muted-text) transition-transform group-open:rotate-180"
      aria-hidden
    >
      <path d="M8 10.94 2.53 5.47l1.06-1.06L8 8.82l4.41-4.41 1.06 1.06L8 10.94Z" />
    </svg>
  );
}

function CollapsiblePanel({
  title,
  children,
  action,
}: Readonly<{
  title: string;
  children: ReactNode;
  action?: ReactNode;
}>) {
  return (
    <details
      className="group rounded-2xl border border-(--border) bg-(--surface-raised) p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-6"
      open
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <h2 className="m-0 text-(--text)">{title}</h2>
        <span className="flex items-center gap-3">
          {action}
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--surface) transition-colors hover:border-(--border-strong) hover:bg-(--surface-muted)">
            <DisclosureIcon />
          </span>
        </span>
      </summary>
      <div className="mt-4 sm:mt-5">{children}</div>
    </details>
  );
}

function PubAction({
  href,
  children,
  primary = false,
}: Readonly<{
  href?: string;
  children: ReactNode;
  primary?: boolean;
}>) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-h-9 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--surface-muted) ${
        primary
          ? "border-red-300 text-red-700 dark:border-red-900/80 dark:text-red-300"
          : "border-(--border) text-(--text)"
      }`}
    >
      {children}
    </a>
  );
}

export default function Home() {
  const { tagline, paragraphs } = getSummary();
  const newsItems = getNews();
  const recentPubs = getPublications()
    .filter((p) => p.type && p.type !== "patent" && p.type !== "dissertation")
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .slice(0, 3);

  return (
    <div className="space-y-3 sm:space-y-6">
      <CollapsiblePanel title="Summary">
        <div className="prose prose-lg max-w-none dark:prose-invert [--tw-prose-body:var(--text)] [--tw-prose-headings:var(--text)] [--tw-prose-links:var(--link)] [--tw-prose-bold:var(--text)] [--tw-prose-quotes:var(--muted-text)] [&>p]:mb-6">
          <p className="not-prose mt-1 mb-6 italic text-(--muted-text)" style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
            {tagline}
          </p>
          {paragraphs.map((p) => (
            <p key={p.slice(0, 40)}>{renderWithBold(p)}</p>
          ))}
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="News">
        <NewsSection items={newsItems} showTitle={false} />
      </CollapsiblePanel>

      <CollapsiblePanel
        title="Recent Publications"
        action={
          <Link href="/publications" className="shrink-0 text-sm font-semibold text-(--link) hover:underline">
            View all →
          </Link>
        }
      >
        <ul className="space-y-3 sm:space-y-4">
          {recentPubs.map((pub) => (
            <li
              key={pub.id}
              className="rounded-xl border border-(--border) border-l-4 border-l-(--accent) bg-(--surface) p-3 transition-all hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--surface-muted) sm:p-4"
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                {pub.type ? (
                  <span
                    className={`rounded-full border bg-transparent px-2 py-px text-[0.65rem] font-semibold uppercase tracking-widest ${pubTypeBadge[pub.type] ?? ""}`}
                  >
                    {pubTypeLabel[pub.type] ?? pub.type}
                  </span>
                ) : null}
                {pub.venue ? (
                  <span className="text-xs text-(--muted-text) sm:text-sm">{pub.venue}</span>
                ) : null}
                {pub.year ? (
                  <span className="text-xs font-medium text-(--muted-text) sm:text-sm">{pub.year}</span>
                ) : null}
              </div>
              <h3 className="max-w-3xl text-[0.92rem]! leading-snug! font-semibold text-(--text) sm:text-[1rem]!">
                <Link
                  href={`/publications#${pub.id}`}
                  className="text-(--text)! decoration-1 underline-offset-2 hover:text-(--link)! hover:underline"
                >
                  {pub.title}
                </Link>
              </h3>
              <p className="mt-1 text-xs leading-5 text-(--muted-text) sm:text-sm">
                {pub.authors}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <PubAction href={pub.pdf} primary>
                  PDF
                </PubAction>
                <PubAction href={pub.doi}>DOI</PubAction>
                <Link
                  href={`/publications#${pub.id}`}
                  className="inline-flex min-h-9 items-center justify-center rounded-full border border-(--border) px-3 py-1.5 text-xs font-semibold text-(--text) transition-all hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--surface-muted)"
                >
                  BibTeX
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </CollapsiblePanel>

      <SectionPanel>
        <ExperienceTimeline />
      </SectionPanel>

      <SectionPanel>
        <EducationList />
      </SectionPanel>
    </div>
  );
}
