import { sanityClient } from "@lib/sanity";
import type { Post, PostCard } from "@lib/types";
import { BODY, POST_CARD } from "./projections";
import { cached } from "./cache";
import { DEFAULT_LOCALE } from "@i18n/config";

export const BLOG_LATEST_COUNT = 4;
export const BLOG_FEATURED_COUNT = 5;
export const RELATED_POSTS_COUNT = 6;

export function getAllPublishedPosts(lang = DEFAULT_LOCALE) {
  return cached(`getAllPublishedPosts:${lang}`, () =>
    sanityClient.fetch<PostCard[]>(
      `*[_type == "post" && language == $lang && defined(slug.current) && count(body) > 0 && hidden != true] | order(coalesce(createdAt, _createdAt) desc) ${POST_CARD}`,
      { lang },
    ),
  );
}

export function getLatestPosts(n: number, lang = DEFAULT_LOCALE) {
  return cached(`getLatestPosts:${n}:${lang}`, () =>
    sanityClient.fetch<PostCard[]>(
      `*[_type == "post" && language == $lang && defined(slug.current) && count(body) > 0 && hidden != true] | order(coalesce(createdAt, _createdAt) desc) [0...$n] ${POST_CARD}`,
      { lang, n },
    ),
  );
}

export function getFeaturedPosts(n: number, lang = DEFAULT_LOCALE) {
  return cached(`getFeaturedPosts:${n}:${lang}`, () =>
    sanityClient.fetch<PostCard[]>(
      `*[_type == "post" && language == $lang && defined(slug.current) && count(body) > 0 && hidden != true && featured == true] | order(coalesce(createdAt, _createdAt) desc) [0...$n] ${POST_CARD}`,
      { lang, n },
    ),
  );
}

export function getPostBySlug(slug: string, lang = DEFAULT_LOCALE) {
  return cached(`getPostBySlug:${slug}:${lang}`, () =>
    sanityClient.fetch<Post | null>(
      `coalesce(
        *[_type == "post" && slug.current == $slug && language == $lang][0],
        *[_type == "post" && slug.current == $slug && (language == "en" || !defined(language))][0]
      ){
        _id, title, summary, metaTitle, metaDescription, language,
        createdAt, _updatedAt, readingTime,
        "tagIds": tags[]._ref,
        "tags": tags[]->{ "slug": slug.current, title },
        "mainImage": mainImage{ "url": asset->url, alt },
        ${BODY},
        faq[]{ _key, question, answer[]{
          ...,
          markDefs[]{ ..., _type == "link" => {
            ...,
            internalLink->{ _type, _id, "slug": slug.current },
            siteLink->{ url, openInNewTab, kind }
          }}
        }}
      }`,
      { slug, lang },
    ),
  );
}

export function getRelatedPosts(postId: string, tagIds: string[], lang = DEFAULT_LOCALE, n = RELATED_POSTS_COUNT) {
  return cached(`getRelatedPosts:${postId}:${lang}`, async () => {
    const result = await sanityClient.fetch<PostCard[] | null>(
      `*[_type == "post" && language == $lang && defined(slug.current) && hidden != true && _id != $postId] {
        _id, title, summary,
        "slug": slug.current,
        "mainImage": mainImage{ "url": asset->url, alt },
        readingTime,
        "tags": tags[]->{ "slug": slug.current, title },
        "_score": select(
          featured == true && count((tags[]._ref)[@ in $tagIds]) > 0 => 3,
          featured == true => 2,
          count((tags[]._ref)[@ in $tagIds]) > 0 => 1,
          0
        ),
        "_sortDate": coalesce(createdAt, _createdAt)
      } | order(_score desc, _sortDate desc) [0...$n]`,
      { postId, tagIds, lang, n },
    );
    return result ?? [];
  });
}

export function getAllPostSlugs() {
  return cached("getAllPostSlugs", () =>
    sanityClient.fetch<string[]>(
      `*[_type == "post" && defined(slug.current) && count(body) > 0 && hidden != true && (language == "en" || !defined(language))].slug.current`,
    ),
  );
}
