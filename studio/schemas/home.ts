import { defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons";
import { seoMetaFields, standardGroups, languageField } from "./shared";

// Singleton — fixed `_id: "home"`, exactly one document. Enforced in
// sanity.config.ts via custom structure + template filter. Routable at `/`.
// Currently holds only SEO meta; will be extended with hero/sections later.
export const home = defineType({
  name: "home",
  title: "Home page",
  type: "document",
  icon: HomeIcon,
  __experimental_omnisearch_visibility: false,
  groups: standardGroups,
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      initialValue: "Home",
      validation: (r) => r.required(),
    }),
    ...seoMetaFields,
    { ...languageField, group: "meta" },
  ],
  preview: {
    select: { title: "title", subtitle: "language" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Home",
      subtitle: subtitle?.toUpperCase(),
    }),
  },
});
