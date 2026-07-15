import type { GameLoopInstance, RenderCallback, UpdateCallback } from '../../types';
import { TIMING } from '../../utils/constants';

export function createGameLoop(): GameLoopInstance {
  let isRunning = false;
  let isPaused = false;
  let animationFrameId: number | null = null;
  let lastFrameTime = 0;

  const updateCallbacks: UpdateCallback[] = [];
  const renderCallbacks: RenderCallback[] = [];

  const FPS = TIMING.ANIMATION_FRAME_RATE;
  const FRAME_TIME = 1000 / FPS;

  const frame = (currentTime: number): void => {
    if (!isRunning) return;

    if (lastFrameTime === 0) {
      lastFrameTime = currentTime;
    }

    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime >= FRAME_TIME) {
      if (!isPaused) {
        updateCallbacks.forEach((callback) => {
          try {
            callback(deltaTime);
          } catch (error) {
            console.error('❌ Erro em update callback:', error);
          }
        });

        renderCallbacks.forEach((callback) => {
          try {
            callback();
          } catch (error) {
            console.error('❌ Erro em render callback:', error);
          }
        });
      }

      lastFrameTime = currentTime;
    }

    animationFrameId = requestAnimationFrame(frame);
  };

  const start = (): void => {
    if (!isRunning) {
      isRunning = true;
      isPaused = false;
      lastFrameTime = 0;
      animationFrameId = requestAnimationFrame(frame);
    }
  };

  const stop = (): void => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    isRunning = false;
    isPaused = false;
    lastFrameTime = 0;
  };

  const pause = (): void => {
    isPaused = true;
  };

  const resume = (): void => {
    isPaused = false;
    lastFrameTime = 0;
  };

  const onUpdateHandler = (callback: UpdateCallback): (() => void) => {
    updateCallbacks.push(callback);
    return () => {
      const index = updateCallbacks.indexOf(callback);
      if (index > -1) {
        updateCallbacks.splice(index, 1);
      }
    };
  };

  const onRenderHandler = (callback: RenderCallback): (() => void) => {
    renderCallbacks.push(callback);
    return () => {
      const index = renderCallbacks.indexOf(callback);
      if (index > -1) {
        renderCallbacks.splice(index, 1);
      }
    };
  };

  const isRunningCheck = (): boolean => {
    return isRunning;
  };

  return {
    start,
    stop,
    pause,
    resume,
    onUpdate: onUpdateHandler,
    onRender: onRenderHandler,
    isRunning: isRunningCheck
  };
}
