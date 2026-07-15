import { useCallback, useRef, useState, type ReactNode } from 'react';
import { BreathingPhaseContext } from './breathingPhaseContext';

const MIN_PHASE_DELTA = 0.02;
const MIN_UPDATE_INTERVAL_MS = 80;

export function BreathingPhaseProvider({ children }: { children: ReactNode }) {
  const [breathPhase, setBreathPhaseState] = useState(0.5);
  const lastPhaseRef = useRef(0.5);
  const lastUpdateRef = useRef(0);

  const setBreathPhase = useCallback((phase: number) => {
    const now = performance.now();
    const phaseDelta = Math.abs(phase - lastPhaseRef.current);
    const elapsed = now - lastUpdateRef.current;

    if (phaseDelta < MIN_PHASE_DELTA && elapsed < MIN_UPDATE_INTERVAL_MS) {
      return;
    }

    lastPhaseRef.current = phase;
    lastUpdateRef.current = now;
    setBreathPhaseState(phase);
  }, []);

  return <BreathingPhaseContext.Provider value={{ breathPhase, setBreathPhase }}>{children}</BreathingPhaseContext.Provider>;
}
