import type { StaticBreathingTransitionState } from '../../types/staticBreathing';
import { STATIC_BREATHING_TRANSITION_CONFIG } from '../../utils/constants';

/**
 * Estado inicial da transição (sem fade ativo).
 */
export const createTransitionState = (): StaticBreathingTransitionState => ({
  status: 'idle',
  elapsedMs: 0
});

/**
 * Avança `elapsedMs` da fase atual; retorna `true` se acabou de **terminar** (transição
 * de `fadeOut` -> `idle-aguardando-swap` ou `fadeIn` -> `idle`). O caller usa essa flag
 * para encadear o swap de modo (`enterExploration()`) ou para marcar a transição como concluída.
 */
export const advanceTransition = (state: StaticBreathingTransitionState, deltaMs: number): boolean => {
  if (state.status === 'idle') return false;
  state.elapsedMs += deltaMs;
  const total =
    state.status === 'fadeOut'
      ? STATIC_BREATHING_TRANSITION_CONFIG.FADE_OUT_MS
      : STATIC_BREATHING_TRANSITION_CONFIG.FADE_IN_MS;
  return state.elapsedMs >= Math.max(0, total);
};

export const beginFadeOut = (state: StaticBreathingTransitionState): void => {
  state.status = 'fadeOut';
  state.elapsedMs = 0;
};

export const beginFadeIn = (state: StaticBreathingTransitionState): void => {
  state.status = 'fadeIn';
  state.elapsedMs = 0;
};

export const endTransition = (state: StaticBreathingTransitionState): void => {
  state.status = 'idle';
  state.elapsedMs = 0;
};

/**
 * Calcula o alpha (0..1) do overlay preto no estado atual.
 * - `idle`   -> 0 (overlay invisível).
 * - `fadeOut` -> 0 -> 1 ao longo de `FADE_OUT_MS`.
 * - `fadeIn`  -> 1 -> 0 ao longo de `FADE_IN_MS`.
 */
export const getTransitionAlpha = (state: StaticBreathingTransitionState): number => {
  if (state.status === 'idle') return 0;
  const total =
    state.status === 'fadeOut'
      ? STATIC_BREATHING_TRANSITION_CONFIG.FADE_OUT_MS
      : STATIC_BREATHING_TRANSITION_CONFIG.FADE_IN_MS;
  if (total <= 0) return state.status === 'fadeOut' ? 1 : 0;
  const t = Math.max(0, Math.min(1, state.elapsedMs / total));
  return state.status === 'fadeOut' ? t : 1 - t;
};

/**
 * Desenha o overlay preto (ou cor configurada) com o alpha atual.
 * Sem efeito visual se `alpha <= 0`.
 */
export const drawTransitionOverlay = (
  ctx: CanvasRenderingContext2D,
  viewport: { width: number; height: number },
  alpha: number
): void => {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = STATIC_BREATHING_TRANSITION_CONFIG.FADE_COLOR;
  ctx.fillRect(0, 0, viewport.width, viewport.height);
  ctx.restore();
};
