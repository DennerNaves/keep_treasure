import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ExplorationIntroContext } from '../../../contexts/explorationIntroContext';
import { useGameEngine } from '../../../hooks/useGameEngine';
import { computeStaticBreathingFrame } from '../../../services/staticBreathing';
import type { GameplayMode } from '../../../types/game';
import { BREATHING_GUIDE_BAR_CONFIG } from '../../../utils/constants';
import {
  GuideBarFill,
  GuideBarFillLevel,
  GuideBarIndicator,
  GuideBarIndicatorImage,
  GuideBarRoot,
  GuideBarTrack,
  GuideBarTrackImage
} from './styles';

export interface BreathingGuideBarProps {
  gameplayMode: GameplayMode;
  sessionStarted: boolean;
}

const MIN_WIDTH_PX = 48;
const MIN_HEIGHT_FRACTION = 0.15;

const resolveGuideBarSize = (mode: GameplayMode): { WIDTH_PX: number; HEIGHT_FRACTION: number } => {
  const raw =
    mode === 'exploration'
      ? BREATHING_GUIDE_BAR_CONFIG.EXPLORATION_SIZE
      : BREATHING_GUIDE_BAR_CONFIG.BREATHING_SIZE;
  return {
    WIDTH_PX: Math.max(MIN_WIDTH_PX, raw.WIDTH_PX),
    HEIGHT_FRACTION: Math.max(MIN_HEIGHT_FRACTION, Math.min(1, raw.HEIGHT_FRACTION))
  };
};

/**
 * Barra vertical de guia respiratório (fase estática e exploração top-down).
 * Usa `computeStaticBreathingFrame` com o relógio da sessão — mesmo CPM do menu.
 */
export default function BreathingGuideBar({ gameplayMode, sessionStarted }: BreathingGuideBarProps) {
  const { getSessionPlayElapsedMs, getCyclesPerMinute, getBreathingPattern } = useGameEngine();
  const { isIntroActive } = useContext(ExplorationIntroContext);
  const [progressFromTop01, setProgressFromTop01] = useState(1);
  const rafRef = useRef<number | null>(null);

  const { WIDTH_PX, HEIGHT_FRACTION } = useMemo(() => resolveGuideBarSize(gameplayMode), [gameplayMode]);

  const isGameplayPhase = gameplayMode === 'static' || gameplayMode === 'exploration';
  const hideForIntro = gameplayMode === 'exploration' && isIntroActive;
  const isVisible =
    BREATHING_GUIDE_BAR_CONFIG.ENABLED && sessionStarted && isGameplayPhase && !hideForIntro;

  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const elapsedMs = getSessionPlayElapsedMs();
      const cpm = getCyclesPerMinute();
      const pattern = getBreathingPattern();
      const frame = computeStaticBreathingFrame(elapsedMs, cpm, pattern);
      const fromTop = 1 - 2 * Math.min(frame.cycleProgress01, 1 - frame.cycleProgress01);
      setProgressFromTop01(fromTop);
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible, getSessionPlayElapsedMs, getCyclesPerMinute, getBreathingPattern]);

  if (!isVisible) return null;

  const trackImage = BREATHING_GUIDE_BAR_CONFIG.IMAGES.TRACK;
  const indicatorImage = BREATHING_GUIDE_BAR_CONFIG.IMAGES.INDICATOR;
  const fill01 = 1 - progressFromTop01;
  const hasFrame = trackImage.length > 0;

  return (
    <GuideBarRoot
      $position={BREATHING_GUIDE_BAR_CONFIG.POSITION}
      $widthPx={WIDTH_PX}
      $heightFraction={HEIGHT_FRACTION}
    >
      <GuideBarTrack $hasFrame={hasFrame}>
        <GuideBarFill $fill01={fill01} $hasFrame={hasFrame}>
          <GuideBarFillLevel $fill01={fill01} />
        </GuideBarFill>
        {trackImage ? <GuideBarTrackImage src={trackImage} alt="" /> : null}
        {indicatorImage ? (
          <GuideBarIndicatorImage
            src={indicatorImage}
            alt=""
            $progressFromTop01={progressFromTop01}
            $widthPx={WIDTH_PX}
          />
        ) : null}
        {!trackImage && !indicatorImage ? (
          <GuideBarIndicator $progressFromTop01={progressFromTop01} $widthPx={WIDTH_PX} />
        ) : null}
      </GuideBarTrack>
    </GuideBarRoot>
  );
}
