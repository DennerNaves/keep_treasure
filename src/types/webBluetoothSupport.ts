export type Platform = 'linux' | 'mac' | 'windows' | 'ios' | 'android' | 'unknown';

export type Browser = 'chrome' | 'edge' | 'firefox' | 'safari' | 'opera' | 'samsung' | 'unknown';

export interface WebBluetoothSupportResult {
  supported: boolean;
  platform: Platform;
  browser: Browser;
  chromeVersion: number | null;
  showWarning: boolean;
  message: string;
  shortLabel: string;
  disableConnect: boolean;
}
