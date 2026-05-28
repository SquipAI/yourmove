import { DEFAULT_LOCALE, type Locale } from "@i18n/config";

// Mirror a page path into its OG-image route: `blog/foo` → `blog/foo` (en) or
// `es/blog/foo` (es/de). Matches the page URL scheme (no default-locale prefix,
// no trailing slash), so the endpoint and og:image tag always agree.
export function ogRoute(lang: Locale, path: string): string {
  return lang === DEFAULT_LOCALE ? path : `${lang}/${path}`;
}

export function ogImageHref(origin: string, lang: Locale, path: string): string {
  return `${origin}/og/${ogRoute(lang, path)}.png`;
}
