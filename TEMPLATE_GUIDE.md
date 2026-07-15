# 🎮 Guia de Reutilização - Template para Jogos Terapêuticos

**Como reutilizar.** Passo a passo para criar um novo jogo terapêutico (Keep Forest, Keep Space, etc.) a partir deste template. Ao editar código, siga [CONVENTIONS.md](CONVENTIONS.md).

## 🎯 Filosofia do Template

Este projeto é estruturado em **duas camadas**:

1. **Core (Imutável)**: Lógica de VFC, BLE, Game Loop, Audio
2. **Theme (Customizável)**: Assets, constantes, nomes específicos do jogo

Para criar um novo jogo, você **NÃO mexe** na camada Core, apenas customiza a Theme.

### Diretriz da empresa para novos projetos

Para a linha de jogos Keep, o padrão técnico do Keep Ocean deve ser mantido nos próximos projetos (exceto a camada de estilização, que pode variar por necessidade visual do jogo).

- Stack-base esperada: **TypeScript + React + Vite**.
- Mesma separação arquitetural: serviços para lógica de jogo/biofeedback, hooks como ponte, componentes para UI.
- Convenções do repositório continuam obrigatórias: ver [CONVENTIONS.md](CONVENTIONS.md).

Antes de iniciar um jogo do zero, avaliar se o template atual já atende o novo escopo com customização.

---

## 📋 Checklist Completo

Este checklist assume que o time já recebeu um GDD fechado com as artes-base do novo jogo.

A ordem recomendada é:

1. Entender o GDD e validar o pacote de imagens e sons.
2. Fazer o planejamento técnico de integração dos assets já prontos.
3. Adicionar os assets no template e testar cada integração.
4. Conferir se tudo está completo no código e no navegador.

### ✅ Fase 0: Entendimento do GDD e inventário de assets (antes do planejamento)

```
[ ] Conferir tema, público e objetivo terapêutico do jogo no GDD
[ ] Validar a versão estática do personagem para menu e favicon
[ ] Validar a presença e a quantidade de companheiros previstas no GDD
[ ] Verificar backgrounds e separar camadas quando houver movimento ou parallax
[ ] Confirmar se o GDD já entrega as artes finais ou só referências
[ ] Validar spritesheets, ícones, efeitos e variações por estado
[ ] Revisar a lista de sons e músicas prevista no GDD
```

### ✅ Fase 1: Planejamento técnico da integração

```
[ ] Mapear como o tema do GDD entra no template
[ ] Validar qual imagem vira ícone estático e qual vai para o canvas
[ ] Validar quantos companheiros entram na configuração final
[ ] Validar a divisão de backgrounds em camadas, se houver movimento
[ ] Validar a paleta de cores que será aplicada no template
```

### ✅ Fase 2: Assets no template e validação

Nesta fase, o objetivo é adicionar ao template o que já veio pronto no GDD e validar se cada asset funciona como esperado.

Se o cenário tiver movimento, não trate como um fundo único: separe em camadas individuais dentro de [public/assets/images/background/](public/assets/images/background/) e reflita isso em `BACKGROUND_LAYERS`.

```
[ ] Adicionar sprites do personagem principal ao template
[ ] Adicionar companheiros ao template
[ ] Adicionar backgrounds estáticos ou camadas separadas para parallax
[ ] Adicionar sprite de partícula/efeito (bolha, folha, estrela, etc)
[ ] Adicionar 2 sprites de indicador (on/off para aura)
[ ] (Opcional) Adicionar 2 sprites de respiração visual (INHALE/EXHALE para jogos top-down)
[ ] Adicionar músicas de fundo previstas no GDD
[ ] Adicionar efeitos sonoros previstos no GDD (mínimo: particle, in, out)
[ ] Testar se cada imagem carrega sem erro e na proporção correta
[ ] Testar se cada som toca e se os caminhos batem com o template
[ ] Conferir se os nomes dos arquivos batem com as referências do GDD e de `constants.ts`
```

### ✅ Fase 3: Código (30-60 min)

```
[ ] Atualizar index.html: <title> e favicon com a mesma imagem estática que `GAME_ASSETS.MAIN_CHARACTER_ICON` (ver Passo 0)
[ ] Atualizar GAME_THEME em constants.ts
[ ] Definir `GAME_PUBLIC_URL_DEFAULT` e revisar `PORTAL_RETURN_URL` em constants.ts (URL do Amplify / domínio do jogo + portal — ver [Portal, URL de retorno e domínio do deploy](#portal-url-de-retorno-e-dominio-do-deploy-iframe))
[ ] Escolher MENU_THEME em constants.ts ('game' = cores do projeto, 'light' = menu claro padrão)
[ ] (Opcional) Definir ALLOW_BRIGHTNESS_CONTROL, BRIGHTNESS_CONFIG e ALLOW_THEME_SWITCH em constants.ts — slider de brilho (acessibilidade) e botão de alternar tema dos menus
[ ] Atualizar COMPANIONS_CONFIG em constants.ts
[ ] Atualizar AUDIO_CONFIG em constants.ts (incl. `END_GAME_AUDIO` se o jogo deve tocar som ao encerrar a partida)
[ ] Atualizar BACKGROUND_LAYERS em constants.ts
[ ] Atualizar GAME_ASSETS em constants.ts
[ ] (Opcional) Ajustar PLAYER_CONFIG, PARTICLES_CONFIG e VISUAL_BREATH_INDICATOR_CONFIG em constants.ts
[ ] Atualizar cores do projeto em styles/themeGame.ts (seção "Cores do projeto")
[ ] Conferir se `GAME_ASSETS.COMPANIONS.length` bate com `COMPANIONS_CONFIG.length`
[ ] Se houver **mais companheiros** do que **níveis** de RMSSD tier: acrescentar multiplicadores em `VFC_CONFIG.RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS` (e alinhar `requiredIndicators` ≤ `getMaxRmssdTier()`) — ver **Passo 2 → 2.1**
[ ] Ícones do indicador na **StatusBar**: `INDICATOR_CONFIG.HUD_ICON_SLOT_COUNT` (independente do número de peixes). **Se mudar esse valor**, rever o **layout** em `src/components/StatusBar/styles.tsx` — ver **Passo 1 → INDICATOR_CONFIG**
[ ] Se alterar **`VFC_CONFIG`** (baseline, janela, intervalos): alinhar **README**, **ARCHITECTURE_MAP** (tabela «Parâmetros VFC») e **TEMPLATE_GUIDE** (resumo no Passo 1) para não ficarem números desatualizados
[ ] Garantir que o novo repositório no GitHub da Self foi criado com este padrão técnico (TypeScript + React + Vite)
[ ] Alinhar com o Vitor a conexão da branch `main` ao novo domínio para deploy automático a partir da `main`
[ ] Testar no navegador
[ ] Se top-down: JSON do mapa em `public/data/maps/` + `EXPLORATION_ACTIVE_MAP_URL` (ver secção abaixo)
[ ] Se top-down com neblina: `EXPLORATION_FOG_ENABLED` + `farm_playtest_fog.json` (só jogos que precisem)
```

---

## Jogo top-down com tilemap

Use esta secção quando o GDD for **exploração 2D** (personagem em grelha), não o modo oceano com parallax.

### Respiração estática (antes da exploração)

Antes do top-down, o jogador respira por **N segundos** com o fazendeiro centralizado e o spritesheet vertical animando frame-a-frame ao ritmo do menu (`cyclesPerMinute` + `BreathingPatternId`). Cada ciclo respiratório completo varre **todos** os frames do PNG `farmerfull_breathing.png` em sequência (`0..N-1`) e reinicia no próximo ciclo — mesmo padrão dos spritesheets de walk do top-down. Depois um fade preto curto leva direto à exploração.

1. Sprites: substitua os PNGs em `public/assets/images/mainCharacter/static/` **ou** mude os caminhos em `STATIC_BREATHING_CONFIG.IMAGES` em [src/utils/constants.ts](src/utils/constants.ts):
   - `IMAGES.IDLE` (`farmerfull_idle.png`) — pose **estática neutra** (1 frame). Usada por `drawStaticBreathingIdle` em pause/welcome (não na fase ativa).
   - `IMAGES.BREATHING_SHEET` (`farmerfull_breathing.png`) — **spritesheet vertical** com `BREATHING_FRAMES` quadros empilhados de cima para baixo. Faz a animação inteira (subida do peito → topo → descida → fim) numa sequência só; o código só varre na velocidade certa. **Importante:** desenhe um **loop perfeito** (último frame ≈ primeiro frame = peito vazio). O modo de respiração com intervalos depende disso para "segurar" no frame 0 ao final da expiração sem flicker. Se trocar o sheet por um que não feche o loop, ajuste o hold em `getIntervalBreathingState` (caso `bottom`) de `cycleProgress01: 0` para `cycleProgress01: 1` em [src/services/game/breathingRhythmService.ts](src/services/game/breathingRhythmService.ts).
2. Ajuste fácil em `STATIC_BREATHING_CONFIG`:
   - `BREATHING_FRAMES` — **número de frames empilhados** no `BREATHING_SHEET`. Atualize toda vez que trocar o PNG (mesma ideia de `FARMER_TOPDOWN_CONFIG.WALK_FRAMES`). Mais frames = animação mais fluida.
   - `BACKGROUND_COLOR` — cor da tela atrás do personagem.
   - `SCREEN_HEIGHT_FRACTION` — quanto da altura **um frame** ocupa (`0.6` = 60% da viewport). O aspect ratio do frame é preservado.
   - `PLAY_SFX: false` — desliga inhale/exhale durante a fase estática.
3. Duração: vem do slider **Tempo de respiração** no menu (faixa 60–600s, ajustável em `GAME_CONFIG.MIN/MAX_SESSION_TIME`). Sem mexer em código, o usuário escolhe respirar entre 1 e 10 minutos.
4. Fade entre cena estática e exploração: `STATIC_BREATHING_TRANSITION_CONFIG` controla `FADE_OUT_MS`, `FADE_IN_MS` e `FADE_COLOR`. `FADE_OUT_MS: 0` desliga o efeito (corte seco).

Não há nada para configurar se for usar o ritmo padrão — o serviço puxa `cyclesPerMinute` e `BreathingPatternId` que já existem no menu. Para jogos do template **sem** fase estática, basta nunca entrar em `gameplayMode === 'static'` (ou desligar `FEATURE_FLAGS.TOPDOWN_PLAYTEST_ENABLED`).

#### Barra Guia de Respiração (placeholder com slot para arte)

A `BreathingGuideBar` é uma **barra vertical em DOM** na fase estática **e** na exploração top-down, sincronizada com o ritmo da sessão (`computeStaticBreathingFrame`). Na exploração usa tamanho menor (`EXPLORATION_SIZE`) para não tapar o mapa; some durante a intro da abelha.

Tudo controlado por `BREATHING_GUIDE_BAR_CONFIG` em [src/utils/constants.ts](src/utils/constants.ts):

- `ENABLED: false` — desliga a barra (componente não renderiza).
- `POSITION` — `'left'`, `'right'` (default) ou `'center'`.
- `BREATHING_SIZE` — `{ WIDTH_PX, HEIGHT_FRACTION }` na fase estática (respiração centralizada).
- `EXPLORATION_SIZE` — `{ WIDTH_PX, HEIGHT_FRACTION }` na exploração (normalmente menor que `BREATHING_SIZE`).
- `MARGIN_PX` — afastamento da borda.
- `FILL_COLOR` / `FILL_AREA` — cor e área interna do preenchimento dentro do frame.
- `PLACEHOLDER_COLORS` — cores do trilho e do indicador enquanto não há arte.
- `IMAGES.TRACK` / `IMAGES.INDICATOR` — URLs para trocar placeholder por arte.

Detalhe técnico: [ARCHITECTURE_MAP.md — Barra Guia de Respiração](ARCHITECTURE_MAP.md#barra-guia-de-respiração-estática--exploração).

#### HUD de variabilidade (estrelas na StatusBar)

No top-down, o nível de variabilidade biofeedback aparece nas **estrelas** do painel central da `StatusBar` (`INDICATOR_CONFIG`), igual ao jogo da baleia — não há medidor separado.

- `HUD_ICON_SLOT_COUNT` — quantos ícones o HUD desenha (omissão **4**); independente de `COMPANIONS_CONFIG.length`.
- `IMAGES.ON` / `IMAGES.OFF` — assets dos slots (ex.: `apple_on.jpeg` / `apple_off.jpeg`).
- O preenchimento segue `companionHudConcurrentActive` (companheiros em `IN` ou `ENTERING`), atualizado por `updateCompanions` no `gameCanvas` também nas fases estática e exploração, mesmo quando `LEGACY_OCEAN_GAMEPLAY_ENABLED` está `false` (sem desenhar peixes no canvas).

Ver **Passo 1 → INDICATOR_CONFIG** e [ARCHITECTURE_MAP.md — Indicador](ARCHITECTURE_MAP.md#indicador).

#### Intro do tutorial (abelha + balão de fala)

Sempre que o jogador entra na fase de exploração (em **toda partida**), a `ExplorationIntro` abre: backdrop escuro, abelha entra voando pela direita, balão de fala no centro, jogador clica "Continuar", abelha sai pelo canto superior esquerdo e o input destrava. O texto do balão usa as direções do corredor gerado proceduralmente em formato **narrativo curto, sem contagem** (ex.: `"Olá! Vá para cima, depois para a esquerda, depois para cima para encontrar o baú!"`). Mensagem proporcional ao `MAX_INSTRUCTIONS` da dificuldade (até 4/5/6 instruções).

Tudo em `EXPLORATION_INTRO_CONFIG` em [src/utils/constants.ts](src/utils/constants.ts):

- `ENABLED: false` — desliga a intro (o overlay não monta).
- `BACKDROP_OPACITY` — opacidade do escurecimento (0..1).
- `BEE.IMAGE` + `BEE.FRAMES` + `BEE.WING_FPS` — reaproveita o spritesheet vertical da abelha; trocar PNG ↔ atualizar `FRAMES`.
- `BEE.SCREEN_HEIGHT_FRACTION` — tamanho da abelha (`0.18` = 18% da altura do viewport).
- `BEE.ENTRY_FROM` / `IDLE_AT` / `EXIT_TO` — posições em fração (`xFrac`, `yFrac`). Default: entra pela direita (`1.15`), pausa no centro (`0.5, 0.5`), sai para o canto superior esquerdo (`-0.15, 0.05`).
- `BEE.ENTRY_DURATION_MS` / `EXIT_DURATION_MS` — duração das animações.
- `BEE.EASING` — `'easeInOutQuad'` (default) ou `'linear'`.
- `BEE.FACES_LEFT_BY_DEFAULT: false` — para arte right-facing.
- `SPEECH_BUBBLE.OFFSET`, `PLACEMENT`, `CONTINUE_LABEL` — posição relativa à abelha e texto do botão.
- `MESSAGE_TEMPLATE` — string com `{directions}`; substituído em runtime por `formatPathDirections(pathDirections)`.
- `FALLBACK_MESSAGE` — usado quando o mapa é estático (não há `pathDirections`).

Para reaproveitar em **outros tutoriais** (ex.: dicas dentro da exploração), criar uma nova `TutorialSequence` (tipo em [src/types/tutorial.ts](src/types/tutorial.ts)) e montar um overlay próprio usando `SpeechBubble` / `TutorialBee` / `useExplorationIntro` — todos foram desacoplados.

**Z-index dos overlays:** usar `src/utils/zIndex.ts` em qualquer componente novo de UI. Evitar números soltos em `z-index` para não quebrar a ordem entre HUD, tutorial, vitória e modais.

Detalhe técnico: [ARCHITECTURE_MAP.md — Intro do tutorial](ARCHITECTURE_MAP.md#intro-do-tutorial-abelha--balão-de-fala).

### Flags e personagem

Em `src/utils/constants.ts`:

- `FEATURE_FLAGS.LEGACY_OCEAN_GAMEPLAY_ENABLED: false`
- `FEATURE_FLAGS.TOPDOWN_PLAYTEST_ENABLED: true`
- `FARMER_TOPDOWN_ASSETS` / `FARMER_TOPDOWN_CONFIG` (sprites, velocidade, escala)

### Novo mapa (só JSON — não mexer no serviço)

1. Copiar `public/data/maps/farm_playtest.json` → `public/data/maps/meu_jogo.json`
2. Em `tiles`, definir cada tipo (ex.: Grama, Terra, Arvores):

| Campo | Obrigatório | Notas |
|-------|-------------|-------|
| `color` | sim | Sempre desenhada (`fillRect`) |
| `blocksMovement` | sim | `true` = árvore/parede |
| `image` | não | PNG em `public/assets/tiles/`; desenha **por cima** da cor |
| `footstep` | não | `src`, `volume`, `minIntervalMs` |

3. Em `layout`, matriz de palavras-chave (ex.: 10×10)
4. `EXPLORATION_ACTIVE_MAP_URL = '/data/maps/meu_jogo.json'`
5. Menu → **Iniciar** (fase estática, depois exploração)

Ordem recomendada: (1) layout só com cores, (2) testar colisão, (3) adicionar `image`, (4) sons de passo.

Detalhe técnico: [ARCHITECTURE_MAP.md — Tilemap](ARCHITECTURE_MAP.md#tilemap-exploração-top-down).

### Mapa procedural (opcional — por dificuldade)

Em vez de um JSON fixo, o jogo pode **gerar o `layout` + `spawn` + `chest_position` + `pathDirections`** quando a sessão começa. O `tiles` (cores, imagens, sons de passo) continua vindo do JSON base. Os três modos (**Fácil / Médio / Difícil**) usam o **mesmo gerador** — só os parâmetros mudam. O gerador aplica regras "no-touch" para impedir áreas grandes 2×2 e tem um pós-validador (BFS + ratio) que regera o mapa se a tentativa não passar.

1. Em `constants.ts`, ligar a flag para cada dificuldade desejada:
   ```ts
   EXPLORATION_MAP_GENERATION_CONFIG.USE_GENERATOR = {
     easy: true,
     medium: true,
     hard: true,
   };
   ```
   Pôr `false` em qualquer um faz essa dificuldade cair de volta no `loadTileMap` (JSON estático de `EXPLORATION_ACTIVE_MAP_URL`).
2. Ajustar os blocos `EASY` / `MEDIUM` / `HARD`. Parâmetros que **diferenciam dificuldade**:
   - `MIN_STRAIGHT_STEPS` — passos retos antes de poder virar (3 = caminho "limpo", 1 = vira a cada passo).
   - `FORCE_DIRECT_AFTER_ITERATIONS` / `DIRECT_RADIUS` — quando o corredor "desiste" e vai direto ao baú. Hard usa valores mais altos para manter a sinuosidade até o fim.
   - `MAX_INSTRUCTIONS` — cap absoluto de instruções no texto da abelha.
   - `MAX_STRAIGHT_SEGMENT` — teto de passos na mesma direção (5 / 4 / 3).
   - `RECENT_VISIT_WINDOW` — evita revisitar células recentes do corredor (anti-loop).
   - `CHEST_MIN_DISTANCE_FROM_SPAWN` — baú longe do spawn.
   - `FAKE_BRANCH_COUNT` / `MIN/MAX_LENGTH` / `MIN_DISTANCE` — ramos falsos curtos nas encruzilhadas. `0` desliga (Fácil).
   - `PATH_RATIO_RANGE` — faixa aceitável de `PATH / interior`. Mapas fora são descartados pelo pós-validador.
   - `MAX_REGEN_ATTEMPTS` — tentativas máximas antes de aceitar a melhor.
3. O JSON base (`EXPLORATION_ACTIVE_MAP_URL`) continua a ser usado como **fonte das definições de tile** — não precisa de ser tocado.
4. A cada início de partida o `gameCanvas` bumpa um token de regeneração, então sessões consecutivas na **mesma** dificuldade geram mapas diferentes. Para playtest reprodutível, passar `seed` ao construir um `ProceduralMapGenerationConfig` próprio.

**Configuração padrão do template:**

| Dificuldade | `MIN_STRAIGHT` | `MAX_STRAIGHT` | `MAX_INSTRUCTIONS` | `FAKE_BRANCH` | Sensação |
| ----------- | -------------- | -------------- | ------------------ | ------------- | -------- |
| **Fácil**   | 3 | 5 | 4 | 0 | Retas moderadas, sem becos |
| **Médio**   | 2 | 4 | 5 | 2 | Retas + curvas equilibradas |
| **Difícil** | 1 | 3 | 6 | 3 | Mais curvas, ainda legível |

Garantias do gerador:
- O corredor principal **não se cruza consigo mesmo** e **não abre blocos 2×2** (regra no-touch).
- Ramos falsos só aparecem **nas encruzilhadas** do corredor (continuar reto ou oposto da virada), são **curtos** (1–2) e **nunca** se fundem entre si nem com o corredor (anti-fusão); nunca tocam o baú nem a borda.
- O mapa final **sempre tem caminho válido** spawn → baú (BFS no pós-validador; se não tiver, regera).
- O **fechamento** do corredor é em **L** (no máximo 1 virada extra) — sem escada.
- Sem revisita de células no corredor principal; sem retas acima de `MAX_STRAIGHT_SEGMENT`; sem ciclos de 4 passos.
- `MAX_INSTRUCTIONS` é cap absoluto para o texto da abelha.
- A **sequência de direções** do corredor principal vai no `GeneratedMap.pathDirections` e é consumida pela intro do tutorial via `formatPathDirections` em formato narrativo.

Detalhe técnico: [ARCHITECTURE_MAP.md — Geração procedural](ARCHITECTURE_MAP.md#geração-procedural-de-mapa-opcional).

### Neblina (opcional — só se o GDD pedir)

**Não** faz parte do JSON do tilemap. Outros jogos do template deixam `FEATURE_FLAGS.EXPLORATION_FOG_ENABLED: false`.

1. `EXPLORATION_FOG_ENABLED: true`
2. Copiar `public/data/maps/farm_playtest_fog.json` e ajustar `color`, `spawnRevealRadius`, `chestRevealRadius`, `walkRevealRadius`
3. Neblina cobre o mapa; ao **caminhar** para uma célula, ela (e o quadrado `walkRevealRadius` ao redor) fica revelada (spawn já visível no início)

Detalhe: [ARCHITECTURE_MAP.md — Neblina](ARCHITECTURE_MAP.md#neblina-opcional).

**Pop-out:** ao descobrir uma célula, a neblina anima (cresce e encolhe a 0) antes de sumir — `EXPLORATION_FOG_CONFIG.POP_DURATION_MS` / `POP_PEAK_SCALE`.

**Baú oculto até explorar (padrão):** `chestRevealRadius: 0` mantém o baú sob névoa até o jogador revelar a célula. O sprite é desenhado após a camada de névoa. Para revelar o baú no início (debug/acessível), use `chestRevealRadius > 0`.

**Tamanho da área descoberta a cada passo:** `walkRevealRadius` no JSON da neblina (fallback `EXPLORATION_FOG_CONFIG.WALK_REVEAL_RADIUS`). Raio Chebyshev — `0` = só o tile pisado, `1` = 3x3 (1 tile em cada direção, padrão), `2` = 5x5, etc. Quanto maior, mais "lanterna" o jogador parece carregar.

### Baú e vitória (objetivo do mapa)

1. No JSON do mapa: `"chest_position": { "col": 5, "row": 1 }` (mesma grelha que `layout`).
2. Ajustar mensagem em `EXPLORATION_WIN_CONFIG.MESSAGE`.
3. (Opcional) PNG do baú em `EXPLORATION_CHEST_CONFIG.IMAGE`.
4. Ao pisar a célula do baú → overlay de vitória (não usa o `GameOver` completo do oceano).

Detalhe: [ARCHITECTURE_MAP.md — Baú e vitória](ARCHITECTURE_MAP.md#baú-e-vitória-exploração).

---

## 🛠️ Passo a Passo Detalhado

### **Passo 0: Ícone da guia, título e imagem estática do personagem**

No [index.html](index.html) na raiz do projeto, ajuste para o novo jogo:

1. **`<title>`** – Nome que aparece na **aba do navegador** (ex.: "Jogo da Baleia", "Keep Forest").
2. **`<link rel="icon">`** – **Favicon** da guia. Deve apontar para o **mesmo PNG estático** usado no menu (aba **Modo**), definido em `GAME_ASSETS.MAIN_CHARACTER_ICON` em [constants.ts](src/utils/constants.ts).

**Imagem estática do personagem (recomendado no template):**

- Use **um único PNG** com **um só quadro** do personagem (não use a spritesheet em faixa: no menu apareceria a tira inteira).
- O jogo anima o personagem no canvas com `MAIN_CHARACTER_SPRITESHEET`; o menu e o favicon usam `MAIN_CHARACTER_ICON`.
- Caminho sugerido: `public/assets/images/mainCharacter/` (ex.: `whaleIcon.png` no Jogo da Baleia).

**Exemplo (Jogo da Baleia):**

```html
<link rel="icon" type="image/png" href="/assets/images/mainCharacter/whaleIcon.png" /> <title>Jogo da Baleia</title>
```

**Exemplo (Keep Forest):**

```html
<link rel="icon" type="image/png" href="/assets/images/mainCharacter/seuIcone.png" /> <title>Keep Forest</title>
```

No Vite, ficheiros em `public/` são servidos na raiz: o `href` começa por `/` (ex.: `/assets/images/mainCharacter/whaleIcon.png`).

---

### **Passo 1: Configurar o Tema em `constants.ts`**

Abra [src/utils/constants.ts](src/utils/constants.ts) e edite as seções principais:

**GAME_THEME (nome + tipo de partícula):**

```typescript
export const GAME_THEME = {
  NAME: 'Keep Forest',
  MAIN_CHARACTER: 'Veado',
  PARTICLE: 'Folhas'
} as const;
```

**INDICATOR_CONFIG (customizar ou desabilitar indicadores na StatusBar):**

O número de ícones (ex.: estrelas) **não** segue automaticamente `COMPANIONS_CONFIG.length`. Usa **`HUD_ICON_SLOT_COUNT`**: quantas posições o HUD desenha; o estado ON/OFF continua ligado à contagem de companheiros ativos exposta pelo motor (pode haver mais peixes no jogo do que ícones no HUD).

```typescript
export const INDICATOR_CONFIG = {
  ENABLED: true,
  NAME: 'Maçã',
  HUD_ICON_SLOT_COUNT: 4,
  IMAGES: {
    OFF: '/assets/images/effects/apple_off.png',
    ON: '/assets/images/effects/apple_on.png'
  }
} as const;
```

**⚠️ Layout da StatusBar:** `HUD_ICON_SLOT_COUNT` altera quantos `<img>` cabe no painel central. Se **aumentar** ou **diminuir** esse número, ajuste o CSS em [`src/components/StatusBar/styles.tsx`](src/components/StatusBar/styles.tsx) para o painel continuar equilibrado (por exemplo `CenterPanel` — `min-width`, `max-width`, `gap`/`padding`; `IndicatorHudIconsRow` — `gap`; `IndicatorHudIcon` — tamanho). Sem esse ajuste, ícones podem **apertar**, **transbordar** ou **ficar com espaço a mais** em relação ao valor RMSSD e ao círculo de respiração.

```typescript
export const INDICATOR_CONFIG = {
  ENABLED: false,
  NAME: '',
  HUD_ICON_SLOT_COUNT: 4,
  IMAGES: { OFF: '', ON: '' }
} as const;
```

**VFC_CONFIG (baseline, janela RMSSD, tier):** definido em `src/utils/constants.ts`. A **fonte da verdade** numérica é sempre esse ficheiro; em [ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md#parâmetros-vfc-constantsts) há uma tabela com os **valores omissão do template**. Resumo do estado atual do repo: `BASELINE_SAMPLES` **20**, `BASELINE_IGNORE_SAMPLES` **5**, `METRICS_INTERVAL_MS` **1000** (1 s), `WINDOW_BEATS` **30**, `ANOMALY_THRESHOLD` **0,5** (50%), `RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS` **`[1.2, 1.5, 1.8]`** (tier máximo **4**). Se alterar `BASELINE_SAMPLES` ou `METRICS_INTERVAL_MS`, atualize textos/UX que falem em “quantas amostras” ou “a cada quanto tempo” recalcula o RMSSD.

**VISUAL_BREATH_INDICATOR_CONFIG (indicadores visuais de respiração para jogo top-down):**

Use quando o personagem respira no eixo vertical (sobe = INHALE, desce = EXHALE), como a baleia. **Valores omissão no template (Ocean)** — confira sempre `constants.ts`:

```typescript
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

export const GAME_ASSETS = {
  // ...outros assets
  VISUAL_BREATH_INDICATORS_TOP_DOWN: {
    INHALE: '/assets/images/effects/inhale_spiral.png',
    EXHALE: '/assets/images/effects/exhale_bubbles.png'
  }
} as const;
```

Como ajustar:

- `ANIMATION_FPS`: rapidez da animação (frames por segundo).
- `WIDTH_RATIO`: largura/tamanho do indicador em relação à largura do personagem.
- `INHALE_OFFSET_Y` e `EXHALE_OFFSET_Y`: deslocamento vertical do indicador para cada fase.

**COMPANIONS_CONFIG (quantidade N):** o tamanho do array define quantos companheiros existem (pode ser **0**). Ver secção **2.1** — **não basta** aumentar só o array e os assets se N for **> 4** ou se `requiredIndicators` não bater com o **RMSSD tier** máximo do VFC.

```typescript
export const COMPANIONS_CONFIG = [];
```

**MENU_THEME (tema dos menus: calibração, inicial, pause, encerramento):**

- **`'game'`**: Menus usam as **cores do projeto** definidas em `styles/themeGame.ts` (e variáveis de sistema em `styles/global.tsx`). Ideal quando você quer que todos os menus sigam a identidade visual do jogo.
- **`'light'`**: Menu **padrão claro** (fundo branco/cinza, destaques em amarelo). Funciona igual para qualquer jogo, sem precisar alterar cores.

```typescript
// Em src/utils/constants.ts
export type MenuTheme = 'game' | 'light';
export const MENU_THEME: MenuTheme = 'game'; // ou 'light' para menu claro
```

**Brilho (acessibilidade) e alternar tema (caso o template permita):**

O template pode expor duas opções ao usuário, controladas por constantes:

| Constante                      | Efeito                                                                                                                                                                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ALLOW_BRIGHTNESS_CONTROL`** | Se `true`, o **slider de brilho** aparece no painel de acessibilidade dos menus. Ajusta o filtro aplicado ao canvas (pensado para TEA). Intervalo/passo vêm de `BRIGHTNESS_CONFIG`; a escolha é salva em `localStorage` (`BRIGHTNESS_STORAGE_KEY`). |
| **`ALLOW_THEME_SWITCH`**       | Se `true`, o **botão de alternar tema** (ex.: ícone de sol) aparece no menu. O usuário pode trocar entre tema do jogo e menu claro; a escolha é salva em `localStorage` (`THEME_STORAGE_KEY`).                                                      |

Para o seu jogo: deixe `true` para oferecer as opções, ou `false` para esconder. O tema padrão (quando não há valor salvo) é `MENU_THEME`.

```typescript
export const ALLOW_BRIGHTNESS_CONTROL = true; // exibir slider de brilho (acessibilidade)
export const ALLOW_THEME_SWITCH = true; // exibir botão de alternar tema (sol)

export const BRIGHTNESS_CONFIG = {
  MIN: 50, // porcentagem mínima (canvas mais escuro)
  MAX: 100, // porcentagem máxima (brilho normal)
  DEFAULT: 100, // valor inicial se não houver preferência salva
  STEP: 5 // passo do slider
} as const;
```

### **Portal, URL de retorno e domínio do deploy (iframe)**

O jogo integra-se com um **portal** (página que embute o iframe ou redireciona para a URL do jogo). Em **produção**, `src/security/iframeDomainGuard.ts` só permite:

- **localhost** (desenvolvimento);
- **iframe** cuja origem do documento pai coincide com **`PORTAL_ORIGIN`** (derivada de `PORTAL_RETURN_URL`);
- **janela top-level** na origem **`GAME_DEPLOY_ORIGIN`** (derivada da URL pública do deploy).

**Personalização por jogo (começar por aqui):** em [src/utils/constants.ts](src/utils/constants.ts)

| Constante                     | Função                                                                                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`PORTAL_RETURN_URL`**       | URL do portal (ex.: página “voltar”); a **origem** vira `PORTAL_ORIGIN` para validar o iframe. Sobrescrita opcional: `VITE_PORTAL_RETURN_URL` no `.env`.                               |
| **`GAME_PUBLIC_URL_DEFAULT`** | URL base do **seu** jogo em produção (ex.: domínio Amplify). Cada fork do template deve apontar para o link oficial desse jogo. Sobrescrita opcional: `VITE_GAME_PUBLIC_URL` no build. |

Constantes derivadas: **`PORTAL_ORIGIN`**, **`GAME_DEPLOY_ORIGIN`** — não é necessário editá-las à mão; ajuste as URLs acima (ou as variáveis de ambiente).

Para **vários domínios** (preview Amplify, homologação), use no `.env` **`VITE_ALLOWED_IFRAME_ORIGINS`** e **`VITE_ALLOWED_GAME_ORIGINS`** (listas separadas por vírgula). Desligar o guard: **`VITE_ENFORCE_IFRAME_DOMAIN=false`**. Resumo das variáveis: secção **Domínio, portal e iframe** no [README.md](README.md).

### **Passo obrigatório de infraestrutura (novo repositório)**

Assim que o repositório do novo jogo for criado no GitHub da Self:

1. Alinhar com o Vitor a conexão da branch `main` ao novo domínio do jogo.
2. Confirmar que os deploys automáticos estão publicados a partir da `main`.

Sem esse passo, o fluxo de publicação automática pode ficar incompleto mesmo com o código do jogo pronto.

---

### **Passo 2: Atualizar Arrays em `constants.ts`**

#### 2.1 COMPANIONS_CONFIG (⚠️ MANUAL - Leia com atenção!)

**IMPORTANTE:** `COMPANIONS_CONFIG` é **totalmente manual**. Cada companheiro é único e precisa ser configurado individualmente.

**O que NÃO é automático:**

- `width`, `height`, `frames` - variam por sprite
- `speed` - cada amigo tem velocidade diferente
- `horizontalPos`, `verticalPos` - posição de cada um na tela
- `scale` - tamanho visual customizado

**O que É automático (você controla):**

- `entryDelay` - use percentual da sessão (ex.: `0.2`, `0.4`, `0.6`...) para modo sem sensor
- `requiredIndicators` — com **sensor**, a condição é `rmssdTier >= requiredIndicators`; o tier vem de `computeRmssdTier` e o máximo é **`getMaxRmssdTier()`** (derivado de `VFC_CONFIG.RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS`; p.ex. três multiplicadores → tier máximo **4**). Use `requiredIndicators` entre **1** e esse máximo por companheiro (ou acrescente multiplicadores no array)
- `id` - basta nomear `companion1`, `companion2`, etc

**Como `entryDelay` funciona hoje:**

- **Sem sensor:** `entryDelay` é tratado como percentual do tempo da sessão e convertido para ms pelo `gameEngineService`.
- **Com sensor:** a entrada depende do **RMSSD tier** (`requiredIndicators` vs `rmssdTier`); o `entryDelay` percentual não dirige a progressão.
- **Dificuldade do menu** (`MenuDifficultyId` em `constants.ts`): em **Fácil/Médio** o tier usa o RMSSD de **calibração** como referência fixa na partida; em **Difícil** usa a **mediana deslizante**. A **saída** dos peixes com biofeedback segue `companionDifficultyService` (Fácil sem perda por tier; Médio com piso em % da calibração `MEDIUM_RMSSD_LOSS_MARGIN_BELOW_CALIBRATION`; Difícil com retenção alinhada ao tier). Sem sensor ou em modo automático, isto **não** se aplica.
- **Sessão sem limite:** o engine usa fallback de delays fixos para não travar a progressão.

**Exemplo com 2 companheiros (campos atuais do template):**

```typescript
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
    exitSpeed: 2.0,
    brakingForce: 0.01,
    minStayTime: 5000,
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
    exitSpeed: 2.0,
    brakingForce: 0.01,
    minStayTime: 5000,
    minCooldownTime: 5000,
    requiredIndicators: 2
  }
] as const;

export const GAME_ASSETS = {
  // ... MAIN_CHARACTER_ICON, MAIN_CHARACTER_SPRITESHEET, PARTICLE, BUTTONS, WELCOME_ICONS ...
  COMPANIONS: ['/assets/images/companions/companion_1.png', '/assets/images/companions/companion_2.png']
} as const;
```

**⚠️ REGRA OBRIGATÓRIA:** `GAME_ASSETS.COMPANIONS.length` = `COMPANIONS_CONFIG.length`

- Se adicionar 10 em `COMPANIONS_CONFIG`, adicione 10 imagens em `GAME_ASSETS.COMPANIONS`
- Sistema avisa no console se houver desacordo!

**Quantidade de companheiros ≠ só `COMPANIONS_CONFIG` + `GAME_ASSETS.COMPANIONS`**

O canvas (`useCompanions`) itera sobre o que está em `COMPANIONS_CONFIG`, mas **com sensor** cada peixe só entra se `rmssdTier >= requiredIndicators` (e regras de fila / baseline). O valor `rmssdTier` vem de `computeRmssdTier` em `src/services/vfc/VFCService.ts`, que lê **`VFC_CONFIG.RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS`** (por omissão três faixas acima da baseline → tier máximo **4**). Consequências:

| Objetivo                                | O que acontece se só alargares o array + assets                                                                                                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **N = 0**                               | Lista vazia: nenhum companheiro no canvas; ok. Na StatusBar, se `INDICATOR_CONFIG.ENABLED`, continuam a desenhar-se **`INDICATOR_CONFIG.HUD_ICON_SLOT_COUNT`** posições (todas inativas).                                                                                                                     |
| **Mais companheiros que o tier máximo** | Cada `requiredIndicators` tem de ser **≤ `getMaxRmssdTier()`**. Se o 5º peixe exige tier 5, acrescenta um multiplicador (ex. `2.0`) ao **fim** de `RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS` — **não** precisas editar o `if` em `VFCService`. |
| **N > 4 com tier já estendido**         | Alinha `GAME_ASSETS.COMPANIONS` e caps no motor: **`COMPANION_SLOT_COUNT`** (= `COMPANIONS_CONFIG.length`). Os **ícones** da StatusBar usam **`INDICATOR_CONFIG.HUD_ICON_SLOT_COUNT`** (omissão 4), **não** o número de peixes; mudar esse valor implica rever o layout (ver **Passo 1 → INDICATOR_CONFIG**).                                                                                                |

Resumo: **só aumentar `COMPANIONS_CONFIG` + imagens** sem alinhar **`requiredIndicators`** ao tier máximo **nem** alargar **`RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS`** faz com que peixes extra **nunca** entrem por biofeedback.

**Compatibilidade de biofeedback (importante):**

- O template de VFC exige **intervalos RR**.
- Se o sensor enviar apenas FC (BPM), a conexão BLE funciona, mas calibração de VFC e biofeedback não funcionam corretamente.

**Como distribuir `requiredIndicators` para N companheiros (com sensor):**

- O tier útil para “destravar” por nível vai de **1** até **`getMaxRmssdTier()`**, conforme `VFC_CONFIG.RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS`; veja `computeRmssdTier` e `ARCHITECTURE_MAP.md` (secção RMSSD tier).
- Progressão típica: **1 por companheiro** (1º exige tier ≥ 1, 2º ≥ 2, …) como no Ocean padrão, ou outra combinação **sempre ≤ 4** por companheiro, salvo extensão do VFC.

#### 2.2 BACKGROUND_LAYERS

**Totalmente flexível!** Pode ser 1 imagem simples ou 15 camadas parallax:

**Exemplo com 1 imagem (sem parallax):**

```typescript
export const BACKGROUND_LAYERS = [{ id: 'background', src: '/assets/images/background/simple.png', speed: 0 }] as const;
```

**Exemplo com 3 camadas:**

```typescript
export const BACKGROUND_LAYERS = [
  { id: 'sky', src: '/assets/images/background/sky.png', speed: 0.3 },
  { id: 'mountains', src: '/assets/images/background/mountains.png', speed: 0.7 },
  { id: 'ground', src: '/assets/images/background/ground.png', speed: 1 }
] as const;
```

**Exemplo com 10 camadas (parallax complexo):**

```typescript
export const BACKGROUND_LAYERS = [
  { id: 'sky', src: '/assets/images/background/sky.png', speed: 0 },
  { id: 'clouds_far', src: '/assets/images/background/clouds_far.png', speed: 0.2 },
  { id: 'mountains', src: '/assets/images/background/mountains.png', speed: 0.4 },
  { id: 'trees_far', src: '/assets/images/background/trees_far.png', speed: 0.6 },
  { id: 'trees_mid', src: '/assets/images/background/trees_mid.png', speed: 0.8 },
  { id: 'grass', src: '/assets/images/background/grass.png', speed: 1 },
  { id: 'flowers_1', src: '/assets/images/background/flowers_1.png', speed: 1.2 },
  { id: 'flowers_2', src: '/assets/images/background/flowers_2.png', speed: 1.3 },
  { id: 'fog', src: '/assets/images/background/fog.png', speed: 0.1 },
  { id: 'sun', src: '/assets/images/background/sun.png', speed: 0 }
] as const;
```

**Velocidades:**

- `0` = Estático (céu, sol, lua)
- `0.1-0.5` = Fundo distante (nuvens, montanhas)
- `1` = Velocidade base de movimento
- `1.2+` = Frente (grama, flores, objetos próximos)

#### 2.3 GAME_ASSETS.COMPANIONS

**Uma imagem por companheiro** — o tamanho do array tem de ser **igual** ao de `COMPANIONS_CONFIG`. Para **N > 4** com biofeedback, aplicam-se os mesmos limites da secção **2.1** (tier VFC e caps com `COMPANION_SLOT_COUNT` no motor). Os ícones do HUD na StatusBar seguem **`INDICATOR_CONFIG.HUD_ICON_SLOT_COUNT`** — não confundir com o número de peixes.

**2 companheiros:**

```typescript
COMPANIONS: ['/assets/images/companions/bird_1.png', '/assets/images/companions/bird_2.png'];
```

**Exemplo com 10 companheiros** (10 entradas em `COMPANIONS` e 10 em `COMPANIONS_CONFIG`; com **sensor** alinha `RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS` e `requiredIndicators` — ver **2.1**):

```typescript
COMPANIONS: [
  '/assets/images/companions/bird_1.png',
  '/assets/images/companions/bird_2.png',
  '/assets/images/companions/bird_3.png',
  '/assets/images/companions/bird_4.png',
  '/assets/images/companions/butterfly_1.png',
  '/assets/images/companions/butterfly_2.png',
  '/assets/images/companions/squirrel_1.png',
  '/assets/images/companions/squirrel_2.png',
  '/assets/images/companions/rabbit_1.png',
  '/assets/images/companions/owl_1.png'
];
```

**Importante:** O tamanho do array `COMPANIONS` deve corresponder ao `COMPANIONS_CONFIG`!

#### 2.4 AUDIO_CONFIG

Atualize nomes e caminhos das músicas:

```typescript
export const AUDIO_CONFIG = {
  DEFAULT_MUSIC_VOLUME: 0.7,
  DEFAULT_SFX_VOLUME: 0.8,
  BREATH_MAX_GAIN: 0.6,
  BREATH_PEAK_RATIO: 0.4,
  BREATH_SYNC_TO_PHASE_DURATION: true,
  END_GAME_AUDIO: {
    ENABLED: true,
    VOLUME: 0.8
  },
  TRACKS: [
    { id: 'music1', name: 'Floresta Tranquila', src: '/assets/sounds/music1.mp3' },
    { id: 'music2', name: 'Pássaros Cantando', src: '/assets/sounds/music2.mp3' },
    { id: 'music3', name: 'Brisa Suave', src: '/assets/sounds/music3.mp3' },
    { id: 'music4', name: 'Aventura Verde', src: '/assets/sounds/music4.mp3' },
    { id: 'music5', name: 'Paz Natural', src: '/assets/sounds/music5.mp3' }
  ],
  SOUND_EFFECTS: {
    PARTICLE: '/assets/sounds/leaf.wav',
    LEVEL_COMPLETE: '/assets/sounds/level-complete.wav',
    IN: '/assets/sounds/in.wav',
    OUT: '/assets/sounds/out.wav',
    INHALE: '/assets/sounds/inhale.wav',
    EXHALE: '/assets/sounds/exhale.wav'
  }
} as const;
```

`BREATH_MAX_GAIN` e `BREATH_PEAK_RATIO` definem o envelope do som de respiração (subida/descida de volume) em cada meia-respiração. Com `BREATH_SYNC_TO_PHASE_DURATION: false`, `INHALE`/`EXHALE` tocam uma vez via `HTMLAudio` (ignoram a duração da fase).

`END_GAME_AUDIO` controla o som ao **fim da partida** (`SOUND_EFFECTS.LEVEL_COMPLETE`, disparado em `gameCanvas` quando o personagem sai da tela em `gameOver`):

- `ENABLED`: `true` para tocar o áudio de encerramento; `false` para silêncio (a música de fundo é interrompida na mesma).
- `VOLUME`: volume base do template (0–1), multiplicado pelo volume de efeitos do jogador na UI.

No Keep Ocean, `ENABLED` fica `false`; noutros jogos do template pode ativar-se e trocar-se o ficheiro em `SOUND_EFFECTS.LEVEL_COMPLETE`.

#### 2.5 Indicadores visuais de respiração (top-down)

Para jogos em que a respiração acontece com movimento vertical do personagem (top-down), configure:

1. **Assets de fase** em `GAME_ASSETS.VISUAL_BREATH_INDICATORS_TOP_DOWN`
   - `INHALE`: sprite/spritesheet da inspiração (quando sobe)
   - `EXHALE`: sprite/spritesheet da expiração (quando desce)
2. **Comportamento visual** em `VISUAL_BREATH_INDICATOR_CONFIG.TOP_DOWN`
   - `ANIMATION_FPS` = rapidez da animação
   - `WIDTH_RATIO` = largura/tamanho relativo ao personagem
   - `INHALE_OFFSET_Y` e `EXHALE_OFFSET_Y` = posição vertical do indicador

Exemplo:

```typescript
export const VISUAL_BREATH_INDICATOR_CONFIG = {
  ENABLED: true,
  LAYOUT: 'topDown',
  TOP_DOWN: {
    ANIMATION_FPS: 10,
    WIDTH_RATIO: 0.9,
    INHALE_OFFSET_Y: 0.5,
    EXHALE_OFFSET_Y: 0.7
  }
} as const;
```

---

### **Passo 3: Cores dos menus e do tema game**

**Primeiro (recomendado):** edite **`MENU_BRAND_CONFIG`** e **`MENU_SCREEN_CONFIG`** em [src/utils/constants.ts](src/utils/constants.ts) — gradiente dos painéis, bordas douradas e fundo JPEG da Welcome/MainMenu. Valores injetados no arranque por `applyMenuBrandVariables` (`src/main.tsx`).

**Depois (opcional):** edite [src/styles/themeGame.ts](src/styles/themeGame.ts) para variáveis que não passam por `MENU_BRAND_CONFIG` (botões de navegação, topbar, etc.) quando `MENU_THEME = 'game'`.

**Onde cada tipo de cor fica:**

- **Painéis de menu (gradiente + borda):** `MENU_BRAND_CONFIG` em `constants.ts` (ver comentário no bloco).
- **Cores do projeto** (fallback / extras): seção `:root` de `themeGame.ts`, com o comentário `/* CORES DO PROJETO */` (primary, secondary, bg-dark, bg-deep, teal, etc.).
- **Cores de sistema** (não alterar): em [src/styles/global.tsx](src/styles/global.tsx) — danger, success, white, black, overlays — mantidas iguais no template.
- **Tema light**: [src/styles/themeLight.ts](src/styles/themeLight.ts) define o menu claro (`data-menu-theme="light"`). Geralmente não precisa alterar ao criar novo jogo; apenas escolha `MENU_THEME` em `constants.ts`.
- **Trilha do Tesouro (recomendado)**: em [src/utils/constants.ts](src/utils/constants.ts) — `MENU_BRAND_CONFIG` (gradiente dos painéis `CONTENT_GRADIENT_*`, borda dourada `BORDER_HIGHLIGHT_*`) e `MENU_SCREEN_CONFIG` (`BACKGROUND_IMAGE`, `BACKGROUND_OVERLAY` na Welcome/MainMenu; `BREATHING_PREVIEW.FRAMES` na aba Modo). Valores aplicados no arranque via `applyMenuBrandVariables`.

**Totalmente flexível!** Pode ter 2 cores básicas ou 10+ cores temáticas:

**Jogo da Baleia (5 cores temáticas) – em `themeGame.ts`:**

```typescript
:root {
  --color-primary: #ffcc00;      /* amarelo */
  --color-secondary: #2e8b9e;    /* teal */
  --color-accent: #4dd0e1;       /* cyan */
  --color-bg-dark: #005566;      /* oceano escuro */
  --color-bg-deep: #002233;      /* oceano profundo */
}
```

**Keep Space (minimalista - 3 cores):**

```typescript
:root {
  --color-primary: #9c27b0;      /* roxo */
  --color-bg-dark: #1a237e;      /* espaço escuro */
  --color-accent: #00e5ff;       /* cyan */
}
```

**Keep Forest (rica - 8 cores):**

```typescript
:root {
  --color-primary: #8bc34a;      /* verde */
  --color-secondary: #795548;    /* marrom */
  --color-accent: #cddc39;       /* verde-limão */
  --color-bg-dark: #33691e;      /* verde escuro */
  --color-bg-deep: #1b5e20;      /* verde muito escuro */
  --color-earth: #6d4c41;        /* terra */
  --color-flower: #ff6f00;       /* laranja */
  --color-sky: #81d4fa;          /* azul claro */
}
```

**Keep City (complexa - 10+ cores):**

```typescript
:root {
  --color-primary: #ff5722;      /* laranja urbano */
  --color-secondary: #607d8b;    /* cinza */
  --color-accent: #ffc107;       /* amarelo */
  --color-bg-dark: #263238;      /* asfalto */
  --color-bg-deep: #000000;      /* noite */
  --color-building-1: #546e7a;   /* prédio 1 */
  --color-building-2: #78909c;   /* prédio 2 */
  --color-neon-1: #e91e63;       /* neon rosa */
  --color-neon-2: #00bcd4;       /* neon cyan */
   --color-street: #424242;       /* rua */
  --color-traffic: #ffeb3b;      /* semáforo */
}
```

**Dica:** Cores de sistema sempre disponíveis (não precisa alterar):

```typescript
--color-danger: #d32f2f;
--color-success: #388e3c;
--color-warning: #ff9800;
--color-white: #ffffff;
--color-black: #000000;
--color-gray-light: #aaaaaa;
--color-gray-dark: #333333;
--color-overlay: rgba(0, 0, 0, 0.6);
--color-overlay-light: rgba(255, 255, 255, 0.1);
```

---

### **Passo 4: Organizar Assets**

Coloque seus arquivos em `public/assets/`:

**Exemplo com poucos assets (minimalista):**

```

public/assets/
├── images/
│ ├── background/
│ │ └── simple.png # 1 imagem estática
│ ├── mainCharacter/
│ │ └── character.png
│ ├── companions/
│ │ ├── companion_1.png
│ │ └── companion_2.png # Apenas 2 companheiros
│ ├── effects/
│ │ ├── particle.png
│ │ ├── indicator_off.png
│ │ └── indicator_on.png
│ └── ui/
│ ├── buttons.png
│ └── welcome_icons.png
└── sounds/
├── music1.mp3
├── particle.wav
├── in.wav
├── out.wav
└── level-complete.wav

```

**Exemplo com muitos assets (completo):**

```

public/assets/
├── images/
│ ├── background/
│ │ ├── layer_01_sky.png
│ │ ├── layer_02_clouds.png
│ │ ├── layer_03_mountains.png
│ │ ├── ... (até 15 camadas)
│ ├── mainCharacter/
│ │ ├── character.png
│ │ └── character_spritesheet.png
│ ├── companions/
│ │ ├── companion_01.png
│ │ ├── companion_02.png
│ │ ├── ... (quantidade por GDD; ver §2.1 se for >4 com sensor)
│ ├── effects/
│ │ ├── particle.png
│ │ ├── indicator_off.png
│ │ └── indicator_on.png
│ └── ui/
│ ├── buttons.png
│ └── welcome_icons.png
└── sounds/
├── music1.mp3
├── music2.mp3
├── ... (quantas músicas quiser)
├── particle.wav
├── in.wav
├── out.wav
└── level-complete.wav

```

**Especificações:**

- Backgrounds: 2046×1000px, PNG transparente, < 200KB
- Personagem: PNG transparente, tamanho livre (ajustar scale)
- Companheiros: PNG transparente, < 100KB cada
- Sons: MP3 para música, WAV para efeitos

---

## 🧪 Testar o Jogo

```bash
npm run dev
```

Abra `http://localhost:5173` e verifique:

1. ✅ No navegador: título da aba e ícone da guia corretos (definidos em `index.html`: `<title>` e `<link rel="icon">`)
2. ✅ Todas as imagens carregam (sem 404 no console)
3. ✅ Sons tocam corretamente
4. ✅ Cores do tema estão aplicadas
5. ✅ Labels usam nomenclatura correta (ex: "Veado", "Pássaros")

---

## 📊 Exemplos Comparativos

### Exemplo 1: Minimalista (Keep Space)

| Aspecto          | Configuração               |
| ---------------- | -------------------------- |
| **Backgrounds**  | 1 imagem (espaço estático) |
| **Companheiros** | 3 estrelas cadentes        |
| **Músicas**      | 2 trilhas ambiente         |
| **Complexidade** | Baixa - ideal para começar |

```typescript
BACKGROUND_LAYERS = [{ id: 'space', src: '/assets/images/background/space.png', speed: 0 }];

COMPANIONS_CONFIG = [
  { id: 'star1', requiredIndicators: 1 },
  { id: 'star2', requiredIndicators: 2 },
  { id: 'star3', requiredIndicators: 3 }
];
```

### Exemplo 2: Intermediário (Keep Forest)

| Aspecto          | Configuração             |
| ---------------- | ------------------------ |
| **Backgrounds**  | 5 camadas parallax       |
| **Companheiros** | 8 animais da floresta    |
| **Músicas**      | 5 trilhas variadas       |
| **Complexidade** | Média - equilíbrio ideal |

```typescript
BACKGROUND_LAYERS = [
  { id: 'sky', speed: 0.2 },
  { id: 'mountains', speed: 0.5 },
  { id: 'trees', speed: 1 },
  { id: 'grass', speed: 1.2 },
  { id: 'sun', speed: 0 }
];

COMPANIONS_CONFIG = [
  { id: 'bird1', requiredIndicators: 1 },
  { id: 'bird2', requiredIndicators: 1 },
  { id: 'squirrel', requiredIndicators: 2 },
  { id: 'rabbit', requiredIndicators: 2 },
  { id: 'butterfly1', requiredIndicators: 3 },
  { id: 'butterfly2', requiredIndicators: 3 },
  { id: 'owl', requiredIndicators: 4 },
  { id: 'deer', requiredIndicators: 5 }
];
```

### Exemplo 3: Complexo (Jogo da Baleia)

| Aspecto          | Configuração                  |
| ---------------- | ----------------------------- |
| **Backgrounds**  | 7 camadas parallax detalhadas |
| **Companheiros** | 4 peixes + variações          |
| **Músicas**      | 5 trilhas oceânicas           |
| **Complexidade** | Alta - experiência rica       |

### Exemplo 4: Extremo (Keep City)

| Aspecto          | Configuração                         |
| ---------------- | ------------------------------------ |
| **Backgrounds**  | 12 camadas (prédios, carros, nuvens) |
| **Companheiros** | 20 personagens urbanos               |
| **Músicas**      | 10 trilhas urbanas                   |
| **Complexidade** | Muito alta - projeto ambicioso       |

**Comparativo de Temas:**

| Item             | Jogo da Baleia | Keep Forest | Keep Space | Keep City  |
| ---------------- | -------------- | ----------- | ---------- | ---------- |
| **Personagem**   | Baleia         | Veado       | Astronauta | Ciclista   |
| **Companheiros** | 4 peixes       | 8 animais   | 3 estrelas | 20 pessoas |
| **Backgrounds**  | 7 camadas      | 5 camadas   | 1 imagem   | 12 camadas |
| **Cores Tema**   | 5 cores        | 8 cores     | 3 cores    | 10+ cores  |
| **Primary**      | #ffcc00        | #8bc34a     | #9c27b0    | #ff5722    |

---

## ⚠️ O Que NÃO Modificar

**NÃO altere estes arquivos** (lógica core do jogo e biofeedback):

```
❌ src/services/vfc/VFCService.ts
❌ src/services/bluetooth/BLEService.ts
❌ src/services/game/gameEngineService.ts
❌ src/services/game/gameLoopService.ts
❌ src/services/audio/audioService.ts
❌ src/services/api/formatSessionDataService.ts
❌ src/services/api/sessionTokenInitService.ts
❌ src/services/api/postSessionDataService.ts
❌ src/contexts/GameEngineProvider.tsx
❌ src/contexts/gameEngineContext.ts
❌ src/contexts/MenuThemeProvider.tsx
❌ src/contexts/AccessibilityProvider.tsx
❌ src/contexts/BreathingPhaseProvider.tsx
❌ src/hooks/useGameEngine.ts
❌ src/hooks/useCanvas.ts
❌ src/hooks/useVFC.ts
❌ src/hooks/useBluetooth.ts
❌ src/hooks/useAudio.ts
❌ src/utils/math.ts
❌ src/utils/canvas.ts
```

Eles contêm a lógica de VFC, BLE, motor de jogo, loop de animação, áudio e sessão, comum a todos os jogos do template.

**⚠️ Por quê:** O biofeedback depende de dados fisiológicos em tempo real. Manter a lógica separada do React evita atrasos e re-renders que prejudicam o feedback. Ao adicionar funcionalidades, não coloque cálculos de VFC/score em componentes — use os serviços. Ver [ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md#princípio-crítico-biofeedback).

**Export de sessão (samples / calibration_samples):** a definição das janelas de tempo no buffer RR (alinhamento ao tempo jogado, fim de partida, reinício) está documentada em [ARCHITECTURE_MAP.md — Sessão](./ARCHITECTURE_MAP.md#sessão). Customizações que alterem duração de calibração ou fluxo do motor devem manter coerência com esses marcadores se o backend depender do formato.

---

## 🚀 Dicas Finais

1. **Comece pelo pacote fechado do GDD**: integre primeiro os assets finais aprovados e só volte para a esteira de imagens se algum arquivo falhar na validação técnica
2. **Teste frequentemente**: A cada mudança, rode `npm run dev`
3. **Use o console**: F12 no navegador mostra erros de carregamento
4. **Versione**: Faça commits pequenos (`git commit -m "..."`)
5. **Documente**: Se mudar algo significativo, atualize este guia

---

## 📝 Checklist de Entrega

Antes de considerar o novo jogo pronto:

```
[ ] index.html: <title> e <link rel="icon"> com nome e ícone do jogo
[ ] README.md atualizado com nome do novo jogo
[ ] Todos os assets estão otimizados (< 200KB por imagem)
[ ] Sons testados em diferentes volumes
[ ] Cores acessíveis (contraste adequado)
[ ] Teste em Chrome/Edge (navegadores suportados)
[ ] Documentação de mudanças específicas
[ ] Build de produção funciona (npm run build)
```

---

## 💡 Próximos Passos

Depois de criar seu primeiro jogo baseado neste template:

1. **Compartilhe**: Documente suas mudanças para ajudar outros devs
2. **Melhore o template**: Se encontrar padrões, abstraia mais
3. **Crie biblioteca**: Se fizer 3+ jogos, considere extrair Core para NPM package

---

## 🆘 Ajuda

Encontrou dificuldade? Verifique:

1. Console do navegador (F12)
2. README.md principal
3. Código do Jogo da Baleia original (referência)

**Problemas comuns:**

- Imagens 404: Verifique caminhos em `constants.ts`
- Sons não tocam: Clique "Inicializar Áudio" primeiro
- Cores erradas: Limpe cache do navegador (Ctrl+Shift+R)

---

Bom desenvolvimento! 🎮🌟
