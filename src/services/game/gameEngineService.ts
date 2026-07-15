import type { BreathingPatternId, GameEngineInstance, GameEngineState, GameplayMode, RmssdTier } from '../../types';
import {
  COMPANION_SLOT_COUNT,
  COMPANIONS_CONFIG,
  FEATURE_FLAGS,
  GAME_CONFIG,
  GAMEPLAY_TRANSITION_CONFIG,
  type MenuDifficultyId
} from '../../utils/constants';
import { markGameEnd, markGameRestart, markSessionPlayStart, resetVFCState, startVFCSession } from '../vfc';
import {
  advanceTierHoldAccumMs,
  evaluateExplorationTransition
} from './gameplayTransitionService';

export function createGameEngine(): GameEngineInstance {
  let sessionLimit: number = GAME_CONFIG.DEFAULT_SESSION_LIMIT;
  let cyclesPerMinute: number = GAME_CONFIG.DEFAULT_CYCLES_PER_MINUTE;
  let breathingPattern: BreathingPatternId = 'continuous';
  let sessionDifficulty: MenuDifficultyId = 'medium';

  let companionScheduleElapsedMs = 0;
  let playerHasArrived = false;
  let companionEntryDelays: number[] = [];

  let internalElapsedTime = 0;
  let lastRenderedSecond = -1;
  let tierHoldAccumMs = 0;
  const defaultGameplayFields = (): Pick<
    GameEngineState,
    'gameplayMode' | 'explorationUnlocked' | 'staticPhaseElapsedMs' | 'explorationUnlockProgress01'
  > => ({
    gameplayMode: 'static',
    explorationUnlocked: false,
    staticPhaseElapsedMs: 0,
    explorationUnlockProgress01: 0
  });

  const resetGameplayPhaseTracking = (): void => {
    tierHoldAccumMs = 0;
  };

  let state: GameEngineState = {
    currentState: 'welcome',
    isPaused: false,
    isGameOver: false,
    elapsedTime: 0,
    timeRemaining: sessionLimit >= 0 ? sessionLimit : 0,
    score: 0,
    sessionCompleted: false,
    playerHasLeftScreen: false,
    sessionStarted: false,
    sessionWithSensor: false,
    sessionSignalLossPersistent: false,
    companionHudPeakConcurrent: 0,
    companionHudConcurrentActive: 0,
    ...defaultGameplayFields()
  };

  let onStateChange: ((state: GameEngineState) => void) | null = null;

  const notifyStateChange = (): void => {
    if (onStateChange) {
      onStateChange({ ...state });
    }
  };

  const updateState = (updates: Partial<GameEngineState>): void => {
    state = { ...state, ...updates };
    notifyStateChange();
  };

  const getState = (): GameEngineState => ({ ...state });

  const getCompanionEntryDelaysForNoSensor = (): number[] => {
    if (sessionLimit > 0) {
      const totalTimeMs = sessionLimit * 1000;
      return COMPANIONS_CONFIG.map((companion) => Math.max(0, companion.entryDelay * totalTimeMs));
    }

    return [3000, 5000, 7000, 10000];
  };

  const completeExplorationWin = (): void => {
    if (state.isGameOver) return;
    if (state.sessionWithSensor) {
      markSessionPlayStart();
    }
    markGameEnd();
    updateState({
      currentState: 'gameOver',
      isGameOver: true,
      isPaused: false,
      sessionCompleted: true,
      playerHasLeftScreen: true
    });
  };

  const startGame = (isConnected = false, difficulty: MenuDifficultyId = 'medium'): void => {
    sessionDifficulty = difficulty;
    companionScheduleElapsedMs = 0;
    playerHasArrived = false;
    internalElapsedTime = 0;
    lastRenderedSecond = -1;
    resetGameplayPhaseTracking();

    if (!isConnected) {
      companionEntryDelays = getCompanionEntryDelaysForNoSensor();
    } else {
      companionEntryDelays = COMPANIONS_CONFIG.map((c) => c.entryDelay);
      resetVFCState();
      startVFCSession();
    }

    updateState({
      currentState: 'playing',
      isPaused: false,
      isGameOver: false,
      elapsedTime: 0,
      timeRemaining: 0,
      score: 0,
      sessionCompleted: false,
      playerHasLeftScreen: false,
      sessionStarted: false,
      sessionWithSensor: isConnected,
      sessionSignalLossPersistent: false,
      companionHudPeakConcurrent: 0,
      companionHudConcurrentActive: 0,
      ...defaultGameplayFields(),
      gameplayMode: 'exploration',
      explorationUnlocked: true,
      explorationUnlockProgress01: 1
    });
  };

  const reportCompanionHudPeak = (concurrentHudActiveCount: number): void => {
    const capped = Math.min(COMPANION_SLOT_COUNT, Math.max(0, Math.floor(concurrentHudActiveCount)));
    if (capped > (state.companionHudPeakConcurrent ?? 0)) {
      updateState({ companionHudPeakConcurrent: capped });
    }
  };

  const reportCompanionHudConcurrent = (concurrentHudActiveCount: number): void => {
    const capped = Math.min(COMPANION_SLOT_COUNT, Math.max(0, Math.floor(concurrentHudActiveCount)));
    if (capped !== (state.companionHudConcurrentActive ?? 0)) {
      updateState({ companionHudConcurrentActive: capped });
    }
  };

  const applyPersistentSensorSignalLoss = (): void => {
    if (state.sessionSignalLossPersistent) return;
    if (!state.sessionWithSensor) return;
    companionEntryDelays = getCompanionEntryDelaysForNoSensor();
    updateState({ sessionSignalLossPersistent: true });
  };

  const pauseGame = (): void => {
    if (state.currentState === 'playing' && !state.isGameOver) {
      updateState({
        currentState: 'paused',
        isPaused: true
      });
    }
  };

  const resumeGame = (): void => {
    if (state.currentState === 'paused') {
      updateState({
        currentState: 'playing',
        isPaused: false
      });
    }
  };

  const goToMainMenu = (): void => {
    resetGameplayPhaseTracking();
    updateState({
      currentState: 'mainMenu',
      isPaused: false,
      isGameOver: false,
      sessionSignalLossPersistent: false,
      companionHudPeakConcurrent: 0,
      companionHudConcurrentActive: 0,
      ...defaultGameplayFields()
    });
  };

  const quitSession = (): void => {
    const playable =
      state.currentState === 'playing' || state.currentState === 'paused' || state.currentState === 'restarting';
    if (!playable) return;

    markGameEnd();

    companionScheduleElapsedMs = 0;
    playerHasArrived = false;
    internalElapsedTime = 0;
    lastRenderedSecond = -1;
    resetGameplayPhaseTracking();

    updateState({
      currentState: 'mainMenu',
      isPaused: false,
      isGameOver: false,
      elapsedTime: 0,
      timeRemaining: sessionLimit >= 0 ? sessionLimit : 0,
      score: 0,
      sessionCompleted: false,
      playerHasLeftScreen: false,
      sessionStarted: false,
      sessionSignalLossPersistent: false,
      companionHudPeakConcurrent: 0,
      companionHudConcurrentActive: 0,
      ...defaultGameplayFields()
    });
  };

  const goToWelcome = (): void => {
    sessionDifficulty = 'medium';
    companionScheduleElapsedMs = 0;
    playerHasArrived = false;
    internalElapsedTime = 0;
    lastRenderedSecond = -1;
    resetGameplayPhaseTracking();
    updateState({
      currentState: 'welcome',
      isPaused: false,
      isGameOver: false,
      elapsedTime: 0,
      timeRemaining: sessionLimit >= 0 ? sessionLimit : 0,
      score: 0,
      sessionCompleted: false,
      playerHasLeftScreen: false,
      sessionStarted: false,
      sessionWithSensor: false,
      sessionSignalLossPersistent: false,
      companionHudPeakConcurrent: 0,
      companionHudConcurrentActive: 0,
      ...defaultGameplayFields()
    });
  };

  const restartGame = (isConnected = false): void => {
    companionScheduleElapsedMs = 0;
    playerHasArrived = false;
    internalElapsedTime = 0;
    lastRenderedSecond = -1;
    resetGameplayPhaseTracking();

    const newSessionWithSensor = isConnected;
    if (!newSessionWithSensor) {
      resetVFCState();
    }
    companionEntryDelays = newSessionWithSensor ? COMPANIONS_CONFIG.map((c) => c.entryDelay) : getCompanionEntryDelaysForNoSensor();
    updateState({
      currentState: 'restarting',
      isPaused: false,
      isGameOver: false,
      elapsedTime: 0,
      timeRemaining: 0,
      score: 0,
      sessionCompleted: false,
      playerHasLeftScreen: false,
      sessionStarted: false,
      sessionWithSensor: newSessionWithSensor,
      sessionSignalLossPersistent: false,
      companionHudPeakConcurrent: 0,
      companionHudConcurrentActive: 0,
      ...defaultGameplayFields(),
      gameplayMode: 'exploration',
      explorationUnlocked: true,
      explorationUnlockProgress01: 1
    });
    setTimeout(() => {
      if (newSessionWithSensor) {
        markGameRestart();
      }
      updateState({ currentState: 'playing' });
    }, 0);
  };

  const addScore = (points: number): void => {
    if (state.currentState === 'playing' && !state.isPaused && !state.isGameOver) {
      updateState({
        score: state.score + points
      });
    }
  };

  const updateTimer = (deltaTime: number): void => {
    if (state.currentState !== 'playing' || state.isPaused || state.isGameOver) {
      return;
    }

    const isExploration = state.gameplayMode === 'exploration';

    if (playerHasArrived) {
      internalElapsedTime += deltaTime;
      if (!isExploration) {
        companionScheduleElapsedMs += deltaTime;
      }
    }

    // Exploração: sem countdown nem game-over por tempo (vitória no baú). O relógio de
    // sessão (`internalElapsedTime`) continua para ritmo respiratório (barra guia, etc.).
    if (isExploration) {
      return;
    }

    let newTimeRemaining: number;
    if (sessionLimit < 0) {
      newTimeRemaining = internalElapsedTime / 1000;
    } else {
      newTimeRemaining = Math.max(0, sessionLimit - internalElapsedTime / 1000);
    }

    const currentSecond = Math.floor(internalElapsedTime / 1000);
    if (currentSecond !== lastRenderedSecond || lastRenderedSecond === -1) {
      lastRenderedSecond = currentSecond;

      updateState({
        elapsedTime: internalElapsedTime,
        timeRemaining: newTimeRemaining
      });
    }

    // No top-down, o fim do `sessionLimit` durante a fase estática é o **gatilho** para
    // entrar em exploração (controlado pelo canvas via `tickStaticPhase` + fade), não fim
    // de jogo. Só o legacy ocean dispara game-over por tempo aqui.
    const timeBasedGameOverEnabled = FEATURE_FLAGS.LEGACY_OCEAN_GAMEPLAY_ENABLED;
    if (timeBasedGameOverEnabled && sessionLimit >= 0 && newTimeRemaining <= 0) {
      markGameEnd();
      updateState({
        currentState: 'gameOver',
        isGameOver: true,
        sessionCompleted: true
      });
    }
  };

  const updateScore = (rmssd: number, passiveActiveIndicators?: number, bleConnected = true): void => {
    if (state.currentState !== 'playing' || state.isPaused || state.isGameOver) return;
    if (!playerHasArrived) return;

    const passiveMode = !state.sessionWithSensor || state.sessionSignalLossPersistent === true || !bleConnected;

    if (passiveMode) {
      const passiveHudConcurrent =
        passiveActiveIndicators !== undefined
          ? Math.max(0, Math.min(COMPANION_SLOT_COUNT, Math.floor(passiveActiveIndicators)))
          : Math.max(0, state.companionHudPeakConcurrent ?? 0);
      addScore(Math.max(1, passiveHudConcurrent));
      return;
    }

    const currentVFC = rmssd > 0 ? Math.floor(rmssd) : 0;
    if (currentVFC > 0) {
      addScore(currentVFC);
    }
  };

  const isPlaying = (): boolean => {
    return (state.currentState === 'playing' || state.currentState === 'restarting') && !state.isPaused && !state.isGameOver;
  };

  const isGameLoopActive = (): boolean => {
    return state.currentState === 'playing' || state.currentState === 'restarting' || state.currentState === 'gameOver';
  };

  const onStateChangedHandler = (callback: (state: GameEngineState) => void): (() => void) => {
    onStateChange = callback;
    return () => {
      onStateChange = null;
    };
  };

  const getSessionLimit = (): number => sessionLimit;
  const setSessionLimit = (seconds: number): void => {
    sessionLimit = seconds;
  };
  const getCyclesPerMinute = (): number => cyclesPerMinute;
  const setCyclesPerMinute = (cpm: number): void => {
    cyclesPerMinute = Math.max(GAME_CONFIG.MIN_CYCLES_PER_MINUTE, Math.min(GAME_CONFIG.MAX_CYCLES_PER_MINUTE, cpm));
  };

  const getBreathingPattern = (): BreathingPatternId => breathingPattern;

  const setBreathingPattern = (pattern: BreathingPatternId): void => {
    breathingPattern = pattern;
  };

  const getSessionPlayElapsedMs = (): number => internalElapsedTime;

  const getCompanionScheduleElapsedMs = (): number => companionScheduleElapsedMs;
  const setPlayerArrived = (): void => {
    if (playerHasArrived) return;
    playerHasArrived = true;
    if (state.sessionWithSensor) {
      markSessionPlayStart();
    }
    updateState({ sessionStarted: true });
  };
  const setPlayerHasLeftScreen = (): void => {
    updateState({ playerHasLeftScreen: true });
  };
  const getCompanionEntryDelays = (): number[] => [...companionEntryDelays];

  const getSessionDifficulty = (): MenuDifficultyId => sessionDifficulty;

  const getGameplayMode = (): GameplayMode => state.gameplayMode;

  const enterExploration = (): void => {
    if (state.gameplayMode === 'exploration') return;
    if (state.currentState !== 'playing' && state.currentState !== 'restarting') return;
    updateState({
      gameplayMode: 'exploration',
      explorationUnlocked: true,
      explorationUnlockProgress01: 1
    });
  };

  const unlockExplorationManually = (): void => {
    if (!GAMEPLAY_TRANSITION_CONFIG.ALLOW_MANUAL_UNLOCK) return;
    enterExploration();
  };

  const tickStaticPhase = (deltaTimeMs: number, rmssdTier: RmssdTier): boolean => {
    if (state.gameplayMode !== 'static') return false;
    if (state.currentState !== 'playing' && state.currentState !== 'restarting') return false;
    if (!state.sessionStarted || state.isPaused || state.isGameOver) return false;

    tierHoldAccumMs = advanceTierHoldAccumMs(deltaTimeMs, rmssdTier, tierHoldAccumMs);

    const evaluation = evaluateExplorationTransition({
      staticPhaseElapsedMs: internalElapsedTime,
      staticTargetMs: sessionLimit > 0 ? sessionLimit * 1000 : 0,
      tierHoldAccumMs,
      rmssdTier,
      sessionWithSensor: state.sessionWithSensor === true,
      sessionSignalLossPersistent: state.sessionSignalLossPersistent === true
    });

    updateState({
      staticPhaseElapsedMs: internalElapsedTime,
      explorationUnlockProgress01: evaluation.overallProgress01
    });

    return evaluation.canUnlock;
  };

  return {
    getState,
    startGame,
    pauseGame,
    resumeGame,
    quitSession,
    restartGame,
    goToMainMenu,
    goToWelcome,
    addScore,
    updateTimer,
    updateScore,
    isPlaying,
    isGameLoopActive,
    onStateChanged: onStateChangedHandler,
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
    applyPersistentSensorSignalLoss,
    reportCompanionHudPeak,
    reportCompanionHudConcurrent,
    getSessionDifficulty,
    getGameplayMode,
    tickStaticPhase,
    enterExploration,
    unlockExplorationManually,
    completeExplorationWin
  };
}
