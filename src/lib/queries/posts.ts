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
  POST_TAGS,
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
        "createdAt": coalesce(${POST_EN}createdAt, createdAt, _createdAt), _updatedAt,
        "readingTime": coalesce(${POST_EN}readingTime, readingTime),
        "tagIds": ${POST_EN}tags[]._ref,
        "tags": ${POST_TAGS},
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

// A related-post candidate: the card shape plus the two raw fields the score
// needs — `featured` (locale doc) and the EN-canonical tag refs for overlap.
type RelatedCandidate = PostCard & {
  featured: boolean | null;
  tagIds: string[] | null;
};
const RELATED_CANDIDATE = POST_CARD.replace(
  /}\s*$/,
  `,\n  "featured": featured,\n  "tagIds": ${POST_EN}tags[]._ref\n}`,
);

// Every candidate of a locale, fetched once (cached) instead of re-scanned per
// post. The scan re-resolves the EN canonical for hidden/tags/createdAt on every
// post, so doing it once per locale — not once per page — is the build's biggest
// single win. Filter matches the old related query (no body-count requirement).
function getRelatedCandidates(lang = DEFAULT_LOCALE) {
  return cached(`getRelatedCandidates:${lang}`, () =>
    sanityClient.fetch<RelatedCandidate[]>(
      `*[_type == "post" && language == $lang && defined(slug.current) && ${POST_VISIBLE}] ${RELATED_CANDIDATE}`,
      { lang },
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
    // Score + order in JS over the once-fetched candidate set. Mirrors the old
    // GROQ exactly: featured+tag-overlap=3, featured=2, overlap=1, else 0; ties
    // broken by createdAt desc (ISO strings sort lexically).
    const candidates = await getRelatedCandidates(lang);
    const want = new Set(tagIds);
    const score = (p: RelatedCandidate) => {
      const overlap = p.tagIds?.some((t) => want.has(t)) ?? false;
      if (p.featured === true) return overlap ? 3 : 2;
      return overlap ? 1 : 0;
    };
    return candidates
      .filter((p) => p._id !== postId)
      .map((p) => ({ p, s: score(p) }))
      .sort(
        (a, b) =>
          b.s - a.s ||
          (a.p.createdAt < b.p.createdAt ? 1 : a.p.createdAt > b.p.createdAt ? -1 : 0),
      )
      .slice(0, n)
      .map((x) => x.p);
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
