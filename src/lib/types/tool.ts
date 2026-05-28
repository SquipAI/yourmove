import type { Locale } from "@i18n/config";

export type AlternateSlug = { lang: Locale; slug: string };

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
  alternates: AlternateSlug[] | null;
  tools: ToolCard[];
};

export type ToolCard = {
  _id: string;
  title: string;
  slug: string;
  description: string | null;
  cardTitle: string | null;
  cardDescription: string | null;
  paid: boolean;
  category: { _id: string; title: string } | null;
  app: DatingApp | null;
};

export type ToolEmbed = {
  path: string;
  initialHeight: number | null;
  geolocation: boolean | null;
};

import type { TargetType } from "@lib/links";

export type CtaLink = {
  targetType: TargetType | "siteLink";
  targetSlug?: string | null;
  externalUrl?: string | null;
};

export type ToolCta = {
  title: string;
  subtitle: string | null;
  buttonText: string;
  buttonLink: CtaLink;
};

export type FeatureItem = {
  icon: string;
  title: string;
  description: string;
  button: {
    text: string;
    link: CtaLink;
  } | null;
};

export type HowItWorksStep = { text: string };

export type ToolListGroup = {
  heading: string;
  tools: { _id: string; title: string; slug: string }[];
};

export type ToolListData = {
  title: string;
  subtitle: string | null;
  groups: ToolListGroup[];
};

export type ToolPageData = {
  _id: string;
  title: string;
  description: string | null;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  alternates: AlternateSlug[] | null;
  embed: ToolEmbed | null;
  cta: ToolCta | null;
  howItWorksHeading: string | null;
  howItWorks: HowItWorksStep[] | null;
  howItWorksCtaSubtext: string | null;
  featuresEyebrow: string | null;
  featuresHeading: string | null;
  features: FeatureItem[] | null;
  faqHeading: string | null;
  faq: import("./faq").FaqItem[] | null;
  toolList: ToolListData | null;
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
