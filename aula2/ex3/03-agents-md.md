# Questão 3 — AGENTS.md para Meu Projeto

## Projeto

- **Nome:** Vanilla Dashboard
- **Stack principal:** JavaScript ES6+ (Vanilla), HTML5, CSS3, módulos ES nativos (`type="module"`)

## AGENTS.md completo

```markdown
# AGENTS.md — Vanilla Dashboard

## Stack
JavaScript ES6+ (Vanilla), HTML5, CSS3, módulos ES nativos (type="module")

## Estilo
Funções puras > classes. Arrow functions. `const` > `let`. camelCase em inglês. Desestruturação. Template literals. Evitar mutação de parâmetros.

## Convenções
Kebab-case para arquivos (`user-service.js`). Um arquivo = uma responsabilidade. Exports nomeados. Comentários JSDoc em funções públicas. Testes manuais via console no navegador.

## Comandos
`npx serve .` — servidor estático local | `npx http-server . -p 3000` — alternativa | Abrir `index.html` diretamente no navegador para testes

## Comunicação
Respostas em português. Explicar o "porquê" das mudanças, não apenas o "o quê". Apontar trade-offs quando houver mais de uma abordagem viável.

## Restrições
Zero dependências npm sem aprovação explícita. Sem alterar HTML ou CSS estrutural sem perguntar. Nenhum arquivo .js pode ultrapassar 200 linhas sem refatoração. ES2020+ como alvo mínimo. Proibido importar frameworks — apenas JavaScript vanilla.
```

## Impacto de cada seção

| Seção | Como afeta o agente |
|---|---|
| Stack | Impede o agente de sugerir React, Vue ou qualquer framework — restringe o leque a APIs nativas do browser (Fetch API, DOM, Web Components, etc.) |
| Estilo | Define o dialeto do JavaScript gerado: arrow functions, const, desestruturação — sem classes, sem `var`, sem mutação |
| Convenções | Controla a estrutura do projeto: arquivos em kebab-case, organização um-arquivo-uma-coisa, documentação via JSDoc, sem testes automatizados formais |
| Comandos | Diz exatamente quais comandos o agente deve usar para rodar o projeto — sem `npm run dev`, sem `vite`, sem `vitest` |
| Comunicação | Força o agente a responder em português e a justificar decisões com contexto, não apenas dar comandos |
| Restrições | Cria barreiras de segurança: o agente não adiciona dependências, não mexe em configs alheias e é forçado a refatorar arquivos que crescem demais |

## Conclusão

Sem um AGENTS.md, teriamos que retomar esses conceitos regularmente, e ainda poderiamos esquecer e "permitir" o agente a fazer o código da forma que ele quiiser, fugindo das especificações do projeto