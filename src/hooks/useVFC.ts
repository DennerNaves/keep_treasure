import { useEffect, useRef, useState } from 'react';
import { getVFCState } from '../services/vfc';
import type { RmssdTier, UseVFCResult } from '../types';

export function useVFC(): UseVFCResult {
  const [rmssdTier, setRmssdTier] = useState<RmssdTier>(0);
  const [rmssd, setRmssd] = useState(0);
  const [normalizedScore, setNormalizedScore] = useState(0);
  const [isBaselineReady, setIsBaselineReady] = useState(false);
  const [baselineSamplesCount, setBaselineSamplesCount] = useState(0);
  const [baseline, setBaseline] = useState<number | null>(null);
  const [rrIntervals, setRrIntervals] = useState<number[]>([]);
  const [baselineSamplesSnapshot, setBaselineSamplesSnapshot] = useState<number[]>([]);
  const [runningMedian, setRunningMedian] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const vfcState = getVFCState();
      setRmssdTier(vfcState.rmssdTier);
      setRmssd(vfcState.rmssd);
      setNormalizedScore(vfcState.normalizedScore);
      setIsBaselineReady(vfcState.isBaselineReady);
      setBaselineSamplesCount(vfcState.baselineSamplesCount);
      setBaseline(vfcState.baseline);
      setRrIntervals(vfcState.rrIntervals);
      setBaselineSamplesSnapshot(vfcState.baselineSamplesSnapshot);
      setRunningMedian(vfcState.runningMedian);
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    rmssdTier,
    rmssd,
    normalizedScore,
    isBaselineReady,
    baselineSamplesCount,
    baseline,
    rrIntervals,
    baselineSamplesSnapshot,
    runningMedian
  };
}
