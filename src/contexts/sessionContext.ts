import { createContext, useContext } from 'react';
import type { SessionContextValue } from '../types';

export const SessionStateContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionStateContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
