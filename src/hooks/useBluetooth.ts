import { useEffect, useRef, useState } from 'react';
import { createBLEService } from '../services/bluetooth';
import type { BLEState } from '../types';
import { BLE_CONFIG } from '../utils/constants';

export function useBluetooth() {
  const [bleState, setBleState] = useState<BLEState>({
    isConnected: false,
    deviceName: null,
    batteryLevel: null,
    heartRate: null,
    lastDataReceivedAt: null,
    lastRRReceivedAt: null,
    sensorContactStatus: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceRef = useRef<ReturnType<typeof createBLEService> | null>(null);

  useEffect(() => {
    serviceRef.current = createBLEService();

    const unsubscribe = serviceRef.current.onStateChanged((state: BLEState) => {
      setBleState(state);
    });

    setBleState(serviceRef.current.getState());

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!bleState.isConnected) return;
    const POLL_INTERVAL_MS = Math.max(1000, Math.min(5000, Math.floor(BLE_CONFIG.BATTERY_UPDATE_INTERVAL / 10)));

    const intervalId = window.setInterval(() => {
      const service = serviceRef.current;
      if (!service) return;

      const nextState = service.getState();
      setBleState((prev) => {
        const isSame =
          prev.isConnected === nextState.isConnected &&
          prev.deviceName === nextState.deviceName &&
          prev.batteryLevel === nextState.batteryLevel &&
          prev.heartRate === nextState.heartRate &&
          prev.lastDataReceivedAt === nextState.lastDataReceivedAt &&
          prev.lastRRReceivedAt === nextState.lastRRReceivedAt &&
          prev.sensorContactStatus === nextState.sensorContactStatus;

        return isSame ? prev : nextState;
      });
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [bleState.isConnected]);

  const connect = async () => {
    if (!serviceRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      await serviceRef.current.connect();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      console.error('Erro ao conectar BLE:', message);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    if (serviceRef.current) {
      serviceRef.current.disconnect();
    }
  };

  return {
    isConnected: bleState.isConnected,
    deviceName: bleState.deviceName,
    batteryLevel: bleState.batteryLevel,
    heartRate: bleState.heartRate,
    lastDataReceivedAt: bleState.lastDataReceivedAt,
    lastRRReceivedAt: bleState.lastRRReceivedAt,
    sensorContactStatus: bleState.sensorContactStatus,
    isLoading,
    error,
    connect,
    disconnect
  };
}
