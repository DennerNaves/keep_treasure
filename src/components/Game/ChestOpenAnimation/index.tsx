import { useEffect, useRef } from 'react';
import { EXPLORATION_WIN_CONFIG } from '../../../utils/constants';
import { advanceSpritesheetFrame, drawVerticalSpritesheetFrame } from '../../../utils/spritesheetCanvas';
import { ChestCanvas, ChestStage } from './styles';

export interface ChestOpenAnimationProps {
  viewportHeight: number;
  /** Chamado quando a animação termina (ou segura no último frame). */
  onFinished?: () => void;
}

/**
 * Spritesheet vertical do baú a abrir — vitória da exploração.
 */
export default function ChestOpenAnimation({ viewportHeight, onFinished }: ChestOpenAnimationProps) {
  const { CHEST_OPEN } = EXPLORATION_WIN_CONFIG;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isReadyRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const frameIndexRef = useRef(0);
  const lastFrameAtRef = useRef(0);
  const finishedRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const sizePx = viewportHeight * CHEST_OPEN.SCREEN_HEIGHT_FRACTION;

  useEffect(() => {
    finishedRef.current = false;
    frameIndexRef.current = 0;
    lastFrameAtRef.current = 0;
    isReadyRef.current = false;

    const img = new Image();
    img.src = CHEST_OPEN.IMAGE;
    img.onload = () => {
      isReadyRef.current = true;
    };
    img.onerror = () => {
      console.warn(`[ChestOpenAnimation] falha ao carregar: ${CHEST_OPEN.IMAGE}`);
      if (!finishedRef.current) {
        finishedRef.current = true;
        onFinishedRef.current?.();
      }
    };
    imgRef.current = img;
  }, [CHEST_OPEN.IMAGE]);

  useEffect(() => {
    let cancelled = false;
    const draw = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (canvas && img && isReadyRef.current) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          const targetPxSize = Math.max(1, Math.round(sizePx * dpr));
          if (canvas.width !== targetPxSize || canvas.height !== targetPxSize) {
            canvas.width = targetPxSize;
            canvas.height = targetPxSize;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const frameCount = Math.max(1, CHEST_OPEN.FRAMES);
          const prev = frameIndexRef.current;
          const advanced = advanceSpritesheetFrame(
            frameIndexRef.current,
            frameCount,
            lastFrameAtRef.current,
            CHEST_OPEN.FPS,
            { loop: false, holdLast: CHEST_OPEN.HOLD_LAST_FRAME }
          );
          frameIndexRef.current = advanced.frameIndex;
          lastFrameAtRef.current = advanced.lastFrameAt;

          if (!finishedRef.current && prev < frameCount - 1 && frameIndexRef.current >= frameCount - 1) {
            finishedRef.current = true;
            onFinishedRef.current?.();
          }

          drawVerticalSpritesheetFrame(ctx, img, frameIndexRef.current, frameCount, canvas.width);
        }
      }
      rafRef.current = window.requestAnimationFrame(draw);
    };
    rafRef.current = window.requestAnimationFrame(draw);
    return () => {
      cancelled = true;
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [sizePx, CHEST_OPEN.FRAMES, CHEST_OPEN.FPS, CHEST_OPEN.HOLD_LAST_FRAME]);

  return (
    <ChestStage>
      <ChestCanvas ref={canvasRef} $size={sizePx} aria-hidden />
    </ChestStage>
  );
};
