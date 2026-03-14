import { addons } from "storybook/manager-api";
import { headlessToastTheme } from "./theme";

addons.setConfig({
  navSize: 320,
  showPanel: true,
  theme: headlessToastTheme,
});
