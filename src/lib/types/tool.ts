import type { Locale } from "@i18n/config";
import type { TargetType } from "@lib/links";
import type { FeatureIconName } from "@lib/icons";
import type { FaqItem } from "./faq";

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
  downloadHeading: string;
  alternates: AlternateSlug[] | null;
  tools: ToolCard[];
  toolCount: number;
  /** Curated app-agnostic tools shown in the "More tools" section. */
  universalTools: ToolCard[];
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
  icon: FeatureIconName;
  title: string;
  description: string;
  button: {
    text: string;
    link: CtaLink;
  } | null;
};

export type HowItWorksStep = { title: string; text: string };

export type ToolListGroup = {
  heading: string;
  tools: { _id: string; title: string; slug: string }[];
};

export type ToolListData = {
  title: string;
  subtitle: string | null;
  groups: ToolListGroup[];
};

export type ToolKind =
  | "base"
  | "baseExtended"
  | "photoEnhancer"
  | "profileWriter"
  | "profileReviewer"
  | "chatAssistant";

export type BaseExtendedHero = {
  before: { url: string } | null;
  after: { url: string } | null;
  beforeCaption: string | null;
  afterCaption: string | null;
  ctaText: string | null;
  ctaSubtext: string | null;
  ctaLink: CtaLink | null;
  socialProof: string | null;
};

export type HeroExample = {
  _key: string;
  title: string;
  description: string | null;
  before: { url: string } | null;
  after: { url: string } | null;
};

export type ReviewReportData = {
  currentRating: number;
  targetRating: number;
  verdict: string;
  breakdown: { label: string; score: number }[];
  actions: string[];
};

export type ReviewComparisonItem = {
  eyebrow: string;
  bad: string;
  good: string;
  description: string;
};

export type ChatPreviewToneKey =
  | "flirty"
  | "feisty"
  | "friendly"
  | "funny"
  | "formal";

export type ChatPreviewStageKey = "open" | "reply" | "close";

export type ChatPreviewToneGroup = {
  toneKey: ChatPreviewToneKey;
  replies: string[];
};

export type ChatPreviewStage = {
  tabKey: ChatPreviewStageKey;
  eyebrow: string;
  message: string;
  replyTones: ChatPreviewToneGroup[];
};

export type ChatPreviewData = {
  stages: ChatPreviewStage[];
};

export type ProfileWriterToneKey = "flirty" | "thoughtful" | "feisty";

export type ProfileWriterSection = {
  label: string;
} & Record<ProfileWriterToneKey, string>;

export type ProfileWriterApp = {
  app: string;
  sections: ProfileWriterSection[];
};

export type ProfileWriterData = {
  examplesHeading: string;
  examplesSubtitle: string | null;
  apps: ProfileWriterApp[];
};

export type ToolPageData = {
  _id: string;
  enId: string;
  kind: ToolKind;
  eyebrow: string | null;
  title: string;
  cardTitle: string | null;
  app: { _id: string; name: string; slug: string } | null;
  toolsNavLabel: string;
  description: string | null;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  alternates: AlternateSlug[] | null;
  embed: ToolEmbed | null;
  cta: ToolCta | null;
  howItWorksHeading: string | null;
  howItWorks: HowItWorksStep[] | null;
  featuresHeading: string | null;
  featuresSubtitle: string | null;
  featuresCta: { text: string; link: CtaLink | null } | null;
  features: FeatureItem[] | null;
  faqHeading: string | null;
  faq: FaqItem[] | null;
  toolList: ToolListData | null;
  extendedHero: BaseExtendedHero | null;
  examplesHeading: string | null;
  examplesSubtitle: string | null;
  examples: HeroExample[] | null;
  reportPreview: ReviewReportData | null;
  comparisonsHeading: string | null;
  comparisons: ReviewComparisonItem[] | null;
  chatPreview: ChatPreviewData | null;
  profileWriter: ProfileWriterData | null;
};

export type ToolsPageData = {
  title: string;
  description: string | null;
  metaTitle: string;
  metaDescription: string;
  downloadHeading: string;
};

export type ToolCategoryWithTools = {
  _id: string;
  title: string;
  description: string | null;
  order: number;
  tools: ToolCard[];
};
