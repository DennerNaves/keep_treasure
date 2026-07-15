/**
 * Tema do jogo (template): nomes usados em textos e BLE.
 * Ex.: nome do jogo, personagem principal (ex.: Baleia) e partícula (ex.: Bolhas).
 */
export const GAME_THEME = {
  NAME: 'Trilha do Tesouro',
  MAIN_CHARACTER: 'Fazendeiro',
  PARTICLE: 'Bolhas'
} as const;

/** Prefixo para chaves de storage (derivado do nome do jogo). Ex.: Jogo da Baleia → jogo-da-baleia */
const STORAGE_KEY_PREFIX = GAME_THEME.NAME.toLowerCase().replace(/\s+/g, '-');

/**
 * Tema visual dos menus (calibração, inicial, pause, encerramento).
 * - 'game': usa as cores do projeto definidas em styles/global.tsx (template).
 * - 'light': menu padrão claro (fundo branco/cinza), igual para qualquer jogo.
 */
export type MenuTheme = 'game' | 'light';

/** Tema usado quando não há valor salvo no localStorage. */
export const MENU_THEME: MenuTheme = 'game';

/** Chave usada no localStorage para persistir o tema escolhido pelo usuário. */
export const THEME_STORAGE_KEY = `${STORAGE_KEY_PREFIX}:menu-theme`;

/** Se true, o controle de **brilho** aparece no painel de acessibilidade dos menus. Pensado para TEA. */
export const ALLOW_BRIGHTNESS_CONTROL = true;

/** Se true, o botão de alternar tema (sol) aparece no menu e a escolha é salva no localStorage. */
export const ALLOW_THEME_SWITCH = true;

/** Chave no localStorage para persistir o valor de brilho escolhido pelo usuário. */
export const BRIGHTNESS_STORAGE_KEY = `${STORAGE_KEY_PREFIX}:brightness`;

/**
 * Intervalo permitido para o slider de brilho (aplicado via CSS var `--brightness` no canvas).
 * - MIN/MAX: porcentagens (ex.: 50 a 100). 100 = brilho normal.
 * - DEFAULT: valor inicial quando não há preferência salva.
 * - STEP: passo do slider.
 */
export const BRIGHTNESS_CONFIG = {
  MIN: 50,
  MAX: 100,
  DEFAULT: 100,
  STEP: 5
} as const;

/**
 * **Altere aqui as cores dos menus** (Welcome, MainMenu, Game Over, modais).
 *
 * - Painéis: roxo suave (`CONTENT_GRADIENT_*`)
 * - Bordas / CTAs: dourado (`BORDER_HIGHLIGHT*`)
 * - Botões e sliders: verde/marrom (`SECONDARY_*`, `ACCENT_*`)
 * - Fundo JPEG: `MENU_SCREEN_CONFIG` (mesmo ficheiro)
 *
 * Aplicadas no arranque via `applyMenuBrandVariables` (`src/main.tsx`).
 */
export const MENU_BRAND_CONFIG = {
  CONTENT_GRADIENT_TOP: '#4d4563',
  CONTENT_GRADIENT_BOTTOM: '#2c2638',
  BORDER_HIGHLIGHT: '#c9a227',
  BORDER_HIGHLIGHT_HOVER: '#dcc06a',
  BORDER_HIGHLIGHT_GLOW: '#a8841f',
  /** Sliders e gradientes de UI (nome legado; tom lavanda suave). */
  TEAL_GRADIENT_START: '#6b6078',
  TEAL_GRADIENT_END: '#4a4158',
  SECONDARY: '#5a7a52',
  SECONDARY_DARK: '#4a5c42',
  SECONDARY_DEEP: '#354030',
  ACCENT: '#7a8f6e',
  ACCENT_HOVER: '#6a7d62',
  BTN_VOLTAR_TEXT: '#2e2618',
  TITLE_SHADOW: '#3d3528',
  MENU_NAV_BG: '#5a4f72',
  MENU_NAV_HOVER: '#6d6088',
  PRIMARY_DIM: 'rgba(201, 162, 39, 0.35)',
  BORDER_LIGHT: '#8a8498'
} as const;

/** Chave no sessionStorage para o contexto da sessão (token, paciente, etc.). */
export const SESSION_STORAGE_KEY = `${STORAGE_KEY_PREFIX}:session-context`;

/** Minutos de folga exigidos antes da expiração do token para iniciar a partida (tempo para enviar dados ao backend). */
export const SESSION_TOKEN_BUFFER_MINUTES = 5;

/** Path do endpoint POST para enviar dados da sessão (varia por jogo). Ex.: keep_ocean_desktop → /jogos_web/keep_ocean_desktop/ */
export const API_SESSION_SUBMIT_PATH = 'keep_ocean_desktop';

/** URL para botão "Voltar ao portal" (comum a todos os jogos). Via env ou fallback. */
export const PORTAL_RETURN_URL =
  (typeof import.meta.env.VITE_PORTAL_RETURN_URL === 'string' ? import.meta.env.VITE_PORTAL_RETURN_URL.trim() : '') ||
  'https://keepweb.selfsolutions.com.br/user-selection';

/** Origem do portal que embute o jogo (validação do iframe). Derivada de PORTAL_RETURN_URL. */
export const PORTAL_ORIGIN = (() => {
  try {
    return new URL(PORTAL_RETURN_URL).origin;
  } catch {
    return 'https://keepweb.selfsolutions.com.br';
  }
})();

/**
 * URL pública base do jogo em produção (ex.: domínio Amplify).
 * Personalize ao criar um novo jogo a partir do template. Em build/CI, pode ser sobrescrita por `VITE_GAME_PUBLIC_URL`.
 */
export const GAME_PUBLIC_URL_DEFAULT = 'https://keep-ocean.selfsolutions.com.br/' as const;

/**
 * Origem em que o jogo é servido (derivada de {@link GAME_PUBLIC_URL_DEFAULT} ou de `VITE_GAME_PUBLIC_URL`).
 * Usada pelo guard de iframe: acesso top-level é permitido nesta origem, além de localhost e do portal.
 */
export const GAME_DEPLOY_ORIGIN = (() => {
  const fromEnv = typeof import.meta.env.VITE_GAME_PUBLIC_URL === 'string' ? import.meta.env.VITE_GAME_PUBLIC_URL.trim() : '';
  const resolved = fromEnv || GAME_PUBLIC_URL_DEFAULT;
  try {
    return new URL(resolved).origin;
  } catch {
    return 'https://keep-ocean.selfsolutions.com.br';
  }
})();

/**
 * Configuração geral do jogo (template): altura base, velocidade do fundo, CPM, limites de sessão e duração.
 */
export const GAME_CONFIG = {
  BASE_HEIGHT: 2250,
  BACKGROUND_SPEED: 2,
  DEFAULT_SESSION_LIMIT: 180,
  DEFAULT_CYCLES_PER_MINUTE: 6,
  MIN_CYCLES_PER_MINUTE: 5,
  MAX_CYCLES_PER_MINUTE: 15,
  MIN_SESSION_TIME: 60,
  MAX_SESSION_TIME: 600,
  SESSION_TIME_STEP: 15
} as const;

/**
 * Pré-visualização na aba Modo (só UI, em segundos). Não altera o motor da partida.
 * Na partida, proporções do ritmo com intervalos vêm de `BREATHING_INTERVAL_PHASE_RATIOS` em `services/game/breathingRhythmService.ts`.
 * A pré-visualização na aba Modo usa estes tempos em `ModoBreathingPreview` (spritesheet).
 */
export const MENU_BREATHING_PREVIEW = {
  CONTINUOUS_CYCLE_S: 5,
  INTERVAL_INHALE_S: 2,
  INTERVAL_HOLD_TOP_S: 1.5,
  INTERVAL_EXHALE_S: 2,
  INTERVAL_HOLD_BOTTOM_S: 1.5
} as const;

export type MenuBreathingPatternId = 'continuous' | 'intervals';

export const MENU_BREATHING_PATTERN_COPY = {
  continuous: {
    description:
      'A personagem sobe e desce o tempo todo, num movimento  constante, sem ficar parada no topo ou embaixo. Movimento contínuo conforme pré-visualização abaixo.'
  },
  intervals: {
    description:
      'Há um tempo em que a personagem fica em cima inspirando, desce num trecho curto, fica um tempo embaixo expirando e sobe de novamente, e o ciclo segue.No contínuo isso não acontece: não há tempo parada no topo ou embaixo. Movimento  conforme pré-visualização abaixo.'
  }
} as const satisfies Record<MenuBreathingPatternId, { description: string }>;

/** Rótulos dos botões de tipo de respiração (menu e pausa — manter iguais). */
export const MENU_BREATHING_PATTERN_BUTTON_LABEL: Record<MenuBreathingPatternId, string> = {
  continuous: 'Contínua',
  intervals: 'Com intervalos'
};

export type MenuDifficultyId = 'easy' | 'medium' | 'hard';

/** Rótulos curtos para UI (ex.: menu pausado). */
export const MENU_DIFFICULTY_LABEL: Record<MenuDifficultyId, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil'
};

/** Valores para o campo `difficult_level` no POST da sessão (string ≤ 20 caracteres). */
export const SESSION_DIFFICULTY_API_VALUE: Record<MenuDifficultyId, string> = {
  easy: '1',
  medium: '2',
  hard: '3'
};

/**
 * Textos da dificuldade no menu (linguagem para quem não conhece termos técnicos).
 * Estas regras só mudam o jogo com sensor a enviar dados; no modo automático nada altera.
 */
const MENU_DIFFICULTY_FOOTER = 'Funciona apenas com sensor ligado enviado dados, fora do modo automático.' as const;

export const MENU_DIFFICULTY_COPY = {
  easy: {
    description: `Usa o valor da calibração como referência fixa na sessão. Os peixes aparecem quando a resposta do corpo está boa em relação a essa referência. Nesse nível peixes não são perdidos. ${MENU_DIFFICULTY_FOOTER}`
  },
  medium: {
    description: `Usa o valor da calibração como referência fixa na sessão. Os peixes entram quando o corpo acompanha bem. Os peixes podem sair se a resposta cair de forma clara abaixo do valor registado na calibração (20% abaixo). ${MENU_DIFFICULTY_FOOTER}`
  },
  hard: {
    description: `A referência acompanha o jogo ao longo do tempo: os peixes entram e podem sair conforme a variabilidade natural no momento, com mais desafio e atenção contínua. ${MENU_DIFFICULTY_FOOTER}`
  }
} as const satisfies Record<MenuDifficultyId, { description: string }>;

/**
 * Sessão iniciada com sensor: durante a **partida** (`playing`), se o RR faltar de forma contínua
 * além deste tempo, a partida passa a modo passivo (como sem sensor); no fim o POST usa `with_sensor: false`.
 * Não se aplica à calibração.
 */
export const SENSOR_SESSION_CONFIG = {
  NO_SIGNAL_TO_DISCONNECT_MS: 20_000
} as const;

/**
 * Transição do modo estático (preparação/respiração) para exploração top-down.
 *
 * O **tempo da fase estática** vem agora do slider "Tempo de respiração" do menu
 * (`getSessionLimit()` em segundos). Esta config só guarda:
 * - `STATIC_FALLBACK_MIN_MS`: usado se `sessionLimit` vier inválido (<= 0).
 * - Regras de sensor (tier sustentado): inalteradas.
 */
export const GAMEPLAY_TRANSITION_CONFIG = {
  STATIC_FALLBACK_MIN_MS: 10_000,
  EXPLORATION_UNLOCK_TIER_MIN: 2,
  TIER_HOLD_MS: 8_000,
  ALLOW_MANUAL_UNLOCK: true
} as const;

/**
 * Cena estática de respiração (fase pré-exploração).
 *
 * O ritmo (ciclos/min + `BreathingPatternId`) vem do menu via engine — esta config só
 * descreve o **visual** e o **áudio** da cena. Substituindo os PNGs em `IMAGES` ou
 * ajustando os escalares, qualquer jogo do template ganha a tela de respiração com
 * outro personagem sem mexer no serviço/hook.
 */
export const STATIC_BREATHING_CONFIG = {
  IMAGES: {
    /** PNG estático único (1 frame). Usado em pose neutra (futuro pause / welcome). */
    IDLE: '/assets/images/mainCharacter/static/farmerfull_idle.png',
    /** Spritesheet vertical com `BREATHING_FRAMES` quadros empilhados. */
    BREATHING_SHEET: '/assets/images/mainCharacter/static/farmerfull_breathing.png',
    /** Fundo da fase de respiração (canvas). */
    BACKGROUND: '/assets/images/background/breathing_background.jpeg'
  },
  /**
   * Quantidade total de frames empilhados verticalmente em `BREATHING_SHEET`.
   * Um ciclo respiratório completo (inspira + expira) varre frames `0..N-1` em sequência
   * e reinicia no próximo ciclo. Mesmo padrão dos spritesheets do top-down
   * (ex.: `FARMER_TOPDOWN_CONFIG.WALK_FRAMES`). Ajustar quando substituir o PNG.
   */
  BREATHING_FRAMES: 14,
  /** `fill` estica ao viewport; `cover` mantém proporção. Fallback: BACKGROUND_COLOR. */
  BACKGROUND_FIT: 'fill' as 'cover' | 'fill',
  /** Escurecimento sobre o JPEG (0 = desligado; ~0.2–0.35 = um pouco mais apagado). */
  BACKGROUND_DIM_OPACITY: 0.28,
  BACKGROUND_DIM_COLOR: 'rgba(0, 0, 0, 1)',
  BACKGROUND_COLOR: '#0e3a52',
  SCREEN_HEIGHT_FRACTION: 0.6,
  PLAY_SFX: true
} as const;

/**
 * Fundo JPEG e pré-visualização da aba Modo (Welcome + MainMenu).
 * `BACKGROUND_OVERLAY`: aumentar alpha = ecrã mais escuro sobre a foto.
 */
export const MENU_SCREEN_CONFIG = {
  BACKGROUND_IMAGE: STATIC_BREATHING_CONFIG.IMAGES.BACKGROUND,
  BACKGROUND_OVERLAY: 'rgba(36, 28, 48, 0.58)',
  BACKGROUND_OVERLAY_LIGHT: 'rgba(36, 28, 48, 0.42)',
  BREATHING_PREVIEW: {
    SPRITESHEET: STATIC_BREATHING_CONFIG.IMAGES.BREATHING_SHEET,
    FRAMES: STATIC_BREATHING_CONFIG.BREATHING_FRAMES,
    WIDTH_PX: 108,
    HEIGHT_PX: 128
  }
} as const;

/** FPS do ciclo contínuo na pré-visualização Modo (sincronizado com `MENU_BREATHING_PREVIEW`). */
export const getMenuBreathingPreviewContinuousFps = (): number =>
  MENU_SCREEN_CONFIG.BREATHING_PREVIEW.FRAMES / MENU_BREATHING_PREVIEW.CONTINUOUS_CYCLE_S;

/**
 * Transição leve entre a cena estática e a exploração (fade preto no canvas).
 * Modular: alterar duração/cor aqui muda o efeito global; `FADE_OUT_MS: 0` desliga.
 */
export const STATIC_BREATHING_TRANSITION_CONFIG = {
  FADE_OUT_MS: 600,
  FADE_IN_MS: 400,
  FADE_COLOR: '#000000'
} as const;

/**
 * Abelha companheira que voa em órbita em torno do fazendeiro durante a respiração
 * estática. Funciona como **guia visual**: a posição da abelha é função do
 * `cycleProgress01` (mesmo CPM do menu), então o jogador associa "abelha no topo →
 * inspirar / peito cheio" e "abelha no fundo → expirar / peito vazio".
 *
 * Asas batem em FPS fixo (`WING_FPS`), independente do ritmo respiratório.
 * A arte do spritesheet está naturalmente virada para a **esquerda** (ver
 * `FACES_LEFT_BY_DEFAULT`). Quando a abelha se desloca para a direita aplicamos um
 * `ctx.scale(-1, 1)` para espelhar.
 */
export const BEE_COMPANION_CONFIG = {
  /** Permite desligar a abelha sem remover código. */
  ENABLED: true,
  IMAGE: '/assets/images/companions/bee_companion.png',
  /** Quantidade de quadros empilhados verticalmente no spritesheet. Trocar quando o PNG mudar. */
  FRAMES: 20,
  /** FPS da animação das asas (independente do ritmo respiratório). */
  WING_FPS: 10,
  /** Tamanho da abelha como fração da altura do viewport. */
  SCREEN_HEIGHT_FRACTION_SIZE: 0.14,
  /** Raio horizontal da órbita, como fração da largura do viewport. */
  ORBIT_RADIUS_X_FRACTION: 0.22,
  /** Raio vertical da órbita, como fração da altura do viewport. */
  ORBIT_RADIUS_Y_FRACTION: 0.18,
  /** Deslocamento vertical do centro da órbita (fração da altura). Negativo = mais para cima. */
  ORBIT_CENTER_Y_OFFSET_FRACTION: -0.05,
  /** Sentido da órbita: 1 = sobe pela direita / desce pela esquerda. -1 inverte. */
  ORBIT_DIRECTION: 1 as 1 | -1,
  /** A arte está naturalmente virada para a esquerda. Trocar para `false` se a nova arte for right-facing. */
  FACES_LEFT_BY_DEFAULT: true,
  /** Deadzone (em |cos(angle)|) para evitar flicker do flip ao passar pelo topo/fundo. */
  FLIP_DEADZONE: 0.08
} as const;

/**
 * Barra guia de respiração (template).
 *
 * Bar vertical em DOM (não no canvas) na fase estática e na exploração top-down.
 * Acompanha o mesmo `cycleProgress01` do ritmo da sessão (`computeStaticBreathingFrame`).
 *
 * `POSITION` aceita `'left' | 'right' | 'center'`. Tamanho por fase em `BREATHING_SIZE`
 * (respiração centralizada) e `EXPLORATION_SIZE` (mapa top-down, normalmente menor).
 */
export const BREATHING_GUIDE_BAR_CONFIG = {
  ENABLED: true,
  POSITION: 'right' as 'left' | 'right' | 'center',
  MARGIN_PX: 32,
  /**
   * Fase estática — personagem centralizado a respirar.
   * Ritmo: `getSessionPlayElapsedMs()` (avança em estática e exploração).
   */
  BREATHING_SIZE: {
    WIDTH_PX: 400,
    HEIGHT_FRACTION: 0.55
  },
  /** Fase de exploração top-down — barra mais compacta; mesmo CPM/padrão da estática. */
  EXPLORATION_SIZE: {
    WIDTH_PX: 300,
    HEIGHT_FRACTION: 0.42
  },
  FILL_COLOR: 'rgb(3, 128, 206)',
  /**
   * Área interna do frame (fração 0..1) onde o preenchimento pode existir.
   * Ajuste fino para alinhar no "vazio" da imagem.
   */
  FILL_AREA: {
    TOP: 0.01,
    RIGHT: 0.1,
    BOTTOM: 0.01,
    LEFT: 0.1
  },
  /** Placeholder visual enquanto não há arte definitiva. */
  PLACEHOLDER_COLORS: {
    TRACK: 'rgba(20, 30, 40, 0.55)',
    TRACK_BORDER: 'rgba(255, 255, 255, 0.35)',
    INDICATOR: '#ffd966',
    INDICATOR_BORDER: 'rgba(0, 0, 0, 0.35)'
  },
  /** Quando definidos, o componente desenha estas imagens em vez do placeholder. */
  IMAGES: {
    TRACK: '/assets/images/ui/FrameGuiaDeRespiracao.png',
    INDICATOR: ''
  }
} as const;

/**
 * Intro do tutorial — abelha + balão de fala que abre cada partida de exploração.
 *
 * A abelha entra voando do canto direito (`ENTRY_FROM`), pausa no centro (`IDLE_AT`)
 * com o balão, e sai pelo canto superior esquerdo (`EXIT_TO`). Todas as coordenadas
 * são fração do viewport (`xFrac, yFrac`), tornando a intro responsiva.
 *
 * O balão é montado a partir de `MESSAGE_TEMPLATE`: o placeholder `{directions}` é
 * substituído pelo resultado de `formatPathDirections(pathDirections)` (sequência
 * de direções do corredor procedural). Se o mapa não tiver `pathDirections` (mapa
 * estático), o componente cai em `FALLBACK_MESSAGE`.
 */
export const EXPLORATION_INTRO_CONFIG = {
  ENABLED: true,
  /** Opacidade do backdrop escurecido sobre o jogo enquanto a intro está ativa. */
  BACKDROP_OPACITY: 0.55,
  BEE: {
    /** Spritesheet reaproveitada do `BEE_COMPANION_CONFIG`. */
    IMAGE: '/assets/images/companions/bee_companion.png',
    FRAMES: 20,
    WING_FPS: 12,
    /** Tamanho da abelha como fração da altura do viewport. */
    SCREEN_HEIGHT_FRACTION: 0.18,
    /** Posição inicial (fora da tela, à direita). */
    ENTRY_FROM: { xFrac: 1.1, yFrac: 0.5 },
    /** Posição central onde a abelha pára para falar. */
    IDLE_AT: { xFrac: 0.58, yFrac: 0.5 },
    /** Posição final (fora da tela, canto superior esquerdo). */
    EXIT_TO: { xFrac: -0.15, yFrac: 0.05 },
    ENTRY_DURATION_MS: 900,
    EXIT_DURATION_MS: 1100,
    /** Easing aplicado à interpolação de entrada/saída. */
    EASING: 'easeInOutQuad' as 'linear' | 'easeInOutQuad',
    /** Arte default da spritesheet é left-facing. Igual ao `BEE_COMPANION_CONFIG`. */
    FACES_LEFT_BY_DEFAULT: true,
    /** Spritesheet da boca — só na fase `speaking` (quadros empilhados verticalmente). */
    SPEAKING: {
      IMAGE: '/assets/images/companions/bee_talking.png',
      FRAMES: 14,
      FPS: 7,
      FACES_LEFT_BY_DEFAULT: true
    }
  },
  SPEECH_BUBBLE: {
    IMAGE: '/assets/images/effects/speech_bubble.png',
    /** Offset (px) do balão em relação à abelha. */
    OFFSET: { x: -160, y: -40 },
    PLACEMENT: 'above' as 'above' | 'right' | 'left',
    /** Texto sobre a arte do balão — cinza escuro quase preto. */
    TEXT_COLOR: '#1a1a1a',
    CONTINUE_LABEL: 'Continuar',
    /** Padding interno (px) para texto e botão sobre a arte do balão. */
    PADDING: { top: 50, right: 70, bottom: 24, left: 70 },
    MIN_WIDTH_PX: 350,
    MAX_WIDTH_PX: 500,
    MIN_HEIGHT_PX: 200,
    /** Altura máxima do balão (px); texto longo faz scroll na área interna. */
    MAX_HEIGHT_PX: 300
  },
  /**
   * `{directions}` é substituído por `formatPathDirections(...)` — texto narrativo já
   * formatado (ex.: `"Vá para cima, depois para a esquerda, depois para cima"`).
   */
  MESSAGE_TEMPLATE: 'Olá! {directions} para encontrar o baú!',
  /** Mensagem usada quando `pathDirections` está vazio (mapa estático). */
  FALLBACK_MESSAGE: 'Olá! Encontre o baú!'
} as const;

export const FEATURE_FLAGS = {
  LEGACY_OCEAN_GAMEPLAY_ENABLED: false,
  TOPDOWN_PLAYTEST_ENABLED: true,
  /** Neblina de descoberta — opcional; desligar em jogos que não usam exploração/neblina. */
  EXPLORATION_FOG_ENABLED: true
} as const;

/** Mapa ativo no modo exploração (template: trocar URL para outro jogo/nível). */
export const EXPLORATION_ACTIVE_MAP_URL = '/data/maps/farm_playtest.json';

/**
 * Neblina (desacoplada do tilemap). Só usada se FEATURE_FLAGS.EXPLORATION_FOG_ENABLED.
 *
 * Raios Chebyshev (área quadrada `2*radius + 1` por lado; `0` = 1 tile, `1` = 3x3, `2` = 5x5):
 * - `SPAWN_REVEAL_RADIUS`: revelado **uma vez** ao redor do spawn no estado inicial.
 * - `CHEST_REVEAL_RADIUS`: revelado **uma vez** ao redor do baú no estado inicial.
 *   Use `0` para o baú ficar oculto até o jogador revelar a célula ao explorar (padrão).
 *   Valores `> 0` só para modo acessível/debug.
 * - `WALK_REVEAL_RADIUS`: revelado **a cada passo** ao redor do pé do jogador durante a caminhada.
 *
 * Cada um pode ser sobrescrito pelo JSON da neblina (`spawnRevealRadius`, `chestRevealRadius`,
 * `walkRevealRadius`). Estes valores aqui são o fallback global do template.
 */
export const EXPLORATION_FOG_CONFIG = {
  MAP_URL: '/data/maps/farm_playtest_fog.json',
  COLOR: 'rgba(230, 230, 235, 0.88)',
  /** Fallback opaco enquanto a PNG da nuvem não carrega (evita “mapa nu”). */
  FALLBACK_COLOR_OPAQUE: 'rgb(220, 225, 232)',
  TILE_IMAGE: '/assets/images/tiles/clouds_tile.png',
  /** Escala de desenho por célula (1 = tamanho do tile; 1.25 = pedido de arte). */
  TILE_DRAW_SCALE: 1.25,
  /** Células extra no culling do viewport (nuvens com TILE_DRAW_SCALE > 1). */
  DRAW_CULL_PADDING_CELLS: 1,
  SPAWN_REVEAL_RADIUS: 1,
  CHEST_REVEAL_RADIUS: 0,
  WALK_REVEAL_RADIUS: 1,
  POP_DURATION_MS: 400,
  POP_PEAK_SCALE: 1.12
} as const;

/** Baú / objetivo da exploração (template: imagem opcional). */
export const EXPLORATION_CHEST_CONFIG = {
  COLOR: '#c9a227',
  BORDER_COLOR: '#8b6914',
  SIZE_FACTOR: 0.55,
  IMAGE: '/assets/images/objects/chest_topdownview.png' as string
} as const;

/** Mensagem ao encontrar o baú (overlay de vitória). */
export const EXPLORATION_WIN_CONFIG = {
  MESSAGE: 'Encontraste o baú! Missão concluída.',
  /** Escurecimento sobre o mapa congelado (canvas por baixo do overlay). */
  MAP_DIM_OVERLAY: 'rgba(0, 0, 0, 0.65)',
  /** Animação do baú a abrir (spritesheet vertical). Ajuste FRAMES ao PNG. */
  CHEST_OPEN: {
    IMAGE: '/assets/images/objects/chest_opening.png',
    FRAMES: 19,
    FPS: 12,
    SCREEN_HEIGHT_FRACTION: 0.35,
    HOLD_LAST_FRAME: true
  }
} as const;

/** Chão enquanto o mapa JSON ainda não carregou ou fora do modo exploração. */
export const EXPLORATION_FALLBACK_FLOOR_COLOR = '#8b7355';

/**
 * Geração procedural de mapa por dificuldade (template).
 *
 * `USE_GENERATOR[difficulty]`: liga/desliga o gerador para cada dificuldade.
 * Quando `false`, o jogo carrega o JSON de `EXPLORATION_ACTIVE_MAP_URL` (mapa estático).
 *
 * Cada bloco (`EASY`, `MEDIUM`, `HARD`) é repassado para `generateProceduralMap`
 * (em `mapGeneratorService`). Parâmetros principais por dificuldade:
 *
 * - `MIN_STRAIGHT_STEPS` — passos retos antes de o corredor poder virar.
 *   Maior = mais "limpo" e fácil de seguir; menor = mais sinuoso.
 * - `FORCE_DIRECT_AFTER_ITERATIONS` / `DIRECT_RADIUS` — quando o corredor abandona
 *   o passeio aleatório e vai direto ao baú. Hard usa valores maiores para manter
 *   a sinuosidade até quase o final.
 * - `MAX_INSTRUCTIONS` — máximo de instruções (segmentos contíguos com a mesma
 *   direção). Cada virada conta como nova instrução. Ao atingir o limite, o gerador
 *   vai direto ao baú. Diretamente conectado ao texto da abelha (4 instruções
 *   = "cima → esquerda → cima → direita").
 * - `FAKE_BRANCH_*` — dead-ends curtos pintados **nas encruzilhadas** do corredor.
 *   `FAKE_BRANCH_COUNT: 0` desliga (Easy). Comprimento curto (1–2) para simular
 *   apenas "qual lado seguir?" no ponto de virada, sem corredores paralelos longos.
 * - `MAX_STRAIGHT_SEGMENT` — teto de passos na mesma direção (5 Fácil / 4 Médio / 3 Difícil).
 * - `RECENT_VISIT_WINDOW` — anti-revisita nas últimas N células do corredor.
 * - `CHEST_MIN_DISTANCE_FROM_SPAWN` — baú longe do spawn (Chebyshev).
 * - `PATH_RATIO_RANGE` — faixa aceitável de `PATH / interior`. Mapas fora do range
 *   são descartados pelo pós-validador e regerados.
 * - `MAX_REGEN_ATTEMPTS` — tentativas máximas de regeração quando a validação falha.
 *
 * Para outros jogos do template: ajustar tiles (`BORDER_TILE`, `PATH_TILE`, `FILL_TILE`)
 * para nomes que existam no `tiles` do JSON base, ou desligar via `USE_GENERATOR`.
 */
export const EXPLORATION_MAP_GENERATION_CONFIG = {
  USE_GENERATOR: {
    easy: true,
    medium: true,
    hard: true
  } as Record<MenuDifficultyId, boolean>,
  EASY: {
    COLS: 10,
    ROWS: 10,
    TILE_SIZE: 320,
    BORDER_TILE: 'Arvores',
    PATH_TILE: 'Terra',
    FILL_TILE: 'Arvores',
    MIN_STRAIGHT_STEPS: 3,
    MAX_STRAIGHT_SEGMENT: 5,
    RECENT_VISIT_WINDOW: 10,
    CHEST_MIN_DISTANCE_FROM_SPAWN: 5,
    FORCE_DIRECT_AFTER_ITERATIONS: 8,
    DIRECT_RADIUS: 3,
    CHEST_MAX_ROW: 2,
    SPAWN_CLEAR_RADIUS: 1,
    MAX_INSTRUCTIONS: 4,
    FAKE_BRANCH_COUNT: 0,
    FAKE_BRANCH_MIN_LENGTH: 0,
    FAKE_BRANCH_MAX_LENGTH: 0,
    FAKE_BRANCH_MIN_DISTANCE: 2,
    PATH_RATIO_RANGE: { min: 0.15, max: 0.40 },
    MAX_REGEN_ATTEMPTS: 8
  },
  MEDIUM: {
    COLS: 10,
    ROWS: 10,
    TILE_SIZE: 320,
    BORDER_TILE: 'Arvores',
    PATH_TILE: 'Terra',
    FILL_TILE: 'Arvores',
    MIN_STRAIGHT_STEPS: 2,
    MAX_STRAIGHT_SEGMENT: 4,
    RECENT_VISIT_WINDOW: 8,
    CHEST_MIN_DISTANCE_FROM_SPAWN: 5,
    FORCE_DIRECT_AFTER_ITERATIONS: 10,
    DIRECT_RADIUS: 2,
    CHEST_MAX_ROW: 2,
    SPAWN_CLEAR_RADIUS: 1,
    MAX_INSTRUCTIONS: 5,
    FAKE_BRANCH_COUNT: 2,
    FAKE_BRANCH_MIN_LENGTH: 1,
    FAKE_BRANCH_MAX_LENGTH: 2,
    FAKE_BRANCH_MIN_DISTANCE: 2,
    PATH_RATIO_RANGE: { min: 0.15, max: 0.42 },
    MAX_REGEN_ATTEMPTS: 8
  },
  HARD: {
    COLS: 10,
    ROWS: 10,
    TILE_SIZE: 320,
    BORDER_TILE: 'Arvores',
    PATH_TILE: 'Terra',
    FILL_TILE: 'Arvores',
    MIN_STRAIGHT_STEPS: 1,
    MAX_STRAIGHT_SEGMENT: 3,
    RECENT_VISIT_WINDOW: 6,
    CHEST_MIN_DISTANCE_FROM_SPAWN: 4,
    FORCE_DIRECT_AFTER_ITERATIONS: 14,
    DIRECT_RADIUS: 1,
    CHEST_MAX_ROW: 2,
    SPAWN_CLEAR_RADIUS: 1,
    MAX_INSTRUCTIONS: 6,
    FAKE_BRANCH_COUNT: 3,
    FAKE_BRANCH_MIN_LENGTH: 1,
    FAKE_BRANCH_MAX_LENGTH: 2,
    FAKE_BRANCH_MIN_DISTANCE: 2,
    PATH_RATIO_RANGE: { min: 0.15, max: 0.45 },
    MAX_REGEN_ATTEMPTS: 8
  }
} as const;

const farmerTopdownBase = '/assets/images/mainCharacter/topdown';

export const FARMER_TOPDOWN_CONFIG = {
  /** Idle: um quadro por PNG (strip vertical com altura de um frame). */
  IDLE_FRAMES: 1,
  /** Walk: seis quadros empilhados na vertical por PNG. */
  WALK_FRAMES: 6,
  IDLE_FPS: 4,
  WALK_FPS: 5,
  MOVE_SPEED_PX_PER_S: 150,
  DISPLAY_SCALE: 0.7,
  /** Offset do pé em relação ao centro do sprite (× altura de exibição). */
  FOOT_OFFSET_FROM_CENTER: 0.35
} as const;

export const FARMER_TOPDOWN_ASSETS = {
  idle: {
    down: `${farmerTopdownBase}/idle/farmer_idle_down.png`,
    up: `${farmerTopdownBase}/idle/farmer_idle_up.png`,
    left: `${farmerTopdownBase}/idle/farmer_idle_left.png`,
    right: `${farmerTopdownBase}/idle/farmer_idle_right.png`
  },
  walk: {
    down: `${farmerTopdownBase}/walk/farmer_walk_down.png`,
    up: `${farmerTopdownBase}/walk/farmer_walk_up.png`,
    left: `${farmerTopdownBase}/walk/farmer_walk_left.png`,
    right: `${farmerTopdownBase}/walk/farmer_walk_right.png`
  }
} as const;

/**
 * Personagem principal controlado pelo jogo (template).
 * Ex.: baleia. Define posição, velocidade de entrada, frenagem, sprites, brilho e animação.
 */
export const PLAYER_CONFIG = {
  HORIZONTAL_POSITION: 0.55,
  VERTICAL_POSITION: 0.5,
  ARRIVAL_THRESHOLD: 100,
  ENTER_SPEED: 5,
  BRAKING_FORCE: 0.01,
  ENTRY_DIVE_SPEED_Y: 400,
  ENTRY_START_Y_FACTOR: 2.5,
  SPRITE_ANIM_SPEED: 0.2,
  MAX_ROTATION: 0.1,
  VERTICAL_CURVE_FACTOR: 0.15,
  GLOW_COLOR: 'rgba(246, 247, 222, 1)',
  GLOW_BLUR: 80,
  GLOW_BRIGHTNESS: 1.3,
  SPRITE_WIDTH: 440,
  SPRITE_TOTAL_HEIGHT: 4640,
  SPRITE_FRAMES: 20
} as const;

/**
 * Indicador na StatusBar durante a partida (template).
 * Ex.: estrela do mar. `HUD_ICON_SLOT_COUNT` fixa quantos ícones se desenham (independente de `COMPANIONS_CONFIG.length`).
 */
export const INDICATOR_CONFIG = {
  ENABLED: true,
  NAME: 'Maçã',
  /** Ícones na StatusBar; não segue automaticamente o número de companheiros no canvas. */
  HUD_ICON_SLOT_COUNT: 4,
  IMAGES: {
    OFF: '/assets/images/effects/apple_off.png',
    ON: '/assets/images/effects/apple_on.png'
  }
} as const;

/**
 * Indicadores visuais de respiração (template).
 * Use quando o personagem segue respiração em eixo vertical (layout top-down: sobe=INHALE, desce=EXHALE).
 * Permite controlar tamanho, rapidez da animação e deslocamento vertical de cada fase.
 */
export const VISUAL_BREATH_INDICATOR_CONFIG = {
  ENABLED: true,
  LAYOUT: 'topDown',
  TOP_DOWN: {
    ANIMATION_FPS: 3,
    WIDTH_RATIO: 0.4,
    INHALE_OFFSET_Y: 0.4,
    EXHALE_OFFSET_Y: 0.4
  }
} as const;

/**
 * Partículas = efeitos visuais que sobem/descem na tela (template).
 * Ex.: bolhas. Parâmetros: intervalo de spawn, tamanho, velocidade, curvatura e opacidade.
 */
export const PARTICLES_CONFIG = {
  /** Intervalo em ms entre spawns automáticos de partículas no canvas (ex.: folhas, bolhas). */
  PARTICLE_SPAWN_INTERVAL_MS: 500,
  SIZE_MODIFIER_MIN: 0.2,
  SIZE_MODIFIER_MAX: 0.4,
  BASE_SIZE: 100,
  SPEED_MIN: 1,
  SPEED_MAX: 3,
  CURVE_MAX: 5,
  ANGULAR_VELOCITY_MIN: 0.01,
  ANGULAR_VELOCITY_MAX: 0.05,
  OPACITY: 0.6
} as const;

/**
 * Companions = personagens que aparecem ao lado do principal (template).
 * Ex.: amigos do oceano. Cada item define atraso de entrada, velocidade, sprites, posição e quantos indicadores são necessários para aparecer.
 */
export const COMPANIONS_CONFIG = [
  {
    id: 'companion1',
    entryDelay: 0.2,
    phaseLag: 1.5,
    speed: 1.5,
    width: 171,
    height: 248,
    frames: 3,
    horizontalPos: 0.35,
    verticalPos: 0.55,
    scale: 0.8,
    sineAmplitude: 0.08,
    animSpeed: 5,
    enterSpeed: 4,
    exitSpeed: 2.5,
    brakingForce: 0.01,
    minStayTime: 0,
    minCooldownTime: 5000,
    requiredIndicators: 1
  },
  {
    id: 'companion2',
    entryDelay: 0.4,
    phaseLag: 0.5,
    speed: 0.5,
    width: 82,
    height: 325,
    frames: 3,
    horizontalPos: 0.25,
    verticalPos: 0.55,
    scale: 0.8,
    sineAmplitude: 0.08,
    animSpeed: 5,
    enterSpeed: 4,
    exitSpeed: 3,
    brakingForce: 0.01,
    minStayTime: 0,
    minCooldownTime: 5000,
    requiredIndicators: 2
  },
  {
    id: 'companion3',
    entryDelay: 0.6,
    phaseLag: 2.5,
    speed: 2.5,
    width: 106,
    height: 282,
    frames: 3,
    horizontalPos: 0.15,
    verticalPos: 0.55,
    scale: 0.8,
    sineAmplitude: 0.08,
    animSpeed: 5,
    enterSpeed: 4,
    exitSpeed: 3,
    brakingForce: 0.01,
    minStayTime: 0,
    minCooldownTime: 5000,
    requiredIndicators: 3
  },
  {
    id: 'companion4',
    entryDelay: 0.8,
    phaseLag: 2.5,
    speed: 2.5,
    width: 384,
    height: 6480,
    frames: 30,
    horizontalPos: 0.25,
    verticalPos: 0.22,
    scale: 0.8,
    sineAmplitude: 0,
    animSpeed: 2,
    enterSpeed: 4,
    exitSpeed: 3,
    brakingForce: 0.01,
    minStayTime: 0,
    minCooldownTime: 5000,
    requiredIndicators: 4
  }
] as const;

/** Quantidade de companheiros configurados (slots no canvas / motor). A StatusBar usa `INDICATOR_CONFIG.HUD_ICON_SLOT_COUNT` para quantos ícones desenhar. */
export const COMPANION_SLOT_COUNT = COMPANIONS_CONFIG.length;

/**
 * Áudio do jogo (template): volumes padrão, ganho da respiração, faixas de música e efeitos sonoros.
 * Respiração: INHALE/EXHALE (subida/descida); PARTICLE pode reutilizar o mesmo ficheiro das bolhas para outros usos.
 */
export const AUDIO_CONFIG = {
  DEFAULT_MUSIC_VOLUME: 0.3,
  DEFAULT_SFX_VOLUME: 0.8,
  BREATH_MAX_GAIN: 0.6,
  BREATH_PEAK_RATIO: 0.4,
  /**
   * Se true, inhale e exhale tocam durante toda a meia-respiração (30/cpm); se o clipe for mais curto que esse tempo, faz loop até cortar no fim da fase.
   * Se false, cada um toca uma vez via HTMLAudio (ignora a duração da fase).
   */
  BREATH_SYNC_TO_PHASE_DURATION: true,
  /**
   * Som ao fim da partida (personagem sai da tela em `gameOver`).
   * Keep Ocean: desligado. Outros jogos do template podem ativar e ajustar o volume.
   * Usa `SOUND_EFFECTS.LEVEL_COMPLETE`; a música de fundo é sempre interrompida ao encerrar.
   */
  END_GAME_AUDIO: {
    ENABLED: false,
    VOLUME: 0.8
  },
  TRACKS: [
    { id: 'music1', name: 'Oceano Calmo', src: '/assets/sounds/music1.mp3' },
    { id: 'music2', name: 'Ondas Suaves', src: '/assets/sounds/music2.mp3' },
    { id: 'music3', name: 'Brisa Marinha', src: '/assets/sounds/music3.mp3' },
    { id: 'music4', name: 'Profundezas', src: '/assets/sounds/music4.mp3' },
    { id: 'music5', name: 'Correntes', src: '/assets/sounds/music5.mp3' }
  ],
  SOUND_EFFECTS: {
    PARTICLE: '/assets/sounds/bubbles.wav',
    LEVEL_COMPLETE: '/assets/sounds/level-complete.wav',
    IN: '/assets/sounds/in.wav',
    OUT: '/assets/sounds/out.wav',
    INHALE: '/assets/sounds/inhale.wav',
    EXHALE: '/assets/sounds/bubbles.wav'
  }
} as const;

/** Largura em pixels da imagem de cada camada do fundo (template). Usada para repetição horizontal (parallax). */
export const BACKGROUND_IMAGE_WIDTH = 2046;

/**
 * Camadas do cenário em ordem de desenho (template). Cada uma tem id, src e velocidade de scroll.
 * Ex.: céu, sol, mar, fundo, coral, plantas, areia.
 */
export const BACKGROUND_LAYERS = [
  { id: 'sky', src: '/assets/images/background/ceu.png', speed: 0.3 },
  { id: 'sun', src: '/assets/images/background/sol.png', speed: 0 },
  { id: 'sea', src: '/assets/images/background/mar.png', speed: 1 },
  { id: 'ocean_floor', src: '/assets/images/background/fundo_mar.png', speed: 1 },
  { id: 'coral', src: '/assets/images/background/coral.png', speed: 0.5 },
  { id: 'plants', src: '/assets/images/background/plantas.png', speed: 0.5 },
  { id: 'sand', src: '/assets/images/background/areia.png', speed: 0.5 }
] as const;

/**
 * Caminhos das imagens do jogo (template).
 * Ex.: ícone estático do personagem (menu + favicon), spritesheet no canvas, partícula, botões, boas-vindas e companions.
 */
export const GAME_ASSETS = {
  /** Um único PNG do personagem (sem spritesheet em faixa). Usado no menu Modo e deve coincidir com o favicon em index.html. */
  MAIN_CHARACTER_ICON: '/assets/images/mainCharacter/static/farmerfull_idle.png',
  /** Spritesheet vertical usado no canvas do jogo para animar o personagem. */
  MAIN_CHARACTER_SPRITESHEET: '/assets/images/mainCharacter/whaleA.png',
  VISUAL_BREATH_INDICATORS_TOP_DOWN: {
    INHALE: '/assets/images/effects/inhale_spiral.png',
    EXHALE: '/assets/images/effects/exhale_bubbles.png'
  },

  /** Sprite da partícula no canvas do jogo. */
  PARTICLE: '/assets/images/effects/bubble.png',

  BUTTONS: '/assets/images/ui/buttons.png',
  WELCOME_ICONS: '/assets/images/ui/welcome-icons.png',

  COMPANIONS: [
    '/assets/images/companions/companions_1.png',
    '/assets/images/companions/companions_2.png',
    '/assets/images/companions/companions_3.png',
    '/assets/images/companions/companions_4.png'
  ]
} as const;

if (GAME_ASSETS.COMPANIONS.length !== COMPANIONS_CONFIG.length) {
  console.error(
    `❌ ERRO: GAME_ASSETS.COMPANIONS (${GAME_ASSETS.COMPANIONS.length}) deve ter o mesmo tamanho de COMPANIONS_CONFIG (${COMPANIONS_CONFIG.length}). Atualize os arrays para que correspondam.`
  );
}

/**
 * Intervalos em ms usados na UI (template).
 * Ex.: intervalo de partículas na interface e de eventos (ex.: feedback visual).
 */
export const UI_CONFIG = {
  PARTICLE_INTERVAL: 500,
  EVENT_INTERVAL: 150
} as const;

/** Intervalos e taxas de atualização (template): pontuação, FPS de animação e duração de transições. */
export const TIMING = {
  SCORE_UPDATE_INTERVAL: 1000,
  ANIMATION_FRAME_RATE: 60,
  TRANSITION_DURATION: 300
} as const;

/** Configuração BLE (template): prefixo do nome do dispositivo (ex.: sem espaços) e intervalo de atualização da bateria. */
export const BLE_CONFIG = {
  DEVICE_NAME_PREFIX: GAME_THEME.NAME.replace(/\s/g, ''),
  BATTERY_UPDATE_INTERVAL: 30000,
  RR_SIGNAL_STALE_MS: 3000
} as const;

/** Parâmetros do algoritmo VFC – variabilidade da frequência cardíaca (template): filtros RR, baseline, RMSSD e simulação. */
export const VFC_CONFIG = {
  MAX_RR_INTERVALS: 200,
  /** Janela híbrida: quantidade máxima de RRs usados no cálculo do RMSSD (Coospo: 30). */
  WINDOW_BEATS: 30,
  /** Janela híbrida: idade máxima (ms) dos RRs considerados. RRs mais antigos são descartados. Reduz ruído. */
  WINDOW_MAX_AGE_MS: 30_000,
  /** Intervalo (ms) entre recálculos de RMSSD/baseline. Atua como filtro de média, reduz surtos de leitura. */
  METRICS_INTERVAL_MS: 1000,
  /** Filtro de anomalias (ectópicos/artefatos): desvio máximo permitido em relação ao último RR aceito. Coospo padrão: 0.50 = 50%. */
  ANOMALY_THRESHOLD: 0.5,
  /** Sanidade fisiológica: RR mínimo em ms (30–230 bpm). Coospo: 260. */
  RR_MIN_MS: 260,
  /** Sanidade fisiológica: RR máximo em ms (30–230 bpm). Coospo: 2000. */
  RR_MAX_MS: 2000,
  /** Gap detection: gap mínimo (ms) para considerar batimentos perdidos. Coospo: 350. */
  GAP_MIN_MS: 350,
  /** Gap detection: fração do RR para considerar gap (ex.: 0.45 = 45%). Coospo: 0.45. */
  GAP_RR_FRACTION: 0.45,
  BASELINE_SAMPLES: 20,
  BASELINE_IGNORE_SAMPLES: 5,
  BASELINE_THRESHOLD_MULTIPLIER: 1,
  DEFAULT_RMSSD: 50,
  DEFAULT_HEART_RATE: 70,
  SIMULATION_VARIANCE: 10,
  UPDATE_INTERVAL: 100,
  /**
   * Multiplicadores da **referência** (baseline de jogo) em ordem crescente.
   * Em Fácil/Médio, essa referência é o RMSSD fixo gravado na calibração. Em Difícil, é a mediana deslizante do RMSSD (ver `VFCService`).
   * O **RMSSD atual** é o valor calculado a cada tick a partir dos intervalos RR — é isso que se compara à referência (não “trocar” calibração por baseline na explicação).
   * Tier **0**: RMSSD atual ≤ referência (ou referência inválida) → sem peixe por biofeedback.
   * Tier **1**: RMSSD atual **>** referência e ainda < `referência × multiplicadores[0]` → 1.º peixe.
   * Tier **k** (k ≥ 2): RMSSD atual ≥ `referência × multiplicadores[k - 2]` (ex.: ≥ 1,2× → 2.º peixe, …).
   * Tier máximo = `1 + length` (ex.: `[1.2, 1.5, 1.8]` → tier 4).
   */
  RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS: [1.2, 1.5, 1.8] as const,
  /**
   * Dificuldade médio: fração **abaixo** do valor de calibração (RMSSD) a partir da qual o peixe pode sair.
   * Piso de retenção = calibração × (1 − este valor). Ex.: 0,2 = 20% abaixo da calibração.
   */
  MEDIUM_RMSSD_LOSS_MARGIN_BELOW_CALIBRATION: 0.2
} as const;

/** Tier máximo de `rmssdTier` com a config atual (1 + quantidade de multiplicadores). */
export const getMaxRmssdTier = (): number => VFC_CONFIG.RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS.length + 1;
