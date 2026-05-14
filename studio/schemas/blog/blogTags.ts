import { defineField, defineType } from "sanity";
import { FilterIcon } from "@sanity/icons";
import { seoMetaFields, standardGroups, languageField } from "../shared";

export const blogTags = defineType({
  name: "blog-tags",
  title: "Blog — Topics",
  type: "document",
  icon: FilterIcon,
  __experimental_omnisearch_visibility: false,
  groups: standardGroups,
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      description: "H1 shown on the /blog/tags listing page",
      initialValue: "Topics",
    }),
    ...seoMetaFields,
    { ...languageField, group: "meta" },
  ],
  preview: {
    select: { title: "title", subtitle: "language" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Blog — Topics",
      subtitle: subtitle?.toUpperCase(),
    }),
  },
});
