import type { TargetType } from "@lib/linkTypes";

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
};
