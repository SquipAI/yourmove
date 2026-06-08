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

// Visual demo shown above the description on each showcase card. Pick one
// variant — frontend renders the matching component (colors/typography
// driven by demo `_type`, not by editor).
const showcaseDemoField = defineField({
  name: "demo",
  title: "Demo",
  type: "array",
  description: "Optional visual demo shown above the description. Pick one variant.",
  validation: (r) => r.max(1),
  of: [
    defineArrayMember({
      type: "object",
      name: "chatDemo",
      title: "Chat",
      fields: [
        defineField({
          name: "theirMessage",
          title: "Their message *",
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "ourReply",
          title: "Our reply *",
          type: "string",
          validation: (r) => r.required(),
        }),
      ],
      preview: {
        select: { title: "ourReply", subtitle: "theirMessage" },
      },
    }),
    defineArrayMember({
      type: "object",
      name: "openersDemo",
      title: "Openers list",
      fields: [
        defineField({
          name: "items",
          title: "Openers *",
          type: "array",
          validation: (r) => r.required().min(1).max(3),
          of: [
            defineArrayMember({
              type: "object",
              name: "opener",
              fields: [
                defineField({
                  name: "tag",
                  title: "Tag *",
                  type: "string",
                  description: "Short label (e.g. PLAYFUL, BOLD).",
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: "text",
                  title: "Text *",
                  type: "text",
                  rows: 2,
                  validation: (r) => r.required(),
                }),
              ],
              preview: {
                select: { title: "tag", subtitle: "text" },
              },
            }),
          ],
        }),
      ],
      preview: { prepare: () => ({ title: "Openers list" }) },
    }),
    defineArrayMember({
      type: "object",
      name: "reviewDemo",
      title: "Profile review",
      fields: [
        defineField({
          name: "scoreFrom",
          title: "Current score *",
          type: "number",
          validation: (r) => r.required().min(0).max(100),
        }),
        defineField({
          name: "scoreTo",
          title: "Target score *",
          type: "number",
          validation: (r) => r.required().min(0).max(100),
        }),
        defineField({
          name: "items",
          title: "Fix items",
          type: "array",
          validation: (r) => r.required().min(1).max(4),
          of: [
            defineArrayMember({
              type: "object",
              name: "fixItem",
              fields: [
                defineField({
                  name: "tag",
                  title: "Tag *",
                  type: "string",
                  description: "Short label (e.g. FIX, KEEP).",
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: "text",
                  title: "Text *",
                  type: "string",
                  validation: (r) => r.required(),
                }),
              ],
              preview: {
                select: { title: "tag", subtitle: "text" },
              },
            }),
          ],
        }),
      ],
      preview: { prepare: () => ({ title: "Profile review" }) },
    }),
    defineArrayMember({
      type: "object",
      name: "bioDemo",
      title: "Bio example",
      fields: [
        defineField({
          name: "text",
          title: "Bio *",
          type: "text",
          rows: 4,
          validation: (r) => r.required(),
        }),
      ],
      preview: { prepare: () => ({ title: "Bio example" }) },
    }),
    defineArrayMember({
      type: "object",
      name: "beforeAfterDemo",
      title: "Before / After",
      description:
        "Pulls the first example (before/after) from the linked tool. No fields to fill — edit images on the tool doc.",
      fields: [
        defineField({
          name: "marker",
          type: "string",
          hidden: true,
          readOnly: true,
        }),
      ],
      preview: { prepare: () => ({ title: "Before / After" }) },
    }),
  ],
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
      title: "Stats Eyebrow *",
      type: "string",
      group: "hero",
      description:
        "Eyebrow above the H1. Placeholders {count} and {rating} are replaced with live siteStats values.",
      initialValue: "{count} daters · {rating} ★★★★★",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heroChatCards",
      title: "Hero Chat Cards",
      type: "array",
      group: "hero",
      description:
        "Exactly 3 example chat exchanges shown under the CTA. Write naturally for each language — idioms, slang, references should feel native.",
      validation: (r) => r.length(3),
      of: [
        defineArrayMember({
          type: "object",
          name: "chatCard",
          fields: [
            defineField({
              name: "name",
              title: "Name *",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "avatar",
              title: "Avatar *",
              type: "image",
              description:
                "Square preferred, small size — around 60×60px is enough (rendered as a tiny rounded circle).",
              options: { hotspot: true },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "app",
              title: "App *",
              type: "string",
              description: 'App label badge, e.g. "Tinder", "Hinge", "Bumble"',
              validation: (r) => r.required(),
            }),
            defineField({
              name: "theirMessage",
              title: "Their message *",
              type: "string",
              description: "The match's opener (left, gray bubble)",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "ourReply",
              title: "Our reply *",
              type: "string",
              description:
                "The witty reply YourMove generated (right, brand bubble)",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "ourReply",
              media: "avatar",
            },
          },
        }),
      ],
    }),
    defineField({
      name: "heroCta",
      title: "Hero CTA",
      type: "object",
      group: "hero",
      description:
        "Button under the H1. Link is set on EN once (inherited by locales). Label is editable per language.",
      fields: [
        defineField({
          name: "label",
          title: "Label *",
          type: "string",
          description: 'Button text, e.g. "Get Started"',
          validation: (r) => r.required(),
        }),
        defineField({
          name: "link",
          title: "Link *",
          type: "reference",
          to: [{ type: "siteLink" }],
          hidden: hiddenOnNonEn,
          options: { disableNew: true },
          initialValue: { _ref: "bc386858-e483-4c7e-ab66-9897eeae826f" },
          validation: (r) =>
            r.custom((value, ctx) => {
              const isEn =
                (ctx.document as { language?: string } | undefined)
                  ?.language === "en";
              if (!isEn) return true;
              return value ? true : "Required";
            }),
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
          title: "Heading *",
          type: "string",
          initialValue: "Your AI dating toolkit",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "subtitle",
          type: "string",
          description: "Optional sentence under the heading.",
        }),
        defineField({
          name: "showcaseCards",
          title: "Showcase Cards",
          type: "array",
          description:
            "Cards next to the tools heading. Drag to reorder. Edit per locale.",
          of: [
            defineArrayMember({
              type: "object",
              name: "toolCard",
              title: "Tool",
              fields: [
                defineField({
                  name: "target",
                  title: "Tool *",
                  type: "reference",
                  to: [{ type: "tool" }],
                  weak: true,
                  options: {
                    disableNew: true,
                    filter: ({ document }) => ({
                      filter: "language == $lang",
                      params: {
                        lang:
                          (document as { language?: string } | undefined)
                            ?.language ?? "en",
                      },
                    }),
                  },
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: "description",
                  title: "Description",
                  type: "text",
                  rows: 2,
                }),
                defineField({
                  name: "buttonText",
                  title: "Button text *",
                  type: "string",
                  initialValue: "Try it free",
                  validation: (r) => r.required(),
                }),
                showcaseDemoField,
              ],
              preview: {
                select: {
                  cardTitle: "target.cardTitle",
                  fallbackTitle: "target.title",
                  description: "description",
                },
                prepare: ({
                  cardTitle,
                  fallbackTitle,
                  description,
                }: {
                  cardTitle?: string;
                  fallbackTitle?: string;
                  description?: string;
                }) => ({
                  title: cardTitle ?? fallbackTitle ?? "(no tool selected)",
                  subtitle: description,
                }),
              },
            }),
            defineArrayMember({
              type: "object",
              name: "customCard",
              title: "Custom",
              fields: [
                defineField({
                  name: "title",
                  title: "Title *",
                  type: "string",
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: "url",
                  title: "URL *",
                  type: "url",
                  validation: (r) =>
                    r.required().uri({ scheme: ["http", "https"] }),
                }),
                defineField({
                  name: "description",
                  title: "Description",
                  type: "text",
                  rows: 2,
                }),
                defineField({
                  name: "buttonText",
                  title: "Button text *",
                  type: "string",
                  initialValue: "Try it free",
                  validation: (r) => r.required(),
                }),
                showcaseDemoField,
              ],
              preview: {
                select: { title: "title", subtitle: "description" },
              },
            }),
          ],
          validation: (r) => r.max(6),
        }),
        defineField({
          name: "ctaLabel",
          title: "See-all CTA *",
          type: "string",
          description:
            "Label on the last card that links to /tools. Use {count} — replaced live with the total tool count.",
          initialValue:
            "{count} tools. One unfair advantage in your dating life. See it all",
          validation: (r) => r.required(),
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
          title: "Heading *",
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
      title: "Blog Heading *",
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
          title: "Heading *",
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
