import { defineField, defineType } from "sanity";
import { InfoOutlineIcon } from "@sanity/icons";
import { metaFields, standardGroups } from "./shared";

// Promotional component embedded inline in posts via the "Internal document"
// embed type. Has no public route — `slug` and SEO fields are intentionally
// omitted; pickable only through `embed.doc`.
export const howToUse = defineType({
  name: "howToUse",
  title: "How to Use",
  type: "document",
  icon: InfoOutlineIcon,
  __experimental_omnisearch_visibility: false,
  groups: standardGroups,
  fields: [
    defineField({
      name: "title",
      title: "Title *",
      type: "string",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "headline",
      type: "string",
      group: "content",
      description: "Visible headline / question shown above the screenshot",
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      group: "content",
    }),
    defineField({
      name: "screenshot",
      type: "image",
      group: "content",
      fields: [defineField({ name: "alt", type: "string", title: "Alt text" })],
    }),
    defineField({
      name: "buttonText",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "link",
      type: "url",
      group: "content",
    }),
    ...metaFields,
  ],
  preview: {
    select: { title: "title", subtitle: "language", media: "screenshot" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle?.toUpperCase(),
      media,
    }),
  },
});
