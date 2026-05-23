import { sanityClient } from "@lib/sanity";
import type {
  HomeData,
  LegalPageData,
  BlogPageData,
  BlogSubPageData,
  NavItemRaw,
  FooterNavData,
  SiteStats,
} from "@lib/types";
import { BODY } from "./projections";
import { cached } from "./cache";
import { DEFAULT_LOCALE } from "@i18n/config";
import { linkTargetFields } from "@lib/linkTypes";

export function getHome(lang = DEFAULT_LOCALE) {
  return cached(`getHome:${lang}`, () =>
    sanityClient.fetch<HomeData>(
      `coalesce(
        *[_type == "home" && language == $lang][0],
        *[_type == "home" && (language == "en" || !defined(language))][0]
      ){ title, metaTitle, metaDescription }`,
      { lang },
    ),
  );
}

export function getLegalPage(type: "privacy" | "terms", lang = DEFAULT_LOCALE) {
  return cached(`getLegalPage:${type}:${lang}`, () =>
    sanityClient.fetch<LegalPageData>(
      `coalesce(
        *[_type == $type && language == $lang][0],
        *[_type == $type && (language == "en" || !defined(language))][0]
      ){ title, metaTitle, metaDescription, ${BODY} }`,
      { type, lang },
    ),
  );
}

export function getBlogPage(lang = DEFAULT_LOCALE) {
  return cached(`getBlogPage:${lang}`, () =>
    sanityClient.fetch<BlogPageData>(
      `coalesce(
        *[_type == "blog" && language == $lang][0],
        *[_type == "blog" && (language == "en" || !defined(language))][0]
      ){ title, description, metaTitle, metaDescription }`,
      { lang },
    ),
  );
}

export function getBlogPostsPage(lang = DEFAULT_LOCALE) {
  return cached(`getBlogPostsPage:${lang}`, () =>
    sanityClient.fetch<BlogSubPageData>(
      `coalesce(
        *[_type == "blog-posts" && language == $lang][0],
        *[_type == "blog-posts" && (language == "en" || !defined(language))][0]
      ){ title, metaTitle, metaDescription }`,
      { lang },
    ),
  );
}

export function getBlogTagsPage(lang = DEFAULT_LOCALE) {
  return cached(`getBlogTagsPage:${lang}`, () =>
    sanityClient.fetch<BlogSubPageData>(
      `coalesce(
        *[_type == "blog-tags" && language == $lang][0],
        *[_type == "blog-tags" && (language == "en" || !defined(language))][0]
      ){ title, metaTitle, metaDescription }`,
      { lang },
    ),
  );
}

const NAV_ITEM_PROJECTION = `{
  "label": coalesce(label, target->title),
  ${linkTargetFields("target")}
}`;

export function getSiteStats() {
  return cached("getSiteStats", () =>
    sanityClient.fetch<SiteStats | null>(
      `*[_type == "siteStats" && _id == "site-stats"][0]{ userCount, userRating }`,
    ),
  );
}

export function getHeaderNav() {
  return cached("getHeaderNav", () =>
    sanityClient.fetch<NavItemRaw[] | null>(
      `*[_type == "headerNav" && _id == "header-nav"][0].items[] ${NAV_ITEM_PROJECTION}`,
    ),
  );
}

export function getFooterNav() {
  return cached("getFooterNav", () =>
    sanityClient.fetch<FooterNavData | null>(
      `*[_type == "footerNav" && _id == "footer-nav"][0]{
        tagline,
        "columns": columns[]{
          title,
          "items": items[] ${NAV_ITEM_PROJECTION}
        }
      }`,
    ),
  );
}
