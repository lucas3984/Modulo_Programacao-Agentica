# Questão 3 — Glob Patterns

## Respostas

| Cenário | Glob pattern | Explicação |
|---|---|---|
| A) .md na raiz | `*.md` | `*` inclui qualquer nome em 1 nível (raiz); `.md` restringe extensão. Sem `**`, subdiretórios são excluídos. |
| B) src/components/ qq profundidade | `src/components/**/*` | `src/components/` fixa o diretório; `**` permite qualquer profundidade; `*` inclui qualquer arquivo. |
| C) .ts/.tsx exceto tests/ | `src/**/*.{ts,tsx}` combinado com `"src/tests/**/*": "deny"` | Globs são inclusivos (não suportam negação nativa). O pattern `src/**/*.{ts,tsx}` cobre tests também. Para excluir, é necessário um `deny` explícito para `src/tests/`. |
| D) scripts em ./scripts/ | `scripts/**/*.{sh,js,mjs}` | `scripts/` fixa o diretório; `**` inclui subpastas; `*.{sh,js,mjs}` restringe a scripts executáveis. |
| E) Bloquear .env | `**/*.env` com `"deny"` | `**` percorre toda a árvore; `*.env` inclui qualquer arquivo `.env`. Usado como `"**/*.env": "deny"` no lugar de `"edit": "ask"`. |
| F) .css em src/styles/ sem sub | `src/styles/*.css` | `src/styles/` fixa o diretório; `*` (1 nível, sem `**`) impede subdiretórios; `.css` restringe a arquivos CSS. |

## Diferença crítica

`*` (asterisco simples) vs `**` (duplo asterisco):

- `*` inclui qualquer sequência de caracteres em **um único nível** de diretório — ex: `src/*.ts` inclui `src/app.ts` mas **não** `src/components/button.ts`
- `**` inclui qualquer sequência em **qualquer profundidade** — ex: `src/**/*.ts` inclui `src/app.ts` e `src/components/button.ts`

## Conclusão

Tranformar permissões binárias em permissões específicas, deixam o controle do acesso mais granular
