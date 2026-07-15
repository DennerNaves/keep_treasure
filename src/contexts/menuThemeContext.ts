import { createContext, useContext } from 'react';
import type { MenuThemeContextValue } from '../types';

export const MenuThemeContext = createContext<MenuThemeContextValue | null>(null);

export function useMenuTheme(): MenuThemeContextValue {
  const value = useContext(MenuThemeContext);
  if (!value) {
    throw new Error('useMenuTheme must be used within MenuThemeProvider');
  }
  return value;
}
