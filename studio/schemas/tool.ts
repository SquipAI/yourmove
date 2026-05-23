import { defineArrayMember, defineField, defineType } from "sanity";
import { ControlsIcon, CodeBlockIcon, BulbOutlineIcon } from "@sanity/icons";
import {
  inlineRichTextField,
  metaFields,
  seoFields,
  standardGroups,
} from "./shared";
import { linkableTo } from "@lib/linkTypes";

export const tool = defineType({
  name: "tool",
  title: "Tools",
  icon: ControlsIcon,
  type: "document",
  groups: [
    ...standardGroups,
    { name: "embed", title: "Embed", icon: CodeBlockIcon },
    { name: "cta", title: "CTA", icon: BulbOutlineIcon },
  ],
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
          try {
            new URL(val);
            return true;
          } catch {
            return "Enter a relative path (/page) or full URL";
          }
        }),
    }),
    defineField({
      name: "mainImage",
      type: "image",
      group: "content",
      options: { hotspot: false },
      fields: [defineField({ name: "alt", type: "string", title: "Alt text" })],
    }),
    defineField({
      name: "category",
      type: "reference",
      group: "content",
      to: [{ type: "toolCategory" }],
      options: { disableNew: false },
    }),
    defineField({
      name: "app",
      type: "reference",
      group: "content",
      description:
        "Dating app this tool is for. Leave empty for universal tools.",
      to: [{ type: "datingApp" }],
      options: { disableNew: false },
    }),
    defineField({
      name: "embedPath",
      title: "Path",
      type: "string",
      group: "embed",
      description:
        "Path on the tools host, e.g. /zodiac-compatibility/ or /dogifier/",
      validation: (r) =>
        r.custom((val) => {
          if (!val) return true;
          return val.startsWith("/") || "Must start with /";
        }),
    }),
    defineField({
      name: "embedInitialHeight",
      title: "Initial height (px)",
      type: "number",
      group: "embed",
      description:
        "Used before the tool reports its real height via postMessage. Default 800.",
    }),
    defineField({
      name: "embedGeolocation",
      title: "Allow geolocation",
      type: "boolean",
      group: "embed",
      description: "Allow the iframe to request geolocation.",
      initialValue: false,
    }),
    defineField({
      name: "ctaTitle",
      title: "Title",
      type: "string",
      group: "cta",
    }),
    defineField({
      name: "ctaSubtitle",
      title: "Subtitle",
      type: "text",
      rows: 3,
      group: "cta",
    }),
    defineField({
      name: "ctaButtonText",
      title: "Button text",
      type: "string",
      group: "cta",
    }),
    defineField({
      name: "ctaButtonLink",
      title: "Button link",
      type: "reference",
      group: "cta",
      description:
        "Pick a page or site link. Defaults to the Start site link when empty.",
      to: linkableTo({ exclude: ["privacy", "terms", "post", "tag"] }),
      options: { disableNew: false },
    }),
    defineField({
      name: "faqHeading",
      type: "string",
      group: "content",
      description: "Optional. Defaults to `{tool title} FAQ`.",
    }),
    defineField({
      name: "faq",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "faqItem",
          fields: [
            defineField({
              name: "question",
              type: "string",
              validation: (r) => r.required(),
            }),
            inlineRichTextField("answer", "Answer"),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
    }),
    ...seoFields,
    ...metaFields,
    defineField({
      name: "featured",
      type: "boolean",
      group: "meta",
      description: "Show in the Top tools section on /tools",
      initialValue: false,
    }),
    defineField({
      name: "paid",
      type: "boolean",
      group: "meta",
      description: "True if the tool requires a subscription after a free tier",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "language", media: "mainImage" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle?.toUpperCase(),
      media,
    }),
  },
});
