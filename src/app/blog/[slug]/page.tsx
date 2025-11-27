import { getPostBySlug, getPosts } from "@/lib/content";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return { title: post ? post.title : "Post" };
}

export default async function PostPage({ params }: Readonly<{ params: Params }>) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return notFound();
  return (
    <article className="prose max-w-none">
      <h1 className="mb-2 text-3xl font-semibold leading-tight">{post.title}</h1>
      <div className="mb-6 text-sm text-(--muted-text)">{post.date}</div>
      {/* Simple content rendering; you can swap in MDX later */}
      <div className="whitespace-pre-line text-(--text)">{post.content}</div>
    </article>
  );
}
