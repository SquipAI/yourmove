import { sanityClient } from "@lib/sanity";
import type {
  Testimonial,
  TestimonialBuckets,
  ReviewsPageData,
} from "@lib/types";
import { coalesceLang } from "./coalesceLang";
import { TESTIMONIAL_CARD } from "./projections";
import { cached } from "./cache";
import { DEFAULT_LOCALE } from "@i18n/config";

export const TESTIMONIALS_TOOL_COUNT = 6;

// Stable sort: featured first, then order asc, then _id as tiebreaker.
const TESTIMONIAL_ORDER = "order(featured desc, coalesce(order, 0) asc, _id asc)";

export function getReviewsPage(lang = DEFAULT_LOCALE) {
  return cached(`getReviewsPage:${lang}`, () =>
    sanityClient.fetch<ReviewsPageData | null>(
      `${coalesceLang("reviewsPage")}{ title, description, metaTitle, metaDescription }`,
      { lang },
    ),
  );
}

export function getAllTestimonials(lang = DEFAULT_LOCALE) {
  return cached(`getAllTestimonials:${lang}`, () =>
    sanityClient.fetch<Testimonial[]>(
      `*[_type == "testimonial" && language == $lang] | ${TESTIMONIAL_ORDER} ${TESTIMONIAL_CARD}`,
      { lang },
    ),
  );
}

// Per-tool testimonials. `specific` = testimonials whose tools[] references
// this tool (the only ones eligible for review/rating schema — see schema.ts).
// `display` pads specific with generic (untagged) ones up to N so the section
// never looks empty, but generic ones must NOT drive the tool's aggregateRating.
export async function getTestimonialsForTool(
  toolId: string,
  lang = DEFAULT_LOCALE,
  n = TESTIMONIALS_TOOL_COUNT,
) {
  return cached(`getTestimonialsForTool:${toolId}:${lang}:${n}`, async () => {
    const { specific, generic } = await sanityClient.fetch<TestimonialBuckets>(
      `{
        "specific": *[_type == "testimonial" && language == $lang && references($toolId)] | ${TESTIMONIAL_ORDER} [0...$n] ${TESTIMONIAL_CARD},
        "generic": *[_type == "testimonial" && language == $lang && count(coalesce(tools, [])) == 0] | ${TESTIMONIAL_ORDER} [0...$n] ${TESTIMONIAL_CARD}
      }`,
      { lang, toolId, n },
    );
    const display =
      specific.length >= n
        ? specific
        : [...specific, ...generic.slice(0, n - specific.length)];
    return { display, specific };
  });
}
