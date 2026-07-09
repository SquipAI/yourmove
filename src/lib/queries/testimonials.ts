import { sanityClient } from "@lib/sanity";
import type { Testimonial, ReviewsPageData } from "@lib/types";
import { coalesceLang } from "./coalesceLang";
import { TESTIMONIAL_CARD } from "./projections";
import { cached } from "./cache";
import { DEFAULT_LOCALE } from "@i18n/config";

export const TESTIMONIALS_TOOL_COUNT = 5;

// Stable sort: featured first, then order asc, then _id as tiebreaker.
const TESTIMONIAL_ORDER =
  "order(featured desc, coalesce(order, 0) asc, _id asc)";

export function getReviewsPage(lang = DEFAULT_LOCALE) {
  return cached(`getReviewsPage:${lang}`, () =>
    sanityClient.fetch<ReviewsPageData | null>(
      `${coalesceLang("reviewsPage")}{ title, description, metaTitle, metaDescription, downloadHeading }`,
      { lang },
    ),
  );
}

// The single cached testimonial dataset per locale: every EN testimonial (bodies
// localized to `lang`) plus the tool refs the per-tool buckets need. One source
// of truth behind the reviews page, home reviews, and per-tool testimonials.
type TestimonialWithTools = Testimonial & { toolIds: string[] | null };
const TESTIMONIAL_CARD_WITH_TOOLS = TESTIMONIAL_CARD.replace(
  /}\s*$/,
  `, "toolIds": tools[]._ref }`,
);

export function getAllTestimonials(lang = DEFAULT_LOCALE) {
  return cached(`getAllTestimonials:${lang}`, () =>
    sanityClient.fetch<TestimonialWithTools[]>(
      `*[_type == "testimonial" && language == "en"] | ${TESTIMONIAL_ORDER} ${TESTIMONIAL_CARD_WITH_TOOLS}`,
      { lang },
    ),
  );
}

// Per-tool testimonials, derived in JS from the cached set (no per-tool fetch).
// `specific` = testimonials whose tools[] references this tool (the only ones
// eligible for review/rating schema — see schema.ts). `display` pads specific
// with generic (untagged) ones up to N so the section never looks empty, but
// generic ones must NOT drive the tool's aggregateRating. The set is pre-sorted
// by TESTIMONIAL_ORDER, so filter+slice mirrors the old `[0...n]`.
export function getTestimonialsForTool(
  toolId: string,
  lang = DEFAULT_LOCALE,
  n = TESTIMONIALS_TOOL_COUNT,
) {
  return cached(`getTestimonialsForTool:${toolId}:${lang}:${n}`, async () => {
    const all = await getAllTestimonials(lang);
    const specific = all
      .filter((t) => t.toolIds?.includes(toolId) ?? false)
      .slice(0, n);
    const generic = all
      .filter((t) => (t.toolIds?.length ?? 0) === 0)
      .slice(0, n);
    const display =
      specific.length >= n
        ? specific
        : [...specific, ...generic.slice(0, n - specific.length)];
    return { display, specific };
  });
}
