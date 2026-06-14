import { defineType } from "sanity";
import { CommentIcon } from "@sanity/icons";
import {
  seoMetaFields,
  standardGroups,
  languageField,
  pageTitleField,
  pageDescriptionField,
  navLabelField,
  downloadHeadingField,
  downloadCtaGroup,
  singletonPagePreview,
} from "./shared";

// Singleton — fixed `_id: "reviews"`, exactly one document per language.
// Backs the `/reviews` page listing all testimonials.
export const reviewsPage = defineType({
  name: "reviewsPage",
  title: "Reviews page",
  type: "document",
  icon: CommentIcon,
  __experimental_omnisearch_visibility: false,
  groups: [...standardGroups, downloadCtaGroup],
  fields: [
    pageTitleField({ path: "/reviews", initialValue: "Reviews" }),
    pageDescriptionField(),
    navLabelField("Reviews"),
    downloadHeadingField(),
    ...seoMetaFields,
    { ...languageField, group: "meta" },
  ],
  preview: singletonPagePreview("Reviews"),
});
