import SessionInvalidScreen from '../components/SessionInvalidScreen';
import LoadingScreen from '../components/SessionInvalidScreen/loadingScreen';

import { useEffect, useState } from 'react';
import { initSessionToken } from '../services/api';
import type { SessionContext, SessionContextValue, SessionInitResult, SessionInvalidReason } from '../types';
import { SESSION_STORAGE_KEY } from '../utils/constants';
import { SessionStateContext } from './sessionContext';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const [sessionError, setSessionError] = useState<SessionInvalidReason | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const result: SessionInitResult = await initSessionToken();

      const clearStoredSession = () => {
        try {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        } catch {
          void 0;
        }
      };

      if (result.context) {
        setSessionContext(result.context);
        setSessionError(null);
      } else if (result.error) {
        clearStoredSession();
        setSessionContext(null);
        setSessionError(result.error);
      } else {
        clearStoredSession();
        setSessionContext(null);
        setSessionError(null);
      }
      setIsLoading(false);
    };
    void run();
  }, []);

  const setSessionInvalid = (reason: SessionInvalidReason) => {
    setSessionError(reason);
  };

  const value: SessionContextValue = {
    sessionContext,
    sessionError,
    isLoading,
    setSessionInvalid
  };

  return (
    <SessionStateContext.Provider value={value}>
      {isLoading && <LoadingScreen />}
      {!isLoading && sessionError && <SessionInvalidScreen reason={sessionError} />}
      {!isLoading && !sessionError && children}
    </SessionStateContext.Provider>
  );
}
