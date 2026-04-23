// Simple content loaders using static JSON files for demo purposes
// In a real site, you may pull from CMS, Markdown, or a database

import publications from "@/data/publications.json";
import talks from "@/data/talks.json";
import teaching from "@/data/teaching.json";
import posts from "@/data/posts.json";
import profile from "@/data/profile.json";

export type Publication = {
  id: string;
  title: string;
  authors: string;
  venue?: string;
  year?: number;
  link?: string;
  pdf?: string;
  preprint?: string;
  doi?: string;
  code?: string;
  type?: "journal" | "conference" | "workshop" | "dissertation" | "patent";
  summary?: string;
  selected?: boolean;
  tags?: string[];
};

export type Talk = {
  id: string;
  title: string;
  event?: string;
  date?: string;
  location?: string;
  link?: string;
};

export type Teaching = {
  term: string;
  course: string;
  role?: string;
  link?: string;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  content?: string; // simple markdown/plaintext
};

export type Profile = {
  name: string;
  title?: string;
  email?: string;
  location?: string;
  bio?: string;
  bioEmphasis?: string;
  researchSummary?: string;
  researchInterests?: string[];
  links?: {
    cv?: string;
    googleScholar?: string;
    orcid?: string;
    dblp?: string;
    semanticScholar?: string;
  };
  social?: Record<string, string>;
};

export const getProfile = (): Profile => profile as Profile;
export const getPublications = (): Publication[] => publications as Publication[];
export const getTalks = (): Talk[] => talks as Talk[];
export const getTeaching = (): Teaching[] => teaching as Teaching[];
export const getPosts = (): Post[] => posts as Post[];
export const getPostBySlug = (slug: string): Post | undefined =>
  (posts as Post[]).find((p) => p.slug === slug);
