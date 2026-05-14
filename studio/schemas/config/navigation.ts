import { defineArrayMember, defineField, defineType } from "sanity";
import { MenuIcon } from "@sanity/icons";

export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  icon: MenuIcon,
  __experimental_omnisearch_visibility: false,
  fields: [
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "target",
              type: "reference",
              to: [
                { type: "home" },
                { type: "blog" },
                { type: "privacy" },
                { type: "terms" },
                { type: "tool" },
                { type: "siteLink" },
              ],
              options: { disableNew: true },
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { label: "label", type: "target._type" },
            prepare: ({ label, type }) => ({ title: label, subtitle: type }),
          },
        }),
      ],
    }),
    defineField({
      name: "navId",
      title: "Nav ID",
      type: "slug",
      readOnly: true,
      description: 'Stable identifier: "header" or "footer"',
    }),
  ],
  preview: {
    select: { navId: "navId.current" },
    prepare: ({ navId }) => ({ title: `Nav: ${navId ?? "unnamed"}` }),
  },
});
