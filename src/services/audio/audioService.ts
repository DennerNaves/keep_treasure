import type { Audio, SoundEffect } from '../../types';
import { AUDIO_CONFIG } from '../../utils/constants';

const audioState: Audio = {
  musicVolume: AUDIO_CONFIG.DEFAULT_MUSIC_VOLUME,
  sfxVolume: AUDIO_CONFIG.DEFAULT_SFX_VOLUME,
  currentTrackIndex: 0,
  tracks: [],
  isPlaying: false,
  isPaused: false
};

let musicElement: HTMLAudioElement | null = null;
const sfxElements: Record<SoundEffect, HTMLAudioElement> = {} as Record<SoundEffect, HTMLAudioElement>;
const oneShotSfxCache = new Map<string, HTMLAudioElement>();

let audioCtx: AudioContext | null = null;
let exhalePhaseWebAudioBuffer: AudioBuffer | null = null;
let inhaleBuffer: AudioBuffer | null = null;
let activeExhaleSource: AudioBufferSourceNode | null = null;
let activeExhaleGain: GainNode | null = null;
let activeInhaleSource: AudioBufferSourceNode | null = null;
let activeInhaleGain: GainNode | null = null;

const decodeBufferFromUrl = async (url: string, onDecoded: (b: AudioBuffer) => void, label: string): Promise<void> => {
  try {
    if (!audioCtx) return;
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    audioCtx.decodeAudioData(arrayBuffer, onDecoded);
  } catch (error) {
    console.error(`Erro ao carregar áudio (${label}):`, error);
  }
};

const loadExhalePhaseWebAudioBuffer = async (url: string): Promise<void> => {
  await decodeBufferFromUrl(
    url,
    (decodedBuffer) => {
      exhalePhaseWebAudioBuffer = decodedBuffer;
    },
    'EXHALE'
  );
};

const loadInhaleSound = async (url: string): Promise<void> => {
  await decodeBufferFromUrl(
    url,
    (decodedBuffer) => {
      inhaleBuffer = decodedBuffer;
    },
    'INHALE'
  );
};

const resumeContext = (): void => {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const initializeAudio = (): void => {
  const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (AudioCtxClass) {
    audioCtx = new AudioCtxClass();
    void loadExhalePhaseWebAudioBuffer(AUDIO_CONFIG.SOUND_EFFECTS.EXHALE);
    void loadInhaleSound(AUDIO_CONFIG.SOUND_EFFECTS.INHALE);
  }

  audioState.tracks = AUDIO_CONFIG.TRACKS.map((track) => ({
    ...track,
    element: new Audio(track.src)
  }));

  if (audioState.tracks.length > 0) {
    musicElement = audioState.tracks[0].element!;
    musicElement.loop = true;
    musicElement.volume = audioState.musicVolume;
  }

  const sfxMapping: Record<string, SoundEffect> = {
    PARTICLE: 'particle',
    LEVEL_COMPLETE: 'levelComplete',
    IN: 'in',
    OUT: 'out',
    INHALE: 'inhale',
    EXHALE: 'exhale'
  };

  Object.entries(AUDIO_CONFIG.SOUND_EFFECTS).forEach(([key, src]) => {
    const audio = new Audio(src);
    audio.volume = audioState.sfxVolume;
    const effectKey = sfxMapping[key];
    if (effectKey) {
      sfxElements[effectKey] = audio;
    }
  });
};

export const startMusic = (): void => {
  if (musicElement && audioState.musicVolume > 0) {
    resumeContext();
    musicElement.play().catch(console.error);
    audioState.isPlaying = true;
    audioState.isPaused = false;
  }
};

export const stopMusic = (): void => {
  if (musicElement) {
    musicElement.pause();
    musicElement.currentTime = 0;
    audioState.isPlaying = false;
    audioState.isPaused = false;
  }
};

export const pauseMusic = (): void => {
  if (musicElement && audioState.isPlaying) {
    musicElement.pause();
    audioState.isPaused = true;
  }
};

export const resumeMusic = (): void => {
  if (musicElement && audioState.isPaused && audioState.musicVolume > 0) {
    resumeContext();
    musicElement.play().catch(console.error);
    audioState.isPaused = false;
  }
};

export const toggleMusic = (): void => {
  if (audioState.musicVolume > 0) {
    setMusicVolume(0);
  } else {
    setMusicVolume(AUDIO_CONFIG.DEFAULT_MUSIC_VOLUME);
  }
};

export const setMusicVolume = (volume: number): void => {
  audioState.musicVolume = Math.max(0, Math.min(1, volume));

  if (musicElement) {
    musicElement.volume = audioState.musicVolume;

    if (audioState.musicVolume === 0) {
      pauseMusic();
    } else if (audioState.isPaused) {
      resumeMusic();
    }
  }
};

export const setSFXVolume = (volume: number): void => {
  audioState.sfxVolume = Math.max(0, Math.min(1, volume));

  Object.values(sfxElements).forEach((audio) => {
    audio.volume = audioState.sfxVolume;
  });

  oneShotSfxCache.forEach((audio) => {
    audio.volume = audioState.sfxVolume;
  });
};

/** SFX por URL (ex.: passos do tilemap definidos no JSON do mapa). */
export const playOneShotSfx = (url: string, volume = 1): void => {
  if (!url || audioState.sfxVolume <= 0) return;

  let audio = oneShotSfxCache.get(url);
  if (!audio) {
    audio = new Audio(url);
    oneShotSfxCache.set(url, audio);
  }

  audio.volume = Math.max(0, Math.min(1, volume * audioState.sfxVolume));
  audio.currentTime = 0;
  audio.play().catch(() => {});
};

export const toggleSFX = (): void => {
  if (audioState.sfxVolume > 0) {
    setSFXVolume(0);
  } else {
    setSFXVolume(AUDIO_CONFIG.DEFAULT_SFX_VOLUME);
  }
};

export const setTrack = (index: number, autoPlay?: boolean): void => {
  if (index < 0) index = audioState.tracks.length - 1;
  if (index >= audioState.tracks.length) index = 0;

  const wasPlaying = audioState.isPlaying;

  stopMusic();

  audioState.currentTrackIndex = index;
  musicElement = audioState.tracks[index].element!;
  musicElement.volume = audioState.musicVolume;
  musicElement.loop = true;

  if (wasPlaying || autoPlay) {
    startMusic();
  }
};

export const getCurrentTrackName = (): string => {
  return audioState.tracks[audioState.currentTrackIndex]?.name || 'Sem música';
};

export const playSoundEffect = (effect: SoundEffect): void => {
  if (audioState.sfxVolume > 0 && sfxElements[effect]) {
    const audio = sfxElements[effect];
    audio.currentTime = 0;
    audio.play().catch(console.error);
  }
};

export const playParticle = (): void => playSoundEffect('particle');
export const playIn = (): void => playSoundEffect('in');
export const playOut = (): void => playSoundEffect('out');

const stopInhaleWebAudio = (): void => {
  if (activeInhaleSource && activeInhaleGain && audioCtx) {
    const nowT = audioCtx.currentTime;
    activeInhaleGain.gain.cancelScheduledValues(nowT);
    activeInhaleGain.gain.setValueAtTime(activeInhaleGain.gain.value, nowT);
    activeInhaleGain.gain.linearRampToValueAtTime(0, nowT + 0.1);
    try {
      activeInhaleSource.stop(nowT + 0.1);
    } catch {
      void 0;
    }
    activeInhaleSource = null;
    activeInhaleGain = null;
  }
};

export const playInhale = (phaseDurationSeconds: number): void => {
  stopInhale();

  if (audioState.sfxVolume <= 0) return;

  if (!AUDIO_CONFIG.BREATH_SYNC_TO_PHASE_DURATION) {
    playSoundEffect('inhale');
    return;
  }

  if (!inhaleBuffer || !audioCtx) {
    playSoundEffect('inhale');
    return;
  }

  resumeContext();

  const t = audioCtx.currentTime;
  const source = audioCtx.createBufferSource();
  source.buffer = inhaleBuffer;
  const clipDur = inhaleBuffer.duration;
  const phase = Math.max(0.05, phaseDurationSeconds);
  source.loop = clipDur + 0.02 < phase;

  const gainNode = audioCtx.createGain();
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const maxVol = AUDIO_CONFIG.BREATH_MAX_GAIN * audioState.sfxVolume;
  const peakTime = phase * AUDIO_CONFIG.BREATH_PEAK_RATIO;

  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(maxVol, t + peakTime);
  gainNode.gain.linearRampToValueAtTime(0, t + phase);

  source.start(t);
  source.stop(t + phase + 0.1);

  activeInhaleSource = source;
  activeInhaleGain = gainNode;
};

export const stopInhale = (): void => {
  const audio = sfxElements['inhale'];
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  stopInhaleWebAudio();
};

export const playLevelComplete = (): void => {
  stopMusic();
  const { END_GAME_AUDIO } = AUDIO_CONFIG;
  if (!END_GAME_AUDIO.ENABLED) return;

  const effectiveVolume = END_GAME_AUDIO.VOLUME * audioState.sfxVolume;
  if (effectiveVolume <= 0 || !sfxElements['levelComplete']) return;

  const audio = sfxElements['levelComplete'];
  audio.volume = Math.max(0, Math.min(1, effectiveVolume));
  audio.currentTime = 0;
  audio.play().catch(console.error);
};

export const playExhale = (phaseDurationSeconds: number): void => {
  stopExhale();
  stopInhale();

  if (audioState.sfxVolume <= 0) return;

  if (!AUDIO_CONFIG.BREATH_SYNC_TO_PHASE_DURATION) {
    playSoundEffect('exhale');
    return;
  }

  if (!exhalePhaseWebAudioBuffer || !audioCtx) {
    playSoundEffect('exhale');
    return;
  }

  resumeContext();

  const t = audioCtx.currentTime;
  const source = audioCtx.createBufferSource();
  source.buffer = exhalePhaseWebAudioBuffer;
  const clipDur = exhalePhaseWebAudioBuffer.duration;
  const phase = Math.max(0.05, phaseDurationSeconds);
  source.loop = clipDur + 0.02 < phase;

  const gainNode = audioCtx.createGain();
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const maxVol = AUDIO_CONFIG.BREATH_MAX_GAIN * audioState.sfxVolume;
  const peakTime = phase * AUDIO_CONFIG.BREATH_PEAK_RATIO;

  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(maxVol, t + peakTime);
  gainNode.gain.linearRampToValueAtTime(0, t + phase);

  source.start(t);
  source.stop(t + phase + 0.1);

  activeExhaleSource = source;
  activeExhaleGain = gainNode;
};

export const stopExhale = (): void => {
  if (activeExhaleSource && activeExhaleGain && audioCtx) {
    const nowT = audioCtx.currentTime;
    activeExhaleGain.gain.cancelScheduledValues(nowT);
    activeExhaleGain.gain.setValueAtTime(activeExhaleGain.gain.value, nowT);
    activeExhaleGain.gain.linearRampToValueAtTime(0, nowT + 0.1);
    try {
      activeExhaleSource.stop(nowT + 0.1);
    } catch {
      void 0;
    }
    activeExhaleSource = null;
    activeExhaleGain = null;
  }
};

export const togglePreview = (): void => {
  if (audioState.isPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
};

export const isPlaying = (): boolean => audioState.isPlaying;
export const isPaused = (): boolean => audioState.isPaused;
export const getMusicVolume = (): number => audioState.musicVolume;
export const getSFXVolume = (): number => audioState.sfxVolume;
export const getCurrentTrackIndex = (): number => audioState.currentTrackIndex;
export const getAudioState = (): Audio => ({ ...audioState });
