import { getRelativeLocaleUrl } from "astro:i18n";
import type { BreadcrumbItem } from "@components/shared/Breadcrumbs.astro";
import type { Locale } from "@i18n/config";
import type { ToolPageData } from "@lib/types";

export function buildToolBreadcrumbs(
  tool: Pick<ToolPageData, "toolsNavLabel" | "app" | "cardTitle" | "title">,
  lang: Locale,
): BreadcrumbItem[] {
  return [
    { name: tool.toolsNavLabel, url: getRelativeLocaleUrl(lang, "tools") },
    ...(tool.app
      ? [
          {
            name: tool.app.name,
            url: getRelativeLocaleUrl(lang, `tools/${tool.app.slug}`),
          },
        ]
      : []),
    { name: tool.cardTitle ?? tool.title },
  ];
}
