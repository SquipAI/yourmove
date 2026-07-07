import { LINKABLE_TYPES, type TargetType } from "./types";

type LinkableToOptions = {
  exclude?: TargetType[];
  withSiteLink?: boolean;
};

export const linkableTo = ({
  exclude = [],
  withSiteLink = true,
}: LinkableToOptions = {}): { type: string }[] => [
  ...LINKABLE_TYPES.filter((t) => !exclude.includes(t)).map((type) => ({
    type,
  })),
  ...(withSiteLink ? [{ type: "siteLink" }] : []),
];

// GROQ fragment: resolve a referenced doc's slug to its sibling in the current
// $lang, falling back to the ref's own slug. MUST sit inside a `ref->{ ... }`
// projection, where `^._id` resolves to the referenced doc; requires `$lang` in
// the query params. Internal refs store the canonical (usually EN) doc id — see
// project i18n design — so without this hop a localized page emits the
// wrong-locale slug (e.g. /es/blog/{en-slug}, which 404s).
export const LOCALIZED_SLUG = /* groq */ `coalesce(
  *[_type == "translation.metadata" && references(^._id)][0].translations[language == $lang][0].value->slug.current,
  slug.current
)`;

// GROQ fragment to flatten any reference field into a uniform shape.
// Pass the ref field name; insert inside an existing projection.
// Returns: { targetType, targetSlug, externalUrl }
export const linkTargetFields = (ref: string) => `
  "targetType": ${ref}->_type,
  "targetSlug": ${ref}->{ "v": ${LOCALIZED_SLUG} }.v,
  "externalUrl": select(${ref}->_type == "siteLink" => ${ref}->url)
`;
