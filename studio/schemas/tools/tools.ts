import { defineType } from "sanity";
import { ControlsIcon } from "@sanity/icons";
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
} from "../shared";

// Singleton — fixed `_id: "tools"`, exactly one document per language.
// Backs the `/tools` index route.
export const tools = defineType({
  name: "tools",
  title: "Tools index",
  type: "document",
  icon: ControlsIcon,
  __experimental_omnisearch_visibility: false,
  groups: [...standardGroups, downloadCtaGroup],
  fields: [
    pageTitleField({ path: "/tools", initialValue: "Tools" }),
    pageDescriptionField(),
    navLabelField("Tools"),
    downloadHeadingField(),
    ...seoMetaFields,
    { ...languageField, group: "meta" },
  ],
  preview: singletonPagePreview("Tools"),
});
