import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Direction } from '../types/mapGeneration';
import { ExplorationIntroContext } from './explorationIntroContext';

/**
 * Provider do `ExplorationIntroContext`. Mantém `isIntroActive` e `pathDirections`
 * em estado React (não em ref) porque os consumidores reagem à mudança: o
 * `gameCanvas` lê `isIntroActive` para travar input, e o `ExplorationIntro` lê
 * `pathDirections` para montar o texto da abelha quando entra na fase de exploração.
 */
export function ExplorationIntroProvider({ children }: { children: ReactNode }) {
  const [isIntroActive, setIntroActiveState] = useState(false);
  const [pathDirections, setPathDirectionsState] = useState<Direction[]>([]);

  const setIntroActive = useCallback((active: boolean) => {
    setIntroActiveState(active);
  }, []);

  const setPathDirections = useCallback((directions: Direction[]) => {
    setPathDirectionsState(directions);
  }, []);

  const value = useMemo(
    () => ({ isIntroActive, setIntroActive, pathDirections, setPathDirections }),
    [isIntroActive, setIntroActive, pathDirections, setPathDirections]
  );

  return (
    <ExplorationIntroContext.Provider value={value}>{children}</ExplorationIntroContext.Provider>
  );
}
