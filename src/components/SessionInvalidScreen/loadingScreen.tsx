import MenuScreenBackdrop from '../shared/MenuScreenBackdrop';
import { LoadingText, SessionInvalidContainer, SessionInvalidContent } from './styles';

export default function LoadingScreen() {
  return (
    <SessionInvalidContainer>
      <MenuScreenBackdrop />
      <SessionInvalidContent>
        <LoadingText>Carregando .</LoadingText>
      </SessionInvalidContent>
    </SessionInvalidContainer>
  );
}
