import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { documentInternationalization } from "@sanity/document-internationalization";
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
  RocketIcon,
  ControlsIcon,
  TagIcon,
  TrendUpwardIcon,
} from "@sanity/icons";
import {
  schemaTypes,
  translatedSchemaTypes,
  SINGLETON_TYPES,
} from "@studio/schemas";
import { DeployTool } from "@studio/plugins/DeployTool";

const SINGLETON_ICONS: Record<string, ComponentType> = {
  home: HomeIcon,
  blog: BookIcon,
  "blog-posts": DocumentsIcon,
  "blog-tags": FilterIcon,
  tools: ControlsIcon,
  privacy: LockIcon,
  terms: DocumentTextIcon,
};

const SUPPORTED_LANGUAGES = [
  { id: "en", title: "English" },
  { id: "es", title: "Spanish" },
  { id: "de", title: "German" },
];

export default defineConfig({
  name: "yourmove",
  title: "YourMove AI",
  projectId: "jdxzhhce",
  dataset: "production",
  basePath: "/studio",

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Home")
              .id("home")
              .icon(HomeIcon)
              .child(S.document().schemaType("home").documentId("home")),
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
                            S.listItem()
                              .title("Blog Page")
                              .id("blog")
                              .icon(BookIcon)
                              .child(
                                S.document()
                                  .schemaType("blog")
                                  .documentId("blog"),
                              ),
                            S.listItem()
                              .title("Post List Page")
                              .id("blog-posts")
                              .icon(DocumentsIcon)
                              .child(
                                S.document()
                                  .schemaType("blog-posts")
                                  .documentId("blog-posts"),
                              ),
                            S.listItem()
                              .title("Tag List Page")
                              .id("blog-tags")
                              .icon(FilterIcon)
                              .child(
                                S.document()
                                  .schemaType("blog-tags")
                                  .documentId("blog-tags"),
                              ),
                          ]),
                      ),
                    S.divider(),
                    S.documentTypeListItem("post").title("Posts"),
                    S.documentTypeListItem("tag").title("Tags"),
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
                    S.listItem()
                      .title("Tools Page")
                      .id("tools")
                      .icon(ControlsIcon)
                      .child(
                        S.document().schemaType("tools").documentId("tools"),
                      ),
                    S.divider(),
                    S.documentTypeListItem("tool")
                      .title("Tools")
                      .icon(ControlsIcon),
                    S.documentTypeListItem("toolCategory")
                      .title("Categories")
                      .icon(TagIcon),
                    S.documentTypeListItem("datingApp").title("Dating Apps"),
                  ]),
              ),
            S.documentTypeListItem("howToUse").title("How to Use"),
            S.divider(),
            S.listItem()
              .title("Settings")
              .id("settings")
              .icon(CogIcon)
              .child(
                S.list()
                  .title("Settings")
                  .items([
                    S.listItem()
                      .title("Privacy")
                      .id("privacy")
                      .icon(LockIcon)
                      .child(
                        S.document()
                          .schemaType("privacy")
                          .documentId("privacy"),
                      ),
                    S.listItem()
                      .title("Terms")
                      .id("terms")
                      .icon(DocumentTextIcon)
                      .child(
                        S.document().schemaType("terms").documentId("terms"),
                      ),
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
                      .title("Header Nav")
                      .id("header-nav")
                      .icon(MenuIcon)
                      .child(
                        S.document()
                          .schemaType("headerNav")
                          .documentId("header-nav"),
                      ),
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
                  ]),
              ),
          ]),
    }),
    documentInternationalization({
      supportedLanguages: SUPPORTED_LANGUAGES,
      schemaTypes: translatedSchemaTypes,
    }),
  ],

  schema: {
    types: schemaTypes,
    templates: (prev) =>
      prev.filter((t) => !SINGLETON_TYPES.includes(t.schemaType)),
  },

  tools: [
    {
      name: "deploy",
      title: "Deploy",
      icon: RocketIcon,
      component: DeployTool,
    },
  ],
});
