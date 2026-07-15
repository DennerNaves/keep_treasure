/**
 * Snapshot do estado da abelha companheira em um frame.
 * Calculado por `computeBeeCompanionState` a partir do `cycleProgress01` (mesma
 * fonte da animação da respiração) + `sessionElapsedMs` (para o frame das asas).
 */
export interface BeeCompanionState {
  /** Coordenada X em pixels no viewport (centro do sprite). */
  x: number;
  /** Coordenada Y em pixels no viewport (centro do sprite). */
  y: number;
  /** Índice do frame no spritesheet (`0..FRAMES-1`). Anima as asas. */
  spriteIndex: number;
  /**
   * `true` = aplicar `ctx.scale(-1, 1)` ao desenhar (arte default é left-facing,
   * então flipamos quando a abelha está se movendo para a direita).
   */
  facingRight: boolean;
}
