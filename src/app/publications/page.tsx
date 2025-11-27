import { getPublications } from "@/lib/content";

export const metadata = { title: "Publications" };

export default function PublicationsPage() {
  const pubs = getPublications();
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Publications</h1>
      <ul className="space-y-4">
        {pubs.map((p) => (
          <li key={p.id} className="rounded-lg border-(--border) border p-4">
            <div className="text-sm text-(--muted-text)">{p.year} {p.venue ? `· ${p.venue}` : ""}</div>
            <h2 className="text-lg font-medium">{p.title}</h2>
            <div className="text-sm text-(--muted-text)">{p.authors}</div>
            {p.tags && (
              <div className="mt-2 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full border-(--border) border px-2 py-0.5 text-xs">{t}</span>
                ))}
              </div>
            )}
            {p.link && (
              <a href={p.link} className="mt-3 inline-block text-sm hover:underline" target="_blank" rel="noreferrer">
                View paper →
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
