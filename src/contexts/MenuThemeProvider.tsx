import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { MenuTheme } from '../utils/constants';
import { MENU_THEME, THEME_STORAGE_KEY } from '../utils/constants';
import { MenuThemeContext } from './menuThemeContext';

function readStoredTheme(): MenuTheme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'game' || stored === 'light') return stored;
  } catch {
    void 0;
  }
  return MENU_THEME;
}

export function MenuThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<MenuTheme>(readStoredTheme);

  const setTheme = useCallback((next: MenuTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      void 0;
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-menu-theme', theme);
  }, [theme]);

  return <MenuThemeContext.Provider value={{ theme, setTheme }}>{children}</MenuThemeContext.Provider>;
}
