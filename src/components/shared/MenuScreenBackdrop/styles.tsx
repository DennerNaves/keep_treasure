import styled from 'styled-components';

export const BackdropRoot = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
`;

export const BackdropImage = styled.div<{ $url: string }>`
  position: absolute;
  inset: 0;
  background-image: url('${({ $url }) => $url}');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

export const BackdropOverlay = styled.div<{ $color: string }>`
  position: absolute;
  inset: 0;
  background: ${({ $color }) => $color};
`;
