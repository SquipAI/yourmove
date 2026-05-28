import { defineArrayMember, defineField, defineType } from "sanity";
import { MenuIcon } from "@sanity/icons";
import { translatedField } from "../shared";
import { linkableTo } from "@lib/links/sanity";

const navItem = defineArrayMember({
  type: "reference",
  to: linkableTo({ exclude: ["post", "tag"] }),
  options: { disableNew: true },
  weak: true,
});

export const footerNav = defineType({
  name: "footerNav",
  title: "Footer",
  type: "document",
  icon: MenuIcon,
  __experimental_omnisearch_visibility: false,
  fields: [
    translatedField("tagline", "Tagline", { required: false }),
    defineField({
      name: "columns",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            translatedField("title", "Title", { required: "default" }),
            defineField({
              name: "items",
              type: "array",
              of: [navItem],
            }),
          ],
          preview: {
            select: { title: "title.en" },
            prepare: ({ title }) => ({ title: title || "Column" }),
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Footer" }),
  },
});
