import { post } from "./blog/post";
import { tool } from "./tool";
import { toolCategory } from "./toolCategory";
import { datingApp } from "./datingApp";
import { tools } from "./tools";
import { tag } from "./blog/tag";
import { howToUse } from "./howToUse";
import { siteLink } from "./settings/siteLink";
import { home } from "./home";
import { blog } from "./blog/blog";
import { blogPosts } from "./blog/blogPosts";
import { blogTags } from "./blog/blogTags";
import { privacy, terms } from "./settings/legalPage";
import { headerNav } from "./settings/headerNav";
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
  headerNav,
  footerNav,
  siteStats,
  post,
  tool,
  toolCategory,
  datingApp,
  tag,
  howToUse,
  siteLink,
];

export const translatedSchemaTypes = [
  "post",
  "tool",
  "toolCategory",
  "datingApp",
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
  "privacy",
  "terms",
  "headerNav",
  "footerNav",
  "siteStats",
];
