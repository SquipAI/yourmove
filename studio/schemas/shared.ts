import { defineField, defineArrayMember } from "sanity";
import type { FieldGroupDefinition } from "sanity";
import { EditIcon, SearchIcon, CogIcon } from "@sanity/icons";

export const standardGroups: FieldGroupDefinition[] = [
  { name: "content", title: "Content", default: true, icon: EditIcon },
  { name: "seo", title: "SEO", icon: SearchIcon },
  { name: "meta", title: "Meta", icon: CogIcon },
];

// Reusable inline-link annotation. Used in `post.body`, `post.faq[].answer`,
// and any other portable-text array that needs the same link picker.
// Targets internal docs (post/tool/howToUse/home), siteLinks, or a one-off URL.
export const linkAnnotation = () =>
  defineField({
    name: "link",
    type: "object",
    title: "Link",
    fields: [
      defineField({
        name: "internalLink",
        type: "reference",
        title: "Internal page",
        to: [
          { type: "post" },
          { type: "tool" },
          { type: "home" },
          { type: "blog" },
          { type: "tag" },
          { type: "privacy" },
          { type: "terms" },
        ],
        options: { disableNew: true },
      }),
      defineField({
        name: "siteLink",
        type: "reference",
        title: "Site link (own subdomain / app store / partner)",
        to: [{ type: "siteLink" }],
        options: { disableNew: false },
      }),
      defineField({
        name: "href",
        type: "url",
        title: "External URL",
        description: "One-off external URL not in Site links",
        validation: (r) =>
          r.uri({ scheme: ["http", "https", "mailto", "tel"] }),
      }),
      defineField({
        name: "blank",
        type: "boolean",
        title: "Open in new tab",
        initialValue: false,
      }),
    ],
  });

// Inline portable-text used inside FAQ answers and similar short-form fields.
// Plain paragraphs only (no headings, no images, no embeds), with the same
// strong/em/underline decorators and link annotation as body content.
export const inlineRichTextField = (name: string, title?: string) =>
  defineField({
    name,
    type: "array",
    title,
    of: [
      defineArrayMember({
        type: "block",
        styles: [{ title: "Normal", value: "normal" }],
        lists: [],
        marks: {
          decorators: [
            { title: "Bold", value: "strong" },
            { title: "Italic", value: "em" },
            { title: "Underline", value: "underline" },
          ],
          annotations: [linkAnnotation()],
        },
      }),
    ],
  });

// Warn when length is more than 20% over the recommended max,
// or more than 20% under the recommended min.
function lengthWarning(min: number, max: number, label: string) {
  const upper = Math.round(max * 1.2);
  const lower = Math.round(min * 0.8);
  return (value: string | undefined) => {
    if (!value) return true;
    const n = value.length;
    if (n > upper) return `${label} is ${n} chars — over by ${n - max}`;
    if (n < lower) return `${label} is only ${n} chars — under by ${min - n}`;
    return true;
  };
}

export const slugField = defineField({
  name: "slug",
  type: "slug",
  group: "seo",
  options: { source: "title", maxLength: 96 },
  validation: (r) => r.required(),
});

export const seoMetaFields = [
  defineField({
    name: "metaTitle",
    type: "string",
    group: "seo",
    description: "Recommended: 50–60 characters",
    options: { search: { weight: 30 } },
    validation: (r) => [
      r.required(),
      r.custom(lengthWarning(50, 60, "Meta title")).warning(),
    ],
  }),
  defineField({
    name: "metaDescription",
    type: "text",
    rows: 2,
    group: "seo",
    description: "Recommended: 120–160 characters",
    validation: (r) => [
      r.required(),
      r.custom(lengthWarning(120, 160, "Meta description")).warning(),
    ],
  }),
];

// Most documents have a routable slug + meta. Home is the exception (fixed `/`).
export const seoFields = [slugField, ...seoMetaFields];

export const languageField = defineField({
  name: "language",
  type: "string",
  readOnly: true,
  hidden: true,
});

export const metaFields = [
  { ...languageField, group: "meta" },
  defineField({
    name: "createdAt",
    type: "datetime",
    group: "meta",
    description:
      "Content creation date (auto-filled for new docs, imported from Webflow for migrated ones)",
    initialValue: () => new Date().toISOString(),
  }),
];
