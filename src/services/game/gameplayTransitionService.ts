import type { RmssdTier } from '../../types';
import { GAMEPLAY_TRANSITION_CONFIG } from '../../utils/constants';

export interface ExplorationTransitionInput {
  staticPhaseElapsedMs: number;
  /** Duração-alvo da fase estática (ms). Vem do menu (`getSessionLimit() * 1000`). */
  staticTargetMs: number;
  tierHoldAccumMs: number;
  rmssdTier: RmssdTier;
  sessionWithSensor: boolean;
  sessionSignalLossPersistent: boolean;
}

export interface ExplorationTransitionResult {
  canUnlock: boolean;
  nextTierHoldAccumMs: number;
  timeProgress01: number;
  tierProgress01: number;
  overallProgress01: number;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const advanceTierHoldAccumMs = (
  deltaTimeMs: number,
  rmssdTier: RmssdTier,
  currentTierHoldAccumMs: number
): number => {
  if (rmssdTier >= GAMEPLAY_TRANSITION_CONFIG.EXPLORATION_UNLOCK_TIER_MIN) {
    return currentTierHoldAccumMs + deltaTimeMs;
  }
  return 0;
};

export const evaluateExplorationTransition = (input: ExplorationTransitionInput): ExplorationTransitionResult => {
  const {
    staticPhaseElapsedMs,
    staticTargetMs,
    tierHoldAccumMs,
    rmssdTier,
    sessionWithSensor,
    sessionSignalLossPersistent
  } = input;
  const { TIER_HOLD_MS, EXPLORATION_UNLOCK_TIER_MIN, STATIC_FALLBACK_MIN_MS } = GAMEPLAY_TRANSITION_CONFIG;

  const effectiveTargetMs = staticTargetMs > 0 ? staticTargetMs : STATIC_FALLBACK_MIN_MS;

  const timeProgress01 = clamp01(staticPhaseElapsedMs / effectiveTargetMs);
  const tierProgress01 = clamp01(tierHoldAccumMs / TIER_HOLD_MS);

  const timeReady = staticPhaseElapsedMs >= effectiveTargetMs;
  const biofeedbackRequired = sessionWithSensor && !sessionSignalLossPersistent;
  const earlyBioUnlock =
    biofeedbackRequired &&
    rmssdTier >= EXPLORATION_UNLOCK_TIER_MIN &&
    tierHoldAccumMs >= TIER_HOLD_MS;

  const canUnlock = timeReady || earlyBioUnlock;
  const overallProgress01 = biofeedbackRequired ? clamp01((timeProgress01 + tierProgress01) / 2) : timeProgress01;

  return {
    canUnlock,
    nextTierHoldAccumMs: tierHoldAccumMs,
    timeProgress01,
    tierProgress01,
    overallProgress01
  };
};
