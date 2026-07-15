import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EXPLORATION_NARRATION_CONFIG } from '../config/explorationNarration';
import {
  buildDirectionNarrationQueue,
  buildExplorationNarrationQueue,
  playNarrationSequence,
  stopNarration
} from '../services/narration';
import type { Direction } from '../types/mapGeneration';
import type { ExplorationIntroPhase } from '../types/tutorial';
import { EXPLORATION_INTRO_CONFIG } from '../utils/constants';

export interface UseExplorationIntroOptions {
  /**
   * Quando vira `true`, a intro começa (fase `entering`). Quando volta para `false`,
   * a intro é resetada (`idle`). Ligar a uma condição derivada do estado do jogo
   * (`gameplayMode === 'exploration' && sessionStarted`).
   */
  trigger: boolean;
  /** Sequência de direções do corredor procedural — monta a fila de narração. */
  pathDirections: Direction[];
  /** Viewport atual (para interpolar posições da abelha em px). */
  viewport: { width: number; height: number };
}

export interface UseExplorationIntroResult {
  phase: ExplorationIntroPhase;
  /** Texto exibido no balão conforme a fase. */
  bubbleText: string;
  /** Posição interpolada da abelha em px (centro do sprite). */
  beePosition: { x: number; y: number };
  /** `true` quando a abelha está se movendo para a direita (deve-se aplicar flip). */
  beeFacingRight: boolean;
  /** Confirma e inicia a saída da abelha. */
  confirm: () => void;
  /** Repete somente os áudios de direção. */
  repeat: () => void;
  /** Direção do clipe atual (null fora dos passos de direção). */
  currentDirection: Direction | null;
}

const easeInOutQuad = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const applyEasing = (t: number): number => {
  if (EXPLORATION_INTRO_CONFIG.BEE.EASING === 'easeInOutQuad') return easeInOutQuad(t);
  return t;
};

const fracToPx = (frac: number, dim: number): number => frac * dim;

const isBeeCentered = (phase: ExplorationIntroPhase): boolean =>
  phase === 'narrating' || phase === 'awaitingResponse' || phase === 'done';

/**
 * Orquestra a intro: entrada da abelha → narração em áudio → resposta do jogador → saída.
 */
export function useExplorationIntro(options: UseExplorationIntroOptions): UseExplorationIntroResult {
  const { trigger, pathDirections, viewport } = options;
  const [phase, setPhase] = useState<ExplorationIntroPhase>('idle');
  const [currentCaption, setCurrentCaption] = useState('');
  const [currentDirection, setCurrentDirection] = useState<Direction | null>(null);
  const [narrationRunId, setNarrationRunId] = useState(0);
  const [directionsOnlyReplay, setDirectionsOnlyReplay] = useState(false);
  const phaseStartedAtRef = useRef<number>(0);
  const [now, setNow] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastFacingRightRef = useRef<boolean>(true);

  const narrationQueue = useMemo(() => buildExplorationNarrationQueue(pathDirections), [pathDirections]);

  useEffect(() => {
    if (trigger && phase === 'idle') {
      phaseStartedAtRef.current = performance.now();
      setCurrentCaption('');
      setCurrentDirection(null);
      setNarrationRunId(0);
      setDirectionsOnlyReplay(false);
      setPhase('entering');
    } else if (!trigger && phase !== 'idle') {
      stopNarration();
      setCurrentCaption('');
      setCurrentDirection(null);
      setPhase('idle');
    }
  }, [trigger, phase]);

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'exiting') return;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setNow(performance.now());
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'exiting') return;

    const duration =
      phase === 'entering'
        ? EXPLORATION_INTRO_CONFIG.BEE.ENTRY_DURATION_MS
        : EXPLORATION_INTRO_CONFIG.BEE.EXIT_DURATION_MS;
    const elapsed = now - phaseStartedAtRef.current;

    if (elapsed >= duration) {
      if (phase === 'entering') {
        setPhase('narrating');
      } else {
        setPhase('done');
      }
    }
  }, [phase, now]);

  useEffect(() => {
    if (phase !== 'narrating') return;

    let cancelled = false;

    const queue = directionsOnlyReplay
      ? buildDirectionNarrationQueue(pathDirections)
      : narrationQueue;

    void playNarrationSequence(queue, {
      pauseMs: EXPLORATION_NARRATION_CONFIG.PAUSE_BETWEEN_CLIPS_MS,
      onStepStart: (step) => {
        if (!cancelled) {
          setCurrentCaption(step.caption);
          setCurrentDirection(step.direction ?? null);
        }
      }
    }).then(() => {
      if (!cancelled) {
        setCurrentDirection(null);
        setPhase('awaitingResponse');
      }
    });

    return () => {
      cancelled = true;
      stopNarration();
    };
  }, [phase, narrationRunId, narrationQueue, directionsOnlyReplay, pathDirections]);

  const confirm = useCallback(() => {
    if (phase !== 'awaitingResponse') return;
    stopNarration();
    phaseStartedAtRef.current = performance.now();
    setPhase('exiting');
  }, [phase]);

  const repeat = useCallback(() => {
    if (phase !== 'awaitingResponse') return;
    stopNarration();
    setCurrentCaption('');
    setCurrentDirection(null);
    setDirectionsOnlyReplay(true);
    setNarrationRunId((id) => id + 1);
    setPhase('narrating');
  }, [phase]);

  const { x, y, facingRight } = (() => {
    const { ENTRY_FROM, IDLE_AT, EXIT_TO, ENTRY_DURATION_MS, EXIT_DURATION_MS } = EXPLORATION_INTRO_CONFIG.BEE;

    if (phase === 'idle') {
      return {
        x: fracToPx(ENTRY_FROM.xFrac, viewport.width),
        y: fracToPx(ENTRY_FROM.yFrac, viewport.height),
        facingRight: lastFacingRightRef.current
      };
    }

    if (isBeeCentered(phase)) {
      return {
        x: fracToPx(IDLE_AT.xFrac, viewport.width),
        y: fracToPx(IDLE_AT.yFrac, viewport.height),
        facingRight: lastFacingRightRef.current
      };
    }

    const from = phase === 'entering' ? ENTRY_FROM : IDLE_AT;
    const to = phase === 'entering' ? IDLE_AT : EXIT_TO;
    const dur = phase === 'entering' ? ENTRY_DURATION_MS : EXIT_DURATION_MS;
    const elapsed = Math.max(0, Math.min(dur, now - phaseStartedAtRef.current));
    const t = dur > 0 ? elapsed / dur : 1;
    const eased = applyEasing(t);
    const fromX = fracToPx(from.xFrac, viewport.width);
    const fromY = fracToPx(from.yFrac, viewport.height);
    const toX = fracToPx(to.xFrac, viewport.width);
    const toY = fracToPx(to.yFrac, viewport.height);
    const xPx = fromX + (toX - fromX) * eased;
    const yPx = fromY + (toY - fromY) * eased;
    const dx = toX - fromX;
    const movingRight = dx > 0;
    if (Math.abs(dx) > 1) lastFacingRightRef.current = movingRight;
    return { x: xPx, y: yPx, facingRight: lastFacingRightRef.current };
  })();

  const bubbleText =
    phase === 'awaitingResponse' ? EXPLORATION_NARRATION_CONFIG.AWAITING_PROMPT : currentCaption;

  return {
    phase,
    bubbleText,
    beePosition: { x, y },
    beeFacingRight: facingRight,
    confirm,
    repeat,
    currentDirection
  };
}
