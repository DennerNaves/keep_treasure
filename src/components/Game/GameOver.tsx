import { FaCog, FaFlagCheckered, FaHome, FaPlay } from 'react-icons/fa';
import { useGameEngine } from '../../hooks/useGameEngine';
import { notifyGameOver } from '../../services/portalBridge';
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
  SecondaryButton,
  StatItem,
  StatLabel,
  Stats,
  StatValue,
  Subtitle,
  Title
} from './GameOver.styles';

export default function GameOver({ finalScore, sessionTime, sessionCompleted }: GameOverProps) {
  const { state, restartGame, goToCalibration, goToWelcome } = useGameEngine();

  if (state.currentState !== 'gameOver') return null;

  const minutes = Math.floor(sessionTime / 60);
  const seconds = Math.floor(sessionTime % 60);
  const titleText = sessionCompleted ? 'PARABÉNS!' : 'ENCERRADO';

  const handleFinishSession = () => {
    notifyGameOver(finalScore);
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
            <DangerButton onClick={handleFinishSession} title='Encerrar sessão e ver resultados no portal'>
              <FaFlagCheckered /> Finalizar sessão
            </DangerButton>
            <ButtonCaption>Ver resultados no portal</ButtonCaption>
          </ActionBlock>
          <ActionBlock>
            <PrimaryActionButton onClick={restartGame} title='Iniciar nova partida (mantém calibração e opções)'>
              <FaPlay /> Jogar novamente
            </PrimaryActionButton>
            <ButtonCaption>Usa as mesmas configurações e calibração</ButtonCaption>
          </ActionBlock>
          {state.sessionWithSensor && (
            <ActionBlock>
              <SecondaryButton onClick={goToCalibration} title='Ir para a tela de calibração (mantém ciclo, conexão e áudio)'>
                <FaCog /> Refazer calibração
              </SecondaryButton>
              <ButtonCaption>Mantém as configurações e faz uma nova calibração</ButtonCaption>
            </ActionBlock>
          )}
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
