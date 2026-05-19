import { defineField, defineType } from "sanity";
import { MenuIcon } from "@sanity/icons";
import { navItemMember } from "../shared";

export const headerNav = defineType({
  name: "headerNav",
  title: "Header",
  type: "document",
  icon: MenuIcon,
  __experimental_omnisearch_visibility: false,
  fields: [
    defineField({
      name: "items",
      type: "array",
      of: [navItemMember],
    }),
  ],
  preview: {
    select: {},
    prepare: () => ({ title: "Header" }),
  },
});
