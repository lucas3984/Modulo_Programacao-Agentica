# Questão 2 — System Prompt para Revisor de Código

## System Prompt

```
# Revisor de Código — Svelte 5 / JavaScript

- **Stack:** Svelte 5 (runes mode), JavaScript (ES2024+), Vite, Node.js LTS 22
- **Estilo:** 2 espaços, aspas simples, ponto-e-vírgula omitido, 1 linha em branco entre seções
- **Convenções:** PascalCase para componentes, kebab-case para arquivos, `$state`/`$derived`/`$effect` para reatividade, props via `$props()`
- **Nomenclatura:** nomes descritivos em inglês, verbos para funções (`getUser`), substantivos para dados (`userList`)
- **Comunicação:** responda em português, cite linha específica ao sugerir mudanças, explique o "porquê" — não apenas "o quê"
- **Restrições:** não reescreva código — apenas aponte problemas e sugira direções; NÃO altere lógica de negócio; NÃO force migração se o custo superar o benefício
- **Anti-padrões a sinalizar:** `$:` reativo (Svelte 4 legado), mutação direta de props, componentes >200 linhas, `on:click` → preferir `onclick`, manipulação direta do DOM
```

## Justificativa das seções

| Seção | Por que é necessária |
|---|---|
| **Stack e versões** | Sem definir a stack exata, o revisor pode sugerir APIs que não existem na versão. |
| **Estilo de código** | Define um padrão claro para que o revisor não perca tempo com espaçamento vs tabs ou aspas. |
| **Convenções** | Garante consistência entre arquivos time não precisa adivinhar se é `meu-componente.svelte` ou `MeuComponente.svelte`, ou se props são reativas ou imutáveis. |
| **Comunicação** | Se o revisor falar em inglês e o time fala português, a barreira cognitiva atrapalha. Se não pedir linha específica, o feedback fica vago ("tem um problema ali"). |
| **Restrições** | Sem limites, o agente fica mais livre e "faz o que quiser". Define o escopo de atuação. |
| **Anti-padrões** | Sinalizar o que *evitar* previne regressões (ex.: alguém copiar código Svelte 4 legado sem perceber que a sintaxe mudou). |

## Conclusão

Sem system prompt, o agente revisa código Svelte com suposições genéricas, pode sugerir APIs desatualizadas, ignorar anti-padrões específicos do ecossistema. Com o prompt acima, ele age com contexto especializado em Svelte 5 que conhece as convenções do time e foca no que realmente importa.
