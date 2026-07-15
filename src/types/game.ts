import type { MenuDifficultyId } from '../utils/constants';
import type { RmssdTier } from './vfc';

export type GameState = 'welcome' | 'mainMenu' | 'playing' | 'paused' | 'gameOver' | 'restarting';

export type GameplayMode = 'static' | 'exploration';

export interface GameEngineState {
  currentState: GameState;
  isPaused: boolean;
  isGameOver: boolean;
  elapsedTime: number;
  timeRemaining: number;
  score: number;
  sessionCompleted: boolean;
  playerHasLeftScreen: boolean;
  sessionStarted: boolean;
  sessionWithSensor?: boolean;
  sessionSignalLossPersistent?: boolean;
  gameplayMode: GameplayMode;
  explorationUnlocked: boolean;
  staticPhaseElapsedMs: number;
  explorationUnlockProgress01: number;

  companionHudPeakConcurrent?: number;

  companionHudConcurrentActive?: number;
}

export interface GameEngineContextValue {
  state: GameEngineState;
  startGame: (isConnected?: boolean, difficulty?: MenuDifficultyId, keepPlaytestPending?: boolean) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  quitSession: () => void;
  restartGame: () => void;
  goToMainMenu: () => void;
  goToWelcome: () => void;
  addScore: (points: number) => void;
  updateTimer: (deltaTime: number) => void;
  isPlaying: () => boolean;
  getSessionLimit: () => number;
  setSessionLimit: (seconds: number) => void;
  getCyclesPerMinute: () => number;
  setCyclesPerMinute: (cpm: number) => void;
  getBreathingPattern: () => BreathingPatternId;
  setBreathingPattern: (pattern: BreathingPatternId) => void;
  getSessionPlayElapsedMs: () => number;
  getCompanionScheduleElapsedMs: () => number;
  setPlayerArrived: () => void;
  setPlayerHasLeftScreen: () => void;
  getCompanionEntryDelays: () => number[];
  updateScore: (rmssd: number, passiveActiveIndicators?: number, bleConnected?: boolean) => void;
  applyPersistentSensorSignalLoss: () => void;
  reportCompanionHudPeak: (concurrentHudActiveCount: number) => void;
  reportCompanionHudConcurrent: (concurrentHudActiveCount: number) => void;
  getSessionDifficulty: () => MenuDifficultyId;
  getGameplayMode: () => GameplayMode;
  /** Avança a fase estática; devolve `true` no frame em que a exploração já pode ser liberada. */
  tickStaticPhase: (deltaTimeMs: number, rmssdTier: RmssdTier) => boolean;
  enterExploration: () => void;
  unlockExplorationManually: () => void;
  completeExplorationWin: () => void;
  getEngineState: () => GameEngineState;
}

export interface GameConfig {
  sessionLimit: number;
  cyclesPerMinute: number;
  baseHeight: number;
  speed: number;
}

export interface GameData {
  score: number;
  timer: number;
  elapsedTime: number;
  sessionCompleted: boolean;
  hasPlayedClearSound: boolean;
  hasExportedData: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Player extends Position, Size {
  targetX: number;
  horizontalPosition: number;
  hasArrived: boolean;
  speed: number;
}

export interface Companion extends Position, Size {
  id: string;
  entryDelay: number;
  requiredIndicators: number;
  isVisible: boolean;
  speed: number;
}

export interface Particle extends Position, Size {
  speedY: number;
  angle: number;
  va: number;
  curve: number;
  markedForDeletion: boolean;
}

export interface Background {
  image: HTMLImageElement;
  speed: number;
  x: number;
  y: number;
}

export type IntervalBreathPhase = 'top' | 'down' | 'bottom' | 'up';

export type BreathingPatternId = 'continuous' | 'intervals';

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  targetX: number;
  hasArrived: boolean;
  angle: number;
  spriteAngle: number;
  frameY: number;
  rotation: number;
  lastDirection: string;
  isRising: boolean;
  intervalPhase: IntervalBreathPhase | null;
}

export interface BreathEffectState {
  image: HTMLImageElement | null;
  frameCount: number;
  frameSize: number;
  frame: number;
  timer: number;
}

export interface BreathEffectsCollection {
  inhale: BreathEffectState;
  exhale: BreathEffectState;
}

export interface UsePlayerOptions {
  onExhalePhaseStart?: (halfCycleDurationSeconds: number) => void;
  onInhalePhaseStart?: (halfCycleDurationSeconds: number) => void;
}

export interface PlayerBreathContext {
  pattern: BreathingPatternId;
  sessionElapsedMs: number;
}

export interface UsePlayerResult {
  updatePosition: (deltaTime: number, cpm: number, isGameOver: boolean, isPaused: boolean, breathCtx?: PlayerBreathContext) => void;
  drawPlayer: (ctx: CanvasRenderingContext2D, width: number, height: number, ratio: number, isGameOver: boolean, isPaused: boolean) => void;
  resize: (width: number, height: number, ratio: number) => void;
  reset: () => void;
  getIsRising: () => boolean;
  getHasArrived: () => boolean;
  getPlayerX: () => number;
  getBreathPhase: () => number;
}

export type CompanionState = 'OUT' | 'ENTERING' | 'IN' | 'EXITING';

export interface CompanionConfig {
  id: string;
  entryDelay: number;
  phaseLag: number;
  speed: number;
  width: number;
  height: number;
  frames: number;
  horizontalPos: number;
  verticalPos: number;
  scale: number;
  sineAmplitude: number;
  animSpeed: number;
  enterSpeed: number;
  exitSpeed: number;
  brakingForce: number;
  minStayTime: number;
  minCooldownTime: number;
  requiredIndicators: number;
}

export interface CompanionData {
  id: string;
  image: HTMLImageElement | null;
  x: number;
  y: number;
  width: number;
  height: number;
  spriteWidth: number;
  spriteHeight: number;
  frameY: number;
  maxFrame: number;
  angle: number;
  spriteAngle: number;
  rotation: number;
  targetX: number;
  offScreenX: number;
  curve: number;
  fsmState: CompanionState;
  stateCounter: number;
  isVisible: boolean;
  config: CompanionConfig;
}

export interface UseCompanionsResult {
  updateCompanions: (
    deltaTime: number,
    rmssdTier: RmssdTier,
    companionScheduleElapsedMs: number,
    canvasHeight: number,
    ratio: number,
    isConnected: boolean,
    isBaselineReady: boolean,
    isGameOver: boolean,
    cpm: number,
    companionEntryDelays: number[],
    isSensorNoSignal: boolean,
    useTierForBiofeedbackRetain: boolean,
    globalRetainBiofeedbackOk: boolean
  ) => void;
  drawCompanions: (ctx: CanvasRenderingContext2D) => void;
  resize: (canvasWidth: number, canvasHeight: number, ratio: number) => void;
  reset: () => void;
  getCompanionPeakHud: () => number;
  getCompanionConcurrentHud: () => number;
}

export interface GameStateData {
  hasPlayedClearSound: boolean;
  hasExportedData: boolean;
  scoreTimer: number;
}

export interface UseGameStateResult {
  getGameStateData: () => GameStateData;
  markClearSoundPlayed: () => void;
  markDataExported: () => void;
  updateScoreTimer: (deltaTime: number) => { shouldScore: boolean };
  resetGameStateData: () => void;
}

export interface UseParticlesResult {
  addParticle: (canvasWidth: number, canvasHeight: number, ratio: number) => void;
  updateParticles: () => void;
  drawParticles: (ctx: CanvasRenderingContext2D, ratio: number) => void;
  autoSpawnParticles: (deltaTime: number, canvasWidth: number, canvasHeight: number, ratio: number) => void;
  reset: () => void;
}

export interface GameEngineInstance {
  getState: () => GameEngineState;
  startGame: (isConnected?: boolean, difficulty?: MenuDifficultyId, keepPlaytestPending?: boolean) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  quitSession: () => void;
  restartGame: (isConnected?: boolean) => void;
  goToMainMenu: () => void;
  goToWelcome: () => void;
  addScore: (points: number) => void;
  updateTimer: (deltaTime: number) => void;
  updateScore: (rmssd: number, passiveActiveIndicators?: number, bleConnected?: boolean) => void;
  isPlaying: () => boolean;
  isGameLoopActive: () => boolean;
  onStateChanged: (callback: (state: GameEngineState) => void) => () => void;
  getSessionLimit: () => number;
  setSessionLimit: (seconds: number) => void;
  getCyclesPerMinute: () => number;
  setCyclesPerMinute: (cpm: number) => void;
  getBreathingPattern: () => BreathingPatternId;
  setBreathingPattern: (pattern: BreathingPatternId) => void;
  getSessionPlayElapsedMs: () => number;
  getCompanionScheduleElapsedMs: () => number;
  setPlayerArrived: () => void;
  setPlayerHasLeftScreen: () => void;
  getCompanionEntryDelays: () => number[];
  applyPersistentSensorSignalLoss: () => void;
  reportCompanionHudPeak: (concurrentHudActiveCount: number) => void;
  reportCompanionHudConcurrent: (concurrentHudActiveCount: number) => void;
  getSessionDifficulty: () => MenuDifficultyId;
  getGameplayMode: () => GameplayMode;
  /** Avança a fase estática; devolve `true` no frame em que a exploração já pode ser liberada. */
  tickStaticPhase: (deltaTimeMs: number, rmssdTier: RmssdTier) => boolean;
  enterExploration: () => void;
  unlockExplorationManually: () => void;
  completeExplorationWin: () => void;
}
