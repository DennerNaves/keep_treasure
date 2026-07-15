import type { Direction } from '../../types/mapGeneration';

const DIRECTION_LABEL_PT_BR: Record<Direction, string> = {
  up: 'cima',
  down: 'baixo',
  left: 'esquerda',
  right: 'direita'
};

/** Agrupa direções consecutivas iguais em uma única instrução. */
export const collapsePathDirections = (directions: Direction[]): Direction[] => {
  if (directions.length === 0) return [];

  const collapsed: Direction[] = [directions[0]];
  for (let i = 1; i < directions.length; i += 1) {
    if (directions[i] !== collapsed[collapsed.length - 1]) {
      collapsed.push(directions[i]);
    }
  }
  return collapsed;
};

/**
 * Converte a sequência de direções do corredor principal em texto narrativo PT-BR.
 * Agrupa direções idênticas consecutivas em uma única instrução (sem contagem) —
 * "fui pra cima 3 vezes" vira apenas "vá para cima".
 *
 * Exemplos:
 * - `['up','up','up','left','left','up']` → `'Vá para cima, depois para a esquerda, depois para cima'`
 * - `['up']` → `'Vá para cima'`
 * - `[]` → `''`
 *
 * Consumida por `useExplorationIntro` para montar a mensagem da abelha tutorial.
 * Pure function — facilita teste isolado e troca futura por outro idioma.
 */
export const formatPathDirections = (directions: Direction[]): string => {
  const instructions = collapsePathDirections(directions);
  if (instructions.length === 0) return '';

  return instructions
    .map((dir, idx) => {
      const label = DIRECTION_LABEL_PT_BR[dir];
      return idx === 0 ? `Vá para ${label}` : `, depois para ${label}`;
    })
    .join('');
};
