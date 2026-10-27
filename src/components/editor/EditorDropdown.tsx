"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

import { useIsMobile } from "@/hooks/useIsMobile";

interface EditorDropdownProps {
  label: string;
  icon?: ReactNode;
  trigger?: ReactNode;
  triggerClassName?: string;
  children: (close: () => void) => ReactNode;
  width?: number;
}

interface EditorDropdownItemProps {
  children: ReactNode;
  active?: boolean;
  selected?: boolean;
  onClick: () => void;
}

export function EditorDropdownItem({
  children,
  active = false,
  selected = false,
  onClick,
}: EditorDropdownItemProps) {
  const isActive = active || selected;

  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 md:py-2",
        "text-left text-[13px] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
        isActive
          ? "bg-[var(--active)] font-medium text-[var(--foreground)]"
          : "text-[var(--foreground)] hover:bg-[var(--hover)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function EditorDropdown({
  label,
  icon,
  trigger,
  triggerClassName,
  children,
  width = 200,
}: EditorDropdownProps) {
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    maxHeight: 320,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function close() {
    setOpen(false);
  }

  function updatePosition() {
    const triggerElement = triggerRef.current;
    if (!triggerElement) return;

    const rect = triggerElement.getBoundingClientRect();
    const viewportPadding = 8;
    const gap = 12;

    const menuWidth = Math.min(width, window.innerWidth - viewportPadding * 2);
    const left = Math.max(
      viewportPadding,
      Math.min(
        rect.left,
        window.innerWidth - menuWidth - viewportPadding,
      ),
    );

    const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
    const spaceAbove = rect.top - gap - viewportPadding;
    const estimatedMenuHeight = 280;

    const openBelow =
      spaceBelow >= estimatedMenuHeight || spaceBelow >= spaceAbove;

    const availableHeight = Math.max(
      120,
      openBelow ? spaceBelow : spaceAbove,
    );

    const top = openBelow
      ? rect.bottom + gap
      : Math.max(
          viewportPadding,
          rect.top - Math.min(estimatedMenuHeight, availableHeight) - gap,
        );

    setPosition({
      top,
      left,
      maxHeight: availableHeight,
    });
  }

  useEffect(() => {
    if (!open) return;

    updatePosition();

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      close();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, width]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={open}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (!open) updatePosition();
          setOpen((current) => !current);
        }}
        className={[
          "inline-flex h-9 shrink-0 items-center justify-center gap-1.5",
          "rounded-xl px-2 text-[var(--muted)] transition-all duration-200",
          "hover:bg-[var(--hover)] hover:text-[var(--foreground)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
          open ? "bg-[var(--active)] text-[var(--foreground)]" : "",
          triggerClassName ?? "",
        ].join(" ")}
      >
        {trigger ?? icon}

        <ChevronDown
          size={13}
          className={[
            "shrink-0 text-[var(--muted)] transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {mounted &&
        open &&
        createPortal(
          isMobile ? (
            /* Phones: bottom sheet (easy to reach with a thumb) */
            <div className="fixed inset-0 z-[9999]">
              <div className="absolute inset-0 bg-black/40" />

              <div
                ref={menuRef}
                role="dialog"
                aria-label={label}
                className="absolute inset-x-0 bottom-0 max-h-[75dvh] overflow-y-auto rounded-t-2xl border-t border-[var(--border)] bg-[var(--surface)] p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] text-[var(--foreground)] shadow-2xl"
              >
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--border)]" />
                {children(close)}
              </div>
            </div>
          ) : (
            /* Desktop: floating popover under the button */
            <div
              ref={menuRef}
              role="dialog"
              aria-label={label}
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                width: Math.min(width, window.innerWidth - 16),
                maxWidth: "calc(100vw - 16px)",
                maxHeight: position.maxHeight,
                overflowY: "auto",
                zIndex: 9999,
              }}
              className={[
                "rounded-2xl border border-[var(--border)]",
                "bg-[var(--surface)] p-2 text-[var(--foreground)]",
                "animate-in fade-in-0 zoom-in-95 duration-150",
              ].join(" ")}
            >
              {children(close)}
            </div>
          ),
          document.body,
        )}
    </>
  );
}

export default EditorDropdown;