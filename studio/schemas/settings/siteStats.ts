import { defineField, defineType } from "sanity";
import { TrendUpwardIcon, EditIcon } from "@sanity/icons";

// Singleton — fixed `_id: "site-stats"`. Global social-proof numbers
// (user count, rating). Used on /tools, future CTAs, footer, etc.
export const siteStats = defineType({
  name: "siteStats",
  title: "Site Stats",
  type: "document",
  icon: TrendUpwardIcon,
  __experimental_omnisearch_visibility: false,
  groups: [
    { name: "content", title: "Content", default: true, icon: EditIcon },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      hidden: true,
      readOnly: true,
      initialValue: "Site Stats",
    }),
    defineField({
      name: "userCount",
      type: "string",
      group: "content",
      description: 'Formatted total user count, e.g. "300K+"',
    }),
    defineField({
      name: "userRating",
      type: "string",
      group: "content",
      description: 'Average rating, e.g. "4.8"',
    }),
  ],
  preview: {
    select: {
      title: "title",
      userCount: "userCount",
      userRating: "userRating",
    },
    prepare: ({ title, userCount, userRating }) => ({
      title: title ?? "Site Stats",
      subtitle:
        [userCount, userRating && `${userRating}★`]
          .filter(Boolean)
          .join(" · ") || "—",
    }),
  },
});
