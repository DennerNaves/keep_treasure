/** Desenha um quadro de spritesheet vertical (quadros empilhados) num canvas quadrado. */
export const drawVerticalSpritesheetFrame = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  frameIndex: number,
  frameCount: number,
  destWidth: number,
  destHeight?: number
): void => {
  const count = Math.max(1, frameCount);
  const frameH = Math.max(1, Math.floor(img.naturalHeight / count));
  const frameW = img.naturalWidth;
  const index = Math.max(0, Math.min(count - 1, frameIndex));
  const sy = index * frameH;
  const h = destHeight ?? destWidth;
  ctx.drawImage(img, 0, sy, frameW, frameH, 0, 0, destWidth, h);
};

export const advanceSpritesheetFrame = (
  frameIndex: number,
  frameCount: number,
  lastFrameAt: number,
  fps: number,
  options?: { loop?: boolean; holdLast?: boolean }
): { frameIndex: number; lastFrameAt: number } => {
  const count = Math.max(1, frameCount);
  const loop = options?.loop ?? true;
  const holdLast = options?.holdLast ?? false;
  const now = performance.now();
  const interval = 1000 / Math.max(1, fps);

  if (holdLast && !loop && frameIndex >= count - 1) {
    return { frameIndex: count - 1, lastFrameAt: now };
  }

  if (now - lastFrameAt < interval) {
    return { frameIndex, lastFrameAt };
  }

  let next = frameIndex + 1;
  if (next >= count) {
    next = loop ? 0 : count - 1;
  }

  return { frameIndex: next, lastFrameAt: now };
};
