import { defineField, defineType } from "sanity";
import { CommentIcon, EditIcon, CogIcon } from "@sanity/icons";
import { languageField, hiddenOnNonEn } from "../shared";

// Press mentions: logo + optional localized pull quote.
// Document-level i18n: name/logo/order/hidden are canonical EN; the per-locale
// sibling docs only edit `quote`. (Internal `_type` kept as `pressLogo` to
// preserve existing data.)
export const press = defineType({
  name: "pressLogo",
  title: "Press",
  type: "document",
  icon: CommentIcon,
  __experimental_omnisearch_visibility: false,
  groups: [
    { name: "content", title: "Content", default: true, icon: EditIcon },
    { name: "meta", title: "Meta", icon: CogIcon },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name *",
      type: "string",
      group: "content",
      description: 'Outlet name, e.g. "Wall Street Journal"',
      hidden: hiddenOnNonEn,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo *",
      type: "image",
      group: "content",
      description: "Wordmark logo. SVG preferred, dark/black version.",
      options: { accept: "image/svg+xml,image/png,image/avif,image/webp" },
      hidden: hiddenOnNonEn,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 3,
      group: "content",
      description:
        "Optional pull quote. Entries with a quote render as press-quote cards; entries without are used only in the logo strip.",
    }),
    defineField({
      name: "citationUrl",
      title: "Article URL",
      type: "url",
      group: "content",
      description: "Source article. Used as the card link and schema citation.",
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "order",
      type: "number",
      group: "meta",
      description:
        "Lower numbers (1, 2, 3…) appear first. Leave empty to sort alphabetically.",
      hidden: hiddenOnNonEn,
    }),
    defineField({
      name: "hidden",
      title: "Hidden from logo strip",
      type: "boolean",
      group: "meta",
      description:
        "Skip in the \"as seen on\" logo row. The pull quote still shows in the quote cards if set.",
      initialValue: false,
      hidden: hiddenOnNonEn,
    }),
    { ...languageField, group: "meta" },
  ],
  preview: {
    select: { title: "name", media: "logo", hidden: "hidden" },
    prepare: ({ title, media, hidden }) => ({
      title: hidden ? `${title} (hidden)` : title,
      media,
    }),
  },
});
