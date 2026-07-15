import { VFC_CONFIG, type MenuDifficultyId } from '../../utils/constants';

export const shouldUseTierForCompanionRetention = (difficulty: MenuDifficultyId): boolean => difficulty === 'hard';

export const getGlobalRetainBiofeedbackOk = (difficulty: MenuDifficultyId, rmssd: number, calibrationBaseline: number | null): boolean => {
  if (difficulty === 'easy') return true;
  if (difficulty === 'medium') {
    if (calibrationBaseline == null || calibrationBaseline <= 0 || rmssd <= 0) return true;
    return rmssd >= calibrationBaseline * (1 - VFC_CONFIG.MEDIUM_RMSSD_LOSS_MARGIN_BELOW_CALIBRATION);
  }
  return true;
};
