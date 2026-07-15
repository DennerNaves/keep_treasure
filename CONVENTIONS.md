# Convenções do Projeto — Trilha do Tesouro

**Como deve ser feito.** Boas práticas e padrões de código. Consulte antes de contribuir ou customizar.

> **Para assistentes de IA:** Ao gerar ou modificar código neste projeto, **sempre use este arquivo (@CONVENTIONS.md) como referência** para aspas, imports, nomenclatura, funções, estilos e commits. Ferramentas automatizadas (incluindo IA) devem seguir estas convenções como se fossem um desenvolvedor do projeto. **Código gerado automaticamente não está isento das regras.**

### Princípio prescritivo

Estas convenções são deliberadamente prescritivas. Quando houver dúvida entre duas abordagens válidas, prefira sempre a **mais simples** e a que **já existe no projeto**. Não introduza novos padrões sem necessidade clara.

---

## Índice

1. [Decisões arquiteturais](#1-decisões-arquiteturais)
2. [Qualidade de código](#2-qualidade-de-código)
3. [Formatação e estilo](#3-formatação-e-estilo)
4. [Imports](#4-imports)
5. [Nomenclatura](#5-nomenclatura)
6. [Funções: arrow vs declaration](#6-funções-arrow-vs-declaration)
7. [Estilos e CSS](#7-estilos-e-css)
8. [Estrutura de arquivos e pastas](#8-estrutura-de-arquivos-e-pastas)
9. [Comentários](#9-comentários)
10. [Git e commits](#10-git-e-commits)
11. [Checklist antes de commitar](#11-checklist-antes-de-commitar)

---

## 1. Decisões arquiteturais

- **Lógica de negócio e cálculos fisiológicos** devem ficar fora dos componentes React.
- **Componentes React** são responsáveis apenas por orquestração e render.
- **Hooks** não devem conter lógica pesada de processamento — apenas ponte entre serviços e UI.
- **Serviços** são síncronos sempre que possível; assíncronos apenas quando exigido por I/O (ex.: BLE, API, áudio).
- **Janelas de export de RR** (`calibration_samples` / `samples`): definidas em `VFCService` e disparadas pelo `gameEngineService` — ver [ARCHITECTURE_MAP.md](ARCHITECTURE_MAP.md#sessão).

---

## 2. Qualidade de código

### ESLint

- Rode `npm run lint` antes de commitar.
- O projeto usa ESLint com regras recomendadas para TypeScript e React Hooks.
- Não ignore avisos sem justificativa; corrija ou use `eslint-disable-next-line` só quando inevitável, com motivo mínimo na linha.

```bash
npm run lint
```

### TypeScript

- Prefira `type` para interfaces e tipos simples; use `interface` quando houver extensão ou declaração de implementação.
- Evite `any`; use `unknown` quando o tipo for indeterminado.
- Use `as const` em constantes e objetos de configuração para inferência literal.

---

## 3. Formatação e estilo

### Aspas

- Use **aspas simples** (`'`) para strings em JavaScript/TypeScript e JSX.

```typescript
import { useState } from 'react';
const message = 'Texto em português';
<button title='Clique aqui'>OK</button>
```

### Indentação e chaves

- 2 espaços para indentação.
- Chaves na mesma linha para blocos curtos; nova linha para blocos longos.
- Vírgula final em objetos e arrays multi-linha.

---

## 4. Imports

### Ordem e agrupamento

1. **Imports default** (componentes, módulos com export default) — ordem alfabética pelo nome do módulo.
2. **Linha em branco**
3. **Imports named** (`import { X } from '...'`) — ordem alfabética pelo nome do símbolo importado.

Dentro de cada grupo, ordene alfabeticamente. Use uma linha em branco para separar default de named.

### Ordem dos módulos nos named imports

1. Bibliotecas externas (`react`, `react-icons`, etc.) — ordem alfabética.
2. Módulos internos (`../../contexts/`, `../../hooks/`, `../../utils/`, etc.) — ordem alfabética pelo caminho.
3. Imports relativos do próprio componente (`./styles`, `./gameCanvas`) — por último.

### Exemplo

```typescript
import CalibrationScreen from '../CalibrationScreen';
import GameCanvas from './gameCanvas';
import GameOver from './GameOver';
import MainMenu from '../MainMenu';

import { useEffect, useState } from 'react';
import { useAccessibility } from '../../contexts/accessibilityContext';
import { useAudio } from '../../hooks/useAudio';
import { useBluetooth } from '../../hooks/useBluetooth';
```

### Quando há apenas named imports

Mantenha a ordem: externos → internos → relativos, cada grupo em ordem alfabética.

### `import type`

Use `import type` quando importar apenas tipos (não em runtime). Agrupe com os named imports do mesmo módulo ou mantenha a ordem alfabética no bloco de named imports.

---

## 5. Nomenclatura

| Elemento                                | Padrão               | Exemplo                                      |
| --------------------------------------- | -------------------- | -------------------------------------------- |
| **Componentes React**                   | PascalCase           | `CalibrationScreen`, `GameOver`              |
| **Pastas de componentes**               | PascalCase           | `CalibrationScreen/`, `MainMenu/`            |
| **Hooks**                               | `use` + PascalCase   | `useBluetooth`, `useVFC`                     |
| **Funções e variáveis**                 | camelCase            | `handleConnect`, `isConnected`               |
| **Constantes**                          | UPPER_SNAKE_CASE     | `GAME_THEME`, `VFC_CONFIG`                   |
| **Tipos e interfaces**                  | PascalCase           | `GameEngineState`, `BLEState`                |
| **Arquivos de tipos**                   | camelCase            | `gameEngineContext.ts`, `accessibilityContext.ts` |
| **Arquivos de serviço**                 | PascalCase + Service | `BLEService.ts`, `VFCService.ts`             |
| **Props transient (styled-components)** | `$` + camelCase      | `$isLightTheme`, `$percent`                  |

---

## 6. Funções: arrow vs declaration

### Componentes e hooks

Use **function declaration** para componentes React e hooks exportados:

```typescript
export default function CalibrationScreen() {
  // ...
}

export function useBluetooth() {
  // ...
}
```

### Serviços e helpers internos

Em serviços e utilitários, use **arrow functions** para funções internas/privadas e para exports quando fizer sentido:

```typescript
const calculateRMSSD = (rrIntervals: number[]): number => {
  // ...
};

export const processVFCData = (input: VFCInput): void => {
  // ...
};
```

### Resumo

| Contexto                        | Preferência                                           |
| ------------------------------- | ----------------------------------------------------- |
| Componentes React               | `function ComponentName()`                            |
| Hooks exportados                | `function useHookName()`                              |
| Funções em serviços             | `const fn = () => {}` ou `export const fn = () => {}` |
| Callbacks inline (map, onClick) | Arrow function `() => {}`                             |

---

## 7. Estilos e CSS

### Styled-components

O projeto usa **styled-components** para estilos. Todo CSS fica em arquivos `styles.tsx` dentro da pasta do componente.

### Regras

- **Nenhum estilo inline** (exceto dinâmicos necessários) — use styled-components.
- **Nenhum CSS em `index.tsx`** — toda a estilização em `ComponentName/styles.tsx`.
- **Props transient** (`$isLightTheme`, `$percent`) para passar props que não devem ir ao DOM.

### Se migrar para outra solução

Em caso de troca (ex.: CSS Modules, Tailwind), manter:

- CSS/estilos **apenas** em arquivos dedicados (`*.styles.tsx`, `*.module.css`, etc.).
- `index.tsx` focado em lógica e JSX, sem blocos de estilo.
- Código o mais limpo possível, com separação clara entre estrutura e apresentação.

---

## 8. Estrutura de arquivos e pastas

### Componentes

Cada componente em pasta própria com:

```
ComponentName/
├── index.tsx   # Lógica e JSX
└── styles.tsx  # Styled-components
```

- Export default em `index.tsx`.
- Componente e pasta com o mesmo nome em PascalCase.

### Hooks

- Um hook por arquivo em `src/hooks/`.
- Nome do arquivo = nome do hook em camelCase: `useBluetooth.ts` → `useBluetooth()`.

### Serviços

- Lógica pura em `src/services/<domínio>/`.
- **Sem dependência de React** — sem `import` de React em serviços.
- Export de funções ou factory; singletons internos quando necessário.
- **Síncronos sempre que possível**; assíncronos apenas quando exigido por I/O (BLE, API, áudio).

**⚠️ Biofeedback:** A lógica de BLE, VFC, score e game loop fica nos serviços. Evitar cálculos ou processamento de dados fisiológicos em componentes ou hooks pesados — isso pode atrasar o feedback e prejudicar a terapia. Ver [ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md#princípio-crítico-biofeedback).

### Tipos

- Um arquivo por domínio em `src/types/`: `game.ts`, `vfc.ts`, `bluetooth.ts`.
- Re-export em `src/types/index.ts`.

### Constantes

- Centralizadas em `src/utils/constants.ts`.
- Objetos de config com `as const` para tipagem estrita.

---

## 9. Comentários

### Regra geral

- No **código de aplicação** (`src/components`, `src/hooks`, `src/services`, `src/contexts`, `src/styles`, `src/types`, etc.), **não** use comentários ou JSDoc — o código deve ser legível por si; decisões e parâmetros ficam em **documentação Markdown** e em **`src/utils/constants.ts`** (único lugar onde comentários/JSDoc em blocos são esperados).
- Exceções pontuais: `eslint-disable` ou `eslint-disable-next-line` **só** com justificativa mínima na mesma linha ou na linha seguinte, quando a regra não puder ser satisfeita de outro modo.

### Onde documentar

- Regras de negócio, sessão, VFC, portal: [ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md), [README.md](./README.md), [src/docs/business-rules.md](./src/docs/business-rules.md) quando existir.
- Valores tunáveis e significado de constantes: comentários/JSDoc em **`constants.ts`** (ver exemplos abaixo).
- Se a mudança afetar o fluxo do template, assets, onboarding de GDD ou a esteira de produção, atualize também [TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md) para manter a base sincronizada.

### Exemplo (constants.ts)

```typescript
/** Tema usado quando não há valor salvo no localStorage. */
export const MENU_THEME: MenuTheme = 'game';

/**
 * Configuração geral do jogo (template): altura base, velocidade do fundo, CPM, limites de sessão e duração.
 */
export const GAME_CONFIG = { ... } as const;
```

---

## 10. Git e commits

### Workflow de branches

- **main** — produção. Somente merge de `dev` após revisão.
- **dev** — integração. Branches de feature/task são mergeadas aqui antes de `main`.
- **Branches de trabalho** — crie a partir de `dev`. Nomes em inglês. Siga o padrão abaixo.

### Padrão de nomeação de branches

Quando houver Azure DevOps (ou similar) com cards/tasks numerados:

```
<numero-card>/<descricao-breve-em-ingles>/<sprint>
```

| Parte                       | Exemplo                  | Descrição                                     |
| --------------------------- | ------------------------ | --------------------------------------------- |
| `numero-card`               | `5194`                   | ID do card no Azure (ou ferramenta de gestão) |
| `descricao-breve-em-ingles` | `add-backend-connection` | Descrição curta, kebab-case, em inglês        |
| `sprint`                    | `mvp`                    | Nome ou identificador da sprint (opcional)    |

**Exemplo:** `5194/add-backend-connection/mvp`

**Regras obrigatórias:**

- **JAMAIS** commitar diretamente em `main` ou `dev`.
- **SEMPRE** mensagens de commit em inglês.
- **SEMPRE** nomes de branches em inglês.
- Commits devem ir para uma branch de trabalho; depois, merge (via PR) para `dev`.

### Mensagens de commit em inglês

- **Sempre** use inglês nas mensagens de commit.

### Commits semânticos

Padrão: `tipo(escopo): descrição`

| Tipo       | Uso                                           |
| ---------- | --------------------------------------------- |
| `feat`     | Nova funcionalidade                           |
| `fix`      | Correção de bug                               |
| `refactor` | Refatoração sem mudar comportamento           |
| `style`    | Formatação, espaços, aspas (sem mudar lógica) |
| `docs`     | Documentação (README, CONVENTIONS, etc.)      |
| `chore`    | Tarefas de manutenção (deps, config)          |
| `perf`     | Melhoria de performance                       |

### Exemplos

**Escopo maior (vários arquivos):**

```
feat: add type definitions and interfaces
feat: add hooks for audio, bluetooth, game, canvas and vfc
```

**Escopo menor (componente simples):**

```
feat: add main menu and styling in components
```

**Outros tipos:**

```
fix: correct baseline calculation when samples < 2
refactor: extract StatusBar to separate folder
docs: add CONVENTIONS.md with project standards
chore: update eslint to v9
```

### Boas práticas

- Commits pequenos e focados.
- Evite commits genéricos como "fix" ou "update".
- Descrição curta e objetiva.

---

## 11. Checklist antes de commitar

```
[ ] npm run lint — sem erros
[ ] npm run build — build passa
[ ] Mensagem de commit em inglês e semântica
[ ] Nome da branch em inglês (padrão: `<numero-card>/<descricao-em-ingles>/<sprint>`)
[ ] Imports em ordem alfabética, com linha entre default e named
[ ] Sem console.log desnecessários
[ ] Sem código comentado sem razão
[ ] Estilos apenas em styles.tsx (ou arquivo de estilos do componente)
[ ] Componentes e hooks com function declaration; serviços com arrow quando apropriado
[ ] Novos arquivos seguem nomenclatura (PascalCase, camelCase, etc.)
[ ] Constantes em utils/constants.ts com as const
```

---

## Referências

- [ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md) — onde fica cada funcionalidade
- [TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md) — como reutilizar o template para novos jogos
