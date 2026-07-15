import styled from 'styled-components';

export const SensorMenuContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--menu-bg-overlay-pause);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 195;
  padding: clamp(0.75rem, 3vw, 1.5rem);
  box-sizing: border-box;
`;

export const SensorMenuContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.75rem, 2.5vw, 1.5rem);
  padding: clamp(1rem, 3vw, 2rem) clamp(1.25rem, 4vw, 2rem);
  background: var(--menu-content-bg);
  border: 4px solid var(--menu-content-border);
  border-radius: clamp(12px, 2.5vw, 20px);
  box-shadow: var(--menu-shadow-card);
  width: min(92vw, clamp(280px, 50vw, 480px));
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
`;

export const SensorMenuTitle = styled.h1`
  font-size: clamp(1.35rem, 4vw, 1.9rem);
  font-family: var(--font-ui), sans-serif;
  color: var(--menu-primary);
  margin: 0;
  text-align: center;
  text-shadow: 2px 2px 0 var(--menu-title-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

export const SensorMenuBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: clamp(0.75rem, 2vw, 1.25rem);
  width: 100%;
  min-width: 0;
`;

export const SensorStatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--menu-bg-teal-10);
  border: 2px solid var(--menu-content-border);
  border-radius: 8px;
  font-family: var(--font-primary);
  font-size: clamp(0.9rem, 2vw, 1rem);
`;

export const SensorStatLabel = styled.span`
  color: var(--menu-text-muted);
  font-weight: 600;
`;

export const SensorStatValue = styled.span<{ $ok?: boolean; $warn?: boolean }>`
  color: ${(p) => (p.$warn ? 'var(--menu-accent)' : p.$ok ? 'var(--menu-connected)' : 'var(--menu-text-primary)')};
  font-weight: 700;
`;

export const SensorHint = styled.p`
  font-family: var(--font-primary);
  font-size: clamp(0.85rem, 1.8vw, 0.95rem);
  color: var(--menu-text-muted);
  margin: 0;
  line-height: 1.5;
  text-align: center;
  padding: 0.5rem 0;
`;

export const SensorCloseButton = styled.button`
  padding: 0.9rem 2rem;
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-family: var(--font-ui), sans-serif;
  background: var(--menu-btn-action-bg);
  color: var(--menu-btn-action-text);
  border: 2px solid var(--menu-btn-action-border);
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.1s,
    box-shadow 0.2s;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;

  &:hover:not(:disabled) {
    transform: scale(1.02);
    background: var(--menu-btn-action-hover);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;
