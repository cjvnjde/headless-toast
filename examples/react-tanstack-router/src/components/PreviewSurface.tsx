import type { ReactNode } from "react";

type PreviewSurfaceProps = {
  children: ReactNode;
};

function PreviewSurface({ children }: PreviewSurfaceProps) {
  return (
    <div className="doc-preview-surface">
      <div className="doc-preview-toolbar">
        <div className="doc-preview-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="doc-preview-label">Interactive preview canvas</p>
        <span className="doc-preview-note">
          Fixed-position demos use the browser viewport.
        </span>
      </div>
      <div className="doc-preview-content">{children}</div>
    </div>
  );
}

export { PreviewSurface };
