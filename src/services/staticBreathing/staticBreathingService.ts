import {
  getCycleDurationMs,
  getIntervalBreathingState
} from '../game/breathingRhythmService';
import type { BreathingPatternId } from '../../types/game';
import type { StaticBreathingFrameState, StaticBreathingPhase } from '../../types/staticBreathing';
import { STATIC_BREATHING_CONFIG } from '../../utils/constants';

/** Cache de imagens dos sprites estáticos (mesmo padrão de `TileImageRegistry`). */
export type StaticBreathingImageRegistry = Map<string, HTMLImageElement>;

export const createStaticBreathingImageRegistry = (): StaticBreathingImageRegistry => new Map();

const getStaticBreathingImageUrls = (): string[] => [
  STATIC_BREATHING_CONFIG.IMAGES.IDLE,
  STATIC_BREATHING_CONFIG.IMAGES.BREATHING_SHEET,
  STATIC_BREATHING_CONFIG.IMAGES.BACKGROUND
];

/**
 * Carrega (uma única vez) os PNGs/JPEG declarados em `STATIC_BREATHING_CONFIG.IMAGES`.
 * Tolerante a falha: se um asset não carregar, o desenho cai no fallback sem quebrar.
 */
export const preloadStaticBreathingImages = (registry: StaticBreathingImageRegistry): void => {
  getStaticBreathingImageUrls().forEach((url) => {
    if (registry.has(url)) return;
    const img = new Image();
    img.src = url;
    img.onerror = () => {
      console.warn(`[staticBreathing] falha ao carregar imagem: ${url}`);
    };
    registry.set(url, img);
  });
};

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Calcula o frame da cena estática a partir do tempo decorrido + ritmo do menu.
 *
 * Como o spritesheet `BREATHING_SHEET` faz loop perfeito (frame 0 ≈ frame N-1 = peito
 * vazio; ~frame N/2 = peito cheio), basta varrer `0..N-1` de forma adequada:
 *
 * - `continuous`: `cycleProgress01` cresce linearmente `0 → 1` no ciclo. A arte
 *   carrega a forma do movimento, o código só varre na velocidade certa.
 * - `intervals`: usa `getIntervalBreathingState().cycleProgress01`. A ordem cronológica
 *   é `up → top → down → bottom` (em t=0 começa inspirando do frame 0). A função
 *   **segura** em `0.5` durante `top` (hold inspirado, frame N/2) e em `0` durante
 *   `bottom` (hold expirado, frame 0). As transições `up`/`down` varrem suavemente o
 *   restante.
 *
 * A `phase` (`inhaling`/`exhaling`) é usada apenas para disparar `onInhale`/`onExhale`
 * nas trocas (áudio). A animação visual depende apenas de `cycleProgress01`, e o mesmo
 * `cycleProgress01` é reaproveitado pela abelha companheira como guia respiratório.
 */
export const computeStaticBreathingFrame = (
  sessionElapsedMs: number,
  cyclesPerMinute: number,
  pattern: BreathingPatternId
): StaticBreathingFrameState => {
  const { BREATHING_FRAMES } = STATIC_BREATHING_CONFIG;
  const safeElapsed = sessionElapsedMs > 0 ? sessionElapsedMs : 0;

  let cycleProgress01: number;
  let phase: StaticBreathingPhase;

  if (pattern === 'intervals') {
    const st = getIntervalBreathingState(safeElapsed, cyclesPerMinute);
    cycleProgress01 = clamp01(st.cycleProgress01);
    phase = st.phase === 'top' || st.phase === 'up' ? 'inhaling' : 'exhaling';
  } else {
    const cycleMs = getCycleDurationMs(cyclesPerMinute);
    cycleProgress01 = cycleMs > 0 ? clamp01((safeElapsed % cycleMs) / cycleMs) : 0;
    phase = cycleProgress01 < 0.5 ? 'inhaling' : 'exhaling';
  }

  const frameCount = Math.max(1, BREATHING_FRAMES);
  const frameIndex = Math.min(frameCount - 1, Math.floor(cycleProgress01 * frameCount));

  return { phase, cycleProgress01, frameIndex };
};

const isImageReady = (img: HTMLImageElement | undefined): img is HTMLImageElement =>
  !!img && img.complete && img.naturalWidth > 0;

const applyBackgroundDim = (
  ctx: CanvasRenderingContext2D,
  viewport: { width: number; height: number }
): void => {
  const { BACKGROUND_DIM_OPACITY, BACKGROUND_DIM_COLOR } = STATIC_BREATHING_CONFIG;
  if (BACKGROUND_DIM_OPACITY <= 0) return;

  ctx.save();
  ctx.globalAlpha = BACKGROUND_DIM_OPACITY;
  ctx.fillStyle = BACKGROUND_DIM_COLOR;
  ctx.fillRect(0, 0, viewport.width, viewport.height);
  ctx.restore();
};

const drawStaticBreathingBackground = (
  ctx: CanvasRenderingContext2D,
  registry: StaticBreathingImageRegistry,
  viewport: { width: number; height: number }
): void => {
  const { width, height } = viewport;
  const bg = registry.get(STATIC_BREATHING_CONFIG.IMAGES.BACKGROUND);

  if (isImageReady(bg)) {
    if (STATIC_BREATHING_CONFIG.BACKGROUND_FIT === 'fill') {
      ctx.drawImage(bg, 0, 0, width, height);
    } else {
      const imgAspect = bg.naturalWidth / bg.naturalHeight;
      const viewAspect = width / height;
      let drawW = width;
      let drawH = height;
      let dx = 0;
      let dy = 0;

      if (imgAspect > viewAspect) {
        drawH = height;
        drawW = height * imgAspect;
        dx = (width - drawW) / 2;
      } else {
        drawW = width;
        drawH = width / imgAspect;
        dy = (height - drawH) / 2;
      }

      ctx.drawImage(bg, dx, dy, drawW, drawH);
    }
  } else {
    ctx.fillStyle = STATIC_BREATHING_CONFIG.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, width, height);
  }

  applyBackgroundDim(ctx, viewport);
};

/**
 * Pinta a cena estática usando o spritesheet `BREATHING_SHEET`:
 * 1. Fundo (`BACKGROUND` ou `BACKGROUND_COLOR`).
 * 2. Recorta a fatia do frame e desenha o personagem centralizado.
 */
export const drawStaticBreathingScene = (
  ctx: CanvasRenderingContext2D,
  registry: StaticBreathingImageRegistry,
  frame: StaticBreathingFrameState,
  viewport: { width: number; height: number }
): void => {
  const { width, height } = viewport;
  drawStaticBreathingBackground(ctx, registry, viewport);

  const sheet = registry.get(STATIC_BREATHING_CONFIG.IMAGES.BREATHING_SHEET);
  if (!isImageReady(sheet)) return;

  const frameCount = Math.max(1, STATIC_BREATHING_CONFIG.BREATHING_FRAMES);
  const frameH = Math.max(1, Math.floor(sheet.naturalHeight / frameCount));
  const frameW = sheet.naturalWidth;
  const sy = Math.min(frame.frameIndex, frameCount - 1) * frameH;

  const aspect = frameW / frameH;
  const targetH = height * STATIC_BREATHING_CONFIG.SCREEN_HEIGHT_FRACTION;
  const targetW = targetH * aspect;
  const dx = (width - targetW) / 2;
  const dy = (height - targetH) / 2;

  ctx.drawImage(sheet, 0, sy, frameW, frameH, dx, dy, targetW, targetH);
};

/**
 * Pinta a cena estática usando o PNG `IDLE` (sem animação) — destinado a estados
 * neutros como pause ou tela de welcome quando ainda não há sessão ativa.
 */
export const drawStaticBreathingIdle = (
  ctx: CanvasRenderingContext2D,
  registry: StaticBreathingImageRegistry,
  viewport: { width: number; height: number }
): void => {
  const { width, height } = viewport;
  drawStaticBreathingBackground(ctx, registry, viewport);

  const img = registry.get(STATIC_BREATHING_CONFIG.IMAGES.IDLE);
  if (!isImageReady(img)) return;

  const aspect = img.naturalWidth / img.naturalHeight;
  const targetH = height * STATIC_BREATHING_CONFIG.SCREEN_HEIGHT_FRACTION;
  const targetW = targetH * aspect;
  const dx = (width - targetW) / 2;
  const dy = (height - targetH) / 2;

  ctx.drawImage(img, dx, dy, targetW, targetH);
};
