import type { RefObject } from 'react';

export interface BackgroundLayer {
  id: string;
  image: HTMLImageElement | null;
  speedModifier: number;
  x: number;
  scaledWidth: number;
  scaledHeight: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export type CanvasContext = CanvasRenderingContext2D;

export type GameEvent = 'gameStart' | 'gameEnd' | 'gamePause' | 'gameResume' | 'scoreUpdate' | 'companionAppear' | 'levelComplete';

export interface GameEventData {
  type: GameEvent;
  timestamp: number;
  data?: unknown;
}

export type ClickHandler = (x: number, y: number) => void;
export type MouseMoveHandler = (x: number, y: number) => void;

export interface CanvasSize {
  width: number;
  height: number;
  scale: number;
}

export interface UseCanvasResult {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  getContext: () => CanvasRenderingContext2D | null;
  getSize: () => CanvasSize;
  resize: () => void;
}

export interface UseBackgroundLayersResult {
  updateBackground: (gameSpeed: number, deltaTimeMs: number) => void;
  drawBackground: (ctx: CanvasRenderingContext2D) => void;
  resizeBackground: (canvasWidth: number, canvasHeight: number, ratio: number) => void;
}

export interface UseIndicatorResult {
  drawIndicator: (ctx: CanvasRenderingContext2D, width: number, height: number, activeCompanionHudCount: number) => void;
}
