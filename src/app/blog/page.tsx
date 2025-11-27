import Link from "next/link";
import { getPosts } from "@/lib/content";

export const metadata = { title: "Blog" };

export default function BlogIndexPage() {
  const posts = getPosts();
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Blog</h1>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.slug} className="rounded-lg border-(--border) border p-4">
            <h2 className="text-lg font-medium">
              <Link className="hover:underline" href={`/blog/${p.slug}`}>{p.title}</Link>
            </h2>
            <div className="text-sm text-(--muted-text)">{p.date}</div>
            {p.summary && <p className="text-sm text-(--muted-text)">{p.summary}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
