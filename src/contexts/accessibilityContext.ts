import { createContext, useContext } from 'react';
import type { AccessibilityContextValue } from '../types';

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function useAccessibility(): AccessibilityContextValue {
  const value = useContext(AccessibilityContext);
  if (!value) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return value;
}
