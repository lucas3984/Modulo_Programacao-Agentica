# Questão 4 — Combinação Criativa

## Feature escolhida
Conversor de moedas com fetch de API externa (ex: ExchangeRate-API ou Frankfurter). O usuário seleciona moeda de origem, moeda de destino, digita um valor e vê o resultado convertido em tempo real.

## Sessão 1 — Pesquisa
- **Prompt:**
  > Preciso adicionar um conversor de moedas no TarefasApp. Antes de implementar, quero pesquisar como usar a Fetch API para consumir uma API externa de taxas de câmbio (ExchangeRate-API ou Frankfurter), como tratar erros de rede e como exibir o resultado no DOM sem innerHTML. Use o MCP Context7 para buscar documentação sobre fetch(), tratamento de erros com try/catch e boas práticas de requisições assíncronas em JavaScript vanilla. Salve em **pesquisa-conversor.md**.

- **Peça do harness:** MCP Context7
- **Artefato:** `pesquisa-conversor.md`
- **Estimativa de tokens:** ~3K tokens (busca + curadoria)

## Sessão 2 — Planejamento
- **Prompt:**
  > Baseado no @pesquisa-conversor.md, quero planejar a implementação do conversor de moedas no TarefasApp. Use o subagente @code-reviewer para analisar o código existente e propor: onde adicionar os campos de seleção de moeda e input de valor, como estruturar a função assíncrona de fetch, como lidar com erros de API (taxa não disponível, sem rede) e onde armazenar a taxa para evitar requisições repetidas (cache simples em memória). Salve em **plano-conversor.md**.

- **Peça do harness:** code-reviewer (via delegação)
- **Artefato:** `plano-conversor.md`
- **Estimativa de tokens:** ~4K tokens (código existente + análise)

## Sessão 3 — Execução e Revisão
- **Prompt:**
  > Baseado no @plano-conversor.md, implemente o conversor de moedas no TarefasApp. Carregue a skill js-patterns para seguir os padrões do projeto. Implemente: selects de moeda, input de valor, função fetchMoedas() com cache, exibição do resultado, tratamento de erros. Ao final, use o command `/revisar` para revisar e auditar.

- **Peças do harness acionadas (lista com justificativa):**
  1. **js-patterns skill** garante que o código siga arrow functions, async/await com try/catch, sem var, sem inline events
  2. **/revisar command** orquestra o pipeline completo: code-reviewer (arquitetura), ajustes, security-auditor (segurança)
  3. **code-reviewer** verifica se a estrutura de async/cache está correta
  4. **security-auditor** verifica se a URL da API não está hardcoded de forma insegura, se não há vazamento de dados, se o fetch trata erros de rede
- **Artefato:** `execucao-conversor.md`
- **Estimativa de tokens:** ~12K tokens (implementação + revisão + auditoria)

## Restrições de permissão
- **code-reviewer:** edit deny, bash deny (nunca altera código que analisa)
- **security-auditor:** edit deny, bash deny (só lê e reporta)
- **Agente da Sessão 3 (execução):** edit allow em .html/.css/.js, mas ask para bash (evita execução de comandos não autorizados)

## Reflexão (3-5 frases)
A construção completa de um harness demonstra essa habilidade de montar algo e dominar os agentes, e não simplesmente pedir e esperar que atenda o suficiente