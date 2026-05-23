import { defineField, defineType } from "sanity";
import { TagIcon, EditIcon } from "@sanity/icons";
import { languageField } from "./shared";

export const toolCategory = defineType({
  name: "toolCategory",
  title: "Tool Category",
  type: "document",
  icon: TagIcon,
  __experimental_omnisearch_visibility: false,
  groups: [
    { name: "content", title: "Content", default: true, icon: EditIcon },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 2,
      group: "content",
    }),
    defineField({
      name: "order",
      type: "number",
      group: "content",
      description: "Lower numbers appear first on /tools",
      initialValue: 0,
    }),
    languageField,
  ],
  preview: {
    select: { title: "title", subtitle: "language" },
    prepare: ({ title, subtitle }) => ({
      title,
      subtitle: subtitle?.toUpperCase(),
    }),
  },
});
