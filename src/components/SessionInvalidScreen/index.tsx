import { notifyBackToPortal } from '../../services/portalBridge';
import type { SessionInvalidReason } from '../../types';
import { GAME_THEME } from '../../utils/constants';
import { WelcomeHeading, WelcomeTitleBlock, WelcomeTitleSrOnly, WelcomeTitleText } from '../WelcomeScreen/styles';
import {
  BackToPortalButton,
  Message,
  SessionInvalidContainer,
  SessionInvalidContent
} from './styles';

import MenuScreenBackdrop from '../shared/MenuScreenBackdrop';

const REASON_MESSAGES: Record<SessionInvalidReason, string> = {
  invalid: 'Ops! Não conseguimos abrir este jogo por aqui.\n\nToque no botão abaixo para voltar ao início e escolher o jogo novamente.',

  expired: 'Ops! O tempo deste acesso terminou.\n\nToque no botão abaixo para voltar ao início e escolher o jogo novamente.',

  network:
    'Estamos com dificuldade para conectar.\n\nVerifique sua internet e toque no botão abaixo para voltar ao início e escolher o jogo novamente.'
};

export default function SessionInvalidScreen({ reason }: { reason: SessionInvalidReason }) {
  const message = REASON_MESSAGES[reason] ?? REASON_MESSAGES.invalid;

  return (
    <SessionInvalidContainer>
      <MenuScreenBackdrop />
      <SessionInvalidContent>
        <WelcomeHeading>
          <WelcomeTitleSrOnly>{GAME_THEME.NAME}</WelcomeTitleSrOnly>
          <WelcomeTitleBlock aria-hidden>
            <WelcomeTitleText>{GAME_THEME.NAME}</WelcomeTitleText>
          </WelcomeTitleBlock>
        </WelcomeHeading>
        <Message>{message}</Message>
        <BackToPortalButton type='button' onClick={notifyBackToPortal}>
          Voltar ao início
        </BackToPortalButton>
      </SessionInvalidContent>
    </SessionInvalidContainer>
  );
}
