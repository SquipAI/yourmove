import { defineField, defineType } from "sanity";
import { LinkIcon } from "@sanity/icons";

export const siteLink = defineType({
  name: "siteLink",
  title: "Site Link",
  icon: LinkIcon,
  type: "document",
  __experimental_omnisearch_visibility: false,
  description:
    "Reusable destination URL (own subdomain, app stores, partner sites). Pick from the link picker in body content instead of typing the URL each time.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description:
        "Shown only in Studio for picking — not rendered on the site",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      type: "url",
      validation: (r) =>
        r.required().uri({ scheme: ["http", "https", "mailto", "tel"] }),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "url" },
  },
});
