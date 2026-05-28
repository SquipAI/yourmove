// Shared GROQ projections. Rule: a projection lives here when used in ≥2 query
// files. Single-use shapes stay inline or as private consts inside their query
// file (e.g. TOOL_CARD in tools.ts) — keep this file focused on truly shared
// shapes, not "every projection in the project".

export const BODY = /* groq */ `body[]{
  ...,
  _type == "block" => {
    markDefs[]{
      ...,
      _type == "link" => {
        ...,
        internalLink->{ _type, _id, "slug": slug.current },
        siteLink->{ url, kind }
      }
    }
  },
  _type == "image" => {
    ...,
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  }
}`;

export const POST_CARD = /* groq */ `{
  _id, title, summary, "slug": slug.current,
  "mainImage": mainImage{ "url": asset->url, alt },
  readingTime,
  "createdAt": coalesce(createdAt, _createdAt),
  "tags": tags[]->{ "slug": slug.current, title }
}`;

export const TESTIMONIAL_CARD = /* groq */ `{
  _id, authorName, body, source, sourceUrl, rating,
  "avatar": avatar{ "url": asset->url, alt },
  "featured": coalesce(featured, false)
}`;

// Translation metadata → per-locale slug for hreflang + lang switcher.
// Drop into any non-singleton doc projection; refers to the resolved doc via ^._id.
// `_key` is prefixed (`ien`/`ies`/`ide`) by @sanity/document-internationalization,
// so we read `value->language` to get the bare locale code.
export const ALTERNATES = /* groq */ `"alternates": *[_type == "translation.metadata" && references(^._id)][0].translations[]{
  "lang": value->language,
  "slug": value->slug.current
}`;

// Resolves hasPage from EN canonical so locales inherit EN's value.
export const HAS_PAGE_FILTER = /* groq */ `coalesce(
  *[_type == "translation.metadata" && schemaTypes[0] == "datingApp" && references(^._id)][0]
    .translations[language == "en"][0].value->hasPage,
  hasPage
) != false`;

// Post visibility resolved from the EN canonical, so locales inherit EN's `hidden`
// (single source of truth — hide a post once on EN and every locale follows).
// Drop into any post filter; refers to the resolved post via ^._id.
export const POST_VISIBLE = /* groq */ `coalesce(
  *[_type == "translation.metadata" && schemaTypes[0] == "post" && references(^._id)][0]
    .translations[language == "en"][0].value->hidden,
  hidden
) != true`;

// Label per-locale (EN fallback); apps list always from EN home so curation propagates.
export const COMPATIBILITY = /* groq */ `"compatibility": {
  "label": coalesce(compatibility.label, *[_id == "home"][0].compatibility.label),
  "apps": *[_id == "home"][0].compatibility.apps[]->{
    _id, name,
    "logoUrl": logo.asset->url
  }
}`;

// Inner FAQ item projection — question + rich-text answer with link annotations.
// Used both flat (`faq[]`) on tool/post and nested (`faq.items[]`) on home.
export const FAQ_ITEM_BODY = /* groq */ `{
  _key, question, answer[]{
    ...,
    markDefs[]{ ..., _type == "link" => {
      ...,
      internalLink->{ _type, _id, "slug": slug.current },
      siteLink->{ url, kind }
    }}
  }
}`;

// Flat FAQ array projection — for schemas that keep `faq` as top-level array (tool, post).
export const FAQ_ITEMS = /* groq */ `faq[] ${FAQ_ITEM_BODY}`;
