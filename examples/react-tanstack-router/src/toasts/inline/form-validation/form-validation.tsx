import { useRef, useState } from "react";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./form-validation.tsx?raw";
import toastCss from "./toast.css?raw";

function ValidationToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "form-validation-toast pointer-events-auto relative rounded-2xl border border-(--line) bg-(--surface-strong) p-3 pr-10 shadow-sm",
  });

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...attributes}
      data-toast-placement={toast.options.placement ?? "top-right"}
    >
      <p className="text-sm font-semibold text-(--ink)">{toast.data.title}</p>
      <p className="mt-1 text-sm text-(--ink-soft)">{toast.data.body}</p>
      <button
        type="button"
        className="absolute right-3 top-3 text-xs text-(--ink-soft)"
        onClick={() => dismiss("user")}
      >
        Close
      </button>
    </article>
  );
}

function FormValidationPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>().toast;
  }

  const toast = storeRef.current;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: string[] = [];

    if (!name.trim()) errors.push("Name is required.");
    if (!email.trim()) errors.push("Email is required.");
    else if (!email.includes("@")) errors.push("Email must be valid.");

    if (errors.length > 0) {
      toast.error(
        { title: "Validation failed", body: errors.join(" ") },
        { containerId: "form-feedback", duration: 4500 },
      );
      return;
    }

    toast.success(
      { title: "Submitted", body: "The form passed validation." },
      { containerId: "form-feedback", duration: 3000 },
    );
  }

  return (
    <form
      className="rounded-[1.5rem] border border-(--line) bg-(--surface-strong) p-5"
      onSubmit={submit}
    >
      <div className="rounded-[1rem] border border-dashed border-(--line-strong) bg-(--surface-muted) p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--accent-strong)">
          Form feedback
        </p>
        <div className="mt-3 min-h-24 space-y-2">
          <Toaster store={toast} containerId="form-feedback" inline>
            <Toaster.List className="flex flex-col gap-2">
              <ValidationToast />
            </Toaster.List>
          </Toaster>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="text-sm text-(--ink-soft)">
          Name
          <input
            className="mt-2 w-full rounded-2xl border border-(--line) bg-transparent px-3 py-2 text-(--ink) outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="text-sm text-(--ink-soft)">
          Email
          <input
            className="mt-2 w-full rounded-2xl border border-(--line) bg-transparent px-3 py-2 text-(--ink) outline-none"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button type="submit" className="doc-button w-fit">
          Submit
        </button>
      </div>
    </form>
  );
}

const code = extractExampleSource(rawSource);

function FormValidationPage() {
  return (
    <ExamplePage
      category="Inline"
      title="Form validation"
      summary="Render validation feedback next to the form instead of at the viewport edge so users do not have to context-switch between their current task and a global notification stack."
      files={[
        { filename: "form-validation.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<FormValidationPreview />}
    />
  );
}

export { FormValidationPage };
