import { FaFlagCheckered, FaHome, FaPlay } from 'react-icons/fa';
import { useGameEngine } from '../../hooks/useGameEngine';
import type { GameOverProps } from '../../types';
import {
  ActionBlock,
  ButtonCaption,
  ButtonGroup,
  DangerButton,
  GameOverContainer,
  GameOverContent,
  MenuNavButton,
  PrimaryActionButton,
  StatItem,
  StatLabel,
  Stats,
  StatValue,
  Subtitle,
  Title
} from './GameOver.styles';

export default function GameOver({ finalScore, sessionTime, sessionCompleted }: GameOverProps) {
  const { state, restartGame, goToWelcome } = useGameEngine();

  if (state.currentState !== 'gameOver') return null;

  const minutes = Math.floor(sessionTime / 60);
  const seconds = Math.floor(sessionTime % 60);
  const titleText = sessionCompleted ? 'PARABÉNS!' : 'ENCERRADO';

  const handleFinishSession = () => {
    goToWelcome();
  };

  return (
    <GameOverContainer>
      <GameOverContent className='menu-scroll-area'>
        <Title>{titleText}</Title>

        <Subtitle>EXERCÍCIO CONCLUÍDO</Subtitle>

        <Stats>
          <StatItem>
            <StatLabel>Pontos:</StatLabel>
            <StatValue>{finalScore}</StatValue>
          </StatItem>

          <StatItem>
            <StatLabel>Tempo:</StatLabel>
            <StatValue>
              {minutes}m {seconds}s
            </StatValue>
          </StatItem>
        </Stats>

        <ButtonGroup>
          <ActionBlock>
            <DangerButton onClick={handleFinishSession} title='Encerrar sessão e voltar ao menu'>
              <FaFlagCheckered /> Finalizar sessão
            </DangerButton>
            <ButtonCaption>Voltar ao menu inicial</ButtonCaption>
          </ActionBlock>
          <ActionBlock>
            <PrimaryActionButton onClick={restartGame} title='Iniciar nova partida (mantém calibração e opções)'>
              <FaPlay /> Jogar novamente
            </PrimaryActionButton>
            <ButtonCaption>Usa as mesmas configurações e calibração</ButtonCaption>
          </ActionBlock>
          <ActionBlock>
            <MenuNavButton onClick={goToWelcome} title='Voltar ao início e zerar tudo'>
              <FaHome /> Ir para o menu
            </MenuNavButton>
          </ActionBlock>
        </ButtonGroup>
      </GameOverContent>
    </GameOverContainer>
  );
}
