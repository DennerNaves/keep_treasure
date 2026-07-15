export type RmssdTier = number;

export interface VFCState {
  rrIntervals: number[];
  baseline: number | null;
  baselineSamplesCount: number;
  baselineSamplesSnapshot: number[];
  runningMedian: number;
  rmssd: number;
  normalizedScore: number;

  rmssdTier: RmssdTier;
  isBaselineReady: boolean;
}

export interface VFCInput {
  rrInterval: number;
  heartRate?: number;
  timestamp: number;
}

export interface VFCReading {
  rmssd: number;
  heartRate: number;
  timestamp: number;
}

export interface VFCSession {
  rmssd: number;
  heartRate: number;
  isActive: boolean;
  data: VFCReading[];
}

export interface SessionSample {
  timestamp: number;
  rr: number;
}

export interface UseVFCResult {
  rmssdTier: RmssdTier;
  rmssd: number;
  normalizedScore: number;
  isBaselineReady: boolean;
  baselineSamplesCount: number;
  baseline: number | null;
  rrIntervals: number[];
  baselineSamplesSnapshot: number[];
  runningMedian: number;
}

export interface SessionExportDataBase {
  selected_session_time: number;
  session_completed: boolean;
  session_duration: number;
  difficult_level: string | null;
}

export interface SessionExportDataWithSensor extends SessionExportDataBase {
  with_sensor: true;
  respiratory_rate: number;
  samples: Array<{ t: number; rr: number; hr: number }>;
  calibration_samples: Array<{ t: number; rr: number; hr: number }>;
}

export interface SessionExportDataWithoutSensor extends SessionExportDataBase {
  with_sensor: false;
}

export type SessionExportData = SessionExportDataWithSensor | SessionExportDataWithoutSensor;
