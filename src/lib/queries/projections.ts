// Shared GROQ projections. Rule: a projection lives here when used in ≥2 query
// files. Single-use shapes stay inline or as private consts inside their query
// file (e.g. TOOL_CARD in tools.ts) — keep this file focused on truly shared
// shapes, not "every projection in the project".

import { LOCALIZED_SLUG } from "@lib/links";

export const BODY = /* groq */ `body[]{
  ...,
  _type == "block" => {
    markDefs[]{
      ...,
      _type == "link" => {
        ...,
        internalLink->{ _type, _id, "slug": ${LOCALIZED_SLUG} },
        siteLink->{ url, kind }
      }
    }
  },
  _type == "image" => {
    ...,
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  _type == "embed" => { ... }
}`;

// Path to a field on the canonical EN post doc. Append a field name
// (e.g. `${POST_EN}mainImage`) to read it regardless of current locale —
// locales inherit, so editing on EN propagates at render time.
export const POST_EN = /* groq */ `*[_type == "translation.metadata" && schemaTypes[0] == "post" && references(^._id)][0]
  .translations[language == "en"][0].value->`;

// Filter: keep docs whose datingApp.hasPage on EN canonical is not false.
export const HAS_PAGE_FILTER = /* groq */ `coalesce(
  *[_type == "translation.metadata" && schemaTypes[0] == "datingApp" && references(^._id)][0]
    .translations[language == "en"][0].value->hasPage,
  hasPage
) != false`;

// Filter: keep posts whose `hidden` on EN canonical is not true.
// Single source of truth — hide a post once on EN and every locale follows.
export const POST_VISIBLE = /* groq */ `coalesce(${POST_EN}hidden, hidden) != true`;

// Filter: a post that belongs in listings — has a slug, has body content, and
// isn't hidden. The shared predicate behind every post/tag listing query.
export const POST_LISTABLE = /* groq */ `defined(slug.current) && count(body) > 0 && ${POST_VISIBLE}`;

// Standard newest-first ordering for post listings. Sorts by the EN canonical's
// editorial createdAt so ES/DE listings match EN order (own, then _createdAt fallback).
export const POST_ORDER = /* groq */ `order(coalesce(${POST_EN}createdAt, createdAt, _createdAt) desc)`;

// Path from an EN tag doc to its current-locale sibling (via translation.metadata).
// Used only inside POST_TAGS to re-localize the EN canonical's tag set.
const TAG_SIB = /* groq */ `*[_type == "translation.metadata" && schemaTypes[0] == "tag" && references(^._id)][0].translations[language == $lang][0].value`;

// Tag chips from the EN canonical post's tag SET (canonical membership + order),
// each re-localized to the current locale. Editing tags on EN propagates to ES/DE.
export const POST_TAGS = /* groq */ `${POST_EN}tags[]->{
  "slug": coalesce(${TAG_SIB}->slug.current, slug.current),
  "title": coalesce(${TAG_SIB}->title, title)
}`;

// Membership predicate: the tag is in the post's EN-canonical tag set. Use INSIDE
// a post subquery nested exactly ONE level in a tag scope (replaces the old
// `references(^._id)`) — ^._id is the tag, ^.^._id reaches it from the metadata
// subquery (à la enRefMatch). So topic membership follows EN, not the locale doc.
export const POST_HAS_TAG_EN = /* groq */ `coalesce(*[_type == "translation.metadata" && schemaTypes[0] == "tag" && references(^.^._id)][0].translations[language == "en"][0].value._ref, ^._id) in ${POST_EN}tags[]._ref`;

export const POST_CARD = /* groq */ `{
  _id, title, summary, "slug": slug.current,
  "mainImage": coalesce(
    ${POST_EN}mainImage{ asset, hotspot, crop },
    mainImage{ asset, hotspot, crop }
  ),
  "readingTime": coalesce(${POST_EN}readingTime, readingTime),
  "createdAt": coalesce(${POST_EN}createdAt, createdAt, _createdAt),
  "tags": ${POST_TAGS}
}`;

// EN-anchored: every call site feeds this an EN testimonial (queries filter
// language=="en"), so identity fields render EN-canonical; only body is
// re-localized to the current locale via the translation.metadata sibling.
export const TESTIMONIAL_CARD = /* groq */ `{
  _id, authorName, source, sourceUrl, rating,
  "avatar": avatar{ "url": asset->url, alt },
  "featured": coalesce(featured, false),
  "body": coalesce(
    *[_type == "translation.metadata" && references(^._id)][0]
      .translations[value->language == $lang][0].value->body,
    body
  )
}`;

// Translation metadata → per-locale slug for hreflang + lang switcher.
// Drop into any non-singleton doc projection; refers to the resolved doc via ^._id.
// `_key` is prefixed (`ien`/`ies`/`ide`) by @sanity/document-internationalization,
// so we read `value->language` to get the bare locale code.
export const ALTERNATES = /* groq */ `"alternates": *[_type == "translation.metadata" && references(^._id)][0].translations[]{
  "lang": value->language,
  "slug": value->slug.current
}`;

// Inner FAQ item projection — question + rich-text answer with link annotations.
// Used both flat (`faq[]`) on tool/post and nested (`faq.items[]`) on home.
export const FAQ_ITEM_BODY = /* groq */ `{
  _key, question, answer[]{
    ...,
    markDefs[]{ ..., _type == "link" => {
      ...,
      internalLink->{ _type, _id, "slug": ${LOCALIZED_SLUG} },
      siteLink->{ url, kind }
    }}
  }
}`;

// Flat FAQ array projection — for schemas that keep `faq` as top-level array (tool, post).
export const FAQ_ITEMS = /* groq */ `faq[] ${FAQ_ITEM_BODY}`;
