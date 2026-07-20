# Pesquisa — Conversor de Moedas

## Tecnologias avaliadas

### APIs de cotação
| API | Grátis? | Taxa | Moedas | Requer chave? |
|---|---|---|---|---|
| ExchangeRate-API | Sim (1500 req/mês) | ~2.500 | 170+ | Sim |
| AwesomeAPI | Sim (sem limite) | Tempo real | 190+ | Não |
| CurrencyAPI | Sim (300 req/mês) | ~1.200 | 150+ | Sim |

**Decisão:** AwesomeAPI — sem chave, sem limite, cobertura ampla, endpoint REST simples.

### Stack
- **HTML + CSS + JS Vanilla:** sem frameworks, sem bundler (alinhado ao AGENTS.md do projeto)
- **Fetch API nativa:** sem axios ou biblioteca externa
- **CSS Grid/Flexbox:** layout responsivo sem bibliotecas

## Decisões finais
1. AwesomeAPI como fonte de dados (GET `https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL`)
2. JS Vanilla com módulos ES (`type="module"`)
3. Três pares de moeda fixos: USD/BRL, EUR/BRL, GBP/BRL
4. Cache de 30 segundos para evitar chamadas repetidas
5. Fallback com taxa simulada se a API falhar
