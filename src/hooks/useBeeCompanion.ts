import { useCallback, useEffect, useRef, useState } from 'react';
import {
  computeBeeCompanionState,
  createBeeCompanionRegistry,
  drawBeeCompanion as drawBeeCompanionService,
  preloadBeeCompanion,
  type BeeCompanionImageRegistry
} from '../services/staticBreathing';
import type { BeeCompanionState } from '../types/beeCompanion';
import { BEE_COMPANION_CONFIG } from '../utils/constants';

const DEFAULT_STATE: BeeCompanionState = {
  x: 0,
  y: 0,
  spriteIndex: 0,
  facingRight: false
};

export interface UseBeeCompanionResult {
  isBeeReady: boolean;
  /**
   * Atualiza posição + frame da abelha a partir do `cycleProgress01` (mesma fonte do
   * `useStaticBreathing`) e do tempo absoluto da sessão (para a animação das asas).
   */
  updateBeeCompanion: (
    sessionElapsedMs: number,
    cycleProgress01: number,
    viewport: { width: number; height: number }
  ) => void;
  drawBeeCompanion: (
    ctx: CanvasRenderingContext2D,
    viewport: { width: number; height: number }
  ) => void;
  resetBeeCompanion: () => void;
}

/**
 * Hook React para a abelha companheira da fase estática.
 *
 * Espelha o padrão de `useStaticBreathing` / `useExplorationChest`: serviço puro +
 * refs internos + API estável. A abelha funciona como guia respiratório — sua posição
 * vertical rastreia o `cycleProgress01` (topo = peito cheio, fundo = peito vazio).
 *
 * Para desligar a abelha sem remover código, use `BEE_COMPANION_CONFIG.ENABLED`.
 */
export function useBeeCompanion(): UseBeeCompanionResult {
  const registryRef = useRef<BeeCompanionImageRegistry>(createBeeCompanionRegistry());
  const stateRef = useRef<BeeCompanionState>(DEFAULT_STATE);
  const lastFacingRef = useRef<boolean>(DEFAULT_STATE.facingRight);
  const [isBeeReady, setIsBeeReady] = useState(false);

  useEffect(() => {
    preloadBeeCompanion(registryRef.current);
    const img = registryRef.current.get(BEE_COMPANION_CONFIG.IMAGE);
    if (img && img.complete && img.naturalWidth > 0) {
      setIsBeeReady(true);
      return;
    }
    const handleDone = () => setIsBeeReady(true);
    img?.addEventListener('load', handleDone, { once: true });
    img?.addEventListener('error', handleDone, { once: true });
  }, []);

  const updateBeeCompanion = useCallback(
    (
      sessionElapsedMs: number,
      cycleProgress01: number,
      viewport: { width: number; height: number }
    ): void => {
      const next = computeBeeCompanionState({
        cycleProgress01,
        sessionElapsedMs,
        viewport,
        lastFacingRight: lastFacingRef.current
      });
      lastFacingRef.current = next.facingRight;
      stateRef.current = next;
    },
    []
  );

  const drawBeeCompanion = useCallback(
    (ctx: CanvasRenderingContext2D, viewport: { width: number; height: number }): void => {
      drawBeeCompanionService(ctx, registryRef.current, stateRef.current, viewport);
    },
    []
  );

  const resetBeeCompanion = useCallback((): void => {
    stateRef.current = DEFAULT_STATE;
    lastFacingRef.current = DEFAULT_STATE.facingRight;
  }, []);

  return {
    isBeeReady,
    updateBeeCompanion,
    drawBeeCompanion,
    resetBeeCompanion
  };
}
