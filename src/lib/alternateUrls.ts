import { getRelativeLocaleUrl } from "astro:i18n";
import { LOCALES, DEFAULT_LOCALE } from "@i18n/config";
import type { Locale } from "@i18n/config";

// Derives per-locale absolute URLs for the current path. Strips locale prefix
// (/es/privacy → privacy) and builds {en, es, de} URLs. Used for hreflang
// tags and the header language switcher. Pages with translated slugs (e.g.
// tool/post) should pass their own alternateUrls instead of using this.
export function defaultAlternateUrls(url: URL): Record<Locale, string> {
  const nonDefault = LOCALES.filter((l) => l !== DEFAULT_LOCALE);
  const slug = url.pathname
    .replace(new RegExp(`^/(${nonDefault.join("|")})(\/|$)`), "")
    .replace(/^\//, "");
  return Object.fromEntries(
    LOCALES.map((l) => [
      l,
      `${url.origin}${slug ? getRelativeLocaleUrl(l, slug) : getRelativeLocaleUrl(l)}`,
    ]),
  ) as Record<Locale, string>;
}
