# Questão 2 — Quando Usar o MCP Context7

## Cenário A: Canvas API
- **Deve usar Context7?** Sim
- **Justificativa:** Você precisa de documentação externa da Canvas API (beginPath, moveTo, lineTo) — é exatamente o caso de uso do Context7 na Sessão 1 (Pesquisa). Sem ele, o agente dependeria de memória interna ou você precisaria buscar manualmente.
- **Prompt (se aplicável):**
  > Use o MCP Context7 para pesquisar a documentação da Canvas API: sintaxe de beginPath(), moveTo(), lineTo() e como desenhar um gráfico de barras. Salve em pesquisa-canvas.md.

## Cenário B: Revisão de segurança
- **Deve usar Context7?** Não
- **Justificativa:** Verificar XSS é papel do security-auditor no pipeline /revisar, não do Context7. O Context7 pesquisa documentação externa — não audita código. Acioná-lo aqui consumiria tokens sem agregar valor.

## Cenário C: Suporte do toSorted
- **Deve usar Context7?** Sim
- **Justificativa:** Verificar suporte de navegadores (caniuse, MDN compat table) é uma consulta a documentação externa. O Context7 pode buscar a tabela de compatibilidade do Array.toSorted() — informação que o agente não tem no contexto interno.
- **Prompt (se aplicável):**
  > Use o MCP Context7 para pesquisar o suporte do método Array.toSorted() nos navegadores — consulte o MDN ou Can I Use. Salve em pesquisa-tosorted.md.

## Reflexão final
Entender onde há uma necessidade de buscar documentações