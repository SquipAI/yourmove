import { defineArrayMember, defineField, defineType } from "sanity";
import { ComposeIcon } from "@sanity/icons";
import {
  inlineRichTextField,
  languageField,
  linkAnnotation,
  seoFields,
  standardGroups,
  pageTitleField,
  hiddenOnNonEn,
  sourceRefField,
} from "../shared";

export const post = defineType({
  name: "post",
  title: "Post",
  icon: ComposeIcon,
  type: "document",
  groups: standardGroups,
  fields: [
    pageTitleField({ path: "/blog/{slug}", searchWeight: 100 }),
    defineField({
      name: "summary",
      title: "Summary *",
      type: "text",
      rows: 3,
      group: "content",
      options: { search: { weight: 20 } },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main image *",
      type: "image",
      group: "content",
      options: { hotspot: true },
      description:
        "Recommended ~750×500 (3:2). Cards display at 16:9 and 1:1, Sanity crops server-side around the hotspot. If no hotspot is set, center is used. Edit on EN; locales inherit.",
      hidden: hiddenOnNonEn,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "H5", value: "h5" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Underline", value: "underline" },
              { title: "Strike", value: "strike-through" },
            ],
            annotations: [linkAnnotation()],
          },
        }),
        defineArrayMember({
          type: "image",
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Alt text",
              // Warning, not required: content images should have alt for a11y &
              // image-search SEO, but don't block publishing on it.
              validation: (r) =>
                r
                  .custom((value) =>
                    value
                      ? true
                      : "Add alt text — helps accessibility and image-search SEO",
                  )
                  .warning(),
            }),
            defineField({
              name: "fullWidth",
              type: "boolean",
              title: "Full-width",
              description:
                "Render edge-to-edge instead of constrained to article width",
              initialValue: false,
            }),
          ],
        }),
        defineArrayMember({
          type: "object",
          name: "faqSection",
          title: "FAQ section",
          fields: [
            defineField({
              name: "heading",
              type: "string",
              description:
                "Optional heading shown above FAQ items (e.g. 'Common Questions')",
            }),
            defineField({
              name: "subheading",
              type: "text",
              rows: 2,
              description: "Optional subheading/intro shown under the heading",
            }),
          ],
          preview: {
            select: { heading: "heading" },
            prepare: ({ heading }) => ({
              title: heading ?? "FAQ section",
              subtitle: "Renders document FAQ field at this position",
            }),
          },
        }),
        defineArrayMember({
          type: "object",
          name: "statSection",
          title: "Statistics section",
          fields: [
            defineField({
              name: "heading",
              type: "string",
              description: "Heading shown above the stat cards",
            }),
            defineField({
              name: "subheading",
              type: "text",
              rows: 2,
              description: "Optional subheading/intro shown under the heading",
            }),
          ],
          preview: {
            select: { heading: "heading" },
            prepare: ({ heading }) => ({
              title: heading ?? "Statistics section",
              subtitle: "Renders document Stats field as cards at this position",
            }),
          },
        }),
        defineArrayMember({
          type: "object",
          name: "table",
          title: "Table",
          fields: [
            defineField({
              name: "rows",
              title: "Rows *",
              type: "array",
              description:
                "First row is always the column header row. In cells, *asterisks* mark accented text.",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "tableRow",
                  fields: [
                    defineField({
                      name: "cells",
                      title: "Cells",
                      type: "array",
                      of: [defineArrayMember({ type: "text", rows: 1 })],
                      validation: (r) => r.min(1),
                    }),
                  ],
                  preview: {
                    select: { cells: "cells" },
                    prepare: ({ cells }) => ({
                      title: ((cells ?? []) as string[])
                        .map((c) => c?.trim() || "—")
                        .join(" · "),
                    }),
                  },
                }),
              ],
              validation: (r) => [
                r
                  .required()
                  .min(2)
                  .error("A table needs a header row and at least one data row"),
                r.custom((rows) => {
                  const widths = ((rows ?? []) as { cells?: unknown[] }[]).map(
                    (row) => row.cells?.length ?? 0,
                  );
                  return new Set(widths).size > 1
                    ? `All rows need the same number of cells (got ${widths.join(", ")})`
                    : true;
                }),
                r
                  .custom((rows) => {
                    const first = ((rows ?? []) as { cells?: unknown[] }[])[0];
                    return (first?.cells?.length ?? 0) > 6
                      ? "More than 6 columns is hard to read, especially on mobile"
                      : true;
                  })
                  .warning(),
              ],
            }),
          ],
          preview: {
            select: { rows: "rows" },
            prepare: ({ rows }) => {
              const all = (rows ?? []) as { cells?: string[] }[];
              const header = (all[0]?.cells ?? []).filter(Boolean).join(" | ");
              return {
                title: header || "Table",
                subtitle: `Table — ${all[0]?.cells?.length ?? 0} columns × ${Math.max(all.length - 1, 0)} rows`,
              };
            },
          },
        }),
        defineArrayMember({
          type: "object",
          name: "embed",
          title: "Embed",
          fields: [
            defineField({
              name: "kind",
              type: "string",
              title: "Type *",
              validation: (r) => r.required(),
              options: {
                list: [
                  { title: "YouTube", value: "youtube" },
                  { title: "Mixcloud", value: "mixcloud" },
                  { title: "Google Slides", value: "googleSlides" },
                ],
                layout: "radio",
              },
            }),
            defineField({
              name: "source",
              type: "string",
              title: "URL or ID",
              description:
                "YouTube: full URL or video ID. Mixcloud: feed URL. Google Slides: published embed URL.",
              hidden: ({ parent }) => !parent?.kind,
              validation: (r) =>
                r.custom((value, ctx) => {
                  const kind = (ctx.parent as { kind?: string } | undefined)
                    ?.kind;
                  if (kind && !value) return "Required for media embeds";
                  return true;
                }),
            }),
          ],
          preview: {
            select: { kind: "kind", source: "source" },
            prepare: ({ kind, source }) => ({
              title: `${kind ?? "Embed"}${source ? `: ${source}` : ""}`,
            }),
          },
        }),
        defineArrayMember({
          type: "object",
          name: "htmlEmbed",
          title: "Embed code",
          description:
            "Advanced: paste a third-party embed snippet. Renders the HTML as-is. Use embed types above when possible.",
          fields: [
            defineField({
              name: "code",
              type: "text",
              title: "HTML *",
              rows: 6,
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { code: "code" },
            prepare: ({ code }) => {
              const trimmed = (code || "").trim();
              const tag = trimmed.match(/<(\w+)/)?.[1] ?? "embed";
              return {
                title: `Embed code: <${tag}>`,
                subtitle: trimmed.slice(0, 80).replace(/\s+/g, " "),
              };
            },
          },
        }),
      ],
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
              title: "Question *",
              type: "string",
              validation: (r) => r.required(),
            }),
            inlineRichTextField("answer", "Answer"),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      group: "content",
      description:
        "Stat cards, rendered where the Statistics section marker sits in the body.",
      of: [
        defineArrayMember({
          type: "object",
          name: "statItem",
          fields: [
            defineField({
              name: "title",
              title: "Title *",
              type: "string",
              description:
                "Headline figure or claim (e.g. '2x' or 'Personalized questions raise reply rates by 34%')",
              validation: (r) => r.required(),
            }),
            inlineRichTextField("description", "Description"),
            defineField({ name: "source", title: "Source label", type: "string" }),
            defineField({
              name: "sourceUrl",
              title: "Source URL",
              type: "url",
              validation: (r) => r.uri({ scheme: ["http", "https"] }),
            }),
          ],
          preview: { select: { title: "title", subtitle: "source" } },
        }),
      ],
    }),
    ...seoFields,
    { ...languageField, group: "meta" },
    defineField({
      name: "hidden",
      title: "Hide from site",
      description: "If checked, this post will not appear on the website",
      type: "boolean",
      group: "meta",
      initialValue: false,
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "featured",
      type: "boolean",
      group: "meta",
      initialValue: false,
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "tags",
      type: "array",
      group: "meta",
      description: "Edit on EN; locales follow via translation.metadata.",
      hidden: hiddenOnNonEn,
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "tag" }],
          options: { filter: 'language == "en"' },
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "readingTime",
      type: "number",
      group: "meta",
      hidden: hiddenOnNonEn,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      group: "meta",
      description:
        "Content creation date (auto-filled for new docs, imported from Webflow for migrated ones)",
      initialValue: () => new Date().toISOString(),
      hidden: hiddenOnNonEn,
      validation: (r) => r.required(),
    }),
    sourceRefField("post"),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "language",
      media: "mainImage",
      sourceTitle: "sourceRef.title",
      sourceMedia: "sourceRef.mainImage",
    },
    prepare: ({ title, subtitle, media, sourceTitle, sourceMedia }) => ({
      title: sourceTitle || title,
      subtitle: subtitle?.toUpperCase(),
      media: sourceMedia || media,
    }),
  },
});
