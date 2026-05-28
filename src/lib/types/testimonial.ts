export type TestimonialSource = "web" | "reddit" | "appStore" | "productHunt";

export type Testimonial = {
  _id: string;
  authorName: string;
  body: string;
  source: TestimonialSource;
  sourceUrl: string | null;
  rating: number | null;
  avatar: { url: string; alt: string | null } | null;
  featured: boolean;
};

export type ReviewsPageData = {
  title: string;
  description: string | null;
  metaTitle: string;
  metaDescription: string;
};

export type TestimonialBuckets = {
  specific: Testimonial[];
  generic: Testimonial[];
};
