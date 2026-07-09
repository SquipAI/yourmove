import { sanityClient } from "@lib/sanity";
import type {
  PostCard,
  TagPageData,
  TagWithCount,
  TagWithPosts,
} from "@lib/types";
import { ALTERNATES } from "./projections";
import { getAllPosts, postHasBody, toPostCard, type LocalePost } from "./posts";
import { cached } from "./cache";
import { DEFAULT_LOCALE, LOCALES } from "@i18n/config";
import type { LocalizedPath } from "./types";

// A tag's EN-canonical id — topic membership follows EN, so counts and listings
// match the post's EN tag set regardless of the current-locale tag doc.
const TAG_EN_ID = /* groq */ `coalesce(*[_type == "translation.metadata" && schemaTypes[0] == "tag" && references(^._id)][0].translations[language == "en"][0].value._ref, _id)`;

export type LocaleTag = TagPageData & { enId: string };

// The single cached tag dataset per locale: full tag docs + their EN id. Feeds
// tag pages and every count/preview/path — all pure JS over this + getAllPosts.
export function getTags(lang = DEFAULT_LOCALE) {
  return cached(`getTags:${lang}`, () =>
    sanityClient.fetch<LocaleTag[]>(
      `*[_type == "tag" && language == $lang]{
        _id, "enId": ${TAG_EN_ID}, title, description, "slug": slug.current,
        metaTitle, metaDescription, downloadHeading, ${ALTERNATES}
      }`,
      { lang },
    ),
  );
}

const hasTag = (p: LocalePost, enId: string) => p.tagIds?.includes(enId) ?? false;

export function getTagBySlug(slug: string, lang = DEFAULT_LOCALE) {
  return cached(`getTagBySlug:${slug}:${lang}`, async () => {
    const tag = (await getTags(lang)).find((t) => t.slug === slug);
    return tag ?? null;
  });
}

export function getTagPosts(tagSlug: string, lang = DEFAULT_LOCALE) {
  return cached(`getTagPosts:${tagSlug}:${lang}`, async () => {
    // Resolve the topic's EN-canonical id from the localized slug (membership
    // follows EN), then filter the newest-first post set in JS — same shared
    // dataset as related/listings, so no per-topic collection scan.
    const tag = (await getTags(lang)).find((t) => t.slug === tagSlug);
    if (!tag) return [];
    return (await getAllPosts(lang))
      .filter((p) => postHasBody(p) && hasTag(p, tag.enId))
      .map(toPostCard);
  });
}

export function getAllTagsWithCount(lang = DEFAULT_LOCALE) {
  return cached(`getAllTagsWithCount:${lang}`, async () => {
    const tags = await getTags(lang);
    const listable = (await getAllPosts(lang)).filter(postHasBody);
    return tags
      .map(
        (tag): TagWithCount => ({
          _id: tag._id,
          title: tag.title,
          description: tag.description,
          slug: tag.slug,
          postCount: listable.filter((p) => hasTag(p, tag.enId)).length,
        }),
      )
      .filter((t) => t.postCount > 0)
      .sort((a, b) => b.postCount - a.postCount);
  });
}

export function getTagsWithPostPreview(lang = DEFAULT_LOCALE, minPosts = 5) {
  return cached(`getTagsWithPostPreview:${lang}:${minPosts}`, async () => {
    const tags = await getTags(lang);
    const listable = (await getAllPosts(lang)).filter(postHasBody);
    const sections: TagWithPosts[] = tags
      .map((tag) => {
        const tagPosts = listable.filter((p) => hasTag(p, tag.enId));
        return {
          _id: tag._id,
          slug: tag.slug,
          title: tag.title,
          description: tag.description,
          postCount: tagPosts.length,
          posts: tagPosts.slice(0, 6).map(toPostCard),
        };
      })
      .filter((s) => s.postCount >= minPosts)
      .sort((a, b) => b.postCount - a.postCount);

    // Each post appears in only one section: smaller topics claim shared posts
    // first (fewer to fill), bigger topics backfill from their larger pool.
    const seen = new Set<string>();
    const claimed = new Map<string, PostCard[]>();
    for (const s of [...sections].sort((a, b) => a.postCount - b.postCount)) {
      const posts = s.posts.filter((p) => !seen.has(p._id)).slice(0, 2);
      posts.forEach((p) => seen.add(p._id));
      claimed.set(s._id, posts);
    }
    return sections
      .map((s) => ({ ...s, posts: claimed.get(s._id)! }))
      .filter((s) => s.posts.length > 0);
  });
}

export function getAllTagPaths() {
  return cached("getAllTagPaths", async () => {
    const perLocale = await Promise.all(
      LOCALES.map(async (lang) => {
        const tags = await getTags(lang);
        const listable = (await getAllPosts(lang)).filter(postHasBody);
        return tags
          .filter((tag) => tag.slug && listable.some((p) => hasTag(p, tag.enId)))
          .map((tag) => ({ lang, slug: tag.slug }) satisfies LocalizedPath);
      }),
    );
    return perLocale.flat();
  });
}
