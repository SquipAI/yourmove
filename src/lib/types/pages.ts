export type HomeData = {
  metaTitle: string;
  metaDescription: string;
};

export type LegalPageData = {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  body: unknown[] | null;
};

export type BlogHubData = {
  title: string | null;
  intro: string | null;
  metaTitle: string;
  metaDescription: string;
};

export type BlogSubPageData = {
  title: string | null;
  metaTitle: string;
  metaDescription: string;
};
