import { BLE_CONFIG } from './constants';

export const isRecentRrReceived = (
  lastRRReceivedAt: number | null,
  nowMs: number,
  staleMs: number = BLE_CONFIG.RR_SIGNAL_STALE_MS
): boolean => lastRRReceivedAt != null && nowMs - lastRRReceivedAt <= staleMs;
