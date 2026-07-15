import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { BreathingPhaseContext } from '../../contexts/breathingPhaseContext';
import { ExplorationIntroContext } from '../../contexts/explorationIntroContext';
import { useAudio } from '../../hooks/useAudio';
import { useBackgroundLayers } from '../../hooks/useBackgroundLayers';
import { useBluetooth } from '../../hooks/useBluetooth';
import { useCanvas } from '../../hooks/useCanvas';
import { useCompanions } from '../../hooks/useCompanions';
import { useExplorationPlayer } from '../../hooks/useExplorationPlayer';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useInput } from '../../hooks/useInput';
import { useExplorationChest } from '../../hooks/useExplorationChest';
import { useFogLayer } from '../../hooks/useFogLayer';
import { useStaticBreathing } from '../../hooks/useStaticBreathing';
import { useWorldMap } from '../../hooks/useWorldMap';
import { useParticles } from '../../hooks/useParticles';
import { usePlayer } from '../../hooks/usePlayer';
import { resetSessionExportGate, submitSessionExport } from '../../services/api';
import { drawFogViewportPlaceholder } from '../../services/explorationFog';
import { createGameLoop, getGlobalRetainBiofeedbackOk, shouldUseTierForCompanionRetention } from '../../services/game';
import { getCalibrationRmssdBaseline, getVFCState } from '../../services/vfc';
import type { GameEngineState, GameState, RmssdTier } from '../../types';
import {
  EXPLORATION_ACTIVE_MAP_URL,
  EXPLORATION_FALLBACK_FLOOR_COLOR,
  EXPLORATION_FOG_CONFIG,
  EXPLORATION_MAP_GENERATION_CONFIG,
  FEATURE_FLAGS,
  GAME_CONFIG,
  SENSOR_SESSION_CONFIG,
  TIMING,
  type MenuDifficultyId
} from '../../utils/constants';
import { isRecentRrReceived } from '../../utils/sensorSignal';
import { GameCanvasContainer, GameCanvasElement } from './styles';

const LEGACY_OCEAN_ENABLED = FEATURE_FLAGS.LEGACY_OCEAN_GAMEPLAY_ENABLED;
const TOPDOWN_ENABLED = FEATURE_FLAGS.TOPDOWN_PLAYTEST_ENABLED;
const FOG_ENABLED = FEATURE_FLAGS.EXPLORATION_FOG_ENABLED;

const SESSION_EXPORT_MAX_ATTEMPTS = 3;

type SessionExportGateRefs = {
  hasExported: { current: boolean };
  isSubmitting: { current: boolean };
  lastAttemptAt: { current: number };
  attemptCount: { current: number };
  cooldownMs: number;
};

const trySubmitSessionExport = (
  deps: Record<string, unknown>,
  cpm: number,
  sensorDisconnectedDuringSession: boolean,
  gate: SessionExportGateRefs
): void => {
  if (gate.hasExported.current || gate.isSubmitting.current) return;
  if (gate.attemptCount.current >= SESSION_EXPORT_MAX_ATTEMPTS) return;
  if (Date.now() - gate.lastAttemptAt.current < gate.cooldownMs) return;

  gate.isSubmitting.current = true;
  gate.lastAttemptAt.current = Date.now();
  gate.attemptCount.current += 1;

  void (async () => {
    const exportState = (deps.getEngineState as () => GameEngineState)();
    const fullSensorExportEligible =
      exportState.sessionWithSensor === true &&
      exportState.sessionSignalLossPersistent !== true &&
      !sensorDisconnectedDuringSession;

    const ok = await submitSessionExport({
      score: exportState.score,
      sessionWithSensor: exportState.sessionWithSensor === true,
      sessionCompleted: exportState.sessionCompleted === true,
      elapsedTimeMs: exportState.elapsedTime,
      sessionLimit: (deps.getSessionLimit as () => number)(),
      cyclesPerMinute: cpm,
      sessionDifficulty: (deps.getSessionDifficulty as () => MenuDifficultyId)(),
      fullSensorExportEligible
    });
    gate.isSubmitting.current = false;
    if (ok) gate.hasExported.current = true;
  })();
};

export default function GameCanvas() {
  const { canvasRef, containerRef, getContext, getSize, resize: resizeCanvas } = useCanvas();
  const { playExhale, stopExhale, playInhale, playLevelComplete, initAudio } = useAudio();

  const handleInhalePhaseStart = useCallback(
    (halfCycleDurationSeconds: number) => {
      stopExhale();
      playInhale(halfCycleDurationSeconds);
    },
    [stopExhale, playInhale]
  );
  const { isConnected, lastRRReceivedAt } = useBluetooth();
  const { drawBackground, updateBackground, resizeBackground } = useBackgroundLayers();
  const breathingContext = useContext(BreathingPhaseContext);
  const {
    drawPlayer,
    updatePosition,
    resize: resizePlayer,
    reset: resetPlayer,
    getHasArrived,
    getPlayerX,
    getBreathPhase
  } = usePlayer({
    onExhalePhaseStart: playExhale,
    onInhalePhaseStart: handleInhalePhaseStart
  });
  const {
    updateCompanions,
    drawCompanions,
    resize: resizeCompanions,
    reset: resetCompanions,
    getCompanionPeakHud,
    getCompanionConcurrentHud
  } = useCompanions();
  const { autoSpawnParticles, updateParticles, drawParticles, reset: resetParticles } = useParticles();
  const {
    updateExplorationPlayer,
    drawExplorationPlayer,
    getCameraOffset: getExplorationCamera,
    resize: resizeExplorationPlayer,
    reset: resetExplorationPlayer,
    setMapApi: setExplorationMapApi,
    getExplorationFootPosition
  } = useExplorationPlayer();
  const { getMovementVector, setInputEnabled } = useInput();
  const { isIntroActive, setPathDirections: publishPathDirections } = useContext(ExplorationIntroContext);
  const loopRef = useRef<ReturnType<typeof createGameLoop> | null>(null);
  const stateRef = useRef<GameEngineState | null>(null);
  const previousStateRef = useRef<GameState | null>(null);
  const ratioRef = useRef<number>(1);
  const scoreTimerRef = useRef<number>(0);
  const hasPlayedClearSoundRef = useRef(false);
  const hasExportedDataRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const lastSubmitAttemptAtRef = useRef(0);
  const exportAttemptCountRef = useRef(0);
  const isConnectedRef = useRef(false);
  const lastRRReceivedAtRef = useRef<number | null>(null);
  const sensorDisconnectedDuringSessionRef = useRef(false);
  const signalLossAccumMsRef = useRef(0);
  const prevConnectedRef = useRef<boolean | null>(null);

  const gameLoopDepsRef = useRef<Record<string, unknown> | null>(null);
  const SUBMIT_RETRY_COOLDOWN_MS = 5000;

  const {
    state,
    getCompanionScheduleElapsedMs,
    setPlayerArrived,
    setPlayerHasLeftScreen,
    getCompanionEntryDelays,
    getCyclesPerMinute,
    getBreathingPattern,
    getSessionPlayElapsedMs,
    getSessionLimit,
    updateScore,
    applyPersistentSensorSignalLoss,
    reportCompanionHudPeak,
    reportCompanionHudConcurrent,
    getSessionDifficulty,
    tickStaticPhase,
    enterExploration,
    completeExplorationWin,
    getEngineState
  } = useGameEngine();

  // Dificuldade ativa para o gerador de mapa. Atualizada ao entrar em calibração/playing.
  // O token força regeneração mesmo quando a dificuldade não muda entre sessões consecutivas.
  const [explorationDifficulty, setExplorationDifficulty] = useState<MenuDifficultyId>('medium');
  const [mapRegenerationToken, setMapRegenerationToken] = useState(0);
  const explorationUsesGenerator = EXPLORATION_MAP_GENERATION_CONFIG.USE_GENERATOR[explorationDifficulty];
  const activeMapUrl = `${EXPLORATION_ACTIVE_MAP_URL}${
    explorationUsesGenerator ? `#gen=${mapRegenerationToken}` : ''
  }`;

  const { isReady: isMapReady, drawTileMap, getMapApi, getMap, getPathDirections } = useWorldMap(
    activeMapUrl,
    explorationDifficulty
  );
  const currentMap = isMapReady ? getMap() : null;
  const { isFogReady, isFogClearAt, drawFog, updateFog, updateFogAnimations, resetFog } = useFogLayer(
    FOG_ENABLED,
    EXPLORATION_FOG_CONFIG.MAP_URL,
    currentMap
  );
  const { drawChest: drawChestLayer, tryCollectChest, resetChest } = useExplorationChest(currentMap);

  const handleStaticInhale = useCallback(
    (durationSeconds: number) => {
      stopExhale();
      playInhale(durationSeconds);
    },
    [stopExhale, playInhale]
  );
  const handleStaticExhale = useCallback(
    (durationSeconds: number) => {
      playExhale(durationSeconds);
    },
    [playExhale]
  );
  const {
    isStaticBreathingReady,
    updateStaticBreathing,
    drawStaticBreathing,
    resetStaticBreathing,
    startFadeOut: startStaticFadeOut,
    startFadeIn: startStaticFadeIn,
    finishTransition: finishStaticTransition,
    advanceTransitionTimer: advanceStaticTransition,
    getTransitionStatus: getStaticTransitionStatus,
    drawTransition: drawStaticTransition
  } = useStaticBreathing({ onInhale: handleStaticInhale, onExhale: handleStaticExhale });

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    lastRRReceivedAtRef.current = lastRRReceivedAt;
  }, [lastRRReceivedAt]);

  useEffect(() => {
    stateRef.current = state;
    if (state?.currentState !== 'playing' && state?.currentState !== 'gameOver') {
      hasPlayedClearSoundRef.current = false;
      hasExportedDataRef.current = false;
      isSubmittingRef.current = false;
      lastSubmitAttemptAtRef.current = 0;
      exportAttemptCountRef.current = 0;
      scoreTimerRef.current = 0;
      sensorDisconnectedDuringSessionRef.current = false;
      signalLossAccumMsRef.current = 0;
      prevConnectedRef.current = null;
    }
  }, [state]);

  useEffect(() => {
    const current = state?.currentState ?? null;
    const prev = previousStateRef.current;
    const fromMenuOrOverOrWelcome = prev === 'mainMenu' || prev === 'gameOver' || prev === 'welcome';
    const isStartingNewGame = current === 'restarting' || ((current === 'calibration' || current === 'playing') && fromMenuOrOverOrWelcome);
    if (isStartingNewGame) {
      resetSessionExportGate();
      resetPlayer();
      resetCompanions();
      resetParticles();
      resetExplorationPlayer();
      resetFog();
      resetChest();
      resetStaticBreathing();
      const nextDifficulty = getSessionDifficulty();
      setExplorationDifficulty(nextDifficulty);
      if (EXPLORATION_MAP_GENERATION_CONFIG.USE_GENERATOR[nextDifficulty]) {
        setMapRegenerationToken((n) => n + 1);
      }
    }
    previousStateRef.current = current;
  }, [
    state?.currentState,
    resetPlayer,
    resetCompanions,
    resetParticles,
    resetExplorationPlayer,
    resetFog,
    resetChest,
    resetStaticBreathing,
    getSessionDifficulty
  ]);

  useEffect(() => {
    initAudio();
  }, [initAudio]);

  useEffect(() => {
    if (!isMapReady) return;
    const api = getMapApi();
    if (!api) return;
    setExplorationMapApi(api);
    publishPathDirections(getPathDirections());
    if (state?.gameplayMode === 'exploration') {
      resetExplorationPlayer();
      resetFog();
      resetChest();
    }
  }, [
    isMapReady,
    state?.gameplayMode,
    getMapApi,
    getPathDirections,
    publishPathDirections,
    setExplorationMapApi,
    resetExplorationPlayer,
    resetFog,
    resetChest
  ]);

  useEffect(() => {
    gameLoopDepsRef.current = {
      getContext,
      getSize,
      drawBackground,
      updateBackground,
      updatePosition,
      drawPlayer,
      updateCompanions,
      drawCompanions,
      autoSpawnParticles,
      updateParticles,
      drawParticles,
      getCompanionScheduleElapsedMs,
      setPlayerArrived,
      setPlayerHasLeftScreen,
      getCompanionEntryDelays,
      getCyclesPerMinute,
      getBreathingPattern,
      getSessionPlayElapsedMs,
      getSessionLimit,
      getEngineState,
      getHasArrived,
      getPlayerX,
      getBreathPhase,
      setBreathPhase: breathingContext?.setBreathPhase,
      updateScore,
      playLevelComplete,
      getCompanionPeakHud,
      getCompanionConcurrentHud,
      reportCompanionHudPeak,
      reportCompanionHudConcurrent,
      applyPersistentSensorSignalLoss,
      getSessionDifficulty,
      tickStaticPhase,
      getMovementVector,
      updateExplorationPlayer,
      drawExplorationPlayer,
      getExplorationCamera,
      setInputEnabled,
      drawTileMap,
      isMapReady,
      drawFog,
      isFogReady,
      isFogClearAt,
      getExplorationMap: getMap,
      updateFog,
      updateFogAnimations,
      getExplorationFootPosition,
      drawChestLayer,
      tryCollectChest,
      completeExplorationWin,
      isStaticBreathingReady,
      updateStaticBreathing,
      drawStaticBreathing,
      startStaticFadeOut,
      startStaticFadeIn,
      finishStaticTransition,
      advanceStaticTransition,
      getStaticTransitionStatus,
      drawStaticTransition,
      enterExploration,
      isIntroActive
    };
  });

  useEffect(() => {
    const handleResize = () => {
      resizeCanvas();
      const { width, height } = getSize();
      const baseHeight = GAME_CONFIG.BASE_HEIGHT;
      ratioRef.current = height / baseHeight;
      const ratio = ratioRef.current;

      if (LEGACY_OCEAN_ENABLED) {
        resizeBackground(width, height, ratio);
        resizePlayer(width, height, ratio);
        resizeCompanions(width, height, ratio);
      }
      if (TOPDOWN_ENABLED) {
        resizeExplorationPlayer(ratio);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getSize, resizeCanvas, resizeBackground, resizePlayer, resizeCompanions, resizeExplorationPlayer]);

  useEffect(() => {
    if (!loopRef.current) {
      loopRef.current = createGameLoop();
    }

    const loop = loopRef.current;

    const unsubscribe = loop.onUpdate((deltaTime: number) => {
      const deps = gameLoopDepsRef.current;
      if (!deps) return;

      const ctx = (deps.getContext as () => CanvasRenderingContext2D | null)();
      const currentState = stateRef.current;
      if (!ctx || !currentState) return;

      const { width, height } = (deps.getSize as () => { width: number; height: number })();
      const ratio = ratioRef.current;
      const cpm = (deps.getCyclesPerMinute as () => number)();
      const gameSpeed = GAME_CONFIG.BACKGROUND_SPEED * ratio;
      const isGameOver = currentState.isGameOver;
      const isPaused = currentState.isPaused;
      const isExitingAfterGameOver = isGameOver && !currentState.playerHasLeftScreen;
      const isActive =
        currentState.currentState === 'playing' ||
        currentState.currentState === 'paused' ||
        currentState.currentState === 'gameOver' ||
        currentState.currentState === 'restarting';

      const isTopdownExplorationPlaying =
        TOPDOWN_ENABLED && currentState.gameplayMode === 'exploration' && currentState.currentState === 'playing';
      const isExplorationWinFreeze =
        TOPDOWN_ENABLED &&
        currentState.gameplayMode === 'exploration' &&
        currentState.currentState === 'gameOver' &&
        currentState.sessionCompleted === true;
      const shouldDrawExplorationWorld = isTopdownExplorationPlaying || isExplorationWinFreeze;
      const isTopdownExploration = isTopdownExplorationPlaying;
      const isTopdownExplorationSession =
        TOPDOWN_ENABLED && currentState.gameplayMode === 'exploration';
      const isTopdownStaticBreathing =
        TOPDOWN_ENABLED &&
        currentState.gameplayMode === 'static' &&
        currentState.currentState === 'playing' &&
        currentState.sessionStarted;

      ctx.clearRect(0, 0, width, height);

      const isWelcome = currentState.currentState === 'welcome';

      if (shouldDrawExplorationWorld) {
        const camera = (deps.getExplorationCamera as (w: number, h: number) => { x: number; y: number })(width, height);
        if (deps.isMapReady as boolean) {
          (deps.drawTileMap as (c: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) => void)(
            ctx,
            camera.x,
            camera.y,
            width,
            height
          );
        } else {
          ctx.fillStyle = EXPLORATION_FALLBACK_FLOOR_COLOR;
          ctx.fillRect(0, 0, width, height);
        }
      } else if (isTopdownStaticBreathing) {
        (deps.drawStaticBreathing as (c: CanvasRenderingContext2D, v: { width: number; height: number }) => void)(
          ctx,
          { width, height }
        );
      } else if (LEGACY_OCEAN_ENABLED) {
        if ((isActive || isWelcome) && !isPaused && (!isGameOver || isExitingAfterGameOver)) {
          (deps.updateBackground as (speed: number, dt: number) => void)(gameSpeed, deltaTime);
        }
        (deps.drawBackground as (c: CanvasRenderingContext2D) => void)(ctx);
      } else {
        ctx.fillStyle = EXPLORATION_FALLBACK_FLOOR_COLOR;
        ctx.fillRect(0, 0, width, height);
      }

      if (isWelcome || currentState.currentState === 'mainMenu' || currentState.currentState === 'calibration') {
        (deps.setInputEnabled as (enabled: boolean) => void)(false);
        return;
      }

      if (!isActive) {
        (deps.setInputEnabled as (enabled: boolean) => void)(false);
        return;
      }

      const vfcState = getVFCState();
      const rmssdTier = vfcState.rmssdTier;
      const effectiveRmssdTier: RmssdTier = currentState.sessionStarted ? rmssdTier : 0;
      const isBaselineReady = vfcState.isBaselineReady;
      const rmssd = vfcState.rmssd;
      const connected = isConnectedRef.current;
      const hasRecentRR = isRecentRrReceived(lastRRReceivedAtRef.current, Date.now());
      const effectiveSensorSession = currentState.sessionWithSensor === true && !currentState.sessionSignalLossPersistent;
      const isSensorNoSignal = effectiveSensorSession && connected && !hasRecentRR;
      const connectedForCompanionRules = effectiveSensorSession && connected;

      const isDuringMatchPlay = currentState.currentState === 'playing' && !isPaused && !isGameOver;

      const introActive = (deps.isIntroActive as boolean) ?? false;
      (deps.setInputEnabled as (enabled: boolean) => void)(isTopdownExploration && !isPaused && !introActive);

      if (
        isDuringMatchPlay &&
        currentState.sessionStarted &&
        currentState.gameplayMode === 'static' &&
        !isPaused
      ) {
        // 1. Anima a respiração + dispara SFX inhale/exhale nas trocas.
        const sessionMs = (deps.getSessionPlayElapsedMs as () => number)();
        const pattern = (deps.getBreathingPattern as () => 'continuous' | 'intervals')();
        (
          deps.updateStaticBreathing as (
            dt: number,
            sessionElapsedMs: number,
            cpm: number,
            pattern: 'continuous' | 'intervals'
          ) => void
        )(deltaTime, sessionMs, cpm, pattern);

        // 2. Atualiza o relógio da fase estática + checa se já pode liberar exploração.
        const canUnlock = (deps.tickStaticPhase as (dt: number, tier: RmssdTier) => boolean)(
          deltaTime,
          effectiveRmssdTier
        );

        // 3. No frame em que `canUnlock` vira true (e a transição ainda está parada),
        //    começa o fade-out preto. O swap real para exploração acontece no fim do fade-out.
        const transitionStatus = (deps.getStaticTransitionStatus as () => 'idle' | 'fadeOut' | 'fadeIn')();
        if (canUnlock && transitionStatus === 'idle') {
          (deps.startStaticFadeOut as () => void)();
        }
      }

      if (isDuringMatchPlay && effectiveSensorSession && connected && !hasRecentRR) {
        signalLossAccumMsRef.current += deltaTime;
      } else {
        signalLossAccumMsRef.current = 0;
      }

      if (
        isDuringMatchPlay &&
        signalLossAccumMsRef.current >= SENSOR_SESSION_CONFIG.NO_SIGNAL_TO_DISCONNECT_MS &&
        effectiveSensorSession &&
        connected
      ) {
        (deps.applyPersistentSensorSignalLoss as () => void)();
        sensorDisconnectedDuringSessionRef.current = true;
        signalLossAccumMsRef.current = 0;
      }

      const shouldAccumulateScore = !isPaused && !isGameOver && (!effectiveSensorSession || !connected || (connected && hasRecentRR));

      if (currentState.sessionWithSensor && prevConnectedRef.current === true && !connected) {
        sensorDisconnectedDuringSessionRef.current = true;
      }
      prevConnectedRef.current = connected;

      if (LEGACY_OCEAN_ENABLED && isGameOver && (deps.getPlayerX as () => number)() > width + 100) {
        if (!hasPlayedClearSoundRef.current) {
          (deps.playLevelComplete as () => void)();
          hasPlayedClearSoundRef.current = true;
        }
        if (!hasExportedDataRef.current) {
          trySubmitSessionExport(deps, cpm, sensorDisconnectedDuringSessionRef.current, {
            hasExported: hasExportedDataRef,
            isSubmitting: isSubmittingRef,
            lastAttemptAt: lastSubmitAttemptAtRef,
            attemptCount: exportAttemptCountRef,
            cooldownMs: SUBMIT_RETRY_COOLDOWN_MS
          });
        }
        (deps.setPlayerHasLeftScreen as () => void)();
      }

      if (isTopdownExplorationSession && isGameOver && !hasExportedDataRef.current) {
        trySubmitSessionExport(deps, cpm, sensorDisconnectedDuringSessionRef.current, {
          hasExported: hasExportedDataRef,
          isSubmitting: isSubmittingRef,
          lastAttemptAt: lastSubmitAttemptAtRef,
          attemptCount: exportAttemptCountRef,
          cooldownMs: SUBMIT_RETRY_COOLDOWN_MS
        });
        if (!currentState.playerHasLeftScreen) {
          (deps.setPlayerHasLeftScreen as () => void)();
        }
      }

      const companionScheduleElapsedMs = (deps.getCompanionScheduleElapsedMs as () => number)();
      const companionDelays = (deps.getCompanionEntryDelays as () => number[])();
      const sessionDifficulty = (deps.getSessionDifficulty as () => MenuDifficultyId)();
      const calibrationSnap = getCalibrationRmssdBaseline();
      const useTierRetain =
        effectiveSensorSession && connectedForCompanionRules ? shouldUseTierForCompanionRetention(sessionDifficulty) : true;
      const globalRetain =
        effectiveSensorSession && connectedForCompanionRules
          ? getGlobalRetainBiofeedbackOk(sessionDifficulty, rmssd, calibrationSnap)
          : true;

      const shouldDriveCompanionHud =
        !isPaused && (LEGACY_OCEAN_ENABLED || isTopdownStaticBreathing || isTopdownExploration);

      if (shouldDriveCompanionHud) {
        (
          deps.updateCompanions as (
            dt: number,
            rmssdTier: RmssdTier,
            timer: number,
            h: number,
            r: number,
            connected: boolean,
            baseline: boolean,
            gameOver: boolean,
            cpm: number,
            delays: number[],
            sensorNoSignal: boolean,
            useTierRetain: boolean,
            globalRetain: boolean
          ) => void
        )(
          deltaTime,
          effectiveRmssdTier,
          companionScheduleElapsedMs,
          height,
          ratio,
          connectedForCompanionRules,
          isBaselineReady,
          isGameOver,
          cpm,
          companionDelays,
          isSensorNoSignal,
          useTierRetain,
          globalRetain
        );
        (deps.reportCompanionHudConcurrent as (n: number) => void)((deps.getCompanionConcurrentHud as () => number)());
        (deps.reportCompanionHudPeak as (n: number) => void)((deps.getCompanionPeakHud as () => number)());
      }

      if (!isPaused) {
        if (shouldAccumulateScore) {
          scoreTimerRef.current += deltaTime;
          if (scoreTimerRef.current >= TIMING.SCORE_UPDATE_INTERVAL) {
            scoreTimerRef.current -= TIMING.SCORE_UPDATE_INTERVAL;
            const passiveIndicators = effectiveSensorSession ? undefined : (deps.getCompanionConcurrentHud as () => number)();
            (deps.updateScore as (rmssd: number, passiveActiveIndicators?: number, bleConnected?: boolean) => void)(
              rmssd,
              passiveIndicators,
              connected
            );
          }
        }

        if (isTopdownExploration) {
          if (deps.isFogReady as boolean) {
            (deps.updateFogAnimations as (dt: number) => void)(deltaTime);
          }

          const input = (deps.getMovementVector as () => { x: number; y: number })();
          (deps.updateExplorationPlayer as (dt: number, input: { x: number; y: number }, paused: boolean) => void)(
            deltaTime,
            input,
            isPaused
          );

          const foot = (deps.getExplorationFootPosition as () => { worldX: number; worldY: number; halfH: number } | null)();
          if (foot) {
            if (deps.isFogReady as boolean) {
              (deps.updateFog as (x: number, y: number, h: number) => void)(foot.worldX, foot.worldY, foot.halfH);
            }
            if (
              (deps.tryCollectChest as (x: number, y: number, h: number) => boolean)(foot.worldX, foot.worldY, foot.halfH)
            ) {
              (deps.completeExplorationWin as () => void)();
            }
          }
        } else if (LEGACY_OCEAN_ENABLED) {
          const pattern = (deps.getBreathingPattern as () => 'continuous' | 'intervals')();
          const breathCtx =
            pattern === 'intervals' ? { pattern, sessionElapsedMs: (deps.getSessionPlayElapsedMs as () => number)() } : undefined;
          (
            deps.updatePosition as (
              dt: number,
              cpm: number,
              go: boolean,
              paused: boolean,
              ctx?: { pattern: 'continuous' | 'intervals'; sessionElapsedMs: number }
            ) => void
          )(deltaTime, cpm, isGameOver, isPaused, breathCtx);

          const setBreathPhase = deps.setBreathPhase as ((phase: number) => void) | undefined;
          if (setBreathPhase) {
            const phase = (deps.getBreathPhase as () => number)();
            setBreathPhase(phase);
          }

          if ((deps.getHasArrived as () => boolean)()) {
            (deps.setPlayerArrived as () => void)();
          }
        } else if (currentState.sessionStarted === false) {
          (deps.setPlayerArrived as () => void)();
        }
      }

      if (LEGACY_OCEAN_ENABLED) {
        (deps.drawCompanions as (c: CanvasRenderingContext2D) => void)(ctx);
        (deps.drawPlayer as (c: CanvasRenderingContext2D, w: number, h: number, r: number, go: boolean, paused: boolean) => void)(
          ctx,
          width,
          height,
          ratio,
          isGameOver,
          isPaused
        );

        if (!isPaused && (!isGameOver || isExitingAfterGameOver)) {
          (deps.autoSpawnParticles as (dt: number, w: number, h: number, r: number) => void)(deltaTime, width, height, ratio);
          (deps.updateParticles as () => void)();
        }
        (deps.drawParticles as (c: CanvasRenderingContext2D, r: number) => void)(ctx, ratio);
      }

      if (shouldDrawExplorationWorld) {
        (deps.drawExplorationPlayer as (c: CanvasRenderingContext2D, w: number, h: number) => void)(ctx, width, height);
        const camera = (deps.getExplorationCamera as (w: number, h: number) => { x: number; y: number })(
          width,
          height
        );
        if (FOG_ENABLED) {
          if (deps.isFogReady as boolean) {
            (deps.drawFog as (c: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) => void)(
              ctx,
              camera.x,
              camera.y,
              width,
              height
            );
          } else if (deps.isMapReady as boolean) {
            drawFogViewportPlaceholder(ctx, width, height);
          }
        }
        if (deps.isMapReady as boolean) {
          const map = (deps.getExplorationMap as () => ReturnType<typeof getMap>)();
          const chestCol = map?.chestCol;
          const chestRow = map?.chestRow;
          const chestVisible =
            !isExplorationWinFreeze &&
            chestCol !== undefined &&
            chestRow !== undefined &&
            (deps.isFogClearAt as (col: number, row: number) => boolean)(chestCol, chestRow);
          if (chestVisible) {
            (deps.drawChestLayer as (c: CanvasRenderingContext2D, cx: number, cy: number) => void)(
              ctx,
              camera.x,
              camera.y
            );
          }
        }
      }

      // Transição (fade preto) entre cena estática e exploração — desenhada por cima de tudo.
      const staticTransitionStatus = (deps.getStaticTransitionStatus as () => 'idle' | 'fadeOut' | 'fadeIn')();
      if (staticTransitionStatus !== 'idle') {
        const finished = (deps.advanceStaticTransition as (dt: number) => boolean)(deltaTime);
        if (finished) {
          if (staticTransitionStatus === 'fadeOut') {
            // Fim do fade-out: faz o swap para exploração e inicia o fade-in.
            (deps.enterExploration as () => void)();
            (deps.startStaticFadeIn as () => void)();
          } else {
            (deps.finishStaticTransition as () => void)();
          }
        }
        (deps.drawStaticTransition as (c: CanvasRenderingContext2D, v: { width: number; height: number }) => void)(
          ctx,
          { width, height }
        );
      }
    });

    loop.start();

    return () => {
      unsubscribe();
      loop.stop();
    };
  }, []);

  return (
    <GameCanvasContainer ref={containerRef}>
      <GameCanvasElement ref={canvasRef} />
    </GameCanvasContainer>
  );
}
