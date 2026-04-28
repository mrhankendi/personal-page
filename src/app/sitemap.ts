import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.hankendi.com';
  const now = new Date().toISOString().split('T')[0];

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/cv/`, lastModified: now },
    { url: `${base}/publications/`, lastModified: now },
    { url: `${base}/talks/`, lastModified: now },
    { url: `${base}/teaching/`, lastModified: now },
    { url: `${base}/articles/`, lastModified: now },
  ];

  const posts = getPosts().map((p) => ({
    url: `${base}/articles/${p.slug}/`,
    lastModified: p.date ?? now,
  }));

  return [...staticPages, ...posts];
}
