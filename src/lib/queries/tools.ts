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
  CompatibilityApp,
} from "@lib/types";

export const APP_PREVIEW_COUNT = 3;

// Path to a field on the canonical EN tool doc. Append a field name
// (e.g. `${TOOL_EN}kind`) to read it regardless of current locale —
// locales inherit, so editing on EN propagates at render time.
const TOOL_EN = /* groq */ `*[_type == "translation.metadata" && schemaTypes[0] == "tool" && references(^._id)][0]
  .translations[language == "en"][0].value->`;

const TOOL_CARD = /* groq */ `{
  _id, title, description, cardTitle, cardDescription, paid,
  "slug": slug.current,
  "category": category->{ _id, title },
  "app": app->{ _id, name, "slug": slug.current, brandColor }
}`;

// Featured first (by tool.order); then tools bound to a dating app (by app.order); then the rest (by title).
// `coalesce(featured, false)` — GROQ sorts null FIRST for desc, so null featured would outrank true.
// `select(... > 0 => ..., 9999)` — treats unset (null) AND zero alike as "no opinion" → end of list.
const TOOL_LIST_ORDER = /* groq */ `order(
  coalesce(featured, false) desc,
  select(order > 0 => order, 9999) asc,
  defined(app) desc,
  select(app->order > 0 => app->order, 9999) asc,
  title asc
)`;

export function getToolsPage(lang = DEFAULT_LOCALE) {
  return cached(`getToolsPage:${lang}`, () =>
    sanityClient.fetch<ToolsPageData>(
      `${coalesceLang("tools")}{ title, description, metaTitle, metaDescription }`,
      { lang },
    ),
  );
}

export function getToolCount(lang = DEFAULT_LOCALE) {
  return cached(`getToolCount:${lang}`, () =>
    sanityClient.fetch<number>(
      `count(*[_type == "tool" && language == $lang])`,
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
        "order": select(order > 0 => order, 9999),
        "toolCount": count(*[_type == "tool" && language == $lang && references(^._id)]),
        "tools": *[_type == "tool" && language == $lang && references(^._id)] | ${TOOL_LIST_ORDER} [0...$previewCount] { _id, "title": coalesce(cardTitle, title) }
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
        "tools": *[_type == "tool" && language == $lang && references(^._id)] | ${TOOL_LIST_ORDER} ${TOOL_CARD}
      }`,
      { slug, lang },
    ),
  );
}

export function getToolPage(slug: string, lang = DEFAULT_LOCALE) {
  return cached(`getToolPage:${slug}:${lang}`, () =>
    sanityClient.fetch<ToolPageData | null>(
      `${coalesceLang("tool", "slug.current == $slug")}{
        _id, title, description, eyebrow, cardTitle, metaTitle, metaDescription,
        "app": app->{ _id, name, "slug": slug.current },
        "toolsNavLabel": *[_type == "tools" && language == $lang][0].navLabel,
        "kind": coalesce(${TOOL_EN}kind, kind, "base"),
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
        "howItWorks": howItWorks[]{ title, text },
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
        "extendedHero": select(
          coalesce(${TOOL_EN}kind, kind) in ["baseExtended", "photoEnhancer", "profileReviewer", "chatAssistant"] => {
            "before": coalesce(
              ${TOOL_EN}heroBefore{ "url": asset->url },
              heroBefore{ "url": asset->url }
            ),
            "after": coalesce(
              ${TOOL_EN}heroAfter{ "url": asset->url },
              heroAfter{ "url": asset->url }
            ),
            "beforeCaption": heroBeforeCaption,
            "afterCaption": heroAfterCaption,
            "ctaText": heroCtaText,
            "ctaSubtext": heroCtaSubtext,
            "ctaLink": select(
              defined(${TOOL_EN}heroCtaLink) => { ${linkTargetFields(`${TOOL_EN}heroCtaLink`)} },
              null
            ),
            "socialProof": heroSocialProof
          },
          null
        ),
        examplesHeading,
        examplesSubtitle,
        "examples": examples[]{
          "_key": _key,
          title,
          description,
          "before": coalesce(
            ${TOOL_EN}examples[_key == ^._key][0].before{ "url": asset->url },
            before{ "url": asset->url }
          ),
          "after": coalesce(
            ${TOOL_EN}examples[_key == ^._key][0].after{ "url": asset->url },
            after{ "url": asset->url }
          )
        },
        "reportPreview": select(
          kind == "profileReviewer" => {
            "currentRating": reportCurrentRating,
            "targetRating": reportTargetRating,
            "verdict": reportVerdict,
            "breakdown": reportBreakdown[]{ label, score },
            "actions": reportActions
          },
          null
        ),
        "comparisonsHeading": select(
          kind == "profileReviewer" => comparisonsHeading,
          null
        ),
        "comparisons": select(
          kind == "profileReviewer" => comparisons[]{ eyebrow, bad, good, description },
          null
        ),
        "chatPreview": select(
          kind == "chatAssistant" => {
            "stages": chatPreviewStages[]{
              tabKey,
              eyebrow,
              message,
              "replyTones": replyTones[]{ toneKey, replies }
            }
          },
          null
        ),
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

// All EN dating apps with a logo, optionally excluding one by id.
// Used by the Photo Enhancer template: general page shows all; app-specific
// pages drop the current app's logo.
export function getCompatibilityApps(excludeAppId: string | null = null) {
  return cached(`getCompatibilityApps:${excludeAppId ?? ""}`, () =>
    sanityClient.fetch<CompatibilityApp[]>(
      `*[_type == "datingApp" && language == "en" && defined(logo.asset) && _id != $excludeAppId]
        | order(select(order > 0 => order, 9999) asc, name asc) {
          _id, name, "logoUrl": logo.asset->url
        }[defined(logoUrl)]`,
      { excludeAppId: excludeAppId ?? "" },
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
        _id, title, description, "order": select(order > 0 => order, 9999),
        "tools": *[_type == "tool" && language == $lang && references(^._id)] | ${TOOL_LIST_ORDER} ${TOOL_CARD}
      }[count(tools) > 0] | order(order asc, title asc)`,
      { lang },
    ),
  );
}
