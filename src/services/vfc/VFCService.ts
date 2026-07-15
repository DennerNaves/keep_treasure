import type { SessionSample, VFCInput, VFCReading, VFCSession, VFCState } from '../../types';
import { VFC_CONFIG, type MenuDifficultyId } from '../../utils/constants';
import { computeRmssdTier } from './computeRmssdTier';

const {
  MAX_RR_INTERVALS,
  WINDOW_BEATS,
  WINDOW_MAX_AGE_MS,
  METRICS_INTERVAL_MS,
  ANOMALY_THRESHOLD,
  RR_MIN_MS,
  RR_MAX_MS,
  BASELINE_SAMPLES,
  BASELINE_IGNORE_SAMPLES
} = VFC_CONFIG;

const vfcState: VFCState = {
  rrIntervals: [],
  baseline: null,
  baselineSamplesCount: 0,
  baselineSamplesSnapshot: [],
  runningMedian: 0,
  rmssd: 0,
  normalizedScore: 0,
  rmssdTier: 0,
  isBaselineReady: false
};

const baselineSamples: number[] = [];
const beats: Array<{ rr: number; ts: number; valid: boolean }> = [];
let lastValidRR: number | null = null;
const sessionSamples: SessionSample[] = [];
let gameStartSampleIndex = -1;
let gameEndSampleIndex = -1;
let calibrationEndIndex = -1;
let ignoredSamplesCount = 0;
let isBaselineReady = false;
let vfcSession: VFCSession | null = null;
let metricsIntervalId: ReturnType<typeof setInterval> | null = null;
let metricsPausedForSensorNoSignal = false;
let calibrationRmssdSnapshot: number | null = null;
let useFrozenCalibrationBaselineInGameplay = false;

const calculateRMSSD = (rrIntervals: number[]): number => {
  if (rrIntervals.length < 2) return 0;
  let sumSq = 0;
  for (let i = 1; i < rrIntervals.length; i += 1) {
    const diff = rrIntervals[i] - rrIntervals[i - 1];
    sumSq += diff * diff;
  }
  const meanSq = sumSq / (rrIntervals.length - 1);
  return Math.sqrt(meanSq);
};

const getMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const pruneWindow = (): void => {
  const cutoff = Date.now() - WINDOW_MAX_AGE_MS;
  let i = 0;
  while (i < beats.length && beats[i].ts < cutoff) i += 1;
  if (i > 0) beats.splice(0, i);
};

const getValidRRs = (): number[] => {
  pruneWindow();
  const valid = beats.filter((b) => b.valid);
  return valid.slice(-WINDOW_BEATS).map((b) => b.rr);
};

const clearMetricsInterval = (): void => {
  if (metricsIntervalId) {
    clearInterval(metricsIntervalId);
    metricsIntervalId = null;
  }
};

const updateBaselineFromSlidingWindow = (rmssd: number): void => {
  if (rmssd <= 0) return;

  baselineSamples.push(rmssd);
  if (baselineSamples.length > BASELINE_SAMPLES) {
    baselineSamples.shift();
  }

  const baselineMedian = getMedian(baselineSamples);
  vfcState.baselineSamplesCount = baselineSamples.length;
  vfcState.baselineSamplesSnapshot = [...baselineSamples];
  vfcState.runningMedian = baselineMedian;
  vfcState.baseline = baselineMedian;
};

const runMetricsUpdate = (): void => {
  if (metricsPausedForSensorNoSignal) return;

  const rrs = getValidRRs();
  if (rrs.length < 2) return;

  const rmssd = calculateRMSSD(rrs);
  vfcState.rmssd = rmssd;

  if (!isBaselineReady) {
    if (ignoredSamplesCount < BASELINE_IGNORE_SAMPLES) {
      ignoredSamplesCount += 1;
      return;
    }
    updateBaselineFromSlidingWindow(rmssd);
    if (baselineSamples.length >= BASELINE_SAMPLES) {
      isBaselineReady = true;
      vfcState.isBaselineReady = true;
    }
    return;
  }

  const frozen = useFrozenCalibrationBaselineInGameplay && calibrationRmssdSnapshot != null && calibrationRmssdSnapshot > 0;

  if (frozen && calibrationRmssdSnapshot != null) {
    const snap = calibrationRmssdSnapshot;
    vfcState.baseline = snap;
    vfcState.runningMedian = snap;
  } else {
    updateBaselineFromSlidingWindow(rmssd);
  }

  const baselineValue = vfcState.baseline ?? 0;
  if (baselineValue > 0) {
    vfcState.normalizedScore = (rmssd / (2 * baselineValue)) * 100;
    vfcState.rmssdTier = computeRmssdTier(rmssd, baselineValue);
  } else {
    vfcState.normalizedScore = 0;
    vfcState.rmssdTier = 0;
  }

  const meanRR = rrs.reduce((a, b) => a + b, 0) / rrs.length;
  const heartRate = Math.round(60_000 / meanRR);
  const reading: VFCReading = { rmssd, heartRate, timestamp: Date.now() };

  if (vfcSession?.isActive) {
    vfcSession.data.push(reading);
    vfcSession.rmssd = rmssd;
    vfcSession.heartRate = heartRate;
  }
};

export const startVFCSession = (): void => {
  clearMetricsInterval();
  metricsPausedForSensorNoSignal = false;
  beats.length = 0;
  lastValidRR = null;
  vfcState.rmssd = 0;

  vfcSession = {
    rmssd: 0,
    heartRate: 0,
    isActive: true,
    data: []
  };

  metricsIntervalId = setInterval(runMetricsUpdate, METRICS_INTERVAL_MS);
};

export const stopVFCSession = (): void => {
  clearMetricsInterval();
  if (vfcSession) {
    vfcSession.isActive = false;
  }
};

const isValidBeat = (rrMs: number): boolean => {
  if (lastValidRR === null) return true;
  const deviation = Math.abs(rrMs - lastValidRR) / lastValidRR;
  return deviation <= ANOMALY_THRESHOLD;
};

export const processVFCData = (input: VFCInput, deviceFiltered = false): void => {
  const rrMs = (input.rrInterval / 1024) * 1000;

  if (rrMs < RR_MIN_MS || rrMs > RR_MAX_MS) {
    return;
  }

  const valid = deviceFiltered ? false : isValidBeat(rrMs);
  const ts = input.timestamp ?? Date.now();

  beats.push({ rr: rrMs, ts, valid });
  pruneWindow();

  if (valid) {
    lastValidRR = rrMs;
    sessionSamples.push({ timestamp: input.timestamp, rr: rrMs });
    vfcState.rrIntervals.push(rrMs);
    if (vfcState.rrIntervals.length > MAX_RR_INTERVALS) {
      vfcState.rrIntervals.shift();
    }
  }
};

export const setVFCMetricsPausedForSensorNoSignal = (paused: boolean): void => {
  metricsPausedForSensorNoSignal = paused;
};

export const getVFCState = (): VFCState => vfcState;

export const getLastValidRR = (): number | null => lastValidRR;

export const getVFCSession = (): VFCSession | null => vfcSession;

export const getCalibrationRmssdBaseline = (): number | null => calibrationRmssdSnapshot;

export const resetVFCState = (): void => {
  clearMetricsInterval();
  metricsPausedForSensorNoSignal = false;
  vfcState.rrIntervals = [];
  vfcState.baseline = null;
  vfcState.baselineSamplesCount = 0;
  vfcState.baselineSamplesSnapshot = [];
  vfcState.runningMedian = 0;
  vfcState.rmssd = 0;
  vfcState.normalizedScore = 0;
  vfcState.rmssdTier = 0;
  baselineSamples.length = 0;
  beats.length = 0;
  lastValidRR = null;
  sessionSamples.length = 0;
  gameStartSampleIndex = -1;
  gameEndSampleIndex = -1;
  calibrationEndIndex = -1;
  ignoredSamplesCount = 0;
  isBaselineReady = false;
  vfcState.isBaselineReady = false;
  calibrationRmssdSnapshot = null;
  useFrozenCalibrationBaselineInGameplay = false;
};

export const markCalibrationComplete = (difficulty: MenuDifficultyId): void => {
  calibrationEndIndex = sessionSamples.length;
  gameEndSampleIndex = -1;

  const snap = vfcState.baseline;
  calibrationRmssdSnapshot = snap != null && snap > 0 ? snap : null;
  useFrozenCalibrationBaselineInGameplay =
    (difficulty === 'easy' || difficulty === 'medium') && calibrationRmssdSnapshot != null && calibrationRmssdSnapshot > 0;
};

export const markSessionPlayStart = (): void => {
  if (gameStartSampleIndex >= 0) return;
  gameStartSampleIndex = sessionSamples.length;
  gameEndSampleIndex = -1;
};

export const markGameEnd = (): void => {
  if (gameEndSampleIndex < 0) {
    gameEndSampleIndex = sessionSamples.length;
  }
};

export const markGameRestart = (): void => {
  gameStartSampleIndex = -1;
  gameEndSampleIndex = -1;
};

export const getSessionSamples = (): SessionSample[] => [...sessionSamples];

export const getCalibrationSamples = (): SessionSample[] => (calibrationEndIndex <= 0 ? [] : sessionSamples.slice(0, calibrationEndIndex));

export const getGameSamples = (): SessionSample[] => {
  if (gameStartSampleIndex < 0) return [];
  const end = gameEndSampleIndex >= 0 ? gameEndSampleIndex : sessionSamples.length;
  return sessionSamples.slice(gameStartSampleIndex, end);
};

export const clearGameSamplesAfterSubmit = (): void => {
  gameStartSampleIndex = sessionSamples.length;
};

export const resetVFCSession = (): void => {
  vfcSession = null;
};
