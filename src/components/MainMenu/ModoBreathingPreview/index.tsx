import { useEffect, useRef } from 'react';
import type { MenuBreathingPatternId } from '../../../utils/constants';
import { MENU_BREATHING_PREVIEW, MENU_SCREEN_CONFIG, STATIC_BREATHING_CONFIG } from '../../../utils/constants';
import { drawVerticalSpritesheetFrame } from '../../../utils/spritesheetCanvas';
import { PreviewCanvas, PreviewFigure } from './styles';

export interface ModoBreathingPreviewProps {
  pattern: MenuBreathingPatternId;
}

const { BREATHING_PREVIEW } = MENU_SCREEN_CONFIG;
const frameCount = () => Math.max(1, BREATHING_PREVIEW.FRAMES);

const frameIndexForIntervals = (elapsedS: number): number => {
  const {
    INTERVAL_INHALE_S,
    INTERVAL_HOLD_TOP_S,
    INTERVAL_EXHALE_S,
    INTERVAL_HOLD_BOTTOM_S
  } = MENU_BREATHING_PREVIEW;
  const totalS = INTERVAL_INHALE_S + INTERVAL_HOLD_TOP_S + INTERVAL_EXHALE_S + INTERVAL_HOLD_BOTTOM_S;
  const t = elapsedS % totalS;
  const count = frameCount();
  const maxIdx = count - 1;

  let phaseT = 0;
  if (t < INTERVAL_INHALE_S) {
    phaseT = (t / INTERVAL_INHALE_S) * 0.35;
  } else if (t < INTERVAL_INHALE_S + INTERVAL_HOLD_TOP_S) {
    phaseT = 0.35;
  } else if (t < INTERVAL_INHALE_S + INTERVAL_HOLD_TOP_S + INTERVAL_EXHALE_S) {
    const te = t - INTERVAL_INHALE_S - INTERVAL_HOLD_TOP_S;
    phaseT = 0.35 + (te / INTERVAL_EXHALE_S) * 0.55;
  } else {
    phaseT = 0.9;
  }

  return Math.min(maxIdx, Math.floor(phaseT * maxIdx));
};

const frameIndexForContinuous = (elapsedS: number): number => {
  const cycleS = MENU_BREATHING_PREVIEW.CONTINUOUS_CYCLE_S;
  const count = frameCount();
  const progress = (elapsedS % cycleS) / cycleS;
  return Math.min(count - 1, Math.floor(progress * count));
};

/**
 * Pré-visualização na aba Modo — anima o spritesheet de respiração (sem bounce CSS).
 */
export default function ModoBreathingPreview({ pattern }: ModoBreathingPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isReadyRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const patternRef = useRef(pattern);
  const startAtRef = useRef(performance.now());

  const displayW = BREATHING_PREVIEW.WIDTH_PX;
  const displayH = BREATHING_PREVIEW.HEIGHT_PX;

  useEffect(() => {
    if (patternRef.current !== pattern) {
      patternRef.current = pattern;
      startAtRef.current = performance.now();
    }
  }, [pattern]);

  useEffect(() => {
    const img = new Image();
    img.src = BREATHING_PREVIEW.SPRITESHEET;
    img.onload = () => {
      isReadyRef.current = true;
    };
    img.onerror = () => {
      console.warn(`[ModoBreathingPreview] falha ao carregar: ${BREATHING_PREVIEW.SPRITESHEET}`);
    };
    imgRef.current = img;
  }, []);

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
          const w = Math.max(1, Math.round(displayW * dpr));
          const h = Math.max(1, Math.round(displayH * dpr));
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const elapsedS = (performance.now() - startAtRef.current) / 1000;
          const idx =
            patternRef.current === 'intervals'
              ? frameIndexForIntervals(elapsedS)
              : frameIndexForContinuous(elapsedS);

          drawVerticalSpritesheetFrame(ctx, img, idx, frameCount(), canvas.width, canvas.height);
        }
      }
      rafRef.current = window.requestAnimationFrame(draw);
    };
    rafRef.current = window.requestAnimationFrame(draw);
    return () => {
      cancelled = true;
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [displayW, displayH]);

  return (
    <PreviewFigure>
      <PreviewCanvas
        ref={canvasRef}
        $width={displayW}
        $height={displayH}
        role="img"
        aria-label={`Pré-visualização da respiração ${STATIC_BREATHING_CONFIG.BREATHING_FRAMES} frames`}
      />
    </PreviewFigure>
  );
};
