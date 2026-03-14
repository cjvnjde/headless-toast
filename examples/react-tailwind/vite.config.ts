import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../..");

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      "@headless-toast/react": resolve(repoRoot, "adapters/react/src/index.ts"),
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
});
