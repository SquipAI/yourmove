import { sanityClient } from "@lib/sanity";
import { coalesceLang } from "./coalesceLang";
import { cached } from "./cache";
import { DEFAULT_LOCALE } from "@i18n/config";
import { linkTargetFields } from "@lib/links";
import { ALTERNATES, FAQ_ITEMS, HAS_PAGE_FILTER } from "./projections";
import type { LocalizedPath } from "./types";
import type {
  ToolCard,
  ToolsPageData,
  ToolCategoryWithTools,
  AppWithTools,
  AppPageData,
  ToolPageData,
} from "@lib/types";

export const APP_PREVIEW_COUNT = 3;

const TOOL_CARD = /* groq */ `{
  _id, title, description, cardTitle, cardDescription, paid,
  "slug": slug.current,
  "category": category->{ _id, title },
  "app": app->{ _id, name, "slug": slug.current, brandColor }
}`;

export function getToolsPage(lang = DEFAULT_LOCALE) {
  return cached(`getToolsPage:${lang}`, () =>
    sanityClient.fetch<ToolsPageData>(
      `${coalesceLang("tools")}{ title, description, metaTitle, metaDescription }`,
      { lang },
    ),
  );
}

export function getFeaturedTools(lang = DEFAULT_LOCALE, n = 6) {
  return cached(`getFeaturedTools:${lang}:${n}`, () =>
    sanityClient.fetch<ToolCard[]>(
      `*[_type == "tool" && language == $lang && featured == true] | order(coalesce(order, 9999) asc, title asc) [0...$n] ${TOOL_CARD}`,
      { lang, n },
    ),
  );
}

export function getAppsWithTools(
  lang = DEFAULT_LOCALE,
  previewCount = APP_PREVIEW_COUNT,
) {
  return cached(`getAppsWithTools:${lang}:${previewCount}`, () =>
    sanityClient.fetch<AppWithTools[]>(
      `*[_type == "datingApp" && language == $lang && ${HAS_PAGE_FILTER}]{
        _id, name, "slug": slug.current, brandColor,
        "order": coalesce(order, 0),
        "toolCount": count(*[_type == "tool" && language == $lang && references(^._id)]),
        "tools": *[_type == "tool" && language == $lang && references(^._id)] | order(title asc) [0...$previewCount] { _id, "title": coalesce(cardTitle, title) }
      }[toolCount > 0] | order(order asc, name asc)`,
      { lang, previewCount },
    ),
  );
}

export function getAppPage(slug: string, lang = DEFAULT_LOCALE) {
  return cached(`getAppPage:${slug}:${lang}`, () =>
    sanityClient.fetch<AppPageData | null>(
      `${coalesceLang("datingApp", "slug.current == $slug")}{
        _id, name, title, description, metaTitle, metaDescription,
        "slug": slug.current, brandColor,
        ${ALTERNATES},
        "tools": *[_type == "tool" && language == $lang && references(^._id) && defined(link)] | order(title asc) ${TOOL_CARD}
      }`,
      { slug, lang },
    ),
  );
}

export function getToolPage(slug: string, lang = DEFAULT_LOCALE) {
  return cached(`getToolPage:${slug}:${lang}`, () =>
    sanityClient.fetch<ToolPageData | null>(
      `${coalesceLang("tool", "slug.current == $slug")}{
        _id, title, description, metaTitle, metaDescription,
        "slug": slug.current,
        ${ALTERNATES},
        "embed": select(
          defined(embedPath) => {
            "path": embedPath,
            "initialHeight": embedInitialHeight,
            "geolocation": embedGeolocation
          },
          null
        ),
        "cta": select(
          defined(ctaTitle) => {
            "title": ctaTitle,
            "subtitle": ctaSubtitle,
            "buttonText": ctaButtonText,
            "buttonLink": { ${linkTargetFields("ctaButtonLink")} }
          },
          null
        ),
        howItWorksHeading,
        howItWorksCtaSubtext,
        "howItWorks": howItWorks[]{ text },
        featuresEyebrow,
        featuresHeading,
        "features": features[]{
          icon, title, description,
          "button": select(
            defined(button.text) && defined(button.link) => {
              "text": button.text,
              "link": { ${linkTargetFields("button.link")} }
            },
            null
          )
        },
        faqHeading,
        ${FAQ_ITEMS},
        "toolList": coalesce(
          toolList->{
            title, subtitle,
            "groups": groups[]{
              heading,
              "tools": tools[]->{ _id, "title": coalesce(cardTitle, title), "slug": slug.current }
            }
          },
          *[_type == "toolList" && language == $lang && isDefault == true][0]{
            title, subtitle,
            "groups": groups[]{
              heading,
              "tools": tools[]->{ _id, "title": coalesce(cardTitle, title), "slug": slug.current }
            }
          }
        )
      }`,
      { slug, lang },
    ),
  );
}

export function getAllToolPaths() {
  return cached("getAllToolPaths", () =>
    sanityClient.fetch<LocalizedPath[]>(
      `*[_type == "tool" && defined(slug.current)]{
        "lang": coalesce(language, "en"),
        "slug": slug.current
      }`,
    ),
  );
}

export function getAllAppPaths() {
  return cached("getAllAppPaths", () =>
    sanityClient.fetch<LocalizedPath[]>(
      `*[_type == "datingApp" && defined(slug.current) && ${HAS_PAGE_FILTER}]{
        "lang": coalesce(language, "en"),
        "slug": slug.current
      }`,
    ),
  );
}

export function getCategoriesWithTools(lang = DEFAULT_LOCALE) {
  return cached(`getCategoriesWithTools:${lang}`, () =>
    sanityClient.fetch<ToolCategoryWithTools[]>(
      `*[_type == "toolCategory" && language == $lang]{
        _id, title, description, "order": coalesce(order, 0),
        "tools": *[_type == "tool" && language == $lang && references(^._id)] | order(title asc) ${TOOL_CARD}
      }[count(tools) > 0] | order(order asc, title asc)`,
      { lang },
    ),
  );
}
