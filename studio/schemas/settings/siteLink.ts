import { defineField, defineType } from "sanity";
import { LinkIcon } from "@sanity/icons";
import { translatedField } from "../shared";

export const siteLink = defineType({
  name: "siteLink",
  title: "Site Link",
  icon: LinkIcon,
  type: "document",
  __experimental_omnisearch_visibility: false,
  description:
    "Reusable destination URL (own subdomain, app stores, partner sites). Pick from the link picker in body content instead of typing the URL each time.",
  fields: [
    translatedField("title", "Title", { required: "default" }),
    defineField({
      name: "url",
      type: "url",
      validation: (r) =>
        r.required().uri({ scheme: ["http", "https", "mailto", "tel"] }),
    }),
  ],
  preview: {
    select: { title: "title.en", subtitle: "url" },
  },
});
