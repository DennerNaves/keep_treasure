import styled, { css, keyframes } from 'styled-components';

export const MenuContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 110;
  padding: min(2.5vw, 1.25rem);
  box-sizing: border-box;
`;

export const MenuContent = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  width: min(94vw, 760px);
  height: min(78vh, 620px);
  max-height: min(78vh, 620px);
  padding: 0;
  background: var(--menu-content-bg);
  border: 2px solid var(--menu-content-border);
  border-radius: 14px;
  overflow: hidden;
  min-height: 0;
  font-family: var(--font-system), 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;

  @media (max-width: 900px) {
    width: min(95vw, 760px);
    height: min(82vh, 640px);
    max-height: min(82vh, 640px);
    font-size: 15px;
    border-radius: 12px;
  }
`;

export const TabsContainer = styled.div`
  flex: 0 0 auto;
  width: 100%;
`;

export const TabsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
  padding: clamp(14px, 2.4vh, 20px) clamp(16px, 4.5vw, 32px) 5px;

  @media (max-width: 900px) {
    padding: clamp(12px, 2vh, 16px) clamp(12px, 3.5vw, 22px) 5px;
  }
`;

export const TabConnectorSegment = styled.div`
  flex: 1 1 0;
  min-width: 4px;
  height: 3px;
  margin-top: calc(8px + clamp(1.48rem, 3.45vw, 1.72rem) / 2 - 1.5px);
  background: var(--menu-primary-glow);
  align-self: flex-start;
  border-radius: 2px;

  @media (max-width: 900px) {
    margin-top: calc(6px + clamp(1.48rem, 3.45vw, 1.72rem) / 2 - 1.5px);
  }
`;

export const TabCircleButton = styled.button<{ $active: boolean }>`
  flex: 0 1 auto;
  min-width: 4.75rem;
  padding: 8px 10px 2px;
  margin: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
  color: ${(p) => (p.$active ? 'var(--menu-primary)' : 'var(--menu-border-light)')};
  transition: color 0.2s ease;
  z-index: 1;

  &:focus-visible {
    outline: 2px solid var(--menu-primary);
    outline-offset: 4px;
    border-radius: 4px;
  }

  &:hover:not(:disabled) {
    color: ${(p) => (p.$active ? 'var(--menu-primary-hover)' : 'var(--menu-primary)')};
  }

  @media (max-width: 900px) {
    gap: 4px;
    min-width: 4.25rem;
    padding: 6px 8px 1px;
  }
`;

export const TabNavIcon = styled.span<{ $active: boolean; $glyphScale?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  color: inherit;
  min-width: clamp(1.48rem, 3.45vw, 1.72rem);
  min-height: clamp(1.48rem, 3.45vw, 1.72rem);

  & > svg {
    display: block;
    width: clamp(1.32rem, 3.1vw, 1.5rem);
    height: clamp(1.32rem, 3.1vw, 1.5rem);
    flex-shrink: 0;
    transform: scale(${(p) => p.$glyphScale ?? 1});
    transform-origin: center center;
  }
`;

export const TabNavLabel = styled.span`
  font-size: clamp(0.72rem, 1.85vw, 0.9rem);
  font-weight: 700;
  letter-spacing: 0.07em;
  line-height: 1.15;
  text-align: center;
  text-transform: uppercase;
  white-space: pre-line;
  max-width: 6.25rem;
  color: inherit;

  @media (max-width: 900px) {
    font-size: clamp(0.68rem, 1.7vw, 0.82rem);
    max-width: 5.75rem;
  }
`;

export const MenuBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
`;

export const MenuScrollArea = styled.div`
  flex: 1 1 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 12px clamp(16px, 4.5vw, 28px) 10px;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;

  @media (max-width: 900px) {
    padding: 10px clamp(14px, 4vw, 22px) 8px;
  }
`;

export const MenuTabContent = styled.div`
  flex: 1 0 auto;
  width: 100%;
  box-sizing: border-box;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: clamp(10px, 2.2vh, 18px) 0 clamp(16px, 3.5vh, 32px);
`;

export const ContentColumn = styled.div<{ $distribute?: 'between' | 'around' | 'evenly' }>`
  max-width: 28rem;
  margin: 0 auto;
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: ${(p) => {
    switch (p.$distribute) {
      case 'around':
        return 'space-around';
      case 'evenly':
        return 'space-evenly';
      default:
        return 'space-between';
    }
  }};
  align-items: stretch;
  gap: ${(p) => (p.$distribute === 'evenly' || p.$distribute === 'around' ? 'clamp(10px, 2vh, 20px)' : 'clamp(14px, 3vh, 26px)')};
  min-height: 0;
`;

export const MenuFooter = styled.div`
  flex-shrink: 0;
  padding: 10px clamp(14px, 4vw, 22px) 12px;
  background: transparent;
  border-top: 1px solid var(--menu-content-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
`;

export const MenuSection = styled.section`
  flex-shrink: 0;
  padding: clamp(10px, 2vh, 16px) 0;

  &:first-of-type {
    padding-top: 0;
  }

  &:last-of-type {
    padding-bottom: 2px;
  }

  @media (max-width: 900px) {
    padding: clamp(8px, 1.6vh, 14px) 0;

    &:last-of-type {
      padding-bottom: 0;
    }
  }
`;

export const SessionColumnStack = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  gap: clamp(18px, 3.5vh, 30px);
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
  min-height: 0;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
`;

export const ConnectionTabSection = styled(MenuSection)`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-top: 0;
`;

export const ConnectionFormGroup = styled(FormGroup)`
  flex: 1 1 auto;
  min-height: 0;
  justify-content: space-evenly;
  gap: clamp(14px, 3vh, 26px);
`;

export const BreathingCircleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const BreathingCircleOuter = styled.div`
  width: clamp(52px, 11vw, 76px);
  height: clamp(52px, 11vw, 76px);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 30, 30, 0.4);
  overflow: hidden;
`;

export const BreathingCircleInner = styled.div<{ $cpm: number }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid white;
  transform-origin: center;
  animation: breathSync ${(p) => 60 / p.$cpm}s ease-in-out infinite;

  @keyframes breathSync {
    0% {
      transform: scale(1);
      background: #448aff;
    }
    50% {
      transform: scale(0.4);
      background: #ff5252;
    }
    100% {
      transform: scale(1);
      background: #448aff;
    }
  }
`;

export const SessionSectionTitle = styled.span`
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  color: var(--menu-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.09em;
  text-align: center;
  line-height: 1.35;

  @media (min-width: 540px) {
    text-align: left;
  }
`;

export const SessionSectionTitleCentered = styled(SessionSectionTitle)`
  @media (min-width: 540px) {
    text-align: center;
  }
`;

export const ConnectionStatusText = styled(SessionSectionTitle)<{ $connected: boolean }>`
  font-size: clamp(0.8125rem, 1.9vw, 0.9375rem);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-align: center;
  color: ${(p) => (p.$connected ? 'var(--menu-connected)' : 'var(--menu-text-muted)')};
  line-height: 1.65;

  br + * {
    margin-top: 5px;
  }
`;

export const ConnectionHintBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ConnectionHintText = styled.p`
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--menu-text-muted);
  margin: 0;
  text-align: center;
  line-height: 1.5;
`;

export const ConnectionHelpLink = styled.button`
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--menu-accent);
  background: none;
  border: none;
  padding: 0.5rem 0;
  margin: 0.25rem 0 0;
  cursor: pointer;
  text-decoration: underline;
  text-align: center;
  width: 100%;
  line-height: 1.5;

  &:hover {
    color: var(--menu-accent-hover);
  }
`;

export const ConnectionCompatibilityDetails = styled.p`
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--menu-text-muted);
  background: var(--menu-bg-teal-10);
  border: 2px solid var(--menu-content-border);
  border-radius: 8px;
  padding: 0.9rem 1rem;
  margin: 0.5rem 0 0;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.5;
  white-space: pre-line;
`;

export const ConnectionErrorText = styled.p`
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--menu-danger);
  background: rgba(211, 47, 47, 0.1);
  border: 2px solid var(--menu-danger);
  border-radius: 8px;
  padding: 0.9rem 1rem;
  margin: 0.75rem 0 0;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.5;
`;

export const MusicTrackName = styled.span`
  flex: 1;
  min-width: 0;
  text-align: center;
  color: var(--menu-primary);
  font-family: inherit;
  font-size: clamp(1.0625rem, 3vw, 1.35rem);
  font-weight: 700;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
`;

export const SessionSectionValue = styled.span`
  font-family: inherit;
  font-size: 1.3125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--menu-text-inverse);
  text-align: center;
  line-height: 1.2;
  letter-spacing: -0.01em;

  @media (min-width: 540px) {
    text-align: left;
  }
`;

export const SessionSectionValueCentered = styled(SessionSectionValue)`
  display: block;
  width: 100%;
  text-align: center;

  @media (min-width: 540px) {
    text-align: center;
  }
`;

export const Label = styled.label`
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  font-weight: 700;
  color: var(--menu-primary);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  text-align: center;
`;

export const SliderWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 0 2px;
`;

export const SliderRow = styled.div`
  width: 100%;
  margin: 0;
  padding-top: 2px;
`;

export const SliderLabelsRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 8px 0 0;
  padding: 0 2px;
  box-sizing: border-box;
`;

export const SliderLabel = styled.span`
  font-family: inherit;
  font-size: 0.71875rem;
  font-weight: 600;
  color: var(--menu-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
`;

export const AudioSliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin: 0;
`;

export const SliderTrack = styled.div`
  position: relative;
  height: 6px;
  background: var(--menu-slider-track);
  border-radius: 3px;
  border: 1px solid var(--menu-primary-dim);
`;

export const SliderFill = styled.div<{ $percent: number }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${(p) => Math.max(p.$percent, 0)}%;
  background: var(--menu-slider-fill);
  border-radius: 3px;
  transition: width 0.2s ease;
`;

export const SliderThumb = styled.div<{ $percent: number }>`
  position: absolute;
  left: ${(p) => p.$percent}%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-white);
  border: 2px solid var(--menu-slider-thumb-border);
  box-shadow: 0 1px 4px var(--menu-shadow);
  pointer-events: none;
  transition: left 0.2s ease;
`;

export const SliderInput = styled.input.attrs({ type: 'range' })`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 40px;
  margin: 0;
  opacity: 0;
  cursor: pointer;
`;

export const InfoText = styled.p`
  font-family: inherit;
  color: var(--menu-text-muted);
  font-size: 0.8125rem;
  line-height: 1.45;
  text-align: center;
  margin: 6px 0 0;
  max-width: 32em;
  margin-left: auto;
  margin-right: auto;
`;

export const SessionTimeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  justify-content: center;
  padding: 2px 0 0;
`;

export const SessionTimeDisplay = styled(SessionSectionValueCentered)`
  min-width: 5.25ch;
`;

export const TimeButton = styled.button<{ $variant: 'minus' | 'plus' }>`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 8px;
  border: 2px solid ${(p) => (p.$variant === 'minus' ? 'var(--menu-danger)' : 'var(--menu-primary)')};
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  color: ${(p) => (p.$variant === 'minus' ? 'var(--menu-danger)' : 'var(--menu-primary)')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.1s,
    box-shadow 0.2s,
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
  background: transparent;

  &:hover:not(:disabled) {
    transform: scale(1.04);
    box-shadow: 0 2px 8px var(--menu-shadow);
    ${(p) =>
      p.$variant === 'minus'
        ? `
      background: var(--menu-danger-glow);
      border-color: var(--menu-danger-hover);
      color: var(--color-white);
    `
        : `
      background: var(--menu-primary-dim);
      color: var(--menu-text-inverse);
    `}
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 48px;
  gap: 8px 12px;
  width: 100%;
  box-sizing: border-box;
`;

export const MenuFooterBackButton = styled.button`
  padding: 11px 18px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  font-family: inherit;
  text-transform: uppercase;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid var(--menu-danger);
  background: transparent;
  color: var(--menu-text-inverse);
  transition:
    background 0.2s,
    transform 0.1s,
    box-shadow 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.03);
    background: var(--menu-bg-teal-10);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const MenuFooterNextButton = styled.button`
  padding: 11px 18px;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-family: inherit;
  text-transform: uppercase;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid var(--menu-primary);
  background: transparent;
  color: var(--menu-primary);
  transition:
    background 0.2s,
    transform 0.1s,
    box-shadow 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.03);
    background: var(--menu-primary-dim);
    color: var(--menu-text-inverse);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ButtonGroupStart = styled.div`
  justify-self: start;
`;

export const ButtonGroupCenter = styled.div`
  justify-self: center;
`;

export const ButtonGroupEnd = styled.div`
  justify-self: end;
`;

export const AccessibilityOpenButton = styled.button`
  padding: 8px 12px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  font-family: inherit;
  background: var(--menu-secondary-dark);
  color: var(--menu-text-inverse);
  border: 2px solid var(--menu-btn-secondary-border);
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.1s,
    background 0.2s;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;

  svg {
    font-size: 1rem;
    flex-shrink: 0;
  }

  &:hover:not(:disabled) {
    transform: scale(1.04);
    background: var(--menu-accent-hover);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const SegmentedRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
`;

export const SegmentedButton = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  font-family: inherit;
  text-transform: uppercase;
  border-radius: 10px;
  border: 2px solid ${(p) => (p.$active ? 'var(--menu-primary)' : 'var(--menu-btn-secondary-border)')};
  background: ${(p) => (p.$active ? 'var(--menu-primary-dim)' : 'var(--menu-secondary-dark)')};
  color: ${(p) => (p.$active ? 'var(--color-white)' : 'var(--menu-text-primary)')};
  cursor: pointer;
  transition:
    transform 0.1s,
    background 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.03);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }
`;

export const BrightnessSliderLabelsRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 2px;
  margin-top: 0.25rem;
`;

export const BrightnessSliderLabel = styled.span`
  font-family: inherit;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--menu-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const SecondaryButton = styled.button`
  padding: 10px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  font-family: inherit;
  background: var(--menu-btn-secondary-bg);
  color: var(--menu-btn-secondary-text);
  border: 2px solid var(--menu-btn-secondary-border);
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.1s,
    box-shadow 0.2s;
  text-transform: uppercase;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    background: var(--menu-btn-secondary-hover);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PrimaryActionButton = styled.button`
  padding: 10px 16px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-family: inherit;
  background: var(--menu-btn-action-bg);
  color: var(--menu-btn-action-text);
  border: 2px solid var(--menu-btn-action-border);
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.1s,
    box-shadow 0.2s;
  text-transform: uppercase;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    background: var(--menu-btn-action-hover);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ThemeToggleButton = styled.button<{ $isLightTheme?: boolean }>`
  font-family: inherit;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.1s;
  flex-shrink: 0;

  ${(p) =>
    p.$isLightTheme
      ? css`
          border: 2px solid var(--menu-toolbar-btn-border-active);
          background: var(--menu-toolbar-btn-bg);
          color: var(--menu-toolbar-btn-icon);
          box-shadow: var(--menu-toolbar-btn-shadow);
          &:hover {
            background: var(--menu-toolbar-btn-bg-hover);
            transform: scale(1.05);
          }
        `
      : css`
          border: 2px solid var(--menu-btn-secondary-border);
          background: var(--menu-secondary-dark);
          color: var(--menu-primary);
          &:hover {
            background: var(--menu-accent-hover);
            transform: scale(1.05);
          }
        `}

  &:active {
    transform: scale(0.98);
  }
`;

export const ConnectButton = styled.button<{ $isConnected: boolean }>`
  width: 100%;
  max-width: min(260px, 100%);
  height: 44px;
  margin: 10px auto 0;
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  font-family: inherit;
  background: ${(p) => (p.$isConnected ? 'var(--menu-danger-strong)' : 'var(--menu-slider-fill)')};
  color: var(--color-white);
  border: 2px solid var(--menu-btn-secondary-border);
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.1s,
    background 0.2s;
  text-transform: uppercase;

  &:hover:not(:disabled) {
    transform: scale(1.02);
    background: ${(p) => (p.$isConnected ? 'var(--menu-danger-hover)' : 'var(--menu-accent)')};
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const MusicSelectorLabel = styled.label`
  font-size: clamp(0.75rem, 1.6vw, 0.9rem);
  font-weight: 700;
  color: var(--menu-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  text-align: center;
`;

export const MusicSelectorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin: 0;
`;

export const MuteButton = styled.button<{ $muted: boolean }>`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--menu-btn-secondary-border);
  background: ${(p) => (p.$muted ? 'var(--menu-button-muted)' : 'var(--menu-secondary-dark)')};
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.1s;

  &:hover {
    background: ${(p) => (p.$muted ? 'var(--menu-button-muted-hover)' : 'var(--menu-accent-hover)')};
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.98);
  }
`;

export const PlayPreviewButton = styled.button<{ $playing: boolean }>`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--menu-btn-secondary-border);
  background: ${(p) => (p.$playing ? 'var(--menu-danger)' : 'var(--menu-success)')};
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.1s;

  &:hover {
    background: ${(p) => (p.$playing ? 'var(--menu-danger-hover)' : 'var(--color-success-hover)')};
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.98);
  }
`;

export const MusicSelectorButton = styled.button`
  width: 40px;
  height: 40px;
  background: var(--menu-secondary-dark);
  border: 2px solid var(--menu-btn-secondary-border);
  border-radius: 10px;
  color: var(--color-white);
  font-size: 1.35rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    transform 0.1s;

  &:hover {
    background: var(--menu-accent-hover);
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.98);
  }
`;
