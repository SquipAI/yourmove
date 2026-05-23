export type TargetType =
  | "home"
  | "blog"
  | "tools"
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
  privacy: () => "privacy",
  terms: () => "terms",
  tool: (slug) => slug ?? "",
  datingApp: (slug) => `tools/${slug ?? ""}`,
  post: (slug) => `blog/${slug ?? ""}`,
  tag: (slug) => `blog/topics/${slug ?? ""}`,
};

export const LINKABLE_TYPES = Object.keys(URL_BUILDERS) as TargetType[];

type LinkableToOptions = {
  exclude?: TargetType[];
  withSiteLink?: boolean;
};

export const linkableTo = ({
  exclude = [],
  withSiteLink = true,
}: LinkableToOptions = {}): { type: string }[] => [
  ...LINKABLE_TYPES.filter((t) => !exclude.includes(t)).map((type) => ({
    type,
  })),
  ...(withSiteLink ? [{ type: "siteLink" }] : []),
];

// GROQ fragment to flatten any reference field into a uniform shape.
// Pass the ref field name; insert inside an existing projection.
// Returns: { targetType, targetSlug, externalUrl }
export const linkTargetFields = (ref: string) => `
  "targetType": ${ref}->_type,
  "targetSlug": ${ref}->slug.current,
  "externalUrl": select(${ref}->_type == "siteLink" => ${ref}->url)
`;
