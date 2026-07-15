import {
  ActionRow,
  ContinueButton,
  DirectionArrowImg,
  DirectionArrowWrap,
  SpeechBubbleRoot,
  type SpeechBubblePadding,
  SpeechText
} from './styles';

export interface SpeechBubbleAction {
  label: string;
  onClick: () => void;
}

export interface SpeechBubbleProps {
  text: string;
  /** Posição da âncora em px (ex.: centro da abelha). */
  anchor: { x: number; y: number };
  placement?: 'above' | 'right' | 'left';
  continueLabel?: string;
  onContinue?: () => void;
  actions?: {
    primary: SpeechBubbleAction;
    secondary?: SpeechBubbleAction;
  };
  /** Arte do balão; vazio = placeholder CSS. */
  imageUrl?: string;
  padding?: SpeechBubblePadding;
  minWidthPx?: number;
  maxWidthPx?: number;
  minHeightPx?: number;
  maxHeightPx?: number;
  /** Cor do texto (ex.: cinza escuro sobre arte do balão). */
  textColor?: string;
  /** Seta de direção exibida abaixo do texto (só em passos de direção). */
  directionArrow?: {
    imageUrl: string;
    rotationDeg: number;
    sizePx?: number;
  };
}

/**
 * Balão de fala reutilizável (sem lógica de tutorial — só apresentação).
 */
export default function SpeechBubble({
  text,
  anchor,
  placement = 'above',
  continueLabel,
  onContinue,
  actions,
  imageUrl = '',
  padding,
  minWidthPx,
  maxWidthPx,
  minHeightPx,
  maxHeightPx,
  textColor,
  directionArrow
}: SpeechBubbleProps) {
  const hasImage = imageUrl.length > 0;
  const hasDirectionArrow = directionArrow != null;
  const textScrollable = hasImage && maxHeightPx != null && maxHeightPx > 0 && !hasDirectionArrow;

  return (
    <SpeechBubbleRoot
      $anchorX={anchor.x}
      $anchorY={anchor.y}
      $placement={placement}
      $imageUrl={hasImage ? imageUrl : undefined}
      $padding={hasImage ? padding : undefined}
      $minWidthPx={hasImage ? minWidthPx : undefined}
      $maxWidthPx={maxWidthPx}
      $minHeightPx={hasImage ? minHeightPx : undefined}
      $maxHeightPx={hasImage ? maxHeightPx : undefined}
      $textColor={textColor}
      $withDirectionArrow={hasDirectionArrow}
    >
      <SpeechText $textColor={textColor} $scrollable={textScrollable} $withDirectionArrow={hasDirectionArrow}>
        {text}
      </SpeechText>
      {directionArrow ? (
        <DirectionArrowWrap>
          <DirectionArrowImg
            src={directionArrow.imageUrl}
            alt=""
            aria-hidden
            $sizePx={directionArrow.sizePx ?? 56}
            $rotationDeg={directionArrow.rotationDeg}
          />
        </DirectionArrowWrap>
      ) : null}
      {actions ? (
        <ActionRow>
          {actions.secondary ? (
            <ContinueButton type="button" $hasImage={hasImage} $variant="secondary" onClick={actions.secondary.onClick}>
              {actions.secondary.label}
            </ContinueButton>
          ) : null}
          <ContinueButton type="button" $hasImage={hasImage} $variant="primary" onClick={actions.primary.onClick}>
            {actions.primary.label}
          </ContinueButton>
        </ActionRow>
      ) : null}
      {!actions && onContinue && continueLabel ? (
        <ContinueButton type="button" $hasImage={hasImage} onClick={onContinue}>
          {continueLabel}
        </ContinueButton>
      ) : null}
    </SpeechBubbleRoot>
  );
}
