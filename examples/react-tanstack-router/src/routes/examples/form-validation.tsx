import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "../../components/ExamplePage";
import { extractRouteExampleSource } from "../../lib/exampleSource";
import rawSource from "./form-validation.tsx?raw";

export const Route = createFileRoute("/examples/form-validation")({
  component: FormValidationPage,
});

function ValidationToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "pointer-events-auto relative rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-3 pr-10 shadow-sm",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-sm font-semibold text-[var(--ink)]">
        {toast.data.title}
      </p>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">{toast.data.body}</p>
      <button
        type="button"
        className="absolute right-3 top-3 text-xs text-[var(--ink-soft)]"
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
      className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"
      onSubmit={submit}
    >
      <div className="rounded-[1rem] border border-dashed border-[var(--line-strong)] bg-[var(--surface-muted)] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
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
        <label className="text-sm text-[var(--ink-soft)]">
          Name
          <input
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)] outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="text-sm text-[var(--ink-soft)]">
          Email
          <input
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)] outline-none"
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

const code = extractRouteExampleSource(rawSource);

function FormValidationPage() {
  return (
    <ExamplePage
      category="Inline"
      title="Form validation"
      summary="Render validation feedback next to the form instead of at the viewport edge so users do not have to context-switch between their current task and a global notification stack."
      files={[{ filename: "form-validation.tsx", language: "tsx", code }]}
      preview={<FormValidationPreview />}
    />
  );
}
