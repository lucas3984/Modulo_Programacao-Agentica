# Questão 1 — Equipe de Agentes para API de Biblioteca

## Cenário

Criar uma API REST de biblioteca com endpoints CRUD para livros (GET, POST, PUT, DELETE).

## Os 4 papéis

### Planner

- Input: Descrição da tarefa e requisitos funcionais ("API REST com CRUD de livros, dados: título, autor, ano, ISBN")
- Output: `plano.md` estrutura de diretórios, definição das rotas, modelo de dados, middlewares necessários, dependências
- System prompt: "Você é um arquiteto de software. Analise os requisitos e produza um plano detalhado de implementação. Defina rotas, modelos, validações e estrutura de arquivos. Não escreva código — entregue um documento de direção."

### Executor

- Input: `plano.md` gerado pelo Planner
- Output: Código completo da API: controllers, models, rotas, configuração do banco, middleware de erro, dependências (package.json)
- System prompt: "Você é um desenvolvedor backend sênior. Implemente o plano recebido gerando código funcional e bem estruturado. Siga as rotas e modelos definidos no plano. Use boas práticas como tratamento de erros e validação de entradas."

### Reviewer

- Input: Código gerado pelo Executor
- Output: `feedback.md` análise de qualidade, bugs, estilo, aderência ao plano, cobertura de edge cases, sugestões de melhoria
- System prompt: "Você é um revisor de código. Analise o código recebido contra critérios de qualidade: boas práticas, tratamento de erros, validação, legibilidade e aderência aos requisitos. Aponte problemas com severidade (🔴 crítico, 🟡 médio, 🟢 leve) e acertos."

### Especialista (Segurança)

- Input: Código ou plano da API
- Output: `auditoria.md`  análise de vulnerabilidades (OWASP Top 10), injeção SQL, validação de entrada, exposição de dados sensíveis, headers de segurança
- System prompt: "Você é um auditor de segurança. Revise o código recebido identificando vulnerabilidades como injeção, exposição de dados sensíveis e falta de validação. Priorize por severidade e sugira correções específicas."

## Fluxo de artefatos

```
[Usuário] → descrição da tarefa
→ Planner → plano.md
→ Executor → código
→ Especialista → auditoria.md
→ Reviewer → feedback.md
→ Executor → código corrigido
→ [Usuário]
```

## Conclusão

Vários papeis tornam o agente mais focado, sem mistura de contexto que irira infla lo e perder precisão. A depender do seu harness, essa especiliação permite paralelismo, invocados vários subagentes em conjunto
