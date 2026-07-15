export interface TileFootstepConfig {
  src: string;
  volume?: number;
  minIntervalMs?: number;
}

export interface TileDefinition {
  color: string;
  blocksMovement: boolean;
  footstep?: TileFootstepConfig;
  /** Sprite opcional desenhado por cima da cor (mesmo tileSize). */
  image?: string;
}

export interface GridPosition {
  col: number;
  row: number;
}

export interface TileMapJson {
  id: string;
  tileSize: number;
  spawn: { col: number; row: number };
  /** Posição do baú (objetivo) em grelha — opcional por jogo/mapa. */
  chest_position?: GridPosition;
  tiles: Record<string, TileDefinition>;
  layout: string[][];
}

export interface ResolvedTile {
  key: string;
  color: string;
  blocksMovement: boolean;
  footstep?: TileFootstepConfig;
  image?: string;
}

export interface TileMapData {
  id: string;
  tileSize: number;
  cols: number;
  rows: number;
  worldWidth: number;
  worldHeight: number;
  spawnCol: number;
  spawnRow: number;
  chestCol?: number;
  chestRow?: number;
  grid: ResolvedTile[][];
}

export interface FootstepState {
  lastCol: number;
  lastRow: number;
  lastPlayAt: number;
}
