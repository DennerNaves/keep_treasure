import styled from 'styled-components';
import { Z_INDEX } from '../../utils/zIndex';

export const TopBarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: clamp(48px, 9vh, 60px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem 0 0;
  z-index: ${Z_INDEX.overlayMid};
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }

  @media (min-width: 768px) {
    height: clamp(60px, 11vh, 80px);
    padding: 0 1rem 0 0;
  }

  @media (min-width: 1024px) {
    height: clamp(70px, 12vh, 90px);
  }
`;

export const TimeScorePanel = styled.div`
  height: 100%;
  min-width: 140px;
  padding: 0 0.75rem 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: 0.75rem;
  background: linear-gradient(to bottom, var(--color-bg-teal-90), var(--color-bg-accent-90));
  border: 3px solid var(--color-white);
  border-top: none;
  border-radius: 0 0 1rem 1rem;
  box-sizing: border-box;

  @media (min-width: 768px) {
    min-width: 220px;
    padding: 0 1.5rem 0 1.25rem;
    gap: 1.5rem;
    border-width: 4px;
    border-radius: 0 0 1.25rem 1.25rem;
  }

  @media (min-width: 1024px) {
    min-width: 630px;
    padding: 0 2rem 0 1.5rem;
    gap: 2.5rem;
    border-radius: 0 0 1.5rem 1.5rem;
  }
`;

export const TimeDisplay = styled.span`
  font-family: var(--font-ui), sans-serif;
  font-size: clamp(0.9rem, 2.2vh, 1.15rem);
  font-weight: 800;
  color: var(--color-primary);
  text-shadow: 1px 1px 0 var(--color-title-shadow);
  white-space: nowrap;

  @media (min-width: 768px) {
    font-size: clamp(1.1rem, 2.8vh, 1.45rem);
  }

  @media (min-width: 1024px) {
    font-size: clamp(1.2rem, 3vh, 1.6rem);
  }
`;

export const ScoreDisplay = styled.span`
  font-family: var(--font-ui), sans-serif;
  font-size: clamp(0.9rem, 2.2vh, 1.15rem);
  font-weight: 800;
  color: var(--color-primary);
  text-shadow: 1px 1px 0 var(--color-title-shadow);
  white-space: nowrap;

  @media (min-width: 768px) {
    font-size: clamp(1.1rem, 2.8vh, 1.45rem);
  }

  @media (min-width: 1024px) {
    font-size: clamp(1.2rem, 3vh, 1.6rem);
  }
`;

export const ControlButtons = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
`;

export const ControlButton = styled.button<{ $dimmed?: boolean }>`
  background: ${(p) => (p.$dimmed ? 'rgba(0, 50, 60, 0.5)' : 'var(--color-topbar-btn-bg)')};
  border: 2px solid ${(p) => (p.$dimmed ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-topbar-btn-border)')};
  color: ${(p) => (p.$dimmed ? 'rgba(255, 255, 255, 0.5)' : 'var(--color-topbar-btn-icon)')};
  font-size: 1.25rem;
  width: clamp(40px, 5.5vh, 50px);
  height: clamp(40px, 5.5vh, 50px);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  svg {
    width: 1em;
    height: 1em;
  }

  &:hover {
    background: ${(p) => (p.$dimmed ? 'rgba(0, 70, 80, 0.6)' : 'var(--color-topbar-btn-bg-hover)')};
    border-color: ${(p) => (p.$dimmed ? 'rgba(255, 255, 255, 0.4)' : 'var(--color-topbar-btn-border-hover)')};
    color: ${(p) => (p.$dimmed ? 'rgba(255, 255, 255, 0.8)' : 'var(--color-topbar-btn-icon)')};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (min-width: 768px) {
    font-size: 1.4rem;
    width: clamp(50px, 6.5vh, 62px);
    height: clamp(50px, 6.5vh, 62px);
    border-width: 3px;
  }

  @media (min-width: 1024px) {
    font-size: 1.5rem;
    width: clamp(55px, 7vh, 70px);
    height: clamp(55px, 7vh, 70px);
  }
`;
