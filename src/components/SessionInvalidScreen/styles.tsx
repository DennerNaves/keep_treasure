import styled, { keyframes } from 'styled-components';

export const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--menu-bg-overlay-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: clamp(2rem, 6vh, 4rem);
  z-index: 100;
`;

export const SessionInvalidContainer = styled(OverlayContainer)`
  z-index: 1000;
  position: relative;
`;

export const SessionInvalidContent = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2rem, 6vh, 4rem);
`;

export const Title = styled.h1`
  font-family: var(--font-ui), Arial, sans-serif;
  font-size: clamp(2.5rem, 10vh, 6rem);
  color: var(--color-white);
  text-shadow:
    0 0 20px var(--menu-primary),
    0 0 40px var(--menu-primary-dim);
  margin: 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const dots = keyframes`
  0% { content: ''; }
  33% { content: '.'; }
  66% { content: '..'; }
  100% { content: '...'; }
`;

export const LoadingText = styled.p`
  font-family: var(--font-ui), Arial, sans-serif;
  font-size: clamp(1.3rem, 4.5vw, 2.25rem);
  font-weight: 700;
  color: var(--color-white);
  margin: 0;

  &::after {
    content: '';
    animation: ${dots} 1.5s steps(3, end) infinite;
  }
`;

export const Message = styled.p`
  font-family: var(--font-ui), Arial, sans-serif;
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: var(--color-white);
  text-align: center;
  margin: 0;
  font-weight: 600;
  max-width: 480px;
  line-height: 1.5;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  white-space: pre-line;
`;

export const BackToPortalButton = styled.button`
  font-family: inherit;
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: clamp(12px, 2.2vh, 16px) clamp(22px, 4.5vw, 32px);
  border-radius: 10px;
  border: 2px solid var(--menu-btn-secondary-border);
  background: var(--menu-secondary-dark);
  color: var(--menu-text-inverse);
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.1s,
    box-shadow 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.04);
    background: var(--menu-accent-hover);
    box-shadow: 0 4px 14px var(--menu-shadow);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid var(--menu-primary);
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
