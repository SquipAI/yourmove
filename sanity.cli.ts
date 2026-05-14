import { defineCliConfig } from "sanity/cli";
import path from "path";

export default defineCliConfig({
  api: {
    projectId: "jdxzhhce",
    dataset: "production",
  },
  vite: {
    resolve: {
      alias: {
        "@studio": path.resolve("./studio"),
        "@i18n": path.resolve("./src/i18n"),
      },
    },
  },
});
