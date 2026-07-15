import type { RmssdTier } from '../../types';
import { VFC_CONFIG } from '../../utils/constants';

export const computeRmssdTier = (rmssd: number, baseline: number): RmssdTier => {
  if (!baseline || rmssd <= baseline) return 0;
  const mults = [...VFC_CONFIG.RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS];
  if (mults.length === 0) return rmssd > baseline ? 1 : 0;
  for (let i = mults.length - 1; i >= 0; i -= 1) {
    const m = mults[i];
    if (m !== undefined && rmssd >= baseline * m) return i + 2;
  }
  return 1;
};
