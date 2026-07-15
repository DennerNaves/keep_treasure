import styled from 'styled-components';

export const BeeCanvas = styled.canvas<{ $x: number; $y: number; $size: number; $flip: boolean }>`
  position: absolute;
  left: ${({ $x, $size }) => `${$x - $size / 2}px`};
  top: ${({ $y, $size }) => `${$y - $size / 2}px`};
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  pointer-events: none;
  transform: ${({ $flip }) => ($flip ? 'scaleX(-1)' : 'none')};
`;
