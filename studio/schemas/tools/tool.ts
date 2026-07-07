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
  EditIcon,
  BlockquoteIcon,
} from "@sanity/icons";
import {
  faqArrayField,
  metaFields,
  seoFields,
  standardGroups,
  pageTitleField,
  pageDescriptionField,
  hiddenOnNonEn,
  hideUnlessKind,
  docKind,
  docLang,
  exactLength,
  requiredImage,
  sourceRefField,
} from "../shared";
import { linkableTo } from "@lib/links/sanity";
import { FEATURE_ICON_NAMES } from "@lib/icons";

const ICON_OPTIONS = FEATURE_ICON_NAMES.map((value) => ({
  title: value,
  value,
}));

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
      hidden: hideUnlessKind(
        "baseExtended",
        "photoEnhancer",
        "profileReviewer",
        "chatAssistant",
        "profileWriter",
      ),
    },
    {
      name: "profileWriter",
      title: "Profile preview",
      icon: EditIcon,
      hidden: hideUnlessKind("profileWriter"),
    },
    {
      name: "profileWriterExamples",
      title: "Profile examples",
      icon: BlockquoteIcon,
      hidden: hideUnlessKind("profileWriter"),
    },
    {
      name: "heroComparison",
      title: "Hero — Comparison",
      icon: ImagesIcon,
      hidden: hideUnlessKind("baseExtended", "photoEnhancer"),
    },
    {
      name: "photoExamples",
      title: "Photo examples",
      icon: ImagesIcon,
      hidden: hideUnlessKind("photoEnhancer"),
    },
    {
      name: "reviewReport",
      title: "Review report",
      icon: StarIcon,
      hidden: hideUnlessKind("profileReviewer"),
    },
    {
      name: "reviewComparisons",
      title: "Review comparisons",
      icon: OlistIcon,
      hidden: hideUnlessKind("profileReviewer"),
    },
    {
      name: "chatPreview",
      title: "Chat preview",
      icon: ImagesIcon,
      hidden: hideUnlessKind("chatAssistant"),
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
          { title: "Chat Assistant", value: "chatAssistant" },
        ],
        layout: "dropdown",
      },
      initialValue: "base",
      validation: (r) => r.required(),
      readOnly: ({ document }) => docLang(document) !== "en",
    }),
    pageTitleField({ path: "/{slug}", searchWeight: 10 }),
    pageDescriptionField({ searchWeight: 5 }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      group: "content",
      description:
        'Pill text above the H1. Use a separator between parts: · (middle dot), — (em dash), • (bullet), or | (pipe). Example: "Ex Remover · Free, no signup". Leave empty to hide. Keep under ~40 chars.',
      validation: (r) => r.max(40).warning("Eyebrow is usually under 40 chars to fit in one line."),
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
      group: "heroComparison",
      options: { hotspot: false },
      hidden: hiddenOnNonEn,
      description:
        "Upload at 4:5 aspect ratio (e.g. 800×1000) for optimal performance — other ratios get cropped on display and waste bandwidth. Edit on EN; locales inherit. Required when template is Base extended or Photo Enhancer.",
      validation: (r) =>
        r.custom(
          requiredImage("Required when template uses a hero comparison", [
            "baseExtended",
            "photoEnhancer",
          ]),
        ),
    }),
    defineField({
      name: "heroAfter",
      title: "Hero — After image *",
      type: "image",
      group: "heroComparison",
      options: { hotspot: false },
      hidden: hiddenOnNonEn,
      description:
        "Upload at 4:5 aspect ratio (e.g. 800×1000) for optimal performance — other ratios get cropped on display and waste bandwidth. Edit on EN; locales inherit. Required when template is Base extended or Photo Enhancer.",
      validation: (r) =>
        r.custom(
          requiredImage("Required when template uses a hero comparison", [
            "baseExtended",
            "photoEnhancer",
          ]),
        ),
    }),
    defineField({
      name: "heroBeforeCaption",
      title: "Before caption",
      type: "string",
      group: "heroComparison",
      description:
        'Centered caption on the BEFORE image, e.g. "before — just you, dogless". Per-locale. Empty = no caption.',
    }),
    defineField({
      name: "heroAfterCaption",
      title: "After caption",
      type: "string",
      group: "heroComparison",
      description:
        'Centered caption on the AFTER image, e.g. "after — you + a very good boy". Per-locale. Empty = no caption.',
    }),
    defineField({
      name: "heroCtaText",
      title: "Hero CTA button text",
      type: "string",
      group: "hero",
      description:
        "Button shown under the title. Empty = no button. Target is set below.",
    }),
    defineField({
      name: "heroCtaLink",
      title: "Hero CTA link",
      type: "reference",
      group: "hero",
      to: linkableTo({ exclude: ["privacy", "terms", "post", "tag"] }),
      options: { disableNew: false },
      hidden: hiddenOnNonEn,
      description:
        "Where the hero button goes. Pick a siteLink for external URLs, or a tool/page. Empty = scrolls to embed (#tool).",
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
    }),
    defineField({
      name: "examplesHeading",
      title: "Heading *",
      type: "string",
      group: "photoExamples",
      description: "Section title above the before/after examples. Per-locale.",
      validation: (r) =>
        r.custom((value, ctx) => {
          if (docKind(ctx.document) !== "photoEnhancer") return true;
          return value ? true : "Required";
        }),
    }),
    defineField({
      name: "examplesSubtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
      group: "photoExamples",
      description:
        "Optional sentence under the heading. Per-locale. Empty = no subtitle.",
    }),
    defineField({
      name: "examples",
      title: "Examples *",
      type: "array",
      group: "photoExamples",
      description:
        "Side-by-side before/after pairs. Add 2–6. Images are edited on EN (locales inherit); titles + descriptions are per-locale.",
      validation: (r) =>
        r.custom((value, ctx) => {
          if (docLang(ctx.document) !== "en") return true;
          if (docKind(ctx.document) !== "photoEnhancer") return true;
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
              validation: (r) => r.required(),
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
              validation: (r) => r.custom(requiredImage("Required")),
            }),
            defineField({
              name: "after",
              title: "After image *",
              type: "image",
              options: { hotspot: false },
              description: "Edit on EN; locales inherit at render.",
              hidden: hiddenOnNonEn,
              validation: (r) => r.custom(requiredImage("Required")),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
          },
        }),
      ],
    }),
    defineField({
      name: "reportCurrentRating",
      title: "Current rating",
      type: "number",
      group: "reviewReport",
      description: "Rating shown on the left (out of 10). Per-locale.",
      initialValue: 6.8,
      validation: (r) => r.min(0).max(10),
    }),
    defineField({
      name: "reportTargetRating",
      title: "Target rating",
      type: "number",
      group: "reviewReport",
      description: "Rating shown on the right (out of 10). Keep ~9.",
      initialValue: 9.0,
      validation: (r) => r.min(0).max(10),
    }),
    defineField({
      name: "reportVerdict",
      title: "Verdict",
      type: "string",
      group: "reviewReport",
      description:
        "One-line synthesis under the rating bar. Per-locale. Make it app-specific where it matters (e.g. mention prompts on Hinge).",
      initialValue:
        "Solid base — but photo #1 is quietly costing you matches.",
    }),
    defineField({
      name: "reportBreakdown",
      title: "Breakdown",
      type: "array",
      group: "reviewReport",
      description: "3 axes scored out of 10. Per-locale (labels translate).",
      initialValue: [
        { _type: "reportBreakdownItem", label: "Photos", score: 7 },
        { _type: "reportBreakdownItem", label: "Bio", score: 4 },
        { _type: "reportBreakdownItem", label: "Prompts", score: 6 },
      ],
      of: [
        defineArrayMember({
          type: "object",
          name: "reportBreakdownItem",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "score",
              title: "Score (0–10)",
              type: "number",
              validation: (r) => r.required().min(0).max(10),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "score" },
          },
        }),
      ],
      validation: (r) => r.min(1).max(5),
    }),
    defineField({
      name: "reportActions",
      title: "Do this next",
      type: "array",
      group: "reviewReport",
      description:
        "Numbered action list under the breakdown. 3 short lines. Wrap key phrases in *asterisks* to emphasize them. Per-locale.",
      initialValue: [
        "Lead with your *solo, face-clear* shot — cut the group photo.",
        'Rewrite the bio — *"Just ask 🤷"* gives a match nothing to reply to.',
        "Swap a one-word prompt for a *specific, story-led* answer.",
      ],
      of: [defineArrayMember({ type: "string" })],
      validation: (r) => r.min(1).max(5),
    }),
    defineField({
      name: "chatPreviewStages",
      title: "Stages *",
      type: "array",
      group: "chatPreview",
      description:
        "Three chat stages (Open / Reply / Close). Each stage has its own dark-card content and five tone variants × 3 replies. Per-locale.",
      validation: (r) =>
        r.custom((value, ctx) =>
          docKind(ctx.document) !== "chatAssistant"
            ? true
            : exactLength(3, "Exactly 3 stages (Open, Reply, Close)")(value),
        ),
      of: [
        defineArrayMember({
          type: "object",
          name: "chatPreviewStage",
          fields: [
            defineField({
              name: "tabKey",
              title: "Stage *",
              type: "string",
              options: {
                list: [
                  { title: "Open (first message)", value: "open" },
                  { title: "Reply (mid-chat)", value: "reply" },
                  { title: "Close (ask out / revive)", value: "close" },
                ],
                layout: "dropdown",
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "eyebrow",
              title: "Eyebrow *",
              type: "string",
              description:
                'Uppercase label on the dark card, e.g. "THEIR PROFILE" or "STALLED 4 DAYS AGO · THEIR LAST MESSAGE".',
              validation: (r) => r.required(),
            }),
            defineField({
              name: "message",
              title: "Their message / profile *",
              type: "text",
              rows: 2,
              description: "Text shown on the dark card.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "replyTones",
              title: "Tone variants *",
              type: "array",
              description:
                "Five tones (Flirty, Feisty, Friendly, Funny, Formal), 3 short replies each.",
              validation: (r) => r.custom(exactLength(5, "Exactly 5 tones")),
              of: [
                defineArrayMember({
                  type: "object",
                  name: "chatPreviewTone",
                  fields: [
                    defineField({
                      name: "toneKey",
                      title: "Tone *",
                      type: "string",
                      options: {
                        list: [
                          { title: "Flirty 😉", value: "flirty" },
                          { title: "Feisty 🤪", value: "feisty" },
                          { title: "Friendly 😊", value: "friendly" },
                          { title: "Funny 😄", value: "funny" },
                          { title: "Formal 👔", value: "formal" },
                        ],
                        layout: "dropdown",
                      },
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "replies",
                      title: "Replies *",
                      type: "array",
                      description: "Exactly 3 short replies.",
                      validation: (r) =>
                        r.custom(exactLength(3, "Exactly 3 replies")),
                      of: [defineArrayMember({ type: "string" })],
                    }),
                  ],
                  preview: {
                    select: { title: "toneKey", subtitle: "replies.0" },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "tabKey", subtitle: "eyebrow" },
          },
        }),
      ],
    }),
    defineField({
      name: "profileWriterExamplesHeading",
      title: "Examples heading *",
      type: "string",
      group: "profileWriterExamples",
      description:
        'Heading for the "every tone" examples reel below the hero. Per-locale. Wrap a phrase in *asterisks* to accent it. Required for Profile Writer tools.',
      validation: (r) =>
        r.custom((value, ctx) => {
          if (docKind(ctx.document) !== "profileWriter") return true;
          return value ? true : "Required";
        }),
    }),
    defineField({
      name: "profileWriterExamplesSubtitle",
      title: "Examples subtitle",
      type: "text",
      rows: 2,
      group: "profileWriterExamples",
      description:
        "Optional sentence under the examples heading. Per-locale. Wrap a phrase in *asterisks* to accent it.",
    }),
    defineField({
      name: "profileWriterApps",
      title: "Apps *",
      type: "array",
      group: "profileWriter",
      description:
        "Apps shown in the hero preview's switcher. Add one app for an app-specific tool, or several (e.g. Tinder, Hinge, Bumble) for the general generator. Each section has a Flirty, Thoughtful and Feisty variant. Edit on EN; locales inherit (leave empty to reuse EN, or fill to localize).",
      validation: (r) =>
        r.custom((value, ctx) => {
          if (docLang(ctx.document) !== "en") return true;
          if (docKind(ctx.document) !== "profileWriter") return true;
          if (!Array.isArray(value) || value.length < 1)
            return "Add at least 1 app";
          return true;
        }),
      of: [
        defineArrayMember({
          type: "object",
          name: "profileWriterApp",
          fields: [
            defineField({
              name: "app",
              title: "App name *",
              type: "string",
              description: 'Shown in the app dropdown, e.g. "Tinder".',
              validation: (r) => r.required(),
            }),
            defineField({
              name: "sections",
              title: "Sections *",
              type: "array",
              description:
                "Profile sections for this app (e.g. About Me, My anthem). 1–5.",
              validation: (r) => r.min(1).max(5),
              of: [
                defineArrayMember({
                  type: "object",
                  name: "profileWriterSection",
                  fields: [
                    defineField({
                      name: "label",
                      title: "Section label *",
                      type: "string",
                      description: 'e.g. "About Me", "Two truths and a lie".',
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "flirty",
                      title: "Flirty *",
                      type: "text",
                      rows: 2,
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "thoughtful",
                      title: "Thoughtful *",
                      type: "text",
                      rows: 2,
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "feisty",
                      title: "Feisty *",
                      type: "text",
                      rows: 2,
                      validation: (r) => r.required(),
                    }),
                  ],
                  preview: {
                    select: { title: "label", subtitle: "flirty" },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "app", subtitle: "sections.0.label" },
          },
        }),
      ],
    }),
    defineField({
      name: "comparisonsHeading",
      title: "Heading",
      type: "string",
      group: "reviewComparisons",
      description:
        'Section title above the bad/good cards. Per-locale. Empty = hide section. Example: "What the review actually catches".',
    }),
    defineField({
      name: "comparisons",
      title: "Cards",
      type: "array",
      group: "reviewComparisons",
      description:
        "Bad vs good examples the reviewer catches. 3–6 cards. Per-locale.",
      validation: (r) => r.max(6),
      of: [
        defineArrayMember({
          type: "object",
          name: "comparisonItem",
          fields: [
            defineField({
              name: "eyebrow",
              title: "Eyebrow *",
              type: "string",
              description:
                'Short uppercase label, e.g. "Lead photo", "The bio".',
              validation: (r) => r.required().max(40),
            }),
            defineField({
              name: "bad",
              title: "Bad example *",
              type: "string",
              description: "The mistake. Short. Keep quotes if quoting a bio.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "good",
              title: "Good example *",
              type: "string",
              description: "The fix the tool surfaces. Short.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "description",
              title: "Description *",
              type: "text",
              rows: 2,
              description:
                "One sentence on what the review does with this. Shown under the divider.",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "eyebrow", subtitle: "good" },
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
      validation: (r) =>
        r.custom((value, ctx) => {
          const hasTitle = !!(
            ctx.document as { ctaTitle?: string } | undefined
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
      validation: (r) =>
        r.custom((value, ctx) => {
          const hasTitle = !!(
            ctx.document as { ctaTitle?: string } | undefined
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
      validation: (r) =>
        r.custom((value, ctx) => {
          const steps = (ctx.document as { howItWorks?: unknown[] })
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
      validation: (r) => r.max(5),
      of: [
        defineArrayMember({
          type: "object",
          name: "howItWorksStep",
          fields: [
            defineField({
              name: "title",
              title: "Title *",
              type: "string",
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
          preview: { select: { title: "title", subtitle: "text" } },
        }),
      ],
    }),
    defineField({
      name: "featuresHeading",
      type: "string",
      group: "features",
      description: "Required when at least one feature is added.",
      validation: (r) =>
        r.custom((value, ctx) => {
          const features = (ctx.document as { features?: unknown[] })
            ?.features;
          if (Array.isArray(features) && features.length > 0 && !value) {
            return "Heading is required when features are added";
          }
          return true;
        }),
    }),
    defineField({
      name: "featuresSubtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
      group: "features",
      description:
        "Optional sentence under the heading (left column). Per-locale. Empty = no subtitle.",
    }),
    defineField({
      name: "featuresCtaText",
      title: "CTA link text",
      type: "string",
      group: "features",
      description:
        'Optional text link under the heading, e.g. "Try it free". Per-locale. Empty = no link. Target is set below.',
    }),
    defineField({
      name: "featuresCtaLink",
      title: "CTA link target",
      type: "reference",
      group: "features",
      to: linkableTo({ exclude: ["privacy", "terms", "post", "tag"] }),
      options: { disableNew: false },
      hidden: hiddenOnNonEn,
      description:
        "Where the features CTA link goes. Pick a siteLink for external URLs, or a tool/page. Empty = scrolls to embed (#tool).",
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
              validation: (r) => r.required(),
            }),
            defineField({
              name: "title",
              title: "Title *",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "description",
              title: "Description *",
              type: "text",
              rows: 3,
              validation: (r) => r.required(),
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
    sourceRefField("tool"),
  ],
  preview: {
    select: {
      title: "title",
      cardTitle: "cardTitle",
      subtitle: "language",
      sourceTitle: "sourceRef.title",
      sourceCardTitle: "sourceRef.cardTitle",
    },
    prepare: ({ title, cardTitle, subtitle, sourceTitle, sourceCardTitle }) => ({
      title: sourceCardTitle || sourceTitle || cardTitle || title,
      subtitle: subtitle?.toUpperCase(),
    }),
  },
});
