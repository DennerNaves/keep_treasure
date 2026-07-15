import { useContext, useEffect, useState } from 'react';
import { EXPLORATION_NARRATION_CONFIG, getDirectionArrowRotation } from '../../../config/explorationNarration';
import { ExplorationIntroContext } from '../../../contexts/explorationIntroContext';
import { useAudio } from '../../../hooks/useAudio';
import { useExplorationIntro } from '../../../hooks/useExplorationIntro';
import type { Direction } from '../../../types/mapGeneration';
import { EXPLORATION_INTRO_CONFIG } from '../../../utils/constants';
import SpeechBubble from '../SpeechBubble';
import TutorialBee from '../TutorialBee';
import { Backdrop, IntroOverlayRoot } from './styles';

export interface ExplorationIntroProps {
  /**
   * Vira `true` no instante em que a fase de exploração começa para esta partida.
   * O componente reseta o trigger internamente quando a intro termina (fase `done`).
   */
  shouldStart: boolean;
  /** Sequência de direções do corredor procedural — monta a fila de narração. */
  pathDirections: Direction[];
  /** Chamado quando o jogador completa a intro (fase `done`). */
  onFinished: () => void;
}

const useViewport = (): { width: number; height: number } => {
  const [size, setSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  }));
  useEffect(() => {
    const handle = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);
  return size;
};

/**
 * Orquestrador da intro: backdrop + abelha + balão com narração em áudio.
 */
export default function ExplorationIntro({ shouldStart, pathDirections, onFinished }: ExplorationIntroProps) {
  const viewport = useViewport();
  const { initAudio } = useAudio();
  const { phase, bubbleText, beePosition, beeFacingRight, confirm, repeat, currentDirection } = useExplorationIntro({
    trigger: shouldStart && EXPLORATION_INTRO_CONFIG.ENABLED,
    pathDirections,
    viewport
  });
  const { setIntroActive } = useContext(ExplorationIntroContext);

  useEffect(() => {
    if (shouldStart && EXPLORATION_INTRO_CONFIG.ENABLED) {
      initAudio();
    }
  }, [shouldStart, initAudio]);

  const isActive = phase !== 'idle' && phase !== 'done';
  useEffect(() => {
    setIntroActive(isActive);
    return () => setIntroActive(false);
  }, [isActive, setIntroActive]);

  useEffect(() => {
    if (phase === 'done') onFinished();
  }, [phase, onFinished]);

  if (!isActive) return null;

  const bubbleAnchorX = beePosition.x + EXPLORATION_INTRO_CONFIG.SPEECH_BUBBLE.OFFSET.x;
  const bubbleAnchorY = beePosition.y + EXPLORATION_INTRO_CONFIG.SPEECH_BUBBLE.OFFSET.y;
  const showBubble = phase === 'narrating' || phase === 'awaitingResponse';
  const bubbleProps = {
    anchor: { x: bubbleAnchorX, y: bubbleAnchorY },
    placement: EXPLORATION_INTRO_CONFIG.SPEECH_BUBBLE.PLACEMENT,
    imageUrl: EXPLORATION_INTRO_CONFIG.SPEECH_BUBBLE.IMAGE,
    padding: EXPLORATION_INTRO_CONFIG.SPEECH_BUBBLE.PADDING,
    minWidthPx: EXPLORATION_INTRO_CONFIG.SPEECH_BUBBLE.MIN_WIDTH_PX,
    maxWidthPx: EXPLORATION_INTRO_CONFIG.SPEECH_BUBBLE.MAX_WIDTH_PX,
    minHeightPx: EXPLORATION_INTRO_CONFIG.SPEECH_BUBBLE.MIN_HEIGHT_PX,
    maxHeightPx: EXPLORATION_INTRO_CONFIG.SPEECH_BUBBLE.MAX_HEIGHT_PX,
    textColor: EXPLORATION_INTRO_CONFIG.SPEECH_BUBBLE.TEXT_COLOR
  };

  return (
    <IntroOverlayRoot>
      <Backdrop />
      <TutorialBee
        position={beePosition}
        facingRight={beeFacingRight}
        viewportHeight={viewport.height}
        animationMode={phase === 'narrating' ? 'mouth' : 'wings'}
      />
      {showBubble ? (
        <SpeechBubble
          text={bubbleText}
          {...bubbleProps}
          directionArrow={
            phase === 'narrating' && currentDirection != null
              ? {
                  imageUrl: EXPLORATION_NARRATION_CONFIG.DIRECTION_ARROW.IMAGE,
                  rotationDeg: getDirectionArrowRotation(currentDirection),
                  sizePx: EXPLORATION_NARRATION_CONFIG.DIRECTION_ARROW.SIZE_PX
                }
              : undefined
          }
          actions={
            phase === 'awaitingResponse'
              ? {
                  secondary: {
                    label: EXPLORATION_NARRATION_CONFIG.BUTTONS.repeatLabel,
                    onClick: repeat
                  },
                  primary: {
                    label: EXPLORATION_NARRATION_CONFIG.BUTTONS.confirmLabel,
                    onClick: confirm
                  }
                }
              : undefined
          }
        />
      ) : null}
    </IntroOverlayRoot>
  );
}
