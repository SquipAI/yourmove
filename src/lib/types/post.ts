import type { SanityImageSource } from "@sanity/image-url";
import type { FaqItem } from "./faq";
import type { AlternateSlug } from "./tool";

export type PostMainImage = SanityImageSource;

export type PostCard = {
  _id: string;
  title: string;
  summary: string;
  slug: string;
  mainImage: PostMainImage;
  readingTime: number;
  createdAt: string;
  tags: { slug: string; title: string }[];
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
  readingTime: number;
  mainImage: PostMainImage;
  body: unknown[] | null;
  faq: FaqItem[] | null;
  tagIds: string[];
  tags: { slug: string; title: string }[];
  alternates: AlternateSlug[] | null;
};
