import { useCallback, useEffect, useRef } from 'react';
import { drawChest, isPlayerAtChest } from '../services/explorationChest';
import type { TileMapData } from '../types/tileMap';
import { EXPLORATION_CHEST_CONFIG } from '../utils/constants';

export interface UseExplorationChestResult {
  hasChest: boolean;
  drawChest: (ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) => void;
  tryCollectChest: (worldX: number, worldY: number, halfH: number) => boolean;
  resetChest: () => void;
}

export function useExplorationChest(map: TileMapData | null): UseExplorationChestResult {
  const chestImageRef = useRef<HTMLImageElement | null>(null);
  const collectedRef = useRef(false);

  const hasChest = map?.chestCol !== undefined && map?.chestRow !== undefined;

  useEffect(() => {
    collectedRef.current = false;
    const src = EXPLORATION_CHEST_CONFIG.IMAGE;
    if (!src) {
      chestImageRef.current = null;
      return;
    }
    const img = new Image();
    img.src = src;
    img.onload = () => {
      chestImageRef.current = img;
    };
    img.onerror = () => {
      console.warn('[useExplorationChest] falha ao carregar imagem do baú');
      chestImageRef.current = null;
    };
  }, [map?.id]);

  const resetChest = useCallback((): void => {
    collectedRef.current = false;
  }, []);

  const drawChestLayer = useCallback(
    (ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void => {
      if (!map || !hasChest) return;
      drawChest(ctx, map, cameraX, cameraY, chestImageRef.current);
    },
    [map, hasChest]
  );

  const tryCollectChest = useCallback(
    (worldX: number, worldY: number, halfH: number): boolean => {
      if (!map || !hasChest || collectedRef.current) return false;
      if (!isPlayerAtChest(map, worldX, worldY, halfH)) return false;
      collectedRef.current = true;
      return true;
    },
    [map, hasChest]
  );

  return {
    hasChest,
    drawChest: drawChestLayer,
    tryCollectChest,
    resetChest
  };
}
