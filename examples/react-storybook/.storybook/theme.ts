import { create } from "storybook/theming";

const headlessToastTheme = create({
  base: "light",
  brandTitle: "headless-toast",
  brandTarget: "_self",
  colorPrimary: "#4f46e5",
  colorSecondary: "#6366f1",
  appBg: "#f6f7fb",
  appContentBg: "#ffffff",
  appPreviewBg: "#ffffff",
  appBorderColor: "rgba(15, 23, 42, 0.08)",
  appBorderRadius: 12,
  fontBase: '"IBM Plex Sans", "Avenir Next", "Segoe UI", sans-serif',
  fontCode: '"IBM Plex Mono", "SFMono-Regular", monospace',
  textColor: "#111827",
  textInverseColor: "#ffffff",
  barBg: "#ffffff",
  barTextColor: "#111827",
  barSelectedColor: "#4f46e5",
  inputBg: "#ffffff",
  inputBorder: "rgba(15, 23, 42, 0.12)",
  inputTextColor: "#111827",
  inputBorderRadius: 8,
});

export { headlessToastTheme };
