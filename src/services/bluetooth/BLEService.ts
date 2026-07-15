import type { BLEServiceInstance, BLEState, BluetoothChar, BluetoothDev, BluetoothServer } from '../../types';
import { BLE_CONFIG, VFC_CONFIG } from '../../utils/constants';
import { getLastValidRR, processVFCData } from '../vfc';

const { RR_MIN_MS, RR_MAX_MS, GAP_MIN_MS, GAP_RR_FRACTION } = VFC_CONFIG;

let serviceInstance: BLEServiceInstance | null = null;

export function createBLEService(): BLEServiceInstance {
  if (serviceInstance) {
    return serviceInstance;
  }

  let device: BluetoothDev | null = null;
  let server: BluetoothServer | null = null;
  let characteristic: BluetoothChar | null = null;
  let batteryCharacteristic: BluetoothChar | null = null;

  let state: BLEState = {
    isConnected: false,
    deviceName: null,
    batteryLevel: null,
    heartRate: null,
    lastDataReceivedAt: null,
    lastRRReceivedAt: null,
    sensorContactStatus: null
  };

  let lastHeartRateNotifyTime = 0;
  let lastNotifTs: number | null = null;
  let signalStalenessIntervalId: ReturnType<typeof setInterval> | null = null;

  const HEART_RATE_DISPLAY_THROTTLE_MS = 400;
  const SIGNAL_STALE_MS = BLE_CONFIG.RR_SIGNAL_STALE_MS;
  const stateChangeListeners: Array<(state: BLEState) => void> = [];

  const HEART_RATE_SERVICE = 'heart_rate';
  const HEART_RATE_MEASUREMENT = 'heart_rate_measurement';
  const BATTERY_SERVICE = 0x180f;
  const BATTERY_LEVEL = 0x2a19;

  const clearSignalStalenessCheck = (): void => {
    if (signalStalenessIntervalId) {
      clearInterval(signalStalenessIntervalId);
      signalStalenessIntervalId = null;
    }
  };

  const updateConnectionState = (isConnected: boolean): void => {
    if (!isConnected) {
      lastHeartRateNotifyTime = 0;
      lastNotifTs = null;
      clearSignalStalenessCheck();
    }

    state = {
      ...state,
      isConnected,
      deviceName: isConnected ? (device?.name ?? null) : null,
      batteryLevel: isConnected ? state.batteryLevel : null,
      heartRate: isConnected ? state.heartRate : null,
      lastDataReceivedAt: isConnected ? state.lastDataReceivedAt : null,
      lastRRReceivedAt: isConnected ? state.lastRRReceivedAt : null,
      sensorContactStatus: isConnected ? state.sensorContactStatus : null
    };

    stateChangeListeners.forEach((listener) => {
      listener({ ...state });
    });

    if (isConnected && !signalStalenessIntervalId) {
      signalStalenessIntervalId = setInterval(() => {
        if (!state.isConnected || state.lastDataReceivedAt == null) return;
        const stale = Date.now() - state.lastDataReceivedAt > SIGNAL_STALE_MS;
        if (stale && state.heartRate !== null) {
          state.heartRate = null;
          stateChangeListeners.forEach((listener) => listener({ ...state }));
        }
      }, 500);
    }
  };

  const handleDisconnect = (): void => {
    lastHeartRateNotifyTime = 0;
    lastNotifTs = null;
    clearSignalStalenessCheck();
    state = {
      ...state,
      isConnected: false,
      deviceName: null,
      batteryLevel: null,
      heartRate: null,
      lastDataReceivedAt: null,
      lastRRReceivedAt: null,
      sensorContactStatus: null
    };
    stateChangeListeners.forEach((listener) => listener({ ...state }));
  };

  const handleHeartRateMeasurement = (event: Event): void => {
    try {
      const target = event.target as unknown as { value: DataView };
      const value = target.value;

      if (!value) return;

      const flags = value.getUint8(0);
      const bpmFormat = flags & 0x01;
      const sensorContactBits = (flags >> 1) & 0x03;

      let sensorContactStatus: 'not-supported' | 'not-detected' | 'detected';
      if (sensorContactBits === 0b00) {
        sensorContactStatus = 'not-supported';
      } else if (sensorContactBits === 0b10) {
        sensorContactStatus = 'not-detected';
      } else {
        sensorContactStatus = 'detected';
      }
      state.sensorContactStatus = sensorContactStatus;

      const rawHeartRate = bpmFormat === 1 ? value.getUint16(1, true) : value.getUint8(1);

      const now = Date.now();
      const isValidBpm = rawHeartRate > 0 && rawHeartRate <= 250;
      let hasValidSignal = false;

      if (isValidBpm) {
        if (sensorContactStatus !== 'not-detected') {
          state.heartRate = rawHeartRate;
          hasValidSignal = true;
        }
      } else if (sensorContactStatus === 'not-detected') {
        state.heartRate = null;
      }

      const shouldNotify = now - lastHeartRateNotifyTime >= HEART_RATE_DISPLAY_THROTTLE_MS || isValidBpm;
      if (shouldNotify) {
        lastHeartRateNotifyTime = now;
        stateChangeListeners.forEach((listener) => listener({ ...state }));
      }

      let offset = bpmFormat === 1 ? 3 : 2;

      const energyPresent = flags & 0x08;
      if (energyPresent) offset += 2;

      const rrIntervalPresent = flags & 0x10;

      if (rrIntervalPresent && sensorContactStatus !== 'not-detected') {
        const notifTs = Date.now();
        const rrBatch: number[] = [];
        while (offset + 1 < value.byteLength) {
          const rrRaw = value.getUint16(offset, true);
          offset += 2;
          const rrMs = Math.round((rrRaw * 1000) / 1024);
          if (rrMs >= RR_MIN_MS && rrMs <= RR_MAX_MS) {
            rrBatch.push(rrMs);
          }
        }

        if (rrBatch.length > 0) {
          if (lastNotifTs !== null) {
            const elapsed = notifTs - lastNotifTs;
            const reported = rrBatch.reduce((a, b) => a + b, 0);
            const gap = elapsed - reported;
            const estRR = getLastValidRR() ?? 800;

            if (gap > Math.max(GAP_MIN_MS, estRR * GAP_RR_FRACTION)) {
              const nMissing = Math.max(1, Math.round(gap / estRR));
              for (let i = 0; i < nMissing; i += 1) {
                const syntheticTs = lastNotifTs + Math.round(estRR * (i + 1));
                const rrInterval = Math.round((estRR * 1024) / 1000);
                processVFCData({ rrInterval, timestamp: syntheticTs }, true);
              }
            }
          }

          rrBatch.forEach((rrMs) => {
            const rrInterval = Math.round((rrMs * 1024) / 1000);
            processVFCData({ rrInterval, timestamp: notifTs });
          });

          hasValidSignal = true;
          state.lastRRReceivedAt = notifTs;
          lastNotifTs = notifTs;
        }
      }

      if (hasValidSignal) {
        state.lastDataReceivedAt = now;
      }
    } catch (error) {
      console.error('❌ Erro ao processar dados HR:', error);
    }
  };

  const readBatteryLevel = async (): Promise<void> => {
    try {
      if (!server) return;
      const batteryService = await server.getPrimaryService(BATTERY_SERVICE);
      batteryCharacteristic = await batteryService.getCharacteristic(BATTERY_LEVEL);

      const initialValue = await batteryCharacteristic.readValue?.();
      if (initialValue) {
        state.batteryLevel = (initialValue as DataView).getUint8(0);
      }

      await batteryCharacteristic.startNotifications();
      batteryCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as unknown as { value: DataView };
        if (target.value) {
          state.batteryLevel = (target.value as DataView).getUint8(0);
        }
      });
    } catch (error) {
      console.error('❌ Erro ao obter nível de bateria:', error);
      state.batteryLevel = null;
    }
  };

  const connect = async (): Promise<void> => {
    try {
      device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE] }],
        optionalServices: [BATTERY_SERVICE]
      });

      if (!device) {
        throw new Error('Dispositivo não selecionado');
      }

      device.addEventListener('gattserverdisconnected', handleDisconnect);

      server = await device.gatt.connect();

      const service = await server.getPrimaryService(HEART_RATE_SERVICE);

      characteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT);

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleHeartRateMeasurement);

      await readBatteryLevel();

      updateConnectionState(true);
    } catch (error) {
      updateConnectionState(false);
      throw error;
    }
  };

  const disconnect = (): void => {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
    }
    handleDisconnect();
  };

  const getState = (): BLEState => {
    return { ...state };
  };

  const onStateChangedHandler = (callback: (state: BLEState) => void): (() => void) => {
    stateChangeListeners.push(callback);
    return () => {
      const index = stateChangeListeners.indexOf(callback);
      if (index > -1) {
        stateChangeListeners.splice(index, 1);
      }
    };
  };

  const isConnected = (): boolean => {
    return state.isConnected;
  };

  const getBatteryLevel = (): number | null => {
    return state.batteryLevel;
  };

  const getDeviceName = (): string | null => {
    return state.deviceName;
  };

  const getHeartRate = (): number | null => {
    return state.heartRate;
  };

  serviceInstance = {
    connect,
    disconnect,
    getState,
    onStateChanged: onStateChangedHandler,
    isConnected,
    getBatteryLevel,
    getDeviceName,
    getHeartRate
  };

  return serviceInstance;
}
