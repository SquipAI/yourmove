import { getNavTools, getHeaderLinks, getFooterNav } from "@lib/queries";
import {
  resolveNavHref,
  isExternalHref,
  type NavItem,
  type NavItemRaw,
  type FooterNavData,
} from "@lib/links";
import { t } from "@i18n/ui";
import { localePathFor } from "@i18n/utils";
import type { Locale } from "@i18n/config";

function resolveNavItems(raw: NavItemRaw[] | null, lang: Locale): NavItem[] {
  if (!raw) return [];
  return raw.flatMap(({ label, targetType, targetSlug, externalUrl }) => {
    const href = resolveNavHref(targetType, targetSlug, externalUrl, lang);
    if (!href) return [];
    return [{ label, href, external: isExternalHref(href) }];
  });
}

function resolveFooterColumns(data: FooterNavData | null, lang: Locale) {
  if (!data) return { tagline: null, columns: [] };
  return {
    tagline: data.tagline ?? null,
    columns: data.columns.map((col) => ({
      title: col.title,
      items: resolveNavItems(col.items, lang),
    })),
  };
}

// Aggregates everything Header + Footer need for a given locale: tools column
// (shared), header-only flat links, and Sanity-driven footer columns.
export async function buildSiteChrome(lang: Locale) {
  const [navTools, headerLinks, footerNav] = await Promise.all([
    getNavTools(lang),
    getHeaderLinks(lang),
    getFooterNav(lang),
  ]);
  const lp = localePathFor(lang);
  const toolsColumn = {
    title: navTools.label,
    items: navTools.items.map((tool) => ({
      label: tool.title,
      href: lp(tool.slug),
    })) satisfies NavItem[],
    seeAll: { label: t(lang, "nav.allTools"), href: lp("tools") } as NavItem,
  };
  const flatLinks: NavItem[] = [
    { label: headerLinks.blogLabel, href: lp("blog") },
    { label: headerLinks.reviewsLabel, href: lp("reviews") },
    ...(headerLinks.affiliate
      ? [
          {
            label: headerLinks.affiliate.label,
            href: headerLinks.affiliate.url,
            external: true,
          },
        ]
      : []),
  ];
  const footer = resolveFooterColumns(footerNav, lang);
  return { toolsColumn, flatLinks, footer, ctaUrl: headerLinks.ctaUrl };
}
