import { defineField, defineType } from "sanity";
import { ControlsIcon } from "@sanity/icons";
import { seoMetaFields, standardGroups, languageField } from "./shared";

// Singleton — fixed `_id: "tools"`, exactly one document per language.
// Backs the `/tools` index route.
export const tools = defineType({
  name: "tools",
  title: "Tools index",
  type: "document",
  icon: ControlsIcon,
  __experimental_omnisearch_visibility: false,
  groups: standardGroups,
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      description:
        'Heading shown on the tools index page. Wrap an accent phrase in *asterisks* to color it (e.g. "Every AI tool, in *one place.*").',
      initialValue: "Tools",
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      group: "content",
      description: "Short paragraph below the heading (optional)",
    }),
    ...seoMetaFields,
    { ...languageField, group: "meta" },
  ],
  preview: {
    select: { title: "title", subtitle: "language" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Tools",
      subtitle: subtitle?.toUpperCase(),
    }),
  },
});
