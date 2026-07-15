import { useCallback, useEffect, useState } from 'react';
import { FaHome } from 'react-icons/fa';
import { useGameEngine } from '../../../hooks/useGameEngine';
import { EXPLORATION_WIN_CONFIG } from '../../../utils/constants';
import ChestOpenAnimation from '../ChestOpenAnimation';
import {
  MapDimLayer,
  MenuButton,
  Message,
  OverlayContainer,
  OverlayContent,
  WinStack
} from './styles';

const useViewportHeight = (): number => {
  const [height, setHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 0));
  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return height;
};

export default function ExplorationWinOverlay() {
  const { state, goToMainMenu } = useGameEngine();
  const viewportHeight = useViewportHeight();
  const [showMessage, setShowMessage] = useState(false);

  const show =
    state.currentState === 'gameOver' &&
    state.gameplayMode === 'exploration' &&
    state.sessionCompleted === true;

  useEffect(() => {
    if (!show) setShowMessage(false);
  }, [show]);

  const handleChestFinished = useCallback(() => {
    setShowMessage(true);
  }, []);

  if (!show) return null;

  return (
    <OverlayContainer>
      <MapDimLayer />
      <WinStack>
        <ChestOpenAnimation viewportHeight={viewportHeight} onFinished={handleChestFinished} />
        {showMessage ? (
          <OverlayContent>
            <Message>{EXPLORATION_WIN_CONFIG.MESSAGE}</Message>
            <MenuButton type="button" onClick={goToMainMenu} title="Voltar ao menu principal">
              <FaHome /> Voltar ao menu
            </MenuButton>
          </OverlayContent>
        ) : null}
      </WinStack>
    </OverlayContainer>
  );
};
