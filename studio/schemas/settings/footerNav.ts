import { defineArrayMember, defineField, defineType } from "sanity";
import { MenuIcon } from "@sanity/icons";
import { navItemMember } from "../shared";

export const footerNav = defineType({
  name: "footerNav",
  title: "Footer",
  type: "document",
  icon: MenuIcon,
  __experimental_omnisearch_visibility: false,
  fields: [
    defineField({
      name: "tagline",
      type: "string",
    }),
    defineField({
      name: "columns",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "items",
              type: "array",
              of: [navItemMember],
            }),
          ],
          preview: {
            select: { title: "title" },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {},
    prepare: () => ({ title: "Footer" }),
  },
});
