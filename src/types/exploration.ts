export type FacingDirection = 'down' | 'up' | 'left' | 'right';

export type FarmerAnimKind = 'idle' | 'walk';

export interface InputVector {
  x: number;
  y: number;
}

export interface CameraOffset {
  x: number;
  y: number;
}

export interface ExplorationPlayerState {
  worldX: number;
  worldY: number;
  facing: FacingDirection;
  anim: FarmerAnimKind;
  frameIndex: number;
  frameTimer: number;
  frameWidth: number;
  frameHeight: number;
  displayWidth: number;
  displayHeight: number;
  isMoving: boolean;
}

/** API injetada pelo mapa (useWorldMap → useExplorationPlayer). */
export interface ExplorationMapApi {
  getWorldSize: () => { width: number; height: number };
  getSpawn: () => { x: number; y: number };
  resolveMovement: (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    halfW: number,
    halfH: number
  ) => { x: number; y: number };
  tickFootsteps: (worldX: number, worldY: number, halfH: number, isMoving: boolean) => void;
}
