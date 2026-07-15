import type { BluetoothDev } from './bluetooth';

declare global {
  interface Navigator {
    bluetooth: {
      requestDevice(options: {
        filters?: Array<{ services?: (string | number)[] }>;
        optionalServices?: (string | number)[];
      }): Promise<BluetoothDev>;
    };
  }
}

export {};
