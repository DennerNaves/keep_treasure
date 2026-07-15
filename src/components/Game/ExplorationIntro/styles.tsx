import styled from 'styled-components';
import { EXPLORATION_INTRO_CONFIG } from '../../../utils/constants';
import { Z_INDEX } from '../../../utils/zIndex';

export const IntroOverlayRoot = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${Z_INDEX.tutorial};
  pointer-events: none;
`;

export const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, ${EXPLORATION_INTRO_CONFIG.BACKDROP_OPACITY});
  pointer-events: auto;
`;
