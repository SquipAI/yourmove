import { defineField, defineType } from "sanity";
import { CommentIcon, EditIcon, CogIcon } from "@sanity/icons";
import { languageField, hiddenOnNonEn } from "./shared";

const SOURCE_OPTIONS = [
  { title: "Web", value: "web" },
  { title: "Reddit", value: "reddit" },
  { title: "App Store", value: "appStore" },
  { title: "Product Hunt", value: "productHunt" },
];

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  icon: CommentIcon,
  __experimental_omnisearch_visibility: false,
  groups: [
    { name: "content", title: "Content", default: true, icon: EditIcon },
    { name: "meta", title: "Meta", icon: CogIcon },
  ],
  fields: [
    defineField({
      name: "authorName",
      title: "Author Name *",
      type: "string",
      group: "content",
      description: "For Reddit reviews include the `u/` prefix.",
      hidden: hiddenOnNonEn,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "avatar",
      type: "image",
      group: "content",
      description: "Leave empty to render initials on a neutral background.",
      hidden: hiddenOnNonEn,
      options: { hotspot: false },
    }),
    defineField({
      name: "source",
      title: "Source *",
      type: "string",
      group: "content",
      options: { list: SOURCE_OPTIONS, layout: "radio", direction: "horizontal" },
      initialValue: "web",
      hidden: hiddenOnNonEn,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sourceUrl",
      type: "url",
      group: "content",
      description: "Optional. Link to the original review (Reddit thread, App Store, etc.).",
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "body",
      title: "Body *",
      type: "text",
      rows: 5,
      group: "content",
      description: "Wrap a phrase in *asterisks* to highlight it.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "rating",
      type: "number",
      group: "content",
      description: "1–5. Leave empty to hide the star rating.",
      hidden: hiddenOnNonEn,
      validation: (r) => r.min(1).max(5).integer(),
    }),
    defineField({
      name: "tools",
      type: "array",
      group: "content",
      description: "Which tools this review relates to.",
      hidden: hiddenOnNonEn,
      of: [
        {
          type: "reference",
          to: [{ type: "tool" }],
          options: { filter: 'language == "en"' },
        },
      ],
    }),
    defineField({
      name: "featured",
      type: "boolean",
      group: "meta",
      description: "Pin to the top of testimonial sections.",
      initialValue: false,
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "order",
      type: "number",
      group: "meta",
      description: "Lower numbers appear first.",
      initialValue: 0,
      hidden: hiddenOnNonEn,
    }),
    { ...languageField, group: "meta" },
  ],
  preview: {
    select: {
      title: "authorName",
      source: "source",
      rating: "rating",
      media: "avatar",
    },
    prepare: ({ title, source, rating, media }) => {
      const label = SOURCE_OPTIONS.find((o) => o.value === source)?.title ?? source;
      const stars = rating ? ` · ${"★".repeat(rating)}` : "";
      return { title, subtitle: `${label}${stars}`, media };
    },
  },
});
