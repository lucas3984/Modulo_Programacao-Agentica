# Questão 3 — code-reviewer vs security-auditor

## Cenário 1: Novo módulo de relatórios
- **Agente a acionar:** code-reviewer
- **Sessão do fluxo:** 2 (Planejamento)
- **Justificativa:** Validação de arquitetura antes de implementar

## Cenário 2: Verificação pós-implementação
- **Agente a acionar:** security-auditor
- **Sessão do fluxo:** 3 (Execução — auditoria)
- **Justificativa:** A feature já está implementada e o foco é segurança (innerHTML, vazamento de eventos)

## Cenário 3: Renomear variável
- **Agente a acionar:** nenhum
- **Sessão do fluxo:** N/A
- **Justificativa:** Acionar qualquer subagente seria desperdício de tokens, uma edição direta resolve.

## Cenário 4: Feature completa finalizada
- **Agente a acionar:** ambos (via /revisar)
- **Sessão do fluxo:** 3 (Execução — pipeline completo)
- **Justificativa:** O command /revisar orquestra code-reviewer e security-auditor automaticamente.
