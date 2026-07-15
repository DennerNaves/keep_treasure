import { useEffect, useRef } from 'react';
import { EXPLORATION_INTRO_CONFIG } from '../../../utils/constants';
import { advanceSpritesheetFrame, drawVerticalSpritesheetFrame } from '../../../utils/spritesheetCanvas';
import { BeeCanvas } from './styles';

export type TutorialBeeAnimationMode = 'wings' | 'mouth';

export interface TutorialBeeProps {
  /** Centro do sprite em px. */
  position: { x: number; y: number };
  /** `true` = espelhar horizontalmente (arte default é left-facing). */
  facingRight: boolean;
  /** Altura do viewport — usada para escalar o sprite via `SCREEN_HEIGHT_FRACTION`. */
  viewportHeight: number;
  /** `wings` = entrada/saída; `mouth` = fase de fala. */
  animationMode?: TutorialBeeAnimationMode;
}

/**
 * Abelha da intro em canvas absoluto. Asas (`bee_companion`) ou boca (`bee_talking`) conforme a fase.
 */
export default function TutorialBee({
  position,
  facingRight,
  viewportHeight,
  animationMode = 'wings'
}: TutorialBeeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isReadyRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const frameIndexRef = useRef(0);
  const lastFrameAtRef = useRef(0);
  const modeRef = useRef(animationMode);

  const bee = EXPLORATION_INTRO_CONFIG.BEE;
  const isMouth = animationMode === 'mouth';
  const sheet = isMouth ? bee.SPEAKING : bee;
  const sizePx = viewportHeight * bee.SCREEN_HEIGHT_FRACTION;
  const facesLeft = sheet.FACES_LEFT_BY_DEFAULT;

  useEffect(() => {
    if (modeRef.current !== animationMode) {
      modeRef.current = animationMode;
      frameIndexRef.current = 0;
      lastFrameAtRef.current = 0;
      isReadyRef.current = false;
    }

    const img = new Image();
    img.src = sheet.IMAGE;
    img.onload = () => {
      isReadyRef.current = true;
    };
    img.onerror = () => {
      console.warn(`[TutorialBee] falha ao carregar: ${sheet.IMAGE}`);
    };
    imgRef.current = img;
  }, [animationMode, sheet.IMAGE]);

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

          const fps = isMouth ? bee.SPEAKING.FPS : bee.WING_FPS;
          const frameCount = Math.max(1, sheet.FRAMES);
          const advanced = advanceSpritesheetFrame(frameIndexRef.current, frameCount, lastFrameAtRef.current, fps, {
            loop: true
          });
          frameIndexRef.current = advanced.frameIndex;
          lastFrameAtRef.current = advanced.lastFrameAt;

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
  }, [sizePx, isMouth, sheet.FRAMES, bee.SPEAKING.FPS, bee.WING_FPS]);

  const shouldFlip = facesLeft ? facingRight : !facingRight;

  return <BeeCanvas ref={canvasRef} $x={position.x} $y={position.y} $size={sizePx} $flip={shouldFlip} />;
};
