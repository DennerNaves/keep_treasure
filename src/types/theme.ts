import type { MenuTheme } from '../utils/constants';

export interface MenuThemeContextValue {
  theme: MenuTheme;
  setTheme: (theme: MenuTheme) => void;
}
