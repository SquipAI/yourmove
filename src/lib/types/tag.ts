import type { PostCard } from "./post";

export type Tag = {
  _id: string;
  slug: string;
  title: string;
};

export type TagPageData = Tag & {
  metaTitle: string;
  metaDescription: string;
};

export type TagWithCount = Tag & { postCount: number };

export type TagWithPosts = TagWithCount & { posts: PostCard[] };
