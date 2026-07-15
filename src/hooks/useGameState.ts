import { useCallback, useRef } from 'react';
import type { GameStateData, UseGameStateResult } from '../types';

export function useGameState(): UseGameStateResult {
  const dataRef = useRef<GameStateData>({
    hasPlayedClearSound: false,
    hasExportedData: false,
    scoreTimer: 0
  });

  const getGameStateData = useCallback((): GameStateData => {
    return { ...dataRef.current };
  }, []);

  const markClearSoundPlayed = useCallback((): void => {
    dataRef.current.hasPlayedClearSound = true;
  }, []);

  const markDataExported = useCallback((): void => {
    dataRef.current.hasExportedData = true;
  }, []);

  const updateScoreTimer = useCallback((deltaTime: number): { shouldScore: boolean } => {
    dataRef.current.scoreTimer += deltaTime;
    if (dataRef.current.scoreTimer >= 1000) {
      dataRef.current.scoreTimer -= 1000;
      return { shouldScore: true };
    }
    return { shouldScore: false };
  }, []);

  const resetGameStateData = useCallback((): void => {
    dataRef.current.hasPlayedClearSound = false;
    dataRef.current.hasExportedData = false;
    dataRef.current.scoreTimer = 0;
  }, []);

  return {
    getGameStateData,
    markClearSoundPlayed,
    markDataExported,
    updateScoreTimer,
    resetGameStateData
  };
}
