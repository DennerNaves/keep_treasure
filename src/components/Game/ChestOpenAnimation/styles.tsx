import styled from 'styled-components';

export const ChestCanvas = styled.canvas<{ $size: number }>`
  position: relative;
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
`;

export const ChestStage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
