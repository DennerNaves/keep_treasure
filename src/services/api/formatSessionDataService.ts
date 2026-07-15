import type { SessionExportData, SessionExportDataWithoutSensor, SessionExportDataWithSensor } from '../../types';
import { getCalibrationSamples, getGameSamples } from '../vfc';

let hasWarnedNoVfcData = false;

const formatSamplesToThrHr = (raw: Array<{ timestamp: number; rr: number }>): Array<{ t: number; rr: number; hr: number }> => {
  if (raw.length === 0) return [];

  const startTime = raw[0].timestamp;
  return raw.map((sample) => {
    const rrValue = sample.rr;
    const hrValue = rrValue > 0 ? Math.round(60000 / rrValue) : 0;

    return {
      t: sample.timestamp - startTime,
      rr: Math.round(rrValue),
      hr: hrValue
    };
  });
};

const buildSessionBase = (params: {
  sessionLimit: number;
  sessionCompleted: boolean;
  elapsedTimeMs: number;
  difficult_level: string | null;
}) => {
  const durationSeconds = parseFloat((params.elapsedTimeMs / 1000).toFixed(1));
  return {
    selected_session_time: params.sessionLimit,
    session_completed: params.sessionCompleted,
    session_duration: durationSeconds,
    difficult_level: params.difficult_level
  };
};

export function formatSessionData(params: {
  withSensor: false;
  sessionLimit: number;
  sessionCompleted: boolean;
  elapsedTimeMs: number;
  difficult_level: string | null;
}): SessionExportDataWithoutSensor;

export function formatSessionData(params: {
  withSensor: true;
  cyclesPerMinute: number;
  sessionLimit: number;
  sessionCompleted: boolean;
  elapsedTimeMs: number;
  difficult_level: string | null;
}): SessionExportDataWithSensor | null;

export function formatSessionData(params: {
  withSensor: boolean;
  cyclesPerMinute?: number;
  sessionLimit: number;
  sessionCompleted: boolean;
  elapsedTimeMs: number;
  difficult_level: string | null;
}): SessionExportData | null {
  const base = buildSessionBase(params);

  if (!params.withSensor) {
    return {
      ...base,
      with_sensor: false
    };
  }

  const rawSamples = getGameSamples();
  if (rawSamples.length === 0) {
    if (!hasWarnedNoVfcData) {
      hasWarnedNoVfcData = true;
    }
    return null;
  }

  hasWarnedNoVfcData = false;

  const formattedSamples = formatSamplesToThrHr(rawSamples);
  const calibrationRaw = getCalibrationSamples();
  const calibrationFormatted = formatSamplesToThrHr(calibrationRaw);

  return {
    ...base,
    with_sensor: true,
    respiratory_rate: params.cyclesPerMinute ?? 0,
    samples: formattedSamples,
    calibration_samples: calibrationFormatted
  };
}
