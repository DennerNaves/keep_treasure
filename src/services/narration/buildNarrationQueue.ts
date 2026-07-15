import { EXPLORATION_NARRATION_CONFIG } from '../../config/explorationNarration';
import type { NarrationStep } from '../../types/narration';
import type { Direction } from '../../types/mapGeneration';
import { collapsePathDirections } from '../explorationMap/pathDirectionsFormatter';

const resolveNarrationUrl = (basePath: string, file: string): string => {
  const parts = basePath.replace(/\/$/, '').split('/').filter(Boolean);
  return `/${parts.map((segment) => encodeURIComponent(segment)).join('/')}/${encodeURIComponent(`${file}.mp3`)}`;
};

const toStep = (basePath: string, file: string, caption: string, direction?: Direction): NarrationStep => ({
  url: resolveNarrationUrl(basePath, file),
  caption,
  ...(direction ? { direction } : {})
});

const buildDirectionSteps = (pathDirections: Direction[]): NarrationStep[] => {
  const { AUDIO_BASE_PATH, DIRECTION_STEPS } = EXPLORATION_NARRATION_CONFIG;

  return collapsePathDirections(pathDirections).map((direction) => {
    const config = DIRECTION_STEPS[direction];
    return toStep(AUDIO_BASE_PATH, config.file, config.caption, direction);
  });
};

export const buildDirectionNarrationQueue = (pathDirections: Direction[]): NarrationStep[] =>
  buildDirectionSteps(pathDirections);

export const buildExplorationNarrationQueue = (pathDirections: Direction[]): NarrationStep[] => {
  const { AUDIO_BASE_PATH, INTRO_STEPS, FINAL_STEPS } = EXPLORATION_NARRATION_CONFIG;

  const introSteps = INTRO_STEPS.map((step) => toStep(AUDIO_BASE_PATH, step.file, step.caption));
  const finalSteps = FINAL_STEPS.map((step) => toStep(AUDIO_BASE_PATH, step.file, step.caption));

  return [...introSteps, ...buildDirectionSteps(pathDirections), ...finalSteps];
};
