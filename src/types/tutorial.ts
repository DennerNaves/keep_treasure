/**
 * Mensagem única exibida em um balão de fala do tutorial.
 * Reutilizável por outros tutoriais (não acoplado à intro da exploração).
 */
export interface TutorialMessage {
  id: string;
  text: string;
  bubblePlacement?: 'above' | 'right' | 'left';
}

/**
 * Sequência ordenada de mensagens — base para futuros tutoriais com múltiplos passos.
 * Por enquanto a intro da exploração usa uma única mensagem, mas o tipo já prevê N.
 */
export interface TutorialSequence {
  id: string;
  messages: TutorialMessage[];
}

/**
 * Estados da máquina de estados da intro de exploração.
 * - `idle`: pronto para começar (antes do trigger).
 * - `entering`: abelha animando do `ENTRY_FROM` ao `IDLE_AT`.
 * - `narrating`: áudios da narração tocando; abelha com boca; legenda sincronizada.
 * - `awaitingResponse`: narração terminou; abelha só voando; jogador confirma ou repete.
 * - `exiting`: abelha animando do `IDLE_AT` ao `EXIT_TO` (jogador confirmou).
 * - `done`: intro finalizada, jogo destrava input.
 */
export type ExplorationIntroPhase =
  | 'idle'
  | 'entering'
  | 'narrating'
  | 'awaitingResponse'
  | 'exiting'
  | 'done';
