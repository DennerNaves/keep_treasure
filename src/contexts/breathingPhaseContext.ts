import { createContext } from 'react';
import type { BreathingPhaseContextValue } from '../types';

export const BreathingPhaseContext = createContext<BreathingPhaseContextValue | null>(null);
