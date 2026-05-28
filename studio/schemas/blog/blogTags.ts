import { defineType } from "sanity";
import { FilterIcon } from "@sanity/icons";
import {
  seoMetaFields,
  standardGroups,
  languageField,
  pageTitleField,
  pageDescriptionField,
  singletonPagePreview,
} from "../shared";

export const blogTags = defineType({
  name: "blog-tags",
  title: "Blog — Topics",
  type: "document",
  icon: FilterIcon,
  __experimental_omnisearch_visibility: false,
  groups: standardGroups,
  fields: [
    pageTitleField({ path: "/blog/topics", initialValue: "Topics" }),
    pageDescriptionField(),
    ...seoMetaFields,
    { ...languageField, group: "meta" },
  ],
  preview: singletonPagePreview("Blog — Topics"),
});
