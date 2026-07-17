# Questão 3 — O Ciclo de Tool Calling

## Cenário

Usuário: "Crie um arquivo `saudacao.js` com uma função que retorna 'Olá, {nome}!'"

## Passo a passo do ciclo

| Passo | Quem age | O que acontece | Tipo |
|---|---|---|---|
| 1 | Usuário | Envia o prompt em linguagem natural | Texto |
| 2 | LLM | Interpreta o prompt e decide que a ação necessária é criar um arquivo com `write` | Texto (raciocínio) |
| 3 | LLM | Gera o JSON da tool call com path e conteúdo do arquivo | **JSON (tool call)** |
| 4 | Runtime (host) | Recebe o JSON, valida permissões, e **escreve o arquivo no disco** | **Ação real** |
| 5 | Runtime | Retorna o resultado da operação (sucesso ou erro) para o LLM | Texto/JSON |
| 6 | LLM | Interpreta o resultado e prepara a resposta final | Texto |
| 7 | Usuário | Recebe a confirmação: "Arquivo `saudacao.js` criado com sucesso!" | Texto |

## O momento crítico

No passo 3, o LLM gera um JSON de tool call, ele "pede" a ação de escrita. No passo 4, o runtime (host) executa a ação real no sistema de arquivos. Essa separação é fundamental porque o LLM não tem poder direto sobre o mundo físico; ele só manipula texto. Todo o impacto real (criar, editar, deletar arquivos, rodar comandos) pertence ao runtime, que decide se a tool call é válida e a executa.

## Conclusão

Sem tool calling, este agente seria apenas um chatbot capaz de explicar como criar `saudacao.js`, mas sem poder para realmente criá-lo.
