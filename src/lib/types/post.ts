import type { FaqItem } from "./faq";
import type { AlternateSlug } from "./tool";

export type PostCard = {
  _id: string;
  title: string;
  summary: string;
  slug: string;
  mainImage: { url: string; alt: string | null } | null;
  readingTime: number | null;
  createdAt: string;
  tags: { slug: string; title: string }[] | null;
};

export type Post = {
  _id: string;
  title: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  language: string | null;
  createdAt: string;
  _updatedAt: string;
  readingTime: number | null;
  mainImage: { url: string; alt: string | null } | null;
  body: unknown[] | null;
  faq: FaqItem[] | null;
  tagIds: string[];
  tags: { slug: string; title: string }[] | null;
  alternates: AlternateSlug[] | null;
};
