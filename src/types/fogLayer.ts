export type FogCellState = 'fogged' | 'popping' | 'clear';

export interface FogLayerJson {
  mapId: string;
  color?: string;
  /** Escala do tile de névoa (fallback: `EXPLORATION_FOG_CONFIG.TILE_DRAW_SCALE`). */
  tileDrawScale?: number;
  spawnRevealRadius?: number;
  /**
   * Raio (Chebyshev) revelado ao redor do baú no estado inicial.
   * 0 = baú continua escondido até o jogador descobrir; >0 = baú visível desde o spawn.
   * Pensado para mapas educativos onde o objetivo deve ser visível mesmo com caminho difícil.
   */
  chestRevealRadius?: number;
  /**
   * Raio (Chebyshev) revelado ao redor do pé do jogador a cada passo.
   * 0 = só a célula em que o jogador pisa; 1 = quadrado 3x3 (1 tile em cada direção); 2 = 5x5; etc.
   * Quando omitido, usa o fallback global `EXPLORATION_FOG_CONFIG.WALK_REVEAL_RADIUS`.
   */
  walkRevealRadius?: number;
  initialFogged?: boolean;
}

export interface FogLayerConfig {
  color: string;
  tileDrawScale: number;
  spawnRevealRadius: number;
  chestRevealRadius: number;
  walkRevealRadius: number;
  initialFogged: boolean;
}

export interface FogPopConfig {
  durationMs: number;
  peakScale: number;
}

export interface FogGridState {
  cols: number;
  rows: number;
  tileSize: number;
  cells: FogCellState[][];
  popProgress: number[][];
}
