import styled from 'styled-components';

export const PreviewFigure = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: clamp(92px, 19vh, 140px);
  padding: 4px 0 8px;
`;

export const PreviewCanvas = styled.canvas<{ $width: number; $height: number }>`
  width: clamp(72px, 17vw, ${({ $width }) => `${$width}px`});
  height: auto;
  max-height: clamp(86px, 17vh, ${({ $height }) => `${$height}px`});
  aspect-ratio: ${({ $width, $height }) => `${$width} / ${$height}`};
  display: block;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
`;
