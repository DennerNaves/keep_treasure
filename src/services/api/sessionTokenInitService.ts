import type { SessionContext, SessionInitResult } from '../../types';
import { SESSION_STORAGE_KEY } from '../../utils/constants';

export const isDevSessionBypassEnabled = (): boolean => true;

export const getSessionApiBaseUrl = (): string => '';

const createOfflineSessionContext = (): SessionContext => ({
  sessionId: 'offline-session',
  terapeutaId: 'local-therapist',
  pacienteId: 'local-patient',
  clinicId: 'local-clinic',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
});

export const isSessionTokenValid = (expiresAt: string, sessionDurationSeconds: number): boolean => {
  void expiresAt;
  void sessionDurationSeconds;
  return true;
};

export async function initSessionToken(): Promise<SessionInitResult> {
  const context = createOfflineSessionContext();
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(context));
  } catch {
    // O jogo continua funcional mesmo quando o armazenamento estiver indisponivel.
  }
  return { context };
}

export function getSessionContextFromStorage(): SessionContext {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionContext) : createOfflineSessionContext();
  } catch {
    return createOfflineSessionContext();
  }
}
