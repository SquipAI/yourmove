import { post } from "./blog/post";
import { tool } from "./tools/tool";
import { toolCategory } from "./tools/toolCategory";
import { toolList } from "./tools/toolList";
import { datingApp } from "./tools/datingApp";
import { testimonial } from "./testimonial";
import { reviewsPage } from "./reviewsPage";
import { tools } from "./tools/tools";
import { tag } from "./blog/tag";
import { siteLink } from "./settings/siteLink";
import { home } from "./home";
import { blog } from "./blog/blog";
import { blogPosts } from "./blog/blogPosts";
import { blogTags } from "./blog/blogTags";
import { privacy, terms } from "./settings/legalPage";
import { footerNav } from "./settings/footerNav";
import { siteStats } from "./settings/siteStats";
import { press } from "./settings/press";

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
  siteLink,
  press,
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
  "privacy",
  "terms",
  "home",
  "blog",
  "blog-posts",
  "blog-tags",
  "tools",
  "pressLogo",
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
