import { sanityClient } from "@lib/sanity";
import { HAS_PAGE_FILTER, POST_VISIBLE } from "@lib/queries/projections";
import type { Locale } from "@i18n/config";
import { ogRoute } from "./route";

export type OgEntry = { route: string; title: string };

type Row = { lang: Locale; slug: string; title: string };

// Singleton _type → its URL path segment ("home" is synthetic, the real path is "/").
const SINGLETON_SEGMENT: Record<string, string> = {
  home: "home",
  blog: "blog",
  "blog-posts": "blog/posts",
  "blog-tags": "blog/topics",
  tools: "tools",
  reviewsPage: "reviews",
  privacy: "privacy",
  terms: "terms",
};

const POST_FILTER = `_type == "post" && defined(slug.current) && count(body) > 0 && ${POST_VISIBLE}`;
const TAG_FILTER = `_type == "tag" && defined(slug.current) && count(*[_type == "post" && language == ^.language && references(^._id) && defined(slug.current) && count(body) > 0 && ${POST_VISIBLE}]) > 0`;
const LANG = `"lang": coalesce(language, "en")`;

// Every page that gets a generated OG card: { mirrored route, title to render }.
export async function getOgEntries(): Promise<OgEntry[]> {
  const [posts, tools, apps, tags, singletons] = await Promise.all([
    sanityClient.fetch<Row[]>(
      `*[${POST_FILTER}]{ ${LANG}, "slug": slug.current, title }`,
    ),
    sanityClient.fetch<Row[]>(
      `*[_type == "tool" && defined(slug.current)]{ ${LANG}, "slug": slug.current, title }`,
    ),
    sanityClient.fetch<Row[]>(
      `*[_type == "datingApp" && defined(slug.current) && ${HAS_PAGE_FILTER}]{ ${LANG}, "slug": slug.current, title }`,
    ),
    sanityClient.fetch<Row[]>(
      `*[${TAG_FILTER}]{ ${LANG}, "slug": slug.current, title }`,
    ),
    sanityClient.fetch<{ _type: string; lang: Locale; title: string }[]>(
      `*[_type in $types]{ _type, ${LANG}, title }`,
      { types: Object.keys(SINGLETON_SEGMENT) },
    ),
  ]);

  const entries: OgEntry[] = [
    ...posts.map((p) => ({ route: ogRoute(p.lang, `blog/${p.slug}`), title: p.title })),
    ...tools.map((t) => ({ route: ogRoute(t.lang, t.slug), title: t.title })),
    ...apps.map((a) => ({ route: ogRoute(a.lang, `tools/${a.slug}`), title: a.title })),
    ...tags.map((t) => ({ route: ogRoute(t.lang, `blog/topics/${t.slug}`), title: t.title })),
    ...singletons.map((s) => ({ route: ogRoute(s.lang, SINGLETON_SEGMENT[s._type]), title: s.title })),
  ];

  return entries;
}
