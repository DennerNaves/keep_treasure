import styled from 'styled-components';

export const GameContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: var(--color-bg-black);
  overflow: hidden;
`;

export const GameCanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

export const GameCanvasElement = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;
