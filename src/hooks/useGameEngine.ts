import { useContext } from 'react';
import { GameEngineContext } from '../contexts/gameEngineContext';
import type { GameEngineContextValue } from '../types';

export function useGameEngine(): GameEngineContextValue {
  const ctx = useContext(GameEngineContext);
  if (!ctx) {
    throw new Error('useGameEngine deve ser usado dentro de GameEngineProvider');
  }
  return ctx;
}
