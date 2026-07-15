import type { CameraOffset } from '../../types/exploration';

export const getCameraOffset = (
  playerWorldX: number,
  playerWorldY: number,
  viewportWidth: number,
  viewportHeight: number,
  worldWidth: number,
  worldHeight: number
): CameraOffset => {
  let x = playerWorldX - viewportWidth / 2;
  let y = playerWorldY - viewportHeight / 2;

  const maxX = Math.max(0, worldWidth - viewportWidth);
  const maxY = Math.max(0, worldHeight - viewportHeight);

  x = Math.max(0, Math.min(maxX, x));
  y = Math.max(0, Math.min(maxY, y));

  return { x, y };
};
