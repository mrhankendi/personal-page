import { getTalks } from "@/lib/content";

export const metadata = { title: "Talks" };

export default function TalksPage() {
  const talks = getTalks();
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Talks</h1>
      <ul className="space-y-4">
        {talks.map((t) => (
          <li key={t.id} className="rounded-lg border-(--border) border p-4">
            <h2 className="text-lg font-medium">{t.title}</h2>
            <div className="text-sm text-(--muted-text)">{t.event}</div>
            <div className="text-sm text-(--muted-text)">{t.date} · {t.location}</div>
            {t.link && (
              <a href={t.link} className="mt-3 inline-block text-sm hover:underline" target="_blank" rel="noreferrer">
                Event link →
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
