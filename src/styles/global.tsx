import { createGlobalStyle } from 'styled-components';

import { themeGameStyles } from './themeGame';
import { themeLightStyles } from './themeLight';

/**
 * Estilos globais imutáveis – reset, layout base, scrollbar, brilho do canvas.
 * Temas: src/styles/themeGame.ts | src/styles/themeLight.ts
 */
const GlobalStyle = createGlobalStyle`
  ${themeGameStyles}
  ${themeLightStyles}

  /* Variáveis imutáveis – fontes e cores de sistema (não altere ao criar novo jogo) */
  :root {
    --font-system: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --font-primary: var(--font-system);
    --font-ui: var(--font-system);

    /* Feedback semântico (erro=vermelho, sucesso=verde) */
    --color-danger: #d32f2f;
    --color-danger-hover: #e53935;
    --color-danger-strong: #c62828;
    --color-danger-button: #dc3545;
    --color-danger-button-hover: #c82333;
    --color-danger-glow: rgba(220, 53, 69, 0.5);
    --color-success: #388e3c;
    --color-success-hover: #66bb6a;
    --color-connected: #00FF41;
    --color-disconnected: #ff4444;

    /* Neutros */
    --color-white: #ffffff;
    --color-black: #000000;

    /* Botões e utilitários de sistema */
    --color-button-muted: #555555;
    --color-button-muted-hover: #666666;
    --color-gray-button: #6c757d;
    --color-gray-button-dark: #495057;
    --color-gray-glow: rgba(108, 117, 125, 0.5);
    --color-shadow: rgba(0, 0, 0, 0.3);
    --color-shadow-strong: rgba(0, 0, 0, 0.5);
    --color-shadow-card: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  /* Scrollbar personalizada para painéis de menu (.menu-scroll-area) */
  [data-menu-theme] .menu-scroll-area {
    scrollbar-width: thin;
    scrollbar-color: var(--menu-scrollbar-thumb) var(--menu-scrollbar-track);
  }
  [data-menu-theme] .menu-scroll-area::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  [data-menu-theme] .menu-scroll-area::-webkit-scrollbar-track {
    background: var(--menu-scrollbar-track);
    border-radius: 10px;
  }
  [data-menu-theme] .menu-scroll-area::-webkit-scrollbar-thumb {
    background: var(--menu-scrollbar-thumb);
    border-radius: 10px;
    border: 2px solid var(--menu-scrollbar-track);
  }
  [data-menu-theme] .menu-scroll-area::-webkit-scrollbar-thumb:hover {
    background: var(--menu-scrollbar-thumb-hover);
  }

  /* Brilho do jogo (canvas): controlado pelo slider de acessibilidade via --brightness (0..1, default 1). */
  canvas {
    filter: brightness(var(--brightness, 1));
    transition: filter 0.4s ease;
  }

  /* Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: var(--font-primary);
  }
`;

export default GlobalStyle;
