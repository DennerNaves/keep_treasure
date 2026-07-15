/**
 * TEMA LIGHT – Menus com tema claro (fundo claro, azul suave)
 *
 * Usado quando data-menu-theme="light". O usuário troca no menu (ícone do sol).
 * Este tema é fixo – geralmente não precisa customizar ao criar novo jogo.
 */

export const themeLightStyles = `
  :root[data-menu-theme="light"],
  html[data-menu-theme="light"] {
    /* Overlay dos menus */
    --menu-bg-overlay: rgba(0, 0, 0, 0.18);
    --menu-bg-overlay-soft: rgba(0, 0, 0, 0.12);
    --menu-bg-overlay-pause: rgba(0, 0, 0, 0.2);

    /* Painel principal */
    --menu-content-bg: linear-gradient(to bottom, rgba(237, 245, 248, 0.94), rgba(224, 238, 245, 0.92));
    --menu-content-border: #7eb8c9;
    --menu-content-card: rgba(240, 248, 252, 0.95);

    /* Botões flutuantes (welcome, toggle de tema): ciano céu + ícone branco */
    --menu-toolbar-btn-bg: #42c0fb;
    --menu-toolbar-btn-bg-hover: #5ed0ff;
    --menu-toolbar-btn-icon: #ffffff;
    --menu-toolbar-btn-border-active: rgba(200, 220, 235, 0.92);
    --menu-toolbar-btn-shadow: 0 2px 12px rgba(56, 160, 210, 0.32);

    /* Cores de destaque e texto */
    --menu-primary: #4fc3f7;
    --menu-primary-glow: #5eb8e8;
    --menu-primary-dim: rgba(79, 195, 247, 0.35);
    --menu-primary-hover: #5eb8e8;
    --menu-text-primary: #37474f;
    --menu-text-muted: #607d8b;
    --menu-text-inverse: #263238;
    --menu-text-dark: #37474f;
    --menu-border-light: #90a4ae;
    --menu-border-dark: #cfd8dc;

    /* Sliders */
    --menu-slider-track: #cfd8dc;
    --menu-slider-fill: #4fc3f7;
    --menu-slider-thumb-border: #4fc3f7;

    /* Círculo de respiração */
    --menu-breathing-outer: #e1f5fe;
    --menu-breathing-inner: radial-gradient(circle at 30% 30%, #81d4fa, #4fc3f7);

    /* Botões */
    --menu-btn-secondary-bg: #eceff1;
    --menu-btn-secondary-text: #455a64;
    --menu-btn-secondary-border: #b0bec5;
    --menu-btn-secondary-hover: #cfd8dc;
    --menu-btn-action-bg: #43a047;
    --menu-btn-action-text: #ffffff;
    --menu-btn-action-border: #43a047;
    --menu-btn-action-hover: #388e3c;

    --menu-btn-nav-bg: #1976d2;
    --menu-btn-nav-hover: #1565c0;
    --menu-btn-nav-border: #ffffff;
    --menu-btn-nav-text: #ffffff;

    /* Estados e feedback */
    --menu-danger: #c62828;
    --menu-success: #43a047;
    --menu-connected: #2e7d32;
    --menu-title-shadow: rgba(0, 0, 0, 0.12);
    --menu-shadow: rgba(0, 0, 0, 0.1);
    --menu-shadow-card: 0 10px 40px rgba(0, 0, 0, 0.08);
    --menu-glow-yellow: rgba(79, 195, 247, 0.3);
    --menu-glow-yellow-border: #4fc3f7;
    --menu-glow-yellow-dim: rgba(79, 195, 247, 0.2);
    --menu-glow-yellow-border-dim: rgba(79, 195, 247, 0.35);
    --menu-accent: #4fc3f7;
    --menu-accent-hover: #5eb8e8;
    --menu-button-muted: #90a4ae;
    --menu-button-muted-hover: #b0bec5;
    --menu-secondary-dark: #29b6f6;
    --menu-teal-gradient-start: #4fc3f7;
    --menu-teal-gradient-end: #29b6f6;
    --menu-teal-glow: rgba(79, 195, 247, 0.35);
    --menu-bg-teal-10: rgba(79, 195, 247, 0.08);
    --menu-gray-button: #78909c;
    --menu-gray-button-dark: #607d8b;
    --menu-gray-glow: rgba(96, 125, 139, 0.25);
    --menu-danger-button: #c62828;
    --menu-danger-button-hover: #b71c1c;
    --menu-danger-strong: #b71c1c;
    --menu-danger-hover: #c62828;
    --menu-danger-glow: rgba(198, 40, 40, 0.3);
    --menu-progress-track: #cfd8dc;
    --menu-text-medium: #607d8b;
    --menu-text-light: #78909c;
    --menu-bg-teal-90: rgba(79, 195, 247, 0.9);
    --menu-bg-accent-90: rgba(129, 212, 250, 0.9);

    /* Scrollbar */
    --menu-scrollbar-track: #eceff1;
    --menu-scrollbar-thumb: #4fc3f7;
    --menu-scrollbar-thumb-hover: #5eb8e8;

    /* Tela de calibração */
    --menu-calibration-graph-bg: linear-gradient(180deg, #f5fbfd 0%, #e8f4f8 100%);
    --menu-calibration-graph-border: rgba(126, 184, 201, 0.5);
    --menu-calibration-progress-track: #e8ecef;
    --menu-calibration-progress-fill: linear-gradient(90deg, #039be5 0%, #4fc3f7 100%);
    --menu-calibration-progress-glow: rgba(3, 155, 229, 0.4);
    --menu-calibration-sensor-bar-bg: #b3e5fc;
    --menu-calibration-sensor-text: #01579b;
    --menu-calibration-sensor-separator: rgba(1, 87, 155, 0.25);
    --menu-calibration-sensor-error: #c62828;
    --menu-calibration-progress-text: #039be5;
    --menu-calibration-warning-bg: #ffffff;
    --menu-calibration-median-text: #000000;
  }
`;
