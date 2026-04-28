import { getPostBySlug, getPosts } from "@/lib/content";
import { notFound } from "next/navigation";
import PostMarkdown from "@/components/PostMarkdown";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post" };

  const url = `https://www.hankendi.com/articles/${slug}/`;
  const authors = post.authors
    ? post.authors.split(",").map((a) => a.trim())
    : ["Can Hankendi"];

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      url,
      publishedTime: post.date,
      authors,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
    alternates: { canonical: url },
  };
}

function AuthorList({ authors }: Readonly<{ authors: string }>) {
  const names = authors.split(",").map((a) => a.trim());
  return (
    <>
      {names.map((name, i) => (
        <span key={name}>
          {i > 0 && <span className="text-(--border-strong)">, </span>}
          <span
            className={
              name === "Can Hankendi"
                ? "font-semibold text-(--text)"
                : "text-(--muted-text)"
            }
          >
            {name}
          </span>
        </span>
      ))}
    </>
  );
}

export default async function ArticlePage({ params }: Readonly<{ params: Params }>) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return notFound();
  return (
    <article className="mx-auto max-w-2xl">
      {/* Header panel */}
      <div className="mb-8 rounded-2xl border border-(--border) bg-(--surface-raised) p-5 shadow-[0_4px_20px_rgba(15,23,42,0.06)] sm:p-6">
        <h1 className="mb-4 text-2xl font-semibold leading-snug text-(--text) sm:text-3xl">
          {post.title}
        </h1>

        {post.authors && (
          <p className="mb-3 text-sm">
            <AuthorList authors={post.authors} />
          </p>
        )}

        {(post.venue || post.year) && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            {post.year && (
              <span className="inline-flex rounded-full border border-(--border) px-2 py-0.5 font-medium text-(--muted-text)">
                {post.year}
              </span>
            )}
            {post.venue && (
              <span className="text-cyan-700 dark:text-cyan-400">
                {post.venue.replace(/^\d{4}\s+/, "")}
              </span>
            )}
          </div>
        )}

        {post.paperPdf && (
          <div className="border-t border-(--border) pt-4">
            <a
              href={post.paperPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-(--border) px-3 py-1.5 text-xs font-medium text-(--text) transition-all hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--surface-muted)"
            >
              <span className="text-red-600 dark:text-red-400">PDF</span>{" "}
              Read Paper
            </a>
          </div>
        )}
      </div>

      {post.content ? (
        <PostMarkdown content={post.content} />
      ) : (
        <p className="text-(--muted-text)">No content available.</p>
      )}
    </article>
  );
}
