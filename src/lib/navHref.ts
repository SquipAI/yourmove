import { getRelativeLocaleUrl } from "astro:i18n";
import type { Locale } from "@i18n/config";
import { URL_BUILDERS, type TargetType } from "@lib/linkTypes";

export function resolveNavHref(
  targetType: TargetType | string | null | undefined,
  targetSlug: string | null | undefined,
  externalUrl: string | null | undefined,
  lang: Locale,
): string | null {
  if (externalUrl) return externalUrl;
  if (!targetType || !(targetType in URL_BUILDERS)) return null;
  const path = URL_BUILDERS[targetType as TargetType](targetSlug ?? undefined);
  return path ? getRelativeLocaleUrl(lang, path) : getRelativeLocaleUrl(lang);
}

export function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}
