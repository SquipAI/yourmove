export type CompatibilityApp = {
  _id: string;
  name: string;
  logoUrl: string;
};

export type Press = {
  _id: string;
  name: string;
  logoUrl: string;
  quote: string | null;
  citationUrl: string | null;
  /** Hidden from the logo strip. Quote cards still show if `quote` is set. */
  hidden: boolean;
};

export type HeroChatCard = {
  name: string;
  avatarUrl: string;
  app: string;
  theirMessage: string;
  ourReply: string;
};

type Section<Item> = {
  eyebrow: string | null;
  heading: string;
  subtitle: string | null;
  items: Item[];
};

type DemoImage = { url: string };
type TaggedItem = { tag: string; text: string };

export type ShowcaseDemo =
  | { _type: "chatDemo"; theirMessage: string; ourReply: string }
  | { _type: "openersDemo"; items: TaggedItem[] }
  | {
      _type: "reviewDemo";
      scoreFrom: number;
      scoreTo: number;
      items: TaggedItem[];
    }
  | { _type: "bioDemo"; text: string }
  | {
      _type: "beforeAfterDemo";
      example: { before: DemoImage; after: DemoImage } | null;
    };

export type ShowcaseCard = {
  _key: string;
  _type: "toolCard" | "customCard";
  title: string;
  href: string;
  external: boolean;
  description: string | null;
  buttonText: string;
  demo: ShowcaseDemo | null;
};

export type HomeTools = {
  eyebrow: string | null;
  heading: string;
  subtitle: string | null;
  ctaLabel: string;
  showcaseCards: ShowcaseCard[] | null;
};
export type HomeReviews = Section<import("./testimonial").Testimonial>;
export type HomeFaq = Section<import("./faq").FaqItem>;

export type HomeData = {
  title: string;
  navLabel: string;
  description: string | null;
  metaTitle: string;
  metaDescription: string;
  statsEyebrow: string;
  blogHeading: string;
  tools: HomeTools;
  reviews: HomeReviews;
  faq: HomeFaq;
  cta: { label: string; url: string };
  chatCards: HeroChatCard[];
  appStoreUrl: string;
  playStoreUrl: string;
  downloadHeading: string;
};

export type LegalPageData = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  body: unknown[] | null;
};

export type BlogPageData = {
  title: string;
  description: string | null;
  metaTitle: string;
  metaDescription: string;
  downloadHeading: string;
};

export type BlogSubPageData = {
  title: string;
  description: string | null;
  metaTitle: string;
  metaDescription: string;
  downloadHeading: string;
};

export type SiteStats = {
  userCount: string;
  userRating: string;
};

// Store badges + stats eyebrow for <AppDownloadSection>.
export type AppDownload = {
  appStoreUrl: string;
  playStoreUrl: string;
  userCount: string;
  userRating: string;
};

// Tools dropdown/column data — used by both the header dropdown and the
// footer's first column.
export type NavTools = {
  label: string;
  items: { _id: string; title: string; slug: string }[];
};

// Header-only flat links: blog, reviews, affiliate, brand CTA url.
export type HeaderLinks = {
  blogLabel: string;
  reviewsLabel: string;
  affiliate: { label: string; url: string } | null;
  ctaUrl: string;
  appStoreUrl: string;
  playStoreUrl: string;
};
