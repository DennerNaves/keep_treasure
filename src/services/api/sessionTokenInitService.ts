import type { SessionApiResponse, SessionContext, SessionInitResult } from '../../types';
import { SESSION_STORAGE_KEY, SESSION_TOKEN_BUFFER_MINUTES } from '../../utils/constants';

export const getSessionApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  return (typeof url === 'string' ? url.trim() : '') || '';
};

const getEffectiveToken = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token') ?? params.get('t');
  if (urlToken) return urlToken;
  if (import.meta.env.PROD) return null;

  const devToken = import.meta.env.VITE_DEV_SESSION_TOKEN;
  return typeof devToken === 'string' && devToken.trim() ? devToken.trim() : null;
};

const mapApiResponseToContext = (res: SessionApiResponse): SessionContext => ({
  sessionId: res.key,
  terapeutaId: res.user.id,
  pacienteId: res.patient.id,
  clinicId: res.patient.clinic,
  expiresAt: res.expires_at
});

export const isSessionTokenValid = (expiresAt: string, sessionDurationSeconds: number): boolean => {
  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) return false;

  const now = Date.now();
  const bufferMs = SESSION_TOKEN_BUFFER_MINUTES * 60 * 1000;
  const requiredUntil = now + sessionDurationSeconds * 1000 + bufferMs;

  return expiresAtMs >= requiredUntil;
};

export const isDevSessionBypassEnabled = (): boolean =>
  import.meta.env.DEV === true && import.meta.env.VITE_BYPASS_SESSION_IN_DEV === 'true';

export async function initSessionToken(): Promise<SessionInitResult> {
  if (isDevSessionBypassEnabled()) {
    return {
      context: {
        sessionId: 'dev-bypass',
        terapeutaId: '',
        pacienteId: '',
        clinicId: '',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }

  const token = getEffectiveToken();
  if (!token) return { context: null, error: 'invalid' };

  const baseUrl = getSessionApiBaseUrl();
  if (!baseUrl) return { context: null, error: 'invalid' };

  const url = `${baseUrl.replace(/\/$/, '')}/jogos_web/sessao/${token}/`;

  try {
    const response = await fetch(url);
    if (!response.ok) return { context: null, error: 'invalid' };

    const data = (await response.json()) as SessionApiResponse;
    if (!data?.key || !data?.patient?.id || !data?.user?.id) return { context: null, error: 'invalid' };

    const context = mapApiResponseToContext(data);

    const expiresAt = new Date(data.expires_at).getTime();
    if (Number.isNaN(expiresAt) || expiresAt < Date.now()) {
      return { context: null, error: 'expired' };
    }

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(context));
    return { context };
  } catch {
    return { context: null, error: 'network' };
  }
}

export function getSessionContextFromStorage(): SessionContext | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionContext) : null;
  } catch {
    return null;
  }
}
