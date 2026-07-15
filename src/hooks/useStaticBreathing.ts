import { useCallback, useEffect, useRef, useState } from 'react';
import {
  advanceTransition,
  beginFadeIn,
  beginFadeOut,
  computeStaticBreathingFrame,
  createStaticBreathingImageRegistry,
  createTransitionState,
  drawStaticBreathingScene,
  drawTransitionOverlay,
  endTransition,
  getTransitionAlpha,
  preloadStaticBreathingImages,
  type StaticBreathingImageRegistry
} from '../services/staticBreathing';
import { getIntervalPhaseDurationsMs } from '../services/game/breathingRhythmService';
import type { BreathingPatternId } from '../types/game';
import type {
  StaticBreathingFrameState,
  StaticBreathingPhase,
  StaticBreathingTransitionState,
  StaticBreathingTransitionStatus
} from '../types/staticBreathing';
import { STATIC_BREATHING_CONFIG } from '../utils/constants';

const DEFAULT_FRAME: StaticBreathingFrameState = {
  phase: 'exhaling',
  cycleProgress01: 0,
  frameIndex: 0
};

export interface UseStaticBreathingOptions {
  /** Dispara ao **entrar** na fase `inhaling`. `durationSeconds` = meia-respiração para sincronizar SFX. */
  onInhale?: (durationSeconds: number) => void;
  /** Dispara ao **entrar** na fase `exhaling`. */
  onExhale?: (durationSeconds: number) => void;
}

export interface UseStaticBreathingResult {
  isStaticBreathingReady: boolean;
  /** Atualiza o frame atual; dispara `onInhale`/`onExhale` na troca de fase. */
  updateStaticBreathing: (
    deltaMs: number,
    sessionElapsedMs: number,
    cpm: number,
    pattern: BreathingPatternId
  ) => void;
  drawStaticBreathing: (ctx: CanvasRenderingContext2D, viewport: { width: number; height: number }) => void;
  resetStaticBreathing: () => void;
  /**
   * Snapshot do frame respiratório atual (último computado por `updateStaticBreathing`).
   * Permite que outros sistemas (ex.: `useBeeCompanion`) consumam `cycleProgress01`
   * sem recomputar o ciclo — single source of truth.
   */
  getCurrentFrame: () => StaticBreathingFrameState;
  // Transição (fade preto)
  startFadeOut: () => void;
  startFadeIn: () => void;
  finishTransition: () => void;
  advanceTransitionTimer: (deltaMs: number) => boolean;
  getTransitionStatus: () => StaticBreathingTransitionStatus;
  drawTransition: (ctx: CanvasRenderingContext2D, viewport: { width: number; height: number }) => void;
}

/**
 * Hook React para a cena estática de respiração (pré-exploração).
 *
 * Espelha o padrão dos hooks `useFogLayer` / `useExplorationChest`: serviços puros
 * + ref interno + API estável. Os callbacks `onInhale` / `onExhale` permitem que o
 * `gameCanvas` plugue `playInhale` / `playExhale` do `useAudio` sem o hook conhecer
 * o sistema de áudio.
 */
export function useStaticBreathing(options: UseStaticBreathingOptions = {}): UseStaticBreathingResult {
  const registryRef = useRef<StaticBreathingImageRegistry>(createStaticBreathingImageRegistry());
  const frameRef = useRef<StaticBreathingFrameState>(DEFAULT_FRAME);
  const lastPhaseRef = useRef<StaticBreathingPhase | null>(null);
  const transitionRef = useRef<StaticBreathingTransitionState>(createTransitionState());
  const onInhaleRef = useRef(options.onInhale);
  const onExhaleRef = useRef(options.onExhale);
  const [isStaticBreathingReady, setIsStaticBreathingReady] = useState(false);

  useEffect(() => {
    onInhaleRef.current = options.onInhale;
    onExhaleRef.current = options.onExhale;
  }, [options.onInhale, options.onExhale]);

  useEffect(() => {
    preloadStaticBreathingImages(registryRef.current);
    // Marca pronto quando as duas imagens já estão decodificadas, ou imediatamente
    // se já estavam em cache (Image.complete === true).
    const urls = [
      STATIC_BREATHING_CONFIG.IMAGES.IDLE,
      STATIC_BREATHING_CONFIG.IMAGES.BREATHING_SHEET,
      STATIC_BREATHING_CONFIG.IMAGES.BACKGROUND
    ];
    const imgs = urls.map((url) => registryRef.current.get(url)).filter((i): i is HTMLImageElement => !!i);
    if (imgs.every((img) => img.complete && img.naturalWidth > 0)) {
      setIsStaticBreathingReady(true);
      return;
    }
    let remaining = imgs.length;
    const onDone = () => {
      remaining -= 1;
      if (remaining <= 0) setIsStaticBreathingReady(true);
    };
    imgs.forEach((img) => {
      img.addEventListener('load', onDone, { once: true });
      img.addEventListener('error', onDone, { once: true });
    });
  }, []);

  const halfCycleSecondsFor = (
    pattern: BreathingPatternId,
    cpm: number,
    phase: StaticBreathingPhase
  ): number => {
    if (pattern === 'continuous') return cpm > 0 ? 30 / cpm : 5;
    const d = getIntervalPhaseDurationsMs(cpm);
    return (phase === 'inhaling' ? d.topMs : d.bottomMs) / 1000;
  };

  const updateStaticBreathing = useCallback(
    (deltaMs: number, sessionElapsedMs: number, cpm: number, pattern: BreathingPatternId): void => {
      const frame = computeStaticBreathingFrame(sessionElapsedMs, cpm, pattern);
      frameRef.current = frame;

      const previous = lastPhaseRef.current;
      if (previous !== frame.phase) {
        if (STATIC_BREATHING_CONFIG.PLAY_SFX && previous !== null) {
          const dur = halfCycleSecondsFor(pattern, cpm, frame.phase);
          if (frame.phase === 'inhaling') onInhaleRef.current?.(dur);
          else onExhaleRef.current?.(dur);
        }
        lastPhaseRef.current = frame.phase;
      }
      void deltaMs;
    },
    []
  );

  const drawStaticBreathing = useCallback(
    (ctx: CanvasRenderingContext2D, viewport: { width: number; height: number }): void => {
      drawStaticBreathingScene(ctx, registryRef.current, frameRef.current, viewport);
    },
    []
  );

  const getCurrentFrame = useCallback((): StaticBreathingFrameState => frameRef.current, []);

  const resetStaticBreathing = useCallback((): void => {
    frameRef.current = DEFAULT_FRAME;
    lastPhaseRef.current = null;
    endTransition(transitionRef.current);
  }, []);

  const startFadeOut = useCallback((): void => {
    beginFadeOut(transitionRef.current);
  }, []);
  const startFadeIn = useCallback((): void => {
    beginFadeIn(transitionRef.current);
  }, []);
  const finishTransition = useCallback((): void => {
    endTransition(transitionRef.current);
  }, []);
  const advanceTransitionTimer = useCallback(
    (deltaMs: number): boolean => advanceTransition(transitionRef.current, deltaMs),
    []
  );
  const getTransitionStatus = useCallback(
    (): StaticBreathingTransitionStatus => transitionRef.current.status,
    []
  );
  const drawTransition = useCallback(
    (ctx: CanvasRenderingContext2D, viewport: { width: number; height: number }): void => {
      drawTransitionOverlay(ctx, viewport, getTransitionAlpha(transitionRef.current));
    },
    []
  );

  return {
    isStaticBreathingReady,
    updateStaticBreathing,
    drawStaticBreathing,
    resetStaticBreathing,
    getCurrentFrame,
    startFadeOut,
    startFadeIn,
    finishTransition,
    advanceTransitionTimer,
    getTransitionStatus,
    drawTransition
  };
}
