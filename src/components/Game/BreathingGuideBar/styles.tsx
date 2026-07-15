import styled, { css } from 'styled-components';
import { BREATHING_GUIDE_BAR_CONFIG } from '../../../utils/constants';
import { Z_INDEX } from '../../../utils/zIndex';

type Position = (typeof BREATHING_GUIDE_BAR_CONFIG)['POSITION'];

const positionStyle = (position: Position) => {
  switch (position) {
    case 'left':
      return css`
        left: ${BREATHING_GUIDE_BAR_CONFIG.MARGIN_PX}px;
        top: 50%;
        transform: translateY(-50%);
      `;
    case 'center':
      return css`
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      `;
    case 'right':
    default:
      return css`
        right: ${BREATHING_GUIDE_BAR_CONFIG.MARGIN_PX}px;
        top: 50%;
        transform: translateY(-50%);
      `;
  }
};

export const GuideBarRoot = styled.div<{ $position: Position; $widthPx: number; $heightFraction: number }>`
  position: absolute;
  ${({ $position }) => positionStyle($position)}
  width: ${({ $widthPx }) => $widthPx}px;
  height: ${({ $heightFraction }) => $heightFraction * 100}vh;
  z-index: ${Z_INDEX.overlayMid};
  pointer-events: none;
  display: flex;
  align-items: stretch;
  justify-content: center;
`;

export const GuideBarTrack = styled.div<{ $hasFrame: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  ${({ $hasFrame }) =>
    $hasFrame
      ? css`
          background: transparent;
          border: none;
          border-radius: 0;
          overflow: visible;
        `
      : css`
          border-radius: 999px;
          background: ${BREATHING_GUIDE_BAR_CONFIG.PLACEHOLDER_COLORS.TRACK};
          border: 1px solid ${BREATHING_GUIDE_BAR_CONFIG.PLACEHOLDER_COLORS.TRACK_BORDER};
          overflow: hidden;
        `}
`;

export const GuideBarFill = styled.div<{ $fill01: number; $hasFrame: boolean }>`
  position: absolute;
  left: ${({ $hasFrame }) =>
    $hasFrame ? `${BREATHING_GUIDE_BAR_CONFIG.FILL_AREA.LEFT * 100}%` : '0'};
  right: ${({ $hasFrame }) =>
    $hasFrame ? `${BREATHING_GUIDE_BAR_CONFIG.FILL_AREA.RIGHT * 100}%` : '0'};
  top: ${({ $hasFrame }) =>
    $hasFrame ? `${BREATHING_GUIDE_BAR_CONFIG.FILL_AREA.TOP * 100}%` : '0'};
  bottom: ${({ $hasFrame }) =>
    $hasFrame ? `${BREATHING_GUIDE_BAR_CONFIG.FILL_AREA.BOTTOM * 100}%` : '0'};
  z-index: 1;
  overflow: hidden;
  border-radius: ${({ $hasFrame }) => ($hasFrame ? '8px' : '999px')};
`;

export const GuideBarFillLevel = styled.div<{ $fill01: number }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${({ $fill01 }) => `${Math.max(0, Math.min(1, $fill01)) * 100}%`};
  background: ${BREATHING_GUIDE_BAR_CONFIG.FILL_COLOR};
`;

export const GuideBarTrackImage = styled.img`
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  object-fit: fill;
`;

/**
 * Indicador (placeholder = bolinha). `$progressFromTop01` em [0,1]: 0 = topo, 1 = base.
 */
export const GuideBarIndicator = styled.div<{ $progressFromTop01: number; $widthPx: number }>`
  position: absolute;
  left: 50%;
  top: ${({ $progressFromTop01 }) => `${$progressFromTop01 * 100}%`};
  transform: translate(-50%, -50%);
  width: ${({ $widthPx }) => $widthPx * 1.4}px;
  height: ${({ $widthPx }) => $widthPx * 1.4}px;
  border-radius: 50%;
  background: ${BREATHING_GUIDE_BAR_CONFIG.PLACEHOLDER_COLORS.INDICATOR};
  border: 2px solid ${BREATHING_GUIDE_BAR_CONFIG.PLACEHOLDER_COLORS.INDICATOR_BORDER};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
`;

export const GuideBarIndicatorImage = styled.img<{ $progressFromTop01: number; $widthPx: number }>`
  position: absolute;
  z-index: 3;
  left: 50%;
  top: ${({ $progressFromTop01 }) => `${$progressFromTop01 * 100}%`};
  transform: translate(-50%, -50%);
  width: ${({ $widthPx }) => $widthPx * 1.8}px;
  height: auto;
  pointer-events: none;
`;
