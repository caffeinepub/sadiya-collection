import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  swatch: string;
}

export const THEMES: Theme[] = [
  {
    id: "rose-gold",
    name: "Rose Gold",
    emoji: "🌸",
    swatch: "oklch(0.52 0.13 15)",
  },
  {
    id: "midnight-black",
    name: "Midnight Black",
    emoji: "🌙",
    swatch: "oklch(0.2 0.05 50)",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    emoji: "🌊",
    swatch: "oklch(0.42 0.16 240)",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    emoji: "🌿",
    swatch: "oklch(0.38 0.12 150)",
  },
  {
    id: "lavender",
    name: "Lavender",
    emoji: "💜",
    swatch: "oklch(0.48 0.17 295)",
  },
  { id: "coral", name: "Coral", emoji: "🪸", swatch: "oklch(0.58 0.2 25)" },
  {
    id: "champagne",
    name: "Champagne",
    emoji: "🥂",
    swatch: "oklch(0.55 0.1 75)",
  },
  {
    id: "slate-gray",
    name: "Slate Gray",
    emoji: "🪨",
    swatch: "oklch(0.38 0.05 255)",
  },
  {
    id: "ruby-red",
    name: "Ruby Red",
    emoji: "❤️",
    swatch: "oklch(0.45 0.2 15)",
  },
  {
    id: "emerald",
    name: "Emerald",
    emoji: "💚",
    swatch: "oklch(0.42 0.18 165)",
  },
];

interface ThemeContextType {
  currentTheme: string;
  setTheme: (themeId: string) => void;
  autoTheme: boolean;
  toggleAutoTheme: () => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();
  const [currentTheme, setCurrentTheme] = useState("rose-gold");
  const [autoTheme, setAutoTheme] = useState(false);
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoIndexRef = useRef(0);

  // Apply theme to DOM
  const applyTheme = useCallback((themeId: string) => {
    document.documentElement.setAttribute("data-theme", themeId);
  }, []);

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("sadiya-theme") || "rose-gold";
    setCurrentTheme(saved);
    applyTheme(saved);

    const savedAuto = localStorage.getItem("sadiya-auto-theme") === "true";
    setAutoTheme(savedAuto);

    if (actor && !isFetching) {
      actor
        .getThemePreference()
        .then((pref) => {
          if (pref.themeName) {
            setCurrentTheme(pref.themeName);
            applyTheme(pref.themeName);
            localStorage.setItem("sadiya-theme", pref.themeName);
          }
        })
        .catch(() => {});
    }
  }, [actor, isFetching, applyTheme]);

  const setTheme = useCallback(
    (themeId: string) => {
      setCurrentTheme(themeId);
      applyTheme(themeId);
      localStorage.setItem("sadiya-theme", themeId);
      // Disable auto-cycle when user manually selects a theme
      setAutoTheme(false);
      localStorage.setItem("sadiya-auto-theme", "false");
      if (actor) {
        void actor.setThemePreference({ themeName: themeId });
      }
    },
    [actor, applyTheme],
  );

  // Auto theme cycling
  useEffect(() => {
    if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    }
    if (autoTheme) {
      autoIntervalRef.current = setInterval(() => {
        autoIndexRef.current = (autoIndexRef.current + 1) % THEMES.length;
        const nextTheme = THEMES[autoIndexRef.current].id;
        setCurrentTheme(nextTheme);
        applyTheme(nextTheme);
        if (actor) {
          void actor.setThemePreference({ themeName: nextTheme });
        }
      }, 20000);
    }
    return () => {
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    };
  }, [autoTheme, actor, applyTheme]);

  const toggleAutoTheme = useCallback(() => {
    setAutoTheme((prev) => {
      const next = !prev;
      localStorage.setItem("sadiya-auto-theme", String(next));
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        autoTheme,
        toggleAutoTheme,
        themes: THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
