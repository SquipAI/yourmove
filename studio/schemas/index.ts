import { post } from "./blog/post";
import { tool } from "./tool";
import { toolCategory } from "./toolCategory";
import { toolList } from "./toolList";
import { datingApp } from "./datingApp";
import { testimonial } from "./testimonial";
import { reviewsPage } from "./reviewsPage";
import { tools } from "./tools";
import { tag } from "./blog/tag";
import { howToUse } from "./howToUse";
import { siteLink } from "./settings/siteLink";
import { home } from "./home";
import { blog } from "./blog/blog";
import { blogPosts } from "./blog/blogPosts";
import { blogTags } from "./blog/blogTags";
import { privacy, terms } from "./settings/legalPage";
import { footerNav } from "./settings/footerNav";
import { siteStats } from "./settings/siteStats";

export const schemaTypes = [
  home,
  blog,
  blogPosts,
  blogTags,
  tools,
  privacy,
  terms,
  footerNav,
  siteStats,
  post,
  tool,
  toolCategory,
  toolList,
  datingApp,
  testimonial,
  reviewsPage,
  tag,
  howToUse,
  siteLink,
];

export const translatedSchemaTypes = [
  "post",
  "tool",
  "toolCategory",
  "toolList",
  "datingApp",
  "testimonial",
  "reviewsPage",
  "tag",
  "howToUse",
  "privacy",
  "terms",
  "home",
  "blog",
  "blog-posts",
  "blog-tags",
  "tools",
];

export const SINGLETON_TYPES = [
  "home",
  "blog",
  "blog-posts",
  "blog-tags",
  "tools",
  "reviewsPage",
  "privacy",
  "terms",
  "footerNav",
  "siteStats",
];
