import styled from 'styled-components';
import { EXPLORATION_WIN_CONFIG } from '../../../utils/constants';
import { Z_INDEX } from '../../../utils/zIndex';

export const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Z_INDEX.gameOverlay};
  padding: clamp(0.75rem, 3vw, 1.5rem);
  box-sizing: border-box;
  pointer-events: none;
`;

export const MapDimLayer = styled.div`
  position: absolute;
  inset: 0;
  background: ${EXPLORATION_WIN_CONFIG.MAP_DIM_OVERLAY};
  pointer-events: none;
`;

export const WinStack = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1rem, 3vw, 1.5rem);
  pointer-events: auto;
`;

export const OverlayContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1rem, 3vw, 1.5rem);
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--menu-content-bg);
  border: 4px solid var(--menu-content-border);
  border-radius: clamp(12px, 2.5vw, 20px);
  box-shadow: var(--menu-shadow-card);
  width: min(92vw, 420px);
  box-sizing: border-box;
`;

export const Message = styled.p`
  font-size: clamp(1.1rem, 3.5vw, 1.35rem);
  font-family: var(--font-ui), sans-serif;
  color: var(--menu-text-primary);
  margin: 0;
  text-align: center;
  line-height: 1.4;
`;

export const MenuButton = styled.button`
  font-family: var(--font-ui), sans-serif;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border: 3px solid var(--menu-content-border);
  border-radius: 12px;
  background: var(--menu-primary);
  color: #fff;
  cursor: pointer;

  &:hover {
    filter: brightness(1.05);
  }
`;
