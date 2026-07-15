import type {
  Direction,
  EasyMapGenerationConfig,
  GeneratedMap,
  GeneratorTileSet,
  ProceduralMapGenerationConfig
} from '../../types/mapGeneration';
import type { TileMapJson } from '../../types/tileMap';

/** Função geradora de números pseudo-aleatórios em `[0, 1)`. */
export type Rng = () => number;

/**
 * Mulberry32 — gerador determinístico simples.
 * Se `seed` for omitido, devolve `Math.random` (não-determinístico, ideal para partidas reais).
 * Com `seed` fixo, reproduz o mesmo mapa (útil para testes e playtests reprodutíveis).
 */
export const createSeededRng = (seed?: number): Rng => {
  if (seed === undefined) return Math.random;
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const DIRS: Record<Direction, { dCol: number; dRow: number }> = {
  up: { dCol: 0, dRow: -1 },
  down: { dCol: 0, dRow: 1 },
  left: { dCol: -1, dRow: 0 },
  right: { dCol: 1, dRow: 0 }
};

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
};

const ALL_DIRS: Direction[] = ['up', 'down', 'left', 'right'];

interface Position {
  col: number;
  row: number;
}

const chebyshev = (a: Position, b: Position): number =>
  Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));

const inInterior = (col: number, row: number, cfg: ProceduralMapGenerationConfig): boolean =>
  col >= 1 && col <= cfg.cols - 2 && row >= 1 && row <= cfg.rows - 2;

const posKey = (col: number, row: number): string => `${col},${row}`;

const manhattan = (a: Position, b: Position): number =>
  Math.abs(a.col - b.col) + Math.abs(a.row - b.row);

/** Soma vetorial das últimas 3 direções + candidato forma ciclo fechado (retângulo 4 passos). */
const wouldCompleteFourCycle = (recentDirs: Direction[], d: Direction): boolean => {
  if (recentDirs.length < 3) return false;
  let dc = DIRS[d].dCol;
  let dr = DIRS[d].dRow;
  for (let i = recentDirs.length - 3; i < recentDirs.length; i++) {
    dc += DIRS[recentDirs[i]].dCol;
    dr += DIRS[recentDirs[i]].dRow;
  }
  return dc === 0 && dr === 0;
};

const isRecentlyVisited = (
  col: number,
  row: number,
  recentCells: Position[],
  window: number
): boolean => {
  const start = Math.max(0, recentCells.length - window);
  for (let i = start; i < recentCells.length; i++) {
    if (recentCells[i].col === col && recentCells[i].row === row) return true;
  }
  return false;
};

/**
 * Próximo passo no modo "ir direto ao baú" com **memória de `dir`**: trajetória em **L**
 * (no máximo 1 virada extra). Na virada, prefere o eixo perpendicular que mais reduz
 * Manhattan até o baú.
 */
const pickDirectStep = (
  pos: Position,
  target: Position,
  dir: Direction,
  cfg: ProceduralMapGenerationConfig
): Direction => {
  const dCol = target.col - pos.col;
  const dRow = target.row - pos.row;
  if (dir === 'up' && dRow < 0) return 'up';
  if (dir === 'down' && dRow > 0) return 'down';
  if (dir === 'left' && dCol < 0) return 'left';
  if (dir === 'right' && dCol > 0) return 'right';

  const turnOptions: Direction[] = [];
  if (dRow !== 0) turnOptions.push(dRow > 0 ? 'down' : 'up');
  if (dCol !== 0) turnOptions.push(dCol > 0 ? 'right' : 'left');
  if (turnOptions.length === 0) return dir;
  if (turnOptions.length === 1) return turnOptions[0];

  let best = turnOptions[0];
  let bestDist = Infinity;
  for (const candidate of turnOptions) {
    const nc = pos.col + DIRS[candidate].dCol;
    const nr = pos.row + DIRS[candidate].dRow;
    if (!inInterior(nc, nr, cfg)) continue;
    const dist = manhattan({ col: nc, row: nr }, target);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  return best;
};

const validateTileSet = (tiles: GeneratorTileSet, cfg: ProceduralMapGenerationConfig): void => {
  const required = [cfg.borderTile, cfg.pathTile, cfg.fillTile];
  for (const key of required) {
    if (!tiles[key]) {
      throw new Error(`[mapGenerator] tile obrigatório ausente em tileSet: "${key}"`);
    }
  }
};

const buildInitialLayout = (cfg: ProceduralMapGenerationConfig): string[][] => {
  const layout: string[][] = [];
  for (let r = 0; r < cfg.rows; r++) {
    const line: string[] = [];
    for (let c = 0; c < cfg.cols; c++) {
      const isBorder = r === 0 || r === cfg.rows - 1 || c === 0 || c === cfg.cols - 1;
      line.push(isBorder ? cfg.borderTile : cfg.fillTile);
    }
    layout.push(line);
  }
  return layout;
};

const pickChestPosition = (spawn: Position, cfg: ProceduralMapGenerationConfig, rng: Rng): Position => {
  const maxRow = Math.min(cfg.chestMaxRow, cfg.rows - 2);
  const minRow = 1;
  const minCol = 1;
  const maxCol = cfg.cols - 2;
  const minDist = cfg.chestMinDistanceFromSpawn;

  let best: Position | null = null;
  let bestDist = -1;

  for (let attempt = 0; attempt < 48; attempt++) {
    const row = minRow + Math.floor(rng() * (maxRow - minRow + 1));
    let col = minCol + Math.floor(rng() * (maxCol - minCol + 1));
    if (col === spawn.col && cfg.cols > 3) {
      col = col === maxCol ? col - 1 : col + 1;
    }
    const candidate: Position = { col, row };
    const dist = chebyshev(spawn, candidate);
    if (dist >= minDist) return candidate;
    if (dist > bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }

  return best ?? { col: minCol, row: minRow };
};

/**
 * Conta quantos vizinhos cardinais de `(col, row)` são `pathTile`, **excluindo**
 * a célula `from` (origem do passo). Usado para evitar abrir blocos 2x2 de PATH.
 */
const countPathNeighbors = (
  layout: string[][],
  col: number,
  row: number,
  pathTile: string,
  from?: Position
): number => {
  let count = 0;
  for (const d of ALL_DIRS) {
    const nc = col + DIRS[d].dCol;
    const nr = row + DIRS[d].dRow;
    if (from && nc === from.col && nr === from.row) continue;
    if (nr < 0 || nr >= layout.length || nc < 0 || nc >= layout[0].length) continue;
    if (layout[nr][nc] === pathTile) count++;
  }
  return count;
};

interface PathPickContext {
  layout: string[][];
  pos: Position;
  dir: Direction;
  stepsInDir: number;
  chest: Position;
  cfg: ProceduralMapGenerationConfig;
  visited: Set<string>;
  recentCells: Position[];
  recentDirs: Direction[];
  rng: Rng;
}

const scoreDirection = (
  ctx: PathPickContext,
  d: Direction,
  nc: number,
  nr: number,
  currentManhattan: number
): number => {
  let score = ctx.rng() * 0.5;
  const nextManhattan = manhattan({ col: nc, row: nr }, ctx.chest);
  if (nextManhattan < currentManhattan) score += 3;
  if (!isRecentlyVisited(nc, nr, ctx.recentCells, ctx.cfg.recentVisitWindow)) score += 4;
  return score;
};

const pickBestScored = (ctx: PathPickContext, candidates: Direction[]): Direction => {
  const currentManhattan = manhattan(ctx.pos, ctx.chest);
  let bestScore = -Infinity;
  let best: Direction[] = [];
  for (const d of candidates) {
    const nc = ctx.pos.col + DIRS[d].dCol;
    const nr = ctx.pos.row + DIRS[d].dRow;
    const s = scoreDirection(ctx, d, nc, nr, currentManhattan);
    if (s > bestScore) {
      bestScore = s;
      best = [d];
    } else if (s === bestScore) {
      best.push(d);
    }
  }
  return best[Math.floor(ctx.rng() * best.length)];
};

/**
 * Escolhe próxima direção do corredor principal:
 * - no-touch (sem cruzar PATH / 2×2), **sem revisitar** células do corredor,
 *   anti-ciclo de 4 passos, janela `recentVisitWindow`.
 * - `maxStraightSegment` força virada; `minStraightSteps` impede zig-zag prematuro.
 * - Entre candidatos válidos, pontuação favorece aproximar do baú e explorar área nova.
 * Relaxa só regras no-touch se necessário (nunca relaxa visited / anti-loop).
 */
const pickRandomDir = (ctx: PathPickContext): Direction => {
  const { layout, pos, dir, stepsInDir, chest, cfg, visited, recentDirs } = ctx;
  const forceTurn = stepsInDir >= cfg.maxStraightSegment;
  const canTurn = stepsInDir >= cfg.minStraightSteps || forceTurn;

  const passesProgress = (d: Direction): boolean => {
    const nc = pos.col + DIRS[d].dCol;
    const nr = pos.row + DIRS[d].dRow;
    if (!inInterior(nc, nr, cfg)) return false;
    const isChest = nc === chest.col && nr === chest.row;
    if (!isChest && visited.has(posKey(nc, nr))) return false;
    if (!isChest && isRecentlyVisited(nc, nr, ctx.recentCells, cfg.recentVisitWindow)) return false;
    if (wouldCompleteFourCycle(recentDirs, d)) return false;
    return true;
  };

  const baseFilter = (d: Direction): boolean => {
    if (d === OPPOSITE[dir]) return false;
    if (forceTurn && d === dir) return false;
    if (!canTurn && d !== dir) return false;
    return passesProgress(d);
  };

  const collect = (extra: (d: Direction) => boolean): Direction[] => {
    const out: Direction[] = [];
    for (const d of ALL_DIRS) {
      if (!baseFilter(d)) continue;
      if (!extra(d)) continue;
      out.push(d);
    }
    return out;
  };

  const strict = (d: Direction): boolean => {
    const nc = pos.col + DIRS[d].dCol;
    const nr = pos.row + DIRS[d].dRow;
    if (nc === chest.col && nr === chest.row) return true;
    if (layout[nr][nc] === cfg.pathTile) return false;
    if (countPathNeighbors(layout, nc, nr, cfg.pathTile, pos) >= 2) return false;
    return true;
  };

  const noTouch = (d: Direction): boolean => {
    const nc = pos.col + DIRS[d].dCol;
    const nr = pos.row + DIRS[d].dRow;
    if (nc === chest.col && nr === chest.row) return true;
    return layout[nr][nc] !== cfg.pathTile;
  };

  let candidates = collect(strict);
  if (candidates.length === 0) candidates = collect(noTouch);
  if (candidates.length === 0) {
    const progressOnly: Direction[] = [];
    for (const d of ALL_DIRS) {
      if (!baseFilter(d)) continue;
      progressOnly.push(d);
    }
    candidates = progressOnly;
  }
  if (candidates.length === 0) {
    for (const d of ALL_DIRS) {
      if (d === OPPOSITE[dir]) continue;
      const nc = pos.col + DIRS[d].dCol;
      const nr = pos.row + DIRS[d].dRow;
      if (inInterior(nc, nr, cfg)) return d;
    }
    return dir;
  }
  return pickBestScored(ctx, candidates);
};

/**
 * Esculpe o corredor principal do spawn até o baú e devolve as direções percorridas
 * em ordem (`pathDirections`). Aplica:
 * - `minStraightSteps` + "sem reversão imediata" + no-touch (via `pickRandomDir`).
 * - `goDirect` (em **L**, via `pickDirectStep`) após `forceDirectAfterIterations`,
 *   Chebyshev ≤ `directRadius` **ou** ao atingir `maxInstructions - 1` viradas
 *   (cap estrito: reserva 1 instrução para o fechamento em L).
 *
 * "Instrução" = segmento contíguo com mesma direção. `instructionCount` começa em 1
 * (a primeira direção válida é a primeira instrução) e incrementa só nas viradas.
 *
 * **Garantia de cap absoluto**: como `pickDirectStep` faz no máximo 1 virada após
 * entrar em modo direto, e disparamos o modo direto reservando 1 instrução, o total
 * absoluto de instruções fica **≤ `maxInstructions`** em todos os mapas.
 */
const carveCorridor = (
  layout: string[][],
  spawn: Position,
  chest: Position,
  cfg: ProceduralMapGenerationConfig,
  rng: Rng
): Direction[] => {
  layout[spawn.row][spawn.col] = cfg.pathTile;
  const pos: Position = { col: spawn.col, row: spawn.row };
  let dir: Direction = 'up';
  let stepsInDir = 0;
  let iter = 0;
  let instructionCount = 0;
  const maxIters = cfg.cols * cfg.rows * 4;
  const directions: Direction[] = [];
  const visited = new Set<string>([posKey(spawn.col, spawn.row)]);
  const recentCells: Position[] = [{ col: spawn.col, row: spawn.row }];
  const recentDirs: Direction[] = [];
  const randomInstructionBudget = Math.max(1, cfg.maxInstructions - 1);

  while ((pos.col !== chest.col || pos.row !== chest.row) && iter < maxIters) {
    iter++;

    const distToChest = chebyshev(pos, chest);
    const exhaustedInstructions = instructionCount >= randomInstructionBudget;
    const goDirect =
      exhaustedInstructions ||
      iter >= cfg.forceDirectAfterIterations ||
      distToChest <= cfg.directRadius;

    let nextDir: Direction;
    if (goDirect) {
      nextDir = pickDirectStep(pos, chest, dir, cfg);
    } else {
      nextDir = pickRandomDir({
        layout,
        pos,
        dir,
        stepsInDir,
        chest,
        cfg,
        visited,
        recentCells,
        recentDirs,
        rng
      });
    }

    let nc = pos.col + DIRS[nextDir].dCol;
    let nr = pos.row + DIRS[nextDir].dRow;
    if (!inInterior(nc, nr, cfg)) {
      const fallback = pickDirectStep(pos, chest, dir, cfg);
      nc = pos.col + DIRS[fallback].dCol;
      nr = pos.row + DIRS[fallback].dRow;
      if (!inInterior(nc, nr, cfg)) break;
      nextDir = fallback;
    }

    pos.col = nc;
    pos.row = nr;
    if (layout[pos.row][pos.col] !== cfg.pathTile) {
      layout[pos.row][pos.col] = cfg.pathTile;
    }
    visited.add(posKey(pos.col, pos.row));
    recentCells.push({ col: pos.col, row: pos.row });
    if (recentCells.length > cfg.recentVisitWindow + 4) {
      recentCells.splice(0, recentCells.length - cfg.recentVisitWindow - 2);
    }
    directions.push(nextDir);
    recentDirs.push(nextDir);
    if (recentDirs.length > 3) recentDirs.shift();

    if (directions.length === 1) {
      instructionCount = 1;
      dir = nextDir;
      stepsInDir = 1;
    } else if (nextDir === dir) {
      stepsInDir++;
    } else {
      dir = nextDir;
      stepsInDir = 1;
      instructionCount++;
    }
  }

  return directions;
};

/**
 * Reconstrói a posição de cada passo do corredor a partir do `spawn` e da sequência
 * `pathDirections`. Devolve N+1 posições (spawn + uma por passo).
 *
 * Necessário para localizar as **encruzilhadas** (índices onde `pathDirections[i] !==
 * pathDirections[i-1]`) sem precisar instrumentar o carve.
 */
const tracePathPositions = (spawn: Position, directions: Direction[]): Position[] => {
  const positions: Position[] = [{ col: spawn.col, row: spawn.row }];
  let col = spawn.col;
  let row = spawn.row;
  for (const d of directions) {
    col += DIRS[d].dCol;
    row += DIRS[d].dRow;
    positions.push({ col, row });
  }
  return positions;
};

/**
 * Encruzilhada candidata para ramo falso. `position` é o **ponto antes da virada**
 * (índice i-1 em `pathDirections`), `realNext` é a direção real seguida e `previous`
 * é a direção que vinha sendo seguida — usamos `previous` ("continuar reto") e o
 * **lado oposto** de `realNext` como direções "tentadoras" do ramo falso.
 */
interface JunctionCandidate {
  position: Position;
  previous: Direction;
  realNext: Direction;
}

const collectJunctions = (
  spawn: Position,
  pathDirections: Direction[]
): JunctionCandidate[] => {
  if (pathDirections.length < 2) return [];
  const positions = tracePathPositions(spawn, pathDirections);
  const junctions: JunctionCandidate[] = [];
  for (let i = 1; i < pathDirections.length; i++) {
    if (pathDirections[i] === pathDirections[i - 1]) continue;
    junctions.push({
      position: positions[i],
      previous: pathDirections[i - 1],
      realNext: pathDirections[i]
    });
  }
  return junctions;
};

/**
 * Tenta esculpir um ramo falso curto saindo de uma **encruzilhada** do corredor real.
 * Direções candidatas: continuar reto (`previous`) ou o lado oposto da virada real.
 *
 * Filtros aplicados a cada passo:
 * - destino dentro do interior;
 * - destino deve ser `fillTile`;
 * - destino com ≥ 2 vizinhos PATH (excluindo origem) → para (anti-fusão e anti-2×2);
 * - Chebyshev ≤ 1 do baú → para (não dá atalho visual ao objetivo);
 * - primeiro passo: destino não pode ter nenhum vizinho PATH além da própria encruzilhada,
 *   garantindo que o ramo nasce isolado.
 */
const carveJunctionFakeBranch = (
  layout: string[][],
  junction: JunctionCandidate,
  chest: Position,
  cfg: ProceduralMapGenerationConfig,
  rng: Rng
): boolean => {
  const tryDirections: Direction[] = [junction.previous, OPPOSITE[junction.realNext]];
  // Embaralha levemente para variar entre "continuar reto" e "ir pro outro lado".
  if (rng() < 0.5) tryDirections.reverse();

  let chosenDir: Direction | null = null;
  for (const d of tryDirections) {
    if (d === junction.realNext) continue;
    const nc = junction.position.col + DIRS[d].dCol;
    const nr = junction.position.row + DIRS[d].dRow;
    if (!inInterior(nc, nr, cfg)) continue;
    if (layout[nr][nc] !== cfg.fillTile) continue;
    if (chebyshev({ col: nc, row: nr }, chest) <= 1) continue;
    if (countPathNeighbors(layout, nc, nr, cfg.pathTile, junction.position) >= 1) continue;
    chosenDir = d;
    break;
  }
  if (!chosenDir) return false;

  const span = Math.max(0, cfg.fakeBranchMaxLength - cfg.fakeBranchMinLength);
  const target = Math.max(1, cfg.fakeBranchMinLength + Math.floor(rng() * (span + 1)));

  const pos: Position = { col: junction.position.col, row: junction.position.row };
  let pintado = 0;
  for (let i = 0; i < target; i++) {
    const nc = pos.col + DIRS[chosenDir].dCol;
    const nr = pos.row + DIRS[chosenDir].dRow;
    if (!inInterior(nc, nr, cfg)) break;
    if (layout[nr][nc] !== cfg.fillTile) break;
    if (chebyshev({ col: nc, row: nr }, chest) <= 1) break;
    if (countPathNeighbors(layout, nc, nr, cfg.pathTile, pos) >= 2) break;
    pos.col = nc;
    pos.row = nr;
    layout[pos.row][pos.col] = cfg.pathTile;
    pintado++;
  }
  return pintado > 0;
};

/**
 * Pinta até `fakeBranchCount` ramos falsos **nas encruzilhadas** do corredor principal.
 * Cada encruzilhada gera no máximo um ramo. Respeita `fakeBranchMinDistance` entre
 * starts para não amontoar dois ramos perto demais.
 *
 * Quando `fakeBranchCount === 0`, função é no-op (usado pelo Fácil).
 */
const carveFakeBranches = (
  layout: string[][],
  spawn: Position,
  chest: Position,
  pathDirections: Direction[],
  cfg: ProceduralMapGenerationConfig,
  rng: Rng
): void => {
  if (cfg.fakeBranchCount <= 0) return;
  if (cfg.fakeBranchMaxLength <= 0) return;

  const junctions = collectJunctions(spawn, pathDirections);
  if (junctions.length === 0) return;

  // Embaralha as encruzilhadas para distribuir os ramos sem viés.
  const shuffled = [...junctions].sort(() => rng() - 0.5);
  const usedStarts: Position[] = [];
  let placed = 0;
  for (const junction of shuffled) {
    if (placed >= cfg.fakeBranchCount) break;
    const tooClose = usedStarts.some(
      (s) => chebyshev(s, junction.position) < cfg.fakeBranchMinDistance
    );
    if (tooClose) continue;
    if (carveJunctionFakeBranch(layout, junction, chest, cfg, rng)) {
      usedStarts.push(junction.position);
      placed++;
    }
  }
};

/**
 * Pós-validação do corredor principal: sem revisita de célula e sem segmento
 * contíguo maior que `maxStraightSegment`.
 */
const validatePathQuality = (
  spawn: Position,
  pathDirections: Direction[],
  cfg: ProceduralMapGenerationConfig
): boolean => {
  if (pathDirections.length === 0) return false;
  const positions = tracePathPositions(spawn, pathDirections);
  const seen = new Set<string>();
  for (const p of positions) {
    const k = posKey(p.col, p.row);
    if (seen.has(k)) return false;
    seen.add(k);
  }
  let segLen = 0;
  let prevDir: Direction | null = null;
  for (const d of pathDirections) {
    if (d === prevDir) {
      segLen++;
    } else {
      segLen = 1;
      prevDir = d;
    }
    if (segLen > cfg.maxStraightSegment) return false;
  }
  return true;
};

/**
 * Confere se existe caminho de `spawn` até `chest` usando apenas `pathTile` (BFS).
 * Necessário porque os filtros no-touch podem fechar o corredor em mapas patológicos
 * — nesse caso, o gerador regenera com nova seed.
 */
const hasPathToChest = (
  layout: string[][],
  spawn: Position,
  chest: Position,
  cfg: ProceduralMapGenerationConfig
): boolean => {
  const visited: boolean[][] = Array.from({ length: cfg.rows }, () => Array<boolean>(cfg.cols).fill(false));
  const queue: Position[] = [{ col: spawn.col, row: spawn.row }];
  visited[spawn.row][spawn.col] = true;
  while (queue.length > 0) {
    const current = queue.shift() as Position;
    if (current.col === chest.col && current.row === chest.row) return true;
    for (const d of ALL_DIRS) {
      const nc = current.col + DIRS[d].dCol;
      const nr = current.row + DIRS[d].dRow;
      if (nr < 0 || nr >= cfg.rows || nc < 0 || nc >= cfg.cols) continue;
      if (visited[nr][nc]) continue;
      if (layout[nr][nc] !== cfg.pathTile) continue;
      visited[nr][nc] = true;
      queue.push({ col: nc, row: nr });
    }
  }
  return false;
};

const computePathRatio = (
  layout: string[][],
  cfg: ProceduralMapGenerationConfig
): number => {
  let pathCount = 0;
  for (let row = 1; row <= cfg.rows - 2; row++) {
    for (let col = 1; col <= cfg.cols - 2; col++) {
      if (layout[row][col] === cfg.pathTile) pathCount++;
    }
  }
  const interior = (cfg.rows - 2) * (cfg.cols - 2);
  return interior > 0 ? pathCount / interior : 0;
};

interface AttemptResult {
  layout: string[][];
  spawn: Position;
  chest: Position;
  pathDirections: Direction[];
  ratio: number;
  hasPath: boolean;
  pathQualityOk: boolean;
}

const runOneAttempt = (cfg: ProceduralMapGenerationConfig, rng: Rng): AttemptResult => {
  const layout = buildInitialLayout(cfg);
  const spawn: Position = { col: Math.floor(cfg.cols / 2), row: cfg.rows - 2 };
  const chest = pickChestPosition(spawn, cfg, rng);
  const pathDirections = carveCorridor(layout, spawn, chest, cfg, rng);
  carveFakeBranches(layout, spawn, chest, pathDirections, cfg, rng);
  const pathQualityOk = validatePathQuality(spawn, pathDirections, cfg);
  return {
    layout,
    spawn,
    chest,
    pathDirections,
    ratio: computePathRatio(layout, cfg),
    hasPath: hasPathToChest(layout, spawn, chest, cfg),
    pathQualityOk
  };
};

/**
 * Gera um mapa procedural (mesmo gerador para Fácil/Médio/Difícil — só os parâmetros mudam):
 *
 * 1. Bordas com `borderTile` (intransponível). Interior com `fillTile`.
 * 2. Spawn no centro da linha de baixo (linha `rows - 2`).
 * 3. Baú aleatório em `row ∈ [1, chestMaxRow]`, `col ∈ [1, cols-2]`.
 * 4. Corredor principal esculpido com `pathTile` aplicando regras no-touch (não cruza
 *    consigo mesmo, não abre blocos 2x2). Total absoluto ≤ `maxInstructions` instruções
 *    (cap estrito); o fechamento final é feito em **L** (no máximo 1 virada extra) via
 *    `pickDirectStep`, evitando trajetória em escada. Retorna a sequência de direções
 *    em `pathDirections` (consumida pela intro do tutorial).
 * 5. Ramos falsos opcionais (`fakeBranchCount > 0`) pintados **nas encruzilhadas** do
 *    corredor — cada virada vira até um ramo curto na direção "continuar reto" ou no
 *    lado oposto da virada real. Respeita `fakeBranchMinDistance` entre starts.
 * 6. Pós-validação: BFS spawn→baú + ratio dentro de `pathRatioRange`. Regenera com nova
 *    seed até `maxRegenAttempts` se a validação falhar. Se estourar, devolve a melhor
 *    tentativa válida (caminho ok) ou a última (com aviso) — nunca bloqueia o jogo.
 */
export const generateProceduralMap = (
  cfg: ProceduralMapGenerationConfig,
  tiles: GeneratorTileSet
): GeneratedMap => {
  validateTileSet(tiles, cfg);
  if (cfg.cols < 5 || cfg.rows < 5) {
    throw new Error('[mapGenerator] cols/rows precisam de ser >= 5 para gerar um mapa válido.');
  }

  const rng = createSeededRng(cfg.seed);
  const maxAttempts = Math.max(1, cfg.maxRegenAttempts);

  let lastValidPath: AttemptResult | null = null;
  let lastAttempt: AttemptResult | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = runOneAttempt(cfg, rng);
    lastAttempt = result;
    if (!result.hasPath || !result.pathQualityOk) continue;
    lastValidPath = result;
    const ratio = result.ratio;
    if (ratio >= cfg.pathRatioRange.min && ratio <= cfg.pathRatioRange.max) {
      return buildGeneratedMap(result, cfg, tiles);
    }
  }

  const fallback = lastValidPath ?? lastAttempt;
  if (!fallback) {
    throw new Error('[mapGenerator] nenhuma tentativa de geração produziu mapa.');
  }
  console.warn(
    `[mapGenerator] usando fallback após ${maxAttempts} tentativas — ratio=${fallback.ratio.toFixed(3)}, hasPath=${fallback.hasPath}`
  );
  return buildGeneratedMap(fallback, cfg, tiles);
};

const buildGeneratedMap = (
  attempt: AttemptResult,
  cfg: ProceduralMapGenerationConfig,
  tiles: GeneratorTileSet
): GeneratedMap => {
  const json: TileMapJson = {
    id: `generated_${Date.now()}`,
    tileSize: cfg.tileSize,
    spawn: attempt.spawn,
    chest_position: attempt.chest,
    tiles,
    layout: attempt.layout
  };

  return { json, pathDirections: attempt.pathDirections };
};

/**
 * Alias mantido por compatibilidade interna durante a transição (Fácil agora compartilha
 * o mesmo gerador). Prefira `generateProceduralMap` em código novo.
 * @deprecated Use {@link generateProceduralMap}.
 */
export const generateEasyMap = (cfg: EasyMapGenerationConfig, tiles: GeneratorTileSet): GeneratedMap =>
  generateProceduralMap(cfg, tiles);
