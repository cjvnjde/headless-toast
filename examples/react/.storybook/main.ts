import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../../..");
const basePath = process.env.STORYBOOK_BASE_PATH ?? "/";

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.mdx", "../src/stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) =>
    mergeConfig(config, {
      base: basePath,
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          "@headless-toast/react": resolve(
            repoRoot,
            "adapters/react/src/index.ts",
          ),
          "@headless-toast/core": resolve(repoRoot, "core/src/index.ts"),
        },
      },
      optimizeDeps: {
        exclude: ["@headless-toast/react", "@headless-toast/core"],
      },
      server: {
        fs: {
          allow: [repoRoot],
        },
      },
    }),
};

export default config;
