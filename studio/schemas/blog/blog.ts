import { defineField, defineType } from "sanity";
import { BookIcon } from "@sanity/icons";
import { seoMetaFields, standardGroups, languageField } from "../shared";

// Singleton — fixed `_id: "blog"`, exactly one document. Backs the `/blog`
// index route. Editor-facing label only; will grow with intro/feature blocks
// and tag-rail config later.
export const blog = defineType({
  name: "blog",
  title: "Blog index",
  type: "document",
  icon: BookIcon,
  __experimental_omnisearch_visibility: false,
  groups: standardGroups,
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      description: "Heading shown on the blog index page",
      initialValue: "Blog",
    }),
    defineField({
      name: "intro",
      type: "text",
      rows: 3,
      group: "content",
      description: "Short paragraph below the heading (optional)",
    }),
    ...seoMetaFields,
    { ...languageField, group: "meta" },
  ],
  preview: {
    select: { title: "title", subtitle: "language" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Blog",
      subtitle: subtitle?.toUpperCase(),
    }),
  },
});
