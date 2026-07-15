import { ModeBadgeRoot } from './styles';

export interface ExplorationModeBadgeProps {
  gameplayMode: 'static' | 'exploration';
  sessionStarted: boolean;
}

export default function ExplorationModeBadge({ gameplayMode, sessionStarted }: ExplorationModeBadgeProps) {
  if (!sessionStarted || gameplayMode !== 'exploration') {
    return null;
  }

  return <ModeBadgeRoot>Modo exploração</ModeBadgeRoot>;
}
