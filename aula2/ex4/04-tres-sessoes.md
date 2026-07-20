# Questão 4 — Estratégia de 3 Sessões

## Projeto escolhido

Conversor de Moedas — aplicação JavaScript Vanilla que consulta cotação em tempo real na AwesomeAPI e converte valores entre USD, EUR e BRL.

## Sessão 1 — Pesquisa

- **Interações:** 2
- **Artefato:** `pesquisa.md` (22 linhas)
- **Experiência:** A pesquisa foi direta porque o escopo é pequeno — comparar 3 APIs gratuitas de câmbio demandou apenas um ciclo de busca e decisão. A segunda interação serviu para refinar a justificativa de escolher AwesomeAPI sobre ExchangeRate-API, já que esta última requer chave de cadastro.

## Sessão 2 — Planejamento

- **Interações:** 2
- **Artefato:** `plano.md` (31 linhas)
- **Experiência:** A primeira interação produziu um plano genérico demais; precisei de uma segunda interação para detalhar as funções, a ordem de implementação e o tratamento de erros. A existência da pesquisa.md ajudou a cortar discussões sobre stack — essa decisão já estava tomada.

## Sessão 3 — Execução

- **Interações:** 3
- **Artefato:** `execucao.md` (48 linhas)
- **Experiência:** A primeira interação implementou o core, a segunda corrigiu um bug no cache (estava usando moeda fixa ao invés de dinâmica) e a terceira documentou os desvios do plano. O plano.md serviu como roteiro, mas na prática 2 decisões de implementação foram alteradas (remoção do GBP, cache simplificado).

## Comparação com sessão monolítica

| Métrica | 3 Sessões | Monolítica (estimada) |
|---|---|---|
| Tokens totais | ~3.200 (pesquisa + plano + execução + documento final) | ~2.500 (tudo em uma única interação gigante) |
| Qualidade do contexto | Alta — cada sessão mantém foco estreito, sem poluição de tópicos passados | Média — contexto único mistura pesquisa, planejamento e código, causando diluição |
| Reusabilidade dos artefatos | Alta — `pesquisa.md` e `plano.md` servem para outros projetos ou revisões futuras | Baixa — tudo está amarrado em um único artefato monolítico |

## Conclusão

Separar em 3 sessões evita que o contexto fique bagunçado com pesquisa, plano e código tudo misturado. Mas o agente pode esquecer detalhes entre uma sessão e outra, por isso um resumo técnico no plano.md pode ajudar em reter essa informação.
