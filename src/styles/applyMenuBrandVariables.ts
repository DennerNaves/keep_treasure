import { MENU_BRAND_CONFIG } from '../utils/constants';

/** Injeta `MENU_BRAND_CONFIG` nas CSS vars usadas por `themeGame.ts` / menus. */
export const applyMenuBrandVariables = (): void => {
  const root = document.documentElement;
  const b = MENU_BRAND_CONFIG;

  root.style.setProperty('--color-primary', b.BORDER_HIGHLIGHT);
  root.style.setProperty('--color-primary-hover', b.BORDER_HIGHLIGHT_HOVER);
  root.style.setProperty('--color-primary-glow', b.BORDER_HIGHLIGHT_GLOW);
  root.style.setProperty('--color-primary-dim', b.PRIMARY_DIM);
  root.style.setProperty('--color-bg-dark', b.CONTENT_GRADIENT_TOP);
  root.style.setProperty('--color-bg-deep', b.CONTENT_GRADIENT_BOTTOM);
  root.style.setProperty('--color-teal-gradient-start', b.TEAL_GRADIENT_START);
  root.style.setProperty('--color-teal-gradient-end', b.TEAL_GRADIENT_END);
  root.style.setProperty('--color-secondary', b.SECONDARY);
  root.style.setProperty('--color-secondary-dark', b.SECONDARY_DARK);
  root.style.setProperty('--color-secondary-darker', b.SECONDARY_DARK);
  root.style.setProperty('--color-secondary-deep', b.SECONDARY_DEEP);
  root.style.setProperty('--color-accent', b.ACCENT);
  root.style.setProperty('--color-accent-hover', b.ACCENT_HOVER);
  root.style.setProperty('--color-btn-voltar-text', b.BTN_VOLTAR_TEXT);
  root.style.setProperty('--color-title-shadow', b.TITLE_SHADOW);
  root.style.setProperty('--color-menu-nav-button', b.MENU_NAV_BG);
  root.style.setProperty('--color-menu-nav-button-hover', b.MENU_NAV_HOVER);
  root.style.setProperty('--color-border-light', b.BORDER_LIGHT);
};
