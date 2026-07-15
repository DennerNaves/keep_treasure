import { useCallback, useEffect, useRef, useState } from 'react';
import { generateProceduralMap } from '../services/explorationMap';
import {
  buildTileMapData,
  createFootstepState,
  createTileImageRegistry,
  drawTileMap as drawTileMapService,
  loadTileMap,
  preloadTileImagesFromMap,
  resetFootstepState,
  resolveMovement,
  tickFootsteps
} from '../services/tileMap';
import type { ExplorationMapApi } from '../types/exploration';
import type { Direction, ProceduralMapGenerationConfig } from '../types/mapGeneration';
import type { TileMapData, TileMapJson } from '../types/tileMap';
import { EXPLORATION_MAP_GENERATION_CONFIG, type MenuDifficultyId } from '../utils/constants';

export interface UseWorldMapResult {
  isReady: boolean;
  loadError: string | null;
  drawTileMap: (
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ) => void;
  getMapApi: () => ExplorationMapApi | null;
  getMap: () => TileMapData | null;
  /**
   * Sequência de direções do corredor principal (spawn → baú). Vazio quando o mapa
   * veio de JSON estático (gerador desligado). Consumida pela intro do tutorial.
   */
  getPathDirections: () => Direction[];
}

/** Mapeia `MenuDifficultyId` para a chave do bloco em `EXPLORATION_MAP_GENERATION_CONFIG`. */
const DIFFICULTY_CFG_KEY = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD'
} as const;

/**
 * Converte o bloco SCREAMING_CASE de `constants.ts` no shape camelCase que o serviço espera.
 * Mantém constants.ts coerente com o restante do projeto (SCREAMING_CASE) e o serviço puro
 * com nomes idiomáticos.
 */
const toGeneratorConfig = (difficulty: MenuDifficultyId): ProceduralMapGenerationConfig => {
  const key = DIFFICULTY_CFG_KEY[difficulty];
  const raw = EXPLORATION_MAP_GENERATION_CONFIG[key];
  return {
    cols: raw.COLS,
    rows: raw.ROWS,
    tileSize: raw.TILE_SIZE,
    borderTile: raw.BORDER_TILE,
    pathTile: raw.PATH_TILE,
    fillTile: raw.FILL_TILE,
    minStraightSteps: raw.MIN_STRAIGHT_STEPS,
    maxStraightSegment: raw.MAX_STRAIGHT_SEGMENT,
    recentVisitWindow: raw.RECENT_VISIT_WINDOW,
    chestMinDistanceFromSpawn: raw.CHEST_MIN_DISTANCE_FROM_SPAWN,
    forceDirectAfterIterations: raw.FORCE_DIRECT_AFTER_ITERATIONS,
    directRadius: raw.DIRECT_RADIUS,
    chestMaxRow: raw.CHEST_MAX_ROW,
    spawnClearRadius: raw.SPAWN_CLEAR_RADIUS,
    maxInstructions: raw.MAX_INSTRUCTIONS,
    fakeBranchCount: raw.FAKE_BRANCH_COUNT,
    fakeBranchMinLength: raw.FAKE_BRANCH_MIN_LENGTH,
    fakeBranchMaxLength: raw.FAKE_BRANCH_MAX_LENGTH,
    fakeBranchMinDistance: raw.FAKE_BRANCH_MIN_DISTANCE,
    pathRatioRange: { min: raw.PATH_RATIO_RANGE.min, max: raw.PATH_RATIO_RANGE.max },
    maxRegenAttempts: raw.MAX_REGEN_ATTEMPTS
  };
};

interface BuiltProceduralMap {
  map: TileMapData;
  pathDirections: Direction[];
}

const buildProceduralMapFromBase = (
  baseJson: TileMapJson,
  difficulty: MenuDifficultyId
): BuiltProceduralMap => {
  const generated = generateProceduralMap(toGeneratorConfig(difficulty), baseJson.tiles);
  return {
    map: buildTileMapData(generated.json),
    pathDirections: generated.pathDirections
  };
};

const fetchTileMapJson = async (url: string): Promise<TileMapJson> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`[useWorldMap] falha ao carregar ${url}: ${response.status}`);
  }
  return (await response.json()) as TileMapJson;
};

const isGeneratorEnabledFor = (difficulty: MenuDifficultyId | undefined): difficulty is MenuDifficultyId =>
  !!difficulty && EXPLORATION_MAP_GENERATION_CONFIG.USE_GENERATOR[difficulty];

export function useWorldMap(mapUrl: string, difficulty?: MenuDifficultyId): UseWorldMapResult {
  const mapRef = useRef<TileMapData | null>(null);
  const pathDirectionsRef = useRef<Direction[]>([]);
  const footstepRef = useRef(createFootstepState());
  const imageRegistryRef = useRef(createTileImageRegistry());
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsReady(false);
    setLoadError(null);
    mapRef.current = null;
    pathDirectionsRef.current = [];

    const load = async (): Promise<{ map: TileMapData; pathDirections: Direction[] }> => {
      if (isGeneratorEnabledFor(difficulty)) {
        const baseJson = await fetchTileMapJson(mapUrl);
        return buildProceduralMapFromBase(baseJson, difficulty);
      }
      const map = await loadTileMap(mapUrl);
      return { map, pathDirections: [] };
    };

    void load()
      .then(({ map, pathDirections }) => {
        if (cancelled) return;
        mapRef.current = map;
        pathDirectionsRef.current = pathDirections;
        imageRegistryRef.current.clear();
        preloadTileImagesFromMap(map, imageRegistryRef.current);
        resetFootstepState(footstepRef.current);
        setIsReady(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
        console.error('[useWorldMap]', message);
      });

    return () => {
      cancelled = true;
    };
  }, [mapUrl, difficulty]);

  const drawTileMap = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cameraX: number,
      cameraY: number,
      viewportWidth: number,
      viewportHeight: number
    ): void => {
      const map = mapRef.current;
      if (!map) return;
      drawTileMapService(ctx, map, cameraX, cameraY, viewportWidth, viewportHeight, imageRegistryRef.current);
    },
    []
  );

  const getMap = useCallback((): TileMapData | null => mapRef.current, []);

  const getPathDirections = useCallback((): Direction[] => pathDirectionsRef.current, []);

  const getMapApi = useCallback((): ExplorationMapApi | null => {
    const map = mapRef.current;
    if (!map) return null;

    return {
      getWorldSize: () => ({ width: map.worldWidth, height: map.worldHeight }),
      getSpawn: () => ({
        x: map.spawnCol * map.tileSize + map.tileSize / 2,
        y: map.spawnRow * map.tileSize + map.tileSize / 2
      }),
      resolveMovement: (fromX, fromY, toX, toY, halfW, halfH) =>
        resolveMovement(map, fromX, fromY, toX, toY, halfW, halfH),
      tickFootsteps: (worldX, worldY, halfH, isMoving) =>
        tickFootsteps(map, footstepRef.current, worldX, worldY, halfH, isMoving)
    };
  }, []);

  return { isReady, loadError, drawTileMap, getMapApi, getMap, getPathDirections };
}
