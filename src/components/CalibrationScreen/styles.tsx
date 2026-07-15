import styled from 'styled-components';

export const CalibrationContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--menu-bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 0;
`;

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70%;
  max-width: 70vw;
  height: 85%;
  max-height: 85vh;
  background: var(--menu-content-bg);
  border: 4px solid var(--menu-content-border);
  border-radius: 20px;
  padding: clamp(1.2rem, 3vw, 2rem);
  gap: clamp(1rem, 2.5vw, 1.5rem);
  box-sizing: border-box;
  box-shadow: var(--menu-shadow-card);
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 900px) {
    width: 92%;
    max-width: 92vw;
    height: 92%;
    max-height: 92vh;
    padding: clamp(1rem, 2.5vw, 1.5rem);
    gap: clamp(0.75rem, 2vw, 1.25rem);
  }
`;

export const Title = styled.h1`
  font-family: var(--font-ui), sans-serif;
  font-size: clamp(1.35rem, 4vw, 1.75rem);
  font-weight: 700;
  color: var(--menu-primary);
  margin: 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  text-shadow: 1px 1px 0 var(--menu-title-shadow);
`;

export const Subtitle = styled.p`
  font-family: var(--font-primary);
  font-size: clamp(0.9rem, 2.2vw, 1.05rem);
  font-weight: 500;
  color: var(--menu-text-primary);
  margin: 0;
  text-align: center;
  line-height: 1.4;
`;

export const GraphWrapper = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: stretch;
  width: 100%;
  flex: ${(p) => (p.$compact ? '0 1 auto' : '1 1 auto')};
  min-height: 0;
  gap: 0.75rem;
  flex-shrink: 1;

  @media (max-width: 900px) {
    flex: 0 1 auto;
    min-height: 180px;
    max-height: 55vh;
  }
`;

export const GraphArea = styled.div<{ $compact?: boolean }>`
  flex: 1;
  min-width: 0;
  min-height: ${(p) => (p.$compact ? 'clamp(160px, 28vh, 240px)' : 'clamp(200px, 45vh, 350px)')};
  max-height: ${(p) => (p.$compact ? '42vh' : '55vh')};
  background: var(--menu-calibration-graph-bg);
  border: 2px solid var(--menu-calibration-graph-border);
  border-radius: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 12px;
    background: linear-gradient(180deg, var(--menu-primary-dim) 0%, transparent 100%);
    border-radius: 18px 18px 0 0;
  }

  @media (max-width: 900px) {
    min-height: clamp(180px, 45vh, 280px);
    max-height: 55vh;
  }

  .median-badge {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: var(--menu-bg-teal-10);
    border: 1px solid var(--menu-content-border);
    border-radius: 10px;
    padding: 0.35rem 0.7rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    backdrop-filter: blur(4px);
    pointer-events: none;

    span {
      font-family: var(--font-primary);
      font-size: 0.7rem;
      color: var(--menu-calibration-median-text);
      opacity: 0.8;
      line-height: 1.1;
    }

    strong {
      font-family: var(--font-primary);
      font-size: 1.55rem;
      font-weight: 700;
      color: var(--menu-calibration-median-text);
      line-height: 1;
    }
  }
`;

export const GraphSvg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;

  line {
    stroke: var(--menu-primary);
    stroke-width: 0.5;
    stroke-dasharray: 2 2;
  }

  path {
    fill: none;
    stroke: var(--menu-accent);
    stroke-width: 0.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  circle {
    fill: var(--menu-primary);
    stroke: var(--menu-calibration-graph-border);
    stroke-width: 0.25;
    paint-order: stroke fill;
  }
`;

export const CalibrationFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: clamp(0.75rem, 2vw, 1rem);
  flex-shrink: 0;
  padding-top: 0.5rem;
  padding-bottom: 0.35rem;
  border-top: 1px solid var(--menu-content-border);
  margin-top: auto;
  background: transparent;
`;

export const ProgressRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }
`;

export const ProgressCount = styled.div`
  font-family: var(--font-primary);
  font-size: clamp(0.95rem, 2.2vw, 1.15rem);
  font-weight: 600;
  color: var(--menu-calibration-progress-text);
  text-align: right;

  @media (max-width: 600px) {
    text-align: left;
  }
`;

export const ProgressStatus = styled.div`
  font-family: var(--font-primary);
  font-size: clamp(0.95rem, 2.2vw, 1.15rem);
  font-weight: 600;
  color: var(--menu-calibration-progress-text);
  text-align: left;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  @media (max-width: 600px) {
    text-align: left;
  }
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 16px;
  background: var(--menu-calibration-progress-track);
  border: none;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
`;

export const ProgressBarFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${(p) => Math.min(100, p.$progress)}%;
  background: var(--menu-calibration-progress-fill);
  border-radius: 999px;
  transition: width 0.9s linear;
  box-shadow: 0 0 8px var(--menu-calibration-progress-glow);
`;

export const SensorWarning = styled.p`
  font-family: var(--font-primary);
  font-size: clamp(0.85rem, 2vw, 1rem);
  color: var(--menu-primary);
  background: var(--menu-bg-teal-10);
  border: 2px solid var(--menu-content-border);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin: 0;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
`;

export const SensorStatusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: var(--menu-calibration-sensor-bar-bg);
  border: none;
  border-radius: 999px;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

export const SensorStatusItem = styled.div<{ $status?: 'ok' | 'warning' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-primary);
  font-size: clamp(0.85rem, 2vw, 1rem);
  font-weight: 400;
  color: var(--menu-calibration-sensor-text);

  &:not(:first-child) {
    padding-left: 1rem;
    border-left: 1px solid var(--menu-calibration-sensor-separator);
  }

  ${(p) =>
    p.$status === 'error' &&
    `
    color: var(--menu-calibration-sensor-error);
  `}
  ${(p) =>
    p.$status === 'warning' &&
    `
    color: var(--menu-accent);
  `}
`;

export const MetricIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--menu-primary);

  svg {
    width: 1.1rem;
    height: 1.1rem;
    flex-shrink: 0;
  }
`;

export const ConnectionDot = styled.span<{ $connected: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(p) => (p.$connected ? 'var(--menu-connected)' : 'var(--color-danger-button)')};
  box-shadow: ${(p) =>
    p.$connected ? '0 0 0 2px rgba(0, 255, 65, 0.5), 0 0 10px var(--menu-connected)' : '0 0 0 2px rgba(220, 53, 69, 0.5)'};
  flex-shrink: 0;
`;

export const HardwareWarning = styled.div`
  font-family: var(--font-primary);
  font-size: clamp(0.9rem, 2.2vw, 1.05rem);
  color: var(--menu-primary);
  background: var(--menu-calibration-warning-bg);
  border: 2px solid var(--menu-primary);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin: 0;
  text-align: center;
  width: 100%;
  box-sizing: border-box;

  strong {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 1em;
  }

  span {
    font-size: 0.9em;
    opacity: 0.95;
  }
`;

export const VoltarButton = styled.button`
  font-family: var(--font-primary);
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  padding: 0.6rem 1.5rem;
  background: transparent;
  color: var(--menu-accent);
  border: 2px solid var(--menu-accent);
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  flex-shrink: 0;
  width: 100%;
  max-width: 200px;
  margin-top: 0.25rem;

  &:hover {
    background: var(--menu-bg-teal-10);
    color: var(--menu-text-primary);
  }
`;
