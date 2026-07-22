# Questão 4  Deny-All + Allow-List

## Arquivo do agente

`.opencode/agents/pesquisador.md`:

```yaml
---
mode: subagent
permission:
  "*": "deny"
  "read": "allow"
  "skill": "allow"
  "mcp__context7__*": "allow"
---

Você é um agente pesquisador especializado em consultar documentação técnica. Use o Context7 para buscar documentação atualizada de bibliotecas e responder dúvidas técnicas. Você pode ler arquivos do projeto para entender o contexto, mas nunca edita arquivos, executa comandos ou acessa a internet fora do Context7. Foque em respostas precisas baseadas na documentação oficial.
```

## Por que deny-all é mais seguro?

Com `"*": "deny"`, qualquer ferramenta que não seja permitida explicítamente é bloqueada, caso por exemplo, você use um novo mcp ele será bloqueado mesmo que esqueça de fazer isso
## Teste

- [x] Agente consegue usar ferramentas do Context7?  
- [x] Agente é bloqueado ao tentar editar arquivo?  
- [x] Agente é bloqueado ao tentar executar bash?  
- [x] Agente consegue carregar skills? 

## Conclusão

Caso você tenha um agente primário que você queira que tenha muitas permissõe para acelerar o desenvolvimento, deste modo bloqueia apenas coisas críticas, mas atua livremente no resto.
