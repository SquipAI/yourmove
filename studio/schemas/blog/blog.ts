import { defineType } from "sanity";
import { BookIcon } from "@sanity/icons";
import {
  seoMetaFields,
  standardGroups,
  languageField,
  pageTitleField,
  pageDescriptionField,
  navLabelField,
  singletonPagePreview,
} from "../shared";

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
    pageTitleField({ path: "/blog", initialValue: "Blog" }),
    pageDescriptionField(),
    navLabelField("Blog"),
    ...seoMetaFields,
    { ...languageField, group: "meta" },
  ],
  preview: singletonPagePreview("Blog"),
});
