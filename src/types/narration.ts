import type { Direction } from './mapGeneration';

export interface NarrationStep {
  url: string;
  caption: string;
  /** Presente apenas em passos de direção do corredor. */
  direction?: Direction;
}