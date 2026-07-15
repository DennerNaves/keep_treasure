import { useMenuTheme } from '../../../contexts/menuThemeContext';
import { MENU_SCREEN_CONFIG } from '../../../utils/constants';
import { BackdropImage, BackdropOverlay, BackdropRoot } from './styles';

/**
 * Fundo JPEG + overlay escuro para Welcome e MainMenu.
 */
export default function MenuScreenBackdrop() {
  const { theme } = useMenuTheme();
  const overlay =
    theme === 'light' ? MENU_SCREEN_CONFIG.BACKGROUND_OVERLAY_LIGHT : MENU_SCREEN_CONFIG.BACKGROUND_OVERLAY;

  return (
    <BackdropRoot aria-hidden>
      <BackdropImage $url={MENU_SCREEN_CONFIG.BACKGROUND_IMAGE} />
      <BackdropOverlay $color={overlay} />
    </BackdropRoot>
  );
}
