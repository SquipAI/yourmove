import { defineField, defineArrayMember } from "sanity";
import type { FieldGroupDefinition } from "sanity";
import { EditIcon, SearchIcon, CogIcon } from "@sanity/icons";
import { linkableTo } from "@lib/links/sanity";

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
        to: linkableTo({ withSiteLink: false }),
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

// Uniqueness scoped to (type, language) — default Sanity check spans the whole
// dataset and trips when EN/ES/DE share the same slug.
const slugIsUnique: import("sanity").SlugOptions["isUnique"] = async (
  slug,
  context,
) => {
  const { document, getClient } = context;
  if (!document?._type) return true;
  const client = getClient({ apiVersion: "2026-05-07" });
  const id = document._id.replace(/^drafts\./, "");
  const params = {
    type: document._type,
    slug,
    lang: document.language ?? "en",
    draft: `drafts.${id}`,
    published: id,
  };
  const dup = await client.fetch(
    `count(*[_type == $type
      && slug.current == $slug
      && coalesce(language, "en") == $lang
      && !(_id in [$draft, $published])])`,
    params,
  );
  return dup === 0;
};

export const slugField = ({ source = "title" }: { source?: string } = {}) =>
  defineField({
    name: "slug",
    type: "slug",
    group: "seo",
    options: { source, maxLength: 96, isUnique: slugIsUnique },
    validation: (r) => r.required(),
  });

export const seoMetaFields = [
  defineField({
    name: "metaTitle",
    type: "string",
    group: "seo",
    description: "Recommended: 50–60 characters",
    options: { search: { weight: 80 } },
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
export const seoFields = [slugField(), ...seoMetaFields];

// Unified H1 + subtitle for any document that backs a page.
export function pageTitleField({
  path,
  initialValue,
  searchWeight,
  group = "content",
}: {
  path: string;
  initialValue?: string;
  searchWeight?: number;
  group?: string;
}) {
  return defineField({
    name: "title",
    type: "string",
    group,
    description: `Page heading (H1) on ${path}. Wrap a phrase in *asterisks* to color it brand.`,
    initialValue,
    validation: (r) => r.required(),
    ...(searchWeight !== undefined && {
      options: { search: { weight: searchWeight } },
    }),
  });
}

// Short label shown in the header navigation. Per-locale via document-i18n.
export function navLabelField(initialValue: string, group = "content") {
  return defineField({
    name: "navLabel",
    type: "string",
    group,
    description: "Short label shown in the header nav.",
    initialValue,
    validation: (r) => r.required(),
  });
}

export function pageDescriptionField({
  searchWeight,
  group = "content",
}: { searchWeight?: number; group?: string } = {}) {
  return defineField({
    name: "description",
    type: "text",
    rows: 3,
    group,
    description:
      "Intro paragraph shown under the H1. Wrap a phrase in *asterisks* to color it brand.",
    ...(searchWeight !== undefined && {
      options: { search: { weight: searchWeight } },
    }),
  });
}

export const languageField = defineField({
  name: "language",
  type: "string",
  readOnly: true,
  hidden: true,
});

// Field-level translation: produces a Sanity object with one sub-field per
// locale. Use for short UI strings (nav labels, captions) on documents that
// are NOT translated at the document level. Renders as `{ en, es, de }`.
// `required: "default"` requires only the default locale; "all" requires all.
import { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE } from "@i18n/config";
export function translatedField(
  name: string,
  title: string,
  {
    required = "default",
    type = "string",
    rows,
    description,
    group,
  }: {
    required?: "all" | "default" | false;
    type?: "string" | "text";
    rows?: number;
    description?: string;
    group?: string;
  } = {},
) {
  return defineField({
    name,
    title,
    type: "object",
    group,
    description,
    fields: LOCALES.map((lang) =>
      defineField({
        name: lang,
        title: LOCALE_LABELS[lang],
        type,
        ...(type === "text" && rows !== undefined ? { rows } : {}),
        validation:
          required === "all" ||
          (required === "default" && lang === DEFAULT_LOCALE)
            ? (r) => r.required()
            : undefined,
      }),
    ),
  });
}

// Hide a field on non-EN documents. Use for fields that are canonical (edited
// on EN only) and inherited by locales at render time via translation.metadata.
import type { ConditionalPropertyCallbackContext } from "sanity";
export const hiddenOnNonEn = ({ document }: ConditionalPropertyCallbackContext) =>
  (document as { language?: string } | undefined)?.language !== "en";

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

// Shared FAQ item — reused by `tool` (flat `faq` array) and `home`
// (nested `faq.items`). Question (plain string) + answer (inline rich-text blocks).
export const faqItemMember = defineArrayMember({
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
});

export const faqArrayField = () =>
  defineField({
    name: "faq",
    type: "array",
    group: "content",
    of: [faqItemMember],
  });

// Shared preview block for routable / singleton page schemas — title from the
// `title` field with optional fallback, language code uppercased as subtitle.
// `tool`/`howToUse`/`datingApp` use custom previews with media or different
// title fields; this helper covers the remaining ~8 page docs.
export function singletonPagePreview(defaultTitle?: string) {
  return {
    select: { title: "title", subtitle: "language" },
    prepare: ({
      title,
      subtitle,
    }: {
      title?: string;
      subtitle?: string;
    }) => ({
      title: title ?? defaultTitle,
      subtitle: subtitle?.toUpperCase(),
    }),
  };
}

