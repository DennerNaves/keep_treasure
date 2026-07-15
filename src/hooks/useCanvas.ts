import { useCallback, useEffect, useRef } from 'react';
import type { CanvasSize, UseCanvasResult } from '../types';

export function useCanvas(): UseCanvasResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sizeRef = useRef<CanvasSize>({ width: 0, height: 0, scale: 1 });

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const scale = window.devicePixelRatio || 1;

    if (canvas.width !== width * scale || canvas.height !== height * scale) {
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    sizeRef.current = { width, height, scale };
  }, []);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const { scale } = sizeRef.current;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    return ctx;
  }, []);

  const getSize = useCallback(() => {
    return { ...sizeRef.current };
  }, []);

  useEffect(() => {
    resize();

    const handleResize = () => {
      resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resize]);

  return { canvasRef, containerRef, getContext, getSize, resize };
}
