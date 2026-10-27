"use client";

import { useEffect, useRef, useState } from "react";
import {
  NodeViewContent,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import { Check, Copy } from "lucide-react";

/** Clipboard API needs a secure context; fall back to a hidden textarea. */
async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function CodeBlockView({ node }: NodeViewProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    const ok = await writeToClipboard(node.textContent);
    if (!ok) return;

    setCopied(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <NodeViewWrapper className="smriti-codeblock group relative">
      <button
        type="button"
        contentEditable={false}
        // Keep the editor selection/focus while clicking the button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => void handleCopy()}
        title={copied ? "Copied" : "Copy code"}
        aria-label={copied ? "Copied" : "Copy code"}
        className={`absolute right-2 top-2 z-10 flex select-none items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-medium text-[var(--muted)] shadow-sm transition-all hover:bg-[var(--hover)] hover:text-[var(--foreground)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] [@media(hover:none)]:opacity-100 ${
          copied
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {copied ? (
          <>
            <Check size={13} />
            Copied
          </>
        ) : (
          <>
            <Copy size={13} />
            Copy
          </>
        )}
      </button>

      <pre>
        <NodeViewContent />
      </pre>
    </NodeViewWrapper>
  );
}