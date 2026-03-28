import { useState, type FormEvent } from "react";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./form-validation.tsx?raw";

const toast = createToast<{ title: string; body: string }>().toast;

function ValidationToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 pr-10 shadow-sm",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {toast.data.title}
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {toast.data.body}
      </p>
      <button
        type="button"
        aria-label="Close toast"
        className="absolute right-3 top-3 inline-flex cursor-pointer h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition duration-150 hover:bg-slate-100 hover:shadow-sm dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        onClick={() => dismiss("user")}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          <path d="M4 4l8 8" />
          <path d="M12 4 4 12" />
        </svg>
      </button>
    </article>
  );
}

function FormValidationPreview() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
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
      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
      onSubmit={submit}
    >
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 p-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
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
        <label className="text-sm text-slate-600 dark:text-slate-300">
          Name
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-slate-950 dark:text-slate-50 outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300">
          Email
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-slate-950 dark:text-slate-50 outline-none"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button
          type="submit"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition  hover:bg-indigo-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
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
      files={[{ filename: "form-validation.tsx", language: "tsx", code }]}
      preview={<FormValidationPreview />}
    />
  );
}

export { FormValidationPage };
