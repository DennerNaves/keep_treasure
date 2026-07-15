import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyMenuBrandVariables } from './styles/applyMenuBrandVariables';
import { BRIGHTNESS_CONFIG, BRIGHTNESS_STORAGE_KEY, MENU_THEME, THEME_STORAGE_KEY } from './utils/constants';

import App from './App.tsx';

function applyInitialTheme(): void {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const theme = stored === 'game' || stored === 'light' ? stored : MENU_THEME;
    document.documentElement.setAttribute('data-menu-theme', theme);
  } catch {
    document.documentElement.setAttribute('data-menu-theme', MENU_THEME);
  }
}

function applyInitialBrightness(): void {
  const { MIN, MAX, DEFAULT } = BRIGHTNESS_CONFIG;
  let value: number = DEFAULT;
  try {
    const stored = localStorage.getItem(BRIGHTNESS_STORAGE_KEY);
    if (stored != null) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed)) {
        value = Math.min(MAX, Math.max(MIN, parsed));
      }
    }
  } catch {
    void 0;
  }
  document.documentElement.style.setProperty('--brightness', String(value / 100));
}

applyMenuBrandVariables();
applyInitialTheme();
applyInitialBrightness();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
