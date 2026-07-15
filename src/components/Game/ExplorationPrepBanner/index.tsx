import { PrepBannerHint, PrepBannerRoot, PrepBannerTitle, PrepProgressFill, PrepProgressTrack } from './styles';

import { GAMEPLAY_TRANSITION_CONFIG } from '../../../utils/constants';

export interface ExplorationPrepBannerProps {
  progress01: number;
  gameplayMode: 'static' | 'exploration';
  sessionStarted: boolean;
  sessionWithSensor: boolean;
  sessionSignalLossPersistent: boolean;
  /** Tempo total da fase estática (segundos). Vem de `getSessionLimit()` no caller. */
  staticDurationSeconds: number;
}

export default function ExplorationPrepBanner({
  progress01,
  gameplayMode,
  sessionStarted,
  sessionWithSensor,
  sessionSignalLossPersistent,
  staticDurationSeconds
}: ExplorationPrepBannerProps) {
  if (!sessionStarted || gameplayMode !== 'static') {
    return null;
  }

  const percent = Math.round(Math.max(0, Math.min(1, progress01)) * 100);
  const biofeedbackRequired = sessionWithSensor && !sessionSignalLossPersistent;
  const effectiveSeconds =
    staticDurationSeconds > 0
      ? staticDurationSeconds
      : Math.round(GAMEPLAY_TRANSITION_CONFIG.STATIC_FALLBACK_MIN_MS / 1000);
  const hint = biofeedbackRequired
    ? `Respire com calma. Resposta estável pode liberar antes; após ${effectiveSeconds}s a exploração abre de qualquer forma.`
    : `Respire por ${effectiveSeconds}s antes de partir para a exploração.`;

  return (
    <PrepBannerRoot>
      <PrepBannerTitle>Preparação</PrepBannerTitle>
      <PrepProgressTrack>
        <PrepProgressFill $percent={percent} />
      </PrepProgressTrack>
      <PrepBannerHint>{hint}</PrepBannerHint>
    </PrepBannerRoot>
  );
}
