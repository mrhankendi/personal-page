// Simple content loaders using static JSON files for demo purposes
// In a real site, you may pull from CMS, Markdown, or a database

import publications from "@/data/publications.json";
import talks from "@/data/talks.json";
import teaching from "@/data/teaching.json";
import posts from "@/data/posts.json";
import profile from "@/data/profile.json";
import news from "@/data/news.json";
import experience from "@/data/experience.json";
import education from "@/data/education.json";
import summary from "@/data/summary.json";

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
  content?: string;
  paperPdf?: string; // link to the original paper PDF
  authors?: string;
  year?: number;
  venue?: string;
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

export type NewsItem = {
  icon: string;
  date: string;
  text: string;
};

export type SubRole = {
  title: string;
  startDate: string;
  endDate: string;
  duration: string;
  location?: string;
  description: string[];
};

export type SingleExperienceEntry = {
  type: "single";
  company: string;
  title: string;
  employment?: string;
  startDate: string;
  endDate: string;
  duration: string;
  location?: string;
  description: string[];
  logo: string;
};

export type GroupedExperienceEntry = {
  type: "grouped";
  company: string;
  totalDuration: string;
  logo: string;
  roles: SubRole[];
};

export type ExperienceEntry = SingleExperienceEntry | GroupedExperienceEntry;

export type EducationEntry = {
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  logo: string;
};

export const getProfile = (): Profile => profile as Profile;
export const getPublications = (): Publication[] => publications as Publication[];
export const getTalks = (): Talk[] => talks as Talk[];
export const getTeaching = (): Teaching[] => teaching as Teaching[];
export const getPosts = (): Post[] => posts as Post[];
export const getPostBySlug = (slug: string): Post | undefined =>
  (posts as Post[]).find((p) => p.slug === slug);
export const getNews = (): NewsItem[] => news as NewsItem[];
export type Summary = {
  tagline: string;
  paragraphs: string[];
};

export const getExperience = (): ExperienceEntry[] => experience as ExperienceEntry[];
export const getEducation = (): EducationEntry[] => education as EducationEntry[];
export const getSummary = (): Summary => summary as Summary;
