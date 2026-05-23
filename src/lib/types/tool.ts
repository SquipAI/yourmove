export type DatingApp = {
  _id: string;
  name: string;
  slug: string;
  brandColor: string | null;
};

export type AppWithTools = DatingApp & {
  toolCount: number;
  tools: { _id: string; title: string }[];
};

export type AppPageData = DatingApp & {
  title: string;
  description: string | null;
  metaTitle: string;
  metaDescription: string;
  tools: ToolCard[];
};

export type ToolCard = {
  _id: string;
  title: string;
  slug: string;
  description: string | null;
  link: string | null;
  mainImage: { url: string; alt: string | null } | null;
  paid: boolean;
  category: { _id: string; title: string } | null;
  app: DatingApp | null;
};

export type ToolEmbed = {
  path: string;
  initialHeight: number | null;
  geolocation: boolean | null;
};

import type { TargetType } from "@lib/linkTypes";

export type CtaLink = {
  targetType: TargetType | "siteLink";
  targetSlug?: string | null;
  externalUrl?: string | null;
};

export type ToolCta = {
  title: string;
  subtitle: string | null;
  buttonText: string;
  buttonLink: CtaLink | null;
};

export type ToolPageData = {
  _id: string;
  title: string;
  description: string | null;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  embed: ToolEmbed | null;
  cta: ToolCta | null;
  faqHeading: string | null;
  faq: import("./faq").FaqItem[] | null;
};

export type ToolsPageData = {
  title: string;
  description: string | null;
  metaTitle: string;
  metaDescription: string;
};

export type ToolCategoryWithTools = {
  _id: string;
  title: string;
  description: string | null;
  order: number;
  tools: ToolCard[];
};
