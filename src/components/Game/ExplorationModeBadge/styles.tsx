import styled from 'styled-components';
import { Z_INDEX } from '../../../utils/zIndex';

export const ModeBadgeRoot = styled.div`
  position: absolute;
  left: 50%;
  top: 4.25rem;
  transform: translateX(-50%);
  z-index: ${Z_INDEX.overlayMid};
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(46, 139, 158, 0.92);
  color: var(--color-white, #fff);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  pointer-events: none;
`;
