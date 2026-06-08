import { defineArrayMember, defineField, defineType } from "sanity";
import { ThListIcon, EditIcon, StarIcon } from "@sanity/icons";
import { languageField, hiddenOnNonEn } from "../shared";

export const toolList = defineType({
  name: "toolList",
  title: "Tool Lists",
  type: "document",
  icon: ThListIcon,
  groups: [
    { name: "content", title: "Content", default: true, icon: EditIcon },
    { name: "meta", title: "Meta", icon: StarIcon },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title *",
      type: "string",
      group: "content",
      description: "Section heading (e.g. 'More tools for dating')",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subtitle",
      type: "text",
      rows: 2,
      group: "content",
      description: "Optional small text under the title",
    }),
    defineField({
      name: "groups",
      title: "Groups *",
      type: "array",
      group: "content",
      hidden: hiddenOnNonEn,
      validation: (r) => r.required().min(1).max(6),
      of: [
        defineArrayMember({
          type: "object",
          name: "toolListGroup",
          fields: [
            defineField({
              name: "heading",
              title: "Heading *",
              type: "string",
              description: "Column heading (e.g. 'Profile Generator')",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "tools",
              title: "Tools *",
              type: "array",
              of: [
                defineArrayMember({
                  type: "reference",
                  to: [{ type: "tool" }],
                  options: { disableNew: true },
                }),
              ],
              validation: (r) => r.required().min(1),
            }),
          ],
          preview: {
            select: { title: "heading", tools: "tools" },
            prepare: ({ title, tools }) => ({
              title,
              subtitle: `${(tools ?? []).length} tool${tools?.length === 1 ? "" : "s"}`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "isDefault",
      type: "boolean",
      group: "meta",
      description:
        "Used as the fallback when a tool doesn't pick its own list. Exactly one default per language.",
      initialValue: false,
      hidden: hiddenOnNonEn,
    }),
    languageField,
  ],
  preview: {
    select: { title: "title", subtitle: "language", isDefault: "isDefault" },
    prepare: ({ title, subtitle, isDefault }) => ({
      title: isDefault ? `★ ${title}` : title,
      subtitle: subtitle?.toUpperCase(),
    }),
  },
});
