# Questão 1 — Fluxo de Orquestração

## Feature: Categorias com Cores no TarefasApp

### Sessão 1: Pesquisa
- **Prompt que eu digitaria:**
  > Preciso adicionar categorias com cores no TarefasApp. Antes de implementar, quero pesquisar como usar `<input type="color">` no HTML, como implementar um seletor de categorias (Trabalho, Pessoal, Estudo) com cores associadas e como filtrar tarefas por categoria. Use o MCP Context7 para buscar documentação sobre `input[type=color]`, `Array.filter()` e boas práticas de categorização visual no DOM. Salve em **pesquisa-categorias.md**.

- **Peça do harness acionada:** MCP Context7
- **Artefato produzido:** `pesquisa-categorias.md`

### Sessão 2: Planejamento
- **Prompt que eu digitaria:**
  > Baseado no @pesquisa-categorias.md, quero planejar a implementação de categorias com cores no TarefasApp. Use o subagente @code-reviewer para analisar o código existente (index.html, style.css, app.js) e propor onde adicionar: o seletor de categoria no formulário, o `<input type="color">` associado, o indicador visual de cor em cada tarefa e o filtro por categoria. O resultado deve ser um plano detalhado em **plano-categorias.md**.

- **Peça do harness acionada:** code-reviewer (via delegação)
- **Artefato produzido:** `plano-categorias.md`

### Sessão 3: Execução
- **Prompt que eu digitaria:**
  > Baseado no @plano-categorias.md, implemente categorias com cores no TarefasApp. Carregue a skill js-patterns para seguir os padrões do projeto. Implemente tudo: modelo de dados com categoria/cor, seletor no formulário, exibição visual, filtro por categoria.

- **Peças do harness acionadas (lista):**
  - js-patterns skill (carregada durante implementação)
  - `/revisar` command (orquestra pipeline de 3 etapas) - Usado para revisar o que foi feito
  - code-reviewer (etapa 1 do /revisar — arquitetura)
  - security-auditor (etapa 3 do /revisar — auditoria de segurança)
- **Artefato produzido:** `execucao-categorias.md`

### Checklist de verificação
- [x] Todas as 3 sessões têm prompts diferentes
- [x] Cada prompt deixa explícito qual peça do harness deve ser usada
- [x] Os artefatos seguem o padrão: pesquisa-categorias.md, plano-categorias.md, execucao-categorias.md
- [x] As permissões deny-all estão respeitadas (code-reviewer e security-auditor sem edit)
