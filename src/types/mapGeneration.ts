import type { TileDefinition, TileMapJson } from './tileMap';

/** Direção cardinal usada no gerador (e exposta para a intro do tutorial). */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Faixa aceitável de razão `PATH / interior` no mapa final.
 * Mapas fora do range são descartados pelo pós-validador, que tenta regerar
 * com nova seed até `maxRegenAttempts`. Evita "mapas vazios" (rota minúscula)
 * e "mapas abertos" (rota cobrindo metade do interior).
 */
export interface PathRatioRange {
  min: number;
  max: number;
}

/**
 * Parâmetros para o gerador procedural de mapa (mesmo gerador para Fácil/Médio/Difícil).
 * Todos os campos devem vir de `EXPLORATION_MAP_GENERATION_CONFIG[EASY|MEDIUM|HARD]`
 * (em `constants.ts`) para que jogos do template alterem regras sem mexer no serviço.
 *
 * Grupos de parâmetros que variam por dificuldade:
 * - `minStraightSteps` — quão sinuoso é o corredor principal.
 * - `forceDirectAfterIterations` / `directRadius` — quando o corredor "desiste" e vai direto.
 * - `maxInstructions` — máximo de **instruções** (segmentos contíguos do corredor com a mesma
 *   direção). Ao atingir o limite, o gerador força modo direto até o baú. Mais simples para
 *   o jogador descrever em palavras (ex.: "cima → esquerda → cima" = 3 instruções).
 * - `fakeBranch*` — ramos falsos curtos pintados **nas encruzilhadas** (viradas) do corredor;
 *   `count = 0` desliga. Servem para simular dúvida em pontos de virada do caminho real.
 * - `maxStraightSegment` — teto de passos consecutivos na mesma direção (evita retas longas).
 * - `recentVisitWindow` — quantas células recentes do corredor evitar revisitar (anti-loop).
 * - `chestMinDistanceFromSpawn` — distância Chebyshev mínima spawn → baú.
 * - `pathRatioRange` / `maxRegenAttempts` — validação pós-geração + retry.
 */
export interface ProceduralMapGenerationConfig {
  /** Largura em células. */
  cols: number;
  /** Altura em células. */
  rows: number;
  /** Tamanho do tile (px) — gravado no JSON gerado. */
  tileSize: number;
  /** Tile usado no perímetro (intransponível). Ex.: `'Arvores'`. */
  borderTile: string;
  /** Tile usado para esculpir o corredor (e os ramos falsos). Ex.: `'Terra'`. */
  pathTile: string;
  /** Tile usado para preencher o interior antes do carve. Ex.: `'Grama'`. */
  fillTile: string;
  /** Mínimo de passos retos antes de poder virar (continuidade do corredor principal). */
  minStraightSteps: number;
  /** Máximo de passos consecutivos na mesma direção antes de forçar virada. */
  maxStraightSegment: number;
  /** Evita pisar nas últimas N células do corredor principal (anti-retorno / anti-loop). */
  recentVisitWindow: number;
  /** Distância Chebyshev mínima entre spawn e baú. */
  chestMinDistanceFromSpawn: number;
  /** A partir desta iteração, o corredor principal vai direto ao baú (axial). */
  forceDirectAfterIterations: number;
  /** Distância Chebyshev a partir da qual o corredor principal vai direto ao baú. */
  directRadius: number;
  /** Linha máxima permitida para o baú (de cima para baixo). */
  chestMaxRow: number;
  /** Raio Chebyshev limpo ao redor do spawn (3x3 = 1). */
  spawnClearRadius: number;
  /**
   * Máximo de **instruções** (segmentos contíguos com a mesma direção) no corredor
   * principal. Cada virada conta como nova instrução. Ao atingir o limite, o gerador
   * força modo `goDirect` (axial até o baú) sem contar como nova instrução.
   * Ex.: `maxInstructions = 4` permite no máximo 3 viradas.
   */
  maxInstructions: number;
  /** Quantos ramos falsos (dead-ends curtos nas encruzilhadas) pintar. `0` desliga. */
  fakeBranchCount: number;
  /** Comprimento mínimo (em tiles) de cada ramo falso. */
  fakeBranchMinLength: number;
  /** Comprimento máximo (em tiles) de cada ramo falso. */
  fakeBranchMaxLength: number;
  /** Distância Chebyshev mínima entre starts de dois ramos falsos (evita aglomerados). */
  fakeBranchMinDistance: number;
  /** Range aceitável de ratio `PATH / interior` no mapa final. */
  pathRatioRange: PathRatioRange;
  /** Tentativas máximas de regeração quando a validação final falha. */
  maxRegenAttempts: number;
  /** Seed opcional para reprodutibilidade (testes / playtest fixo). */
  seed?: number;
}

/**
 * Alias mantido por compatibilidade durante a transição (Fácil agora compartilha o mesmo tipo).
 * @deprecated Use {@link ProceduralMapGenerationConfig}.
 */
export type EasyMapGenerationConfig = ProceduralMapGenerationConfig;

/**
 * Resultado do gerador: já entrega o `TileMapJson` no mesmo formato que
 * `buildTileMapData` espera (assim o hook pode reutilizar o mesmo pipeline).
 *
 * `pathDirections` lista, em ordem, cada passo do corredor **principal** do spawn
 * até o baú (ramos falsos não entram). É consumida pela intro do tutorial
 * (`useExplorationIntro` → `formatPathDirections`) para descrever o caminho.
 */
export interface GeneratedMap {
  json: TileMapJson;
  pathDirections: Direction[];
}

/**
 * Dicionário de definições de tile que o gerador deve copiar para o JSON final.
 * Reutiliza `TileDefinition` do tilemap, sem duplicar a forma.
 */
export type GeneratorTileSet = Record<string, TileDefinition>;
