import { createFileRoute } from "@tanstack/react-router";
import { FormValidationPage } from "#/toasts/inline/form-validation/form-validation";

const Route = createFileRoute("/inline/form-validation")({
  component: FormValidationPage,
});

export { Route };
