import { EmojiParagraph, OrientationWarningCard, OrientationWarningContainer, OrientationWarningText } from './styles';

export default function OrientationWarning() {
  return (
    <OrientationWarningContainer>
      <OrientationWarningCard>
        <OrientationWarningText>Por favor, gire seu dispositivo para jogar!</OrientationWarningText>
        <EmojiParagraph aria-hidden>🔄</EmojiParagraph>
      </OrientationWarningCard>
    </OrientationWarningContainer>
  );
}
