export type PortalGameOverPayload = {
  type: 'KEEP_GAME_OVER';
  score?: number;
};

export type PortalBackPayload = {
  type: 'KEEP_BACK_TO_PORTAL';
};

export type PortalHostCommandPayload = {
  type: 'KEEP_HOST_COMMAND';
  action: 'restart_calibration';
  reason?: string;
};

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export function notifyGameOver(score?: number): void {
  void score;
}

export function notifyBackToPortal(): void {
  window.location.reload();
}

export function parsePortalHostCommand(rawData: unknown): PortalHostCommandPayload | null {
  let payload = rawData;

  if (typeof rawData === 'string') {
    try {
      payload = JSON.parse(rawData) as unknown;
    } catch {
      return null;
    }
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as Partial<PortalHostCommandPayload>;
  if (candidate.type !== 'KEEP_HOST_COMMAND') {
    return null;
  }

  if (candidate.action !== 'restart_calibration') {
    return null;
  }

  return {
    type: 'KEEP_HOST_COMMAND',
    action: 'restart_calibration',
    ...(typeof candidate.reason === 'string' ? { reason: candidate.reason } : {})
  };
}
