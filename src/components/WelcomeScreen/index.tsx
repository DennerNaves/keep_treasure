import AccessibilityModal from '../AccessibilityModal';
import MenuScreenBackdrop from '../shared/MenuScreenBackdrop';

import { useEffect, useState } from 'react';
import { FaSun, FaUniversalAccess } from 'react-icons/fa';
import { useMenuTheme } from '../../contexts/menuThemeContext';
import { useGameEngine } from '../../hooks/useGameEngine';
import { ALLOW_BRIGHTNESS_CONTROL, ALLOW_THEME_SWITCH, GAME_THEME } from '../../utils/constants';
import {
  PlayButton,
  PlayButtonGlow,
  PlayButtonWrapper,
  WelcomeA11yButton,
  WelcomeChromeColumn,
  WelcomeContainer,
  WelcomeFullscreenButton,
  WelcomeHeading,
  WelcomeMain,
  WelcomeThemeButton,
  WelcomeTitleBlock,
  WelcomeTitleSrOnly,
  WelcomeTitleText
} from './styles';

export default function WelcomeScreen() {
  const { state, goToMainMenu } = useGameEngine();
  const { theme, setTheme } = useMenuTheme();
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  const hasAccessibilityOptions = ALLOW_THEME_SWITCH || ALLOW_BRIGHTNESS_CONTROL;

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (state.currentState !== 'welcome') return null;

  const handlePlay = () => {
    goToMainMenu();
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <WelcomeContainer>
      <MenuScreenBackdrop />
      <WelcomeChromeColumn $side='left'>
        {ALLOW_THEME_SWITCH && (
          <WelcomeThemeButton
            type='button'
            $isLightTheme={theme === 'light'}
            onClick={() => setTheme(theme === 'game' ? 'light' : 'game')}
            title={theme === 'game' ? 'Mudar para tema claro' : 'Mudar para tema do jogo'}
            aria-label={theme === 'game' ? 'Mudar para tema claro' : 'Mudar para tema do jogo'}
          >
            <FaSun />
          </WelcomeThemeButton>
        )}
        <WelcomeA11yButton
          type='button'
          $isLightTheme={theme === 'light'}
          disabled={!hasAccessibilityOptions}
          onClick={() => setAccessibilityOpen(true)}
          title={hasAccessibilityOptions ? 'Acessibilidade e aparência' : 'Nenhuma opção disponível'}
          aria-label='Acessibilidade'
        >
          <FaUniversalAccess />
        </WelcomeA11yButton>
      </WelcomeChromeColumn>

      <WelcomeChromeColumn $side='right'>
        <WelcomeFullscreenButton
          type='button'
          $isFullscreen={isFullscreen}
          $isLightTheme={theme === 'light'}
          onClick={handleFullscreen}
          aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
        />
      </WelcomeChromeColumn>

      <WelcomeMain>
        <WelcomeHeading>
          <WelcomeTitleSrOnly>{GAME_THEME.NAME}</WelcomeTitleSrOnly>
          <WelcomeTitleBlock aria-hidden>
            <WelcomeTitleText>{GAME_THEME.NAME}</WelcomeTitleText>
          </WelcomeTitleBlock>
        </WelcomeHeading>

        <PlayButtonWrapper>
          <PlayButtonGlow aria-hidden />
          <PlayButton type='button' onClick={handlePlay} aria-label='Jogar' title='Jogar' />
        </PlayButtonWrapper>
      </WelcomeMain>

      <AccessibilityModal isOpen={accessibilityOpen} onClose={() => setAccessibilityOpen(false)} />
    </WelcomeContainer>
  );
}
