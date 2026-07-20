# Questão 2 — O Loop Agentivo em Ação

## Cenário

Usuário: "Liste os arquivos do diretório src/ e me diga quantos são .ts"

## Sequência de eventos

| Ordem | Evento | Ator responsável | O que acontece |
|---|---|---|---|
| 1 | prompt do usuário | Usuário | Usuário envia a mensagem "Liste os arquivos do diretório src/ e me diga quantos são .ts" |
| 2 | tool-call | Assistente (LLM) | LLM analisa o prompt, decide que precisa executar duas operações e emite `listDirectory(path="src/")` |
| 3 | tool-exec | Runtime (Sistema) | Sistema operacional executa `ls src/` e captura a saída |
| 4 | tool-result | Runtime (Sistema) | Retorna a lista de arquivos: `["index.ts", "app.ts", "utils.ts", "style.css", "README.md"]` |
| 5 | tool-call | Assistente (LLM) | LLM analisa o resultado, decide contar os .ts e emite `filterByExtension(files=[...], extension=".ts")` |
| 6 | tool-exec | Runtime (Sistema) | Sistema filtra a lista e conta os arquivos .ts |
| 7 | tool-result | Runtime (Sistema) | Retorna `{ total: 3, files: ["index.ts", "app.ts", "utils.ts"] }` |
| 8 | finish | Assistente (LLM) | LLM gera a resposta final: "Foram encontrados 3 arquivos .ts no diretório src/" e finaliza com `finish_reason="stop"` |

## Os 5 estados — definições

| Estado | Definição (1 frase) | Exemplo no cenário acima |
|---|---|---|
| text-delta | Fragmento incremental de texto gerado pelo LLM durante streaming | "Foram", " encontrados", " 3", " arquivos", " .ts…" (cada pedaço emitido em tempo real) |
| tool-input-start | Sinaliza que o LLM começou a produzir os argumentos de uma chamada de ferramenta | Antes da ordem 2, o runtime recebe `tool_input_start` indicando que o LLM começará a construir os parâmetros de `listDirectory` |
| tool-call | Chamada de ferramenta completa emitida pelo LLM, contendo nome e argumentos prontos para execução | Ordem 2: `tool_call(name="listDirectory", arguments={"path": "src/"})` |
| tool-result | Resultado da execução de uma ferramenta sendo devolvido ao LLM para consumo | Ordem 4 e 7: o runtime entrega o stdout/saída estruturada de volta ao modelo |
| finish | Sinal terminal indicando que o LLM encerrou sua geração | Ordem 8: `finish_reason="stop"` — o modelo decidiu que não precisa de mais ferramentas e produziu a resposta final |

## Conclusão

Sem o finish, o loop nunca termina e o agente nunca responde. Sem uma forma de limitar ela pode entrar nessa repetição e desperdiçãr tokens