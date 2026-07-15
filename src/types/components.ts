export interface TopBarProps {
  time: string;
  score: number;
  onPause: () => void;
  onFullscreen: () => void;
  onToggleMusic: () => void;
  onToggleSFX: () => void;
  onSensorClick?: () => void;
  isMusicOn?: boolean;
  isSFXOn?: boolean;
  isFullscreen?: boolean;
}

export type SensorHudConnection = 'connected' | 'no-signal' | 'persistent-no-signal' | 'disconnected';

export interface StatusBarProps {
  activeCompanionHudCount: number;
  displayValue: number;
  cyclesPerMinute: number;
  baselineStatus?: string;
  sensorHudConnection: SensorHudConnection;
}

export interface GameOverProps {
  finalScore: number;
  sessionTime: number;
  sessionCompleted: boolean;
}

export interface SensorInfoMenuProps {
  isOpen: boolean;
  onClose: () => void;
}
