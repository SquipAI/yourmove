import { getRelativeLocaleUrl } from "astro:i18n";
import { LOCALES, DEFAULT_LOCALE } from "./config";
import type { Locale } from "./config";

export function localePathFor(lang: Locale) {
  return (path: string) => getRelativeLocaleUrl(lang, path);
}

export function getNonDefaultLocalePaths() {
  return LOCALES.filter(
    (l): l is Exclude<Locale, typeof DEFAULT_LOCALE> => l !== DEFAULT_LOCALE,
  ).map((lang) => ({ params: { lang } }));
}

/**
 * Builds alternateUrls for hreflang + language switcher.
 * slugs: per-locale path segment from Sanity (e.g. "tools", "herramientas").
 * Locales without a slug fall back to the EN slug, or to the locale homepage if no EN slug.
 */
export function buildAlternateUrls(
  origin: string,
  slugs: Partial<Record<Locale, string>> = {},
): Record<Locale, string> {
  const defaultSlug = slugs[DEFAULT_LOCALE];
  return Object.fromEntries(
    LOCALES.map((l) => {
      const slug = slugs[l] ?? defaultSlug;
      const path = slug
        ? getRelativeLocaleUrl(l, slug)
        : getRelativeLocaleUrl(l);
      return [l, `${origin}${path}`];
    }),
  ) as Record<Locale, string>;
}

/**
 * Builds alternateUrls for nested routes like /blog/post-slug/ or /tools/tool-slug/.
 * indexSlugs: per-locale slug for the index page (e.g. "blog").
 * itemSlugs: per-locale slug for the item (e.g. the post or tool slug).
 */
export function buildNestedAlternateUrls(
  origin: string,
  indexSlugs: Partial<Record<Locale, string>>,
  itemSlugs: Partial<Record<Locale, string>>,
): Record<Locale, string> {
  const defaultIndex = indexSlugs[DEFAULT_LOCALE];
  const defaultItem = itemSlugs[DEFAULT_LOCALE];
  return Object.fromEntries(
    LOCALES.map((l) => {
      const indexSlug = indexSlugs[l] ?? defaultIndex;
      const itemSlug = itemSlugs[l] ?? defaultItem;
      const path = getRelativeLocaleUrl(l, `${indexSlug}/${itemSlug}`);
      return [l, `${origin}${path}`];
    }),
  ) as Record<Locale, string>;
}
