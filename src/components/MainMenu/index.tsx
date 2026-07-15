import { useEffect, useRef, useState } from 'react';
import { FaBluetoothB, FaGamepad, FaMusic, FaPause, FaPlay, FaUniversalAccess, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { MdChair } from 'react-icons/md';
import { useAudio } from '../../hooks/useAudio';
import { useBluetooth } from '../../hooks/useBluetooth';
import { useGameEngine } from '../../hooks/useGameEngine';
import type { BreathingPatternId } from '../../types';
import type { MenuBreathingPatternId, MenuDifficultyId } from '../../utils/constants';
import {
  ALLOW_BRIGHTNESS_CONTROL,
  ALLOW_THEME_SWITCH,
  AUDIO_CONFIG,
  GAME_CONFIG,
  MENU_BREATHING_PATTERN_BUTTON_LABEL,
  MENU_BREATHING_PATTERN_COPY,
  MENU_DIFFICULTY_COPY
} from '../../utils/constants';
import { formatBluetoothError, getWebBluetoothSupport } from '../../utils/webBluetoothSupport';
import AccessibilityModal from '../AccessibilityModal';
import MenuScreenBackdrop from '../shared/MenuScreenBackdrop';
import ModoBreathingPreview from './ModoBreathingPreview';
import {
  AccessibilityOpenButton,
  AudioSliderRow,
  BreathingCircleInner,
  BreathingCircleOuter,
  BreathingCircleWrapper,
  ButtonGroup,
  ButtonGroupCenter,
  ButtonGroupEnd,
  ButtonGroupStart,
  ConnectButton,
  ConnectionCompatibilityDetails,
  ConnectionErrorText,
  ConnectionFormGroup,
  ConnectionHelpLink,
  ConnectionHintBlock,
  ConnectionHintText,
  ConnectionStatusText,
  ConnectionTabSection,
  ContentColumn,
  FormGroup,
  InfoText,
  MenuBody,
  MenuContainer,
  MenuContent,
  MenuFooter,
  MenuFooterBackButton,
  MenuFooterNextButton,
  MenuScrollArea,
  MenuSection,
  MenuTabContent,
  MusicSelectorButton,
  MusicSelectorRow,
  MusicTrackName,
  MuteButton,
  PlayPreviewButton,
  SegmentedButton,
  SegmentedRow,
  SessionColumnStack,
  SessionSectionTitleCentered,
  SessionSectionValueCentered,
  SessionTimeDisplay,
  SessionTimeRow,
  SliderFill,
  SliderInput,
  SliderLabel,
  SliderLabelsRow,
  SliderRow,
  SliderThumb,
  SliderTrack,
  SliderWrapper,
  TabCircleButton,
  TabConnectorSegment,
  TabNavIcon,
  TabNavLabel,
  TabsContainer,
  TabsRow,
  TimeButton
} from './styles';

export default function MainMenu() {
  const { state, goToWelcome, startGame, setSessionLimit, setCyclesPerMinute, setBreathingPattern } = useGameEngine();
  const { connect, disconnect, isConnected, isLoading, error, batteryLevel, deviceName, lastRRReceivedAt } = useBluetooth();
  const {
    initAudio,
    startMusic,
    setMusicVolume,
    setSFXVolume,
    getMusicVolume,
    getSFXVolume,
    getCurrentTrackName,
    getCurrentTrackIndex,
    setTrack,
    isPlaying,
    toggleMusic,
    toggleSFX,
    togglePreview
  } = useAudio();

  const [activeTab, setActiveTab] = useState(0);
  const [sessionTime, setSessionTime] = useState<number>(GAME_CONFIG.DEFAULT_SESSION_LIMIT);
  const [cpm, setCpm] = useState<number>(GAME_CONFIG.DEFAULT_CYCLES_PER_MINUTE);
  const [musicVol, setMusicVol] = useState(getMusicVolume());
  const [sfxVol, setSfxVol] = useState(getSFXVolume());
  const [currentTrackIndex, setCurrentTrackIndex] = useState(getCurrentTrackIndex());
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [showCompatibilityDetails, setShowCompatibilityDetails] = useState(false);
  const [showNoRRWarning, setShowNoRRWarning] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [breathingPatternMenu, setBreathingPatternMenu] = useState<MenuBreathingPatternId>('continuous');
  const [menuDifficulty, setMenuDifficulty] = useState<MenuDifficultyId>('medium');

  const RR_COMPATIBILITY_TIMEOUT_MS = 6000;

  const timeHoldRef = useRef<{
    timeoutId: ReturnType<typeof setTimeout> | null;
    intervalId: ReturnType<typeof setInterval> | null;
    didHold: boolean;
  }>({
    timeoutId: null,
    intervalId: null,
    didHold: false
  });

  const clearTimeHold = () => {
    const r = timeHoldRef.current;
    const wasRepeating = r.intervalId !== null;
    if (r.timeoutId) {
      clearTimeout(r.timeoutId);
      r.timeoutId = null;
    }
    if (r.intervalId) {
      clearInterval(r.intervalId);
      r.intervalId = null;
    }
    if (wasRepeating) r.didHold = true;
  };

  const startTimeHold = (direction: 'minus' | 'plus') => {
    const doStep = () => {
      if (direction === 'minus') {
        setSessionTime((prev) => {
          const next = Math.max(GAME_CONFIG.MIN_SESSION_TIME, prev - GAME_CONFIG.SESSION_TIME_STEP);
          if (next <= GAME_CONFIG.MIN_SESSION_TIME) clearTimeHold();
          return next;
        });
      } else {
        setSessionTime((prev) => {
          const next = Math.min(GAME_CONFIG.MAX_SESSION_TIME, prev + GAME_CONFIG.SESSION_TIME_STEP);
          if (next >= GAME_CONFIG.MAX_SESSION_TIME) clearTimeHold();
          return next;
        });
      }
    };
    timeHoldRef.current.didHold = false;
    timeHoldRef.current.timeoutId = setTimeout(() => {
      timeHoldRef.current.timeoutId = null;
      doStep();
      timeHoldRef.current.intervalId = setInterval(doStep, 100);
    }, 400);
  };

  useEffect(() => {
    const ref = timeHoldRef;
    return () => {
      const r = ref.current;
      if (r.timeoutId) clearTimeout(r.timeoutId);
      if (r.intervalId) clearInterval(r.intervalId);
    };
  }, []);

  useEffect(() => {
    if (state.currentState === 'mainMenu') {
      queueMicrotask(() => {
        setActiveTab(0);
        setAccessibilityOpen(false);
      });
    }
  }, [state.currentState]);

  useEffect(() => {
    if (state.currentState === 'mainMenu') {
      initAudio();
      queueMicrotask(() => {
        setMusicVol(getMusicVolume());
        setSfxVol(getSFXVolume());
        setCurrentTrackIndex(getCurrentTrackIndex());
      });
    }
  }, [state.currentState, initAudio, getMusicVolume, getSFXVolume, getCurrentTrackIndex]);

  useEffect(() => {
    if (!isConnected || lastRRReceivedAt != null) {
      return;
    }

    const id = setTimeout(() => {
      setShowNoRRWarning(true);
    }, RR_COMPATIBILITY_TIMEOUT_MS);

    return () => clearTimeout(id);
  }, [isConnected, lastRRReceivedAt]);

  const goToTab = (tab: number) => {
    setActiveTab(tab);
    if (tab !== 2) setShowCompatibilityDetails(false);
    if (tab === 3) {
      setCurrentTrackIndex(getCurrentTrackIndex());
      setPreviewPlaying(isPlaying());
    }
  };

  const handleNext = () => {
    if (activeTab < 3) {
      goToTab(activeTab + 1);
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) {
      goToTab(activeTab - 1);
    } else {
      goToWelcome();
    }
  };

  if (state.currentState !== 'mainMenu') return null;

  const handleConnectBLE = async () => {
    setShowNoRRWarning(false);
    if (isConnected) {
      disconnect();
    } else {
      try {
        await connect();
      } catch {
        console.error('Falha ao conectar BLE');
      }
    }
  };

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

  const handlePrevTrack = () => {
    initAudio();
    const idx = getCurrentTrackIndex();
    const newIdx = idx <= 0 ? AUDIO_CONFIG.TRACKS.length - 1 : idx - 1;
    setTrack(newIdx, isPlaying());
    setCurrentTrackIndex(newIdx);
  };

  const handleNextTrack = () => {
    initAudio();
    const idx = getCurrentTrackIndex();
    const newIdx = idx >= AUDIO_CONFIG.TRACKS.length - 1 ? 0 : idx + 1;
    setTrack(newIdx, isPlaying());
    setCurrentTrackIndex(newIdx);
  };

  const handleToggleSFX = () => {
    toggleSFX();
    setSfxVol(getSFXVolume());
  };

  const handleToggleMusic = () => {
    toggleMusic();
    setMusicVol(getMusicVolume());
  };

  const handleTogglePreview = () => {
    togglePreview();
    setPreviewPlaying(isPlaying());
  };

  const ensureSessionForMenu = (): boolean => {
    return true;
  };

  const applyMenuSessionSettings = (): void => {
    setSessionLimit(sessionTime);
    setCyclesPerMinute(cpm);
    setBreathingPattern(breathingPatternMenu as BreathingPatternId);
    startMusic();
  };

  const handleStartGame = () => {
    if (!ensureSessionForMenu()) return;
    applyMenuSessionSettings();
    startGame(isConnected, menuDifficulty);
  };

  const timeStr = `${Math.floor(sessionTime / 60)
    .toString()
    .padStart(2, '0')}:${(sessionTime % 60).toString().padStart(2, '0')}`;

  const hasAccessibilityOptions = ALLOW_THEME_SWITCH || ALLOW_BRIGHTNESS_CONTROL;

  return (
    <MenuContainer>
      <MenuScreenBackdrop />
      <MenuContent>
        <TabsContainer>
          <TabsRow aria-label='Seções do menu' role='tablist'>
            <TabCircleButton type='button' role='tab' $active={activeTab === 0} onClick={() => goToTab(0)} aria-selected={activeTab === 0}>
              <TabNavIcon $active={activeTab === 0} $glyphScale={1.08} aria-hidden>
                <MdChair />
              </TabNavIcon>
              <TabNavLabel>Sessão</TabNavLabel>
            </TabCircleButton>
            <TabConnectorSegment aria-hidden />
            <TabCircleButton type='button' role='tab' $active={activeTab === 1} onClick={() => goToTab(1)} aria-selected={activeTab === 1}>
              <TabNavIcon $active={activeTab === 1} $glyphScale={1.22} aria-hidden>
                <FaGamepad />
              </TabNavIcon>
              <TabNavLabel>Modo</TabNavLabel>
            </TabCircleButton>
            <TabConnectorSegment aria-hidden />
            <TabCircleButton type='button' role='tab' $active={activeTab === 2} onClick={() => goToTab(2)} aria-selected={activeTab === 2}>
              <TabNavIcon $active={activeTab === 2} $glyphScale={1.22} aria-hidden>
                <FaBluetoothB />
              </TabNavIcon>
              <TabNavLabel>Conexão</TabNavLabel>
            </TabCircleButton>
            <TabConnectorSegment aria-hidden />
            <TabCircleButton type='button' role='tab' $active={activeTab === 3} onClick={() => goToTab(3)} aria-selected={activeTab === 3}>
              <TabNavIcon $active={activeTab === 3} $glyphScale={0.9} aria-hidden>
                <FaMusic />
              </TabNavIcon>
              <TabNavLabel>Áudio</TabNavLabel>
            </TabCircleButton>
          </TabsRow>
        </TabsContainer>

        <MenuBody>
          <MenuScrollArea className='menu-scroll-area'>
            {activeTab === 0 && (
              <MenuTabContent>
                <SessionColumnStack>
                  <FormGroup>
                    <SessionSectionTitleCentered>Tempo de respiração</SessionSectionTitleCentered>
                    <SessionTimeRow>
                      <TimeButton
                        $variant='minus'
                        type='button'
                        onClick={() => {
                          if (timeHoldRef.current.didHold) {
                            timeHoldRef.current.didHold = false;
                            return;
                          }
                          setSessionTime((prev) => Math.max(GAME_CONFIG.MIN_SESSION_TIME, prev - GAME_CONFIG.SESSION_TIME_STEP));
                        }}
                        onMouseDown={() => startTimeHold('minus')}
                        onMouseUp={clearTimeHold}
                        onMouseLeave={clearTimeHold}
                        onTouchStart={() => startTimeHold('minus')}
                        onTouchEnd={clearTimeHold}
                        onTouchCancel={clearTimeHold}
                      >
                        -
                      </TimeButton>
                      <SessionTimeDisplay>{timeStr}</SessionTimeDisplay>
                      <TimeButton
                        $variant='plus'
                        type='button'
                        onClick={() => {
                          if (timeHoldRef.current.didHold) {
                            timeHoldRef.current.didHold = false;
                            return;
                          }
                          setSessionTime((prev) => Math.min(GAME_CONFIG.MAX_SESSION_TIME, prev + GAME_CONFIG.SESSION_TIME_STEP));
                        }}
                        onMouseDown={() => startTimeHold('plus')}
                        onMouseUp={clearTimeHold}
                        onMouseLeave={clearTimeHold}
                        onTouchStart={() => startTimeHold('plus')}
                        onTouchEnd={clearTimeHold}
                        onTouchCancel={clearTimeHold}
                      >
                        +
                      </TimeButton>
                    </SessionTimeRow>
                  </FormGroup>
                  <FormGroup>
                    <SessionSectionTitleCentered>Ciclos por minuto</SessionSectionTitleCentered>
                    <SessionSectionValueCentered>{cpm}</SessionSectionValueCentered>
                    <SliderRow>
                      <SliderWrapper>
                        <SliderTrack>
                          <SliderFill
                            $percent={
                              ((cpm - GAME_CONFIG.MIN_CYCLES_PER_MINUTE) /
                                (GAME_CONFIG.MAX_CYCLES_PER_MINUTE - GAME_CONFIG.MIN_CYCLES_PER_MINUTE)) *
                              100
                            }
                          />
                          <SliderThumb
                            $percent={
                              ((cpm - GAME_CONFIG.MIN_CYCLES_PER_MINUTE) /
                                (GAME_CONFIG.MAX_CYCLES_PER_MINUTE - GAME_CONFIG.MIN_CYCLES_PER_MINUTE)) *
                              100
                            }
                          />
                          <SliderInput
                            min={GAME_CONFIG.MIN_CYCLES_PER_MINUTE}
                            max={GAME_CONFIG.MAX_CYCLES_PER_MINUTE}
                            value={cpm}
                            onChange={(e) => setCpm(parseInt(e.target.value, 10))}
                          />
                        </SliderTrack>
                      </SliderWrapper>
                    </SliderRow>
                    <SliderLabelsRow>
                      <SliderLabel>Lento</SliderLabel>
                      <SliderLabel>Moderado</SliderLabel>
                      <SliderLabel>Rápido</SliderLabel>
                    </SliderLabelsRow>
                  </FormGroup>
                  <BreathingCircleWrapper>
                    <SessionSectionTitleCentered>Pré-visualização do ritmo escolhido</SessionSectionTitleCentered>
                    <BreathingCircleOuter>
                      <BreathingCircleInner $cpm={cpm} />
                    </BreathingCircleOuter>
                  </BreathingCircleWrapper>
                </SessionColumnStack>
              </MenuTabContent>
            )}

            {activeTab === 1 && (
              <MenuTabContent>
                <ContentColumn $distribute='evenly'>
                  <MenuSection>
                    <FormGroup>
                      <SessionSectionTitleCentered>Tipo de respiração</SessionSectionTitleCentered>
                      <SegmentedRow>
                        <SegmentedButton
                          type='button'
                          $active={breathingPatternMenu === 'continuous'}
                          onClick={() => setBreathingPatternMenu('continuous')}
                        >
                          {MENU_BREATHING_PATTERN_BUTTON_LABEL.continuous}
                        </SegmentedButton>
                        <SegmentedButton
                          type='button'
                          $active={breathingPatternMenu === 'intervals'}
                          onClick={() => setBreathingPatternMenu('intervals')}
                        >
                          {MENU_BREATHING_PATTERN_BUTTON_LABEL.intervals}
                        </SegmentedButton>
                      </SegmentedRow>
                      <ModoBreathingPreview pattern={breathingPatternMenu} />
                      <InfoText>{MENU_BREATHING_PATTERN_COPY[breathingPatternMenu].description}</InfoText>
                    </FormGroup>
                  </MenuSection>
                  <MenuSection>
                    <FormGroup>
                      <SessionSectionTitleCentered>Dificuldade</SessionSectionTitleCentered>
                      <SegmentedRow>
                        <SegmentedButton type='button' $active={menuDifficulty === 'easy'} onClick={() => setMenuDifficulty('easy')}>
                          Fácil
                        </SegmentedButton>
                        <SegmentedButton type='button' $active={menuDifficulty === 'medium'} onClick={() => setMenuDifficulty('medium')}>
                          Médio
                        </SegmentedButton>
                        <SegmentedButton type='button' $active={menuDifficulty === 'hard'} onClick={() => setMenuDifficulty('hard')}>
                          Difícil
                        </SegmentedButton>
                      </SegmentedRow>
                      <InfoText>{MENU_DIFFICULTY_COPY[menuDifficulty].description}</InfoText>
                    </FormGroup>
                  </MenuSection>
                </ContentColumn>
              </MenuTabContent>
            )}

            {activeTab === 2 &&
              (() => {
                const bleSupport = getWebBluetoothSupport();
                return (
                  <MenuTabContent>
                    <ContentColumn $distribute='evenly'>
                      <ConnectionTabSection>
                        <ConnectionFormGroup>
                          <SessionSectionTitleCentered>Sensor BLE (frequência cardíaca)</SessionSectionTitleCentered>
                          <ConnectButton
                            onClick={handleConnectBLE}
                            disabled={isLoading || bleSupport.disableConnect}
                            $isConnected={isConnected}
                          >
                            {isLoading ? 'CONECTANDO...' : isConnected ? 'DESCONECTAR' : 'CONECTAR'}
                          </ConnectButton>
                          {error && <ConnectionErrorText>{formatBluetoothError(error)}</ConnectionErrorText>}
                          {isConnected && lastRRReceivedAt == null && showNoRRWarning && (
                            <ConnectionErrorText>
                              Sensor conectado, mas sem intervalos RR. Esse sensor pode não ser compatível com biofeedback por VFC.
                              {'\n'}Use um sensor que envie RR para calibrar e jogar com biofeedback.
                            </ConnectionErrorText>
                          )}
                          <ConnectionStatusText $connected={isConnected}>
                            {isConnected ? (
                              <>
                                Status: Conectado{deviceName && ` • ${deviceName}`}
                                {batteryLevel !== null && (
                                  <>
                                    <br />
                                    Bateria: {batteryLevel}%
                                  </>
                                )}
                              </>
                            ) : (
                              'Status: Sensor desconectado - modo automático'
                            )}
                          </ConnectionStatusText>
                          {!isConnected && (
                            <ConnectionHintBlock>
                              <ConnectionHintText>Verifique se o seu sensor está ligado e próximo ao computador.</ConnectionHintText>
                              {bleSupport.showWarning && (
                                <>
                                  <ConnectionHelpLink
                                    type='button'
                                    onClick={() => setShowCompatibilityDetails((v) => !v)}
                                    title={showCompatibilityDetails ? 'Ocultar instruções' : 'Ver instruções'}
                                  >
                                    {bleSupport.shortLabel} {showCompatibilityDetails ? 'Ocultar' : 'Clique aqui'}
                                  </ConnectionHelpLink>
                                  {showCompatibilityDetails && (
                                    <ConnectionCompatibilityDetails>{bleSupport.message}</ConnectionCompatibilityDetails>
                                  )}
                                </>
                              )}
                            </ConnectionHintBlock>
                          )}
                        </ConnectionFormGroup>
                      </ConnectionTabSection>
                    </ContentColumn>
                  </MenuTabContent>
                );
              })()}

            {activeTab === 3 && (
              <MenuTabContent>
                <ContentColumn>
                  <MenuSection>
                    <FormGroup>
                      <SessionSectionTitleCentered>Efeitos sonoros</SessionSectionTitleCentered>
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
                  </MenuSection>
                  <MenuSection>
                    <FormGroup>
                      <SessionSectionTitleCentered>Música</SessionSectionTitleCentered>
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
                  </MenuSection>
                  <MenuSection>
                    <FormGroup>
                      <SessionSectionTitleCentered>Selecionar música</SessionSectionTitleCentered>
                      <MusicSelectorRow>
                        <MusicSelectorButton type='button' onClick={handlePrevTrack} aria-label='Música anterior'>
                          ‹
                        </MusicSelectorButton>
                        <MusicTrackName>{AUDIO_CONFIG.TRACKS[currentTrackIndex]?.name ?? getCurrentTrackName()}</MusicTrackName>
                        <MusicSelectorButton type='button' onClick={handleNextTrack} aria-label='Próxima música'>
                          ›
                        </MusicSelectorButton>
                        <PlayPreviewButton
                          type='button'
                          $playing={previewPlaying}
                          onClick={handleTogglePreview}
                          title={previewPlaying ? 'Parar' : 'Ouvir'}
                          aria-label={previewPlaying ? 'Parar' : 'Ouvir'}
                        >
                          {previewPlaying ? <FaPause /> : <FaPlay />}
                        </PlayPreviewButton>
                      </MusicSelectorRow>
                    </FormGroup>
                  </MenuSection>
                </ContentColumn>
              </MenuTabContent>
            )}
          </MenuScrollArea>

          <MenuFooter>
            <ButtonGroup>
              <ButtonGroupStart>
                <MenuFooterBackButton type='button' onClick={handlePrevious}>
                  Voltar
                </MenuFooterBackButton>
              </ButtonGroupStart>
              <ButtonGroupCenter>
                <AccessibilityOpenButton
                  type='button'
                  disabled={!hasAccessibilityOptions}
                  onClick={() => setAccessibilityOpen(true)}
                  title={hasAccessibilityOptions ? 'Acessibilidade e aparência' : 'Nenhuma opção disponível'}
                  aria-label='Acessibilidade'
                >
                  <FaUniversalAccess aria-hidden />
                  Acessibilidade
                </AccessibilityOpenButton>
              </ButtonGroupCenter>
              <ButtonGroupEnd>
                {activeTab < 3 ? (
                  <MenuFooterNextButton type='button' onClick={handleNext}>
                    Próximo
                  </MenuFooterNextButton>
                ) : (
                  <MenuFooterNextButton type='button' onClick={handleStartGame}>
                    Iniciar
                  </MenuFooterNextButton>
                )}
              </ButtonGroupEnd>
            </ButtonGroup>
          </MenuFooter>
        </MenuBody>

        <AccessibilityModal isOpen={accessibilityOpen} onClose={() => setAccessibilityOpen(false)} />
      </MenuContent>
    </MenuContainer>
  );
}
