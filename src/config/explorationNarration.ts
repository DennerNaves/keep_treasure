import type { Direction } from '../types/mapGeneration';

export type NarrationStepConfig = {
  file: string;
  caption: string;
};

export const EXPLORATION_NARRATION_CONFIG = {
  AUDIO_BASE_PATH: '/assets/sounds/Audios Direção Abelha',
  PAUSE_BETWEEN_CLIPS_MS: 1500,
  AWAITING_PROMPT: 'Entendeu as direções?',
  BUTTONS: {
    confirmLabel: 'Entendi, vamos!',
    repeatLabel: 'Repetir'
  },
  INTRO_STEPS: [
    { file: 'Intro1', caption: 'Olá, você respirou muito bem' },
    { file: 'Intro2', caption: 'Agora vamos explorar a floresta e encontrar o tesouro?' },
    { file: 'Intro3', caption: 'Siga as instruções que eu vou te dizer:' }
  ] satisfies NarrationStepConfig[],
  FINAL_STEPS: [{ file: 'Final', caption: 'Se concentre e vamos lá!' }] satisfies NarrationStepConfig[],
  DIRECTION_STEPS: {
    up: { file: 'Cima', caption: 'Cima' },
    down: { file: 'Baixo', caption: 'Baixo' },
    left: { file: 'Esquerda', caption: 'Esquerda' },
    right: { file: 'Direita', caption: 'Direita' }
  } satisfies Record<Direction, NarrationStepConfig>,
  DIRECTION_ARROW: {
    IMAGE: '/assets/images/ui/DirectionArrow.png',
    SIZE_PX: 56
  },
  DIRECTION_ARROW_ROTATION_DEG: {
    up: 0,
    right: 90,
    down: 180,
    left: 270
  } satisfies Record<Direction, number>
} as const;

export const getDirectionArrowRotation = (direction: Direction): number =>
  EXPLORATION_NARRATION_CONFIG.DIRECTION_ARROW_ROTATION_DEG[direction];
