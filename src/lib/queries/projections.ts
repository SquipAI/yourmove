export const BODY = /* groq */ `body[]{
  ...,
  _type == "block" => {
    markDefs[]{
      ...,
      _type == "link" => {
        ...,
        internalLink->{ _type, _id, "slug": slug.current },
        siteLink->{ url, openInNewTab, kind }
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
  "tags": tags[]->{ "slug": slug.current, title }
}`;
