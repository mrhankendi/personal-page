import { getTeaching } from "@/lib/content";

export const metadata = { title: "Teaching" };

export default function TeachingPage() {
  const items = getTeaching();
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Teaching</h1>
      <ul className="space-y-4">
        {items.map((c) => (
          <li key={`${c.term}-${c.course}`} className="rounded-lg border-(--border) border p-4">
            <div className="text-sm text-(--muted-text)">{c.term}</div>
            <h2 className="text-lg font-medium">{c.course}</h2>
            {c.role && <div className="text-sm text-(--muted-text)">{c.role}</div>}
            {c.link && (
              <a href={c.link} className="mt-3 inline-block text-sm hover:underline" target="_blank" rel="noreferrer">
                Course page →
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
