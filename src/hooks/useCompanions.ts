import { useCallback, useEffect, useRef } from 'react';
import type { CompanionData, RmssdTier, UseCompanionsResult } from '../types';
import { COMPANION_SLOT_COUNT, COMPANIONS_CONFIG, GAME_ASSETS } from '../utils/constants';

export function useCompanions(): UseCompanionsResult {
  const companionsRef = useRef<CompanionData[]>([]);
  const peakConcurrentCompanionHudRef = useRef(0);
  const lastConcurrentHudRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    companionsRef.current = COMPANIONS_CONFIG.map((config, index) => {
      const img = new Image();
      img.src = GAME_ASSETS.COMPANIONS[index];

      return {
        id: config.id,
        image: img,
        x: -1000,
        y: 0,
        width: 0,
        height: 0,
        spriteWidth: config.width,
        spriteHeight: config.height / config.frames,
        frameY: 0,
        maxFrame: config.frames - 1,
        angle: 0,
        spriteAngle: 0,
        rotation: 0,
        targetX: 0,
        offScreenX: 0,
        curve: 0,
        fsmState: 'OUT' as const,
        stateCounter: 0,
        isVisible: false,
        config
      };
    });
  }, []);

  const resize = useCallback((canvasWidth: number, canvasHeight: number, ratio: number): void => {
    companionsRef.current.forEach((companion) => {
      companion.width = companion.spriteWidth * ratio * companion.config.scale;
      companion.height = companion.spriteHeight * ratio * companion.config.scale;
      companion.curve = canvasHeight * companion.config.sineAmplitude;
      companion.targetX = canvasWidth * companion.config.horizontalPos - companion.width * 0.5;
      companion.offScreenX = -companion.width - 50;

      if (companion.fsmState === 'OUT') {
        companion.x = companion.offScreenX;
      }
    });
  }, []);

  const reset = useCallback((): void => {
    peakConcurrentCompanionHudRef.current = 0;
    lastConcurrentHudRef.current = 0;
    companionsRef.current.forEach((companion) => {
      companion.fsmState = 'OUT';
      companion.stateCounter = 0;
      companion.isVisible = false;
      companion.x = companion.offScreenX !== 0 ? companion.offScreenX : -1000;
    });
  }, []);

  const moveTowards = (companion: CompanionData, targetX: number, speedOverride: number, ratio: number): boolean => {
    const distanceToTarget = targetX - companion.x;

    if (Math.abs(distanceToTarget) <= 2) {
      companion.x = targetX;
      return true;
    }

    let currentSpeed = distanceToTarget * companion.config.brakingForce;
    const maxSpeed = speedOverride * ratio;

    if (currentSpeed > maxSpeed) currentSpeed = maxSpeed;
    if (currentSpeed < -maxSpeed) currentSpeed = -maxSpeed;

    const minSpeed = 0.5 * ratio;
    if (Math.abs(currentSpeed) < minSpeed) {
      currentSpeed = currentSpeed > 0 ? minSpeed : -minSpeed;
    }

    companion.x += currentSpeed;
    return false;
  };

  const updateCompanions = useCallback(
    (
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
    ): void => {
      companionsRef.current.forEach((companion, index) => {
        companion.stateCounter += deltaTime;
        const shouldFreezeTransitions = isConnected && isSensorNoSignal;

        let entryConditionMet = false;
        let inStateRetainOk = false;

        if (isConnected && isBaselineReady) {
          entryConditionMet = rmssdTier >= companion.config.requiredIndicators;
          inStateRetainOk = useTierForBiofeedbackRetain ? entryConditionMet : globalRetainBiofeedbackOk;
        } else if (isConnected) {
          entryConditionMet = false;
          inStateRetainOk = false;
        } else {
          const delay = companionEntryDelays.length > index ? companionEntryDelays[index] : companion.config.entryDelay;
          entryConditionMet = companionScheduleElapsedMs >= delay;
          inStateRetainOk = entryConditionMet;
        }

        const prevCompanion = index > 0 ? companionsRef.current[index - 1] : null;
        const nextCompanion = index < companionsRef.current.length - 1 ? companionsRef.current[index + 1] : null;

        const canEnter = !prevCompanion || prevCompanion.fsmState === 'IN';
        const canExit = !nextCompanion || nextCompanion.fsmState === 'OUT';

        if (isGameOver) {
          if (companion.isVisible) {
            companion.x += companion.config.enterSpeed * ratio;
          }
        } else {
          switch (companion.fsmState) {
            case 'OUT': {
              companion.isVisible = false;
              companion.x = companion.offScreenX;

              const cooldownReady = isConnected || companion.stateCounter >= companion.config.minCooldownTime;
              if (!shouldFreezeTransitions && entryConditionMet && cooldownReady && canEnter) {
                companion.fsmState = 'ENTERING';
                companion.stateCounter = 0;
                companion.isVisible = true;
              }
              break;
            }

            case 'ENTERING':
              companion.isVisible = true;
              if (moveTowards(companion, companion.targetX, companion.config.enterSpeed, ratio)) {
                companion.fsmState = 'IN';
                companion.stateCounter = 0;
              }
              break;

            case 'IN': {
              companion.isVisible = true;
              companion.x = companion.targetX;

              const stayTimeReady = isConnected || companion.stateCounter >= companion.config.minStayTime;
              if (!shouldFreezeTransitions && !inStateRetainOk && stayTimeReady && canExit) {
                companion.fsmState = 'EXITING';
                companion.stateCounter = 0;
              }
              break;
            }

            case 'EXITING':
              companion.isVisible = true;
              if (moveTowards(companion, companion.offScreenX, companion.config.exitSpeed, ratio)) {
                companion.fsmState = 'OUT';
                companion.stateCounter = 0;
              }
              break;
          }
        }

        if (!companion.isVisible) return;

        const cyclesPerSecond = cpm / 60;
        const radsStep = cyclesPerSecond * Math.PI * 2 * (deltaTime / 1000);
        companion.angle += radsStep;

        const sineInput = companion.angle - companion.config.phaseLag;
        const sineValue = Math.sin(sineInput);

        const centerY = canvasHeight * companion.config.verticalPos - companion.height * 0.5;
        companion.y = centerY + sineValue * companion.curve;

        companion.rotation = Math.cos(sineInput) * 0;

        companion.spriteAngle += companion.config.animSpeed * (deltaTime / 1000);
        let theta = companion.spriteAngle % (Math.PI * 2);
        if (theta < 0) theta += Math.PI * 2;
        const shiftedTheta = (theta + Math.PI / 2) % (Math.PI * 2);
        const totalFramesCalc = companion.maxFrame + 1;
        companion.frameY = Math.floor((shiftedTheta / (Math.PI * 2)) * totalFramesCalc);
        if (companion.frameY > companion.maxFrame) companion.frameY = companion.maxFrame;
      });

      let concurrentHudActiveCount = 0;
      companionsRef.current.forEach((companion) => {
        if (companion.fsmState === 'IN' || companion.fsmState === 'ENTERING') {
          concurrentHudActiveCount += 1;
        }
      });
      peakConcurrentCompanionHudRef.current = Math.max(peakConcurrentCompanionHudRef.current, concurrentHudActiveCount);
      lastConcurrentHudRef.current = concurrentHudActiveCount;
    },
    []
  );

  const getCompanionPeakHud = useCallback((): number => {
    return Math.min(COMPANION_SLOT_COUNT, peakConcurrentCompanionHudRef.current);
  }, []);

  const getCompanionConcurrentHud = useCallback((): number => {
    return Math.min(COMPANION_SLOT_COUNT, lastConcurrentHudRef.current);
  }, []);

  const drawCompanions = useCallback((ctx: CanvasRenderingContext2D): void => {
    companionsRef.current.forEach((companion) => {
      if (!companion.isVisible) return;
      if (!companion.image || !companion.image.complete) return;

      ctx.save();
      ctx.translate(companion.x + companion.width * 0.5, companion.y + companion.height * 0.5);
      ctx.rotate(companion.rotation);

      ctx.drawImage(
        companion.image,
        0,
        companion.frameY * companion.spriteHeight,
        companion.spriteWidth,
        companion.spriteHeight,
        -companion.width * 0.5,
        -companion.height * 0.5,
        companion.width,
        companion.height
      );
      ctx.restore();
    });
  }, []);

  return { updateCompanions, drawCompanions, resize, reset, getCompanionPeakHud, getCompanionConcurrentHud };
}
