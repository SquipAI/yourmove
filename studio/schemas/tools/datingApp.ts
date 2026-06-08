import { defineField, defineType } from "sanity";
import { HeartFilledIcon, EditIcon, SearchIcon } from "@sanity/icons";
import {
  languageField,
  seoMetaFields,
  pageTitleField,
  pageDescriptionField,
  slugField,
  hiddenOnNonEn,
} from "../shared";

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
      title: "Name *",
      type: "string",
      description: "Short brand name shown in pills/cards (e.g. Tinder)",
      group: "content",
      validation: (r) => r.required(),
    }),
    pageTitleField({ path: "/tools/{slug}" }),
    pageDescriptionField(),
    defineField({
      name: "brandColor",
      type: "string",
      group: "content",
      description:
        "Hex or CSS color used as the avatar background (e.g. #FF5864)",
      hidden: hiddenOnNonEn,
      validation: (r) =>
        r.custom((val) => {
          if (!val) return true;
          if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) return true;
          return "Enter a hex color like #FF5864 or #FA5";
        }),
    }),
    defineField({
      name: "logo",
      type: "image",
      group: "content",
      description:
        "Wordmark logo (SVG preferred) for the home page compatibility row",
      hidden: hiddenOnNonEn,
      options: { accept: "image/svg+xml,image/png,image/avif,image/webp" },
    }),
    defineField({
      name: "hasPage",
      type: "boolean",
      group: "content",
      description:
        "Generate /tools/{slug} and include in Browse-by-app. Edit on EN; locale variants follow.",
      initialValue: true,
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "order",
      type: "number",
      group: "content",
      description:
        "Lower numbers (1, 2, 3…) appear first. Leave empty or 0 to let the app sort alphabetically at the end.",
      hidden: hiddenOnNonEn,
    }),
    slugField({ source: "name" }),
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
