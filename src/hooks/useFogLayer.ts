import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createFogGridState,
  drawFogLayer,
  getDefaultFogLayerConfig,
  loadFogLayerConfig,
  preloadFogTileImage,
  resetFogGridState,
  revealAtFoot,
  updateFogAnimations
} from '../services/explorationFog';
import type { FogGridState, FogLayerConfig } from '../types/fogLayer';
import type { TileMapData } from '../types/tileMap';
import { EXPLORATION_FOG_CONFIG } from '../utils/constants';

export interface UseFogLayerResult {
  isFogReady: boolean;
  /** `true` se a névoa está desligada ou a célula está totalmente revelada (`clear`). */
  isFogClearAt: (col: number, row: number) => boolean;
  drawFog: (
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ) => void;
  updateFog: (worldX: number, worldY: number, halfH: number) => void;
  updateFogAnimations: (deltaMs: number) => void;
  resetFog: () => void;
}

const fogConfigEquals = (a: FogLayerConfig, b: FogLayerConfig): boolean =>
  a.color === b.color &&
  a.tileDrawScale === b.tileDrawScale &&
  a.spawnRevealRadius === b.spawnRevealRadius &&
  a.chestRevealRadius === b.chestRevealRadius &&
  a.walkRevealRadius === b.walkRevealRadius &&
  a.initialFogged === b.initialFogged;

export function useFogLayer(
  enabled: boolean,
  fogConfigUrl: string,
  map: TileMapData | null
): UseFogLayerResult {
  const configRef = useRef<FogLayerConfig>(getDefaultFogLayerConfig());
  const gridRef = useRef<FogGridState | null>(null);
  const mapRef = useRef<TileMapData | null>(null);
  const [isFogReady, setIsFogReady] = useState(false);

  const popConfig = {
    durationMs: EXPLORATION_FOG_CONFIG.POP_DURATION_MS,
    peakScale: EXPLORATION_FOG_CONFIG.POP_PEAK_SCALE
  };

  const bindGridToMap = useCallback((currentMap: TileMapData, config: FogLayerConfig): void => {
    gridRef.current = createFogGridState(currentMap, config);
    setIsFogReady(true);
  }, []);

  useEffect(() => {
    if (!enabled) {
      configRef.current = getDefaultFogLayerConfig();
      gridRef.current = null;
      setIsFogReady(false);
      return;
    }

    preloadFogTileImage(EXPLORATION_FOG_CONFIG.TILE_IMAGE);
    configRef.current = getDefaultFogLayerConfig();

    if (mapRef.current) {
      bindGridToMap(mapRef.current, configRef.current);
    }

    let cancelled = false;

    void loadFogLayerConfig(fogConfigUrl).then((config) => {
      if (cancelled) return;
      const configChanged = !fogConfigEquals(configRef.current, config);
      configRef.current = config;
      if (mapRef.current && configChanged) {
        bindGridToMap(mapRef.current, config);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, fogConfigUrl, bindGridToMap]);

  useEffect(() => {
    mapRef.current = map;

    if (!enabled) {
      return;
    }

    if (!map) {
      gridRef.current = null;
      setIsFogReady(false);
      return;
    }

    bindGridToMap(map, configRef.current);
  }, [enabled, map, bindGridToMap]);

  const resetFog = useCallback((): void => {
    const grid = gridRef.current;
    const config = configRef.current;
    const currentMap = mapRef.current;
    if (!grid || !currentMap) return;
    resetFogGridState(grid, currentMap, config);
  }, []);

  const updateFog = useCallback((worldX: number, worldY: number, halfH: number): void => {
    const grid = gridRef.current;
    const config = configRef.current;
    const currentMap = mapRef.current;
    if (!grid || !currentMap) return;
    revealAtFoot(currentMap, grid, worldX, worldY, halfH, config.walkRevealRadius);
  }, []);

  const updateFogAnimationsCb = useCallback((deltaMs: number): void => {
    const grid = gridRef.current;
    if (!grid) return;
    updateFogAnimations(grid, deltaMs, popConfig);
  }, []);

  const isFogClearAt = useCallback((col: number, row: number): boolean => {
    if (!enabled) return true;
    const grid = gridRef.current;
    if (!grid) return false;
    if (col < 0 || col >= grid.cols || row < 0 || row >= grid.rows) return false;
    return grid.cells[row][col] === 'clear';
  }, [enabled]);

  const drawFog = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cameraX: number,
      cameraY: number,
      viewportWidth: number,
      viewportHeight: number
    ): void => {
      const grid = gridRef.current;
      const config = configRef.current;
      if (!grid) return;
      drawFogLayer(ctx, grid, config, popConfig, cameraX, cameraY, viewportWidth, viewportHeight);
    },
    []
  );

  return {
    isFogReady,
    isFogClearAt,
    drawFog,
    updateFog,
    updateFogAnimations: updateFogAnimationsCb,
    resetFog
  };
};
