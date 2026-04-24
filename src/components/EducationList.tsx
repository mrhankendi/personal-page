import { getEducation } from "@/lib/content";

export default function EducationList() {
  const entries = getEducation();

  return (
    <section>
      <h2 className="mb-5 text-(--text)">Education</h2>
      <div className="divide-y divide-(--border)">
        {entries.map((entry) => (
          <div key={entry.school} className="flex gap-4 py-5 first:pt-0 last:pb-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--border) bg-(--surface-raised) shadow-sm">
              <img src={entry.logo} alt={`${entry.school} logo`} className="h-10 w-10 object-contain" />
            </div>
            <div>
              <p className="font-semibold text-(--text)">{entry.school}</p>
              <p className="text-sm text-(--muted-text)">{entry.degree}, {entry.field}</p>
              <p className="text-xs text-(--muted-text)">{entry.startYear} – {entry.endYear}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
