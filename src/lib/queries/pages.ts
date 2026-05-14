import { sanityClient } from "@lib/sanity";
import type { HomeData, LegalPageData, BlogHubData, BlogSubPageData, NavItemRaw } from "@lib/types";
import { BODY } from "./projections";
import { cached } from "./cache";
import { DEFAULT_LOCALE } from "@i18n/config";

export function getHome(lang = DEFAULT_LOCALE) {
  return cached(`getHome:${lang}`, () =>
    sanityClient.fetch<HomeData>(
      `coalesce(
        *[_type == "home" && language == $lang][0],
        *[_type == "home" && (language == "en" || !defined(language))][0]
      ){ metaTitle, metaDescription }`,
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
      ){ h1, metaTitle, metaDescription, ${BODY} }`,
      { type, lang },
    ),
  );
}

export function getBlogHub(lang = DEFAULT_LOCALE) {
  return cached(`getBlogHub:${lang}`, () =>
    sanityClient.fetch<BlogHubData>(
      `coalesce(
        *[_type == "blog" && language == $lang][0],
        *[_type == "blog" && (language == "en" || !defined(language))][0]
      ){ title, intro, metaTitle, metaDescription }`,
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

export function getNavigation(navId: string) {
  return cached(`getNavigation:${navId}`, () =>
    sanityClient.fetch<NavItemRaw[] | null>(
      `*[_type == "navigation" && navId.current == $navId][0].items[] {
        label,
        "targetType": target->_type,
        "externalUrl": select(
          target->_type == "tool" => target->link,
          target->_type == "siteLink" => target->url,
        )
      }`,
      { navId },
    ),
  );
}
