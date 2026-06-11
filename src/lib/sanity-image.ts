import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import { sanityClient } from "./sanity";

// Builds Sanity CDN URLs with crop/resize/focal-point params.
// Use for images where display ratio differs from upload ratio — Sanity does
// the crop server-side, Sharp only resizes the already-cropped result.
//
// Example: urlFor(post.mainImage).width(400).height(225).fit("crop").url()
//   → https://cdn.sanity.io/.../...jpg?w=400&h=225&fit=crop
//   (adds focalpoint params automatically when the image has a hotspot set)
const builder = createImageUrlBuilder(sanityClient);
export const urlFor = (source: SanityImageSource) => builder.image(source);
