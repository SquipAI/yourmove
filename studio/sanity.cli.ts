import { defineCliConfig } from "sanity/cli";
import path from "path";

export default defineCliConfig({
  api: {
    projectId: "jdxzhhce",
    dataset: "production",
  },
  deployment: {
    appId: "hdqaqvn8p08267sp652vjhbl",
  },
  vite: {
    resolve: {
      alias: {
        "@studio": path.resolve("."),
        "@i18n": path.resolve("../src/i18n"),
        "@lib": path.resolve("../src/lib"),
      },
    },
  },
});
