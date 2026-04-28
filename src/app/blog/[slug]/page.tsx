import { redirect } from "next/navigation";
import { getPosts } from "@/lib/content";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

type Params = Promise<{ slug: string }>;

export default async function BlogSlugRedirect({ params }: { params: Params }) {
  const { slug } = await params;
  redirect(`/articles/${slug}/`);
}


