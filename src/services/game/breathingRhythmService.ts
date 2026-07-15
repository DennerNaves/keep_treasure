import type { IntervalBreathPhase } from '../../types/game';

export const BREATHING_INTERVAL_PHASE_RATIOS = {
  TOP: 0.1,
  DOWN: 0.4,
  BOTTOM: 0.1,
  UP: 0.4
} as const;

export type IntervalBreathingRhythmState = {
  phase: IntervalBreathPhase;
  phaseElapsedMs: number;
  /** Legacy whale — intensidade visual da curva (não usado pela cena estática). */
  breathPhase01: number;
  /** Legacy whale — posição vertical normalizada (-1 topo, +1 fundo). Não usado pela cena estática. */
  yNormalized: number;
  /**
   * Posição visual `0..1` no spritesheet de respiração estática (e na órbita da abelha).
   * Cronologia natural do ciclo: `up → top → down → bottom` (em t=0 começa inspirando).
   * - `up`     (inspirando)     → `0 → 0.5`     (varre vazio → cheio)
   * - `top`    (hold inspirado) → `0.5`         (trava no meio do sheet = peito cheio)
   * - `down`   (expirando)      → `0.5 → 1.0`   (varre cheio → vazio)
   * - `bottom` (hold expirado)  → `0`           (trava no frame 0 = peito vazio;
   *                                               salto `1.0 → 0` é invisível porque
   *                                               o sheet faz loop perfeito, ver
   *                                               `STATIC_BREATHING_CONFIG.BREATHING_FRAMES`)
   */
  cycleProgress01: number;
};

export const getCycleDurationMs = (cyclesPerMinute: number): number => {
  if (cyclesPerMinute <= 0) return 10_000;
  return 60_000 / cyclesPerMinute;
};

export const getIntervalPhaseDurationsMs = (cyclesPerMinute: number) => {
  const cycleMs = getCycleDurationMs(cyclesPerMinute);
  return {
    cycleMs,
    topMs: cycleMs * BREATHING_INTERVAL_PHASE_RATIOS.TOP,
    downMs: cycleMs * BREATHING_INTERVAL_PHASE_RATIOS.DOWN,
    bottomMs: cycleMs * BREATHING_INTERVAL_PHASE_RATIOS.BOTTOM,
    upMs: cycleMs * BREATHING_INTERVAL_PHASE_RATIOS.UP
  };
};

/**
 * Estado da respiração com intervalos (4 fases: `up → top → down → bottom`).
 *
 * Ordem cronológica natural: em `t=0` o ciclo começa inspirando (`up`) com
 * `cycleProgress01: 0` (frame 0 do spritesheet = peito vazio). Em seguida segura
 * inspirado (`top`), expira (`down`) e segura expirado (`bottom`) antes de reiniciar.
 *
 * Callers que precisam começar em outra fase aplicam um offset ao `sessionElapsedMs`
 * (ex.: a baleia legacy em [usePlayer.ts](src/hooks/usePlayer.ts) soma
 * `upMs + topMs + downMs` para começar em `bottom`).
 */
export const getIntervalBreathingState = (
  sessionElapsedMs: number,
  cyclesPerMinute: number
): IntervalBreathingRhythmState => {
  const { cycleMs, topMs, downMs, bottomMs, upMs } = getIntervalPhaseDurationsMs(cyclesPerMinute);
  const t = sessionElapsedMs <= 0 ? 0 : sessionElapsedMs % cycleMs;

  if (t < upMs) {
    const u = upMs > 0 ? t / upMs : 0;
    return {
      phase: 'up',
      phaseElapsedMs: t,
      breathPhase01: 0.05 + 0.5 * u,
      yNormalized: 1 - 2 * u,
      cycleProgress01: 0.5 * u
    };
  }

  let pos = t - upMs;
  if (pos < topMs) {
    const u = topMs > 0 ? pos / topMs : 0;
    return {
      phase: 'top',
      phaseElapsedMs: pos,
      breathPhase01: 0.55 + 0.45 * u,
      yNormalized: -1,
      cycleProgress01: 0.5
    };
  }

  pos -= topMs;
  if (pos < downMs) {
    const u = downMs > 0 ? pos / downMs : 0;
    return {
      phase: 'down',
      phaseElapsedMs: pos,
      breathPhase01: 0.55 - 0.3 * u,
      yNormalized: -1 + 2 * u,
      cycleProgress01: 0.5 + 0.5 * u
    };
  }

  pos -= downMs;
  const u = bottomMs > 0 ? Math.min(1, pos / bottomMs) : 0;
  return {
    phase: 'bottom',
    phaseElapsedMs: pos,
    breathPhase01: 0.25 - 0.2 * u,
    yNormalized: 1,
    cycleProgress01: 0
  };
};

/**
 * Estado da respiração contínua (sem intervalos): meia-respiração inspirando, meia expirando.
 * Pura e reusável fora do `usePlayer` (usada pela cena estática de respiração).
 *
 * - `phase`: `'inhaling'` na primeira metade do ciclo, `'exhaling'` na segunda.
 * - `phaseProgress01`: 0 no início da fase, 1 no fim (linear).
 */
export const getContinuousBreathingState = (
  sessionElapsedMs: number,
  cyclesPerMinute: number
): { phase: 'inhaling' | 'exhaling'; phaseProgress01: number } => {
  const cycleMs = getCycleDurationMs(cyclesPerMinute);
  const safeElapsed = sessionElapsedMs > 0 ? sessionElapsedMs : 0;
  const t = safeElapsed % cycleMs;
  const halfMs = cycleMs / 2;
  if (t < halfMs) {
    return { phase: 'inhaling', phaseProgress01: halfMs > 0 ? t / halfMs : 0 };
  }
  return { phase: 'exhaling', phaseProgress01: halfMs > 0 ? (t - halfMs) / halfMs : 0 };
};
