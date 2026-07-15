import type { FootstepState, ResolvedTile, TileMapData, TileMapJson } from '../../types/tileMap';
import { FARMER_TOPDOWN_CONFIG } from '../../utils/constants';
import { playOneShotSfx } from '../audio/audioService';

const DEFAULT_FOOT_INTERVAL_MS = 300;

export const createFootstepState = (): FootstepState => ({
  lastCol: -1,
  lastRow: -1,
  lastPlayAt: 0
});

export const resetFootstepState = (state: FootstepState): void => {
  state.lastCol = -1;
  state.lastRow = -1;
  state.lastPlayAt = 0;
};

export const buildTileMapData = (json: TileMapJson): TileMapData => {
  const rows = json.layout.length;
  if (rows === 0) {
    throw new Error('[tileMap] layout vazio');
  }

  const cols = json.layout[0].length;
  if (cols === 0 || json.tileSize <= 0) {
    throw new Error('[tileMap] layout ou tileSize inválido');
  }

  for (let r = 0; r < rows; r++) {
    if (json.layout[r].length !== cols) {
      throw new Error(`[tileMap] linha ${r} com largura diferente (${json.layout[r].length} vs ${cols})`);
    }
  }

  const grid: ResolvedTile[][] = [];

  for (let row = 0; row < rows; row++) {
    const line: ResolvedTile[] = [];
    for (let col = 0; col < cols; col++) {
      const key = json.layout[row][col];
      const def = json.tiles[key];
      if (!def) {
        throw new Error(`[tileMap] tile desconhecido "${key}" em (${col}, ${row})`);
      }
      line.push({
        key,
        color: def.color,
        blocksMovement: def.blocksMovement,
        footstep: def.footstep,
        image: def.image
      });
    }
    grid.push(line);
  }

  let spawnCol = json.spawn.col;
  let spawnRow = json.spawn.row;
  if (spawnCol < 0 || spawnCol >= cols || spawnRow < 0 || spawnRow >= rows) {
    spawnCol = Math.floor(cols / 2);
    spawnRow = Math.floor(rows / 2);
    console.warn('[tileMap] spawn fora do mapa; a usar centro da grelha');
  }

  let chestCol = json.chest_position?.col;
  let chestRow = json.chest_position?.row;
  if (chestCol !== undefined && chestRow !== undefined) {
    if (chestCol < 0 || chestCol >= cols || chestRow < 0 || chestRow >= rows) {
      console.warn('[tileMap] chest_position fora do mapa; baú ignorado');
      chestCol = undefined;
      chestRow = undefined;
    }
  }

  return {
    id: json.id,
    tileSize: json.tileSize,
    cols,
    rows,
    worldWidth: cols * json.tileSize,
    worldHeight: rows * json.tileSize,
    spawnCol,
    spawnRow,
    chestCol,
    chestRow,
    grid
  };
};

export type TileImageRegistry = Map<string, HTMLImageElement>;

export const createTileImageRegistry = (): TileImageRegistry => new Map();

export const preloadTileImages = (json: TileMapJson, registry: TileImageRegistry): void => {
  const urls = new Set<string>();
  Object.values(json.tiles).forEach((def) => {
    if (def.image) urls.add(def.image);
  });
  preloadTileImageUrls(urls, registry);
};

export const preloadTileImagesFromMap = (map: TileMapData, registry: TileImageRegistry): void => {
  const urls = new Set<string>();
  map.grid.forEach((row) => {
    row.forEach((tile) => {
      if (tile.image) urls.add(tile.image);
    });
  });
  preloadTileImageUrls(urls, registry);
};

const preloadTileImageUrls = (urls: Set<string>, registry: TileImageRegistry): void => {
  urls.forEach((url) => {
    if (registry.has(url)) return;
    const img = new Image();
    img.src = url;
    img.onerror = () => {
      console.warn(`[tileMap] falha ao carregar imagem: ${url}`);
    };
    registry.set(url, img);
  });
};

export const loadTileMap = async (url: string): Promise<TileMapData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`[tileMap] falha ao carregar ${url}: ${response.status}`);
  }
  const json = (await response.json()) as TileMapJson;
  return buildTileMapData(json);
};

export const getSpawnPosition = (map: TileMapData): { x: number; y: number } => ({
  x: map.spawnCol * map.tileSize + map.tileSize / 2,
  y: map.spawnRow * map.tileSize + map.tileSize / 2
});

export const worldToGrid = (map: TileMapData, worldX: number, worldY: number): { col: number; row: number } => ({
  col: Math.floor(worldX / map.tileSize),
  row: Math.floor(worldY / map.tileSize)
});

const getTileAtGrid = (map: TileMapData, col: number, row: number): ResolvedTile | null => {
  if (col < 0 || col >= map.cols || row < 0 || row >= map.rows) {
    return null;
  }
  return map.grid[row][col];
};

const getFootWorldY = (worldY: number, halfH: number): number =>
  worldY + halfH * 2 * FARMER_TOPDOWN_CONFIG.FOOT_OFFSET_FROM_CENTER;

export const isFootBlocked = (map: TileMapData, worldX: number, worldY: number, halfH: number): boolean => {
  const footY = getFootWorldY(worldY, halfH);
  const { col, row } = worldToGrid(map, worldX, footY);
  const tile = getTileAtGrid(map, col, row);
  return tile?.blocksMovement ?? true;
};

const clampToWorld = (
  x: number,
  y: number,
  halfW: number,
  halfH: number,
  map: TileMapData
): { x: number; y: number } => ({
  x: Math.max(halfW, Math.min(map.worldWidth - halfW, x)),
  y: Math.max(halfH, Math.min(map.worldHeight - halfH, y))
});

export const resolveMovement = (
  map: TileMapData,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  halfW: number,
  halfH: number
): { x: number; y: number } => {
  let x = fromX;
  let y = fromY;

  const tryX = clampToWorld(toX, y, halfW, halfH, map).x;
  if (!isFootBlocked(map, tryX, y, halfH)) {
    x = tryX;
  }

  const tryY = clampToWorld(x, toY, halfW, halfH, map).y;
  if (!isFootBlocked(map, x, tryY, halfH)) {
    y = tryY;
  }

  return clampToWorld(x, y, halfW, halfH, map);
};

export const drawTileMap = (
  ctx: CanvasRenderingContext2D,
  map: TileMapData,
  cameraX: number,
  cameraY: number,
  viewportWidth: number,
  viewportHeight: number,
  imageRegistry?: TileImageRegistry
): void => {
  const startCol = Math.max(0, Math.floor(cameraX / map.tileSize));
  const endCol = Math.min(map.cols - 1, Math.ceil((cameraX + viewportWidth) / map.tileSize));
  const startRow = Math.max(0, Math.floor(cameraY / map.tileSize));
  const endRow = Math.min(map.rows - 1, Math.ceil((cameraY + viewportHeight) / map.tileSize));

  ctx.save();

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const tile = map.grid[row][col];
      const screenX = col * map.tileSize - cameraX;
      const screenY = row * map.tileSize - cameraY;
      ctx.fillStyle = tile.color;
      ctx.fillRect(screenX, screenY, map.tileSize, map.tileSize);

      if (tile.image && imageRegistry) {
        const img = imageRegistry.get(tile.image);
        if (img?.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, screenX, screenY, map.tileSize, map.tileSize);
        }
      }
    }
  }

  ctx.restore();
};

export const tickFootsteps = (
  map: TileMapData,
  state: FootstepState,
  worldX: number,
  worldY: number,
  halfH: number,
  isMoving: boolean
): void => {
  if (!isMoving) return;

  const footY = getFootWorldY(worldY, halfH);
  const { col, row } = worldToGrid(map, worldX, footY);
  if (col === state.lastCol && row === state.lastRow) return;

  state.lastCol = col;
  state.lastRow = row;

  const tile = getTileAtGrid(map, col, row);
  const footstep = tile?.footstep;
  if (!footstep?.src) return;

  const now = Date.now();
  const interval = footstep.minIntervalMs ?? DEFAULT_FOOT_INTERVAL_MS;
  if (now - state.lastPlayAt < interval) return;

  state.lastPlayAt = now;
  playOneShotSfx(footstep.src, footstep.volume ?? 1);
};
