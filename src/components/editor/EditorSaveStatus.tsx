
"use client";

import {
  Check,
  LoaderCircle,
  TriangleAlert,
  CloudOff,
} from "lucide-react";

export type SaveStatus = "saved" | "saving" | "error";

type EditorSaveStatusProps = {
  status: SaveStatus;
};

export default function EditorSaveStatus({
  status,
}: EditorSaveStatusProps) {
  if (status === "saving") {
    return (
      <div
        className="pointer-events-none flex items-center justify-center p-1.5 text-foreground/45"
        role="status"
        aria-label="Saving locally"
        title="Saving changes"
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-current/15" />
          <LoaderCircle
            className="absolute inset-0 h-5 w-5 animate-spin"
            strokeWidth={2.3}
          />
        </span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="pointer-events-none flex items-center justify-center p-1.5 text-foreground/75"
        role="status"
        aria-label="Save failed"
        title="Save failed"
      >
        <TriangleAlert className="h-5 w-5" strokeWidth={2.2} />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none flex items-center justify-center p-1.5 text-foreground/50"
      role="status"
      aria-label="Saved locally"
      title="Saved"
    >
      <span className="relative flex h-5 w-6 items-center">
        <Check
          className="absolute left-0 h-5 w-5 rounded-full"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Check
          className="absolute left-2 h-5 w-5 rounded-full"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </span>
    </div>
  );
}
