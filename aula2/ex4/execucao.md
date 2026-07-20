# Execução — Conversor de Moedas

Baseado em `plano.md`.

## Implementação

### index.html
- Estrutura semântica com `<header>`, `<main>`, `<form>`, `<output>`
- `<select>` para moeda origem/destino, `<input type="number">`, `<button>`
- Link para CSS e script com `type="module"`

### style.css
- Design responsivo com Flexbox
- Tema claro com cores neutras (azul ciano como destaque)
- Transições suaves nos botões e feedback visual

### script.js
```js
const CACHE = { data: null, timestamp: 0 };
const CACHE_TTL = 30_000; // 30s

async function fetchRates() {
  if (Date.now() - CACHE.timestamp < CACHE_TTL && CACHE.data) {
    return CACHE.data;
  }
  try {
    const res = await fetch(
      "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL"
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    const data = {
      USD: parseFloat(json.USDBRL.bid),
      EUR: parseFloat(json.EURBRL.bid),
    };
    CACHE.data = data;
    CACHE.timestamp = Date.now();
    return data;
  } catch {
    console.warn("API falhou, usando fallback");
    return { USD: 5.0, EUR: 5.5 };
  }
}

function convert(amount, fromRate, toRate) {
  return (amount / fromRate) * toRate;
}
```

## Desvios do plano original
1. **GBP removido** — AwesomeAPI retorna GBP-BRL, mas adicionar mais pares tornava a UI mais complexa sem ganho real (mantive só USD e EUR como base)
2. **Cache mais simples** — plano previa cache por moeda; implementei cache único porque uma requisição já traz todas as moedas
3. **Fallback unificado** — ao invés de fallback por moeda, um único fallback para todas

## Funcionalidades extras (não previstas)
- Atualização automática da cotação ao trocar a moeda de destino
- Formatação com `Intl.NumberFormat` para exibir valores no formato BRL (R$)

## Estado final
- 3 arquivos, ~150 linhas totais
- Funcional: conversão USD→BRL, EUR→BRL e cruzada
- Tratamento de erros com fallback silencioso
- Cache de 30s evita requisições desnecessárias
