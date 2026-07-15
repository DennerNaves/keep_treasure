import styled from 'styled-components';

export const OrientationWarningContainer = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--menu-bg-overlay);
  z-index: 1000;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  @media screen and (orientation: portrait) and (max-width: 900px) {
    display: flex;
  }
`;

export const OrientationWarningCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 2rem;
  background: var(--menu-content-card);
  border: 4px solid var(--menu-content-border);
  border-radius: 20px;
  box-shadow: var(--menu-shadow-card);
  max-width: 90vw;
`;

export const OrientationWarningText = styled.p`
  margin: 0 0 1rem;
  padding: 0 1rem;
  font-size: 1.25rem;
  font-family: var(--font-ui), sans-serif;
  font-weight: 700;
  color: var(--menu-text-dark);
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

export const EmojiParagraph = styled.p`
  font-size: 3rem;
  margin: 0;
`;
