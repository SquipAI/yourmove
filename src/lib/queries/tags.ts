import { sanityClient } from "@lib/sanity";
import type {
  PostCard,
  TagPageData,
  TagWithCount,
  TagWithPosts,
} from "@lib/types";
import { POST_CARD } from "./projections";
import { cached } from "./cache";
import { DEFAULT_LOCALE } from "@i18n/config";

export function getAllTagsWithCount(lang = DEFAULT_LOCALE) {
  return cached(`getAllTagsWithCount:${lang}`, () =>
    sanityClient.fetch<TagWithCount[]>(
      `*[_type == "tag" && language == $lang]{
        _id, title, description, "slug": slug.current,
        "postCount": count(*[_type == "post" && language == $lang && references(^._id) && defined(slug.current) && count(body) > 0 && hidden != true])
      }[postCount > 0] | order(postCount desc)`,
      { lang },
    ),
  );
}

export function getTagPosts(tagSlug: string, lang = DEFAULT_LOCALE) {
  return cached(`getTagPosts:${tagSlug}:${lang}`, () =>
    sanityClient.fetch<PostCard[]>(
      `*[_type == "post" && language == $lang && defined(slug.current) && count(body) > 0 && hidden != true && references(*[_type == "tag" && slug.current == $tagSlug]._id)] | order(coalesce(createdAt, _createdAt) desc) ${POST_CARD}`,
      { tagSlug, lang },
    ),
  );
}

export function getTagBySlug(slug: string, lang = DEFAULT_LOCALE) {
  return cached(`getTagBySlug:${slug}:${lang}`, () =>
    sanityClient.fetch<TagPageData>(
      `coalesce(
        *[_type == "tag" && slug.current == $slug && language == $lang][0],
        *[_type == "tag" && slug.current == $slug && (language == "en" || !defined(language))][0]
      ){ _id, title, "slug": slug.current, metaTitle, metaDescription }`,
      { slug, lang },
    ),
  );
}

export function getTagsWithPostPreview(lang = DEFAULT_LOCALE, minPosts = 5) {
  return cached(`getTagsWithPostPreview:${lang}:${minPosts}`, () =>
    sanityClient.fetch<TagWithPosts[]>(
      `*[_type == "tag" && language == $lang]{
        _id, title, "slug": slug.current,
        "postCount": count(*[_type == "post" && language == $lang && references(^._id) && defined(slug.current) && count(body) > 0 && hidden != true]),
        "posts": *[_type == "post" && language == $lang && references(^._id) && defined(slug.current) && count(body) > 0 && hidden != true] | order(coalesce(createdAt, _createdAt) desc) [0...2] ${POST_CARD}
      }[postCount >= $minPosts] | order(postCount desc)`,
      { lang, minPosts },
    ),
  );
}
