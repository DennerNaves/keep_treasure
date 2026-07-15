import styled from 'styled-components';

export const AccessibilityBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.75rem, 2vh, 1.25rem);
  box-sizing: border-box;
`;

export const AccessibilityPanel = styled.div`
  position: relative;
  width: min(100%, 380px);
  max-height: min(80vh, 520px);
  overflow-y: auto;
  background: var(--menu-content-bg);
  border: 3px solid var(--menu-content-border);
  border-radius: 12px;
  padding: 16px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 8px 32px var(--menu-shadow);
  font-family: inherit;
  font-size: 14px;
`;

export const AccessibilityPanelTitle = styled.span`
  display: block;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--menu-text-primary);
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 0.12em;
  padding: 2px 52px 0;
  box-sizing: border-box;
`;

export const AccessibilityCloseWrap = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
`;
