# Plano — Conversor de Moedas

Baseado em `pesquisa.md`.

## Arquitetura
```
aula2/ex4/
  index.html         → estrutura da página
  style.css          → estilos responsivos
  script.js          → lógica principal (módulo ES)
```

## Fluxo do usuário
1. Abre `index.html`
2. Seleciona moeda de origem (fixa: BRL, USD, EUR, GBP)
3. Seleciona moeda de destino
4. Digita o valor
5. Clica em "Converter"
6. Vê o resultado com a cotação usada

## Componentes (funções)
- `fetchRates(base, targets)` → busca cotações na AwesomeAPI
- `convert(amount, rate)` → calcula valor convertido
- `renderResult(value, from, to, rate)` → atualiza DOM
- `handleError(msg)` → exibe erro amigável
- `init()` → configura event listeners no DOM

## Tratamento de erros
- Timeout: fallback para taxa simulada com aviso
- Rede off-line: mensagem clara ao usuário
- Valor inválido: feedback no próprio input
- Cache expirado: nova requisição automática

## Ordem de implementação
1. HTML estrutural
2. CSS responsivo
3. JS: fetchRates → convert → renderResult → handleError → init
