// Icons editors can pick for tool features (Studio dropdown). A subset of the
// full Icon.astro registry — UI-only icons (copy, x, arrow-right, …) stay out.
// Icon.astro asserts at compile time that every name here exists in its
// registry, so the two cannot drift.
export const FEATURE_ICON_NAMES = [
  "trending-up",
  "heart",
  "pen-tool",
  "message-circle",
  "star",
  "thumbs-up",
  "loader",
  "clock",
  "zap",
  "sparkles",
  "check",
  "camera",
] as const;

export type FeatureIconName = (typeof FEATURE_ICON_NAMES)[number];
