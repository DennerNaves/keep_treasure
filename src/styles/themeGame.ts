/**
 * TEMA GAME – Identidade visual do jogo (menus escuros, cores do projeto).
 *
 * Customize aqui as cores do seu jogo. Usado quando data-menu-theme="game".
 * O usuário troca entre "game" e "light" no menu (ícone do sol).
 */

export const themeGameStyles = `
  /* --------------------------------------------------------------------------
     CORES DO PROJETO (:root)
     Altere para personalizar seu jogo. Usadas pelo tema game e pelo jogo em si.
     -------------------------------------------------------------------------- */

  :root {
    /* Cor principal: bordas douradas, CTAs (espelha MENU_BRAND_CONFIG) */
    --color-primary: #c9a227;
    --color-primary-hover: #dcc06a;
    --color-primary-glow: #a8841f;
    --color-primary-dim: rgba(201, 162, 39, 0.35);

    /* Secundário: verde floresta / marrom (botões inativos, sliders) */
    --color-secondary: #5a7a52;
    --color-secondary-dark: #4a5c42;
    --color-secondary-darker: #4a5c42;
    --color-secondary-deep: #354030;
    --color-accent: #7a8f6e;
    --color-accent-hover: #6a7d62;

    /* Fundos dos painéis: roxo suave */
    --color-bg-dark: #4d4563;
    --color-bg-deep: #2c2638;
    --color-bg-black: #000000;
    --color-bg-card: rgba(255, 255, 255, 0.95);
    --color-bg-overlay: rgba(0, 0, 0, 0.6);
    --color-bg-overlay-strong: rgba(0, 0, 0, 0.85);
    --color-bg-overlay-pause: rgba(0, 0, 0, 0.7);
    --color-bg-overlay-bar: rgba(0, 0, 0, 0.8);
    --color-bg-teal-dim: rgba(44, 38, 56, 0.55);

    /* Gradientes de UI e acentos derivados */
    --color-btn-voltar-text: #2e2618;
    --color-teal-gradient-start: #6b6078;
    --color-teal-gradient-end: #4a4158;
    --color-teal-glow: rgba(107, 96, 120, 0.45);
    --color-bg-teal-10: rgba(90, 122, 82, 0.12);
    --color-bg-teal-90: rgba(74, 92, 66, 0.9);
    --color-bg-accent-90: rgba(122, 143, 110, 0.9);
    --color-glow-yellow: rgba(201, 162, 39, 0.5);
    --color-glow-yellow-dim: rgba(201, 162, 39, 0.35);
    --color-glow-yellow-border: #c9a227;
    --color-glow-yellow-border-dim: rgba(201, 162, 39, 0.45);
    --color-title-shadow: #3d3528;

    /* Texto e bordas */
    --color-text-primary: #e8e4ef;
    --color-text-muted: #a8a3b5;
    --color-text-dark: #333333;
    --color-text-medium: #555555;
    --color-text-light: #999999;
    --color-text-inverse: #ffffff;
    --color-border-light: #8a8498;
    --color-border-dark: #222222;
    --color-overlay-light: rgba(255, 255, 255, 0.1);
    --color-overlay-light-hover: rgba(255, 255, 255, 0.2);
    --color-border-button: rgba(255, 255, 255, 0.3);
    --color-border-button-hover: rgba(255, 255, 255, 0.6);

    /* TopBar: verde escuro (tema fazenda) */
    --color-topbar-btn-bg: rgba(52, 68, 48, 0.92);
    --color-topbar-btn-bg-hover: rgba(62, 82, 56, 0.95);
    --color-topbar-btn-border: rgba(255, 255, 255, 0.5);
    --color-topbar-btn-border-hover: rgba(255, 255, 255, 0.8);
    --color-topbar-btn-icon: #ffffff;

    --color-progress-track: #e0e0e0;

    /* Botão “ir ao menu” em modais */
    --color-menu-nav-button: #5a4f72;
    --color-menu-nav-button-hover: #6d6088;
  }

  /* --------------------------------------------------------------------------
     MAPEAMENTO TEMA GAME
     Quando o usuário escolhe tema do jogo, --menu-* usa as cores acima.
     -------------------------------------------------------------------------- */

  :root[data-menu-theme="game"],
  html[data-menu-theme="game"] {
    /* Overlays suaves: fundo do jogo continua visível (sem escurecimento forte). */
    --menu-bg-overlay: rgba(0, 0, 0, 0.18);
    --menu-bg-overlay-soft: rgba(0, 0, 0, 0.12);
    --menu-bg-overlay-pause: rgba(0, 0, 0, 0.22);

    --menu-content-bg: linear-gradient(to bottom, var(--color-bg-dark), var(--color-bg-deep));
    --menu-content-border: var(--color-primary);
    --menu-content-card: var(--color-bg-card);

    --menu-primary: var(--color-primary);
    --menu-primary-glow: var(--color-primary-glow);
    --menu-primary-dim: var(--color-primary-dim);
    --menu-primary-hover: var(--color-primary-hover);
    --menu-text-primary: var(--color-text-primary);
    --menu-text-muted: var(--color-text-muted);
    --menu-text-inverse: var(--color-text-inverse);
    --menu-text-dark: var(--color-text-dark);
    --menu-border-light: var(--color-border-light);
    --menu-border-dark: var(--color-border-dark);

    --menu-slider-track: var(--color-border-dark);
    --menu-slider-fill: var(--color-secondary);
    --menu-slider-thumb-border: var(--color-primary);

    --menu-breathing-outer: var(--color-bg-teal-dim);
    --menu-breathing-inner: radial-gradient(circle at 30% 30%, var(--color-secondary), var(--color-secondary-dark));

    --menu-btn-secondary-bg: var(--color-primary);
    --menu-btn-secondary-text: var(--color-btn-voltar-text);
    --menu-btn-secondary-border: var(--color-white);
    --menu-btn-secondary-hover: var(--color-primary-hover);
    --menu-btn-action-bg: var(--color-primary);
    --menu-btn-action-text: var(--color-btn-voltar-text);
    --menu-btn-action-border: var(--color-white);
    --menu-btn-action-hover: var(--color-primary-hover);

    --menu-btn-nav-bg: var(--color-menu-nav-button);
    --menu-btn-nav-hover: var(--color-menu-nav-button-hover);
    --menu-btn-nav-border: var(--color-white);
    --menu-btn-nav-text: var(--color-white);

    --menu-danger: var(--color-danger);
    --menu-success: var(--color-success);
    --menu-connected: var(--color-connected);
    --menu-title-shadow: var(--color-title-shadow);
    --menu-shadow: var(--color-shadow);
    --menu-shadow-card: var(--color-shadow-card);
    --menu-glow-yellow: var(--color-glow-yellow);
    --menu-glow-yellow-border: var(--color-glow-yellow-border);
    --menu-glow-yellow-dim: var(--color-glow-yellow-dim);
    --menu-glow-yellow-border-dim: var(--color-glow-yellow-border-dim);
    --menu-accent: var(--color-accent);
    --menu-accent-hover: var(--color-accent-hover);
    --menu-button-muted: var(--color-button-muted);
    --menu-button-muted-hover: var(--color-button-muted-hover);
    --menu-secondary-dark: var(--color-secondary-dark);
    --menu-teal-gradient-start: var(--color-teal-gradient-start);
    --menu-teal-gradient-end: var(--color-teal-gradient-end);
    --menu-teal-glow: var(--color-teal-glow);
    --menu-bg-teal-10: var(--color-bg-teal-10);
    --menu-gray-button: var(--color-gray-button);
    --menu-gray-button-dark: var(--color-gray-button-dark);
    --menu-gray-glow: var(--color-gray-glow);
    --menu-danger-button: var(--color-danger-button);
    --menu-danger-button-hover: var(--color-danger-button-hover);
    --menu-danger-strong: var(--color-danger-strong);
    --menu-danger-hover: var(--color-danger-hover);
    --menu-danger-glow: var(--color-danger-glow);
    --menu-progress-track: var(--color-progress-track);
    --menu-text-medium: var(--color-text-medium);
    --menu-text-light: var(--color-text-light);
    --menu-bg-teal-90: var(--color-bg-teal-90);
    --menu-bg-accent-90: var(--color-bg-accent-90);

    --menu-scrollbar-track: var(--color-bg-deep);
    --menu-scrollbar-thumb: var(--color-primary);
    --menu-scrollbar-thumb-hover: var(--color-primary-glow);

    /* Tela de calibração */
    --menu-calibration-graph-bg: linear-gradient(180deg, var(--color-bg-teal-dim) 0%, var(--color-secondary-dark) 100%);
    --menu-calibration-graph-border: var(--menu-primary-dim);
    --menu-calibration-progress-track: var(--color-border-dark);
    --menu-calibration-progress-fill: linear-gradient(90deg, var(--menu-accent) 0%, var(--menu-primary) 100%);
    --menu-calibration-progress-glow: var(--menu-teal-glow);
    --menu-calibration-sensor-bar-bg: var(--color-secondary-dark);
    --menu-calibration-sensor-text: var(--color-text-primary);
    --menu-calibration-sensor-separator: rgba(255, 255, 255, 0.35);
    --menu-calibration-sensor-error: #ffcdd2;
    --menu-calibration-progress-text: var(--menu-accent);
    --menu-calibration-warning-bg: rgba(255, 193, 7, 0.15);
    --menu-calibration-median-text: #ffffff;
  }
`;
