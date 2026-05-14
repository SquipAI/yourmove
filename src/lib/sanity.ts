import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: "jdxzhhce",
  dataset: "production",
  apiVersion: "2026-05-07",
  useCdn: false,
  token: import.meta.env.SANITY_WRITE_TOKEN,
  perspective: "published",
});
