import styled from 'styled-components';

import type { SensorHudConnection } from '../../types';
import { Z_INDEX } from '../../utils/zIndex';

export const NO_SIGNAL_MUTED_COLOR = '#f7df86';

export const StatusBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: clamp(56px, 10vh, 70px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.75rem;
  color: var(--color-white);
  font-family: var(--font-ui), sans-serif;
  z-index: ${Z_INDEX.overlayMid};

  @media (min-width: 768px) {
    height: clamp(70px, 12vh, 90px);
    padding: 0 1.5rem;
  }

  @media (min-width: 1024px) {
    height: clamp(80px, 13vh, 100px);
  }
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const connectionStatusColor = (variant: SensorHudConnection): string => {
  switch (variant) {
    case 'disconnected':
      return 'var(--color-disconnected)';
    case 'no-signal':
    case 'persistent-no-signal':
      return NO_SIGNAL_MUTED_COLOR;
    case 'connected':
      return '#4096ff';
  }
};

export const ConnectionStatus = styled.div<{ $variant: SensorHudConnection }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: clamp(0.78rem, 2vh, 1.05rem);
  font-weight: 800;
  color: ${(props) => connectionStatusColor(props.$variant)};

  @media (min-width: 768px) {
    gap: 0.6rem;
    font-size: clamp(1.05rem, 2.7vh, 1.45rem);
  }

  @media (min-width: 1024px) {
    font-size: clamp(1.22rem, 3.1vh, 1.68rem);
  }
`;

export const ConnectionDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;

  @media (min-width: 768px) {
    width: 12px;
    height: 12px;
  }
`;

export const CenterPanel = styled.div<{ $signalLost?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: clamp(0.5rem, 2vw, 1rem);
  padding: 0 clamp(0.75rem, 2vw, 1.25rem);
  height: 100%;
  min-width: 160px;
  max-width: 65%;
  background: ${(p) =>
    p.$signalLost
      ? 'linear-gradient(to top, rgba(118, 128, 135, 0.88), rgba(152, 162, 168, 0.84))'
      : 'linear-gradient(to top, var(--color-bg-teal-90), var(--color-bg-accent-90))'};
  border: 3px solid var(--color-white);
  border-bottom: none;
  border-radius: 1rem 1rem 0 0;
  box-sizing: border-box;
  transition: background 0.35s ease;

  @media (min-width: 768px) {
    gap: clamp(1rem, 3vw, 1.5rem);
    padding: 0 clamp(1.5rem, 3vw, 2rem);
    min-width: 240px;
    max-width: none;
    border-width: 4px;
    border-radius: 1.25rem 1.25rem 0 0;
  }

  @media (min-width: 1024px) {
    gap: clamp(1.25rem, 3.5vw, 2rem);
    padding: 0 clamp(1.8rem, 4vw, 2.5rem);
    min-width: 600px;
    border-radius: 1.5rem 1.5rem 0 0;
  }
`;

export const VariableValue = styled.span<{ $signalLost?: boolean }>`
  font-family: var(--font-ui), sans-serif;
  font-size: clamp(1.35rem, 3.2vh, 1.75rem);
  font-weight: 800;
  color: ${(p) => (p.$signalLost ? NO_SIGNAL_MUTED_COLOR : 'var(--color-primary)')};
  transition: color 0.35s ease;

  @media (min-width: 768px) {
    font-size: clamp(1.65rem, 3.8vh, 2.2rem);
  }

  @media (min-width: 1024px) {
    font-size: clamp(1.9rem, 4.5vh, 2.5rem);
  }
`;

export const IndicatorHudIconsRow = styled.div<{ $signalLost?: boolean }>`
  display: flex;
  gap: 0.25rem;
  align-items: center;
  filter: ${(p) => (p.$signalLost ? 'grayscale(100%)' : 'none')};
  transition: filter 0.35s ease;

  @media (min-width: 768px) {
    gap: 0.4rem;
  }

  @media (min-width: 1024px) {
    gap: 0.5rem;
  }
`;

export const IndicatorHudIcon = styled.img`
  width: clamp(24px, 4vh, 32px);
  height: clamp(24px, 4vh, 32px);
  object-fit: contain;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.9;
  }

  @media (min-width: 768px) {
    width: clamp(34px, 5vh, 44px);
    height: clamp(34px, 5vh, 44px);
  }

  @media (min-width: 1024px) {
    width: clamp(38px, 5.5vh, 55px);
    height: clamp(38px, 5.5vh, 55px);
  }
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const BaselineStatusText = styled.span<{ $ready: boolean; $isCalibration?: boolean }>`
  font-family: var(--font-ui), sans-serif;
  font-size: clamp(0.95rem, 2.4vh, 1.25rem);
  font-weight: 800;
  color: ${(p) => {
    if (p.$isCalibration) return NO_SIGNAL_MUTED_COLOR;
    return p.$ready ? 'var(--color-topbar-btn-bg)' : '#936327';
  }};

  @media (min-width: 768px) {
    font-size: clamp(1.2rem, 3vh, 1.6rem);
  }

  @media (min-width: 1024px) {
    font-size: clamp(1.4rem, 3.5vh, 1.85rem);
  }
`;

export const BreathingCircleOuter = styled.div`
  width: clamp(44px, 7vh, 56px);
  height: clamp(44px, 7vh, 56px);
  border-radius: 50%;
  border: 2px solid var(--menu-border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 30, 30, 0.4);
  overflow: hidden;

  @media (min-width: 768px) {
    width: clamp(60px, 9vh, 75px);
    height: clamp(60px, 9vh, 75px);
    border-width: 3px;
  }

  @media (min-width: 1024px) {
    width: clamp(70px, 10vh, 90px);
    height: clamp(70px, 10vh, 90px);
  }
`;

const BREATH_COLOR_RED = { r: 255, g: 82, b: 82 };
const BREATH_COLOR_BLUE = { r: 68, g: 138, b: 255 };

export const BreathingCircleInner = styled.div.attrs<{ $phase: number }>((p) => {
  const scale = 0.4 + 0.6 * p.$phase;
  const r = Math.round(BREATH_COLOR_RED.r + (BREATH_COLOR_BLUE.r - BREATH_COLOR_RED.r) * p.$phase);
  const g = Math.round(BREATH_COLOR_RED.g + (BREATH_COLOR_BLUE.g - BREATH_COLOR_RED.g) * p.$phase);
  const b = Math.round(BREATH_COLOR_RED.b + (BREATH_COLOR_BLUE.b - BREATH_COLOR_RED.b) * p.$phase);

  return {
    style: {
      transform: `scale(${scale})`,
      background: `rgb(${r}, ${g}, ${b})`
    }
  };
})<{ $phase: number }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid white;
  transform-origin: center;
`;
