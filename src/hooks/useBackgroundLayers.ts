import { useCallback, useEffect, useRef } from 'react';
import type { BackgroundLayer, UseBackgroundLayersResult } from '../types';
import { BACKGROUND_IMAGE_WIDTH, BACKGROUND_LAYERS, GAME_CONFIG } from '../utils/constants';

export function useBackgroundLayers(): UseBackgroundLayersResult {
  const layersRef = useRef<BackgroundLayer[]>([]);
  const imageWidth = BACKGROUND_IMAGE_WIDTH;

  useEffect(() => {
    const loadedLayers = BACKGROUND_LAYERS.map((layer) => {
      const img = new Image();
      img.src = layer.src;
      return {
        id: layer.id,
        image: img,
        speedModifier: layer.speed,
        x: 0,
        scaledWidth: 0,
        scaledHeight: 0
      };
    });

    layersRef.current = loadedLayers;

    return () => {
      loadedLayers.forEach((layer) => {
        if (layer.image) {
          layer.image.onload = null;
          layer.image.onerror = null;
        }
      });
    };
  }, []);

  const resizeBackground = useCallback(
    (_canvasWidth: number, _canvasHeight: number, ratio: number): void => {
      layersRef.current.forEach((layer) => {
        layer.scaledWidth = imageWidth * ratio;
        layer.scaledHeight = GAME_CONFIG.BASE_HEIGHT * ratio;
        layer.x = 0;
      });
    },
    [imageWidth]
  );

  const updateBackground = useCallback((gameSpeed: number, deltaTimeMs: number): void => {
    const sec = deltaTimeMs / 1000;
    layersRef.current.forEach((layer) => {
      layer.x -= gameSpeed * layer.speedModifier * sec * 60;
      if (layer.x <= -layer.scaledWidth) {
        layer.x = 0;
      }
    });
  }, []);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D): void => {
    layersRef.current.forEach((layer) => {
      if (!layer.image || !layer.image.complete) return;

      ctx.drawImage(layer.image, layer.x, 0, layer.scaledWidth, layer.scaledHeight);
      ctx.drawImage(layer.image, layer.x + layer.scaledWidth - 1, 0, layer.scaledWidth, layer.scaledHeight);

      const canvasWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
      if (canvasWidth >= layer.scaledWidth) {
        ctx.drawImage(layer.image, layer.x + layer.scaledWidth * 2 - 2, 0, layer.scaledWidth, layer.scaledHeight);
      }
    });
  }, []);

  return {
    updateBackground,
    drawBackground,
    resizeBackground
  };
}
