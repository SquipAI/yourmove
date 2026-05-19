import { defineField, defineType } from "sanity";
import { ControlsIcon } from "@sanity/icons";
import { metaFields, seoFields, standardGroups } from "./shared";

export const tool = defineType({
  name: "tool",
  title: "Tools",
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
      type: "string",
      group: "content",
      validation: (r) =>
        r.custom((val) => {
          if (!val) return true;
          if (val.startsWith("/")) return true;
          try { new URL(val); return true; } catch { return "Enter a relative path (/page) or full URL"; }
        }),
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
