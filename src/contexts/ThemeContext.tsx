import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    return stored || 'auto';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      const root = document.documentElement;
      let shouldBeDark = false;

      if (theme === 'auto') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          shouldBeDark = true;
        } else {
          const hour = new Date().getHours();
          shouldBeDark = hour >= 18 || hour < 6;
        }
      } else {
        shouldBeDark = theme === 'dark';
      }

      setIsDark(shouldBeDark);
      root.classList.toggle('dark', shouldBeDark);
      root.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
    };

    updateTheme();
    localStorage.setItem('theme', theme);

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (!saved || saved === 'auto') {
      const interval = setInterval(() => {
        const hour = new Date().getHours();
        const shouldBeDark = hour >= 18 || hour < 6;
        const root = document.documentElement;
        root.classList.toggle('dark', shouldBeDark);
      }, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
