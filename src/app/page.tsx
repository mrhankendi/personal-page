import { Fragment } from "react";
import Link from "next/link";
import { getPublications, getNews, getSummary } from "@/lib/content";
import NewsSection from "@/components/NewsSection";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import EducationList from "@/components/EducationList";

function renderWithBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>
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

export default function Home() {
  const { tagline, paragraphs } = getSummary();
  const newsItems = getNews();
  const recentPubs = getPublications()
    .filter((p) => p.type && p.type !== "patent" && p.type !== "dissertation")
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .slice(0, 3);

  return (
    <section className="space-y-10">

      {/* Summary */}
      <div className="prose prose-lg max-w-none dark:prose-invert [--tw-prose-body:var(--text)] [--tw-prose-headings:var(--text)] [--tw-prose-links:var(--link)] [--tw-prose-bold:var(--text)] [--tw-prose-quotes:var(--muted-text)] [&>p]:mb-6">
        <h2>Summary</h2>
        <p className="not-prose mt-1 mb-6 italic text-(--muted-text)" style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
          {tagline}
        </p>
        {paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{renderWithBold(p)}</p>
        ))}
      </div>

      {/* News */}
      <NewsSection items={newsItems} />

      {/* Recent Publications */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="m-0 text-(--text)">Recent Publications</h2>
          <Link href="/publications" className="shrink-0 text-sm text-(--link) hover:underline">
            View all →
          </Link>
        </div>
        <ul className="space-y-5">
          {recentPubs.map((pub) => (
            <li
              key={pub.id}
              className="border-l-2 border-(--border) pl-4 transition-colors hover:border-(--accent)/50"
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
              <h3 className="text-[0.9rem]! leading-snug! font-semibold text-(--text) sm:text-[1rem]!">
                <Link
                  href={`/publications#${pub.id}`}
                  className="text-(--text)! decoration-1 underline-offset-2 hover:text-(--link)! hover:underline"
                >
                  {pub.title}
                </Link>
              </h3>
            </li>
          ))}
        </ul>
      </section>

      <ExperienceTimeline />

      <EducationList />

    </section>
  );
}
