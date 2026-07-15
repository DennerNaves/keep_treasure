import { BRIGHTNESS_CONFIG } from './constants';

export const brightnessToSliderPct = (brightness: number): number => {
  const { MIN, MAX } = BRIGHTNESS_CONFIG;
  const range = MAX - MIN || 1;
  return Math.round(((brightness - MIN) / range) * 100);
};
