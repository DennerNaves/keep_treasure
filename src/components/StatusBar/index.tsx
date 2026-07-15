import { useContext } from 'react';
import { BreathingPhaseContext } from '../../contexts/breathingPhaseContext';
import type { SensorHudConnection, StatusBarProps } from '../../types';
import { INDICATOR_CONFIG } from '../../utils/constants';
import {
  BaselineStatusText,
  BreathingCircleInner,
  BreathingCircleOuter,
  CenterPanel,
  ConnectionDot,
  ConnectionStatus,
  IndicatorHudIcon,
  IndicatorHudIconsRow,
  LeftSection,
  RightSection,
  StatusBarContainer,
  VariableValue
} from './styles';

const HUD_LABEL: Record<SensorHudConnection, string> = {
  connected: 'SENSOR CONECTADO',
  'no-signal': 'SENSOR SEM SINAL',
  'persistent-no-signal': 'SENSOR SEM SINAL - MODO AUTOMÁTICO',
  disconnected: 'SENSOR DESCONECTADO - MODO AUTOMÁTICO'
};

const HUD_TITLE: Record<SensorHudConnection, string> = {
  connected: 'Sensor conectado — RR recente',
  'no-signal': 'Sensor sem sinal — sem RR recente; ajuste o sensor',
  'persistent-no-signal': 'Sem RR há 20s — sessão como modo automático; Bluetooth pode seguir ativo',
  disconnected: 'Sensor desconectado — modo automático; reconecte no menu (Conexão)'
};

export default function StatusBar({
  activeCompanionHudCount,
  displayValue,
  cyclesPerMinute,
  baselineStatus = '',
  sensorHudConnection
}: StatusBarProps) {
  const breathingContext = useContext(BreathingPhaseContext);
  const breathPhase = breathingContext?.breathPhase ?? 0.5;
  const valueText = displayValue > 0 ? String(Math.round(displayValue)) : '--';
  const isSensorSignalLost = sensorHudConnection === 'no-signal' || sensorHudConnection === 'persistent-no-signal';
  const hudIconSlots = INDICATOR_CONFIG.HUD_ICON_SLOT_COUNT;

  return (
    <StatusBarContainer>
      <LeftSection>
        <ConnectionStatus $variant={sensorHudConnection} title={HUD_TITLE[sensorHudConnection]}>
          <ConnectionDot />
          {HUD_LABEL[sensorHudConnection]}
        </ConnectionStatus>
      </LeftSection>

      <CenterPanel $signalLost={isSensorSignalLost}>
        <VariableValue $signalLost={isSensorSignalLost}>{valueText}</VariableValue>
        {INDICATOR_CONFIG.ENABLED && (
          <IndicatorHudIconsRow $signalLost={isSensorSignalLost}>
            {[...Array(hudIconSlots)].map((_, i) => (
              <IndicatorHudIcon
                key={i}
                src={activeCompanionHudCount > i ? INDICATOR_CONFIG.IMAGES.ON : INDICATOR_CONFIG.IMAGES.OFF}
                alt={`${INDICATOR_CONFIG.NAME} — posição ${i + 1} no HUD (${activeCompanionHudCount > i ? 'ativo' : 'inativo'})`}
                title={`Posição ${i + 1}/${hudIconSlots} no HUD. Companheiros ativos no jogo: ${activeCompanionHudCount}.`}
              />
            ))}
          </IndicatorHudIconsRow>
        )}
      </CenterPanel>

      <RightSection>
        {baselineStatus ? (
          <BaselineStatusText
            $ready={baselineStatus.startsWith('LIMIAR')}
            $isCalibration={baselineStatus.startsWith('CALIBRAÇÃO')}
          >
            {baselineStatus}
          </BaselineStatusText>
        ) : null}
        <BreathingCircleOuter title={`Velocidade: ${cyclesPerMinute} CPM`}>
          <BreathingCircleInner $phase={breathPhase} />
        </BreathingCircleOuter>
      </RightSection>
    </StatusBarContainer>
  );
}
