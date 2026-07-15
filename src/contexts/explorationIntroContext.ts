import { createContext } from 'react';
import type { Direction } from '../types/mapGeneration';

/**
 * Estado leve compartilhado entre o orquestrador da intro (`ExplorationIntro`) e o
 * `gameCanvas`. Tem dois papéis:
 * - `isIntroActive` / `setIntroActive`: o canvas observa para **bloquear input**.
 * - `pathDirections` / `setPathDirections`: o `gameCanvas` chama `useWorldMap` e
 *   publica a sequência aqui; o `ExplorationIntro` (que vive no `Game/index.tsx`)
 *   consome para montar a mensagem da abelha.
 *
 * Mantemos o tipo o mais mínimo possível para evitar acoplamento com a animação em
 * si — ela vive no hook `useExplorationIntro`.
 */
export interface ExplorationIntroContextValue {
  isIntroActive: boolean;
  setIntroActive: (active: boolean) => void;
  pathDirections: Direction[];
  setPathDirections: (directions: Direction[]) => void;
}

export const ExplorationIntroContext = createContext<ExplorationIntroContextValue>({
  isIntroActive: false,
  setIntroActive: () => {},
  pathDirections: [],
  setPathDirections: () => {}
});
