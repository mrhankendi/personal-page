import { getEducation } from "@/lib/content";
import CollapsibleDetails from "@/components/CollapsibleDetails";

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

export default function EducationList() {
  const entries = getEducation();

  return (
    <CollapsibleDetails className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <h2 className="m-0 text-(--text)">Education</h2>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--surface) transition-colors hover:border-(--border-strong) hover:bg-(--surface-muted)">
          <DisclosureIcon />
        </span>
      </summary>
      <div className="mt-5 divide-y divide-(--border)">
        {entries.map((entry) => (
          <div key={entry.school} className="flex gap-4 py-5 first:pt-0 last:pb-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--border) bg-(--surface-raised) shadow-sm">
              <img src={entry.logo} alt={`${entry.school} logo`} className="h-10 w-10 object-contain" />
            </div>
            <div>
              <p className="font-semibold text-(--text)">{entry.school}</p>
              <p className="text-sm text-(--muted-text)">
                {entry.degree}, {entry.field}
              </p>
              <p className="text-xs text-(--muted-text)">
                {entry.startYear} - {entry.endYear}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleDetails>
  );
}
