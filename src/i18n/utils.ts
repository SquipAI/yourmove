import { getRelativeLocaleUrl } from "astro:i18n";
import { LOCALES, DEFAULT_LOCALE } from "./config";
import type { Locale } from "./config";

export function localePathFor(lang: Locale) {
  return (path: string) => getRelativeLocaleUrl(lang, path);
}

export function getAllLocalePaths() {
  return LOCALES.map((l) => ({
    params: { lang: l === DEFAULT_LOCALE ? undefined : l },
  }));
}

// Build per-locale absolute URLs from translation.metadata alternates.
// `prefix` joins each slug to a static path segment ("tools", "blog", "blog/topics").
// Locales without a slug fall back to the locale homepage (never 404).
export function buildAlternateUrls(
  origin: string,
  currentLang: Locale,
  currentSlug: string,
  alternates: Array<{ lang: Locale; slug: string | null }> | null | undefined,
  prefix = "",
): Record<Locale, string> {
  const join = (s: string) => (prefix ? `${prefix}/${s}` : s);
  const slugs: Partial<Record<Locale, string>> = {
    [currentLang]: join(currentSlug),
  };
  for (const a of alternates ?? []) {
    if (a.slug) slugs[a.lang] = join(a.slug);
  }
  return Object.fromEntries(
    LOCALES.map((l) => {
      const slug = slugs[l];
      const path = slug ? getRelativeLocaleUrl(l, slug) : getRelativeLocaleUrl(l);
      return [l, `${origin}${path}`];
    }),
  ) as Record<Locale, string>;
}
