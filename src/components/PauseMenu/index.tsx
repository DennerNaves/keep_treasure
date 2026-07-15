import { useEffect, useState } from 'react';
import { FaPause, FaPlay, FaRedo, FaTimes, FaUniversalAccess, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useAudio } from '../../hooks/useAudio';
import { useGameEngine } from '../../hooks/useGameEngine';
import {
  ALLOW_BRIGHTNESS_CONTROL,
  ALLOW_THEME_SWITCH,
  MENU_BREATHING_PATTERN_BUTTON_LABEL,
  MENU_DIFFICULTY_LABEL
} from '../../utils/constants';
import AccessibilityModal from '../AccessibilityModal';
import {
  AudioSliderRow,
  FormGroup,
  MuteButton,
  SessionSectionTitle,
  SessionSectionValue,
  SessionSectionValueCentered,
  SliderFill,
  SliderInput,
  SliderThumb,
  SliderTrack,
  SliderWrapper
} from '../MainMenu/styles';
import {
  ButtonGroup,
  DangerButton,
  PauseAccessibilityButton,
  PauseBody,
  PauseContainer,
  PauseContent,
  PauseVolumeSection,
  PrimaryActionButton,
  SecondaryButton,
  Title
} from './styles';

export default function PauseMenu() {
  const { state, resumeGame, restartGame, quitSession, getSessionDifficulty, getBreathingPattern } = useGameEngine();
  const { setMusicVolume, setSFXVolume, getMusicVolume, getSFXVolume, toggleMusic, toggleSFX } = useAudio();

  const [musicVol, setMusicVol] = useState(getMusicVolume());
  const [sfxVol, setSfxVol] = useState(getSFXVolume());
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  const hasAccessibilityOptions = ALLOW_THEME_SWITCH || ALLOW_BRIGHTNESS_CONTROL;

  useEffect(() => {
    if (state.currentState === 'paused') {
      queueMicrotask(() => {
        setMusicVol(getMusicVolume());
        setSfxVol(getSFXVolume());
      });
    }
  }, [state.currentState, getMusicVolume, getSFXVolume]);

  const handleMusicVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setMusicVol(v);
    setMusicVolume(v);
  };

  const handleSfxVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setSfxVol(v);
    setSFXVolume(v);
  };

  const handleToggleMusic = () => {
    toggleMusic();
    setMusicVol(getMusicVolume());
  };

  const handleToggleSFX = () => {
    toggleSFX();
    setSfxVol(getSFXVolume());
  };

  if (state.currentState !== 'paused') return null;

  return (
    <PauseContainer>
      <PauseContent className='menu-scroll-area'>
        <Title>
          <FaPause /> PAUSADO
        </Title>

        <PauseBody>
          <PauseVolumeSection>
            <FormGroup>
              <SessionSectionTitle>Nesta partida</SessionSectionTitle>
              <SessionSectionValue>
                Dificuldade: {MENU_DIFFICULTY_LABEL[getSessionDifficulty()]}
                <br />
                Respiração: {MENU_BREATHING_PATTERN_BUTTON_LABEL[getBreathingPattern()]}
              </SessionSectionValue>
            </FormGroup>
          </PauseVolumeSection>

          <PauseVolumeSection>
            <FormGroup>
              <SessionSectionTitle>Efeitos sonoros</SessionSectionTitle>
              <SessionSectionValueCentered>{Math.floor(sfxVol * 100)}%</SessionSectionValueCentered>
              <AudioSliderRow>
                <SliderWrapper>
                  <SliderTrack>
                    <SliderFill $percent={sfxVol * 100} />
                    <SliderThumb $percent={sfxVol * 100} />
                    <SliderInput min={0} max={1} step={0.1} value={sfxVol} onChange={handleSfxVol} />
                  </SliderTrack>
                </SliderWrapper>
                <MuteButton
                  type='button'
                  $muted={sfxVol === 0}
                  onClick={handleToggleSFX}
                  title={sfxVol === 0 ? 'Ativar efeitos' : 'Mutar efeitos'}
                >
                  {sfxVol === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                </MuteButton>
              </AudioSliderRow>
            </FormGroup>

            <FormGroup>
              <SessionSectionTitle>Música</SessionSectionTitle>
              <SessionSectionValueCentered>{Math.floor(musicVol * 100)}%</SessionSectionValueCentered>
              <AudioSliderRow>
                <SliderWrapper>
                  <SliderTrack>
                    <SliderFill $percent={musicVol * 100} />
                    <SliderThumb $percent={musicVol * 100} />
                    <SliderInput min={0} max={1} step={0.1} value={musicVol} onChange={handleMusicVol} />
                  </SliderTrack>
                </SliderWrapper>
                <MuteButton
                  type='button'
                  $muted={musicVol === 0}
                  onClick={handleToggleMusic}
                  title={musicVol === 0 ? 'Ativar música' : 'Mutar música'}
                >
                  {musicVol === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                </MuteButton>
              </AudioSliderRow>
            </FormGroup>
          </PauseVolumeSection>

          {hasAccessibilityOptions && (
            <PauseAccessibilityButton
              type='button'
              onClick={() => setAccessibilityOpen(true)}
              title='Acessibilidade e aparência'
              aria-label='Acessibilidade'
            >
              <FaUniversalAccess aria-hidden />
              Acessibilidade
            </PauseAccessibilityButton>
          )}

          <ButtonGroup>
            <PrimaryActionButton onClick={resumeGame} title='Voltar ao jogo' aria-label='Voltar para a partida'>
              <FaPlay /> Voltar para a partida
            </PrimaryActionButton>
            <SecondaryButton onClick={restartGame} title='Reiniciar partida' aria-label='Reiniciar partida'>
              <FaRedo /> Reiniciar partida
            </SecondaryButton>
            <DangerButton onClick={quitSession} title='Encerrar e voltar' aria-label='Encerrar partida'>
              <FaTimes /> Encerrar partida
            </DangerButton>
          </ButtonGroup>
        </PauseBody>

        <AccessibilityModal isOpen={accessibilityOpen} onClose={() => setAccessibilityOpen(false)} />
      </PauseContent>
    </PauseContainer>
  );
}
