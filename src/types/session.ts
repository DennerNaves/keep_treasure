export interface SessionApiResponse {
  key: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    birthdate: string;
    patient_image?: string;
    responsible_user: string;
    clinic: string;
    [key: string]: unknown;
  };
  user: {
    id: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    [key: string]: unknown;
  };
  game: string;
  expires_at: string;
  server_time?: string;
  created_at?: string;
}

export interface SessionContext {
  sessionId: string;
  terapeutaId: string;
  pacienteId: string;
  clinicId: string;
  expiresAt: string;
  [key: string]: unknown;
}

export type SessionInvalidReason = 'invalid' | 'expired' | 'network';

export type SessionInitResult = { context: SessionContext } | { context: null; error?: SessionInvalidReason };

export interface SessionContextValue {
  sessionContext: SessionContext | null;
  sessionError: SessionInvalidReason | null;
  isLoading: boolean;
  setSessionInvalid: (reason: SessionInvalidReason) => void;
}
