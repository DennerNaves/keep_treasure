import { createContext } from 'react';
import type { GameEngineContextValue } from '../types';

export const GameEngineContext = createContext<GameEngineContextValue | null>(null);
