import { defineField, defineType } from "sanity";
import { TrendUpwardIcon } from "@sanity/icons";

// Singleton — fixed `_id: "site-stats"`. Global social-proof numbers
// (user count, rating). Used on /tools, future CTAs, footer, etc.
export const siteStats = defineType({
  name: "siteStats",
  title: "Site Stats",
  type: "document",
  icon: TrendUpwardIcon,
  __experimental_omnisearch_visibility: false,
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
      title: "User Count *",
      type: "string",
      description: 'Formatted total user count, e.g. "300K+"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "userRating",
      title: "User Rating *",
      type: "string",
      description: 'Average rating, e.g. "4.8"',
      validation: (r) => r.required(),
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
