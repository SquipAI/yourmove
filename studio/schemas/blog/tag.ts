import { defineType } from "sanity";
import { TagIcon, EditIcon, SearchIcon } from "@sanity/icons";
import {
  languageField,
  seoFields,
  pageTitleField,
  pageDescriptionField,
  singletonPagePreview,
} from "../shared";

export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  icon: TagIcon,
  __experimental_omnisearch_visibility: false,
  groups: [
    { name: "content", title: "Content", default: true, icon: EditIcon },
    { name: "seo", title: "SEO", icon: SearchIcon },
  ],
  fields: [
    pageTitleField({ path: "/blog/topics/{slug}" }),
    pageDescriptionField(),
    ...seoFields,
    languageField,
  ],
  preview: singletonPagePreview(),
});
