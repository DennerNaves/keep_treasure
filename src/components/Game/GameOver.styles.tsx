import styled from 'styled-components';
import { Z_INDEX } from '../../utils/zIndex';

export const GameOverContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--menu-bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Z_INDEX.gameOverlay};
  padding: clamp(0.75rem, 3vw, 1.5rem);
  box-sizing: border-box;
`;

export const GameOverContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.75rem, 2.5vw, 1.5rem);
  padding: clamp(1rem, 3vw, 2rem) clamp(1.25rem, 4vw, 2rem);
  background: var(--menu-content-bg);
  border: 4px solid var(--menu-content-border);
  border-radius: clamp(12px, 2.5vw, 20px);
  box-shadow: var(--menu-shadow-card);
  width: min(92vw, clamp(260px, 50vw, 520px));
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
`;

export const Title = styled.h1`
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-family: var(--font-ui), sans-serif;
  color: var(--menu-primary);
  margin: 0;
  text-align: center;
  text-shadow: 3px 3px 0 var(--menu-title-shadow);
`;

export const Subtitle = styled.p`
  font-size: 1.2rem;
  font-family: var(--font-ui), sans-serif;
  color: var(--menu-text-primary);
  margin: 0;
  text-align: center;
`;

export const ActionBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.35rem;
  width: 100%;
`;

export const ButtonCaption = styled.p`
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.35;
  color: var(--menu-text-muted);
  text-align: center;
`;

export const Stats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

export const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--menu-bg-teal-10);
  border-left: 4px solid var(--menu-primary);
  border-radius: 8px;
`;

export const StatLabel = styled.span`
  font-size: 1.1rem;
  color: var(--menu-text-primary);
  font-weight: 600;
`;

export const StatValue = styled.span`
  font-size: 1.5rem;
  color: var(--menu-primary);
  font-family: var(--font-ui), sans-serif;
  font-weight: bold;
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1rem);
  width: 100%;
`;

export const PrimaryActionButton = styled.button`
  padding: 0.9rem 2rem;
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 650;
  font-family: var(--font-ui), sans-serif;
  background: var(--menu-btn-action-bg);
  color: var(--menu-btn-action-text);
  border: 2px solid var(--menu-btn-action-border);
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.1s,
    box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    background: var(--menu-btn-action-hover);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  padding: 0.9rem 2rem;
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 650;
  font-family: var(--font-ui), sans-serif;
  background: var(--menu-btn-secondary-bg);
  color: var(--menu-btn-secondary-text);
  border: 2px solid var(--menu-btn-secondary-border);
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.1s,
    box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    background: var(--menu-btn-secondary-hover);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const MenuNavButton = styled.button`
  padding: 0.9rem 2rem;
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 650;
  font-family: var(--font-ui), sans-serif;
  background: var(--menu-btn-nav-bg);
  color: var(--menu-btn-nav-text);
  border: 2px solid var(--menu-btn-nav-border);
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.1s,
    background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    background: var(--menu-btn-nav-hover);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const DangerButton = styled.button`
  padding: 0.9rem 2rem;
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 650;
  font-family: var(--font-ui), sans-serif;
  background: var(--menu-danger-button);
  color: var(--color-white);
  border: 2px solid var(--menu-btn-secondary-border);
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.1s,
    background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    background: var(--menu-danger-button-hover);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
