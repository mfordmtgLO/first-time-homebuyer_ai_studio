import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  isDark: false,
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "app-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (typeof window !== "undefined" && (localStorage.getItem(storageKey) as Theme)) || defaultTheme
  );
  
  const [userId, setUserId] = useState<string | null>(null);
  const skipNextSyncRef = useRef<boolean>(false);

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  
  // Listen to Firebase Auth state to fetch user's theme preference on login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const prefRef = doc(db, "user_preferences", user.uid);
          const prefSnap = await getDoc(prefRef);
          if (prefSnap.exists()) {
            const data = prefSnap.data();
            if (data.themePreference && ["dark", "light", "system"].includes(data.themePreference)) {
              // Apply remote preference to local state without triggering an immediate re-save
              skipNextSyncRef.current = true;
              localStorage.setItem(storageKey, data.themePreference);
              setTheme(data.themePreference as Theme);
            }
          }
        } catch (e) {
          console.warn("Failed to fetch user theme preference", e);
        }
      } else {
        setUserId(null);
      }
    });
    
    return () => unsubscribe();
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    let effectiveDark = false;
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      effectiveDark = mediaQuery.matches;
      root.classList.add(effectiveDark ? "dark" : "light");
      setIsDark(effectiveDark);

      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove("light", "dark");
        root.classList.add(e.matches ? "dark" : "light");
        setIsDark(e.matches);
      };
      mediaQuery.addEventListener("change", handleChange);
      
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      effectiveDark = theme === "dark";
      root.classList.add(effectiveDark ? "dark" : "light");
      setIsDark(effectiveDark);
    }
  }, [theme]);
  
  // Sync to database whenever theme changes locally
  useEffect(() => {
    if (userId) {
      if (skipNextSyncRef.current) {
        skipNextSyncRef.current = false;
        return;
      }
      
      const prefRef = doc(db, "user_preferences", userId);
      setDoc(prefRef, {
        userId,
        themePreference: theme,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(e => {
        console.warn("Failed to save user theme preference", e);
      });
    }
  }, [theme, userId]);

  const value = {
    theme,
    isDark,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    toggleTheme: () => {
      const nextTheme = isDark ? "light" : "dark";
      localStorage.setItem(storageKey, nextTheme);
      setTheme(nextTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}
