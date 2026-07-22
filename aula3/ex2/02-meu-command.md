# Questão 2 — Meu Command Personalizado

## Nome e propósito

- Atalho: `/zipar`
- O que faz: Compacta automaticamente todas as pastas do diretório atual em arquivos `.tar.gz` dentro de um `zipados/`

## Arquivo do command

```markdown
---
description: "Compacta todas as pastas do diretório atual em zipados/. Uso: /zipar"
agent: build
---

Sua tarefa é compactar todas as pastas do diretório atual.

### Instruções passo a passo:

1. Liste o conteúdo do diretório atual com `ls -d */` para identificar as pastas
2. Crie o diretório `zipados/` se não existir: `mkdir -p zipados`
3. Para **cada pasta** encontrada, execute:
   ```bash
   tar -czf "zipados/<nome-da-pasta>.tar.gz" "<nome-da-pasta>/"
   ```
4. Ao final, liste o conteúdo de `zipados/` com `ls -lh zipados/`
5. Informe o tamanho total ocupado

### Formato da resposta:

| Pasta | Original | Compactado | Redução |
|-------|----------|------------|---------|
| aula1/ | 2.1 MB | 800 KB | 62% |

**Total compactado:** X pastas, Y MB
```

## Exemplo de uso

- Input do usuário: `/zipar`
- Resposta esperada: Tabela com cada pasta, tamanhos original e compactado, percentual de redução, e total final

## Teste

- [ ] O command aparece na lista de commands disponíveis?
- [ ] O placeholder $ARGUMENTS expande corretamente?
- [ ] O formato de resposta é seguido?

## Conclusão

Esse comando agiliza um processo que eu vinha fazendo repetitivamente
