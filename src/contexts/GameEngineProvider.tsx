import { useCallback, useEffect, useRef, useState } from 'react';
import { useBluetooth } from '../hooks/useBluetooth';
import { isSessionExportSettled, submitSessionExport } from '../services/api';
import { createGameEngine, createGameLoop } from '../services/game';
import type { BreathingPatternId, GameEngineContextValue, GameEngineState, RmssdTier } from '../types';
import type { MenuDifficultyId } from '../utils/constants';
import { GameEngineContext } from './gameEngineContext';

const initialState: GameEngineState = {
  currentState: 'welcome',
  isPaused: false,
  isGameOver: false,
  elapsedTime: 0,
  timeRemaining: 0,
  score: 0,
  sessionCompleted: false,
  playerHasLeftScreen: false,
  sessionStarted: false,
  sessionSignalLossPersistent: false,
  companionHudPeakConcurrent: 0,
  companionHudConcurrentActive: 0,
  gameplayMode: 'static',
  explorationUnlocked: false,
  staticPhaseElapsedMs: 0,
  explorationUnlockProgress01: 0
};

export function GameEngineProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useBluetooth();
  const engineRef = useRef<ReturnType<typeof createGameEngine> | null>(null);
  const loopRef = useRef<ReturnType<typeof createGameLoop> | null>(null);
  const [state, setState] = useState<GameEngineState>(initialState);

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = createGameEngine();
      setState(engineRef.current.getState());
    }
    if (!loopRef.current) {
      loopRef.current = createGameLoop();
    }
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;

    const unsubscribe = engineRef.current.onStateChanged((newState) => {
      setState({ ...newState });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!engineRef.current || !loopRef.current) return;

    if (engineRef.current.isGameLoopActive()) {
      const unsubscribe = loopRef.current.onUpdate((deltaTime: number) => {
        if (engineRef.current) engineRef.current.updateTimer(deltaTime);
      });

      loopRef.current.start();

      return () => {
        unsubscribe();
        if (loopRef.current) loopRef.current.stop();
      };
    }
  }, [state.currentState]);

  const startGame = useCallback((isConnected = false, difficulty?: MenuDifficultyId) => {
    if (engineRef.current) engineRef.current.startGame(isConnected, difficulty);
  }, []);

  const completeCalibration = useCallback(() => {
    if (engineRef.current && loopRef.current) {
      engineRef.current.completeCalibration();
      loopRef.current.start();
    }
  }, []);

  const pauseGame = useCallback(() => {
    if (engineRef.current && loopRef.current) {
      engineRef.current.pauseGame();
      loopRef.current.pause();
    }
  }, []);

  const resumeGame = useCallback(() => {
    if (engineRef.current && loopRef.current) {
      engineRef.current.resumeGame();
      loopRef.current.resume();
    }
  }, []);

  const quitSession = useCallback(() => {
    if (!engineRef.current || !loopRef.current) return;

    const engine = engineRef.current;
    const snapshot = engine.getState();
    const shouldExport = snapshot.sessionStarted;

    engine.quitSession();
    loopRef.current.stop();

    if (shouldExport) {
      void submitSessionExport({
        score: snapshot.score,
        sessionWithSensor: snapshot.sessionWithSensor === true,
        sessionCompleted: false,
        elapsedTimeMs: snapshot.elapsedTime,
        sessionLimit: engine.getSessionLimit(),
        cyclesPerMinute: engine.getCyclesPerMinute(),
        sessionDifficulty: engine.getSessionDifficulty(),
        fullSensorExportEligible: snapshot.sessionWithSensor === true && snapshot.sessionSignalLossPersistent !== true
      });
    }
  }, []);

  const restartGame = useCallback(() => {
    if (engineRef.current && loopRef.current) {
      engineRef.current.restartGame(isConnected);
      loopRef.current.start();
    }
  }, [isConnected]);

  const goToMainMenu = useCallback(() => {
    if (!engineRef.current) return;

    const engine = engineRef.current;
    const snapshot = engine.getState();
    const shouldExport = snapshot.sessionStarted && !isSessionExportSettled();

    engine.goToMainMenu();
    if (loopRef.current) loopRef.current.stop();

    if (shouldExport) {
      void submitSessionExport({
        score: snapshot.score,
        sessionWithSensor: snapshot.sessionWithSensor === true,
        sessionCompleted: snapshot.sessionCompleted === true,
        elapsedTimeMs: snapshot.elapsedTime,
        sessionLimit: engine.getSessionLimit(),
        cyclesPerMinute: engine.getCyclesPerMinute(),
        sessionDifficulty: engine.getSessionDifficulty(),
        fullSensorExportEligible: snapshot.sessionWithSensor === true && snapshot.sessionSignalLossPersistent !== true
      });
    }
  }, []);

  const goToCalibration = useCallback(() => {
    if (engineRef.current && loopRef.current) {
      engineRef.current.goToCalibration();
      loopRef.current.stop();
    }
  }, []);

  const goToWelcome = useCallback(() => {
    if (engineRef.current && loopRef.current) {
      engineRef.current.goToWelcome();
      loopRef.current.stop();
    }
  }, []);

  const addScore = useCallback((points: number) => {
    if (engineRef.current) engineRef.current.addScore(points);
  }, []);

  const updateTimer = useCallback((deltaTime: number) => {
    if (engineRef.current) engineRef.current.updateTimer(deltaTime);
  }, []);

  const isPlaying = useCallback(() => {
    return engineRef.current ? engineRef.current.isPlaying() : false;
  }, []);

  const getSessionLimit = useCallback(() => {
    return engineRef.current ? engineRef.current.getSessionLimit() : 300;
  }, []);

  const setSessionLimit = useCallback((seconds: number) => {
    if (engineRef.current) engineRef.current.setSessionLimit(seconds);
  }, []);

  const getCyclesPerMinute = useCallback(() => {
    return engineRef.current ? engineRef.current.getCyclesPerMinute() : 10;
  }, []);

  const setCyclesPerMinute = useCallback((cpm: number) => {
    if (engineRef.current) engineRef.current.setCyclesPerMinute(cpm);
  }, []);

  const getBreathingPattern = useCallback(() => {
    return engineRef.current ? engineRef.current.getBreathingPattern() : 'continuous';
  }, []);

  const setBreathingPattern = useCallback((pattern: BreathingPatternId) => {
    if (engineRef.current) engineRef.current.setBreathingPattern(pattern);
  }, []);

  const getSessionPlayElapsedMs = useCallback(() => {
    return engineRef.current ? engineRef.current.getSessionPlayElapsedMs() : 0;
  }, []);

  const getCompanionScheduleElapsedMs = useCallback(() => {
    return engineRef.current ? engineRef.current.getCompanionScheduleElapsedMs() : 0;
  }, []);

  const setPlayerArrived = useCallback(() => {
    if (engineRef.current) engineRef.current.setPlayerArrived();
  }, []);

  const setPlayerHasLeftScreen = useCallback(() => {
    if (engineRef.current) engineRef.current.setPlayerHasLeftScreen();
  }, []);

  const getCompanionEntryDelays = useCallback(() => {
    return engineRef.current ? engineRef.current.getCompanionEntryDelays() : [];
  }, []);

  const updateScore = useCallback((rmssd: number, passiveActiveIndicators?: number, bleConnected?: boolean) => {
    if (engineRef.current) engineRef.current.updateScore(rmssd, passiveActiveIndicators, bleConnected);
  }, []);

  const applyPersistentSensorSignalLoss = useCallback(() => {
    if (engineRef.current) engineRef.current.applyPersistentSensorSignalLoss();
  }, []);

  const reportCompanionHudPeak = useCallback((concurrentHudActiveCount: number) => {
    if (engineRef.current) engineRef.current.reportCompanionHudPeak(concurrentHudActiveCount);
  }, []);

  const reportCompanionHudConcurrent = useCallback((concurrentHudActiveCount: number) => {
    if (engineRef.current) engineRef.current.reportCompanionHudConcurrent(concurrentHudActiveCount);
  }, []);

  const getSessionDifficulty = useCallback((): MenuDifficultyId => {
    return engineRef.current ? engineRef.current.getSessionDifficulty() : 'medium';
  }, []);

  const getGameplayMode = useCallback(() => {
    return engineRef.current ? engineRef.current.getGameplayMode() : 'static';
  }, []);

  const tickStaticPhase = useCallback((deltaTimeMs: number, rmssdTier: RmssdTier): boolean => {
    return engineRef.current ? engineRef.current.tickStaticPhase(deltaTimeMs, rmssdTier) : false;
  }, []);

  const enterExploration = useCallback(() => {
    if (engineRef.current) engineRef.current.enterExploration();
  }, []);

  const unlockExplorationManually = useCallback(() => {
    if (engineRef.current) engineRef.current.unlockExplorationManually();
  }, []);

  const completeExplorationWin = useCallback(() => {
    if (engineRef.current) engineRef.current.completeExplorationWin();
  }, []);

  const getEngineState = useCallback((): GameEngineState => {
    return engineRef.current ? engineRef.current.getState() : initialState;
  }, []);

  const value: GameEngineContextValue = {
    state,
    startGame,
    completeCalibration,
    pauseGame,
    resumeGame,
    quitSession,
    restartGame,
    goToMainMenu,
    goToCalibration,
    goToWelcome,
    addScore,
    updateTimer,
    isPlaying,
    getSessionLimit,
    setSessionLimit,
    getCyclesPerMinute,
    setCyclesPerMinute,
    getBreathingPattern,
    setBreathingPattern,
    getSessionPlayElapsedMs,
    getCompanionScheduleElapsedMs,
    setPlayerArrived,
    setPlayerHasLeftScreen,
    getCompanionEntryDelays,
    updateScore,
    applyPersistentSensorSignalLoss,
    reportCompanionHudPeak,
    reportCompanionHudConcurrent,
    getSessionDifficulty,
    getGameplayMode,
    tickStaticPhase,
    enterExploration,
    unlockExplorationManually,
    completeExplorationWin,
    getEngineState
  };

  return <GameEngineContext.Provider value={value}>{children}</GameEngineContext.Provider>;
}
