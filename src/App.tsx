import Game from './components/Game';
import OrientationWarning from './components/OrientationWarning';
import GlobalStyle from './styles/global';

import { lazy, Suspense } from 'react';
import { AccessibilityProvider } from './contexts/AccessibilityProvider';
import { BreathingPhaseProvider } from './contexts/BreathingPhaseProvider';
import { GameEngineProvider } from './contexts/GameEngineProvider';
import { MenuThemeProvider } from './contexts/MenuThemeProvider';
import { SessionProvider } from './contexts/SessionProvider';

const DevConfigGUI = import.meta.env.DEV ? lazy(() => import('./dev/DevConfigGUI')) : () => null;

function App() {
  return (
    <MenuThemeProvider>
      <AccessibilityProvider>
        <GlobalStyle />
        {import.meta.env.DEV && (
          <Suspense fallback={null}>
            <DevConfigGUI />
          </Suspense>
        )}
        <OrientationWarning />
        <SessionProvider>
          <GameEngineProvider>
            <BreathingPhaseProvider>
              <Game />
            </BreathingPhaseProvider>
          </GameEngineProvider>
        </SessionProvider>
      </AccessibilityProvider>
    </MenuThemeProvider>
  );
}

export default App;
