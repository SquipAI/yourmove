import { sanityClient } from "@lib/sanity";
import { coalesceLang } from "./coalesceLang";
import { cached } from "./cache";
import { DEFAULT_LOCALE, LOCALES } from "@i18n/config";
import { linkTargetFields } from "@lib/links";
import { ALTERNATES, FAQ_ITEMS, HAS_PAGE_FILTER } from "./projections";
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
  _id, title, description, cardTitle, cardDescription,
  "paid": coalesce(${TOOL_EN}paid, paid),
  "slug": slug.current,
  "category": coalesce(${TOOL_EN}category, category)->{ _id, title },
  "app": coalesce(${TOOL_EN}app, app)->{ _id, name, "slug": slug.current, brandColor }
}`;

// Canonical EN _id of the current tool — resolves regardless of locale, so a
// fixed set of EN ids can pull the right localized variant on any locale page.
const TOOL_EN_ID = /* groq */ `*[_type == "translation.metadata" && schemaTypes[0] == "tool" && references(^._id)][0]
  .translations[language == "en"][0].value._ref`;

// Path to the canonical EN doc for the other localized types, mirroring TOOL_EN.
// Non-translatable fields (order, brandColor, isDefault) inherit from EN via coalesce.
const DATINGAPP_EN = /* groq */ `*[_type == "translation.metadata" && schemaTypes[0] == "datingApp" && references(^._id)][0]
  .translations[language == "en"][0].value->`;
const TOOLCATEGORY_EN = /* groq */ `*[_type == "translation.metadata" && schemaTypes[0] == "toolCategory" && references(^._id)][0]
  .translations[language == "en"][0].value->`;
const TOOLLIST_EN = /* groq */ `*[_type == "translation.metadata" && schemaTypes[0] == "toolList" && references(^._id)][0]
  .translations[language == "en"][0].value->`;

// Match a tool to the current (localized) parent doc by its EN-canonical reference.
// `tool.app` / `tool.category` are EN-only fields in Studio, so every locale's tool
// points at the EN parent — comparing against the localized parent's own id matches
// nothing on ES/DE. So compare tool.<field>._ref to the parent's EN sibling id.
// Use INSIDE a `*[tool ...]` subquery nested one level in the parent's projection,
// where `^._id` is the parent and `^.^._id` reaches it from the metadata subquery.
// `references()` can't take a computed id, so this uses `==` (which evaluates it).
const enRefMatch = (field: string, parentType: string) => /* groq */ `${field}._ref == coalesce(
  *[_type == "translation.metadata" && schemaTypes[0] == "${parentType}" && references(^.^._id)][0].translations[language == "en"][0].value._ref,
  ^._id
)`;

// "More tools for your dating life" on app hubs — curated, app-agnostic tools.
// Hubs with >1 attached tool already cover photos/bio/review, so they get a
// different trio than solo hubs (which still need a photo + review angle).
const UNIVERSAL_TOOLS_MULTI = [
  "tool-chat-assistant",
  "tool-remove-ex-from-photo",
  "tool-cosmic-compatibility",
];
const UNIVERSAL_TOOLS_SOLO = [
  "tool-chat-assistant",
  "tool-ai-photos",
  "tool-dating-profile-review",
];

// Featured first (by tool.order); then tools bound to a dating app (by app.order); then the rest (by title).
// `coalesce(featured, false)` — GROQ sorts null FIRST for desc, so null featured would outrank true.
// `select(... > 0 => ..., 9999)` — treats unset (null) AND zero alike as "no opinion" → end of list.
const TOOL_LIST_ORDER = /* groq */ `order(
  coalesce(${TOOL_EN}featured, featured, false) desc,
  select(coalesce(${TOOL_EN}order, order) > 0 => coalesce(${TOOL_EN}order, order), 9999) asc,
  defined(app) desc,
  select(app->order > 0 => app->order, 9999) asc,
  title asc
)`;

// EN-canonical id of a parent doc — tools reference EN parents, so listings group
// tools under the current-locale parent by matching tool.<parent>._id (already EN)
// to the parent's EN id.
const DATINGAPP_EN_ID = /* groq */ `coalesce(*[_type == "translation.metadata" && schemaTypes[0] == "datingApp" && references(^._id)][0].translations[language == "en"][0].value._ref, _id)`;
const TOOLCATEGORY_EN_ID = /* groq */ `coalesce(*[_type == "translation.metadata" && schemaTypes[0] == "toolCategory" && references(^._id)][0].translations[language == "en"][0].value._ref, _id)`;

// The single cached tool dataset per locale: every tool as a card plus the raw
// sort keys the listings need. One source of truth behind the featured / apps /
// category listings and the tool count — all pure JS selectors over it.
type ToolListItem = ToolCard & {
  featuredEn: boolean;
  orderEn: number | null;
  appOrder: number | null;
};
const TOOL_LIST_ITEM = TOOL_CARD.replace(
  /}\s*$/,
  `,
  "featuredEn": coalesce(${TOOL_EN}featured, featured, false),
  "orderEn": coalesce(${TOOL_EN}order, order),
  "appOrder": coalesce(${TOOL_EN}app, app)->order
}`,
);

export function getAllTools(lang = DEFAULT_LOCALE) {
  return cached(`getAllTools:${lang}`, () =>
    sanityClient.fetch<ToolListItem[]>(
      `*[_type == "tool" && language == $lang] ${TOOL_LIST_ITEM}`,
      { lang },
    ),
  );
}

const toToolCard = (t: ToolListItem): ToolCard => ({
  _id: t._id,
  title: t.title,
  slug: t.slug,
  description: t.description,
  cardTitle: t.cardTitle,
  cardDescription: t.cardDescription,
  paid: t.paid,
  category: t.category,
  app: t.app,
});

// GROQ orders strings by code point; match that (localeCompare would differ).
const cmpStr = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
// TOOL_LIST_ORDER's `select(x > 0 => x, 9999)` — unset (null) and 0 both go last.
const listRank = (o: number | null) => (o != null && o > 0 ? o : 9999);

// Mirrors GROQ TOOL_LIST_ORDER: featured desc, tool order asc (0/null last),
// has-app desc, app order asc (0/null last), title asc.
const byToolListOrder = (a: ToolListItem, b: ToolListItem) =>
  Number(b.featuredEn) - Number(a.featuredEn) ||
  listRank(a.orderEn) - listRank(b.orderEn) ||
  Number(Boolean(b.app)) - Number(Boolean(a.app)) ||
  listRank(a.appOrder) - listRank(b.appOrder) ||
  cmpStr(a.title, b.title);

export function getToolsPage(lang = DEFAULT_LOCALE) {
  return cached(`getToolsPage:${lang}`, () =>
    sanityClient.fetch<ToolsPageData>(
      `${coalesceLang("tools")}{ title, description, metaTitle, metaDescription, downloadHeading }`,
      { lang },
    ),
  );
}

export function getToolCount(lang = DEFAULT_LOCALE) {
  return cached(`getToolCount:${lang}`, async () => (await getAllTools(lang)).length);
}

export function getFeaturedTools(lang = DEFAULT_LOCALE, n = 6) {
  // order(coalesce(order, 9999) asc, title asc) — keeps 0 as 0, unlike
  // TOOL_LIST_ORDER which sends 0 to the end.
  return cached(`getFeaturedTools:${lang}:${n}`, async () =>
    (await getAllTools(lang))
      .filter((t) => t.featuredEn === true)
      .sort(
        (a, b) => (a.orderEn ?? 9999) - (b.orderEn ?? 9999) || cmpStr(a.title, b.title),
      )
      .slice(0, n)
      .map(toToolCard),
  );
}

export function getAppsWithTools(
  lang = DEFAULT_LOCALE,
  previewCount = APP_PREVIEW_COUNT,
) {
  return cached(`getAppsWithTools:${lang}:${previewCount}`, async () => {
    const [apps, tools] = await Promise.all([
      sanityClient.fetch<
        {
          _id: string;
          enId: string;
          name: string;
          slug: string;
          brandColor: string | null;
          order: number;
        }[]
      >(
        `*[_type == "datingApp" && language == $lang && ${HAS_PAGE_FILTER}]{
          _id, "enId": ${DATINGAPP_EN_ID}, name, "slug": slug.current,
          "brandColor": coalesce(${DATINGAPP_EN}brandColor, brandColor),
          "order": select(coalesce(${DATINGAPP_EN}order, order) > 0 => coalesce(${DATINGAPP_EN}order, order), 9999)
        }`,
        { lang },
      ),
      getAllTools(lang),
    ]);
    return apps
      .map((app) => ({
        app,
        appTools: tools
          .filter((t) => t.app?._id === app.enId)
          .sort(byToolListOrder),
      }))
      .filter(({ appTools }) => appTools.length > 0)
      .sort((a, b) => a.app.order - b.app.order || cmpStr(a.app.name, b.app.name))
      .map(
        ({ app, appTools }): AppWithTools => ({
          _id: app._id,
          name: app.name,
          slug: app.slug,
          brandColor: app.brandColor,
          toolCount: appTools.length,
          tools: appTools
            .slice(0, previewCount)
            .map((t) => ({ _id: t._id, title: t.cardTitle ?? t.title })),
        }),
      );
  });
}

// The full app-page projection, extracted so the build batch reads exactly what
// the old per-slug getAppPage produced. `universalPool` is the union of both
// universal-tool id sets; the exact pick happens in JS from toolCount.
const APP_PAGE_PROJECTION = /* groq */ `{
        _id, name, title, description, metaTitle, metaDescription, downloadHeading,
        "slug": slug.current, "brandColor": coalesce(${DATINGAPP_EN}brandColor, brandColor),
        ${ALTERNATES},
        "tools": *[_type == "tool" && language == $lang && ${enRefMatch("app", "datingApp")}] | ${TOOL_LIST_ORDER} ${TOOL_CARD},
        "toolCount": count(*[_type == "tool" && language == $lang && ${enRefMatch("app", "datingApp")}]),
        "universalPool": *[_type == "tool" && language == $lang && (${TOOL_EN_ID}) in $allUniversalIds]{
          "enId": ${TOOL_EN_ID},
          "card": ${TOOL_CARD}
        }
      }`;

// App pages via getStaticPaths props — one batch per locale. The universal-tools
// pick (multi vs solo, ordered by the id list) happens in JS per app, exactly as
// the old getAppPage did.
export async function getAllAppsForBuild() {
  const allUniversalIds = [
    ...new Set([...UNIVERSAL_TOOLS_MULTI, ...UNIVERSAL_TOOLS_SOLO]),
  ];
  const perLocale = await Promise.all(
    LOCALES.map(async (lang) => {
      const apps = await sanityClient.fetch<
        (AppPageData & { universalPool: { enId: string; card: ToolCard }[] })[]
      >(
        `*[_type == "datingApp" && language == $lang && defined(slug.current) && ${HAS_PAGE_FILTER}] ${APP_PAGE_PROJECTION}`,
        { lang, allUniversalIds },
      );
      return apps.map((app) => {
        const ids =
          app.toolCount > 1 ? UNIVERSAL_TOOLS_MULTI : UNIVERSAL_TOOLS_SOLO;
        app.universalTools = ids
          .map((id) => app.universalPool.find((u) => u.enId === id)?.card)
          .filter((c): c is ToolCard => Boolean(c));
        return { lang, slug: app.slug, app };
      });
    }),
  );
  return perLocale.flat();
}

// The full tool-page projection, extracted so the build batch reads exactly
// what the old per-slug getToolPage produced (no transcription drift).
const TOOL_PAGE_PROJECTION = /* groq */ `{
        _id, "enId": coalesce(${TOOL_EN_ID}, _id), title, description, eyebrow, cardTitle, metaTitle, metaDescription,
        "app": coalesce(${TOOL_EN}app, app)->{ _id, name, "slug": slug.current },
        "toolsNavLabel": *[_type == "tools" && language == $lang][0].navLabel,
        "kind": coalesce(${TOOL_EN}kind, kind, "base"),
        "slug": slug.current,
        ${ALTERNATES},
        "embed": select(
          defined(coalesce(${TOOL_EN}embedPath, embedPath)) => {
            "path": coalesce(${TOOL_EN}embedPath, embedPath),
            "initialHeight": coalesce(${TOOL_EN}embedInitialHeight, embedInitialHeight),
            "geolocation": coalesce(${TOOL_EN}embedGeolocation, embedGeolocation)
          },
          null
        ),
        "cta": select(
          defined(ctaTitle) => {
            "title": ctaTitle,
            "subtitle": ctaSubtitle,
            "buttonText": ctaButtonText,
            "buttonLink": { ${linkTargetFields(`${TOOL_EN}ctaButtonLink`)} }
          },
          null
        ),
        howItWorksHeading,
        "howItWorks": howItWorks[]{ title, text },
        featuresHeading,
        featuresSubtitle,
        "featuresCta": select(
          defined(featuresCtaText) => {
            "text": featuresCtaText,
            "link": select(
              defined(${TOOL_EN}featuresCtaLink) => { ${linkTargetFields(`${TOOL_EN}featuresCtaLink`)} },
              null
            )
          },
          null
        ),
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
          coalesce(${TOOL_EN}kind, kind) in ["baseExtended", "photoEnhancer", "profileReviewer", "chatAssistant", "profileWriter"] => {
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
            "currentRating": coalesce(${TOOL_EN}reportCurrentRating, reportCurrentRating),
            "targetRating": coalesce(${TOOL_EN}reportTargetRating, reportTargetRating),
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
        "profileWriter": select(
          coalesce(${TOOL_EN}kind, kind) == "profileWriter" => {
            "examplesHeading": profileWriterExamplesHeading,
            "examplesSubtitle": profileWriterExamplesSubtitle,
            "apps": coalesce(profileWriterApps, ${TOOL_EN}profileWriterApps)[]{
              app,
              "sections": sections[]{ label, flirty, thoughtful, feisty }
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
          *[_type == "toolList" && language == $lang && coalesce(${TOOLLIST_EN}isDefault, isDefault) == true][0]{
            title, subtitle,
            "groups": groups[]{
              heading,
              "tools": tools[]->{ _id, "title": coalesce(cardTitle, title), "slug": slug.current }
            }
          }
        )
      }`;

// Tool pages get their data via getStaticPaths props — one batch per locale
// instead of a coalesceLang point lookup per page. Selection validated 1:1
// against the old getToolPage (same slug-unique-per-locale invariant as posts).
export async function getAllToolsForBuild() {
  const perLocale = await Promise.all(
    LOCALES.map(async (lang) => {
      const tools = await sanityClient.fetch<ToolPageData[]>(
        `*[_type == "tool" && language == $lang && defined(slug.current)] ${TOOL_PAGE_PROJECTION}`,
        { lang },
      );
      return tools.map((tool) => ({ lang, slug: tool.slug, tool }));
    }),
  );
  return perLocale.flat();
}

// All EN dating apps with a logo, ordered — the one cached source for the Photo
// Enhancer compatibility row. Per-page exclusion happens in JS.
export function getAllCompatibilityApps() {
  return cached("getAllCompatibilityApps", () =>
    sanityClient.fetch<CompatibilityApp[]>(
      `*[_type == "datingApp" && language == "en" && defined(logo.asset)]
        | order(select(order > 0 => order, 9999) asc, name asc) {
          _id, name, "logoUrl": logo.asset->url
        }[defined(logoUrl)]`,
    ),
  );
}

// Compatibility logos for a page: general page shows all; an app-specific page
// drops its own logo. Filters the cached set in JS (order preserved).
export function getCompatibilityApps(excludeAppId: string | null = null) {
  return cached(`getCompatibilityApps:${excludeAppId ?? ""}`, async () =>
    (await getAllCompatibilityApps()).filter((a) => a._id !== excludeAppId),
  );
}

export function getCategoriesWithTools(lang = DEFAULT_LOCALE) {
  return cached(`getCategoriesWithTools:${lang}`, async () => {
    const [categories, tools] = await Promise.all([
      sanityClient.fetch<
        {
          _id: string;
          enId: string;
          title: string;
          description: string | null;
          order: number;
        }[]
      >(
        `*[_type == "toolCategory" && language == $lang]{
          _id, "enId": ${TOOLCATEGORY_EN_ID}, title, description,
          "order": select(coalesce(${TOOLCATEGORY_EN}order, order) > 0 => coalesce(${TOOLCATEGORY_EN}order, order), 9999)
        }`,
        { lang },
      ),
      getAllTools(lang),
    ]);
    return categories
      .map(
        (cat): ToolCategoryWithTools => ({
          _id: cat._id,
          title: cat.title,
          description: cat.description,
          order: cat.order,
          tools: tools
            .filter((t) => t.category?._id === cat.enId)
            .sort(byToolListOrder)
            .map(toToolCard),
        }),
      )
      .filter((c) => c.tools.length > 0)
      .sort((a, b) => a.order - b.order || cmpStr(a.title, b.title));
  });
}
