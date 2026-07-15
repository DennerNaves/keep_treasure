import { getSFXVolume } from '../audio/audioService';
import type { NarrationStep } from '../../types/narration';

let activeAudio: HTMLAudioElement | null = null;
let activeAbortController: AbortController | null = null;

const delay = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, ms);
    const onAbort = () => {
      window.clearTimeout(timeoutId);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });

const playClip = (url: string, signal: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    const audio = new Audio(url);
    activeAudio = audio;
    audio.volume = getSFXVolume();

    const cleanup = () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      signal.removeEventListener('abort', onAbort);
      if (activeAudio === audio) {
        activeAudio = null;
      }
    };

    const onEnded = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      console.warn(`[narration] falha ao carregar: ${url}`);
      cleanup();
      resolve();
    };

    const onAbort = () => {
      audio.pause();
      cleanup();
      resolve();
    };

    signal.addEventListener('abort', onAbort, { once: true });
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.play().catch(() => {
      cleanup();
      resolve();
    });
  });

export type PlayNarrationSequenceOptions = {
  pauseMs: number;
  onStepStart?: (step: NarrationStep, index: number) => void;
  signal?: AbortSignal;
};

export async function playNarrationSequence(steps: NarrationStep[], options: PlayNarrationSequenceOptions): Promise<void> {
  if (steps.length === 0) return;

  const controller = new AbortController();
  activeAbortController = controller;
  const signal = options.signal ?? controller.signal;

  try {
    for (let index = 0; index < steps.length; index += 1) {
      if (signal.aborted) return;

      const step = steps[index];
      options.onStepStart?.(step, index);
      await playClip(step.url, signal);
      if (signal.aborted) return;

      if (index < steps.length - 1) {
        await delay(options.pauseMs, signal);
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }
    throw error;
  } finally {
    if (activeAbortController === controller) {
      activeAbortController = null;
    }
  }
}

export function stopNarration(): void {
  activeAbortController?.abort();
  activeAbortController = null;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
}
