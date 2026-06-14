import { defineType } from "sanity";
import { TagIcon } from "@sanity/icons";
import {
  standardGroups,
  languageField,
  seoFields,
  pageTitleField,
  pageDescriptionField,
  downloadHeadingField,
  downloadCtaGroup,
  singletonPagePreview,
} from "../shared";

export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  icon: TagIcon,
  __experimental_omnisearch_visibility: false,
  groups: [...standardGroups, downloadCtaGroup],
  fields: [
    pageTitleField({ path: "/blog/topics/{slug}" }),
    pageDescriptionField(),
    downloadHeadingField(),
    ...seoFields,
    { ...languageField, group: "meta" },
  ],
  preview: singletonPagePreview(),
});
