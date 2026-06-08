import { defineArrayMember, defineField, defineType } from "sanity";
import {
  ControlsIcon,
  CodeBlockIcon,
  BulbOutlineIcon,
  StarIcon,
  OlistIcon,
  ThLargeIcon,
  ImagesIcon,
  HelpCircleIcon,
} from "@sanity/icons";
import {
  faqArrayField,
  metaFields,
  seoFields,
  standardGroups,
  pageTitleField,
  pageDescriptionField,
  hiddenOnNonEn,
} from "../shared";
import { linkableTo } from "@lib/links/sanity";

// Keep in sync with src/components/shared/Icon.astro IconName union.
const ICON_OPTIONS = [
  "trending-up",
  "heart",
  "pen-tool",
  "message-circle",
  "star",
  "thumbs-up",
  "loader",
  "clock",
  "zap",
  "sparkles",
  "check",
  "camera",
].map((value) => ({ title: value, value }));

export const tool = defineType({
  name: "tool",
  title: "Tools",
  icon: ControlsIcon,
  type: "document",
  groups: [
    ...standardGroups,
    { name: "card", title: "Card", icon: ThLargeIcon },
    { name: "embed", title: "Embed", icon: CodeBlockIcon },
    { name: "howItWorks", title: "How it works", icon: OlistIcon },
    { name: "features", title: "Features", icon: StarIcon },
    { name: "faq", title: "FAQ", icon: HelpCircleIcon },
    { name: "cta", title: "CTA", icon: BulbOutlineIcon },
    {
      name: "hero",
      title: "Hero",
      icon: ImagesIcon,
      hidden: ({ document }) => {
        const kind = (document as { kind?: string } | undefined)?.kind;
        return kind !== "baseExtended" && kind !== "photoEnhancer";
      },
    },
    {
      name: "examples",
      title: "Examples",
      icon: ImagesIcon,
      hidden: ({ document }) => {
        const kind = (document as { kind?: string } | undefined)?.kind;
        return kind !== "photoEnhancer";
      },
    },
  ],
  fields: [
    defineField({
      name: "kind",
      title: "Template *",
      type: "string",
      group: "meta",
      description: "Edit on EN; locales mirror it (read-only here).",
      options: {
        list: [
          { title: "Base (default)", value: "base" },
          {
            title: "Base extended (hero with before/after)",
            value: "baseExtended",
          },
          { title: "Photo Enhancer", value: "photoEnhancer" },
          { title: "Profile Writer", value: "profileWriter" },
          { title: "Profile Reviewer", value: "profileReviewer" },
        ],
        layout: "dropdown",
      },
      initialValue: "base",
      validation: (Rule) => Rule.required(),
      readOnly: ({ document }) =>
        (document as { language?: string } | undefined)?.language !== "en",
    }),
    pageTitleField({ path: "/{slug}", searchWeight: 10 }),
    pageDescriptionField({ searchWeight: 5 }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      group: "content",
      description:
        'Pill text above the H1. Use a separator between parts: · (middle dot), — (em dash), • (bullet), or | (pipe). Example: "Ex Remover · Free, no signup". Leave empty to hide. Max 40 chars.',
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "cardTitle",
      type: "string",
      group: "card",
      description:
        "Short label shown in the header nav dropdown and tools listing card. Leave empty to reuse the page H1 (title).",
    }),
    defineField({
      name: "cardDescription",
      type: "text",
      rows: 3,
      group: "card",
      description:
        "Short blurb shown on the tools listing card. Leave empty to reuse the page subtitle (description).",
    }),
    defineField({
      name: "category",
      type: "reference",
      group: "content",
      to: [{ type: "toolCategory" }],
      options: { disableNew: false, filter: 'language == "en"' },
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "app",
      type: "reference",
      group: "content",
      description:
        "Dating app this tool is for. Leave empty for universal tools.",
      to: [{ type: "datingApp" }],
      options: { disableNew: false, filter: 'language == "en"' },
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "embedPath",
      title: "Path",
      type: "string",
      group: "embed",
      description:
        "Path on the tools host, e.g. /zodiac-compatibility/ or /dogifier/",
      hidden: hiddenOnNonEn,
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
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "embedGeolocation",
      title: "Allow geolocation",
      type: "boolean",
      group: "embed",
      description: "Allow the iframe to request geolocation.",
      initialValue: false,
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "heroBefore",
      title: "Hero — Before image *",
      type: "image",
      group: "hero",
      options: { hotspot: false },
      hidden: hiddenOnNonEn,
      description:
        "Upload at 4:5 aspect ratio (e.g. 800×1000) for optimal performance — other ratios get cropped on display and waste bandwidth. Edit on EN; locales inherit. Required when template is Base extended or Photo Enhancer.",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as
            | { kind?: string; language?: string }
            | undefined;
          if ((doc?.language ?? "en") !== "en") return true;
          const needsHero =
            doc?.kind === "baseExtended" || doc?.kind === "photoEnhancer";
          if (needsHero && !value?.asset)
            return "Required when template uses a hero comparison";
          return true;
        }),
    }),
    defineField({
      name: "heroAfter",
      title: "Hero — After image *",
      type: "image",
      group: "hero",
      options: { hotspot: false },
      hidden: hiddenOnNonEn,
      description:
        "Upload at 4:5 aspect ratio (e.g. 800×1000) for optimal performance — other ratios get cropped on display and waste bandwidth. Edit on EN; locales inherit. Required when template is Base extended or Photo Enhancer.",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as
            | { kind?: string; language?: string }
            | undefined;
          if ((doc?.language ?? "en") !== "en") return true;
          const needsHero =
            doc?.kind === "baseExtended" || doc?.kind === "photoEnhancer";
          if (needsHero && !value?.asset)
            return "Required when template uses a hero comparison";
          return true;
        }),
    }),
    defineField({
      name: "heroBeforeCaption",
      title: "Before caption",
      type: "string",
      group: "hero",
      description:
        'Centered caption on the BEFORE image, e.g. "before — just you, dogless". Per-locale. Empty = no caption.',
    }),
    defineField({
      name: "heroAfterCaption",
      title: "After caption",
      type: "string",
      group: "hero",
      description:
        'Centered caption on the AFTER image, e.g. "after — you + a very good boy". Per-locale. Empty = no caption.',
    }),
    defineField({
      name: "heroCtaText",
      title: "Hero CTA button text",
      type: "string",
      group: "hero",
      description:
        "Button shown under the title. Scrolls to the embed. Empty = no button.",
    }),
    defineField({
      name: "heroCtaSubtext",
      title: "Hero CTA subtext",
      type: "string",
      group: "hero",
      description:
        'Small text under the button (e.g. "it takes less than 1 minute").',
    }),
    defineField({
      name: "heroSocialProof",
      title: "Social proof",
      type: "string",
      group: "hero",
      description:
        'Pill shown under the hero. Wrap a phrase in *asterisks* to color it brand. Example: "*45,000+ AI Photos generated* on Tinder, Bumble, Hinge and more". Per-locale. Empty = hide.',
      hidden: ({ document }) => {
        const kind = (document as { kind?: string } | undefined)?.kind;
        return kind !== "photoEnhancer";
      },
    }),
    defineField({
      name: "examplesHeading",
      title: "Heading *",
      type: "string",
      group: "examples",
      description: "Section title above the before/after examples. Per-locale.",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const kind = (ctx.document as { kind?: string })?.kind;
          if (kind !== "photoEnhancer") return true;
          return value ? true : "Required";
        }),
    }),
    defineField({
      name: "examplesSubtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
      group: "examples",
      description:
        "Optional sentence under the heading. Per-locale. Empty = no subtitle.",
    }),
    defineField({
      name: "examples",
      title: "Examples *",
      type: "array",
      group: "examples",
      description:
        "Side-by-side before/after pairs. Add 2–6. Images are edited on EN (locales inherit); titles + descriptions are per-locale.",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const lang = (ctx.document as { language?: string })?.language;
          if (lang && lang !== "en") return true;
          const kind = (ctx.document as { kind?: string })?.kind;
          if (kind !== "photoEnhancer") return true;
          if (!Array.isArray(value) || value.length < 2)
            return "Add at least 2 examples";
          if (value.length > 6) return "Max 6 examples";
          return true;
        }),
      of: [
        defineArrayMember({
          type: "object",
          name: "example",
          fields: [
            defineField({
              name: "title",
              title: "Title *",
              type: "string",
              description:
                'Short label above the pair (e.g. "Golden hour"). Per-locale.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
              description: "Optional sentence under the title. Per-locale.",
            }),
            defineField({
              name: "before",
              title: "Before image *",
              type: "image",
              options: { hotspot: false },
              description: "Edit on EN; locales inherit at render.",
              hidden: hiddenOnNonEn,
              validation: (Rule) =>
                Rule.custom((value, ctx) => {
                  const lang = (ctx.document as { language?: string })
                    ?.language;
                  if (lang && lang !== "en") return true;
                  return value?.asset ? true : "Required";
                }),
            }),
            defineField({
              name: "after",
              title: "After image *",
              type: "image",
              options: { hotspot: false },
              description: "Edit on EN; locales inherit at render.",
              hidden: hiddenOnNonEn,
              validation: (Rule) =>
                Rule.custom((value, ctx) => {
                  const lang = (ctx.document as { language?: string })
                    ?.language;
                  if (lang && lang !== "en") return true;
                  return value?.asset ? true : "Required";
                }),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
          },
        }),
      ],
    }),
    defineField({
      name: "ctaTitle",
      title: "Title",
      type: "string",
      group: "cta",
      description: "Leave empty to hide the CTA section.",
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
      initialValue: "Try YourMove AI free",
      description: "Required when CTA title is set.",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const hasTitle = !!(
            context.document as { ctaTitle?: string } | undefined
          )?.ctaTitle;
          if (hasTitle && !value) return "Required when CTA title is set";
          return true;
        }),
    }),
    defineField({
      name: "ctaButtonLink",
      title: "Button link",
      type: "reference",
      group: "cta",
      to: linkableTo({ exclude: ["privacy", "terms", "post", "tag"] }),
      options: { disableNew: false },
      initialValue: {
        _ref: "bc386858-e483-4c7e-ab66-9897eeae826f",
      },
      hidden: hiddenOnNonEn,
      description: "Required when CTA title is set.",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const hasTitle = !!(
            context.document as { ctaTitle?: string } | undefined
          )?.ctaTitle;
          if (hasTitle && !value) return "Required when CTA title is set";
          return true;
        }),
    }),
    defineField({
      name: "howItWorksHeading",
      type: "string",
      group: "howItWorks",
      description: "Required when at least one step is added.",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const steps = (context.document as { howItWorks?: unknown[] })
            ?.howItWorks;
          if (Array.isArray(steps) && steps.length > 0 && !value) {
            return "Heading is required when steps are added";
          }
          return true;
        }),
    }),
    defineField({
      name: "howItWorks",
      type: "array",
      group: "howItWorks",
      validation: (Rule) => Rule.max(5),
      of: [
        defineArrayMember({
          type: "object",
          name: "howItWorksStep",
          fields: [
            defineField({
              name: "title",
              title: "Title *",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "text",
              title: "Text *",
              type: "text",
              rows: 2,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        }),
      ],
    }),
    defineField({
      name: "howItWorksCtaSubtext",
      type: "string",
      group: "howItWorks",
      description:
        "Optional small text under the CTA button (e.g. 'it takes less than 3 minutes').",
    }),
    defineField({
      name: "featuresEyebrow",
      type: "string",
      group: "features",
      description:
        "Small label above the heading. Defaults to localized 'FEATURES' if empty.",
    }),
    defineField({
      name: "featuresHeading",
      type: "string",
      group: "features",
      description: "Required when at least one feature is added.",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const features = (context.document as { features?: unknown[] })
            ?.features;
          if (Array.isArray(features) && features.length > 0 && !value) {
            return "Heading is required when features are added";
          }
          return true;
        }),
    }),
    defineField({
      name: "features",
      type: "array",
      group: "features",
      of: [
        defineArrayMember({
          type: "object",
          name: "featureItem",
          fields: [
            defineField({
              name: "icon",
              title: "Icon *",
              type: "string",
              options: { list: ICON_OPTIONS, layout: "dropdown" },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "title",
              title: "Title *",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description *",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "button",
              type: "object",
              description: "Optional. Both text and link must be set together.",
              fields: [
                defineField({ name: "text", type: "string" }),
                defineField({
                  name: "link",
                  type: "reference",
                  to: linkableTo({ exclude: ["privacy", "terms"] }),
                  options: { disableNew: true },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "icon" },
          },
        }),
      ],
    }),
    defineField({
      name: "faqHeading",
      type: "string",
      group: "faq",
      description: "Optional. Defaults to `{tool title} FAQ`.",
    }),
    faqArrayField("faq"),
    ...seoFields,
    ...metaFields,
    defineField({
      name: "featured",
      type: "boolean",
      group: "meta",
      description: "Show in the Top tools section on /tools",
      initialValue: false,
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "order",
      type: "number",
      group: "meta",
      description:
        "Sort order in the header dropdown. Lower numbers appear first. Only used when Featured is on.",
      hidden: (ctx) => {
        if (hiddenOnNonEn(ctx)) return true;
        return !(ctx.document as { featured?: boolean } | undefined)?.featured;
      },
    }),
    defineField({
      name: "toolList",
      type: "reference",
      group: "meta",
      to: [{ type: "toolList" }],
      options: { disableNew: false, filter: 'language == "en"' },
      description:
        "Optional override for the 'More tools' section at the bottom. Leave empty to use the site default.",
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "paid",
      type: "boolean",
      group: "meta",
      description:
        "Check if the tool requires a paid subscription (after a free trial or tier)",
      initialValue: false,
      hidden: hiddenOnNonEn,
    }),
  ],
  preview: {
    select: {
      title: "title",
      cardTitle: "cardTitle",
      subtitle: "language",
    },
    prepare: ({ title, cardTitle, subtitle }) => ({
      title: cardTitle || title,
      subtitle: subtitle?.toUpperCase(),
    }),
  },
});
