/**
 * dat.GUI para ajustar variáveis de constants.ts em tempo real.
 * APENAS em ambiente de desenvolvimento (import.meta.env.DEV).
 * Tecla "s" em qualquer tela exibe/oculta o painel.
 *
 * NÃO é incluído no bundle de produção.
 */

import * as dat from 'dat.gui';
import { useEffect, useRef } from 'react';

import {
  AUDIO_CONFIG,
  BACKGROUND_LAYERS,
  BLE_CONFIG,
  COMPANIONS_CONFIG,
  GAME_ASSETS,
  GAME_CONFIG,
  GAME_THEME,
  getMaxRmssdTier,
  INDICATOR_CONFIG,
  PARTICLES_CONFIG,
  PLAYER_CONFIG,
  TIMING,
  UI_CONFIG,
  VFC_CONFIG,
  VISUAL_BREATH_INDICATOR_CONFIG
} from '../utils/constants';

const isDev = import.meta.env.DEV;

type Mutable<T> = { -readonly [K in keyof T]: T[K] extends object ? Mutable<T[K]> : T[K] };

function ensureDatGUIStyles(): void {
  const id = 'dev-config-gui-overrides';
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    .dg.ac, .dg.main, .dg { z-index: 99999 !important; pointer-events: auto !important; }
    .dg li, .dg .cr, .dg .c { pointer-events: auto !important; }
  `;
  document.head.appendChild(style);
}

function getCssVarValue(cssVar: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
}

function buildLabel(label: string, property: string): string {
  return `${label} (${property})`;
}

function attachDevRerenderHooks(gui: dat.GUI): void {
  const walk = (folder: dat.GUI): void => {
    folder.__controllers.forEach((controller) => {
      const target = controller.object as Record<string, unknown>;
      const key = controller.property as string;
      if (typeof target[key] === 'function') {
        return;
      }
      const prev = (controller as { __onChange?: (value: unknown) => void }).__onChange;
      controller.onChange((value: unknown) => {
        prev?.call(controller, value);
      });
    });
    Object.values(folder.__folders).forEach((sub) => {
      walk(sub);
    });
  };
  walk(gui);
}

function buildGUI(): dat.GUI | null {
  if (!isDev) return null;

  ensureDatGUIStyles();

  const gui = new dat.GUI({ name: 'Keep - Debug DEV (Constants & Styles)' });
  gui.close();

  const stylesFolder = gui.addFolder('1 - Estilizações');
  const stylesCoresFolder = stylesFolder.addFolder('Cores do tema (:root)');

  const styleVarControls = [
    { cssVar: '--color-primary', key: 'colorPrimary', label: buildLabel('Cor primária', '--color-primary') },
    { cssVar: '--color-primary-hover', key: 'colorPrimaryHover', label: buildLabel('Cor primária (hover)', '--color-primary-hover') },
    { cssVar: '--color-primary-glow', key: 'colorPrimaryGlow', label: buildLabel('Glow primário', '--color-primary-glow') },
    { cssVar: '--color-primary-dim', key: 'colorPrimaryDim', label: buildLabel('Primária (dim)', '--color-primary-dim') },
    { cssVar: '--color-secondary', key: 'colorSecondary', label: buildLabel('Cor secundária', '--color-secondary') },
    { cssVar: '--color-secondary-dark', key: 'colorSecondaryDark', label: buildLabel('Secundária (dark)', '--color-secondary-dark') },
    {
      cssVar: '--color-secondary-darker',
      key: 'colorSecondaryDarker',
      label: buildLabel('Secundária (darker)', '--color-secondary-darker')
    },
    { cssVar: '--color-secondary-deep', key: 'colorSecondaryDeep', label: buildLabel('Secundária (deep)', '--color-secondary-deep') },
    { cssVar: '--color-accent', key: 'colorAccent', label: buildLabel('Cor accent', '--color-accent') },
    { cssVar: '--color-accent-hover', key: 'colorAccentHover', label: buildLabel('Accent (hover)', '--color-accent-hover') },
    { cssVar: '--color-bg-dark', key: 'colorBgDark', label: buildLabel('Fundo escuro', '--color-bg-dark') },
    { cssVar: '--color-bg-deep', key: 'colorBgDeep', label: buildLabel('Fundo profundo', '--color-bg-deep') },
    { cssVar: '--color-bg-black', key: 'colorBgBlack', label: buildLabel('Fundo preto', '--color-bg-black') },
    { cssVar: '--color-bg-card', key: 'colorBgCard', label: buildLabel('Fundo de cards', '--color-bg-card') },
    { cssVar: '--color-bg-overlay', key: 'colorBgOverlay', label: buildLabel('Overlay', '--color-bg-overlay') },
    { cssVar: '--color-bg-overlay-strong', key: 'colorBgOverlayStrong', label: buildLabel('Overlay forte', '--color-bg-overlay-strong') },
    { cssVar: '--color-bg-overlay-pause', key: 'colorBgOverlayPause', label: buildLabel('Overlay pause', '--color-bg-overlay-pause') },
    { cssVar: '--color-bg-overlay-bar', key: 'colorBgOverlayBar', label: buildLabel('Overlay bar', '--color-bg-overlay-bar') },
    { cssVar: '--color-bg-teal-dim', key: 'colorBgTealDim', label: buildLabel('Teal (dim)', '--color-bg-teal-dim') },
    { cssVar: '--color-btn-voltar-text', key: 'colorBtnVoltarText', label: buildLabel('Texto botão voltar', '--color-btn-voltar-text') },
    {
      cssVar: '--color-teal-gradient-start',
      key: 'colorTealGradientStart',
      label: buildLabel('Gradiente teal (start)', '--color-teal-gradient-start')
    },
    {
      cssVar: '--color-teal-gradient-end',
      key: 'colorTealGradientEnd',
      label: buildLabel('Gradiente teal (end)', '--color-teal-gradient-end')
    },
    { cssVar: '--color-teal-glow', key: 'colorTealGlow', label: buildLabel('Glow teal', '--color-teal-glow') },
    { cssVar: '--color-bg-teal-10', key: 'colorBgTeal10', label: buildLabel('Teal (10%)', '--color-bg-teal-10') },
    { cssVar: '--color-bg-teal-90', key: 'colorBgTeal90', label: buildLabel('Teal (90%)', '--color-bg-teal-90') },
    { cssVar: '--color-bg-accent-90', key: 'colorBgAccent90', label: buildLabel('Accent (90%)', '--color-bg-accent-90') },
    { cssVar: '--color-glow-yellow', key: 'colorGlowYellow', label: buildLabel('Glow amarelo', '--color-glow-yellow') },
    { cssVar: '--color-glow-yellow-dim', key: 'colorGlowYellowDim', label: buildLabel('Glow amarelo (dim)', '--color-glow-yellow-dim') },
    {
      cssVar: '--color-glow-yellow-border',
      key: 'colorGlowYellowBorder',
      label: buildLabel('Borda glow amarelo', '--color-glow-yellow-border')
    },
    {
      cssVar: '--color-glow-yellow-border-dim',
      key: 'colorGlowYellowBorderDim',
      label: buildLabel('Borda glow amarelo (dim)', '--color-glow-yellow-border-dim')
    },
    { cssVar: '--color-title-shadow', key: 'colorTitleShadow', label: buildLabel('Sombra títulos', '--color-title-shadow') },
    { cssVar: '--color-text-primary', key: 'colorTextPrimary', label: buildLabel('Texto primário', '--color-text-primary') },
    { cssVar: '--color-text-muted', key: 'colorTextMuted', label: buildLabel('Texto muted', '--color-text-muted') },
    { cssVar: '--color-text-dark', key: 'colorTextDark', label: buildLabel('Texto dark', '--color-text-dark') },
    { cssVar: '--color-text-medium', key: 'colorTextMedium', label: buildLabel('Texto medium', '--color-text-medium') },
    { cssVar: '--color-text-light', key: 'colorTextLight', label: buildLabel('Texto light', '--color-text-light') },
    { cssVar: '--color-text-inverse', key: 'colorTextInverse', label: buildLabel('Texto inverse', '--color-text-inverse') },
    { cssVar: '--color-border-light', key: 'colorBorderLight', label: buildLabel('Borda (light)', '--color-border-light') },
    { cssVar: '--color-border-dark', key: 'colorBorderDark', label: buildLabel('Borda (dark)', '--color-border-dark') },
    { cssVar: '--color-overlay-light', key: 'colorOverlayLight', label: buildLabel('Overlay light', '--color-overlay-light') },
    {
      cssVar: '--color-overlay-light-hover',
      key: 'colorOverlayLightHover',
      label: buildLabel('Overlay light (hover)', '--color-overlay-light-hover')
    },
    { cssVar: '--color-border-button', key: 'colorBorderButton', label: buildLabel('Borda botões', '--color-border-button') },
    {
      cssVar: '--color-border-button-hover',
      key: 'colorBorderButtonHover',
      label: buildLabel('Borda botões (hover)', '--color-border-button-hover')
    },
    { cssVar: '--color-topbar-btn-bg', key: 'colorTopbarBtnBg', label: buildLabel('TopBar btn bg', '--color-topbar-btn-bg') },
    {
      cssVar: '--color-topbar-btn-bg-hover',
      key: 'colorTopbarBtnBgHover',
      label: buildLabel('TopBar btn bg (hover)', '--color-topbar-btn-bg-hover')
    },
    {
      cssVar: '--color-topbar-btn-border',
      key: 'colorTopbarBtnBorder',
      label: buildLabel('TopBar btn border', '--color-topbar-btn-border')
    },
    {
      cssVar: '--color-topbar-btn-border-hover',
      key: 'colorTopbarBtnBorderHover',
      label: buildLabel('TopBar btn border (hover)', '--color-topbar-btn-border-hover')
    },
    { cssVar: '--color-topbar-btn-icon', key: 'colorTopbarBtnIcon', label: buildLabel('TopBar btn ícone', '--color-topbar-btn-icon') },
    { cssVar: '--color-progress-track', key: 'colorProgressTrack', label: buildLabel('Progresso track', '--color-progress-track') }
  ] as const;

  const stylesState: Record<string, string> = {};
  styleVarControls.forEach((control) => {
    stylesState[control.key] = getCssVarValue(control.cssVar);
  });

  styleVarControls.forEach((control) => {
    stylesCoresFolder
      .addColor(stylesState, control.key)
      .name(control.label)
      .onChange((value: string) => {
        document.documentElement.style.setProperty(control.cssVar, value);
      });
  });

  const logicFolder = gui.addFolder('2 - Lógicas (constants)');

  const themeFolder = logicFolder.addFolder('GAME_THEME');
  const gameThemeConfig = GAME_THEME as Mutable<typeof GAME_THEME>;
  themeFolder.add(gameThemeConfig, 'NAME').name(buildLabel('Nome do jogo (texto/UI)', 'NAME'));
  themeFolder.add(gameThemeConfig, 'MAIN_CHARACTER').name(buildLabel('Nome do personagem principal', 'MAIN_CHARACTER'));
  themeFolder.add(gameThemeConfig, 'PARTICLE').name(buildLabel('Nome da partícula/efeito', 'PARTICLE'));

  const gameFolder = logicFolder.addFolder('GAME_CONFIG');
  const gameConfig = GAME_CONFIG as Mutable<typeof GAME_CONFIG>;
  gameFolder.add(gameConfig, 'BASE_HEIGHT', 500, 2000, 50).name(buildLabel('Altura do personagem (layout vertical)', 'BASE_HEIGHT'));
  gameFolder.add(gameConfig, 'BACKGROUND_SPEED', 0, 5, 0.1).name(buildLabel('Velocidade do fundo/parallax', 'BACKGROUND_SPEED'));
  gameFolder
    .add(gameConfig, 'DEFAULT_SESSION_LIMIT', 60, 600, 15)
    .name(buildLabel('Duração padrão de sessão (segundos)', 'DEFAULT_SESSION_LIMIT'));
  gameFolder
    .add(gameConfig, 'DEFAULT_CYCLES_PER_MINUTE', 5, 15, 1)
    .name(buildLabel('Ciclos por minuto padrão', 'DEFAULT_CYCLES_PER_MINUTE'));
  gameFolder.add(gameConfig, 'MIN_CYCLES_PER_MINUTE', 3, 15, 1).name(buildLabel('Limite mínimo de CPM', 'MIN_CYCLES_PER_MINUTE'));
  gameFolder.add(gameConfig, 'MAX_CYCLES_PER_MINUTE', 10, 25, 1).name(buildLabel('Limite máximo de CPM', 'MAX_CYCLES_PER_MINUTE'));
  gameFolder.add(gameConfig, 'MIN_SESSION_TIME', 30, 120, 15).name(buildLabel('Tempo mínimo da sessão (segundos)', 'MIN_SESSION_TIME'));
  gameFolder.add(gameConfig, 'MAX_SESSION_TIME', 300, 900, 15).name(buildLabel('Tempo máximo da sessão (segundos)', 'MAX_SESSION_TIME'));
  gameFolder.add(gameConfig, 'SESSION_TIME_STEP', 5, 30, 5).name(buildLabel('Passo de ajuste do tempo da sessão', 'SESSION_TIME_STEP'));

  const playerFolder = logicFolder.addFolder('PLAYER_CONFIG');
  const playerConfig = PLAYER_CONFIG as Mutable<typeof PLAYER_CONFIG>;
  playerFolder
    .add(playerConfig, 'HORIZONTAL_POSITION', 0, 1, 0.05)
    .name(buildLabel('Posição X do personagem (normalizada)', 'HORIZONTAL_POSITION'));
  playerFolder
    .add(playerConfig, 'VERTICAL_POSITION', 0, 1, 0.05)
    .name(buildLabel('Posição Y inicial do personagem (normalizada)', 'VERTICAL_POSITION'));
  playerFolder.add(playerConfig, 'ARRIVAL_THRESHOLD', 10, 200, 5).name(buildLabel('Limite para considerar “chegou”', 'ARRIVAL_THRESHOLD'));
  playerFolder.add(playerConfig, 'ENTER_SPEED', 1, 10, 0.5).name(buildLabel('Velocidade de entrada', 'ENTER_SPEED'));
  playerFolder
    .add(playerConfig, 'BRAKING_FORCE', 0.001, 0.05, 0.001)
    .name(buildLabel('Fator de frenagem ao se aproximar', 'BRAKING_FORCE'));
  playerFolder
    .add(playerConfig, 'ENTRY_DIVE_SPEED_Y', 100, 800, 50)
    .name(buildLabel('Velocidade vertical do mergulho (Y)', 'ENTRY_DIVE_SPEED_Y'));
  playerFolder
    .add(playerConfig, 'ENTRY_START_Y_FACTOR', 1, 5, 0.1)
    .name(buildLabel('Fator do Y inicial da entrada', 'ENTRY_START_Y_FACTOR'));
  playerFolder
    .add(playerConfig, 'SPRITE_ANIM_SPEED', 0.05, 0.5, 0.01)
    .name(buildLabel('Velocidade de animação do sprite', 'SPRITE_ANIM_SPEED'));
  playerFolder.add(playerConfig, 'MAX_ROTATION', 0.01, 0.5, 0.01).name(buildLabel('Rotação máxima do personagem', 'MAX_ROTATION'));
  playerFolder
    .add(playerConfig, 'VERTICAL_CURVE_FACTOR', 0.05, 0.5, 0.01)
    .name(buildLabel('Curva vertical do movimento (seno)', 'VERTICAL_CURVE_FACTOR'));
  playerFolder.addColor(playerConfig, 'GLOW_COLOR').name(buildLabel('Cor do brilho do personagem (glow)', 'GLOW_COLOR'));
  playerFolder.add(playerConfig, 'GLOW_BLUR', 20, 250, 5).name(buildLabel('Desfoque do glow', 'GLOW_BLUR'));
  playerFolder.add(playerConfig, 'GLOW_BRIGHTNESS', 0.5, 3, 0.1).name(buildLabel('Brilho do glow', 'GLOW_BRIGHTNESS'));
  playerFolder.add(playerConfig, 'SPRITE_WIDTH', 200, 1000, 20).name(buildLabel('Largura do sprite do personagem (px)', 'SPRITE_WIDTH'));
  playerFolder
    .add(playerConfig, 'SPRITE_TOTAL_HEIGHT', 2000, 12000, 200)
    .name(buildLabel('Altura total da spritesheet (px)', 'SPRITE_TOTAL_HEIGHT'));
  playerFolder.add(playerConfig, 'SPRITE_FRAMES', 10, 60, 1).name(buildLabel('Quantidade de frames na spritesheet', 'SPRITE_FRAMES'));

  const indicatorFolder = logicFolder.addFolder('INDICATOR_CONFIG');
  const indicatorConfig = INDICATOR_CONFIG as Mutable<typeof INDICATOR_CONFIG>;
  indicatorFolder.add(indicatorConfig, 'ENABLED').name(buildLabel('Indicador visível na tela', 'ENABLED'));
  indicatorFolder.add(indicatorConfig, 'NAME').name(buildLabel('Nome do indicador (exibido na UI)', 'NAME'));
  const indicatorImages = indicatorConfig.IMAGES as Mutable<typeof indicatorConfig.IMAGES>;
  indicatorFolder.add(indicatorImages, 'OFF').name(buildLabel('Imagem do indicador OFF', 'IMAGES.OFF'));
  indicatorFolder.add(indicatorImages, 'ON').name(buildLabel('Imagem do indicador ON', 'IMAGES.ON'));

  const visualBreathFolder = logicFolder.addFolder('VISUAL_BREATH_INDICATOR_CONFIG');
  const visualBreathConfig = VISUAL_BREATH_INDICATOR_CONFIG as Mutable<typeof VISUAL_BREATH_INDICATOR_CONFIG>;
  visualBreathFolder.add(visualBreathConfig, 'ENABLED').name(buildLabel('Indicadores visuais de respiração (ligar)', 'ENABLED'));
  visualBreathFolder.add(visualBreathConfig, 'LAYOUT', ['topDown']).name(buildLabel('Layout do indicador (modo de respiração)', 'LAYOUT'));

  const visualBreathTopDown = visualBreathConfig.TOP_DOWN as Mutable<typeof visualBreathConfig.TOP_DOWN>;
  visualBreathFolder.add(visualBreathTopDown, 'ANIMATION_FPS', 1, 20, 1).name(buildLabel('FPS da animação do indicador', 'ANIMATION_FPS'));
  visualBreathFolder
    .add(visualBreathTopDown, 'WIDTH_RATIO', 0.1, 1, 0.05)
    .name(buildLabel('Tamanho do indicador (razão da largura)', 'WIDTH_RATIO'));
  visualBreathFolder
    .add(visualBreathTopDown, 'INHALE_OFFSET_Y', 0, 1, 0.05)
    .name(buildLabel('Offset Y na inspiração (INHALE)', 'INHALE_OFFSET_Y'));
  visualBreathFolder
    .add(visualBreathTopDown, 'EXHALE_OFFSET_Y', 0, 1, 0.05)
    .name(buildLabel('Offset Y na expiração (EXHALE)', 'EXHALE_OFFSET_Y'));

  const particlesFolder = logicFolder.addFolder('PARTICLES_CONFIG');
  const particlesConfig = PARTICLES_CONFIG as Mutable<typeof PARTICLES_CONFIG>;
  particlesFolder
    .add(particlesConfig, 'PARTICLE_SPAWN_INTERVAL_MS', 50, 4000, 25)
    .name(buildLabel('Intervalo de criação de partículas', 'PARTICLE_SPAWN_INTERVAL_MS'));
  particlesFolder
    .add(particlesConfig, 'SIZE_MODIFIER_MIN', 0.01, 2, 0.01)
    .name(buildLabel('Tamanho mínimo (modificador)', 'SIZE_MODIFIER_MIN'));
  particlesFolder
    .add(particlesConfig, 'SIZE_MODIFIER_MAX', 0.01, 2, 0.01)
    .name(buildLabel('Tamanho máximo (modificador)', 'SIZE_MODIFIER_MAX'));
  particlesFolder.add(particlesConfig, 'BASE_SIZE', 10, 400, 10).name(buildLabel('Tamanho base das partículas', 'BASE_SIZE'));
  particlesFolder.add(particlesConfig, 'SPEED_MIN', 0.1, 10, 0.1).name(buildLabel('Velocidade mínima da partícula', 'SPEED_MIN'));
  particlesFolder.add(particlesConfig, 'SPEED_MAX', 0.2, 12, 0.1).name(buildLabel('Velocidade máxima da partícula', 'SPEED_MAX'));
  particlesFolder.add(particlesConfig, 'CURVE_MAX', 0, 30, 0.5).name(buildLabel('Curvatura máxima do movimento', 'CURVE_MAX'));
  particlesFolder
    .add(particlesConfig, 'ANGULAR_VELOCITY_MIN', 0.0001, 0.2, 0.0005)
    .name(buildLabel('Velocidade angular mínima', 'ANGULAR_VELOCITY_MIN'));
  particlesFolder
    .add(particlesConfig, 'ANGULAR_VELOCITY_MAX', 0.001, 0.3, 0.001)
    .name(buildLabel('Velocidade angular máxima', 'ANGULAR_VELOCITY_MAX'));
  particlesFolder.add(particlesConfig, 'OPACITY', 0.05, 1, 0.05).name(buildLabel('Opacidade das partículas', 'OPACITY'));

  const companionFolder = logicFolder.addFolder('COMPANIONS_CONFIG');
  COMPANIONS_CONFIG.forEach((companion, i) => {
    const comp = companion as Mutable<typeof companion>;
    const folder = companionFolder.addFolder(`Companion ${i + 1} (${comp.id})`);

    folder.add(comp, 'entryDelay', 0, 1, 0.05).name(buildLabel('Delay de entrada (sem sensor)', 'entryDelay'));
    folder.add(comp, 'phaseLag', 0, 5, 0.1).name(buildLabel('Defasagem do movimento (seno)', 'phaseLag'));
    folder.add(comp, 'speed', 0.1, 6, 0.1).name(buildLabel('Speed (afeta target e timing)', 'speed'));
    folder.add(comp, 'width', 10, 700, 10).name(buildLabel('Largura do sprite', 'width'));
    folder.add(comp, 'height', 10, 9000, 100).name(buildLabel('Altura do sprite', 'height'));
    folder.add(comp, 'frames', 1, 60, 1).name(buildLabel('Frames do sprite', 'frames'));
    folder.add(comp, 'horizontalPos', 0, 1, 0.05).name(buildLabel('Posição X (normalizada)', 'horizontalPos'));
    folder.add(comp, 'verticalPos', 0, 1, 0.05).name(buildLabel('Posição Y (normalizada)', 'verticalPos'));
    folder.add(comp, 'scale', 0.1, 2, 0.05).name(buildLabel('Escala visual do companion', 'scale'));
    folder.add(comp, 'sineAmplitude', 0, 0.5, 0.01).name(buildLabel('Amplitude da oscilação vertical', 'sineAmplitude'));
    folder.add(comp, 'animSpeed', 0.1, 30, 0.5).name(buildLabel('Velocidade da animação do sprite', 'animSpeed'));
    folder.add(comp, 'enterSpeed', 0.1, 15, 0.5).name(buildLabel('Speed de entrada (IN)', 'enterSpeed'));
    folder.add(comp, 'exitSpeed', 0.1, 6, 0.1).name(buildLabel('Speed de saída (OUT)', 'exitSpeed'));
    folder.add(comp, 'brakingForce', 0.0001, 0.1, 0.001).name(buildLabel('Força de frenagem', 'brakingForce'));
    folder.add(comp, 'minStayTime', 0, 30000, 500).name(buildLabel('Tempo mínimo dentro (ms)', 'minStayTime'));
    folder.add(comp, 'minCooldownTime', 0, 30000, 500).name(buildLabel('Tempo mínimo fora/espera (ms)', 'minCooldownTime'));
    folder
      .add(comp, 'requiredIndicators', 1, getMaxRmssdTier(), 1)
      .name(buildLabel('Tier mínimo (RMSSD) para entrar', 'requiredIndicators'));
    folder.add(comp, 'id').name(buildLabel('ID do companion (debug)', 'id'));
  });

  const gameAssetsFolder = logicFolder.addFolder('GAME_ASSETS');
  const gameAssetsConfig = GAME_ASSETS as Mutable<typeof GAME_ASSETS>;
  gameAssetsFolder
    .add(gameAssetsConfig, 'MAIN_CHARACTER_ICON')
    .name(buildLabel('Imagem estática do personagem (menu / favicon)', 'MAIN_CHARACTER_ICON'));
  gameAssetsFolder
    .add(gameAssetsConfig, 'MAIN_CHARACTER_SPRITESHEET')
    .name(buildLabel('Spritesheet do personagem principal', 'MAIN_CHARACTER_SPRITESHEET'));
  const gameAssetsVisualBreath = gameAssetsConfig.VISUAL_BREATH_INDICATORS_TOP_DOWN as Mutable<
    typeof gameAssetsConfig.VISUAL_BREATH_INDICATORS_TOP_DOWN
  >;
  gameAssetsFolder.add(gameAssetsVisualBreath, 'INHALE').name(buildLabel('Asset INHALE do respiração visual', 'VISUAL_BREATH.INHALE'));
  gameAssetsFolder.add(gameAssetsVisualBreath, 'EXHALE').name(buildLabel('Asset EXHALE do respiração visual', 'VISUAL_BREATH.EXHALE'));
  gameAssetsFolder.add(gameAssetsConfig, 'PARTICLE').name(buildLabel('Asset da partícula (sprite/PNG)', 'PARTICLE'));
  gameAssetsFolder.add(gameAssetsConfig, 'BUTTONS').name(buildLabel('Sprite sheet dos botões', 'BUTTONS'));
  gameAssetsFolder.add(gameAssetsConfig, 'WELCOME_ICONS').name(buildLabel('Sprite sheet dos ícones de boas-vindas', 'WELCOME_ICONS'));
  const gameAssetsCompanions = gameAssetsConfig.COMPANIONS as Mutable<typeof gameAssetsConfig.COMPANIONS>;
  type CompanionAssetPath = (typeof GAME_ASSETS.COMPANIONS)[number];
  const companionsImagesState: Record<string, CompanionAssetPath> = {};
  gameAssetsCompanions.forEach((imgPath, idx) => {
    companionsImagesState[`companion_${idx}`] = imgPath;
    gameAssetsFolder
      .add(companionsImagesState, `companion_${idx}`)
      .name(`Companions[${idx}] (caminho do asset)`)
      .onChange((value: string) => {
        gameAssetsConfig.COMPANIONS[idx] = value as CompanionAssetPath;
      });
  });

  const audioFolder = logicFolder.addFolder('AUDIO_CONFIG');
  const audioConfig = AUDIO_CONFIG as Mutable<typeof AUDIO_CONFIG>;
  audioFolder.add(audioConfig, 'DEFAULT_MUSIC_VOLUME', 0, 1, 0.05).name(buildLabel('Volume padrão da música', 'DEFAULT_MUSIC_VOLUME'));
  audioFolder.add(audioConfig, 'DEFAULT_SFX_VOLUME', 0, 1, 0.05).name(buildLabel('Volume padrão dos SFX', 'DEFAULT_SFX_VOLUME'));
  audioFolder.add(audioConfig, 'BREATH_MAX_GAIN', 0.1, 1, 0.05).name(buildLabel('Ganho máximo da respiração (áudio)', 'BREATH_MAX_GAIN'));
  audioFolder
    .add(audioConfig, 'BREATH_PEAK_RATIO', 0.1, 0.9, 0.05)
    .name(buildLabel('Relação de pico da respiração (áudio)', 'BREATH_PEAK_RATIO'));
  audioFolder
    .add(audioConfig, 'BREATH_SYNC_TO_PHASE_DURATION')
    .name(buildLabel('Respiração: duração da fase + loop se clipe curto (in+ex)', 'BREATH_SYNC_TO_PHASE_DURATION'));

  const endGameAudioFolder = audioFolder.addFolder('END_GAME_AUDIO');
  const endGameAudioConfig = audioConfig.END_GAME_AUDIO as Mutable<typeof audioConfig.END_GAME_AUDIO>;
  endGameAudioFolder
    .add(endGameAudioConfig, 'ENABLED')
    .name(buildLabel('Som ao fim da partida (level complete)', 'END_GAME_AUDIO.ENABLED'));
  endGameAudioFolder
    .add(endGameAudioConfig, 'VOLUME', 0, 1, 0.05)
    .name(buildLabel('Volume do som ao fim da partida', 'END_GAME_AUDIO.VOLUME'));

  const audioTracksFolder = audioFolder.addFolder('TRACKS');
  const tracksConfig = audioConfig.TRACKS as Mutable<typeof audioConfig.TRACKS>;
  tracksConfig.forEach((track, idx) => {
    const trackFolder = audioTracksFolder.addFolder(`Track ${idx + 1} (${track.id})`);
    trackFolder.add(track as Mutable<typeof track>, 'name').name(buildLabel('Nome da faixa', 'name'));
    trackFolder.add(track as Mutable<typeof track>, 'src').name(buildLabel('Caminho do arquivo', 'src'));
    trackFolder.add(track as Mutable<typeof track>, 'id').name(buildLabel('ID (debug)', 'id'));
  });

  const audioSfxFolder = audioFolder.addFolder('SOUND_EFFECTS');
  const sfxConfig = audioConfig.SOUND_EFFECTS as Mutable<typeof audioConfig.SOUND_EFFECTS>;
  audioSfxFolder.add(sfxConfig, 'PARTICLE').name(buildLabel('SFX partículas', 'SOUND_EFFECTS.PARTICLE'));
  audioSfxFolder.add(sfxConfig, 'LEVEL_COMPLETE').name(buildLabel('SFX level completo', 'SOUND_EFFECTS.LEVEL_COMPLETE'));
  audioSfxFolder.add(sfxConfig, 'IN').name(buildLabel('SFX entrada (IN)', 'SOUND_EFFECTS.IN'));
  audioSfxFolder.add(sfxConfig, 'OUT').name(buildLabel('SFX saída (OUT)', 'SOUND_EFFECTS.OUT'));
  audioSfxFolder.add(sfxConfig, 'INHALE').name(buildLabel('SFX inspiração (subida)', 'SOUND_EFFECTS.INHALE'));
  audioSfxFolder.add(sfxConfig, 'EXHALE').name(buildLabel('SFX expiração (descida)', 'SOUND_EFFECTS.EXHALE'));

  const uiFolder = logicFolder.addFolder('UI_CONFIG');
  const uiConfig = UI_CONFIG as Mutable<typeof UI_CONFIG>;
  uiFolder.add(uiConfig, 'PARTICLE_INTERVAL', 50, 1500, 25).name(buildLabel('Intervalo de partículas na UI', 'PARTICLE_INTERVAL'));
  uiFolder.add(uiConfig, 'EVENT_INTERVAL', 10, 1000, 10).name(buildLabel('Intervalo de eventos visuais', 'EVENT_INTERVAL'));

  const timingFolder = logicFolder.addFolder('TIMING');
  const timingConfig = TIMING as Mutable<typeof TIMING>;
  timingFolder
    .add(timingConfig, 'SCORE_UPDATE_INTERVAL', 200, 5000, 100)
    .name(buildLabel('Atualização de score (ms)', 'SCORE_UPDATE_INTERVAL'));
  timingFolder.add(timingConfig, 'ANIMATION_FRAME_RATE', 10, 240, 5).name(buildLabel('FPS/ritmo de animação', 'ANIMATION_FRAME_RATE'));
  timingFolder.add(timingConfig, 'TRANSITION_DURATION', 0, 2000, 50).name(buildLabel('Duração de transições (ms)', 'TRANSITION_DURATION'));

  const bleFolder = logicFolder.addFolder('BLE_CONFIG');
  const bleConfig = BLE_CONFIG as Mutable<typeof BLE_CONFIG>;
  bleFolder.add(bleConfig, 'DEVICE_NAME_PREFIX').name(buildLabel('Prefixo do device BLE', 'DEVICE_NAME_PREFIX'));
  bleFolder
    .add(bleConfig, 'BATTERY_UPDATE_INTERVAL', 1000, 120000, 1000)
    .name(buildLabel('Intervalo de update da bateria (ms)', 'BATTERY_UPDATE_INTERVAL'));

  const vfcFolder = logicFolder.addFolder('VFC_CONFIG');
  const vfcConfig = VFC_CONFIG as Mutable<typeof VFC_CONFIG>;
  vfcFolder.add(vfcConfig, 'MAX_RR_INTERVALS', 10, 1000, 25).name(buildLabel('Máximo de RR na memória', 'MAX_RR_INTERVALS'));
  vfcFolder.add(vfcConfig, 'WINDOW_BEATS', 2, 80, 1).name(buildLabel('Janela (quantidade de batimentos)', 'WINDOW_BEATS'));
  vfcFolder.add(vfcConfig, 'WINDOW_MAX_AGE_MS', 1000, 120000, 500).name(buildLabel('Idade máxima (ms) da janela', 'WINDOW_MAX_AGE_MS'));
  vfcFolder
    .add(vfcConfig, 'METRICS_INTERVAL_MS', 250, 15000, 250)
    .name(buildLabel('Intervalo de recálculo de métricas (ms)', 'METRICS_INTERVAL_MS'));
  vfcFolder.add(vfcConfig, 'ANOMALY_THRESHOLD', 0.01, 0.8, 0.01).name(buildLabel('Threshold de anomalias/artifatos', 'ANOMALY_THRESHOLD'));
  vfcFolder.add(vfcConfig, 'RR_MIN_MS', 150, 450, 5).name(buildLabel('Sanidade fisiológica: RR mínimo', 'RR_MIN_MS'));
  vfcFolder.add(vfcConfig, 'RR_MAX_MS', 800, 3000, 50).name(buildLabel('Sanidade fisiológica: RR máximo', 'RR_MAX_MS'));
  vfcFolder.add(vfcConfig, 'GAP_MIN_MS', 50, 1500, 25).name(buildLabel('Gap mínimo (ms) para detectar batimento perdido', 'GAP_MIN_MS'));
  vfcFolder.add(vfcConfig, 'GAP_RR_FRACTION', 0.05, 0.95, 0.05).name(buildLabel('Gap como fração do RR', 'GAP_RR_FRACTION'));
  vfcFolder.add(vfcConfig, 'BASELINE_SAMPLES', 1, 200, 5).name(buildLabel('Amostras para baseline', 'BASELINE_SAMPLES'));
  vfcFolder.add(vfcConfig, 'BASELINE_IGNORE_SAMPLES', 0, 100, 1).name(buildLabel('Amostras iniciais ignoradas', 'BASELINE_IGNORE_SAMPLES'));
  vfcFolder
    .add(vfcConfig, 'BASELINE_THRESHOLD_MULTIPLIER', 0.1, 3, 0.1)
    .name(buildLabel('Multiplicador para limiar (se usado no score)', 'BASELINE_THRESHOLD_MULTIPLIER'));
  vfcFolder.add(vfcConfig, 'DEFAULT_RMSSD', 0, 200, 5).name(buildLabel('RMSSD default (fallback/debug)', 'DEFAULT_RMSSD'));
  vfcFolder.add(vfcConfig, 'DEFAULT_HEART_RATE', 20, 150, 5).name(buildLabel('FC default (fallback/debug)', 'DEFAULT_HEART_RATE'));
  vfcFolder.add(vfcConfig, 'SIMULATION_VARIANCE', 0, 50, 1).name(buildLabel('Variância da simulação (debug)', 'SIMULATION_VARIANCE'));
  vfcFolder.add(vfcConfig, 'UPDATE_INTERVAL', 10, 1000, 5).name(buildLabel('Intervalo base de update (ms)', 'UPDATE_INTERVAL'));

  const backgroundFolder = logicFolder.addFolder('BACKGROUND_LAYERS');
  const layersConfig = BACKGROUND_LAYERS as Mutable<typeof BACKGROUND_LAYERS>;
  layersConfig.forEach((layer, idx) => {
    const layerFolder = backgroundFolder.addFolder(`Layer ${idx + 1} (${layer.id})`);
    layerFolder.add(layer as Mutable<typeof layer>, 'id').name(buildLabel('ID (debug)', 'id'));
    layerFolder.add(layer as Mutable<typeof layer>, 'src').name(buildLabel('Caminho da imagem', 'src'));
    layerFolder.add(layer as Mutable<typeof layer>, 'speed', 0, 5, 0.05).name(buildLabel('Velocidade/parallax', 'speed'));
  });

  const actionsFolder = logicFolder.addFolder('Ações');
  actionsFolder
    .add(
      {
        recarregar: () => window.location.reload()
      },
      'recarregar'
    )
    .name('🔄 Recarregar (descarta ajustes do GUI)');

  attachDevRerenderHooks(gui);

  return gui;
}

export default function DevConfigGUI() {
  const guiRef = useRef<dat.GUI | null>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    if (!isDev) return;

    guiRef.current = buildGUI();
    if (!guiRef.current) return;

    const gui = guiRef.current;
    gui.hide();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        visibleRef.current = !visibleRef.current;
        if (visibleRef.current) {
          gui.show();
        } else {
          gui.hide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      gui.destroy();
      guiRef.current = null;
    };
  }, []);

  return null;
}
