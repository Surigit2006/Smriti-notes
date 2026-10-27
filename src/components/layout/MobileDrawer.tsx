"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function MobileDrawer({
  open,
  onClose,
  children,
}: MobileDrawerProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        aria-hidden={!open}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start) return;

          const touch = event.changedTouches[0];
          const dx = touch.clientX - start.x;
          const dy = Math.abs(touch.clientY - start.y);

          // Swipe left (mostly horizontal) closes the drawer
          if (dx < -70 && dy < 60) onClose();
        }}
        className={`fixed inset-y-0 left-0 z-50 w-[min(86vw,320px)] transition-[transform,visibility] duration-200 ease-out ${
          open
            ? "visible translate-x-0 shadow-2xl"
            : "invisible -translate-x-full"
        }`}
      >
        {children}
      </div>
    </>
  );
}