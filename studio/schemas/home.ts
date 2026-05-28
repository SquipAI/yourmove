import { defineType, defineField, defineArrayMember } from "sanity";
import type { FieldGroupDefinition } from "sanity";
import {
  HomeIcon,
  StarIcon,
  RocketIcon,
  BookIcon,
  HelpCircleIcon,
} from "@sanity/icons";
import {
  seoMetaFields,
  standardGroups,
  languageField,
  pageTitleField,
  pageDescriptionField,
  faqItemMember,
  navLabelField,
  singletonPagePreview,
  hiddenOnNonEn,
} from "./shared";

const homeGroups: FieldGroupDefinition[] = [
  { name: "hero", title: "Hero", default: true, icon: HomeIcon },
  { name: "tools", title: "Tools", icon: RocketIcon },
  { name: "reviews", title: "Reviews", icon: StarIcon },
  { name: "blog", title: "Blog", icon: BookIcon },
  { name: "faq", title: "FAQ", icon: HelpCircleIcon },
  ...standardGroups.filter((g) => g.name === "seo" || g.name === "meta"),
];

// Array validation: enforces min length on EN docs only, max length on all.
// On non-EN the field is hidden and empty; min is a no-op there.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const enArrayLimits = (min: number, max: number) => (r: any) =>
  r.max(max).custom((value: unknown, ctx: { document?: unknown }) => {
    const isEn =
      (ctx.document as { language?: string } | undefined)?.language === "en";
    if (!isEn) return true;
    return Array.isArray(value) && value.length >= min
      ? true
      : `Pick at least ${min}.`;
  });

const enRefArray = (toType: string, min: number, max: number) =>
  defineField({
    name: "items",
    type: "array",
    description: `Curated, order matters. Edit on EN; locales follow via translation.metadata. Min ${min}, max ${max}.`,
    hidden: hiddenOnNonEn,
    of: [
      defineArrayMember({
        type: "reference",
        to: [{ type: toType }],
        weak: true,
        options: { disableNew: true, filter: 'language == "en"' },
      }),
    ],
    validation: enArrayLimits(min, max),
  });

export const home = defineType({
  name: "home",
  title: "Home page",
  type: "document",
  icon: HomeIcon,
  __experimental_omnisearch_visibility: false,
  groups: homeGroups,
  fields: [
    pageTitleField({ path: "/", initialValue: "Home", group: "hero" }),
    pageDescriptionField({ group: "hero" }),
    navLabelField("Home", "hero"),
    defineField({
      name: "statsEyebrow",
      type: "string",
      group: "hero",
      description:
        "Eyebrow above the H1. Placeholders {count} and {rating} are replaced with live siteStats values.",
      initialValue: "{count} daters · {rating}★",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "compatibility",
      type: "object",
      group: "hero",
      description: "Hero compatibility row: label + curated app logos.",
      fields: [
        defineField({
          name: "label",
          type: "string",
          description: "Label shown before the logos (e.g. 'Compatible with').",
          initialValue: "Compatible with",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "apps",
          type: "array",
          description: "Curated apps, order matters. Edit on EN; locales follow. Max 9.",
          hidden: hiddenOnNonEn,
          of: [
            defineArrayMember({
              type: "reference",
              to: [{ type: "datingApp" }],
              weak: true,
              options: { disableNew: true, filter: 'language == "en"' },
            }),
          ],
          validation: enArrayLimits(3, 9),
        }),
      ],
    }),
    defineField({
      name: "tools",
      type: "object",
      group: "tools",
      description: "Tools section.",
      fields: [
        defineField({
          name: "eyebrow",
          type: "string",
          description: "Optional small eyebrow above the heading.",
        }),
        defineField({
          name: "heading",
          type: "string",
          initialValue: "Your AI dating toolkit",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "subtitle",
          type: "string",
          description: "Optional sentence under the heading.",
        }),
      ],
    }),
    defineField({
      name: "reviews",
      type: "object",
      group: "reviews",
      description: "Reviews section.",
      fields: [
        defineField({
          name: "eyebrow",
          type: "string",
          description: "Optional small eyebrow above the heading.",
        }),
        defineField({
          name: "heading",
          type: "string",
          initialValue: "What our users say",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "subtitle",
          type: "string",
          description: "Optional sentence under the heading.",
        }),
        enRefArray("testimonial", 3, 9),
      ],
    }),
    defineField({
      name: "blogHeading",
      type: "string",
      group: "blog",
      description: "Heading shown above the Blog section.",
      initialValue: "From the blog",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "faq",
      type: "object",
      group: "faq",
      description: "FAQ section.",
      fields: [
        defineField({
          name: "eyebrow",
          type: "string",
          description: "Optional small eyebrow above the heading.",
        }),
        defineField({
          name: "heading",
          type: "string",
          initialValue: "Frequently Asked Questions",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "subtitle",
          type: "string",
          description: "Optional sentence under the heading.",
        }),
        defineField({
          name: "items",
          type: "array",
          description: "FAQ items, order matters. Min 3, max 9 per locale.",
          of: [faqItemMember],
          validation: (r) => r.min(3).max(9),
        }),
      ],
    }),
    ...seoMetaFields,
    { ...languageField, group: "meta" },
  ],
  preview: singletonPagePreview("Home"),
});
