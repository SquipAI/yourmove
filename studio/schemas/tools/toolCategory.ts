import { defineField, defineType } from "sanity";
import { TagIcon, EditIcon } from "@sanity/icons";
import { languageField, hiddenOnNonEn } from "../shared";

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
      title: "Title *",
      type: "string",
      group: "content",
      description: "Category name shown as a section heading on /tools",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 2,
      group: "content",
      description: "Short subtitle shown under the section heading",
    }),
    defineField({
      name: "order",
      type: "number",
      group: "content",
      description:
        "Lower numbers (1, 2, 3…) appear first. Leave empty or 0 to let the category sort alphabetically at the end.",
      hidden: hiddenOnNonEn,
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
