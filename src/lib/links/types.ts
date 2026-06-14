export type TargetType =
  | "home"
  | "blog"
  | "tools"
  | "reviewsPage"
  | "privacy"
  | "terms"
  | "tool"
  | "datingApp"
  | "post"
  | "tag";

export const URL_BUILDERS: Record<TargetType, (slug?: string) => string> = {
  home: () => "",
  blog: () => "blog",
  tools: () => "tools",
  reviewsPage: () => "reviews",
  privacy: () => "privacy",
  terms: () => "terms",
  tool: (slug) => slug ?? "",
  datingApp: (slug) => `tools/${slug ?? ""}`,
  post: (slug) => `blog/${slug ?? ""}`,
  tag: (slug) => `blog/topics/${slug ?? ""}`,
};

export const LINKABLE_TYPES = Object.keys(URL_BUILDERS) as TargetType[];

export type NavItemRaw = {
  label: string;
  targetType: TargetType | "siteLink";
  targetSlug?: string | null;
  externalUrl?: string | null;
};

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterColumn = {
  title: string;
  items: NavItemRaw[];
};

export type FooterNavData = {
  tagline: string | null;
  columns: FooterColumn[];
  instagramUrl: string;
  tiktokUrl: string;
  supportUrl: string;
};
