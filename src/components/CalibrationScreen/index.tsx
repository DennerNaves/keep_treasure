import { useEffect, useMemo, useRef, useState } from 'react';
import { CiHeart } from 'react-icons/ci';
import { GiChart } from 'react-icons/gi';
import { useBluetooth } from '../../hooks/useBluetooth';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useVFC } from '../../hooks/useVFC';
import { VFC_CONFIG } from '../../utils/constants';
import { isRecentRrReceived } from '../../utils/sensorSignal';
import {
  CalibrationContainer,
  CalibrationFooter,
  ConnectionDot,
  GraphArea,
  GraphSvg,
  GraphWrapper,
  HardwareWarning,
  MetricIcon,
  Panel,
  ProgressBar,
  ProgressBarFill,
  ProgressCount,
  ProgressRow,
  ProgressStatus,
  SensorStatusBar,
  SensorStatusItem,
  SensorWarning,
  Subtitle,
  Title,
  VoltarButton
} from './styles';

const VIEWBOX_W = 100;
const VIEWBOX_H = 100;
const GRAPH_VIEWBOX_PAD_X = 4;
const GRAPH_VIEWBOX_PAD_Y = 3;
const SAMPLE_DOT_RADIUS = 0.55;

const CALIBRATION_COMPLETE_DELAY_MS = 3000;

export default function CalibrationScreen() {
  const { state, completeCalibration, goToMainMenu } = useGameEngine();
  const { isConnected, heartRate, lastRRReceivedAt, sensorContactStatus } = useBluetooth();
  const { baselineSamplesCount, isBaselineReady, baselineSamplesSnapshot, runningMedian } = useVFC();
  const completionTimeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const targetSamplesRef = useRef<number[]>(baselineSamplesSnapshot);
  const currentSamplesRef = useRef<number[]>(baselineSamplesSnapshot);
  const [animatedSamples, setAnimatedSamples] = useState<number[]>(baselineSamplesSnapshot);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const hasRecentSignal = isRecentRrReceived(lastRRReceivedAt, nowMs);
  const sensorHasData = isConnected && sensorContactStatus !== 'not-detected' && heartRate != null && heartRate > 0 && hasRecentSignal;
  const isStalled = isConnected && !isBaselineReady && !sensorHasData;
  const showStalledWarning = isConnected && isStalled;
  const sensorStatus: 'ok' | 'warning' | 'error' = !isConnected ? 'error' : sensorHasData ? 'ok' : 'warning';
  const sensorStatusText = !isConnected
    ? 'SENSOR DESCONECTADO - MODO AUTOMÁTICO'
    : sensorHasData
      ? 'SENSOR CONECTADO'
      : 'SENSOR CONECTADO (SEM DADOS)';
  const heartRateText = !isConnected ? '--' : sensorHasData ? `${heartRate} BPM` : '0 BPM';

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    targetSamplesRef.current = baselineSamplesSnapshot;
  }, [baselineSamplesSnapshot]);

  useEffect(() => {
    if (state.currentState !== 'calibration') {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      currentSamplesRef.current = baselineSamplesSnapshot;
      return;
    }

    const animate = (): void => {
      const target = targetSamplesRef.current;
      const current = [...currentSamplesRef.current];
      const hadLengthMismatch = current.length !== target.length;

      if (hadLengthMismatch) {
        const lastValue = current.length > 0 ? current[current.length - 1] : (target[0] ?? 0);
        while (current.length < target.length) current.push(lastValue);
        if (current.length > target.length) current.length = target.length;
      }

      let hasChange = false;
      for (let i = 0; i < target.length; i += 1) {
        const next = current[i] + (target[i] - current[i]) * 0.14;
        if (Math.abs(next - current[i]) > 0.001) {
          hasChange = true;
        }
        current[i] = next;
      }

      currentSamplesRef.current = current;
      if (hasChange || hadLengthMismatch) {
        setAnimatedSamples(current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [state.currentState, baselineSamplesSnapshot]);

  const { pathD, medianY, hasData, graphPoints } = useMemo(() => {
    const arr = animatedSamples;
    if (arr.length < 2) {
      return { pathD: '', medianY: 50, hasData: false, graphPoints: [] as Array<{ x: number; y: number }> };
    }

    const buildSmoothPathThroughSamples = (points: Array<{ x: number; y: number }>): string => {
      if (points.length < 2) return '';

      if (points.length === 2) {
        return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
      }

      let d = `M ${points[0].x},${points[0].y}`;
      for (let i = 0; i < points.length - 1; i += 1) {
        const p0 = points[i - 1] ?? points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] ?? p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
      return d;
    };

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min || 1;
    const innerW = VIEWBOX_W - 2 * GRAPH_VIEWBOX_PAD_X;
    const innerH = VIEWBOX_H - 2 * GRAPH_VIEWBOX_PAD_Y;
    const points = arr.map((v, i) => {
      const n = arr.length;
      const x = n <= 1 ? VIEWBOX_W / 2 : GRAPH_VIEWBOX_PAD_X + (i / (n - 1)) * innerW;
      const y = VIEWBOX_H - GRAPH_VIEWBOX_PAD_Y - ((v - min) / range) * innerH;
      return { x, y };
    });
    const pathD = buildSmoothPathThroughSamples(points);
    const medianVal = runningMedian;
    const medianY = max > min ? VIEWBOX_H - GRAPH_VIEWBOX_PAD_Y - ((medianVal - min) / range) * innerH : 50;
    return { pathD, medianY, hasData: true, graphPoints: points };
  }, [animatedSamples, runningMedian]);

  useEffect(() => {
    if (state.currentState !== 'calibration' || !isBaselineReady || baselineSamplesCount < VFC_CONFIG.BASELINE_SAMPLES) {
      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = null;
      }
      return;
    }

    if (completionTimeoutRef.current === null) {
      completionTimeoutRef.current = window.setTimeout(() => {
        completionTimeoutRef.current = null;
        completeCalibration();
      }, CALIBRATION_COMPLETE_DELAY_MS);
    }

    return () => {
      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = null;
      }
    };
  }, [state.currentState, isBaselineReady, baselineSamplesCount, completeCalibration]);

  if (state.currentState !== 'calibration') return null;

  const progressPct = Math.min(100, Math.round((baselineSamplesCount / VFC_CONFIG.BASELINE_SAMPLES) * 100));

  return (
    <CalibrationContainer>
      <Panel className='menu-scroll-area'>
        <Title>CALIBRAÇÃO EM ANDAMENTO</Title>
        <Subtitle>RESPIRE NORMALMENTE PARA DEFINIR O BASAL...</Subtitle>

        <SensorStatusBar>
          <SensorStatusItem $status={sensorStatus}>
            <ConnectionDot $connected={isConnected} />
            {sensorStatusText}
          </SensorStatusItem>
          {isConnected && (
            <SensorStatusItem>
              <MetricIcon aria-hidden='true'>
                <CiHeart />
              </MetricIcon>
              FC: {heartRateText}
            </SensorStatusItem>
          )}
          {isConnected && (
            <SensorStatusItem>
              <MetricIcon aria-hidden='true'>
                <GiChart />
              </MetricIcon>
              MEDIANA: {Math.round(runningMedian)}
            </SensorStatusItem>
          )}
        </SensorStatusBar>

        {!isConnected && (
          <SensorWarning>Sensor não conectado. Volte ao menu (aba Conexão) e toque em CONECTAR antes de iniciar.</SensorWarning>
        )}

        {showStalledWarning && (
          <HardwareWarning>
            <strong>⚠️ Sensor sem sinal – verifique o encaixe</strong>
            <span>
              O sensor está conectado, mas não está enviando dados. Isso geralmente é um problema de hardware: ajuste a posição do sensor e
              verifique se está bem preso na pele.
            </span>
          </HardwareWarning>
        )}

        <GraphWrapper $compact={showStalledWarning}>
          <GraphArea $compact={showStalledWarning}>
            <GraphSvg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} preserveAspectRatio='none'>
              {hasData && <line x1={0} y1={medianY} x2={VIEWBOX_W} y2={medianY} vectorEffect='non-scaling-stroke' />}
              {pathD ? (
                <>
                  <path d={pathD} vectorEffect='non-scaling-stroke' />
                  {graphPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={SAMPLE_DOT_RADIUS} />
                  ))}
                </>
              ) : null}
            </GraphSvg>
            <div className='median-badge'>
              <span>Mediana</span>
              <strong>{Math.round(runningMedian)}</strong>
            </div>
          </GraphArea>
        </GraphWrapper>

        <CalibrationFooter>
          <ProgressRow>
            <ProgressStatus>
              <MetricIcon aria-hidden='true'>
                <GiChart />
              </MetricIcon>
              Calibrando...
            </ProgressStatus>
            <ProgressCount>
              {baselineSamplesCount}/{VFC_CONFIG.BASELINE_SAMPLES} amostras ({progressPct}%)
            </ProgressCount>
          </ProgressRow>
          <ProgressBar>
            <ProgressBarFill $progress={progressPct} />
          </ProgressBar>
          <VoltarButton onClick={goToMainMenu}>VOLTAR</VoltarButton>
        </CalibrationFooter>
      </Panel>
    </CalibrationContainer>
  );
}
