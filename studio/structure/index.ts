import type { StructureBuilder, StructureResolverContext } from "sanity/structure";
import type { ComponentType } from "react";
import {
  HomeIcon,
  LockIcon,
  DocumentTextIcon,
  LinkIcon,
  BookIcon,
  DocumentsIcon,
  FilterIcon,
  MenuIcon,
  CogIcon,
  PinIcon,
  ControlsIcon,
  TagIcon,
  ThListIcon,
  TrendUpwardIcon,
  CommentIcon,
} from "@sanity/icons";

const API_VERSION = "2026-05-23";

function localizedList(
  S: StructureBuilder,
  type: string,
  title: string,
  lang: string,
  icon?: ComponentType,
) {
  return S.listItem()
    .id(type)
    .title(title)
    .icon(icon)
    .schemaType(type)
    .child(
      S.documentTypeList(type)
        .title(title)
        .filter("_type == $type && language == $lang")
        .params({ type, lang }),
    );
}

function localizedSingleton(
  S: StructureBuilder,
  context: StructureResolverContext,
  type: string,
  baseId: string,
  title: string,
  lang: string,
  icon?: ComponentType,
) {
  const item = S.listItem().id(baseId).title(title).icon(icon);
  if (lang === "en") {
    return item.child(S.document().schemaType(type).documentId(baseId));
  }
  return item.child(async () => {
    const client = context.getClient({ apiVersion: API_VERSION });
    const localizedId = await client.fetch<string | null>(
      `*[_type=="translation.metadata" && count(translations[value._ref==$base]) > 0][0].translations[language==$lang][0].value._ref`,
      { base: baseId, lang },
    );
    return S.document()
      .schemaType(type)
      .documentId(localizedId ?? baseId);
  });
}

export function createStructure(lang: string) {
  return (S: StructureBuilder, context: StructureResolverContext) =>
    S.list()
      .title("Content")
      .items([
        localizedSingleton(S, context, "home", "home", "Home", lang, HomeIcon),
        S.divider(),
        S.listItem()
          .title("Blog")
          .id("blog-content")
          .icon(BookIcon)
          .child(
            S.list()
              .title("Blog")
              .items([
                S.listItem()
                  .title("Static pages")
                  .id("blog-static")
                  .icon(PinIcon)
                  .child(
                    S.list()
                      .title("Static pages")
                      .items([
                        localizedSingleton(S, context, "blog", "blog", "Blog Page", lang, BookIcon),
                        localizedSingleton(S, context, "blog-posts", "blog-posts", "Post List Page", lang, DocumentsIcon),
                        localizedSingleton(S, context, "blog-tags", "blog-tags", "Tag List Page", lang, FilterIcon),
                      ]),
                  ),
                S.divider(),
                localizedList(S, "post", "Posts", lang),
                localizedList(S, "tag", "Tags", lang),
              ]),
          ),
        S.divider(),
        S.listItem()
          .title("Tools")
          .id("tools-content")
          .icon(ControlsIcon)
          .child(
            S.list()
              .title("Tools")
              .items([
                localizedSingleton(S, context, "tools", "tools", "Tools Page", lang, ControlsIcon),
                S.divider(),
                localizedList(S, "tool", "Tools", lang, ControlsIcon),
                localizedList(S, "toolCategory", "Categories", lang, TagIcon),
                localizedList(S, "toolList", "Tool Lists", lang, ThListIcon),
                localizedList(S, "datingApp", "Dating Apps", lang),
              ]),
          ),
        S.divider(),
        S.listItem()
          .title("Reviews")
          .id("reviews-content")
          .icon(CommentIcon)
          .child(
            S.list()
              .title("Reviews")
              .items([
                localizedSingleton(S, context, "reviewsPage", "reviews", "Reviews Page", lang, CommentIcon),
                S.divider(),
                localizedList(S, "testimonial", "Testimonials", lang, CommentIcon),
              ]),
          ),
        S.divider(),
        S.listItem()
          .title("Settings")
          .id("settings")
          .icon(CogIcon)
          .child(
            S.list()
              .title("Settings")
              .items([
                localizedSingleton(S, context, "privacy", "privacy", "Privacy", lang, LockIcon),
                localizedSingleton(S, context, "terms", "terms", "Terms", lang, DocumentTextIcon),
                S.divider(),
                S.listItem()
                  .title("Site Stats")
                  .id("site-stats")
                  .icon(TrendUpwardIcon)
                  .child(
                    S.document()
                      .schemaType("siteStats")
                      .documentId("site-stats"),
                  ),
                S.divider(),
                S.listItem()
                  .title("Footer Nav")
                  .id("footer-nav")
                  .icon(MenuIcon)
                  .child(
                    S.document()
                      .schemaType("footerNav")
                      .documentId("footer-nav"),
                  ),
                S.divider(),
                S.documentTypeListItem("siteLink")
                  .title("External Links")
                  .icon(LinkIcon),
                localizedList(S, "pressLogo", "Press", lang, CommentIcon),
              ]),
          ),
      ]);
}
