
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { defaultThemeId, getThemeById, themes } from "@/themes/themes";

type SmritiThemeContextValue = {
  themeId: string;
  setThemeId: (id: string) => void;
  themes: typeof themes;
};

const SmritiThemeContext =
  createContext<SmritiThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "smriti-theme";

function getInitialThemeId(): string {
  try {
    const savedThemeId = window.localStorage.getItem(STORAGE_KEY);

    if (savedThemeId && themes.some((theme) => theme.id === savedThemeId)) {
      return savedThemeId;
    }
  } catch {
    // Continue with the default theme if storage is unavailable.
  }

  return defaultThemeId;
}


function ThemeManager({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(getInitialThemeId);

  useEffect(() => {
    const selectedTheme = getThemeById(themeId);
    const root = document.documentElement;
    const palette = selectedTheme.palette;
    const isTransparent = Boolean(selectedTheme.transparent);

    const variables = {
      "--background": palette.background,
      "--sidebar-background": palette.sidebarBackground,
      "--theme-color-scheme": selectedTheme.mode,
      "--surface": palette.surface,
      "--foreground": palette.foreground,
      "--muted": palette.muted,
      "--border": palette.border,
      "--hover": palette.hover,
      "--active": palette.active,
      "--accent": palette.accent,
      "--accent-foreground": palette.accentForeground,
      "--surface-blur": `${isTransparent ? (selectedTheme.blur ?? 18) : 0}px`,
      "--surface-shadow": isTransparent
        ? "0 8px 32px rgba(0, 0, 0, 0.18)"
        : "none",
    };

    Object.entries(variables).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });

    root.dataset.theme = selectedTheme.id;
    root.dataset.themeMode = selectedTheme.mode;
    root.dataset.transparent = isTransparent ? "true" : "false";
    root.style.colorScheme = selectedTheme.mode;
  }, [themeId]);

  const setThemeId = useCallback((id: string) => {
    if (!themes.some((theme) => theme.id === id)) return;

    setThemeIdState(id);

    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // The theme still changes for this session if storage is unavailable.
    }
  }, []);

  return (
    <SmritiThemeContext.Provider value={{ themeId, setThemeId, themes }}>
      {children}
    </SmritiThemeContext.Provider>
  );
}


export function SmritiThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ThemeManager>{children}</ThemeManager>;
}

export function useSmritiTheme() {
  const context = useContext(SmritiThemeContext);

  if (!context) {
    throw new Error(
      "useSmritiTheme must be used inside SmritiThemeProvider",
    );
  }

  return context;
}
