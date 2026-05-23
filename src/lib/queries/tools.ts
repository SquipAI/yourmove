import { sanityClient } from "@lib/sanity";
import { cached } from "./cache";
import { DEFAULT_LOCALE } from "@i18n/config";
import { linkTargetFields } from "@lib/linkTypes";
import type {
  ToolCard,
  ToolsPageData,
  ToolCategoryWithTools,
  AppWithTools,
  AppPageData,
  ToolPageData,
} from "@lib/types";

export const TOOLS_FEATURED_COUNT = 6;
export const APP_PREVIEW_COUNT = 3;

const TOOL_CARD = /* groq */ `{
  _id, title, description, link, paid,
  "slug": slug.current,
  "mainImage": mainImage{ "url": asset->url, alt },
  "category": category->{ _id, title },
  "app": app->{ _id, name, "slug": slug.current, brandColor }
}`;

export function getToolsPage(lang = DEFAULT_LOCALE) {
  return cached(`getToolsPage:${lang}`, () =>
    sanityClient.fetch<ToolsPageData>(
      `coalesce(
        *[_type == "tools" && language == $lang][0],
        *[_type == "tools" && (language == "en" || !defined(language))][0]
      ){ title, description, metaTitle, metaDescription }`,
      { lang },
    ),
  );
}

export function getFeaturedTools(n: number, lang = DEFAULT_LOCALE) {
  return cached(`getFeaturedTools:${n}:${lang}`, () =>
    sanityClient.fetch<ToolCard[]>(
      `*[_type == "tool" && language == $lang && featured == true && defined(link)] | order(title asc) [0...$n] ${TOOL_CARD}`,
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
      `*[_type == "datingApp" && language == $lang]{
        _id, name, "slug": slug.current, brandColor,
        "order": coalesce(order, 0),
        "toolCount": count(*[_type == "tool" && language == $lang && references(^._id) && defined(link)]),
        "tools": *[_type == "tool" && language == $lang && references(^._id) && defined(link)] | order(title asc) [0...$previewCount] { _id, title }
      }[toolCount > 0] | order(order asc, name asc)`,
      { lang, previewCount },
    ),
  );
}

export function getAppPage(slug: string, lang = DEFAULT_LOCALE) {
  return cached(`getAppPage:${slug}:${lang}`, () =>
    sanityClient.fetch<AppPageData | null>(
      `*[_type == "datingApp" && language == $lang && slug.current == $slug][0]{
        _id, name, title, description, metaTitle, metaDescription,
        "slug": slug.current, brandColor,
        "tools": *[_type == "tool" && language == $lang && references(^._id) && defined(link)] | order(title asc) ${TOOL_CARD}
      }`,
      { slug, lang },
    ),
  );
}

export function getToolPage(slug: string, lang = DEFAULT_LOCALE) {
  return cached(`getToolPage:${slug}:${lang}`, () =>
    sanityClient.fetch<ToolPageData | null>(
      `*[_type == "tool" && language == $lang && slug.current == $slug][0]{
        _id, title, description, metaTitle, metaDescription,
        "slug": slug.current,
        "embed": select(
          defined(embedPath) => {
            "path": embedPath,
            "initialHeight": embedInitialHeight,
            "geolocation": embedGeolocation
          },
          null
        ),
        "cta": select(
          defined(ctaTitle) && defined(ctaButtonText) => {
            "title": ctaTitle,
            "subtitle": ctaSubtitle,
            "buttonText": ctaButtonText,
            "buttonLink": select(
              defined(ctaButtonLink) => { ${linkTargetFields("ctaButtonLink")} },
              null
            )
          },
          null
        ),
        faqHeading,
        faq[]{
          _key, question, answer[]{
            ...,
            markDefs[]{ ..., _type == "link" => {
              ...,
              internalLink->{ _type, _id, "slug": slug.current },
              siteLink->{ url, openInNewTab, kind }
            }}
          }
        }
      }`,
      { slug, lang },
    ),
  );
}

export function getAllToolSlugs() {
  return cached("getAllToolSlugs", () =>
    sanityClient.fetch<string[]>(
      `*[_type == "tool" && defined(slug.current) && (language == "en" || !defined(language))].slug.current`,
    ),
  );
}

export function getAllAppSlugs() {
  return cached("getAllAppSlugs", () =>
    sanityClient.fetch<string[]>(
      `*[_type == "datingApp" && defined(slug.current) && (language == "en" || !defined(language))].slug.current`,
    ),
  );
}

export function getCategoriesWithTools(lang = DEFAULT_LOCALE) {
  return cached(`getCategoriesWithTools:${lang}`, () =>
    sanityClient.fetch<ToolCategoryWithTools[]>(
      `*[_type == "toolCategory" && language == $lang]{
        _id, title, description, "order": coalesce(order, 0),
        "tools": *[_type == "tool" && language == $lang && references(^._id) && defined(link)] | order(title asc) ${TOOL_CARD}
      }[count(tools) > 0] | order(order asc, title asc)`,
      { lang },
    ),
  );
}
