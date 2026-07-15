import styled from 'styled-components';
import {
  AccessibilityOpenButton as BaseAccessibilityOpenButton,
  AudioSliderRow as MainMenuAudioSliderRow
} from '../MainMenu/styles';

export const PauseAccessibilityButton = styled(BaseAccessibilityOpenButton)`
  padding: 0.65rem 1.35rem;
  font-size: clamp(0.78rem, 2.1vw, 0.9rem);
  gap: 0.45rem;

  svg {
    font-size: 1.2rem;
  }
`;

export const PauseContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--menu-bg-overlay-pause);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: clamp(0.75rem, 3vw, 1.5rem);
  box-sizing: border-box;
`;

export const PauseContent = styled.div`
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

export const PauseBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1rem, 3vw, 1.5rem);
  width: 100%;
  min-width: 0;
`;

export const PauseVolumeSection = styled.div`
  width: 100%;
  min-width: 0;

  ${MainMenuAudioSliderRow} {
    width: 100%;
    min-width: 0;
  }
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
