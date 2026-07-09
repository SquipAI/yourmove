import { sanityClient } from "@lib/sanity";
import type { Post, PostCard } from "@lib/types";
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
import { cached } from "./cache";
import { LOCALIZED_SLUG } from "@lib/links";
import { DEFAULT_LOCALE, LOCALES } from "@i18n/config";

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

// One fetch per locale of every buildable post with the full page projection —
// replaces the per-page getPostBySlug (378 point lookups) with 3 batch reads,
// consumed via getStaticPaths props. Selection validated 1:1 against the old
// coalesceLang-by-slug lookup; `slug` rides along for the route params.
export function getAllPostsForBuild() {
  return cached("getAllPostsForBuild", async () => {
    const perLocale = await Promise.all(
      LOCALES.map((lang) =>
        sanityClient
          .fetch<(Post & { slug: string })[]>(
            `*[_type == "post" && language == $lang && ${POST_LISTABLE}]{
              _id, title, summary, metaTitle, metaDescription, language,
              "slug": slug.current,
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
            { lang },
          )
          .then((posts) => posts.map((post) => ({ lang, slug: post.slug, post }))),
      ),
    );
    return perLocale.flat();
  });
}

// A post card enriched with the raw fields JS scoring/filtering needs: `featured`
// (locale doc) + EN-canonical tag refs for overlap + whether it has body copy.
// Shared by related-posts scoring and tag-topic listing.
export type PostCandidate = PostCard & {
  featured: boolean | null;
  tagIds: string[] | null;
  hasBody: boolean;
};
const POST_CANDIDATE = POST_CARD.replace(
  /}\s*$/,
  `,\n  "featured": featured,\n  "tagIds": ${POST_EN}tags[]._ref,\n  "hasBody": count(body) > 0\n}`,
);

// Every post of a locale as a candidate, fetched once (cached) instead of
// re-scanned per page. The scan re-resolves the EN canonical for hidden/tags/
// createdAt on every post, so doing it once per locale — not once per related or
// topic page — is the build's biggest single win. Filter keeps any visible,
// slugged post (body-less ones included); callers narrow with `hasBody`.
export function getPostCandidates(lang = DEFAULT_LOCALE) {
  return cached(`getPostCandidates:${lang}`, () =>
    sanityClient.fetch<PostCandidate[]>(
      `*[_type == "post" && language == $lang && defined(slug.current) && ${POST_VISIBLE}] ${POST_CANDIDATE}`,
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
    const candidates = await getPostCandidates(lang);
    const want = new Set(tagIds);
    const score = (p: PostCandidate) => {
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

