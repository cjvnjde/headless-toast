/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      tsconfigPath: "./tsconfig.build.json",
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
