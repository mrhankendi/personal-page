import { getProfile, type Profile } from "@/lib/content";

export const metadata = { title: "CV" };

export default function CVPage() {
  const p: Profile = getProfile();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Curriculum Vitae</h1>
      <p className="text-(--muted-text)">{p.title}</p>
      <div className="rounded-lg border-(--border) border p-4">
        <h2 className="mb-2 text-lg font-medium">About</h2>
        <p className="text-sm text-(--text)">{p.bio}</p>
      </div>
      <div className="rounded-lg border-(--border) border p-4">
        <h2 className="mb-2 text-lg font-medium">Contact</h2>
        <ul className="text-sm text-(--text)">
          <li>Email: <a className="text-blue-600 hover:underline" href={`mailto:${p.email}`}>{p.email}</a></li>
          <li>Location: {p.location}</li>
        </ul>
      </div>
      <button className="inline-block rounded-md border-(--border) border px-3 py-1.5 text-sm hover:bg-(--surface-muted)">
        Download PDF (placeholder)
      </button>
    </section>
  );
}
