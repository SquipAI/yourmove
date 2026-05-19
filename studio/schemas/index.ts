import { post } from "./blog/post";
import { tool } from "./tool";
import { tag } from "./blog/tag";
import { howToUse } from "./howToUse";
import { siteLink } from "./config/siteLink";
import { home } from "./home";
import { blog } from "./blog/blog";
import { blogPosts } from "./blog/blogPosts";
import { blogTags } from "./blog/blogTags";
import { privacy, terms } from "./config/legalPage";
import { headerNav } from "./config/headerNav";
import { footerNav } from "./config/footerNav";

export const schemaTypes = [
  home,
  blog,
  blogPosts,
  blogTags,
  privacy,
  terms,
  headerNav,
  footerNav,
  post,
  tool,
  tag,
  howToUse,
  siteLink,
];

export const translatedSchemaTypes = [
  "post",
  "tool",
  "tag",
  "howToUse",
  "privacy",
  "terms",
  "home",
  "blog",
  "blog-posts",
  "blog-tags",
];

export const SINGLETON_TYPES = [
  "home",
  "blog",
  "blog-posts",
  "blog-tags",
  "privacy",
  "terms",
  "headerNav",
  "footerNav",
];
