# Trilha do Tesouro

**Trilha do Tesouro** é um jogo terapêutico com biofeedback que utiliza variabilidade da frequência cardíaca (VFC) para ajudar crianças com TEA e TDAH a regular sua respiração e emoções.

> 💡 **Este projeto é um template!** Pode ser adaptado para criar outros jogos (Keep Forest, Keep Space, etc). Veja [TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md).

---

## 📋 O que é

O jogo conecta-se a um sensor BLE que capta batimentos cardíacos em tempo real. Com base em RMSSD (VFC), o sistema:

- Calcula métricas fisiológicas em tempo real
- Fornece feedback visual (personagem sobe/desce conforme respiração)
- Recompensa respiração adequada com sistema de "aura" e companheiros
- Estimula o sistema nervoso parassimpático

### Proposta Terapêutica

- **Público:** Crianças com TEA e TDAH
- **Objetivo:** Regulação emocional via respiração lenta e profunda
- **Mecânica:** Jogo contemplativo, sem input do usuário (apenas respiração)
- **Duração:** Sessões configuráveis (2–10 min)
- **Feedback:** Visual (aura/companheiros) e sonoro

### Tecnologias

React 19, TypeScript, Vite, Styled Components, Web Bluetooth API, Canvas API.

---

## ⚙️ Pré-requisitos

### Software Necessário

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (ou **yarn**)
- **Navegador compatível com Web Bluetooth** (para conectar o sensor de batimentos):
  - ✅ **Chrome** >= 56 (desktop e Android)
  - ✅ **Edge** Chromium
  - ✅ **Opera** >= 43
  - ✅ **Samsung Internet** (Android)
  - ❌ **Firefox** – sem suporte a Web Bluetooth
  - ❌ **Safari** (iOS e macOS) – sem suporte a Web Bluetooth
  - ❌ **Internet Explorer** – não suportado

## 🚀 Como rodar

```bash
git clone <url-do-repo>
cd keep-ocean-refactor
npm install
npm run dev
```

Acesse **http://localhost:5173**

**Cores dos menus:** edite `MENU_BRAND_CONFIG` e `MENU_SCREEN_CONFIG` em [`src/utils/constants.ts`](src/utils/constants.ts) (gradiente dos painéis, bordas douradas, fundo JPEG). Ver também [TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md) (Passo 3).

**Mapa (tilemap):** layouts em `public/data/maps/`; guia passo a passo em [TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md) (secção *Jogo top-down com tilemap*); detalhe técnico em [ARCHITECTURE_MAP.md](ARCHITECTURE_MAP.md) (Tilemap e Neblina).

```bash
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # ESLint
```

## 🔐 Domínio, portal e iframe

Em **build de produção**, o jogo valida **onde** pode rodar (ver `src/security/iframeDomainGuard.ts` e `src/utils/constants.ts`). O objetivo é impedir que terceiros embutam o jogo em sites não autorizados, mantendo estes casos legítimos:

| Situação                                                                         | Comportamento                                                                                                                                  |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **localhost** (`localhost`, `127.0.0.1`, `::1`)                                  | Permitido (desenvolvimento).                                                                                                                   |
| **Iframe** cujo documento pai é o **portal**                                     | Permitido. A origem esperada do portal vem de `PORTAL_RETURN_URL` → `PORTAL_ORIGIN` em `constants.ts` (ou `VITE_PORTAL_RETURN_URL` no `.env`). |
| **Janela top-level** na **mesma origem do deploy do jogo** (ex.: URL do Amplify) | Permitido. A origem vem de `GAME_PUBLIC_URL_DEFAULT` em `constants.ts`, ou de `VITE_GAME_PUBLIC_URL` no build.                                 |
| Outros (outro domínio, iframe de site aleatório)                                 | Bloqueado: mensagem de acesso não permitido.                                                                                                   |

**Novo jogo a partir do template:** ajuste em `src/utils/constants.ts` o **`GAME_PUBLIC_URL_DEFAULT`** (URL do Amplify ou domínio do jogo) e, se necessário, **`PORTAL_RETURN_URL`** / fallback do portal. Detalhes no [TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md#portal-url-de-retorno-e-dominio-do-deploy-iframe).

Variáveis opcionais no `.env` (sobrescrevem ou estendem o acima):

| Variável                           | Efeito                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `VITE_ENFORCE_IFRAME_DOMAIN=false` | Desliga o guard (ex.: staging). Por omissão, em **produção** o guard fica **ligado**.                               |
| `VITE_ENFORCE_IFRAME_DOMAIN=true`  | Força o guard também em desenvolvimento (`npm run dev`).                                                            |
| `VITE_GAME_PUBLIC_URL`             | URL base do jogo no deploy; a **origem** substitui o fallback de `GAME_PUBLIC_URL_DEFAULT`.                         |
| `VITE_ALLOWED_IFRAME_ORIGINS`      | Lista separada por vírgulas: origens **adicionais** de documento pai permitidas no iframe.                          |
| `VITE_ALLOWED_GAME_ORIGINS`        | Lista separada por vírgulas: origens **adicionais** permitidas em acesso top-level (vários domínios Amplify, etc.). |

Se o portal usar `Referrer-Policy` que remove o referrer para o iframe, o filho pode não conseguir validar o pai; nesse caso ajuste a policy na página do portal.

---

## 🎮 Fluxo do jogo

1. **Boas-vindas** — Início; conectar sensor (opcional)
2. **Menu principal** — Dificuldade dos companheiros (Fácil / Médio / Difícil; só altera o jogo **com** sensor e biofeedback ativo), ritmo respiratório (5–15 CPM), duração, brilho (acessibilidade), tema
3. **Calibração** — `VFC_CONFIG.BASELINE_SAMPLES` amostras RMSSD para baseline inicial (com sensor; **omissão do template: 20**); em Fácil/Médio esse valor passa a ser a **referência fixa** na partida para o tier dos peixes; em Difícil a referência do tier **acompanha** a mediana deslizante durante o jogo (ver [src/docs/business-rules.md](src/docs/business-rules.md))
4. **Jogo** — RMSSD recalculado a cada `VFC_CONFIG.METRICS_INTERVAL_MS` (**omissão: 1 s**; janela híbrida: últimos **`WINDOW_BEATS`** RRs, **omissão 30**, idade máx. 30 s); limiar com janela deslizante de **`BASELINE_SAMPLES`** RMSSD (valores em [`src/utils/constants.ts`](src/utils/constants.ts) — ver [ARCHITECTURE_MAP.md](ARCHITECTURE_MAP.md#parâmetros-vfc-constantsts))
5. **Game Over** — Pontuação; após a animação (personagem fora do ecrã), a sessão é **sempre** enviada ao backend. O payload **completo** (`with_sensor: true`: `calibration_samples`, `samples`, score, frequência respiratória) só é usado quando a partida começou com sensor **e** não houve desconexão Bluetooth **nem** ≥ 20 s seguidos sem RR válido na partida; noutros casos envia-se `with_sensor: false` (tempos e `session_completed`, sem amostras nem pontuação no contrato). Com payload completo, `calibration_samples` cobre a calibração e `samples` só o intervalo em que o tempo da sessão corre — após o jogador “chegar” até ao fim da partida, sem RR da animação final.

**Export de RR (resumo):** `calibration_samples` e `samples` são janelas distintas no `VFCService`; o eixo `t` de cada lista é relativo ao primeiro ponto daquela lista. Detalhes, `with_sensor` e marcadores (`markCalibrationComplete`, `markSessionPlayStart`, `markGameEnd`) estão em [ARCHITECTURE_MAP.md](ARCHITECTURE_MAP.md#sessão) e em [src/docs/business-rules.md](src/docs/business-rules.md).

---

## 📚 Documentação

| Documento                                      | Propósito                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **[ARCHITECTURE_MAP.md](ARCHITECTURE_MAP.md)** | Onde fica cada coisa — estrutura, localização de funcionalidades, índice por palavra-chave |
| **[CONVENTIONS.md](CONVENTIONS.md)**           | Como deve ser feito — boas práticas, nomenclatura, commits, padrões de código              |
| **[TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md)**     | Como reutilizar — criar novos jogos (Keep Forest, Keep Space, etc.)                        |

---

## 🐛 Problemas comuns

- **Sem som?** Navegadores bloqueiam áudio até haver interação. Clique em "Inicializar Áudio" no menu ou inicie o jogo.
- **Sem som ao fim da partida?** No Keep Ocean, `AUDIO_CONFIG.END_GAME_AUDIO.ENABLED` está `false` por defeito. Noutros jogos do template, ative em `constants.ts` e ajuste `VOLUME` / `SOUND_EFFECTS.LEVEL_COMPLETE`.
- **Imagens não carregam?** Confira se os arquivos estão em `public/assets/images/` e se os caminhos em `constants.ts` estão corretos. Abra o console (F12) para ver erros 404.
- **Sensor não conecta?** Web Bluetooth exige Chrome ou Edge, HTTPS (localhost funciona), e o sensor ligado e disponível para pareamento.
- **Calibração trava em "Progresso pausado"?** O sensor está conectado mas não envia dados. Ajuste a posição do sensor na pele, verifique a bateria e tente manter mais quieto.
- **Sensor conecta, mas não calibra (sem RR)?** Alguns sensores enviam FC, mas não enviam intervalos RR. Sem RR não há VFC/RMSSD, então o biofeedback não funciona; use sensor compatível com RR.
- **Status do sensor mudou para "Conectado sem receber sinais" ou "sem contato com a pele"?** A conexão BLE ainda pode estar ativa, mas sem sinal fisiológico confiável. Reajuste a fixação no braço e aguarde o retorno das amostras RR.
- **Build falha?** Rode `npm run lint` e corrija erros. Verifique se `COMPANIONS_CONFIG` e `GAME_ASSETS.COMPANIONS` têm o mesmo número de itens.
- **Jogo pausa sozinho no celular?** Em modo retrato o jogo pausa automaticamente. Gire o dispositivo para landscape.

---

## 🤝 Contribuindo

- 📋 **[CONVENTIONS.md](CONVENTIONS.md)** — consulte antes de commitar (principalmente para devs; em uso de IA, use como referência)
- 📘 **[TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md)** — para criar um novo jogo a partir do template
# trilha-do-tesouro
