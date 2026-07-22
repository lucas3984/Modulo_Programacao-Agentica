# Questão 2 — Configurando um Servidor MCP

## MCP escolhido

- **Nome:** Context7
- **Justificativa:** O Context7 fornece documentação técnica atualizada de bibliotecas direto no contexto do agente, evitando alucinações de APIs desatualizadas. É útil no desenvolvimento porque elimina a necessidade de abrir o navegador para conferir documentação.

## Configuração no opencode.json

```json
{
  "mcp_servers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@context7/mcp"]
    }
  }
}
```

## Os 4 estágios do ciclo de vida

| Estágio | O que acontece | Quem age | Tokens consumidos |
|---|---|---|---|
| 1. Conexão | OpenCode inicia um subprocesso com `npx -y @context7/mcp` e estabelece comunicação IPC via stdin/stdout | Cliente MCP (OpenCode) | 0 |
| 2. Descoberta (tools/list) | Cliente envia `tools/list`; servidor responde com nome, descrição e schema de cada ferramenta (resolve-library-id e query-docs) | Cliente ↔ Servidor | ~2.000 (10 tools × 200 tokens) |
| 3. Chamada (tools/call) | Agente decide usar uma ferramenta; cliente envia `tools/call` com nome + argumentos; servidor executa a consulta à documentação | Agente → Cliente → Servidor | ~500 entrada + ~1.000 saída por chamada |
| 4. Resposta | Servidor retorna o resultado (documentação + exemplos); cliente injeta no histórico; agente decide próximo passo | Servidor → Cliente → Agente | Variável conforme o conteúdo retornado (pode ser 500–3.000+ tokens) |

## Impacto na context window

- **Tool definitions:** 2.000 tokens (permanentes durante toda a sessão)
- Isso representa **~1,56%** de uma janela de **128K tokens**
- Se configurar **3 MCPs similares:** ~**6.000 tokens** (~**4,68%** ) de custo

## Conclusão

Enquanto a especificidade das ferramentas que você ganha, sobrepõe a "poluição" do contexto, MCPs valem a apena. Quando tiver muitos mcps, já começa a ficar problemático e talvez valha usar menos, ou separar MCPs para cada agente
