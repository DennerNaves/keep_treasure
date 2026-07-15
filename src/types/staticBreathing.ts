/**
 * Fase visual da respiração estática.
 * - `inhaling`: deve mostrar o sprite "inspirando" (peito cheio).
 * - `exhaling`: deve mostrar o sprite "neutro/expirando".
 */
export type StaticBreathingPhase = 'inhaling' | 'exhaling';

/**
 * Snapshot de um frame da cena estática, calculado a cada loop a partir do tempo
 * decorrido + `cyclesPerMinute` + `BreathingPatternId`. Mantido pequeno e puro para
 * que `drawStaticBreathingScene` seja totalmente determinístico.
 */
export interface StaticBreathingFrameState {
  /** Fase atual — usada apenas para disparar os SFX `onInhale`/`onExhale` nas trocas. */
  phase: StaticBreathingPhase;
  /** Progresso 0..1 dentro do ciclo respiratório completo (inspira + expira). */
  cycleProgress01: number;
  /** Frame do spritesheet a desenhar (0..BREATHING_FRAMES-1). */
  frameIndex: number;
}

/** Fases do fade entre a cena estática e a exploração. */
export type StaticBreathingTransitionStatus = 'idle' | 'fadeOut' | 'fadeIn';

export interface StaticBreathingTransitionState {
  status: StaticBreathingTransitionStatus;
  /** Tempo (ms) decorrido dentro da fase atual (`fadeOut` ou `fadeIn`). */
  elapsedMs: number;
}
