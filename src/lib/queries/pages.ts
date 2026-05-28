import { sanityClient } from "@lib/sanity";
import type {
  HomeData,
  LegalPageData,
  BlogPageData,
  BlogSubPageData,
  SiteStats,
  NavTools,
  HeaderLinks,
} from "@lib/types";
import type { FooterNavData } from "@lib/links";
import {
  BODY,
  FAQ_ITEM_BODY,
  COMPATIBILITY,
  TESTIMONIAL_CARD,
} from "./projections";
import { coalesceLang } from "./coalesceLang";
import { cached } from "./cache";
import { DEFAULT_LOCALE } from "@i18n/config";

export function getHome(lang = DEFAULT_LOCALE) {
  return cached(`getHome:${lang}`, () =>
    sanityClient.fetch<HomeData>(
      `${coalesceLang("home")}{
        title, navLabel, description, metaTitle, metaDescription,
        statsEyebrow, blogHeading,
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
        ${COMPATIBILITY},
        "tools": {
          "eyebrow": tools.eyebrow,
          "heading": tools.heading,
          "subtitle": tools.subtitle
        }
      }`,
      { lang },
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
      `${coalesceLang("blog")}{ title, description, metaTitle, metaDescription }`,
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
      `${coalesceLang("blog-tags")}{ title, description, metaTitle, metaDescription }`,
      { lang },
    ),
  );
}

// Affiliate external link — stable Sanity id, editor changes url/title in
// Studio, the id stays.
const AFFILIATE_SITELINK_ID = "77b2b26c-8ffc-4534-8dce-22ccb8c92e86";

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

// Header flat links — blog, reviews, affiliate.
export function getHeaderLinks(lang = DEFAULT_LOCALE) {
  return cached(`getHeaderLinks:${lang}`, () =>
    sanityClient.fetch<HeaderLinks>(
      `{
        "blogLabel": *[_type == "blog" && language == $lang][0].navLabel,
        "reviewsLabel": *[_type == "reviewsPage" && language == $lang][0].navLabel,
        "affiliate": *[_id == $affiliateId][0]{
          "label": coalesce(title[$lang], title.en),
          url
        }
      }`,
      { lang, affiliateId: AFFILIATE_SITELINK_ID },
    ),
  );
}

export function getSiteStats() {
  return cached("getSiteStats", () =>
    sanityClient.fetch<SiteStats | null>(
      `*[_type == "siteStats" && _id == "site-stats"][0]{ userCount, userRating }`,
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
            "targetSlug": slug.current,
            "externalUrl": select(_type == "siteLink" => url)
          }
        }
      }`,
      { lang },
    ),
  );
}
