import styled, { css } from 'styled-components';

export const WelcomeContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: max(clamp(20px, 4vh, 48px), env(safe-area-inset-top, 0px) + 12px) min(2rem, 5vw)
    max(1.5rem, env(safe-area-inset-bottom, 0px) + 12px);
  box-sizing: border-box;
  overflow: hidden;
`;

export const WelcomeMain = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(44px, 50px, 56px);
  width: 100%;
  max-width: min(94vw, 720px);
  transform: translateY(clamp(-0.75rem, -1.5vh, 0rem));

  @media (max-height: 520px) and (orientation: landscape) {
    gap: clamp(40px, 7vmin, 52px);
    transform: translateY(0);
  }
`;

export const WelcomeHeading = styled.h1`
  margin: 0;
  position: relative;
  font-size: 0;
  line-height: 0;
  transform: translateY(0);

  @media (min-height: 521px) {
    transform: translateY(clamp(-0.5rem, -1vh, 0rem));
  }
`;

export const WelcomeTitleSrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const chromeBtn = css`
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  padding: 0;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 8px rgba(13, 71, 84, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition:
    transform 0.12s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
  box-sizing: border-box;

  &:hover {
    transform: scale(1.06);
    box-shadow: 0 4px 14px rgba(13, 71, 84, 0.22);
  }
  &:active {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }

  & svg {
    display: block;
  }
`;

export const WelcomeChromeColumn = styled.div<{ $side: 'left' | 'right' }>`
  position: fixed;
  top: clamp(12px, 2.2vh, 20px);
  ${(p) => (p.$side === 'left' ? 'left: clamp(12px, 2.2vh, 20px);' : 'right: clamp(12px, 2.2vh, 20px);')}
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 102;
`;

export const WelcomeThemeButton = styled.button<{ $isLightTheme?: boolean }>`
  ${chromeBtn}
  ${(p) =>
    p.$isLightTheme
      ? css`
          background: var(--menu-toolbar-btn-bg);
          color: var(--menu-toolbar-btn-icon);
          border: 2px solid var(--menu-toolbar-btn-border-active);
          box-shadow: var(--menu-toolbar-btn-shadow);
          &:hover {
            background: var(--menu-toolbar-btn-bg-hover);
            box-shadow: 0 4px 16px rgba(56, 160, 210, 0.4);
          }
        `
      : css`
          background: rgba(0, 105, 120, 0.88);
          color: #fff59d;
        `}
`;

export const WelcomeA11yButton = styled.button<{ $isLightTheme?: boolean }>`
  ${chromeBtn}
  ${(p) =>
    p.$isLightTheme
      ? css`
          background: var(--menu-toolbar-btn-bg);
          color: var(--menu-toolbar-btn-icon);
          border: 2px solid transparent;
          box-shadow: var(--menu-toolbar-btn-shadow);
          &:hover {
            background: var(--menu-toolbar-btn-bg-hover);
            box-shadow: 0 4px 16px rgba(56, 160, 210, 0.4);
          }
        `
      : css`
          background: rgba(0, 96, 110, 0.9);
          color: #e0f7fa;
        `}
`;

export const WelcomeFullscreenButton = styled.button<{ $isFullscreen: boolean; $isLightTheme?: boolean }>`
  ${chromeBtn}
  ${(p) =>
    p.$isLightTheme
      ? css`
          background: var(--menu-toolbar-btn-bg);
          color: transparent;
          border: 2px solid var(--menu-toolbar-btn-border-active);
          border-radius: 10px;
          box-shadow: var(--menu-toolbar-btn-shadow);
          &:hover {
            background: var(--menu-toolbar-btn-bg-hover);
            box-shadow: 0 4px 16px rgba(56, 160, 210, 0.4);
          }
        `
      : css`
          background: rgba(0, 96, 110, 0.88);
          color: transparent;
        `}
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    margin: auto;
    width: 58%;
    height: 58%;
    background-image: url('/assets/images/ui/buttons.png');
    background-repeat: no-repeat;
    background-size: 1000% 100%;
    background-position: ${(p) => (p.$isFullscreen ? '55.5% 0%' : '44.4% 0%')};
    filter: brightness(0) invert(1);
    pointer-events: none;
  }
`;

export const WelcomeTitleBlock = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0 clamp(6px, 2vw, 14px);
  text-align: center;
  max-width: 100%;
  box-sizing: border-box;
`;

export const WelcomeTitleText = styled.span`
  display: block;
  max-width: 100%;
  font-family: 'Fredoka One', 'Segoe UI', system-ui, sans-serif;
  font-size: clamp(1.55rem, calc(1rem + 5.5vw), 6rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
  white-space: nowrap;
  color: var(--menu-primary);
  -webkit-text-stroke: min(2px, 0.07em) var(--menu-secondary-dark);
  text-shadow: none;

  @media (max-height: 520px) and (orientation: landscape) {
    font-size: clamp(1.4rem, calc(0.85rem + 5.2vw), 4rem);
    line-height: 1.06;
  }

  @media (max-width: 360px) {
    font-size: clamp(1.3rem, calc(0.82rem + 4.6vw), 2.85rem);
  }

  @media (min-width: 1200px) and (min-height: 560px) {
    font-size: clamp(3.5rem, calc(2.5rem + 3.2vw), 6rem);
  }

  html[data-menu-theme='light'] & {
    color: #81d4fa;
    -webkit-text-stroke: min(2.5px, 0.09em) #ffffff;
    text-shadow: none;
  }
`;

export const PlayButtonWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const PlayButton = styled.button`
  position: relative;
  width: clamp(64px, min(9vh, 9vw), 100px);
  height: clamp(64px, min(9vh, 9vw), 100px);
  border-radius: 50%;
  background: linear-gradient(145deg, #ffd54f 0%, #ffb300 100%);
  border: 3px solid rgba(255, 255, 255, 0.95);
  cursor: pointer;
  font-size: 0;
  color: transparent;
  transition: transform 0.1s ease-out;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(180, 100, 0, 0.35);

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 58%;
    height: 58%;
    transform: translate(-45%, -50%);
    background-image: url('/assets/images/ui/welcome-icons.png');
    background-repeat: no-repeat;
    background-size: 200% 100%;
    background-position: 0% 0%;
  }

  &:hover {
    transform: scale(1.07);
  }

  &:active {
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    width: clamp(42px, min(9vh, 22vw), 56px);
    height: clamp(42px, min(9vh, 22vw), 56px);
    border-width: 2px;
  }

  @media (max-width: 480px) {
    width: clamp(40px, min(8vh, 20vw), 52px);
    height: clamp(40px, min(8vh, 20vw), 52px);
  }
`;

export const PlayButtonGlow = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 118%;
  height: 118%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0.85;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: rgba(255, 213, 79, 0.75);
    border-right-color: rgba(255, 235, 150, 0.45);
    animation: playGlowRotate 7s linear infinite;
  }

  @keyframes playGlowRotate {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
`;
