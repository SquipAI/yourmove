import { sanityClient } from "@lib/sanity";
import type { Post, PostCard } from "@lib/types";
import type { LocalizedPath } from "./types";
import {
  ALTERNATES,
  BODY,
  POST_CARD,
  POST_EN,
  FAQ_ITEMS,
  POST_VISIBLE,
  POST_LISTABLE,
  POST_ORDER,
} from "./projections";
import { coalesceLang } from "./coalesceLang";
import { cached } from "./cache";
import { LOCALIZED_SLUG } from "@lib/links";
import { DEFAULT_LOCALE } from "@i18n/config";

export const BLOG_LATEST_COUNT = 4;
export const BLOG_FEATURED_COUNT = 5;
const RELATED_POSTS_COUNT = 6;

// Stat cards — headline figure/claim + rich description (with link annotations,
// resolved like FAQ answers) + cited source. Rendered by PortableText at the
// post's `statSection` marker, mirroring the FAQ field/marker split. Post-only,
// so it stays here instead of in shared projections.
const STAT_ITEMS = /* groq */ `stats[]{
  _key, title, source, sourceUrl,
  description[]{
    ...,
    markDefs[]{ ..., _type == "link" => {
      ...,
      internalLink->{ _type, _id, "slug": ${LOCALIZED_SLUG} },
      siteLink->{ url, kind }
    }}
  }
}`;

export function getAllPublishedPosts(lang = DEFAULT_LOCALE) {
  return cached(`getAllPublishedPosts:${lang}`, () =>
    sanityClient.fetch<PostCard[]>(
      `*[_type == "post" && language == $lang && ${POST_LISTABLE}] | ${POST_ORDER} ${POST_CARD}`,
      { lang },
    ),
  );
}

export function getLatestPosts(n: number, lang = DEFAULT_LOCALE) {
  return cached(`getLatestPosts:${n}:${lang}`, () =>
    sanityClient.fetch<PostCard[]>(
      `*[_type == "post" && language == $lang && ${POST_LISTABLE}] | ${POST_ORDER} [0...$n] ${POST_CARD}`,
      { lang, n },
    ),
  );
}

export function getFeaturedPosts(n: number, lang = DEFAULT_LOCALE) {
  return cached(`getFeaturedPosts:${n}:${lang}`, () =>
    sanityClient.fetch<PostCard[]>(
      // `featured` is an editorial flag set on the EN canonical only; locales
      // inherit it (same as `hidden` via POST_VISIBLE) — otherwise ES/DE, whose
      // siblings are all featured=false, would show an empty Featured block.
      `*[_type == "post" && language == $lang && ${POST_LISTABLE} && coalesce(${POST_EN}featured, featured) == true] | ${POST_ORDER} [0...$n] ${POST_CARD}`,
      { lang, n },
    ),
  );
}

export function getPostBySlug(slug: string, lang = DEFAULT_LOCALE) {
  return cached(`getPostBySlug:${slug}:${lang}`, () =>
    sanityClient.fetch<Post | null>(
      `${coalesceLang("post", "slug.current == $slug")}{
        _id, title, summary, metaTitle, metaDescription, language,
        createdAt, _updatedAt, readingTime,
        "tagIds": tags[]._ref,
        "tags": tags[]->{ "slug": slug.current, title },
        "mainImage": coalesce(
          ${POST_EN}mainImage{ asset, hotspot, crop, alt },
          mainImage{ asset, hotspot, crop, alt }
        ),
        ${ALTERNATES},
        ${BODY},
        ${FAQ_ITEMS},
        ${STAT_ITEMS}
      }`,
      { slug, lang },
    ),
  );
}

export function getRelatedPosts(
  postId: string,
  tagIds: string[],
  lang = DEFAULT_LOCALE,
  n = RELATED_POSTS_COUNT,
) {
  return cached(`getRelatedPosts:${postId}:${lang}`, async () => {
    // Score + order over cheap doc fields, slice to N, THEN apply the heavy
    // POST_CARD projection (mainImage translation.metadata subquery + tag deref)
    // to only the N survivors — same as getLatestPosts/getFeaturedPosts. Scoring
    // before the projection keeps cost O(posts) per page instead of projecting
    // every post of the language just to drop all but N.
    const result = await sanityClient.fetch<PostCard[] | null>(
      `*[_type == "post" && language == $lang && defined(slug.current) && ${POST_VISIBLE} && _id != $postId]
        | order(
            select(
              featured == true && count((tags[]._ref)[@ in $tagIds]) > 0 => 3,
              featured == true => 2,
              count((tags[]._ref)[@ in $tagIds]) > 0 => 1,
              0
            ) desc,
            coalesce(createdAt, _createdAt) desc
          ) [0...$n] ${POST_CARD}`,
      { postId, tagIds, lang, n },
    );
    return result ?? [];
  });
}

export function getPostCount(lang = DEFAULT_LOCALE) {
  return cached(`getPostCount:${lang}`, () =>
    sanityClient.fetch<number>(
      `count(*[_type == "post" && language == $lang && ${POST_LISTABLE}])`,
      { lang },
    ),
  );
}

export function getAllPostPaths() {
  return cached("getAllPostPaths", () =>
    sanityClient.fetch<LocalizedPath[]>(
      `*[_type == "post" && ${POST_LISTABLE}]{
        "lang": coalesce(language, "en"),
        "slug": slug.current
      }`,
    ),
  );
}
