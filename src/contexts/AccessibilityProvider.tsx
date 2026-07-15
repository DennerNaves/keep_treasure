import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { BRIGHTNESS_CONFIG, BRIGHTNESS_STORAGE_KEY } from '../utils/constants';
import { AccessibilityContext } from './accessibilityContext';

const { MIN, MAX, DEFAULT } = BRIGHTNESS_CONFIG;

const clampBrightness = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT;
  return Math.min(MAX, Math.max(MIN, Math.round(value)));
};

function readStoredBrightness(): number {
  try {
    const stored = localStorage.getItem(BRIGHTNESS_STORAGE_KEY);
    if (stored == null) return DEFAULT;
    const parsed = parseInt(stored, 10);
    if (Number.isNaN(parsed)) return DEFAULT;
    return clampBrightness(parsed);
  } catch {
    return DEFAULT;
  }
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [brightness, setBrightnessState] = useState<number>(readStoredBrightness);

  const setBrightness = useCallback((value: number) => {
    const next = clampBrightness(value);
    setBrightnessState(next);
    try {
      localStorage.setItem(BRIGHTNESS_STORAGE_KEY, String(next));
    } catch {
      void 0;
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--brightness', String(brightness / 100));
    return () => {
      document.documentElement.style.removeProperty('--brightness');
    };
  }, [brightness]);

  return (
    <AccessibilityContext.Provider value={{ brightness, setBrightness }}>{children}</AccessibilityContext.Provider>
  );
}
