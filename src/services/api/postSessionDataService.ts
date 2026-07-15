import type { SessionExportData } from '../../types';
import { API_SESSION_SUBMIT_PATH } from '../../utils/constants';
import {
  getSessionApiBaseUrl,
  getSessionContextFromStorage,
  isDevSessionBypassEnabled
} from './sessionTokenInitService';

const formatSessionTime = (seconds: number): string => {
  const totalSeconds = Math.max(0, seconds);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export async function postSessionData(data: SessionExportData, score: number): Promise<{ ok: boolean; error?: string }> {
  if (isDevSessionBypassEnabled()) return { ok: true };

  const ctx = getSessionContextFromStorage();
  const baseUrl = getSessionApiBaseUrl();

  if (!ctx || !baseUrl) return { ok: false, error: 'invalid_session' };

  const common = {
    with_sensor: data.with_sensor,
    selected_session_time: formatSessionTime(data.selected_session_time),
    session_time_played: formatSessionTime(data.session_duration),
    session_completed: data.session_completed,
    difficult_level: data.difficult_level
  };

  const payload =
    data.with_sensor === true
      ? {
          ...common,
          samples: { data: data.samples },
          calibration_samples: { data: data.calibration_samples },
          score,
          respiratory_rate: String(data.respiratory_rate)
        }
      : common;

  const url = `${baseUrl.replace(/\/$/, '')}/jogos_web/${API_SESSION_SUBMIT_PATH}/`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${ctx.sessionId}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { ok: false, error: errorText || `HTTP ${response.status}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
