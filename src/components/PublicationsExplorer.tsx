"use client";

import { useMemo, useState } from "react";
import type { Profile, Publication } from "@/lib/content";
import PublicationCard from "@/components/PublicationCard";
import PublicationsFilterBar from "@/components/PublicationsFilterBar";

type PublicationsExplorerProps = {
  publications: Publication[];
  profile: Profile;
};

const typeLabelMap: Record<string, string> = {
  journal: "Journal",
  conference: "Conference",
  workshop: "Workshop",
  dissertation: "Dissertation",
  patent: "Patent",
};

export default function PublicationsExplorer({
  publications,
  profile,
}: PublicationsExplorerProps) {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [publicationType, setPublicationType] = useState("all");
  const [sort, setSort] = useState("newest");

  const yearOptions = useMemo(
    () =>
      Array.from(
        new Set(publications.map((publication) => `${publication.year ?? ""}`).filter(Boolean)),
      ).sort((left, right) => Number(right) - Number(left)),
    [publications],
  );

  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          publications
            .map((publication) => publication.type)
            .filter((value): value is NonNullable<Publication["type"]> => Boolean(value)),
        ),
      ).map((value) => ({
        value,
        label: typeLabelMap[value] ?? value,
      })),
    [publications],
  );

  const filteredPublications = useMemo(() => {
    const q = search.toLowerCase().trim();
    return publications.filter((publication) => {
      const matchesYear = year === "all" || `${publication.year ?? ""}` === year;
      const matchesType = publicationType === "all" || publication.type === publicationType;
      const matchesSearch =
        !q ||
        [publication.title, publication.authors, publication.venue ?? "", publication.summary ?? "", ...(publication.tags ?? [])].some(
          (field) => field.toLowerCase().includes(q),
        );
      return matchesYear && matchesType && matchesSearch;
    });
  }, [publicationType, publications, search, year]);

  const sortedPublications = useMemo(() => {
    return [...filteredPublications].sort((left, right) => {
      if (sort === "oldest") {
        return (left.year ?? 0) - (right.year ?? 0);
      }

      return (right.year ?? 0) - (left.year ?? 0);
    });
  }, [filteredPublications, sort]);

  // Preserve sorted order while grouping by year for the archive view
  const yearGroups = useMemo(() => {
    const groups = new Map<string, Publication[]>();
    for (const pub of sortedPublications) {
      const key = pub.year?.toString() ?? "n.d.";
      const existing = groups.get(key);
      if (existing) {
        existing.push(pub);
      } else {
        groups.set(key, [pub]);
      }
    }
    return groups;
  }, [sortedPublications]);

  return (
    <div className="space-y-5 sm:space-y-8 lg:space-y-10">
      <div className="space-y-2 sm:space-y-4">
        <h1 className="text-2xl font-semibold text-(--text) sm:text-4xl">Publications</h1>
        <p className="hidden max-w-3xl text-base leading-7 text-(--muted-text) sm:block">
          {profile.researchSummary ??
            "Research spanning sustainable computing, AI infrastructure, and energy-aware systems design."}
        </p>
      </div>

      <PublicationsFilterBar
        search={search}
        onSearchChange={setSearch}
        year={year}
        onYearChange={setYear}
        publicationType={publicationType}
        onPublicationTypeChange={setPublicationType}
        sort={sort}
        onSortChange={setSort}
        yearOptions={yearOptions}
        typeOptions={typeOptions}
        resultCount={sortedPublications.length}
      />

      <section className="space-y-4 sm:space-y-5" aria-labelledby="full-publications-heading">
        <h2 id="full-publications-heading" className="sr-only">
          Publication list
        </h2>
        {sortedPublications.length ? (
          <div className="space-y-4 sm:space-y-6">
            {Array.from(yearGroups.entries()).map(([groupYear, pubs]) => (
              <div key={groupYear} className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="shrink-0 text-xs font-semibold text-(--muted-text) sm:text-sm">
                    {groupYear}
                  </span>
                  <div className="h-px flex-1 bg-(--border)" />
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  {pubs.map((publication) => (
                    <PublicationCard
                      key={publication.id}
                      publication={publication}
                      highlightAuthor={profile.name}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-(--border) px-5 py-6 text-sm text-(--muted-text)">
            No publications match the current search and filter combination.
          </p>
        )}
      </section>
    </div>
  );
}
