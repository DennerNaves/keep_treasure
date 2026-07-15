import type { FogCellState, FogGridState, FogLayerConfig, FogLayerJson, FogPopConfig } from '../../types/fogLayer';
import type { TileMapData } from '../../types/tileMap';
import { EXPLORATION_FOG_CONFIG, FARMER_TOPDOWN_CONFIG } from '../../utils/constants';
import { worldToGrid } from '../tileMap/tileMapService';

const DEFAULT_FOG_COLOR = EXPLORATION_FOG_CONFIG.COLOR;
const POP_GROW_PHASE = 0.4;

let fogTileImage: HTMLImageElement | null = null;
let fogTileImageUrl = '';
let fogTileImageLoaded = false;

const isFogTileReady = (): boolean =>
  fogTileImageLoaded && !!fogTileImage && fogTileImage.complete && fogTileImage.naturalWidth > 0;

/** `true` quando a arte do tile de névoa está pronta para `drawImage`. */
export const isFogTileImageReady = (): boolean => isFogTileReady();

/** Pré-carrega o tile de névoa (ex.: nuvem). Idempotente por URL. */
export const preloadFogTileImage = (url: string): void => {
  if (!url) return;
  if (fogTileImageUrl === url && fogTileImage) return;
  fogTileImageUrl = url;
  fogTileImageLoaded = false;
  const img = new Image();
  img.onload = () => {
    fogTileImageLoaded = true;
  };
  img.onerror = () => {
    console.warn(`[fogLayer] falha ao carregar tile de névoa: ${url}`);
    fogTileImage = null;
    fogTileImageLoaded = false;
  };
  img.src = url;
  fogTileImage = img;
  if (img.complete && img.naturalWidth > 0) {
    fogTileImageLoaded = true;
  }
};

/** Config síncrona (antes do fetch do JSON); equivalente ao fallback de `loadFogLayerConfig`. */
export const getDefaultFogLayerConfig = (): FogLayerConfig =>
  resolveFogConfig({ mapId: '', initialFogged: true });

/** Cobre o viewport quando o mapa já desenhou mas a grelha de névoa ainda não está pronta. */
export const drawFogViewportPlaceholder = (
  ctx: CanvasRenderingContext2D,
  viewportWidth: number,
  viewportHeight: number,
  color: string = EXPLORATION_FOG_CONFIG.FALLBACK_COLOR_OPAQUE
): void => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);
  ctx.restore();
};

export const getFogPopScale = (progress: number, peakScale: number): number => {
  const t = Math.max(0, Math.min(1, progress));
  if (t <= POP_GROW_PHASE) {
    return 1 + ((peakScale - 1) * t) / POP_GROW_PHASE;
  }
  const shrinkT = (t - POP_GROW_PHASE) / (1 - POP_GROW_PHASE);
  return peakScale * (1 - shrinkT);
};

const resolveFogConfig = (json: FogLayerJson): FogLayerConfig => ({
  color: json.color ?? DEFAULT_FOG_COLOR,
  tileDrawScale: json.tileDrawScale ?? EXPLORATION_FOG_CONFIG.TILE_DRAW_SCALE,
  spawnRevealRadius: json.spawnRevealRadius ?? EXPLORATION_FOG_CONFIG.SPAWN_REVEAL_RADIUS,
  chestRevealRadius: json.chestRevealRadius ?? EXPLORATION_FOG_CONFIG.CHEST_REVEAL_RADIUS,
  walkRevealRadius: json.walkRevealRadius ?? EXPLORATION_FOG_CONFIG.WALK_REVEAL_RADIUS,
  initialFogged: json.initialFogged !== false
});

export const loadFogLayerConfig = async (url: string): Promise<FogLayerConfig> => {
  preloadFogTileImage(EXPLORATION_FOG_CONFIG.TILE_IMAGE);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }
    const json = (await response.json()) as FogLayerJson;
    return resolveFogConfig(json);
  } catch (err) {
    console.warn('[fogLayer] falha ao carregar config, a usar defaults:', err);
    return resolveFogConfig({ mapId: '', initialFogged: true });
  }
};

const createEmptyGrid = (cols: number, rows: number, initial: FogCellState): { cells: FogCellState[][]; popProgress: number[][] } => {
  const cells: FogCellState[][] = [];
  const popProgress: number[][] = [];
  for (let row = 0; row < rows; row++) {
    cells.push(Array.from({ length: cols }, () => initial));
    popProgress.push(Array.from({ length: cols }, () => 0));
  }
  return { cells, popProgress };
};

export const createFogGridState = (map: TileMapData, config: FogLayerConfig): FogGridState => {
  const initial: FogCellState = config.initialFogged ? 'fogged' : 'clear';
  const { cells, popProgress } = createEmptyGrid(map.cols, map.rows, initial);

  if (config.initialFogged) {
    clearAroundSpawn(map, cells, popProgress, config.spawnRevealRadius);
    clearAroundChest(map, cells, popProgress, config.chestRevealRadius);
  }

  return {
    cols: map.cols,
    rows: map.rows,
    tileSize: map.tileSize,
    cells,
    popProgress
  };
};

const clearAroundSpawn = (
  map: TileMapData,
  cells: FogCellState[][],
  popProgress: number[][],
  radius: number
): void => {
  for (let row = -radius; row <= radius; row++) {
    for (let col = -radius; col <= radius; col++) {
      const c = map.spawnCol + col;
      const r = map.spawnRow + row;
      if (c >= 0 && c < map.cols && r >= 0 && r < map.rows) {
        cells[r][c] = 'clear';
        popProgress[r][c] = 0;
      }
    }
  }
};

const clearAroundChest = (
  map: TileMapData,
  cells: FogCellState[][],
  popProgress: number[][],
  radius: number
): void => {
  if (map.chestCol === undefined || map.chestRow === undefined) return;
  if (radius <= 0) return;
  for (let row = -radius; row <= radius; row++) {
    for (let col = -radius; col <= radius; col++) {
      const c = map.chestCol + col;
      const r = map.chestRow + row;
      if (c >= 0 && c < map.cols && r >= 0 && r < map.rows) {
        cells[r][c] = 'clear';
        popProgress[r][c] = 0;
      }
    }
  }
};

export const resetFogGridState = (state: FogGridState, map: TileMapData, config: FogLayerConfig): void => {
  const initial: FogCellState = config.initialFogged ? 'fogged' : 'clear';
  for (let row = 0; row < state.rows; row++) {
    for (let col = 0; col < state.cols; col++) {
      state.cells[row][col] = initial;
      state.popProgress[row][col] = 0;
    }
  }
  if (config.initialFogged) {
    clearAroundSpawn(map, state.cells, state.popProgress, config.spawnRevealRadius);
    clearAroundChest(map, state.cells, state.popProgress, config.chestRevealRadius);
  }
};

export const revealAtFoot = (
  map: TileMapData,
  state: FogGridState,
  worldX: number,
  worldY: number,
  halfH: number,
  radius: number
): void => {
  if (radius < 0) return;
  const footY = worldY + halfH * 2 * FARMER_TOPDOWN_CONFIG.FOOT_OFFSET_FROM_CENTER;
  const { col, row } = worldToGrid(map, worldX, footY);

  for (let dRow = -radius; dRow <= radius; dRow++) {
    for (let dCol = -radius; dCol <= radius; dCol++) {
      const c = col + dCol;
      const r = row + dRow;
      if (c < 0 || c >= state.cols || r < 0 || r >= state.rows) continue;
      if (state.cells[r][c] !== 'fogged') continue;
      state.cells[r][c] = 'popping';
      state.popProgress[r][c] = 0;
    }
  }
};

export const updateFogAnimations = (state: FogGridState, deltaMs: number, pop: FogPopConfig): void => {
  if (deltaMs <= 0 || pop.durationMs <= 0) return;

  const step = deltaMs / pop.durationMs;

  for (let row = 0; row < state.rows; row++) {
    for (let col = 0; col < state.cols; col++) {
      if (state.cells[row][col] !== 'popping') continue;
      state.popProgress[row][col] += step;
      if (state.popProgress[row][col] >= 1) {
        state.cells[row][col] = 'clear';
        state.popProgress[row][col] = 0;
      }
    }
  }
};

const drawFogCell = (
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  tileSize: number,
  popScale: number,
  tileDrawScale: number
): void => {
  const size = tileSize * popScale * tileDrawScale;
  const offset = (tileSize - size) / 2;

  if (isFogTileReady() && fogTileImage) {
    ctx.drawImage(fogTileImage, screenX + offset, screenY + offset, size, size);
    return;
  }

  ctx.fillStyle = EXPLORATION_FOG_CONFIG.FALLBACK_COLOR_OPAQUE;
  ctx.fillRect(screenX + offset, screenY + offset, size, size);
};

export const drawFogLayer = (
  ctx: CanvasRenderingContext2D,
  state: FogGridState,
  config: FogLayerConfig,
  pop: FogPopConfig,
  cameraX: number,
  cameraY: number,
  viewportWidth: number,
  viewportHeight: number
): void => {
  const { tileSize, cols, rows, cells, popProgress } = state;
  const pad = EXPLORATION_FOG_CONFIG.DRAW_CULL_PADDING_CELLS;
  const startCol = Math.max(0, Math.floor(cameraX / tileSize) - pad);
  const endCol = Math.min(cols - 1, Math.ceil((cameraX + viewportWidth) / tileSize) + pad);
  const startRow = Math.max(0, Math.floor(cameraY / tileSize) - pad);
  const endRow = Math.min(rows - 1, Math.ceil((cameraY + viewportHeight) / tileSize) + pad);

  ctx.save();

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cell = cells[row][col];
      if (cell === 'clear') continue;

      const screenX = col * tileSize - cameraX;
      const screenY = row * tileSize - cameraY;

      if (cell === 'fogged') {
        drawFogCell(ctx, screenX, screenY, tileSize, 1, config.tileDrawScale);
      } else if (cell === 'popping') {
        const scale = getFogPopScale(popProgress[row][col], pop.peakScale);
        if (scale > 0.01) {
          drawFogCell(ctx, screenX, screenY, tileSize, scale, config.tileDrawScale);
        }
      }
    }
  }

  ctx.restore();
};
