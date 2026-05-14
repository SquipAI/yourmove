export type NavItemRaw = {
  label: string;
  targetType: "home" | "blog" | "privacy" | "terms" | "tool" | "siteLink";
  externalUrl?: string | null;
};

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};
