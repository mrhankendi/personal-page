import type { Metadata } from "next";
import PublicationsExplorer from "@/components/PublicationsExplorer";
import { getProfile, getPublications } from "@/lib/content";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Publications by Can Hankendi on sustainable computing, AI infrastructure, data centers, energy-aware systems, power management, and carbon-aware computing.",
  alternates: {
    canonical: "/publications/",
  },
  openGraph: {
    title: "Publications | Can Hankendi",
    description:
      "Research publications by Can Hankendi on sustainable computing, AI infrastructure, data centers, and energy-aware systems.",
    url: "/publications/",
    type: "profile",
  },
};

function publicationJsonLd(publications: ReturnType<typeof getPublications>, authorName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Publications | Can Hankendi",
    url: "https://www.hankendi.com/publications/",
    author: {
      "@type": "Person",
      name: authorName,
      url: "https://www.hankendi.com/",
    },
    hasPart: {
      "@type": "ItemList",
      itemListElement: publications.map((publication, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": publication.type === "patent" ? "CreativeWork" : "ScholarlyArticle",
          name: publication.title,
          author: publication.authors.split(",").map((author) => ({
            "@type": "Person",
            name: author.trim(),
          })),
          datePublished: publication.year?.toString(),
          isPartOf: publication.venue
            ? {
                "@type": "Periodical",
                name: publication.venue,
              }
            : undefined,
          abstract: publication.summary,
          keywords: publication.tags?.join(", "),
          url: publication.pdf
            ? new URL(publication.pdf, "https://www.hankendi.com").toString()
            : "https://www.hankendi.com/publications/",
        },
      })),
    },
  };
}

export default function PublicationsPage() {
  const publications = getPublications();
  const profile = getProfile();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(publicationJsonLd(publications, profile.name)),
        }}
      />
      <PublicationsExplorer publications={publications} profile={profile} />
    </>
  );
}
