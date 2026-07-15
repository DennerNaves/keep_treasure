# Dicionário dos Jogos de Respiração

## Objetivo deste documento

Este documento foi criado para servir como material de onboarding para devs que trabalham em jogos de respiração com biofeedback em contexto terapêutico (crianças com TEA e TDAH).

Aqui você encontra:

- Explicação clara do que é o jogo de respiração e da proposta terapêutica
- Glossário com os principais termos fisiológicos e técnicos
- Visão prática de como funcionam Jogo da Baleia e Keep Cars (objetivos, mecânicas, aura, pontuação, bonificações e punições)

Objetivo: permitir que um novo dev entenda a lógica do jogo e a intenção terapêutica, mesmo sem conhecimento prévio de VFC.

---

## 1. O que é o jogo de respiração?

Jogos de respiração são jogos terapêuticos que usam biofeedback fisiológico em tempo real para estimular a criança a regular a respiração e, consequentemente, as emoções.

O jogo se conecta a um sensor infravermelho que capta dados do batimento cardíaco. A partir desses dados, o sistema calcula:

- Frequência cardíaca (FC)
- Intervalos RR
- Variabilidade da frequência cardíaca (VFC)
- Limiar dinâmico (baseline)

Essas métricas modificam a mecânica do jogo em tempo real, criando um ciclo de biofeedback:

`Respiração do usuário -> Alteração fisiológica -> Leitura do sensor -> Cálculos -> Mudança no jogo -> Estímulo visual/sonoro -> Ajuste da respiração`

O principal objetivo terapêutico é estimular uma respiração lenta, regular e profunda, favorecendo a ativação do sistema nervoso parassimpático (calma, autorregulação emocional e redução do estresse).

---

## 2. Glossário – Termos fundamentais

### Biofeedback

Técnica na qual sinais fisiológicos do corpo (como batimentos cardíacos) são medidos em tempo real e devolvidos ao usuário de forma visual ou sonora, permitindo o aprendizado de autorregulação voluntária.

### Frequência Cardíaca (FC)

Número de batimentos cardíacos por minuto (bpm). É calculada a partir dos intervalos RR.

### Intervalo RR

No ECG, a onda R é o principal pico do batimento cardíaco.  
Intervalo RR é o tempo (em milissegundos) entre um pico R e o próximo.

Em termos simples:  
`Intervalo RR = tempo entre um batimento cardíaco e o próximo`

Esse é o principal dado bruto vindo do sensor.

### Variabilidade da Frequência Cardíaca (VFC)

Mede a variação natural entre intervalos RR consecutivos.

- Alta variabilidade -> corpo mais adaptável e regulado
- Baixa variabilidade -> estado de estresse ou ativação excessiva

No contexto dos jogos, aumentar a variabilidade cardíaca é positivo e associado a respiração adequada.

### Sistema Nervoso Autônomo

Dividido em dois ramos principais:

- Sistema simpático: ativação, alerta, estresse ("luta ou fuga")
- Sistema parassimpático: relaxamento, calma, digestão, autorregulação

A respiração lenta e ritmada estimula o sistema parassimpático, que é o foco terapêutico dos jogos.

### Ciclo Respiratório

Tempo total de uma respiração completa:

- Inspiração + expiração

Nos jogos, o ciclo costuma variar entre:

- 6 incursões/minuto -> ciclo de ~10 segundos
- 12 incursões/minuto -> ciclo de ~5 segundos

### Incursão Respiratória

Uma respiração completa: inspirar + expirar.

### Limiar (Baseline)

Também chamado de basal, é um valor calculado dinamicamente com base na variabilidade cardíaca do usuário.

Funciona como alvo fisiológico:

- Se variabilidade >= limiar -> respiração considerada adequada
- Se variabilidade < limiar -> respiração considerada inadequada

Esse conceito é gamificado para gerar bonificações e punições.

### Aura

Representação visual de estado fisiológico positivo do jogador.

- Possui 5 níveis (1 a 5)
- Níveis maiores indicam maior aderência ao padrão respiratório esperado
- A aura influencia diretamente a pontuação como multiplicador

### Pontuação

Valor numérico que representa desempenho do jogador.

Regra base comum entre os jogos:

- 1 ponto por segundo
- Pontos multiplicados pelo nível da aura

---

## 3) Jogo da Baleia

### Visão geral

Jogo da Baleia é um jogo estático, sem entrada por teclado, mouse ou touch.

O jogador apenas respira acompanhando o movimento da baleia.  
A proposta é contemplativa e focada em autorregulação.

### Narrativa lúdica

A baleia é um mamífero que:

- Vive na água
- Respira ar pelo espiráculo (orifício no topo da cabeça)

No jogo:

- Baleia sobe -> inspiração
- Baleia desce -> expiração

### Mecânica respiratória

- O jogador escolhe o ritmo respiratório no menu (6 a 12 incursões/min)
- A baleia sobe e desce seguindo esse ciclo
- O jogador sincroniza a respiração com o movimento da baleia

### Feedback sonoro (implementação no template)

- Sons de inspiração e expiração acompanham **cada meia-respiração** (metade do ciclo definido pelo CPM, ex.: `30/cpm` segundos).
- Se o ficheiro de som for **mais curto** que esse tempo, o motor pode **repetir o clipe em loop** até o fim da fase (`AUDIO_CONFIG.BREATH_SYNC_TO_PHASE_DURATION` em `constants.ts`).
- Com essa opção desligada, cada som toca **uma vez** (one-shot), sem forçar duração da fase.

### Aura no Jogo da Baleia

- Existem 5 níveis de aura (1 a 5)
- A aura é representada por peixes que acompanham a baleia

Estados:

- Nível 0: apenas a baleia
- Níveis 1 a 4: baleia + até 4 peixes

### Regras de progressão da aura

- Se variabilidade >= limiar por 1 segundo -> inicia contador
- Ao atingir 5 segundos consecutivos -> sobe 1 nível de aura
- Máximo: 4 peixes

### Regras de perda da aura

- Se variabilidade < limiar -> inicia contador de queda
- Ao atingir 10 segundos consecutivos -> perde 1 peixe

### Trepidação

Se a variabilidade ficar oscilando em torno do limiar:

- Contadores são resetados
- Nenhuma mudança visual é aplicada

### Pontuação no Jogo da Baleia

- 1 ponto por segundo
- Pontuação multiplicada pelo nível da aura

Exemplo:

- Aura nível 3 -> 3 pontos por segundo

---

## 4) Keep Cars

### Visão geral

Keep Cars é um jogo de corrida com entrada ativa do usuário.

- Controle por teclado (desktop)
- Controle por joystick virtual (mobile)

### Objetivo do jogador

- Controlar o carro na pista
- Desviar de outros veículos
- Coletar moedas
- Manter respiração adequada

### Gabarito respiratório

O ciclo respiratório é representado visualmente por um elemento escolhido pelo jogador:

- Farol do carro
- Fumaça do escapamento
- Nitro

Esse elemento:

- Aumenta e diminui de tamanho
- Segue exatamente o ciclo respiratório selecionado (6 a 12 incursões/min)

### Aura no Keep Cars

- Também possui 5 níveis
- É representada por um escudo colorido ao redor do carro

As regras de subida e descida são as mesmas do Jogo da Baleia:

- +1 nível após 5 segundos consecutivos acima do limiar
- -1 nível após 10 segundos consecutivos abaixo do limiar

### Pontuação no Keep Cars

A pontuação é composta por:

1. Tempo:
   - 1 ponto por segundo
   - Multiplicado pelo nível da aura
2. Moedas:
   - Cada moeda vale pontos adicionais
   - Os pontos da moeda também são multiplicados pelo nível da aura

### Diferença principal em relação ao Jogo da Baleia

- Jogo ativo
- Exige atenção motora e cognitiva
- A respiração precisa ser mantida mesmo com estímulos externos
