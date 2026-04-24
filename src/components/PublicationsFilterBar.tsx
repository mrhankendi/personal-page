"use client";

import { useState } from "react";

type PublicationsFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
  publicationType: string;
  onPublicationTypeChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  yearOptions: string[];
  typeOptions: Array<{ value: string; label: string }>;
  resultCount: number;
};

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-(--muted-text)">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-2.5 text-sm text-(--text) sm:py-3"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function PublicationsFilterBar({
  search,
  onSearchChange,
  year,
  onYearChange,
  publicationType,
  onPublicationTypeChange,
  sort,
  onSortChange,
  yearOptions,
  typeOptions,
  resultCount,
}: PublicationsFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      className="space-y-3 sm:space-y-4 sm:rounded-[1.75rem] sm:border sm:border-(--border-soft) sm:bg-(--surface-raised) sm:p-6 sm:shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
      aria-label="Publication filters"
    >
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-(--muted-text)">
          {resultCount} papers
        </p>
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--border) text-(--muted-text) transition-colors hover:border-(--border-strong) hover:bg-(--surface-muted) hover:text-(--text)"
        >
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path d="M8 10.94L2.53 5.47l1.06-1.06L8 8.82l4.41-4.41 1.06 1.06z" />
          </svg>
          <span className="sr-only">Toggle filters</span>
        </button>
      </div>

      <div className={`${isExpanded ? "block" : "hidden"} space-y-3 sm:block sm:space-y-4`}>
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-(--muted-text)">
            Search
          </span>
          <div className="relative">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-text)"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Title, author, keyword..."
              className="w-full rounded-2xl border border-(--border) bg-(--surface) py-2.5 pl-11 pr-4 text-sm text-(--text) placeholder:text-(--muted-text) focus:outline-none focus:ring-2 focus:ring-(--border-strong) sm:py-3"
            />
          </div>
        </label>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <FilterSelect
            label="Year"
            value={year}
            onChange={onYearChange}
            options={[
              { value: "all", label: "All years" },
              ...yearOptions.map((option) => ({ value: option, label: option })),
            ]}
          />
          <FilterSelect
            label="Publication Type"
            value={publicationType}
            onChange={onPublicationTypeChange}
            options={[{ value: "all", label: "All types" }, ...typeOptions]}
          />
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={onSortChange}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
            ]}
          />
        </div>

        <div className="hidden justify-end sm:flex">
          <p className="text-sm text-(--muted-text)">{resultCount} matching publications</p>
        </div>
      </div>
    </section>
  );
}
