import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import babel from "@rolldown/plugin-babel";

const repoRoot = resolve(import.meta.dirname, "../..");

function copySpaFallback() {
  return {
    name: "copy-spa-fallback",
    writeBundle() {
      const distDir = resolve(import.meta.dirname, "dist");
      const indexPath = resolve(distDir, "index.html");
      const fallbackPath = resolve(distDir, "404.html");
      const html = readFileSync(indexPath, "utf8");

      writeFileSync(fallbackPath, html);
    },
  };
}

const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    tailwindcss(),
    react(),
    copySpaFallback(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
  resolve: {
    alias: {
      "@headless-toast/react": resolve(repoRoot, "adapters/react/src/index.ts"),
      "@headless-toast/core": resolve(repoRoot, "core/src/index.ts"),
    },
    tsconfigPaths: true,
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
