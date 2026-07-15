import { useEffect, useState } from 'react';
import { FaCompressArrowsAlt, FaExpandArrowsAlt, FaPause, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { MdMusicNote, MdMusicOff, MdSettingsInputAntenna } from 'react-icons/md';
import { useBluetooth } from '../../hooks/useBluetooth';
import type { TopBarProps } from '../../types';
import { isRecentRrReceived } from '../../utils/sensorSignal';
import { ControlButton, ControlButtons, ScoreDisplay, TimeDisplay, TimeScorePanel, TopBarContainer } from './styles';

export default function TopBar({
  time,
  score,
  onPause,
  onFullscreen,
  onToggleMusic,
  onToggleSFX,
  onSensorClick,
  isMusicOn = true,
  isSFXOn = true,
  isFullscreen = false
}: TopBarProps) {
  const { isConnected, lastRRReceivedAt } = useBluetooth();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  const sensorActive = isConnected && isRecentRrReceived(lastRRReceivedAt, nowMs);

  return (
    <TopBarContainer>
      <TimeScorePanel>
        <TimeDisplay>TEMPO: {time}</TimeDisplay>
        <ScoreDisplay>PONTOS: {score}</ScoreDisplay>
      </TimeScorePanel>
      <ControlButtons>
        {onSensorClick != null && (
          <ControlButton
            $dimmed={!sensorActive}
            onClick={onSensorClick}
            title={sensorActive ? 'Sensor enviando dados' : 'Sensor sem sinal – verifique o sensor'}
            aria-label={sensorActive ? 'Sensor enviando dados' : 'Sensor sem sinal – verifique o sensor'}
          >
            <MdSettingsInputAntenna />
          </ControlButton>
        )}
        <ControlButton
          onClick={onToggleMusic}
          title={isMusicOn ? 'Desligar Música' : 'Ligar Música'}
          aria-label={isMusicOn ? 'Desligar Música' : 'Ligar Música'}
        >
          {isMusicOn ? <MdMusicNote /> : <MdMusicOff />}
        </ControlButton>
        <ControlButton
          onClick={onToggleSFX}
          title={isSFXOn ? 'Desligar Som' : 'Ligar Som'}
          aria-label={isSFXOn ? 'Desligar Som' : 'Ligar Som'}
        >
          {isSFXOn ? <FaVolumeUp /> : <FaVolumeMute />}
        </ControlButton>
        <ControlButton onClick={onPause} title='Pausar' aria-label='Pausar'>
          <FaPause />
        </ControlButton>
        <ControlButton
          onClick={onFullscreen}
          title={isFullscreen ? 'Sair da tela cheia' : 'Tela Cheia'}
          aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela Cheia'}
        >
          {isFullscreen ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
        </ControlButton>
      </ControlButtons>
    </TopBarContainer>
  );
}
