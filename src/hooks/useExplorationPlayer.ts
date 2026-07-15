import { useCallback, useEffect, useRef } from 'react';

import { getCameraOffset } from '../services/exploration';

import type {

  ExplorationMapApi,

  ExplorationPlayerState,

  FacingDirection,

  FarmerAnimKind,

  InputVector

} from '../types/exploration';

import { FARMER_TOPDOWN_ASSETS, FARMER_TOPDOWN_CONFIG } from '../utils/constants';



type SpriteMap<T> = Record<FacingDirection, T>;



interface SpriteSheetMeta {

  image: HTMLImageElement;

  frameWidth: number;

  frameHeight: number;

  frameCount: number;

  displayWidth: number;

  displayHeight: number;

}



const emptyMetaMap = (): SpriteMap<SpriteSheetMeta | null> => ({

  down: null,

  up: null,

  left: null,

  right: null

});



const resolveFacing = (input: InputVector, current: FacingDirection): FacingDirection => {

  if (input.x === 0 && input.y === 0) {

    return current;

  }

  if (Math.abs(input.x) >= Math.abs(input.y)) {

    return input.x > 0 ? 'right' : 'left';

  }

  return input.y > 0 ? 'down' : 'up';

};



const getFrameCountForKind = (kind: FarmerAnimKind): number =>

  kind === 'idle' ? FARMER_TOPDOWN_CONFIG.IDLE_FRAMES : FARMER_TOPDOWN_CONFIG.WALK_FRAMES;



export interface UseExplorationPlayerResult {

  updateExplorationPlayer: (deltaTime: number, input: InputVector, isPaused: boolean) => void;

  drawExplorationPlayer: (ctx: CanvasRenderingContext2D, viewportWidth: number, viewportHeight: number) => void;

  getCameraOffset: (viewportWidth: number, viewportHeight: number) => { x: number; y: number };

  resize: (ratio: number) => void;

  reset: () => void;

  setMapApi: (api: ExplorationMapApi | null) => void;

  getExplorationFootPosition: () => { worldX: number; worldY: number; halfH: number } | null;

}



export function useExplorationPlayer(): UseExplorationPlayerResult {

  const metaRef = useRef<{ idle: SpriteMap<SpriteSheetMeta | null>; walk: SpriteMap<SpriteSheetMeta | null> }>({

    idle: emptyMetaMap(),

    walk: emptyMetaMap()

  });

  const ratioRef = useRef(1);

  const lastAnimRef = useRef<FarmerAnimKind>('idle');

  const mapApiRef = useRef<ExplorationMapApi | null>(null);



  const playerRef = useRef<ExplorationPlayerState>({

    worldX: 0,

    worldY: 0,

    facing: 'down',

    anim: 'idle',

    frameIndex: 0,

    frameTimer: 0,

    frameWidth: 0,

    frameHeight: 0,

    displayWidth: 0,

    displayHeight: 0,

    isMoving: false

  });



  const applySpawnFromMap = useCallback((): void => {

    const api = mapApiRef.current;

    const p = playerRef.current;

    if (api) {

      const spawn = api.getSpawn();

      p.worldX = spawn.x;

      p.worldY = spawn.y;

    }

  }, []);



  const applyDisplaySize = useCallback((meta: SpriteSheetMeta, ratio: number): void => {

    const scale = FARMER_TOPDOWN_CONFIG.DISPLAY_SCALE * ratio;

    meta.displayWidth = meta.frameWidth * scale;

    meta.displayHeight = meta.frameHeight * scale;

  }, []);



  const syncPlayerMetricsFromMeta = useCallback((meta: SpriteSheetMeta | null): void => {

    const p = playerRef.current;

    if (!meta) return;

    p.frameWidth = meta.frameWidth;

    p.frameHeight = meta.frameHeight;

    p.displayWidth = meta.displayWidth;

    p.displayHeight = meta.displayHeight;

  }, []);



  const getActiveMeta = useCallback((): SpriteSheetMeta | null => {

    const p = playerRef.current;

    return metaRef.current[p.anim][p.facing];

  }, []);



  const loadSprites = useCallback(

    (kind: FarmerAnimKind, facing: FacingDirection, src: string) => {

      const img = new Image();

      img.src = src;

      img.onload = () => {

        const frameCount = getFrameCountForKind(kind);

        const frameWidth = img.width;

        const frameHeight = Math.max(1, Math.floor(img.height / frameCount));



        const meta: SpriteSheetMeta = {

          image: img,

          frameWidth,

          frameHeight,

          frameCount,

          displayWidth: 0,

          displayHeight: 0

        };

        applyDisplaySize(meta, ratioRef.current);

        metaRef.current[kind][facing] = meta;



        const p = playerRef.current;

        if (p.anim === kind && p.facing === facing) {

          syncPlayerMetricsFromMeta(meta);

        }

      };

    },

    [applyDisplaySize, syncPlayerMetricsFromMeta]

  );



  useEffect(() => {

    const dirs: FacingDirection[] = ['down', 'up', 'left', 'right'];

    dirs.forEach((facing) => {

      loadSprites('idle', facing, FARMER_TOPDOWN_ASSETS.idle[facing]);

      loadSprites('walk', facing, FARMER_TOPDOWN_ASSETS.walk[facing]);

    });

  }, [loadSprites]);



  const setMapApi = useCallback(

    (api: ExplorationMapApi | null): void => {

      mapApiRef.current = api;

      if (api) {

        applySpawnFromMap();

      }

    },

    [applySpawnFromMap]

  );



  const resize = useCallback(

    (ratio: number): void => {

      ratioRef.current = ratio;

      const kinds: FarmerAnimKind[] = ['idle', 'walk'];

      const dirs: FacingDirection[] = ['down', 'up', 'left', 'right'];

      kinds.forEach((kind) => {

        dirs.forEach((facing) => {

          const meta = metaRef.current[kind][facing];

          if (meta) applyDisplaySize(meta, ratio);

        });

      });

      syncPlayerMetricsFromMeta(getActiveMeta());

    },

    [applyDisplaySize, getActiveMeta, syncPlayerMetricsFromMeta]

  );



  const reset = useCallback((): void => {

    const p = playerRef.current;

    applySpawnFromMap();

    p.facing = 'down';

    p.anim = 'idle';

    p.frameIndex = 0;

    p.frameTimer = 0;

    p.isMoving = false;

    lastAnimRef.current = 'idle';

    syncPlayerMetricsFromMeta(metaRef.current.idle.down);

  }, [applySpawnFromMap, syncPlayerMetricsFromMeta]);



  const updateExplorationPlayer = useCallback(

    (deltaTime: number, input: InputVector, isPaused: boolean): void => {

      if (isPaused) return;



      const p = playerRef.current;

      const moving = input.x !== 0 || input.y !== 0;

      p.isMoving = moving;

      p.facing = resolveFacing(input, p.facing);

      const nextAnim: FarmerAnimKind = moving ? 'walk' : 'idle';



      if (nextAnim !== lastAnimRef.current) {

        lastAnimRef.current = nextAnim;

        p.anim = nextAnim;

        p.frameIndex = 0;

        p.frameTimer = 0;

      }



      syncPlayerMetricsFromMeta(metaRef.current[p.anim][p.facing]);



      const meta = metaRef.current[p.anim][p.facing];

      if (!meta) return;



      const halfW = meta.displayWidth / 2;

      const halfH = meta.displayHeight / 2;

      const mapApi = mapApiRef.current;



      if (moving) {

        const speed = FARMER_TOPDOWN_CONFIG.MOVE_SPEED_PX_PER_S * (deltaTime / 1000);

        const fromX = p.worldX;

        const fromY = p.worldY;

        const toX = fromX + input.x * speed;

        const toY = fromY + input.y * speed;



        if (mapApi) {

          const resolved = mapApi.resolveMovement(fromX, fromY, toX, toY, halfW, halfH);

          p.worldX = resolved.x;

          p.worldY = resolved.y;

          mapApi.tickFootsteps(p.worldX, p.worldY, halfH, true);

        }

      }



      if (meta.frameCount <= 1) {

        p.frameIndex = 0;

        return;

      }



      const fps = p.anim === 'walk' ? FARMER_TOPDOWN_CONFIG.WALK_FPS : FARMER_TOPDOWN_CONFIG.IDLE_FPS;

      const frameDuration = 1000 / fps;

      p.frameTimer += deltaTime;



      while (p.frameTimer >= frameDuration) {

        p.frameTimer -= frameDuration;

        p.frameIndex = (p.frameIndex + 1) % meta.frameCount;

      }

    },

    [syncPlayerMetricsFromMeta]

  );



  const getCameraOffsetForViewport = useCallback((viewportWidth: number, viewportHeight: number) => {

    const p = playerRef.current;

    const world = mapApiRef.current?.getWorldSize() ?? { width: 800, height: 800 };

    return getCameraOffset(p.worldX, p.worldY, viewportWidth, viewportHeight, world.width, world.height);

  }, []);



  const drawExplorationPlayer = useCallback(

    (ctx: CanvasRenderingContext2D, viewportWidth: number, viewportHeight: number): void => {

      const p = playerRef.current;

      const meta = metaRef.current[p.anim][p.facing];

      if (!meta) return;



      const camera = getCameraOffsetForViewport(viewportWidth, viewportHeight);

      const screenX = p.worldX - camera.x - meta.displayWidth / 2;

      const screenY = p.worldY - camera.y - meta.displayHeight / 2;

      const frameIndex = Math.min(p.frameIndex, meta.frameCount - 1);

      const frameY = frameIndex * meta.frameHeight;



      ctx.drawImage(

        meta.image,

        0,

        frameY,

        meta.frameWidth,

        meta.frameHeight,

        screenX,

        screenY,

        meta.displayWidth,

        meta.displayHeight

      );

    },

    [getCameraOffsetForViewport]

  );



  const getExplorationFootPosition = useCallback((): { worldX: number; worldY: number; halfH: number } | null => {
    const p = playerRef.current;
    const meta = metaRef.current[p.anim][p.facing];
    if (!meta || meta.displayHeight <= 0) return null;
    return {
      worldX: p.worldX,
      worldY: p.worldY,
      halfH: meta.displayHeight / 2
    };
  }, []);

  return {

    updateExplorationPlayer,

    drawExplorationPlayer,

    getCameraOffset: getCameraOffsetForViewport,

    resize,

    reset,

    setMapApi,

    getExplorationFootPosition

  };

}


