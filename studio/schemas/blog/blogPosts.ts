import { defineField, defineType } from "sanity";
import { DocumentsIcon } from "@sanity/icons";
import { seoMetaFields, standardGroups, languageField } from "../shared";

export const blogPosts = defineType({
  name: "blog-posts",
  title: "Blog — All posts",
  type: "document",
  icon: DocumentsIcon,
  __experimental_omnisearch_visibility: false,
  groups: standardGroups,
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      description: "H1 shown on the /blog/posts listing page",
      initialValue: "All Posts",
    }),
    ...seoMetaFields,
    { ...languageField, group: "meta" },
  ],
  preview: {
    select: { title: "title", subtitle: "language" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Blog — All posts",
      subtitle: subtitle?.toUpperCase(),
    }),
  },
});
