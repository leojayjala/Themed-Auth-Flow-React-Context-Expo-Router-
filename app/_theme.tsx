import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeName = "light" | "dark";

export type AppTheme = {
  name: ThemeName;
  colors: {
    screen: string;
    card: string;
    border: string;
    title: string;
    text: string;
    mutedText: string;
    primary: string;
    primaryText: string;
    danger: string;
    inputBackground: string;
    inputBorder: string;
    placeholder: string;
  };
};

const lightTheme: AppTheme = {
  name: "light",
  colors: {
    screen: "#eef2f7",
    card: "#ffffff",
    border: "#d7deea",
    title: "#0f172a",
    text: "#0f172a",
    mutedText: "#475569",
    primary: "#1d4ed8",
    primaryText: "#ffffff",
    danger: "#b42318",
    inputBackground: "#ffffff",
    inputBorder: "#cbd5e1",
    placeholder: "#94a3b8",
  },
};

const darkTheme: AppTheme = {
  name: "dark",
  colors: {
    screen: "#070b14",
    card: "#0b1220",
    border: "#233044",
    title: "#f8fafc",
    text: "#f1f5f9",
    mutedText: "#cbd5e1",
    primary: "#3b82f6",
    primaryText: "#ffffff",
    danger: "#f87171",
    inputBackground: "#070b14",
    inputBorder: "#334155",
    placeholder: "#94a3b8",
  },
};

const themes: Record<ThemeName, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
};

type ThemeContextType = {
  themeName: ThemeName;
  theme: AppTheme;
  setThemeName: (value: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }
  return context;
}

export function getStatusBarStyle(themeName: ThemeName): "light" | "dark" {
  return themeName === "dark" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const getStoredThemeName = (): ThemeName | null => {
    try {
      const stored = globalThis?.localStorage?.getItem("themeName");
      return stored === "dark" || stored === "light" ? stored : null;
    } catch {
      return null;
    }
  };

  const initialTheme: ThemeName = getStoredThemeName() ?? (systemScheme === "dark" ? "dark" : "light");
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);

  useEffect(() => {
    try {
      globalThis?.localStorage?.setItem("themeName", themeName);
    } catch {
      // Ignore (native platforms may not have localStorage).
    }
  }, [themeName]);

  const value = useMemo<ThemeContextType>(() => {
    return {
      themeName,
      theme: themes[themeName],
      setThemeName,
      toggleTheme: () => setThemeName((prev) => (prev === "dark" ? "light" : "dark")),
    };
  }, [themeName]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
