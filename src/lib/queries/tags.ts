import { sanityClient } from "@lib/sanity";
import type {
  PostCard,
  TagPageData,
  TagWithCount,
  TagWithPosts,
} from "@lib/types";
import {
  ALTERNATES,
  POST_CARD,
  POST_EN,
  POST_HAS_TAG_EN,
  POST_LISTABLE,
  POST_ORDER,
} from "./projections";
import { coalesceLang } from "./coalesceLang";
import { cached } from "./cache";
import { DEFAULT_LOCALE } from "@i18n/config";
import type { LocalizedPath } from "./types";

export function getAllTagPaths() {
  return cached("getAllTagPaths", () =>
    sanityClient.fetch<LocalizedPath[]>(
      `*[_type == "tag" && defined(slug.current) && count(*[_type == "post" && language == ^.language && ${POST_HAS_TAG_EN} && ${POST_LISTABLE}]) > 0]{
        "lang": coalesce(language, "en"),
        "slug": slug.current
      }`,
    ),
  );
}

export function getAllTagsWithCount(lang = DEFAULT_LOCALE) {
  return cached(`getAllTagsWithCount:${lang}`, () =>
    sanityClient.fetch<TagWithCount[]>(
      `*[_type == "tag" && language == $lang]{
        _id, title, description, "slug": slug.current,
        "postCount": count(*[_type == "post" && language == $lang && ${POST_HAS_TAG_EN} && ${POST_LISTABLE}])
      }[postCount > 0] | order(postCount desc)`,
      { lang },
    ),
  );
}

export function getTagPosts(tagSlug: string, lang = DEFAULT_LOCALE) {
  return cached(`getTagPosts:${tagSlug}:${lang}`, async () => {
    // Resolve the topic's EN-canonical tag id from the localized slug, then list
    // posts whose EN tag set includes it — membership follows EN, not the locale doc.
    const enTagId = await sanityClient.fetch<string | null>(
      `*[_type == "tag" && slug.current == $tagSlug && language == $lang][0]{
        "enId": coalesce(*[_type == "translation.metadata" && schemaTypes[0] == "tag" && references(^._id)][0].translations[language == "en"][0].value._ref, _id)
      }.enId`,
      { tagSlug, lang },
    );
    return sanityClient.fetch<PostCard[]>(
      `*[_type == "post" && language == $lang && ${POST_LISTABLE} && $enTagId in ${POST_EN}tags[]._ref] | ${POST_ORDER} ${POST_CARD}`,
      { lang, enTagId },
    );
  });
}

export function getTagBySlug(slug: string, lang = DEFAULT_LOCALE) {
  return cached(`getTagBySlug:${slug}:${lang}`, () =>
    sanityClient.fetch<TagPageData | null>(
      `${coalesceLang("tag", "slug.current == $slug")}{ _id, title, description, "slug": slug.current, metaTitle, metaDescription, downloadHeading, ${ALTERNATES} }`,
      { slug, lang },
    ),
  );
}

export function getTagsWithPostPreview(lang = DEFAULT_LOCALE, minPosts = 5) {
  return cached(`getTagsWithPostPreview:${lang}:${minPosts}`, async () => {
    const sections = await sanityClient.fetch<TagWithPosts[]>(
      `*[_type == "tag" && language == $lang]{
        _id, title, "slug": slug.current,
        "postCount": count(*[_type == "post" && language == $lang && ${POST_HAS_TAG_EN} && ${POST_LISTABLE}]),
        "posts": *[_type == "post" && language == $lang && ${POST_HAS_TAG_EN} && ${POST_LISTABLE}] | ${POST_ORDER} [0...6] ${POST_CARD}
      }[postCount >= $minPosts] | order(postCount desc)`,
      { lang, minPosts },
    );

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
