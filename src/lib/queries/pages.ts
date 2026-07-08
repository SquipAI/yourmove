import { sanityClient } from "@lib/sanity";
import type {
  HomeData,
  LegalPageData,
  BlogPageData,
  BlogSubPageData,
  SiteStats,
  AppDownload,
  NavTools,
  HeaderLinks,
  Press,
} from "@lib/types";
import type { FooterNavData } from "@lib/links";
import { LOCALIZED_SLUG } from "@lib/links";
import { BODY, FAQ_ITEM_BODY, TESTIMONIAL_CARD } from "./projections";
import { coalesceLang } from "./coalesceLang";
import { cached } from "./cache";
import { DEFAULT_LOCALE } from "@i18n/config";

// Store-badge siteLink ids — stable, hardcoded since they're not editor-pickable.
const APP_STORE_SITELINK_ID = "ca2829ce-8438-435e-a8f1-6ab07a03c6f2";
const GOOGLE_PLAY_SITELINK_ID = "a3c746b7-d6a9-45f3-a3a5-6e2bbd3f6ea9";

export function getHome(lang = DEFAULT_LOCALE) {
  return cached(`getHome:${lang}`, () =>
    sanityClient.fetch<HomeData | null>(
      `${coalesceLang("home")}{
        title, navLabel, description, metaTitle, metaDescription,
        statsEyebrow, blogHeading,
        downloadHeading,
        "cta": {
          "label": heroCta.label,
          "url": *[_type == "home" && language == "en"][0].heroCta.link->url
        },
        "chatCards": heroChatCards[]{
          name, app, theirMessage, ourReply,
          "avatarUrl": avatar.asset->url
        },
        "appStoreUrl": *[_id == $appStoreId][0].url,
        "playStoreUrl": *[_id == $playStoreId][0].url,
        "reviews": {
          "eyebrow": reviews.eyebrow,
          "heading": reviews.heading,
          "subtitle": reviews.subtitle,
          "items": *[_id == "home"][0].reviews.items[]->{
            "loc": coalesce(
              *[_type == "translation.metadata" && references(^._id)][0]
                .translations[language == $lang][0].value->,
              @
            )
          }.loc ${TESTIMONIAL_CARD}
        },
        "faq": {
          "eyebrow": faq.eyebrow,
          "heading": faq.heading,
          "subtitle": faq.subtitle,
          "items": faq.items[] ${FAQ_ITEM_BODY}
        },
        "tools": {
          "eyebrow": tools.eyebrow,
          "heading": tools.heading,
          "subtitle": tools.subtitle,
          "ctaLabel": tools.ctaLabel,
          "showcaseCards": tools.showcaseCards[]{
            _key,
            _type,
            description,
            buttonText,
            "title": select(
              _type == "toolCard" => coalesce(target->cardTitle, target->title),
              title
            ),
            "href": select(
              _type == "toolCard" => target->slug.current,
              url
            ),
            "external": _type == "customCard",
            "demo": demo[0]{
              _type,
              theirMessage,
              ourReply,
              scoreFrom,
              scoreTo,
              text,
              items[]{ tag, text },
              "example": select(_type == "beforeAfterDemo" =>
                *[_type == "translation.metadata" && references(^.^.target._ref)][0]
                  .translations[language == "en"][0].value->examples[0]{
                    "before": before.asset->{ "url": url },
                    "after": after.asset->{ "url": url }
                  }
              )
            }
          }
        }
      }`,
      {
        lang,
        appStoreId: APP_STORE_SITELINK_ID,
        playStoreId: GOOGLE_PLAY_SITELINK_ID,
      },
    ),
  );
}

export function getLegalPage(type: "privacy" | "terms", lang = DEFAULT_LOCALE) {
  return cached(`getLegalPage:${type}:${lang}`, () =>
    sanityClient.fetch<LegalPageData>(
      `${coalesceLang(type)}{ title, metaTitle, metaDescription, ${BODY} }`,
      { lang },
    ),
  );
}

export function getBlogPage(lang = DEFAULT_LOCALE) {
  return cached(`getBlogPage:${lang}`, () =>
    sanityClient.fetch<BlogPageData>(
      `${coalesceLang("blog")}{ title, description, metaTitle, metaDescription, downloadHeading }`,
      { lang },
    ),
  );
}

export function getBlogPostsPage(lang = DEFAULT_LOCALE) {
  return cached(`getBlogPostsPage:${lang}`, () =>
    sanityClient.fetch<BlogSubPageData>(
      `${coalesceLang("blog-posts")}{ title, description, metaTitle, metaDescription }`,
      { lang },
    ),
  );
}

export function getBlogTagsPage(lang = DEFAULT_LOCALE) {
  return cached(`getBlogTagsPage:${lang}`, () =>
    sanityClient.fetch<BlogSubPageData>(
      `${coalesceLang("blog-tags")}{ title, description, metaTitle, metaDescription, downloadHeading }`,
      { lang },
    ),
  );
}

// Affiliate external link — stable Sanity id, editor changes url/title in
// Studio, the id stays.
const AFFILIATE_SITELINK_ID = "77b2b26c-8ffc-4534-8dce-22ccb8c92e86";

// Social / support links — same pattern as app store IDs.
const INSTAGRAM_SITELINK_ID = "469bab81-c3fc-4f5c-9c94-edba4425d4ee";
const TIKTOK_SITELINK_ID = "bda114b9-483b-4738-885e-9f016b6ba34f";
const SUPPORT_EMAIL_SITELINK_ID = "80997e6d-d270-4f14-8387-ecd6bcfd2046";

// Section nav labels for breadcrumb schema (Home / Tools / Blog crumbs).
export function getNavLabels(lang = DEFAULT_LOCALE) {
  return cached(`getNavLabels:${lang}`, () =>
    sanityClient.fetch<{ home: string; tools: string; blog: string }>(
      `{
        "home": *[_type == "home" && language == $lang][0].navLabel,
        "tools": *[_type == "tools" && language == $lang][0].navLabel,
        "blog": *[_type == "blog" && language == $lang][0].navLabel
      }`,
      { lang },
    ),
  );
}

// Tools dropdown content — shared by header and footer.
export function getNavTools(lang = DEFAULT_LOCALE) {
  return cached(`getNavTools:${lang}`, () =>
    sanityClient.fetch<NavTools>(
      `{
        "label": *[_type == "tools" && language == $lang][0].navLabel,
        "items": *[_type == "tool" && language == $lang && featured == true]
          | order(coalesce(order, 9999) asc, title asc) [0...6] {
            _id, "title": coalesce(cardTitle, title), "slug": slug.current
          }
      }`,
      { lang },
    ),
  );
}

// Brand CTA destination — same Start siteLink that the home hero uses.
const START_SITELINK_ID = "bc386858-e483-4c7e-ab66-9897eeae826f";

// Header flat links — blog, reviews, affiliate, brand CTA url.
export function getHeaderLinks(lang = DEFAULT_LOCALE) {
  return cached(`getHeaderLinks:${lang}`, () =>
    sanityClient.fetch<HeaderLinks>(
      `{
        "blogLabel": *[_type == "blog" && language == $lang][0].navLabel,
        "reviewsLabel": *[_type == "reviewsPage" && language == $lang][0].navLabel,
        "affiliate": *[_id == $affiliateId][0]{
          "label": coalesce(title[$lang], title.en),
          url
        },
        "ctaUrl": *[_id == $startId][0].url,
        "appStoreUrl": *[_id == $appStoreId][0].url,
        "playStoreUrl": *[_id == $playStoreId][0].url
      }`,
      {
        lang,
        affiliateId: AFFILIATE_SITELINK_ID,
        startId: START_SITELINK_ID,
        appStoreId: APP_STORE_SITELINK_ID,
        playStoreId: GOOGLE_PLAY_SITELINK_ID,
      },
    ),
  );
}

// `hidden` only suppresses the logo strip — a hidden outlet can still
// contribute a pull quote. Anchored on EN docs (canonical name/logo); quote
// resolved via translation.metadata sibling for the current locale.
export function getPress(lang = DEFAULT_LOCALE) {
  return cached(`getPress:${lang}`, () =>
    sanityClient.fetch<Press[]>(
      `*[_type == "pressLogo" && language == "en" && defined(logo.asset)]
        | order(coalesce(order, 9999) asc, name asc) {
          _id,
          name,
          "logoUrl": logo.asset->url,
          "hidden": hidden == true,
          citationUrl,
          "quote": coalesce(
            *[_type == "translation.metadata" && references(^._id)][0]
              .translations[value->language == $lang][0].value->quote,
            quote
          )
        }`,
      { lang },
    ),
  );
}

export function getSiteStats() {
  return cached("getSiteStats", () =>
    sanityClient.fetch<SiteStats>(
      `*[_type == "siteStats" && _id == "site-stats"][0]{ userCount, userRating }`,
    ),
  );
}

// Store badge urls + stats for <CtaSection>. The per-page
// `downloadHeading` lives on each page document.
export function getAppDownload() {
  return cached("getAppDownload", () =>
    sanityClient.fetch<AppDownload>(
      `{
        "appStoreUrl": *[_id == $appStoreId][0].url,
        "playStoreUrl": *[_id == $playStoreId][0].url,
        "userCount": *[_type == "siteStats" && _id == "site-stats"][0].userCount,
        "userRating": *[_type == "siteStats" && _id == "site-stats"][0].userRating
      }`,
      { appStoreId: APP_STORE_SITELINK_ID, playStoreId: GOOGLE_PLAY_SITELINK_ID },
    ),
  );
}

export function getFooterNav(lang = DEFAULT_LOCALE) {
  return cached(`getFooterNav:${lang}`, () =>
    sanityClient.fetch<FooterNavData | null>(
      `*[_type == "footerNav" && _id == "footer-nav"][0]{
        "tagline": tagline[$lang],
        "columns": columns[]{
          "title": title[$lang],
          "items": items[]->{
            "label": coalesce(
              *[_type == "translation.metadata" && references(^._id)][0]
                .translations[language == $lang][0].value->navLabel,
              navLabel,
              title[$lang],
              *[_type == "translation.metadata" && references(^._id)][0]
                .translations[language == $lang][0].value->title,
              title.en,
              title
            ),
            "targetType": _type,
            "targetSlug": ${LOCALIZED_SLUG},
            "externalUrl": select(_type == "siteLink" => url)
          }
        },
        "instagramUrl": *[_id == $instagramId][0].url,
        "tiktokUrl": *[_id == $tiktokId][0].url,
        "supportUrl": *[_id == $supportId][0].url
      }`,
      {
        lang,
        instagramId: INSTAGRAM_SITELINK_ID,
        tiktokId: TIKTOK_SITELINK_ID,
        supportId: SUPPORT_EMAIL_SITELINK_ID,
      },
    ),
  );
}
