export type HomeData = {
  title: string;
  metaTitle: string;
  metaDescription: string;
};

export type LegalPageData = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  body: unknown[] | null;
};

export type BlogPageData = {
  title: string;
  description: string | null;
  metaTitle: string;
  metaDescription: string;
};

export type BlogSubPageData = {
  title: string | null;
  metaTitle: string;
  metaDescription: string;
};

export type SiteStats = {
  userCount: string | null;
  userRating: string | null;
};
