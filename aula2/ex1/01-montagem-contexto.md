# Questão 1 — Montagem do Contexto

## As 6 camadas

| Camada | Descrição | Tokens estimados | Fixa ou dinâmica? |
|---|---|---|---|
| 1. System Prompt / Instruções base | Diretrizes fixas que definem o papel, tom e regras gerais do assistente | ~1.500 | Fixa |
| 2. Definição de Ferramentas (Tools) | Esquemas JSON das funções disponíveis para o modelo chamar | ~1.000 | Fixa |
| 3. Esquema de saída / Formatação | Restrições de formato de resposta (JSON schema, regex, etc.) | ~300 | Fixa |
| 4. Histórico da Conversa | Mensagens anteriores trocadas entre usuário e assistente | ~500 por interação | Dinâmica |
| 5. Mensagem atual do usuário | O prompt ou pergunta mais recente enviada pelo usuário | ~150 | Dinâmica |
| 6. Contexto adicional / RAG | Documentos recuperados, contexto de ferramentas, memória externa | ~1.500 | Dinâmica |

## Cálculo após 20 interações

- **Tokens fixos:** 1.500 + 1.000 + 300 = **~2.800 tokens**
- **Tokens dinâmicos por interação:** 500 (histórico) + 150 (mensagem atual) + 1.500 (RAG) = **~2.150 tokens**
- **Tokens dinâmicos (20 × ~2.150):** **~43.000 tokens**
- **Total:** 2.800 + 43.000 = **~45.800 tokens**

## Conclusão

A camada que mais cresce com o tempo é o histórico de conversa da camada 4, por ser dinâmica ela vai sendo aumentanda conforme a adição de informações, é importante para que tenhamos noção do que tem de ser dinâmico e o que pode ser fixo e economizar tokens
