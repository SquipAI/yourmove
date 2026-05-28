export type CompatibilityApp = {
  _id: string;
  name: string;
  logoUrl: string | null;
};

export type Compatibility = {
  label: string;
  apps: CompatibilityApp[];
};

type Section<Item> = {
  eyebrow: string | null;
  heading: string;
  subtitle: string | null;
  items: Item[];
};

export type HomeTools = {
  eyebrow: string | null;
  heading: string;
  subtitle: string | null;
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
  compatibility: Compatibility;
  tools: HomeTools;
  reviews: HomeReviews;
  faq: HomeFaq;
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
};

export type BlogSubPageData = {
  title: string;
  description: string | null;
  metaTitle: string;
  metaDescription: string;
};

export type SiteStats = {
  userCount: string | null;
  userRating: string | null;
};

// Tools dropdown/column data — used by both the header dropdown and the
// footer's first column.
export type NavTools = {
  label: string;
  items: { _id: string; title: string; slug: string }[];
};

// Header-only flat links: blog, reviews, affiliate.
export type HeaderLinks = {
  blogLabel: string;
  reviewsLabel: string;
  affiliate: { label: string; url: string } | null;
};
