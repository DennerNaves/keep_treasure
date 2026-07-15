import { useEffect, useId } from 'react';
import { FaSun } from 'react-icons/fa';
import { useAccessibility } from '../../contexts/accessibilityContext';
import { useMenuTheme } from '../../contexts/menuThemeContext';
import { brightnessToSliderPct } from '../../utils/accessibility';
import { ALLOW_BRIGHTNESS_CONTROL, ALLOW_THEME_SWITCH, BRIGHTNESS_CONFIG } from '../../utils/constants';
import {
  BrightnessSliderLabel,
  BrightnessSliderLabelsRow,
  FormGroup,
  InfoText,
  SecondaryButton,
  SegmentedRow,
  SessionSectionTitleCentered,
  SessionSectionValueCentered,
  SliderFill,
  SliderInput,
  SliderRow,
  SliderThumb,
  SliderTrack,
  SliderWrapper,
  ThemeToggleButton
} from '../MainMenu/styles';
import { AccessibilityBackdrop, AccessibilityCloseWrap, AccessibilityPanel, AccessibilityPanelTitle } from './styles';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilityModal({ isOpen, onClose }: AccessibilityModalProps) {
  const { theme, setTheme } = useMenuTheme();
  const { brightness, setBrightness } = useAccessibility();
  const titleId = useId();

  const hasAnyOption = ALLOW_THEME_SWITCH || ALLOW_BRIGHTNESS_CONTROL;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrightness(parseInt(e.target.value, 10));
  };

  const sliderPct = brightnessToSliderPct(brightness);

  return (
    <AccessibilityBackdrop role='presentation' onClick={onClose}>
      <AccessibilityPanel role='dialog' aria-modal='true' aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <AccessibilityCloseWrap>
          <SecondaryButton type='button' onClick={onClose}>
            Fechar
          </SecondaryButton>
        </AccessibilityCloseWrap>
        <AccessibilityPanelTitle id={titleId}>Acessibilidade</AccessibilityPanelTitle>

        {ALLOW_THEME_SWITCH && (
          <FormGroup>
            <SessionSectionTitleCentered>Tema do menu</SessionSectionTitleCentered>
            <SegmentedRow>
              <ThemeToggleButton
                type='button'
                $isLightTheme={theme === 'light'}
                onClick={() => setTheme(theme === 'game' ? 'light' : 'game')}
                title={theme === 'game' ? 'Mudar para tema claro' : 'Mudar para tema do jogo'}
                aria-label={theme === 'game' ? 'Mudar para tema claro' : 'Mudar para tema do jogo'}
              >
                <FaSun />
              </ThemeToggleButton>
            </SegmentedRow>
            <InfoText>Tema do jogo (escuro) ou tema claro.</InfoText>
          </FormGroup>
        )}

        {ALLOW_BRIGHTNESS_CONTROL && (
          <FormGroup>
            <SessionSectionTitleCentered>Brilho do jogo</SessionSectionTitleCentered>
            <SessionSectionValueCentered>{brightness}%</SessionSectionValueCentered>
            <SliderRow>
              <SliderWrapper>
                <SliderTrack>
                  <SliderFill $percent={sliderPct} />
                  <SliderThumb $percent={sliderPct} />
                  <SliderInput
                    min={BRIGHTNESS_CONFIG.MIN}
                    max={BRIGHTNESS_CONFIG.MAX}
                    step={BRIGHTNESS_CONFIG.STEP}
                    value={brightness}
                    onChange={handleBrightnessChange}
                    aria-label='Brilho do jogo'
                  />
                </SliderTrack>
              </SliderWrapper>
            </SliderRow>
            <BrightnessSliderLabelsRow>
              <BrightnessSliderLabel>Menos brilho</BrightnessSliderLabel>
              <BrightnessSliderLabel>Mais brilho</BrightnessSliderLabel>
            </BrightnessSliderLabelsRow>
            <InfoText>Ajusta o brilho do canvas do jogo. 100% é o padrão.</InfoText>
          </FormGroup>
        )}

        {!hasAnyOption && <InfoText>Nenhuma opção configurada.</InfoText>}
      </AccessibilityPanel>
    </AccessibilityBackdrop>
  );
}

export default AccessibilityModal;
