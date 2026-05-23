import { defineField, defineType } from "sanity";
import { HeartFilledIcon, EditIcon, SearchIcon } from "@sanity/icons";
import { languageField, seoMetaFields } from "./shared";

export const datingApp = defineType({
  name: "datingApp",
  title: "Dating App",
  type: "document",
  icon: HeartFilledIcon,
  __experimental_omnisearch_visibility: false,
  groups: [
    { name: "content", title: "Content", default: true, icon: EditIcon },
    { name: "seo", title: "SEO", icon: SearchIcon },
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      description: "Short brand name shown in pills/cards (e.g. Tinder)",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      description: "Page heading (H1) for /tools/[slug]",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      group: "content",
      description: "Intro paragraph under the page heading",
    }),
    defineField({
      name: "brandColor",
      type: "string",
      group: "content",
      description:
        "Hex or CSS color used as the avatar background (e.g. #FF5864)",
      validation: (r) =>
        r.custom((val) => {
          if (!val) return true;
          if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) return true;
          return "Enter a hex color like #FF5864 or #FA5";
        }),
    }),
    defineField({
      name: "order",
      type: "number",
      group: "content",
      description: "Lower numbers appear first",
      initialValue: 0,
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "seo",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    ...seoMetaFields,
    languageField,
  ],
  preview: {
    select: { title: "name", subtitle: "language" },
    prepare: ({ title, subtitle }) => ({
      title,
      subtitle: subtitle?.toUpperCase(),
    }),
  },
});
