import Link from "next/link";
import { getPosts } from "@/lib/content";

export const metadata = {
  title: "Articles",
  description: "Deep dives into computer architecture, sustainable computing, and systems research — written by Can Hankendi.",
  openGraph: {
    title: "Articles | Can Hankendi",
    description: "Deep dives into computer architecture, sustainable computing, and systems research — written by Can Hankendi.",
    url: "https://www.hankendi.com/articles/",
    type: "website",
  },
};

export default function ArticlesIndexPage() {
  const posts = getPosts();
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Articles</h1>
        <p className="mt-2 text-sm text-(--muted-text)">
          Long-form write-ups on computer architecture, power &amp; thermal management, and sustainable AI infrastructure.
        </p>
      </div>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.slug} className="rounded-lg border-(--border) border p-4">
            <h2 className="text-lg font-medium">
              <Link className="hover:underline" href={`/articles/${p.slug}`}>{p.title}</Link>
            </h2>
            <div className="text-sm text-(--muted-text)">{p.date}</div>
            {p.summary && <p className="text-sm text-(--muted-text)">{p.summary}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
