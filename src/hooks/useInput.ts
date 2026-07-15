import { useCallback, useEffect, useRef } from 'react';
import type { InputVector } from '../types/exploration';

const MOVEMENT_KEYS = new Set([
  'arrowup',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'w',
  'a',
  's',
  'd'
]);

export interface UseInputResult {
  getMovementVector: () => InputVector;
  setInputEnabled: (enabled: boolean) => void;
}

export function useInput(): UseInputResult {
  const keysRef = useRef<Record<string, boolean>>({});
  const enabledRef = useRef(true);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (!enabledRef.current) return;
      const key = e.key.toLowerCase();
      if (!MOVEMENT_KEYS.has(key)) return;
      e.preventDefault();
      keysRef.current[key] = true;
    };

    const onKeyUp = (e: KeyboardEvent): void => {
      const key = e.key.toLowerCase();
      if (!MOVEMENT_KEYS.has(key)) return;
      keysRef.current[key] = false;
    };

    const onBlur = (): void => {
      keysRef.current = {};
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const getMovementVector = useCallback((): InputVector => {
    const keys = keysRef.current;
    let x = 0;
    let y = 0;

    if (keys.w || keys.arrowup) y -= 1;
    if (keys.s || keys.arrowdown) y += 1;
    if (keys.a || keys.arrowleft) x -= 1;
    if (keys.d || keys.arrowright) x += 1;

    if (x === 0 && y === 0) {
      return { x: 0, y: 0 };
    }

    const len = Math.hypot(x, y);
    return { x: x / len, y: y / len };
  }, []);

  const setInputEnabled = useCallback((enabled: boolean): void => {
    enabledRef.current = enabled;
    if (!enabled) {
      keysRef.current = {};
    }
  }, []);

  return { getMovementVector, setInputEnabled };
}
