import { sanityClient } from "@lib/sanity";
import type { Post, PostCard } from "@lib/types";
import {
  ALTERNATES,
  BODY,
  POST_EN,
  FAQ_ITEMS,
  POST_VISIBLE,
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

// The single cached post dataset per locale: every visible, slugged post with
// the full page projection plus the raw flags listings/scoring need, sorted
// newest-first (POST_ORDER) so slice-based selectors need no re-sort. This is
// the one source of truth behind post pages AND every post/tag listing — all of
// which are pure JS selectors over it, so there is no per-view collection scan.
export type LocalePost = Post & {
  slug: string;
  featured: boolean | null; // locale-doc flag — related scoring
  featuredEn: boolean | null; // EN-inherited flag — Featured listings
};

export function getAllPosts(lang = DEFAULT_LOCALE) {
  return cached(`getAllPosts:${lang}`, () =>
    sanityClient.fetch<LocalePost[]>(
      `*[_type == "post" && language == $lang && defined(slug.current) && ${POST_VISIBLE}] | ${POST_ORDER} {
        _id, title, summary, metaTitle, metaDescription, language,
        "slug": slug.current,
        "createdAt": coalesce(${POST_EN}createdAt, createdAt, _createdAt), _updatedAt,
        "readingTime": coalesce(${POST_EN}readingTime, readingTime),
        "featured": featured,
        "featuredEn": coalesce(${POST_EN}featured, featured),
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
    ),
  );
}

// A post has renderable body copy (mirrors POST_LISTABLE's count(body) > 0).
export const postHasBody = (p: LocalePost) => (p.body?.length ?? 0) > 0;

// Narrow the full record to the card shape listings render.
export const toPostCard = (p: LocalePost): PostCard => ({
  _id: p._id,
  title: p.title,
  summary: p.summary,
  slug: p.slug,
  mainImage: p.mainImage,
  readingTime: p.readingTime,
  createdAt: p.createdAt,
  tags: p.tags,
});

// Post pages get their full body via getStaticPaths props — one batch per locale
// instead of a point lookup per page. `hasBody` gates out body-less drafts,
// matching the old getAllPostPaths/POST_LISTABLE selection (validated 1:1).
export async function getAllPostsForBuild() {
  const perLocale = await Promise.all(
    LOCALES.map(async (lang) =>
      (await getAllPosts(lang))
        .filter(postHasBody)
        .map((post) => ({ lang, slug: post.slug, post })),
    ),
  );
  return perLocale.flat();
}

export function getAllPublishedPosts(lang = DEFAULT_LOCALE) {
  return cached(`getAllPublishedPosts:${lang}`, async () =>
    (await getAllPosts(lang)).filter(postHasBody).map(toPostCard),
  );
}

export function getLatestPosts(n: number, lang = DEFAULT_LOCALE) {
  return cached(`getLatestPosts:${n}:${lang}`, async () =>
    (await getAllPosts(lang)).filter(postHasBody).slice(0, n).map(toPostCard),
  );
}

export function getFeaturedPosts(n: number, lang = DEFAULT_LOCALE) {
  // `featuredEn` is the EN-canonical flag; locales inherit it, so ES/DE (whose
  // siblings are all featured=false) still surface the same Featured block.
  return cached(`getFeaturedPosts:${n}:${lang}`, async () =>
    (await getAllPosts(lang))
      .filter((p) => postHasBody(p) && p.featuredEn === true)
      .slice(0, n)
      .map(toPostCard),
  );
}

export function getPostCount(lang = DEFAULT_LOCALE) {
  return cached(`getPostCount:${lang}`, async () =>
    (await getAllPosts(lang)).filter(postHasBody).length,
  );
}

export function getRelatedPosts(
  postId: string,
  tagIds: string[],
  lang = DEFAULT_LOCALE,
  n = RELATED_POSTS_COUNT,
) {
  return cached(`getRelatedPosts:${postId}:${lang}`, async () => {
    // Score over the newest-first set: featured+tag-overlap=3, featured=2,
    // overlap=1, else 0; ties broken by createdAt desc — matching the old
    // order(score desc, createdAt desc).
    const posts = await getAllPosts(lang);
    const want = new Set(tagIds);
    const score = (p: LocalePost) => {
      const overlap = p.tagIds?.some((t) => want.has(t)) ?? false;
      if (p.featured === true) return overlap ? 3 : 2;
      return overlap ? 1 : 0;
    };
    return posts
      .filter((p) => p._id !== postId)
      .map((p) => ({ p, s: score(p) }))
      .sort(
        (a, b) =>
          b.s - a.s ||
          (a.p.createdAt < b.p.createdAt ? 1 : a.p.createdAt > b.p.createdAt ? -1 : 0),
      )
      .slice(0, n)
      .map((x) => toPostCard(x.p));
  });
}
