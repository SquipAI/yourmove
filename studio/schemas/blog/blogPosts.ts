import { defineType } from "sanity";
import { DocumentsIcon } from "@sanity/icons";
import {
  seoMetaFields,
  standardGroups,
  languageField,
  pageTitleField,
  pageDescriptionField,
  singletonPagePreview,
} from "../shared";

export const blogPosts = defineType({
  name: "blog-posts",
  title: "Blog — All posts",
  type: "document",
  icon: DocumentsIcon,
  __experimental_omnisearch_visibility: false,
  groups: standardGroups,
  fields: [
    pageTitleField({ path: "/blog/posts", initialValue: "All Posts" }),
    pageDescriptionField(),
    ...seoMetaFields,
    { ...languageField, group: "meta" },
  ],
  preview: singletonPagePreview("Blog — All posts"),
});
