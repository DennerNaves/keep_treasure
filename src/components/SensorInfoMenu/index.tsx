import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { MdSettingsInputAntenna } from 'react-icons/md';
import { useBluetooth } from '../../hooks/useBluetooth';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useVFC } from '../../hooks/useVFC';
import type { SensorInfoMenuProps } from '../../types';
import { SENSOR_SESSION_CONFIG, VFC_CONFIG } from '../../utils/constants';
import {
  SensorCloseButton,
  SensorHint,
  SensorMenuBody,
  SensorMenuContainer,
  SensorMenuContent,
  SensorMenuTitle,
  SensorStatLabel,
  SensorStatRow,
  SensorStatValue
} from './styles';

function formatSecondsAgo(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 1) return 'agora';
  if (s === 1) return '1 s atrás';
  return `${s} s atrás`;
}

const RR_SIGNAL_STALE_MS = 3000;
const NO_SIGNAL_TO_DISCONNECT_SECONDS = Math.floor(SENSOR_SESSION_CONFIG.NO_SIGNAL_TO_DISCONNECT_MS / 1000);

export default function SensorInfoMenu({ isOpen, onClose }: SensorInfoMenuProps) {
  const { isConnected, deviceName, batteryLevel, heartRate, lastRRReceivedAt, sensorContactStatus } = useBluetooth();
  const { state, getSessionDifficulty } = useGameEngine();
  const { baseline, baselineSamplesCount, rrIntervals } = useVFC();
  const [lastDataStr, setLastDataStr] = useState<string>('—');
  const [secondsSinceLastData, setSecondsSinceLastData] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !isConnected || lastRRReceivedAt == null) {
      const t = setTimeout(() => {
        setLastDataStr('—');
        setSecondsSinceLastData(null);
      }, 0);
      return () => clearTimeout(t);
    }
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      const sec = Math.floor((Date.now() - lastRRReceivedAt) / 1000);
      setSecondsSinceLastData(sec);
      setLastDataStr(formatSecondsAgo(sec * 1000));
    };
    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 1000);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId != null) clearInterval(intervalId);
    };
  }, [isOpen, isConnected, lastRRReceivedAt]);

  if (!isOpen) return null;

  const sessionDifficulty = getSessionDifficulty();
  const baselineVfcLabel =
    state.sessionWithSensor === true &&
    state.sessionSignalLossPersistent !== true &&
    (sessionDifficulty === 'easy' || sessionDifficulty === 'medium')
      ? 'Referência (calibração)'
      : 'Limiar VFC';

  const isReceivingSignals = isConnected && secondsSinceLastData != null && secondsSinceLastData * 1000 < RR_SIGNAL_STALE_MS;
  const noSignalExceededDisconnectThreshold =
    isConnected &&
    sensorContactStatus !== 'not-detected' &&
    secondsSinceLastData != null &&
    secondsSinceLastData >= NO_SIGNAL_TO_DISCONNECT_SECONDS;
  const hasRecentData = isReceivingSignals && heartRate != null && heartRate > 0;
  const statusLabel = !isConnected
    ? 'Sensor desconectado - modo automático'
    : noSignalExceededDisconnectThreshold
      ? 'Desconectado'
      : sensorContactStatus === 'not-detected'
        ? 'Conectado sem contato com a pele'
        : isReceivingSignals
          ? 'Conectado (recebendo sinais)'
          : 'Conectado sem receber sinais';
  const statusOk = isConnected && sensorContactStatus !== 'not-detected' && isReceivingSignals;
  const statusWarn = !statusOk;

  return (
    <SensorMenuContainer onClick={onClose}>
      <SensorMenuContent onClick={(e) => e.stopPropagation()} className='menu-scroll-area'>
        <SensorMenuTitle>
          <MdSettingsInputAntenna /> INFORMAÇÕES DO SENSOR
        </SensorMenuTitle>

        <SensorMenuBody>
          <SensorStatRow>
            <SensorStatLabel>Status</SensorStatLabel>
            <SensorStatValue $ok={statusOk} $warn={statusWarn}>
              {statusLabel}
            </SensorStatValue>
          </SensorStatRow>

          {isConnected && (
            <>
              <SensorStatRow>
                <SensorStatLabel>Dispositivo</SensorStatLabel>
                <SensorStatValue>{deviceName ?? '—'}</SensorStatValue>
              </SensorStatRow>

              <SensorStatRow>
                <SensorStatLabel>Frequência cardíaca</SensorStatLabel>
                <SensorStatValue $ok={hasRecentData} $warn={!hasRecentData}>
                  {hasRecentData ? `${heartRate} BPM` : 'Sem dados'}
                </SensorStatValue>
              </SensorStatRow>

              <SensorStatRow>
                <SensorStatLabel>Último dado</SensorStatLabel>
                <SensorStatValue $ok={hasRecentData} $warn={!hasRecentData}>
                  {lastDataStr}
                </SensorStatValue>
              </SensorStatRow>

              {secondsSinceLastData != null && secondsSinceLastData >= 3 && (
                <SensorHint>
                  {noSignalExceededDisconnectThreshold
                    ? `💡 Sem atividade há ${NO_SIGNAL_TO_DISCONNECT_SECONDS}s consecutivos: o status passou para desconectado.`
                    : `💡 O sensor parou de enviar dados. Se passar de ${NO_SIGNAL_TO_DISCONNECT_SECONDS}s sem atividade, o status muda para desconectado.`}
                </SensorHint>
              )}

              {batteryLevel != null && (
                <SensorStatRow>
                  <SensorStatLabel>Bateria</SensorStatLabel>
                  <SensorStatValue $warn={batteryLevel < 20}>{batteryLevel}%</SensorStatValue>
                </SensorStatRow>
              )}

              {baseline != null && (
                <SensorStatRow>
                  <SensorStatLabel>{baselineVfcLabel}</SensorStatLabel>
                  <SensorStatValue>{Math.floor(baseline)} ms</SensorStatValue>
                </SensorStatRow>
              )}

              <SensorStatRow>
                <SensorStatLabel>Amostras RR</SensorStatLabel>
                <SensorStatValue>
                  {rrIntervals.length} (basal: {baselineSamplesCount}/{VFC_CONFIG.BASELINE_SAMPLES})
                </SensorStatValue>
              </SensorStatRow>
            </>
          )}

          {!isConnected && (
            <SensorHint>
              Conecte um sensor de frequência cardíaca na aba Conexão do menu principal para usar o jogo com biofeedback.
            </SensorHint>
          )}
        </SensorMenuBody>

        <SensorCloseButton onClick={onClose}>
          <FaTimes /> FECHAR
        </SensorCloseButton>
      </SensorMenuContent>
    </SensorMenuContainer>
  );
}
