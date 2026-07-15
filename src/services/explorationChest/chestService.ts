import type { GridPosition, TileMapData } from '../../types/tileMap';
import { EXPLORATION_CHEST_CONFIG, FARMER_TOPDOWN_CONFIG } from '../../utils/constants';
import { worldToGrid } from '../tileMap/tileMapService';

export const getChestGridPosition = (map: TileMapData): GridPosition | null => {
  if (map.chestCol === undefined || map.chestRow === undefined) return null;
  return { col: map.chestCol, row: map.chestRow };
};

export const getChestWorldCenter = (map: TileMapData): { x: number; y: number } | null => {
  const pos = getChestGridPosition(map);
  if (!pos) return null;
  return {
    x: pos.col * map.tileSize + map.tileSize / 2,
    y: pos.row * map.tileSize + map.tileSize / 2
  };
};

export const isPlayerAtChest = (
  map: TileMapData,
  worldX: number,
  worldY: number,
  halfH: number
): boolean => {
  const chest = getChestGridPosition(map);
  if (!chest) return false;

  const footY = worldY + halfH * 2 * FARMER_TOPDOWN_CONFIG.FOOT_OFFSET_FROM_CENTER;
  const { col, row } = worldToGrid(map, worldX, footY);
  return col === chest.col && row === chest.row;
};

export const drawChest = (
  ctx: CanvasRenderingContext2D,
  map: TileMapData,
  cameraX: number,
  cameraY: number,
  chestImage: HTMLImageElement | null
): void => {
  const center = getChestWorldCenter(map);
  if (!center) return;

  const size = map.tileSize * EXPLORATION_CHEST_CONFIG.SIZE_FACTOR;
  const screenX = center.x - cameraX - size / 2;
  const screenY = center.y - cameraY - size / 2;

  ctx.save();

  if (chestImage?.complete && chestImage.naturalWidth > 0) {
    ctx.drawImage(chestImage, screenX, screenY, size, size);
  } else {
    ctx.fillStyle = EXPLORATION_CHEST_CONFIG.COLOR;
    ctx.fillRect(screenX, screenY, size, size);
    ctx.strokeStyle = EXPLORATION_CHEST_CONFIG.BORDER_COLOR;
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX, screenY, size, size);
  }

  ctx.restore();
};
