import styled, { css } from 'styled-components';

type Placement = 'above' | 'right' | 'left';

const placementTransform = (placement: Placement): string => {
  switch (placement) {
    case 'right':
      return 'translate(0, -50%)';
    case 'left':
      return 'translate(-100%, -50%)';
    case 'above':
    default:
      return 'translate(-50%, -100%)';
  }
};

export interface SpeechBubblePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const placeholderPanelStyle = css`
  background: var(--menu-content-bg, rgba(255, 255, 255, 0.95));
  color: var(--menu-text-primary, #1a1a1a);
  border: 3px solid var(--menu-content-border, rgba(0, 0, 0, 0.3));
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
`;

/**
 * `$anchorX` / `$anchorY` em px (centro do alvo, ex.: abelha).
 * Com `$imageUrl`, usa a arte como fundo e `padding` para o conteúdo.
 */
export const SpeechBubbleRoot = styled.div<{
  $anchorX: number;
  $anchorY: number;
  $placement: Placement;
  $imageUrl?: string;
  $padding?: SpeechBubblePadding;
  $minWidthPx?: number;
  $maxWidthPx?: number;
  $minHeightPx?: number;
  $maxHeightPx?: number;
  $textColor?: string;
  $withDirectionArrow?: boolean;
}>`
  position: absolute;
  left: ${({ $anchorX }) => `${$anchorX}px`};
  top: ${({ $anchorY }) => `${$anchorY}px`};
  transform: ${({ $placement }) => placementTransform($placement)};
  min-width: ${({ $minWidthPx, $imageUrl }) => ($imageUrl && $minWidthPx ? `${$minWidthPx}px` : 'auto')};
  max-width: ${({ $maxWidthPx }) => ($maxWidthPx ? `min(${$maxWidthPx}px, 84vw)` : 'min(84vw, 22rem)')};
  min-height: ${({ $minHeightPx, $imageUrl }) => ($imageUrl && $minHeightPx ? `${$minHeightPx}px` : 'auto')};
  max-height: ${({ $maxHeightPx, $imageUrl }) =>
    $imageUrl && $maxHeightPx ? `min(${$maxHeightPx}px, 42vh)` : 'none'};
  overflow: ${({ $maxHeightPx, $imageUrl }) => ($imageUrl && $maxHeightPx ? 'hidden' : 'visible')};
  padding: ${({ $imageUrl, $padding }) =>
    $imageUrl && $padding
      ? `${$padding.top}px ${$padding.right}px ${$padding.bottom}px ${$padding.left}px`
      : 'clamp(0.85rem, 2vw, 1.15rem) clamp(1rem, 2.4vw, 1.35rem)'};
  font-family: var(--font-ui), sans-serif;
  font-size: clamp(0.95rem, 2.2vw, 1.05rem);
  font-weight: 600;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${({ $withDirectionArrow }) => ($withDirectionArrow ? '0.35rem' : '0.75rem')};
  pointer-events: auto;
  box-sizing: border-box;

  ${({ $imageUrl, $textColor }) =>
    $imageUrl
      ? css`
          background-image: url('${$imageUrl}');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;
          border: none;
          border-radius: 0;
          box-shadow: none;
          color: ${$textColor ?? '#1a1a1a'};
        `
      : placeholderPanelStyle}
`;

export const DirectionArrowWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
`;

export const DirectionArrowImg = styled.img<{ $sizePx: number; $rotationDeg: number }>`
  width: ${({ $sizePx }) => `${$sizePx}px`};
  height: ${({ $sizePx }) => `${$sizePx}px`};
  object-fit: contain;
  transform: rotate(${({ $rotationDeg }) => `${$rotationDeg}deg`});
`;

export const SpeechText = styled.p<{ $textColor?: string; $scrollable?: boolean; $withDirectionArrow?: boolean }>`
  margin: 0;
  text-align: center;
  color: ${({ $textColor }) => $textColor ?? 'inherit'};
  flex: ${({ $withDirectionArrow }) => ($withDirectionArrow ? '0 0 auto' : '1 1 auto')};
  min-height: ${({ $withDirectionArrow }) => ($withDirectionArrow ? 'auto' : '0')};
  overflow-y: ${({ $scrollable, $withDirectionArrow }) =>
    $scrollable && !$withDirectionArrow ? 'auto' : 'visible'};
`;

const bubbleButtonBase = css`
  flex: 1 1 0;
  min-width: 0;
  font-family: var(--font-ui), sans-serif;
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  font-weight: 700;
  padding: 0.45rem 1.1rem;
  border-radius: 10px;
  border: 2px solid var(--menu-content-border, rgba(0, 0, 0, 0.3));
  cursor: pointer;

  &:hover {
    filter: brightness(1.05);
  }
`;

export const ActionRow = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 0.6rem;
  width: 100%;
`;

export const ContinueButton = styled.button<{ $hasImage?: boolean; $variant?: 'primary' | 'secondary' }>`
  ${bubbleButtonBase}
  align-self: ${({ $variant }) => ($variant ? 'stretch' : 'center')};
  flex: ${({ $variant }) => ($variant ? '1 1 0' : '0 0 auto')};
  background: ${({ $variant }) => ($variant === 'secondary' ? 'rgba(255, 255, 255, 0.92)' : 'var(--menu-primary, #ffcc00)')};
  color: #1a1a1a;
`;

export const SecondaryButton = styled(ContinueButton).attrs({ $variant: 'secondary' as const })``;
