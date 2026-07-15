import styled from 'styled-components';
import { Z_INDEX } from '../../../utils/zIndex';

export const PrepBannerRoot = styled.div`
  position: absolute;
  left: 50%;
  bottom: 5.5rem;
  transform: translateX(-50%);
  z-index: ${Z_INDEX.overlayHigh};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  min-width: 12rem;
  max-width: min(22rem, 90vw);
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: rgba(0, 34, 51, 0.82);
  color: var(--color-white, #fff);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
  pointer-events: none;
  font-size: 0.8rem;
  text-align: center;
`;

export const PrepBannerTitle = styled.span`
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const PrepProgressTrack = styled.div`
  width: 100%;
  height: 0.35rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
`;

export const PrepProgressFill = styled.div<{ $percent: number }>`
  width: ${({ $percent }) => `${$percent}%`};
  height: 100%;
  border-radius: inherit;
  background: var(--color-primary, #ffcc00);
  transition: width 0.15s linear;
`;

export const PrepBannerHint = styled.span`
  opacity: 0.85;
  line-height: 1.3;
`;
