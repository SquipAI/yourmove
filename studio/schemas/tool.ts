import { defineField, defineType } from "sanity";
import { ControlsIcon } from "@sanity/icons";
import { metaFields, seoFields, standardGroups } from "./shared";

export const tool = defineType({
  name: "tool",
  title: "Tool",
  icon: ControlsIcon,
  type: "document",
  groups: standardGroups,
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      options: { search: { weight: 10 } },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      group: "content",
      options: { search: { weight: 5 } },
    }),
    defineField({
      name: "link",
      type: "url",
      group: "content",
    }),
    ...seoFields,
    ...metaFields,
    defineField({
      name: "tag",
      type: "string",
      group: "meta",
    }),
    defineField({
      name: "paid",
      type: "boolean",
      group: "meta",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "language" },
    prepare: ({ title, subtitle }) => ({
      title,
      subtitle: subtitle?.toUpperCase(),
    }),
  },
});
