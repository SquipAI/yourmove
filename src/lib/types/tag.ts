import type { PostCard } from "./post";
import type { AlternateSlug } from "./tool";

export type Tag = {
  _id: string;
  slug: string;
  title: string;
};

export type TagPageData = Tag & {
  description: string | null;
  metaTitle: string;
  metaDescription: string;
  downloadHeading: string;
  alternates: AlternateSlug[] | null;
};

export type TagWithCount = Tag & {
  description: string | null;
  postCount: number;
};

export type TagWithPosts = TagWithCount & { posts: PostCard[] };
