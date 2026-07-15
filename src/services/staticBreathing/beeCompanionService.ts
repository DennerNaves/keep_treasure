import type { BeeCompanionState } from '../../types/beeCompanion';
import { BEE_COMPANION_CONFIG } from '../../utils/constants';

/** Cache de imagens da abelha (mesmo padrão de `StaticBreathingImageRegistry`). */
export type BeeCompanionImageRegistry = Map<string, HTMLImageElement>;

export const createBeeCompanionRegistry = (): BeeCompanionImageRegistry => new Map();

/**
 * Carrega o spritesheet da abelha (uma vez). Tolerante a falha — se o PNG não carregar,
 * o desenho cai em no-op sem quebrar a cena estática.
 */
export const preloadBeeCompanion = (registry: BeeCompanionImageRegistry): void => {
  const url = BEE_COMPANION_CONFIG.IMAGE;
  if (registry.has(url)) return;
  const img = new Image();
  img.src = url;
  img.onerror = () => {
    console.warn(`[beeCompanion] falha ao carregar imagem: ${url}`);
  };
  registry.set(url, img);
};

const isImageReady = (img: HTMLImageElement | undefined): img is HTMLImageElement =>
  !!img && img.complete && img.naturalWidth > 0;

export interface ComputeBeeCompanionStateInput {
  /**
   * Progresso do ciclo respiratório `[0, 1]` — mesma fonte usada pela animação do
   * fazendeiro. Garante que abelha e farmer "respiram" no mesmo CPM do menu.
   */
  cycleProgress01: number;
  /** Tempo absoluto da sessão; usado apenas para a animação independente das asas. */
  sessionElapsedMs: number;
  viewport: { width: number; height: number };
  /** Último valor de `facingRight` (mantido entre frames para histerese do flip). */
  lastFacingRight: boolean;
}

/**
 * Calcula posição, frame e direção da abelha a partir do progresso respiratório.
 *
 * **Órbita** (com `ORBIT_DIRECTION = 1`, ou seja, sobe pela direita / desce pela esquerda):
 * ```
 * angle = 2π * cycleProgress01
 * x = cx + sin(angle) * radiusX
 * y = cy + cos(angle) * radiusY
 * ```
 *
 * Resultado:
 * - `cycleProgress01 = 0`   → posição `(0, +radiusY)`        → **fundo** (peito vazio).
 * - `cycleProgress01 = 0.25`→ posição `(+radiusX, 0)`        → lateral direita, subindo.
 * - `cycleProgress01 = 0.5` → posição `(0, -radiusY)`        → **topo** (peito cheio).
 * - `cycleProgress01 = 0.75`→ posição `(-radiusX, 0)`        → lateral esquerda, descendo.
 *
 * Como `cycleProgress01` do modo intervals tem holds em `0.5` (top) e `0` (bottom),
 * a abelha fica naturalmente parada no topo durante o hold inspirado e parada no fundo
 * durante o hold expirado — reforça a função de guia respiratório.
 *
 * **Flip**: a velocidade horizontal é proporcional a `cos(angle)`. Quando
 * `cos(angle) > deadzone`, a abelha está se movendo para a direita (flip aplicado,
 * arte é left-facing). Quando `cos(angle) < -deadzone`, indo para a esquerda (sem flip).
 * Entre os deadzones (em ~0.25 e ~0.75 do ciclo, vel_x ≈ 0), mantemos o último
 * `facingRight` para evitar flicker.
 *
 * `ORBIT_DIRECTION = -1` inverte o sentido (sobe pela esquerda, desce pela direita).
 */
export const computeBeeCompanionState = (input: ComputeBeeCompanionStateInput): BeeCompanionState => {
  const {
    FRAMES,
    WING_FPS,
    ORBIT_RADIUS_X_FRACTION,
    ORBIT_RADIUS_Y_FRACTION,
    ORBIT_CENTER_Y_OFFSET_FRACTION,
    ORBIT_DIRECTION,
    FACES_LEFT_BY_DEFAULT,
    FLIP_DEADZONE
  } = BEE_COMPANION_CONFIG;

  const { width, height } = input.viewport;
  const cx = width / 2;
  const cy = height / 2 + ORBIT_CENTER_Y_OFFSET_FRACTION * height;
  const radiusX = ORBIT_RADIUS_X_FRACTION * width;
  const radiusY = ORBIT_RADIUS_Y_FRACTION * height;

  const cp = Math.max(0, Math.min(1, input.cycleProgress01));
  const angle = 2 * Math.PI * cp;
  const sinA = Math.sin(angle);
  const cosA = Math.cos(angle);

  const x = cx + ORBIT_DIRECTION * sinA * radiusX;
  const y = cy + cosA * radiusY;

  const frameCount = Math.max(1, FRAMES);
  const fps = Math.max(1, WING_FPS);
  const safeElapsed = input.sessionElapsedMs > 0 ? input.sessionElapsedMs : 0;
  const spriteIndex = Math.floor(safeElapsed / (1000 / fps)) % frameCount;

  // Direção horizontal: derivada de x em relação a cp é ORBIT_DIRECTION * cos(angle) * radiusX.
  // Sinal de cos(angle) decide se está indo para direita ou esquerda. Multiplicamos pelo
  // ORBIT_DIRECTION para suportar órbita invertida.
  const horizontalVelSign = ORBIT_DIRECTION * cosA;
  let movingRight: boolean;
  if (horizontalVelSign > FLIP_DEADZONE) movingRight = true;
  else if (horizontalVelSign < -FLIP_DEADZONE) movingRight = false;
  else movingRight = input.lastFacingRight; // dentro do deadzone, mantém

  // `facingRight === true` significa que precisamos *flipar* a arte para mostrar a abelha
  // virada para a direita. Como a arte default é left-facing, isso vale `movingRight`.
  // Se um dia a arte trocar para right-facing, basta `FACES_LEFT_BY_DEFAULT = false` e
  // o flip passa a ser aplicado quando ela se move para a esquerda.
  const facingRight = FACES_LEFT_BY_DEFAULT ? movingRight : !movingRight;

  return { x, y, spriteIndex, facingRight };
};

/**
 * Desenha a abelha no canvas a partir do estado calculado. Recorta o frame vertical do
 * spritesheet e centraliza no `(state.x, state.y)`. Aplica `ctx.scale(-1, 1)` quando
 * `state.facingRight` é true.
 */
export const drawBeeCompanion = (
  ctx: CanvasRenderingContext2D,
  registry: BeeCompanionImageRegistry,
  state: BeeCompanionState,
  viewport: { width: number; height: number }
): void => {
  const img = registry.get(BEE_COMPANION_CONFIG.IMAGE);
  if (!isImageReady(img)) return;

  const frameCount = Math.max(1, BEE_COMPANION_CONFIG.FRAMES);
  const frameH = Math.max(1, Math.floor(img.naturalHeight / frameCount));
  const frameW = img.naturalWidth;
  const sy = Math.min(state.spriteIndex, frameCount - 1) * frameH;

  const aspect = frameW / frameH;
  const targetH = viewport.height * BEE_COMPANION_CONFIG.SCREEN_HEIGHT_FRACTION_SIZE;
  const targetW = targetH * aspect;

  if (state.facingRight) {
    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, sy, frameW, frameH, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.restore();
  } else {
    ctx.drawImage(
      img,
      0,
      sy,
      frameW,
      frameH,
      state.x - targetW / 2,
      state.y - targetH / 2,
      targetW,
      targetH
    );
  }
};
