import CalibrationScreen from '../CalibrationScreen';
import MainMenu from '../MainMenu';
import PauseMenu from '../PauseMenu';
import SensorInfoMenu from '../SensorInfoMenu';
import StatusBar from '../StatusBar';
import TopBar from '../TopBar';
import WelcomeScreen from '../WelcomeScreen';
import BreathingGuideBar from './BreathingGuideBar';
import ExplorationIntro from './ExplorationIntro';
import ExplorationModeBadge from './ExplorationModeBadge';
import ExplorationPrepBanner from './ExplorationPrepBanner';
import ExplorationWinOverlay from './ExplorationWinOverlay';
import GameCanvas from './gameCanvas';
import GameOver from './GameOver';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ExplorationIntroProvider } from '../../contexts/ExplorationIntroProvider';
import { ExplorationIntroContext } from '../../contexts/explorationIntroContext';
import { useSession } from '../../contexts/sessionContext';
import { useAudio } from '../../hooks/useAudio';
import { useBluetooth } from '../../hooks/useBluetooth';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useOrientation } from '../../hooks/useOrientation';
import { useVFC } from '../../hooks/useVFC';
import { parsePortalHostCommand } from '../../services/portalBridge';
import { setVFCMetricsPausedForSensorNoSignal } from '../../services/vfc';
import type { SensorHudConnection } from '../../types';
import { isRecentRrReceived } from '../../utils/sensorSignal';
import { GameContainer } from './styles';

/**
 * Detecta o instante em que a fase de exploração começa (toda partida nova) e
 * dispara o overlay `ExplorationIntro`. Consome `pathDirections` do context
 * (publicado pelo `gameCanvas` quando o `useWorldMap` carrega).
 *
 * `shouldStart` vira `true` no edge `static → exploration` e volta para `false`
 * quando o overlay sinaliza `done` — garante que a próxima partida também dispara.
 */
function ExplorationIntroOrchestrator() {
  const { state } = useGameEngine();
  const { pathDirections } = useContext(ExplorationIntroContext);
  const [shouldStart, setShouldStart] = useState(false);
  const prevGameplayModeRef = useRef<string | null>(null);

  useEffect(() => {
    const current = state.gameplayMode;
    const prev = prevGameplayModeRef.current;
    if (prev !== current && current === 'exploration' && state.sessionStarted) {
      setShouldStart(true);
    }
    if (current !== 'exploration') {
      setShouldStart(false);
    }
    prevGameplayModeRef.current = current;
  }, [state.gameplayMode, state.sessionStarted]);

  const handleFinished = useCallback(() => {
    setShouldStart(false);
  }, []);

  return (
    <ExplorationIntro
      shouldStart={shouldStart}
      pathDirections={pathDirections}
      onFinished={handleFinished}
    />
  );
}

function GameInner() {
  const { sessionError } = useSession();
  const {
    state,
    goToCalibration,
    pauseGame,
    resumeGame,
    getCyclesPerMinute,
    getSessionDifficulty,
    getSessionLimit
  } = useGameEngine();
  const { heartRate, isConnected, lastRRReceivedAt, sensorContactStatus } = useBluetooth();
  const [sensorMenuOpen, setSensorMenuOpen] = useState(false);
  const { rmssd, isBaselineReady, baseline } = useVFC();
  const { toggleMusic, toggleSFX, getMusicVolume, getSFXVolume, startMusic } = useAudio();
  const [, forceUpdate] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [nowMs, setNowMs] = useState(() => Date.now());
  const isPortrait = useOrientation();
  const hasRecentRR = isRecentRrReceived(lastRRReceivedAt, nowMs);
  const calibrationSensorHasData =
    isConnected && sensorContactStatus !== 'not-detected' && heartRate != null && heartRate > 0 && hasRecentRR;
  const isCalibrationStalled = state.currentState === 'calibration' && isConnected && !isBaselineReady && !calibrationSensorHasData;
  const isSensorNoSignalRelevantPhase =
    state.currentState === 'playing' ||
    state.currentState === 'restarting' ||
    state.currentState === 'paused' ||
    state.currentState === 'gameOver';
  const isSensorNoSignal =
    state.sessionWithSensor === true && !state.sessionSignalLossPersistent && isConnected && !hasRecentRR && isSensorNoSignalRelevantPhase;

  const sensorHudConnection: SensorHudConnection = (() => {
    if (!isConnected) {
      return 'disconnected';
    }
    if (state.sessionSignalLossPersistent) {
      return 'persistent-no-signal';
    }
    if (!state.sessionWithSensor) {
      return 'disconnected';
    }
    if (hasRecentRR) {
      return 'connected';
    }
    return 'no-signal';
  })();

  const showRmssdReadout = state.sessionStarted && isConnected && (state.sessionSignalLossPersistent || hasRecentRR || isSensorNoSignal);

  const sessionDifficulty = getSessionDifficulty();
  const baselineReadoutLabel =
    state.sessionWithSensor === true &&
    !state.sessionSignalLossPersistent &&
    (sessionDifficulty === 'easy' || sessionDifficulty === 'medium')
      ? 'CALIBRAÇÃO'
      : 'LIMIAR';

  const baselineStatus =
    state.sessionStarted && baseline != null && (state.sessionSignalLossPersistent || (isConnected && isBaselineReady) || isSensorNoSignal)
      ? `${baselineReadoutLabel}: ${Math.floor(baseline)}`
      : '';

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const handleHostMessage = (event: MessageEvent) => {
      const command = parsePortalHostCommand(event.data);
      if (!command || command.action !== 'restart_calibration') {
        return;
      }

      if (!state.sessionWithSensor) {
        return;
      }

      if (
        state.currentState === 'welcome' ||
        state.currentState === 'mainMenu' ||
        state.currentState === 'calibration'
      ) {
        return;
      }

      setSensorMenuOpen(false);
      goToCalibration();
    };

    window.addEventListener('message', handleHostMessage);
    return () => window.removeEventListener('message', handleHostMessage);
  }, [goToCalibration, state.currentState, state.sessionWithSensor]);

  useEffect(() => {
    const freezeMetrics = isSensorNoSignal || state.sessionSignalLossPersistent === true || isCalibrationStalled;
    setVFCMetricsPausedForSensorNoSignal(freezeMetrics);
    return () => setVFCMetricsPausedForSensorNoSignal(false);
  }, [isSensorNoSignal, state.sessionSignalLossPersistent, isCalibrationStalled]);

  const musicOn = getMusicVolume() > 0;
  const sfxOn = getSFXVolume() > 0;
  const activeCompanionHudCount = state.sessionStarted ? (state.companionHudConcurrentActive ?? 0) : 0;

  useEffect(() => {
    if (state.currentState === 'playing') {
      startMusic();
    }
  }, [state.currentState, startMusic]);

  useEffect(() => {
    if (state.currentState === 'playing') {
      if (isPortrait && !state.isPaused) {
        pauseGame();
      } else if (!isPortrait && state.isPaused) {
        resumeGame();
      }
    }
  }, [isPortrait, state.currentState, state.isPaused, pauseGame, resumeGame]);

  const totalSeconds = Math.ceil(state.timeRemaining);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <GameContainer>
      <GameCanvas />

      {!sessionError && <WelcomeScreen />}
      <MainMenu />
      <CalibrationScreen />

      <PauseMenu />
      <SensorInfoMenu isOpen={sensorMenuOpen} onClose={() => setSensorMenuOpen(false)} />
      <ExplorationWinOverlay />
      {state.currentState === 'gameOver' &&
        state.playerHasLeftScreen &&
        state.gameplayMode !== 'exploration' && (
          <GameOver finalScore={state.score} sessionTime={state.elapsedTime / 1000} sessionCompleted={state.sessionCompleted} />
        )}

      {(state.currentState === 'playing' || state.currentState === 'restarting') && (
        <>
          <TopBar
            time={timeStr}
            score={state.sessionStarted ? state.score : 0}
            onPause={pauseGame}
            onFullscreen={toggleFullscreen}
            onToggleMusic={() => {
              toggleMusic();
              forceUpdate((n) => n + 1);
            }}
            onToggleSFX={() => {
              toggleSFX();
              forceUpdate((n) => n + 1);
            }}
            onSensorClick={() => setSensorMenuOpen(true)}
            isMusicOn={musicOn}
            isSFXOn={sfxOn}
            isFullscreen={isFullscreen}
          />
          <StatusBar
            activeCompanionHudCount={activeCompanionHudCount}
            displayValue={showRmssdReadout ? rmssd : 0}
            cyclesPerMinute={getCyclesPerMinute()}
            baselineStatus={baselineStatus}
            sensorHudConnection={sensorHudConnection}
          />
          <ExplorationPrepBanner
            progress01={state.explorationUnlockProgress01}
            gameplayMode={state.gameplayMode}
            sessionStarted={state.sessionStarted}
            sessionWithSensor={state.sessionWithSensor === true}
            sessionSignalLossPersistent={state.sessionSignalLossPersistent === true}
            staticDurationSeconds={getSessionLimit()}
          />
          <ExplorationModeBadge gameplayMode={state.gameplayMode} sessionStarted={state.sessionStarted} />
          <BreathingGuideBar gameplayMode={state.gameplayMode} sessionStarted={state.sessionStarted} />
          <ExplorationIntroOrchestrator />
        </>
      )}
    </GameContainer>
  );
}

export default function Game() {
  return (
    <ExplorationIntroProvider>
      <GameInner />
    </ExplorationIntroProvider>
  );
}

export { default as GameCanvas } from './gameCanvas';
