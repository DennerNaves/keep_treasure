import { useCallback, useEffect, useRef } from 'react';
import type { UseIndicatorResult } from '../types';
import { INDICATOR_CONFIG } from '../utils/constants';

export function useIndicator(): UseIndicatorResult {
  const imageOffRef = useRef<HTMLImageElement | null>(null);
  const imageOnRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!INDICATOR_CONFIG.ENABLED) return;

    const imgOff = new Image();
    imgOff.src = INDICATOR_CONFIG.IMAGES.OFF;
    imgOff.onerror = () => console.error('Erro ao carregar indicador OFF');
    imageOffRef.current = imgOff;

    const imgOn = new Image();
    imgOn.src = INDICATOR_CONFIG.IMAGES.ON;
    imgOn.onerror = () => console.error('Erro ao carregar indicador ON');
    imageOnRef.current = imgOn;

    return () => {
      imageOffRef.current = null;
      imageOnRef.current = null;
    };
  }, []);

  const drawIndicator = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, activeCompanionHudCount: number): void => {
      if (!INDICATOR_CONFIG.ENABLED) return;

      const image = activeCompanionHudCount > 0 ? imageOnRef.current : imageOffRef.current;
      if (!image || !image.complete) return;

      const size = 60;
      const x = width - size - 30;
      const y = height - size - 30;

      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.drawImage(image, x, y, size, size);
      ctx.restore();
    },
    []
  );

  return { drawIndicator };
}
