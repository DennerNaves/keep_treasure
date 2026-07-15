export interface BluetoothChar {
  startNotifications(): Promise<void>;
  addEventListener(event: string, handler: (e: Event) => void): void;
  value?: DataView;
  readValue?(): Promise<DataView>;
}

export interface BluetoothServ {
  getCharacteristic(char: string | number): Promise<BluetoothChar>;
}

export interface BluetoothServer {
  getPrimaryService(service: string | number): Promise<BluetoothServ>;
}

export interface BluetoothDev {
  name: string;
  gatt: {
    connected: boolean;
    connect(): Promise<BluetoothServer>;
    disconnect(): void;
  };
  addEventListener(event: string, handler: () => void): void;
}

export interface BLEDevice {
  id: string;
  name: string;
  connected: boolean;
  batteryLevel: number | null;
}

export interface Bluetooth {
  isConnected: boolean;
  device: BLEDevice | null;
  batteryLevel: number | null;
}

export interface BLEState {
  isConnected: boolean;
  deviceName: string | null;
  batteryLevel: number | null;
  heartRate: number | null;
  lastDataReceivedAt: number | null;
  lastRRReceivedAt: number | null;
  sensorContactStatus: 'detected' | 'not-detected' | 'not-supported' | null;
}

export interface BLEServiceInstance {
  connect: () => Promise<void>;
  disconnect: () => void;
  getState: () => BLEState;
  onStateChanged: (callback: (state: BLEState) => void) => () => void;
  isConnected: () => boolean;
  getBatteryLevel: () => number | null;
  getDeviceName: () => string | null;
  getHeartRate: () => number | null;
}
