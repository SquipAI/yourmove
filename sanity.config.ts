import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { documentInternationalization } from "@sanity/document-internationalization";
import { RocketIcon } from "@sanity/icons";
import {
  schemaTypes,
  translatedSchemaTypes,
  SINGLETON_TYPES,
} from "@studio/schemas";
import { DeployTool } from "@studio/plugins/DeployTool";
import { createStructure } from "@studio/structure";
import { wrapPublishWithKindSync } from "@studio/actions/syncToolKind";

const SUPPORTED_LANGUAGES = [
  { id: "en", title: "English", flag: "🇺🇸" },
  { id: "es", title: "Spanish", flag: "🇪🇸" },
  { id: "de", title: "German", flag: "🇩🇪" },
];

const sharedConfig = {
  projectId: "jdxzhhce",
  dataset: "production",
  schema: {
    types: schemaTypes,
    templates: (prev: any) =>
      prev.filter((t: any) => !SINGLETON_TYPES.includes(t.schemaType)),
  },
  tools: [
    {
      name: "deploy",
      title: "Deploy",
      icon: RocketIcon,
      component: DeployTool,
    },
  ],
  document: {
    // On EN tool publish, mirror `kind` onto the ES/DE siblings.
    actions: (prev: any[], context: { schemaType: string }) =>
      context.schemaType === "tool"
        ? prev.map((a) =>
            a.action === "publish" ? wrapPublishWithKindSync(a) : a,
          )
        : prev,
  },
};

export default defineConfig(
  SUPPORTED_LANGUAGES.map((lang) => ({
    ...sharedConfig,
    name: lang.id,
    title: `${lang.flag} ${lang.title}`,
    basePath: `/${lang.id}`,
    plugins: [
      structureTool({ structure: createStructure(lang.id) }),
      documentInternationalization({
        supportedLanguages: SUPPORTED_LANGUAGES,
        schemaTypes: translatedSchemaTypes,
        weakReferences: true,
        metadataOmnisearchVisibility: false,
      }),
    ],
  })),
);
