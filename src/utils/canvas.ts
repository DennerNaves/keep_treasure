import type { CanvasContext } from '../types';

export const clearCanvas = (ctx: CanvasContext, width: number, height: number): void => {
  ctx.clearRect(0, 0, width, height);
};

export const drawRoundRect = (ctx: CanvasContext, x: number, y: number, width: number, height: number, radius: number): void => {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
};

export const isPointInRect = (
  pointX: number,
  pointY: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number
): boolean => {
  return pointX >= rectX && pointX <= rectX + rectWidth && pointY >= rectY && pointY <= rectY + rectHeight;
};

export const isPointInCircle = (pointX: number, pointY: number, circleX: number, circleY: number, radius: number): boolean => {
  const dx = pointX - circleX;
  const dy = pointY - circleY;
  return dx * dx + dy * dy <= radius * radius;
};
