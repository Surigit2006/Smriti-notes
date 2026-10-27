"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Palette, Settings, X } from "lucide-react";

import { useSmritiTheme } from "@/themes/ThemeProvider";
import { themeCategories } from "@/themes/themes";

const ALL = "All";

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState<string>(ALL);
  const { themeId, setThemeId, themes } = useSmritiTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show categories that actually contain themes
  const categories = useMemo(
    () => [
      ALL,
      ...themeCategories.filter((name) =>
        themes.some((theme) => theme.category === name),
      ),
    ],
    [themes],
  );

  const visibleThemes = useMemo(
    () =>
      category === ALL
        ? themes
        : themes.filter((theme) => theme.category === category),
    [themes, category],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open theme settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Themes"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--foreground)] md:h-9 md:w-9"
      >
        <Settings size={17} />
      </button>

      {/*
        Rendered into document.body: the mobile drawer is moved with a CSS
        transform, which would otherwise trap this fixed overlay inside it.
      */}
      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 sm:items-center sm:p-4">
            <button
              type="button"
              aria-label="Close theme settings"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default"
            />

            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="smriti-theme-picker-title"
              className="relative z-10 flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-2xl sm:max-h-[85dvh] sm:rounded-2xl"
            >
              <header className="flex items-center justify-between border-b border-[var(--border)] p-4 sm:p-5">
                <div>
                  <h2
                    id="smriti-theme-picker-title"
                    className="text-lg font-semibold"
                  >
                    Personalize Smriti
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Choose a theme to recolor your entire workspace.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close theme settings"
                  className="rounded-lg p-2.5 text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--foreground)] sm:p-2"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 font-medium">
                    <Palette size={18} />
                    Theme gallery
                  </h3>
                  <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted)]">
                    {visibleThemes.length} themes
                  </span>
                </div>

                {/* Category filter */}
                <div
                  className="mb-4 flex flex-wrap gap-1.5"
                  role="tablist"
                  aria-label="Theme categories"
                >
                  {categories.map((name) => {
                    const active = category === name;

                    return (
                      <button
                        key={name}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setCategory(name)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          active
                            ? "border-[var(--accent)] bg-[var(--active)] text-[var(--foreground)]"
                            : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {visibleThemes.map((theme) => {
                    const colors = theme.palette;
                    const selected = themeId === theme.id;

                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setThemeId(theme.id)}
                        aria-pressed={selected}
                        title={theme.description}
                        className={`group rounded-xl border p-3 text-left transition-all ${
                          selected
                            ? "border-[var(--accent)] bg-[var(--active)] ring-1 ring-[var(--accent)]"
                            : "border-[var(--border)] hover:-translate-y-0.5 hover:bg-[var(--hover)]"
                        }`}
                      >
                        {/* Checkerboard behind translucent themes so the see-through is visible */}
                        <span
                          className={`mb-3 flex h-16 items-end gap-1 overflow-hidden rounded-lg border border-black/10 p-1.5 ${
                            theme.transparent ? "smriti-checker" : ""
                          }`}
                          style={
                            theme.transparent
                              ? undefined
                              : { backgroundColor: colors.background }
                          }
                          aria-hidden="true"
                        >
                          <span
                            className="h-9 w-[27%] rounded-sm"
                            style={{
                              backgroundColor: colors.sidebarBackground,
                            }}
                          />
                          <span
                            className="h-12 flex-1 rounded-sm"
                            style={{ backgroundColor: colors.surface }}
                          />
                          <span
                            className="h-6 w-2 rounded-sm"
                            style={{ backgroundColor: colors.accent }}
                          />
                        </span>

                        <span className="flex min-w-0 items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">
                            {theme.name}
                          </span>
                          {selected && (
                            <Check
                              size={16}
                              className="shrink-0 text-[var(--accent)]"
                              aria-label="Selected"
                            />
                          )}
                        </span>

                        <span className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">
                          {theme.description}
                        </span>

                        <span className="mt-3 flex gap-1" aria-hidden="true">
                          {[
                            colors.accent,
                            colors.active,
                            colors.border,
                            colors.foreground,
                          ].map((color, index) => (
                            <span
                              key={`${theme.id}-swatch-${index}`}
                              className="h-1.5 flex-1 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <footer className="border-t border-[var(--border)] p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-xs text-[var(--muted)]">
                Your selected theme is saved on this device.
              </footer>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}