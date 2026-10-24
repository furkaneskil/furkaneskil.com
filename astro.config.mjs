// @ts-check
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import satteriCallouts from "satteri-callouts";
import { transformerMetaHighlight, transformerNotationDiff } from "@shikijs/transformers";
import mason from "./src/theme/mason.json";
import { codeFrame } from "./src/plugins/code-frame.mjs";

export default defineConfig({
  site: "https://furkaneskil.com",
  build: {
    // inline <style> would break the CSP
    inlineStylesheets: "never",
  },
  markdown: {
    processor: satteri({
      hastPlugins: [satteriCallouts()],
    }),
    shikiConfig: {
      theme: mason,
      wrap: false,
      transformers: [
        codeFrame(), // title="...", mark="..."
        transformerMetaHighlight(), // ```python {8}
        transformerNotationDiff(), // # [!code ++] / # [!code --]
      ],
    },
  },
});
