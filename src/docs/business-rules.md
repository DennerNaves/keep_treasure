# Regras de Negócio

## Modelo de Estados do Sensor

O jogo deve suportar três momentos de sensor:

1. **Conectado e enviando dados**  
   Estado normal.

2. **Conectado e não enviando dados**  
   Estado de **sensor sem sinal**: ausência temporária de RR válido (não é pausa de menu).

3. **Desconectado**  
   Desconexão real (hardware desligado, Bluetooth desligado, ou desconexão no navegador).

---

## Estados na Tela do Jogo (HUD)

Na partida, a interface deve distinguir claramente estes três rótulos (texto voltado ao terapeuta e à família):

| Estado                           | Rótulo sugerido         |
| -------------------------------- | ----------------------- |
| Com RR válido e sensor conectado | **Sensor conectado**    |
| Sensor conectado, sem RR válido  | **Sensor sem sinal**    |
| Sem conexão BLE                  | **Sensor desconectado** |

Hoje já existe feedback visual no **botão de sensor** (incluindo mudança de cor conforme o estado). Esse padrão deve se alinhar a estes três estados.

---

## Comportamento por Estado (resumo)

### Sensor conectado

- Jogo conforme **limiar**, baseline, aura, VFC, janela dinâmica e regras de pontuação ligadas ao biofeedback.
- No HUD atual, a `StatusBar` desenha **até** `INDICATOR_CONFIG.HUD_ICON_SLOT_COUNT` ícones (omissão **4**; ver `constants.ts`); o estado on/off de cada posição reflete a contagem de companheiros ativos (`activeCompanionHudCount`), **sem** aumentar o número de ícones quando há mais peixes no canvas.

### Sensor desconectado

- Jogo em **modo passivo** (sem hardware): companheiros entram por **tempo** (delays / `getCompanionScheduleElapsedMs()` no motor).
- Na **barra de indicadores** (`StatusBar`), o preenchimento acompanha os **companheiros ativos em cena naquele instante** (ver secção «HUD do indicador»).
- A **pontuação** por tempo × estrelas (modelo linear descrito mais abaixo) pode evoluir em versões futuras; o que está em código hoje está detalhado nas secções «Situação atual» e «HUD de estrelas».

### Sensor sem sinal

- O **tempo da sessão continua** a correr.
- **Congelam** (entre outros): limiar e sua atualização, cálculos para **janela deslizante**, estrelas, aura, VFC e demais métricas fisiológicas — conforme detalhado na secção seguinte.

### Limite de tempo em «sensor sem sinal»

- **Âmbito:** esta regra vale **apenas durante a partida** (estado de jogo `playing`, com o cronómetro da sessão a correr). **Não se aplica à calibração** — na calibração não há conversão para «partida sem sensor» por tempo sem RR; o fluxo de baseline continua independentemente deste limite.
- Se o estado **sensor sem sinal** se mantiver **em sequência** por mais de **20 segundos** **só nesse contexto de partida** (sem RR válido no intervalo definido no código), a partida passa a ser tratada como **sensor desconectado** para a lógica de jogo (`sessionSignalLossPersistent`):
  - **Modo automático** (companheiros por tempo, como sessão sem hardware; mesma ideia que «sem sensor»).
  - No **fim da partida**, os dados **continuam a ser enviados** ao servidor com **`with_sensor: false`** (sem amostras, calibração, frequência respiratória nem pontuação no payload).
  - O **HUD de estrelas** segue refletindo os **companheiros ativos no momento** (ver «HUD de estrelas»).
- O Bluetooth pode continuar ligado; o que muda é o **comportamento da sessão**, não obrigatoriamente a conexão física.
- O valor **20 segundos** está em `SENSOR_SESSION_CONFIG.NO_SIGNAL_TO_DISCONNECT_MS` em `constants.ts`.

---

## Regras de Pontuação: Estado "Não Conectado" (Modo Passivo)

Quando o terapeuta optar por **não usar o hardware**, o jogo atua como **exercício de respiração guiado por tempo**. A lógica de recompensas deve ser **simples e previsível**.

### Ganho de estrelas e recompensas visuais

- A evolução visual (aparecimento de **ícones no HUD**, **companheiros** ou outros elementos de recompensa) ocorre de forma **automática**, **atrelada ao tempo de permanência** da criança na sessão.
- O **último ícone** de recompensa visual deve aparecer **próximo ao fim da partida**, para recompensar o **engajamento contínuo**.

### Cálculo matemático da pontuação

- A pontuação geral exibida (e o acúmulo coerente com o modo passivo) segue um modelo **linear** de **Tempo × indicadores ativos no HUD**: a taxa de ganho de pontos considera o tempo em jogo e a quantidade de companheiros **já refletidos** no indicador naquele momento.

### Exemplo

- **1 ponto** ganho **a cada segundo**, **multiplicado** pela **quantidade de indicadores ativos** no HUD (no instante considerado), de modo que o total acompanhe proporcionalmente tempo e engajamento visual.

### Situação atual (implementação)

- Entrada automática de **companheiros** por tempo **já ocorre** sem sensor e no **modo automático** após perda persistente de sinal (20 s em «sensor sem sinal» na partida).
- **Ícones do indicador na `StatusBar`:** o preenchimento segue a concorrência atual de companheiros (`companionHudConcurrentActive`), com teto **`INDICATOR_CONFIG.HUD_ICON_SLOT_COUNT`** (omissão 4), independentemente de sessão com sensor, sem sensor ou perda persistente de sinal.
- **Implementação:** a cada `TIMING.SCORE_UPDATE_INTERVAL` (1 s), em modo passivo o motor soma **N pontos**, onde **N** é o número de **companheiros ativos** no instante (IN / ENTERING), até o teto do HUD (`INDICATOR_CONFIG.HUD_ICON_SLOT_COUNT`). Equivale a **1 ponto por segundo × indicadores ativos** quando o intervalo é 1 s.

---

## HUD do indicador (`StatusBar`) — implementação atual

- O número de **slots** de ícone vem de `INDICATOR_CONFIG.HUD_ICON_SLOT_COUNT` (omissão **4**). O preenchimento usa `companionHudConcurrentActive` (companheiros em `IN` ou `ENTERING`), **capped** a esse número de slots.
- Isso vale tanto para sessão com sensor quanto para sessão sem sensor e para perda persistente de sinal (`sessionSignalLossPersistent`).
- O **RMSSD tier** (`rmssdTier` no estado VFC e o mesmo identificador como parâmetro em `updateCompanions`) é um **nível** (faixa de intensidade do RMSSD vs baseline; multiplicadores em `VFC_CONFIG.RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS`, máximo `getMaxRmssdTier`) usado em regras como companheiros; o HUD usa `activeCompanionHudCount` (espelho dos companheiros em cena).
- O `companionHudPeakConcurrent` continua a ser reportado no motor para telemetria/regra futura (teto de score em modo passivo), porém não é o valor exibido diretamente na `StatusBar`.

---

## Níveis de dificuldade (companheiros com sensor)

Comportamento **implementado** no motor e no `VFCService`. A escolha é feita no **menu principal** (`MenuDifficultyId`: `easy` | `medium` | `hard`), guardada no `gameEngineService` e mostrada na **pausa** e no **menu de informações do sensor**. O POST da sessão inclui `difficult_level` com valores `'1'`, `'2'`, `'3'` (`SESSION_DIFFICULTY_API_VALUE` em `constants.ts`).

**Âmbito:** as regras abaixo aplicam-se **apenas** quando há **sessão com sensor**, dados RR válidos e **não** estás no modo automático (sem sensor, desconexão ou ≥ 20 s sem RR na partida). Fora disso, companheiros seguem só por tempo; a dificuldade **não** altera esse modo.

### Referência para o RMSSD tier (entrada dos companheiros)

- **Fácil** e **Médio:** após a calibração, o `VFCService` **fixa** o RMSSD de calibração como referência de jogo (`markCalibrationComplete(difficulty)` → baseline de gameplay = snapshot de calibração). O tier vem de `computeRmssdTier(rmssdAtual, essaReferênciaFixa)` com `VFC_CONFIG.RMSSD_TIER_ABOVE_BASELINE_MULTIPLIERS`.
- **Difícil:** a referência é a **mediana deslizante** do RMSSD na janela habitual de baseline (comportamento “clássico” do template no `VFCService`).

Na HUD, Fácil/Médio mostram o valor como **calibração**; Difícil como **limiar** (rótulos em `Game` e `SensorInfoMenu`).

### Retenção (saída dos companheiros com biofeedback)

Implementação em `companionDifficultyService.ts`, consumida no `gameCanvas` ao chamar `updateCompanions(..., useTierRetain, globalRetain)`:

| Dificuldade | Critério para um companheiro **permanecer** em `IN` (resumo) |
| ----------- | ------------------------------------------------------------- |
| **Fácil**   | Sempre permitido (`getGlobalRetainBiofeedbackOk` devolve verdadeiro): **não** há saída por biofeedback. |
| **Médio**   | RMSSD atual ≥ **calibração × (1 − `VFC_CONFIG.MEDIUM_RMSSD_LOSS_MARGIN_BELOW_CALIBRATION`)** (omissão **0,2** → piso **80%** da calibração). Abaixo disso, pode sair (respeitando fila / tempos mínimos em `useCompanions`). |
| **Difícil** | Igual à condição de **entrada** por tier: `rmssdTier >= requiredIndicators` deve continuar verdadeiro (`shouldUseTierForCompanionRetention` só para Difícil). |

### Evolução

Os textos explicativos para a família/terapeuta estão em `MENU_DIFFICULTY_COPY` em `constants.ts`. O comportamento numérico pode ser refinado após testes (por exemplo margem em Médio), mantendo a lógica nos **serviços**.

---

## Evolução futura (template): companheiros × indicadores

Este projeto é um **template**: o número de **companheiros** (sprites / slots) e o número de **indicadores** ou “estrelas de limiar” no HUD **não são fixos** para todos os jogos derivados.

- No futuro, a **entrada automática** (delays, filas, ordem de spawn) e o **mapeamento indicador ↔ companheiro** terão de **ajustar-se** a configurações do tipo:
  - 6 companheiros com 4 indicadores;
  - 8 companheiros com 4 indicadores;
  - 11 companheiros; etc.
- **Âmbito atual:** não é necessário generalizar isso agora; basta manter a lógica concentrada em **serviços** (`gameEngineService`, constantes, `useCompanions`) e evitar duplicar regras em componentes React, para quando a configuração por jogo for introduzida.

---

## Nomenclatura Oficial

Para evitar confusão com a pausa de menu:

- **`paused` / `isPaused`**: pausa de usuário ou do menu (sobreposição de pausa, loop do jogo interrompido).
- **`isSensorNoSignal`**: sensor **conectado**, porém **sem RR válido** no momento — em texto de produto ou interface: **“sensor sem sinal”**.
- **`sessionSignalLossPersistent`**: flag no motor de jogo: após **20 s seguidos** em «sensor sem sinal» **durante a partida** (não na calibração), a sessão deixa de usar regras de biofeedback e passa ao **modo passivo** (ver `NO_SIGNAL_TO_DISCONNECT_MS`).

Não usar a palavra **“pausa”** para esse estado no texto voltado ao usuário ou em nomes de variáveis que descrevam perda de sinal; isso reserva “pausa” só para o menu.

---

## Comportamento Atual Confirmado

### Sessão inicia desconectada

- A partida pode acontecer inteira sem sensor.
- Peixes e companheiros entram automaticamente por tempo.
- Ao fim da partida, os dados são **sempre enviados ao servidor** com `with_sensor: false` (mesmo payload mínimo: tempo escolhido, tempo jogado, `session_completed`; sem amostras, calibração, frequência respiratória nem pontuação).

### Sensor desconecta durante sessão com sensor

- A partida passa a se comportar como sessão desconectada.
- Peixes e companheiros entram automaticamente por tempo.
- No **fim da partida**, o envio ao servidor usa **`with_sensor: false`** (apenas tempo escolhido, tempo jogado, `session_completed`, etc.; sem samples nem score).

### RR ausente de forma prolongada (mais de 20 s seguidos) com Bluetooth ainda conectado

- Mesmo comportamento que **sensor desconectado** na partida: modo automático, conforme a secção «Limite de tempo em sensor sem sinal» (só em **partida**, não na calibração).
- No **fim da partida**, o envio segue com **`with_sensor: false`**, como acima.
- **Estrelas:** seguem alinhadas aos **companheiros ativos no momento** (concorrência atual no HUD).

### Sessão com sensor «íntegra» (payload completo no backend)

- **Todas** as partidas geram POST ao fim; a diferença é o tipo de payload.
- Só é enviado `with_sensor: true` (samples, calibração, score, frequência respiratória) quando a partida **começou com sensor**, **não** houve desconexão Bluetooth durante a sessão **e** **não** ocorreu sequência de **≥ 20 s** sem RR válido na partida (`NO_SIGNAL_TO_DISCONNECT_MS`). Se faltar amostra VFC mesmo nesse cenário, o cliente faz _fallback_ para o payload mínimo com `with_sensor: false`.

---

## Comportamento Obrigatório para `isSensorNoSignal`

Quando o sensor está conectado, mas sem sinal RR (movimento brusco, contato ruim com pele, limitação de hardware):

- O tempo da sessão **continua**
- A pontuação **congela**
- Atualizações de limiar e linha de base **congelam** (incluindo **limiar atual** exibido ou usado na lógica)
- Atualizações de aura **congelam**
- **Estrelas no HUD** deixam de progredir enquanto não houver nova alteração de concorrência de companheiros; na prática, com transições congeladas em `isSensorNoSignal`, tendem a permanecer estáveis até o retorno do sinal ou até `sessionSignalLossPersistent`
- Cálculos de VFC e **janela deslizante** **congelam**
- Contadores de progressão e queda fisiológica **congelam**

### Comportamento dos companheiros durante `isSensorNoSignal`

Regra importante:

- Não interromper de forma brusca animação já iniciada.
- Se um companheiro já estava entrando quando `isSensorNoSignal` ficou verdadeiro, ele pode concluir a entrada.
- Após concluir essa transição, enquanto `isSensorNoSignal` estiver ativo, não deve haver novas entradas nem saídas.

Resumo: congelar decisões lógicas e progressão fisiológica, preservando continuidade visual.

---

## Experiência do Usuário: Sensor sem Sinal (terapeuta e criança)

Objetivo: a criança **continua jogando** sem cortes bruscos; o terapeuta recebe **vários sinais visuais** de que o sensor pode estar mal posicionado ou com interferência forte.

- **Botão de sensor**: deve **permanecer visível**; em **sensor sem sinal** pode aparecer **atenuado** (ex.: mais escuro) para não sugerir “tudo certo”, mas **não** deve sumir — o terapeuta mantém acesso ao menu de informações do sensor.
- **Texto de status** (onde hoje aparece algo como conectado / não conectado): deve mostrar explicitamente **Sensor sem sinal**, e não o mesmo texto de “conectado” nem o de “desconectado”.
- **Barra de status (`StatusBar`)**: prever **alteração visual global** — por exemplo cor da barra, cor das estrelas, destaque do indicador de conexão — de modo que o estado **sensor sem sinal** seja reconhecível à primeira vista, em conjunto com o botão e o texto.

Detalhes de cor e assets podem seguir o guia de tema; a regra de negócio é: **redundância de pistas** para o terapeuta sem punir a criança com interrupção de fluxo.

---

## Retomada após `isSensorNoSignal`

Quando o RR válido voltar:

- Sair de `isSensorNoSignal` (voltar ao estado **com sinal**)
- Retomar cálculos a partir do ponto congelado
- Manter estratégia simples por enquanto (sem regra especial para reconstruir o período sem dados)

---

## Diretrizes Gerais de Experiência e Terapia

- Priorizar experiência estável e não disruptiva para crianças com TEA.
- Indicadores para o terapeuta durante **sensor sem sinal** devem deixar claro: sensor ainda **conectado por Bluetooth**, sinal fisiológico **ausente no momento**, métricas de biofeedback **congeladas** enquanto o tempo segue.
