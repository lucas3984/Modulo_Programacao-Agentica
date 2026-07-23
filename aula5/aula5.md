## OpenCode Harness — Aula 05

## Orquestração Completa: Seu Harness em Ação

Duração estimada: 120 minutos (80min leitura + 40min prática)

Nível: Intermediário

Pré-requisitos: Aulas 01, 02, 03 e 04 — Fundamentos de LLM, Contexto, Agentes e Permissões

## Objetivos de Aprendizagem

Ao final desta aula, você será capaz de:

- Orquestrar o fluxo completo de uma nova feature usando todas as peças do seu harness

- O Aplicar a estratégia de 3 sessões com handoff por artefatos em um cenário real

- Acionar o MCP Context7 para pesquisa de documentação durante o fluxo de desenvolvimento

- Delegar o planejamento de arquitetura para o subagente code-reviewer

- O Executar o pipeline completo do command /revisar com revisão e auditoria de segurança

- O Combinar permissões deny-all + allow-list para isolar papéis dos agentes

- O Refletir sobre o ciclo completo e identificar novas combinações criativas para seu harness

## Como Usar Esta Aula

Esta aula não apresenta nenhum conceito novo. Você vai usar TUDO que construiu nas Aulas 01 a 04 em um fluxo real de desenvolvimento. A primeira parte recapitula as peças do seu harness e define o cenário. A segunda parte executa o fluxo completo em 3 sessões. Ao final, o arquivo de Questões de Aprendizagem é seu checkpoint.


## Mapa Mental

O mapa mental acima mostra a estrutura da aula. Cada ramo representa um conceito que você vai explorar.

## Recapitulação: Seu Harness Hoje

Antes de começar, veja o que você já construiu. Cada peça abaixo existe no seu harness porque você a criou nas aulas anteriores:

Peça

Configuração base

+

opencode.json

comunicação do projeto

AGENTS.md

Estratégia de 3

Metodologia com artefatos

Sessões

execução com handoff

.md

Agente

Analisa código JavaScript e sugere

.opencode/agents/code-r

arquitetura

eviewer.md

code-reviewer

Agente

Revisa segurança, performance e

.opencode/agents/securi

boas práticas

ty-auditor.md

security-auditor

Skill js-patterns

Conhecimento

padrões JS vanilla

terns/SKILL.md

Command

Pipeline de 3 etapas: arquitetura,

.opencode/commands/revi

implementação, revisão

sar.md

/revisar

Arquivo

Função

Aula de Origem

Define regras de stack, estilo e

Aula 01 e 02

Separa pesquisa, planejamento e

Aula 02

Aula 03

Aula 03

.opencode/skills/js-pat

injetável

sobre

Aula 03

Aula 03


Peça

Arquivo

Função

Aula de Origem

Permissões deny-all allow-list MCP Context7

Configuração

- em Controle granular de ferramentas Aula 04 e por agente

- \+ opencode.json frontmatter dos agentes

Configuração opencode.json

em Consulta de documentação técnica Aula 04

via ferramentas externas

Cada linha desta tabela representa horas de aprendizado. Você construiu cada peça com suas próprias mãos. Agora é hora de vê-las trabalhando juntas.

## PREPARAÇÃO: O Cenário e as Peças

Esta parte recapitula o estado atual do seu harness e define o problema que você vai resolver. Nenhum conceito novo — apenas reconhecimento do que você já domina.

## 1. O Cenário: Nova Feature no TarefasApp

## O Problema

Você tem um TarefasApp funcional — a lista de tarefas que construiu na Aula 02. Ele permite adicionar tarefas, marcar como concluídas, excluir e persistir os dados no localStorage. O código está em HTML+CSS+JS vanilla, sem frameworks, seguindo exatamente a stack canônica.

## Agora você recebe uma demanda real:

“O TarefasApp precisa de um filtro por status (todas, pendentes, concluídas) e ordenação por data ou prioridade. O filtro e a ordenação devem funcionar juntos.”

## O Que Isso Significa para o Harness

Não se trata apenas de escrever código. Esta demanda envolve:

- 1. Pesquisar as APIs nativas do JavaScript para filtrar e ordenar arrays — Array.filter() e Array.sort()

- 2. Planejar a arquitetura: onde colocar a lógica, como integrar com o código existente, como garantir que filtro e ordenação funcionem em conjunto

- 3. Implementar o código seguindo os padrões definidos na sua skill js-patterns

- 4. Revisar o código para garantir qualidade, segurança e ausência de vulnerabilidades (especialmente XSS em manipulação de DOM)

- 5. Entregar o resultado com documentação mínima

Cada um desses passos é uma oportunidade para uma peça diferente do seu harness brilhar.

## O Estado do TarefasApp

O TarefasApp que você construiu na Aula 02 é um projeto HTML+CSS+JS vanilla com três arquivos:


- index.html — Estrutura da página com um formulário de adicionar tarefa (<input> + <button>) e uma lista não ordenada (<ul id="task-list">) onde as tarefas renderizadas aparecem. Sem frameworks, sem bibliotecas externas.

- style.css — Estilos para a lista de tarefas, com classes semânticas (.task-item, .completed, .task-actions), cores suaves e transições para feedback visual. Design responsivo básico com max-width e margin: auto.

- app.js — Lógica completa em JavaScript vanilla: função addTask() que cria o objeto {id, text, completed, createdAt, priority}, função renderTasks() que percorre o array e constrói os elementos DOM, funções toggleTask() e deleteTask() para manipular cada item, e saveTasks()/loadTasks() para persistência via localStorage.

O estado atual é funcional e testado. A nova feature de filtro/ordenação não precisa quebrar nada do que já existe — ela adiciona uma camada por cima. O plano é: os controles de filtro e ordenação entram como novos elementos HTML no topo da lista; as funções filterTasks() e sortTasks() são funções puras que transformam o array de tarefas ANTES de passar para renderTasks(); e a função renderFilteredTasks() substitui a chamada direta a renderTasks() nos event listeners. O resto do código permanece intacto.

## Como a Feature se Encaixa Sem Refatoração

A chave para adicionar uma feature sem refatorar o código existente está na arquitetura de funções puras. O renderTasks() atual recebe um array de tarefas e constrói o DOM — ele não sabe nem precisa saber se o array veio do localStorage, de um filtro ou de uma ordenação. A nova renderFilteredTasks() faz exatamente o mesmo contrato: recebe um array, passa pelo filtro, passa pela ordenação e entrega para renderTasks(). Do ponto de vista do renderTasks(), nada mudou.

Isso significa que os event listeners existentes (submit do formulário, clique no botão de toggle, clique no botão de delete) continuam funcionando sem alteração. Eles chamam renderFilteredTasks() em vez de renderTasks(), mas o resto do fluxo é idêntico. As funções addTask(), toggleTask(), deleteTask(), saveTasks() e loadTasks() permanecem exatamente como estavam na Aula 02.

A única adição no JavaScript são as três funções novas (filterTasks, sortTasks, renderFilteredTasks) e os event listeners nos <select> que disparam renderFilteredTasks() quando o usuário muda o filtro ou a ordenação. O HTML ganha dois <select> dentro de uma .filter-bar. O CSS ganha estilos para essa nova barra. Nada mais. Feature adicionada, zero refatoração.

## Por Que Usar o Harness para Isso

Você poderia simplesmente escrever o código manualmente — é um filtro e uma ordenação, afinal. Mas o objetivo desta aula é diferente: você vai treinar seu harness em um cenário real. Quando a demanda for complexa (múltiplos componentes, várias fontes de dados, prazos apertados), você já saberá exatamente como orquestrar cada peça.

Pense nisso como um ensaio geral. O palco é o TarefasApp, mas a peça é o seu harness.


## 2. As Peças do Seu Harness

## Checklist de Verificação

Antes de começar, confirme que cada peça existe no seu projeto:

- opencode.json com configuração base e regras de stack

- AGENTS.md com convenções do projeto

- .opencode/agents/code-reviewer.md — agente de revisão de código

- .opencode/agents/security-auditor.md — agente de auditoria de segurança

- .opencode/skills/js-patterns/SKILL.md — skill de padrões JavaScript

- .opencode/commands/revisar.md — command de pipeline de revisão

- Permissões deny-all configuradas para agentes especialistas

- MCP Context7 registrado no opencode.json

## Recapitule o Papel de Cada Uma

Cada peça tem um momento específico para brilhar no fluxo:

Peça

MCP Context7

Na pesquisa: “como funciona

Array.filter() mesmo?”

code-reviewer

Antes de implementar: “qual a melhor arquitetura para isto?”

js-patterns skill

Durante a implementação: “quero seguir os padrões do projeto”

security-auditor

Depois de implementar: “este código é seguro?”

/revisar command

Para orquestrar o pipeline completo

Permissões

Para garantir que cada agente só faz o que deve

Quando Usar

## A Dança das Peças

O segredo da orquestração não é usar todas as peças ao mesmo tempo. É usar cada peça no momento certo. O MCP Context7 não precisa estar ativo durante a implementação. O security-auditor não precisa ser invocado durante a pesquisa. Cada peça entra e sai do palco no seu momento, como músicos em uma orquestra.

O que Evitar

Usar para tudo — ele consome tokens e só serve documentação

Pedir revisão depois de implementar — o custo de mudar é maior

Carregar sem necessidade — skill ocupa contexto enquanto ativa

Pular a auditoria — segurança em app web não é opcional

Usar quando só precisa de uma parte — o command é completo

Ignorar — agente sem restrição pode danificar o projeto

## 3. A Estratégia: 3 Sessões, 1 Resultado

## O Padrão que Você Já Conhece

Na Aula 02, você aprendeu e praticou a estratégia de 3 sessões:

- 1. Sessão 1 — Pesquisa: explorar, entender, documentar. Artefato: pesquisa.md

- 2. Sessão 2 — Planejamento: arquitetar, estruturar, decidir. Artefato: plano.md


- 3. Sessão 3 — Execução: implementar, revisar, entregar. Artefato: execução.md

Cada sessão é uma conversa nova com o agente. Cada sessão produz um artefato .md que a próxima consome com @arquivo.md. Este é o protocolo de handoff que você domina desde a Aula 02.

## O Que é Diferente Agora

Nas aulas anteriores, você executou a estratégia de forma manual — você mesmo mudava de sessão e referenciava os artefatos. Nesta aula, o próprio agente orquestra as peças. Quando você digita o prompt da Sessão 1, o agente:

- Decide usar o MCP Context7 para pesquisar documentação

- Carrega a skill js-patterns quando precisa de referência de padrões

- Delega para o code-reviewer planejar a arquitetura

- Invoca o security-auditor para verificar segurança

- Usa o command /revisar como atalho para o pipeline completo

O harness inteiro trabalha para você, não ao seu lado.

## O Fluxo Completo

Cada seta representa uma delegação. Cada artefato é um handoff. O agente principal coordena tudo — você só dá o pontapé inicial e valida o resultado.

## Monolítica vs 3 Sessões: Comparação

A tabela abaixo mostra por que a estratégia de 3 sessões vence a abordagem monolítica em cenários reais:

Aspecto

Interações totais

~40 interações (pesquisa + planejamento + implementação + correções em sequência)

Tokens consumidos (estimativa)

~80K tokens — o contexto acumula pesquisa inicial, idas e vindas de

planejamento, tentativa e erros

Qualidade do artefato final

Média a baixa — as decisões de arquitetura foram tomadas sob

Sessão Monolítica

3 Sessões com Handoff

~15 por sessão, ~45 totais (mesmo número total, mas organizado)

~45K tokens totais — cada sessão tem ~15K tokens focados, sem arrastar lixo de contexto entre etapas

implementação

Alta — cada decisão foi pensada no momento certo, com contexto limpo; o plano orientou a implementação


Aspecto

## Sessão Monolítica

pressão de implementação; código tende a ter “gambiarras”

Baixa — toda a informação está enterrada no histórico da conversa; impossível reusar só a pesquisa ou só o plano

Alto — mudar a arquitetura depois de 20 interações de implementação significa descartar código

Difícil — difícil separar “o que foi pesquisado” de “o que foi implementado”

3 Sessões com Handoff

## Reusabilidade

Alta — cada sessão produz um artefato .md curado que pode ser reusado em outras features ou compartilhado com outros devs

## Custo de retrabalho

Baixo — se o plano precisar mudar, muda-se o plano.md (2-3 interações) antes de qualquer código escrito

## Facilidade de auditoria

Fácil — cada artefato tem um propósito claro; o execução.md mostra exatamente o que foi entregue

## Por Que 45K < 80K: A Matemática do Contexto

A diferença de 35K tokens entre as duas abordagens não é um detalhe técnico — é o fator que determina se o modelo consegue manter coerência até o final. Em uma sessão monolítica, os primeiros 10K tokens contêm a pesquisa de Array.filter() e Array.sort(). Os próximos 20K tokens contêm o planejamento da arquitetura. Na hora de implementar (token 30K+), o modelo já está operando sobre um contexto poluído com informação exploratória que não é mais relevante.

Nas 3 sessões, cada uma começa com contexto limpo. A Sessão 1 gasta 15K tokens exclusivamente com pesquisa. A Sessão 2 carrega apenas o pesquisa.md (~300 tokens) mais o código do TarefasApp — o modelo não precisa “lembrar” da pesquisa anterior porque o artefato já condensou as decisões. A Sessão 3 carrega o plano.md (~300 tokens) e implementa com contexto mínimo. O resultado: cada sessão opera na janela de atenção ideal do modelo, sem ruído.

## O Que Você Não Precisa Fazer

Você não precisa: - Escrever o código de filtro e ordenação do zero — o agente implementa - Lembrar a sintaxe exata de Array.sort() com comparator — o Context7 busca - Revisar manualmente cada linha — o code-reviewer e o security-auditor fazem isso - Gerenciar tokens manualmente — a estratégia de 3 sessões mantém cada contexto enxuto

Seu papel é orquestrar — dar a direção certa no momento certo.

## Quick Check 1

- 1. Qual o propósito de dividir o trabalho em 3 sessões em vez de fazer tudo em uma sessão longa? Resposta: Cada sessão tem um contexto enxuto e foco único. Uma sessão monolítica acumularia histórico de pesquisa, planejamento e implementação — inchando o contexto e aumentando o risco de compactação prematura. As 3 sessões consomem menos tokens e produzem artefatos curados.

- 2. O que acontece se você pular a Sessão 2 (planejamento) e pedir para o agente implementar diretamente? Resposta: O agente precisará tomar decisões de arquitetura durante a implementação, o que é ineficiente e aumenta o risco de retrabalho. Sem um plano, não há contato do que será entregue — e mudanças de arquitetura no meio da implementação são custosas.

## APLICAÇÃO: O Fluxo Completo em Ação

Agora que você recapitulou as peças e a estratégia, vamos executar o fluxo real. Cada sessão abaixo mostra um prompt que você digitaria e o que o harness faz com ele.


## 4. Sessão 1 — Pesquisa com MCP

## O Prompt

Você abre uma nova sessão no OpenCode e digita:

“Preciso adicionar filtro por status e ordenação por data/prioridade no TarefasApp. Antes de implementar, quero pesquisar as APIs nativas do JavaScript para filtrar e ordenar arrays. Use o Context7 para buscar documentação oficial de Array.filter() e Array.sort(). Documente as opções e salve em pesquisa.md.”

## O Que o Harness Faz

- 1. O agente principal recebe o prompt e monta o contexto com regras do AGENTS.md e configuração do opencode.json

- 2. O agente identifica que precisa de documentação externa — invoca o MCP Context7

- 3. O Context7 busca a documentação oficial de Array.filter() e Array.sort()

- 4. O agente processa a documentação, complementa com seu conhecimento próprio e produz o artefato

## O Artefato pesquisa.md

```
\# Pesquisa: Filtro e Ordenação no TarefasApp
## Array.filter()
Cria um novo array com elementos que passam em um teste.
```js
const numeros = [1, 2, 3, 4, 5];
const pares = numeros.filter(n => n % 2 === 0);
// pares: [2, 4]
```

Aplicação no TarefasApp: filtrar tarefas por task.completed.

## Array.sort()

Ordena elementos in-place e retorna o array. Aceita função comparator.

```
const tarefas = [
{ texto: "Comprar pao", prioridade: "alta" },
{ texto: "Lavar louca", prioridade: "baixa" },
];
// Por prioridade (alfabética)
tarefas.sort((a, b) => a.prioridade.localeCompare(b.prioridade));
// Por data (crescente)
tarefas.sort((a, b) => new Date(a.criadaEm) - new Date(b.criadaEm));
Atenção: sort() modifica o array original. Sempre faça uma cópia: [...array].sort().
```


## Decisões Tomadas

- Filtro por status: usar filter() com parâmetro "all", "pending", "completed"

- Ordenação: usar sort() com comparator, combinando data e prioridade

- Filtro e ordenação: aplicar filter primeiro, depois sort no resultado filtrado

- Sempre criar cópia do array antes de ordenar para não mutar o estado

\### Anatomia de um Bom Artefato de Pesquisa

Note a estrutura do `pesquisa.md`: ele não é uma transcrição da documentação do MDN. É um documento **curado** que o agente produziu após processar a documentação do Context7 e filtrar o que é relevante para o TarefasApp. As seções são:

- 1. **API Reference** — O que a função faz, com exemplo mínimo. Serve como consulta rápida durante a implementação.

- 2. **Aplicação no TarefasApp** — Como aquela API se traduz para o problema real. Conecta a documentação genérica ao contexto específico.

- 3. **Decisões Tomadas** — As escolhas concretas que guiarão o planejamento e a implementação. Esta é a seção mais importante para o handoff: a Sessão 2 carrega apenas essas decisões (~200 tokens), não a documentação inteira (~3000 tokens).

Um bom artefato de pesquisa tem entre 200 e 500 tokens, responde a três perguntas ("o que é?", "como se aplica?", "o que decidimos?") e é auto-contido — qualquer pessoa (ou agente) que o leia entende o contexto sem precisar consultar a fonte original.

\### Por Que o Context7 Foi a Peça Certa

O MCP Context7 foi desenhado para consultar documentação técnica. Em vez de o agente "adivinhar" a sintaxe de `Array.sort()` ou você precisar buscar no Google, o Context7 traz a documentação oficial direto para o contexto do agente. É a ferramenta certa para a fase de pesquisa.

Note que o prompt não precisou especificar "chame o MCP Context7" — você poderia simplesmente perguntar "como funciona filter e sort em JavaScript?" e deixar o agente decidir qual ferramenta usar. Mas ser explícito reduz o tempo de execução e garante que a ferramenta certa seja usada.

\### O Que Fica para a Próxima Sessão

Observe que o `pesquisa.md` contém apenas informação. Não há código implementado, nenhuma decisão de arquitetura final, nenhum compromisso com uma abordagem específica. A Sessão 1 é propositalmente rasa em comprometimento — ela explora o terreno sem cravar bandeiras. É a Sessão 2 que vai decidir o caminho.

Esta separação entre **explorar** (Sessão 1) e **decidir** (Sessão 2) é o que mantém o contexto limpo. Se você misturar as duas, o agente gasta metade dos tokens defendendo decisões que tomou cedo demais. A pesquisa deve ser neutra, informativa e descompromissada.

\---

\## 5. Sessão 2 — Planejamento com Delegação

\### O Prompt

Você inicia uma nova sessão (fechou a anterior após salvar `pesquisa.md`) e digita:

- \> *"Baseado no @pesquisa.md, quero planejar a implementação do filtro e ordenação no

L


TarefasApp. Use o subagente @code-reviewer para analisar o código existente e propor a arquitetura ideal. O resultado deve ser um plano detalhado em `plano.md`."*

\### O Que o Harness Faz

- 1. O agente principal carrega o `pesquisa.md` via `@` e identifica o código existente do TarefasApp

- 2. O agente invoca o subagente **`code-reviewer`** em uma sessão filha isolada

- 3. O `code-reviewer` analisa a estrutura atual do TarefasApp (arquivos HTML, CSS, JS) e sugere:

- \- Onde adicionar os controles de filtro no HTML

- \- Como estruturar as funções de filtro e ordenação

- \- Como integrar com o sistema de renderização existente

- 4. O `code-reviewer` retorna a análise para o agente principal

- 5. O agente principal compila o plano final e salva em `plano.md`

\### O Artefato `plano.md`

- ```markdown

- \# Plano: Filtro e Ordenação no TarefasApp

\## Arquitetura Proposta

\### 1. HTML — Adicionar controles no header

- \- `<select id="filter-select">` com opções "Todas", "Pendentes", "Concluídas"

- \- `<select id="sort-select">` com opções "Data (crescente)", "Data (decrescente)",

"Prioridade"

\### 2. CSS — Estilizar controles

- \- Classe `.filter-bar` para o container

- \- Manter consistência com o design atual (cores, bordas, padding)

\### 3. JavaScript — Três novas funções puras

```js

filterTasks(tasks, filter) // retorna array filtrado sortTasks(tasks, sortBy, order) // retorna array ordenado (cópia) renderFilteredTasks() // combina filter + sort e atualiza o DOM

## 4. Integração

- Conectar os <select> via addEventListener('change', renderFilteredTasks)

- A função renderFilteredTasks substitui a renderização atual

- Estado do filtro e ordenação em variáveis globais no escopo do módulo

## Critérios de Aceite

- Filtro e ordenação funcionam juntos (ex: “pendentes” + “por data”)

- Navegação por teclado nos selects (Tab, Enter, setas)

- Nenhum warning de acessibilidade (aria-label nos selects)


- Código segue padrões da skill js-patterns (arrow functions, const, composição)

\### Por Que o code-reviewer Foi a Peça Certa

- O `code-reviewer` é o arquiteto do time. Ele não escreve código — ele **pensa na estrutura**. Usar o `code-reviewer` antes de implementar é como consultar um arquiteto antes de construir uma casa: você evita paredes tortas, cômodos mal posicionados e retrabalho.

- O isolamento de contexto do subagente é proposital: o `code-reviewer` recebe apenas o código do TarefasApp e a demanda de filtro/ordenação. Ele não vê o histórico da sua conversa, não se distrai com decisões passadas. Foco total na arquitetura.

\### Por Que code-reviewer com edit: deny?

Na Aula 03, você configurou o `code-reviewer` com `edit: deny` — o que significa que este agente **não pode modificar arquivos**. Ele pode ler, analisar e sugerir, mas nunca alterar o código. Essa restrição não é acidental: ela reflete o princípio do menor privilégio que você aprendeu na Aula 04.

- O `code-reviewer` é um revisor de arquitetura. Seu papel é inspecionar o código existente e responder perguntas como "onde devo adicionar os controles de filtro?" ou "esta estrutura de funções está correta?". Se ele pudesse modificar os arquivos durante a análise, dois problemas surgiriam:

- 1. **Mudanças não autorizadas**: o revisor poderia "corrigir" algo que julgou errado sem passar pela sua validação — violando a separação entre analisar e modificar. 2. **Efeito colateral no código**: durante a análise, o agente poderia salvar alterações parciais ou incompletas, deixando o projeto em estado inconsistente.

O padrão **deny-all + allow-list** que você aplicou na Aula 04 resolve isso de forma elegante. O `code-reviewer` tem permissão de `read` sobre arquivos `.html`, `.css`, `.js` e `.md` (para análise), mas `edit` negado para todos os tipos. O `security-auditor` segue a mesma lógica. Já o agente da Sessão 3, que executa a implementação, tem `edit: allow` nos arquivos do TarefasApp. Cada agente recebe

exatamente as permissões de que precisa — nem mais, nem menos.

\### O Padrão Deny-all em Ação no Fluxo

Veja como o padrão deny-all + allow-list se manifesta em cada agente durante o fluxo de 3 sessões:

| Agente | Permissão de Leitura | Permissão de Escrita | Por Quê |

|---|---|---|---|

| **Agente da Sessão 1 (Pesquisa)** | `read: allow` em `.md` | `edit: allow` em `.md` | Precisa ler documentação do Context7 e salvar `pesquisa.md` |

| **code-reviewer (Sessão 2)** | `read: allow` em `.html`, `.css`, `.js`, `.md` | `edit: deny` em todos | Analisa mas nunca modifica — revisor não altera o que revisa | | **Agente da Sessão 3 (Execução)** | `read: allow` em todos | `edit: allow` em `.html`, `.css`, `.js` | Implementa a feature — precisa ler e modificar os arquivos do projeto |

| **security-auditor** | `read: allow` em `.js`, `.html` | `edit: deny` em todos | Audita sem alterar — mesma lógica do code-reviewer |

Note que o `edit: deny` para o `code-reviewer` não é uma limitação — é um **contrato de design**. O agente foi criado para analisar e recomendar, não para modificar. Se você quiser que ele sugira alterações, ele pode fazer isso no texto do plano (`.md`). Mas alterar o código fonte? Só o agente de execução pode fazer isso, e apenas após o

L


planejamento estar aprovado. Essa separação de privilégios é o que torna o fluxo seguro e auditável.

\### Quick Check 2

**1. Por que o code-reviewer deve ser usado ANTES da implementação, e não depois?**

**Resposta:** O `code-reviewer` analisa requisitos e propõe arquitetura. Usá-lo antes da implementação evita retrabalho — mudar arquitetura depois de implementar custa mais tempo e tokens. O `security-auditor`, por outro lado, entra depois da implementação para verificar segurança.

- *2. Qual a diferença entre carregar a skill `js-patterns` e invocar o subagente `code-reviewer`?**

**Resposta:** A skill `js-patterns` injeta conhecimento sobre padrões JavaScript no contexto do agente atual — é informação passiva. O subagente `code-reviewer` é um agente separado que analisa o código e devolve uma análise — é processamento ativo. A skill informa; o subagente executa.

\---

```
\## 6. Sessão 3 — Execução, Revisão e Auditoria
```

\### O Prompt

Você inicia a terceira sessão (fechou a Sessão 2 após salvar `plano.md`) e digita:

- \> *"Baseado no @plano.md, implemente o filtro e ordenação no TarefasApp. Use o command `/revisar` ao final para revisar o código completo."*

\### O Que o Harness Faz

Este é o momento mais rico do fluxo. O agente principal:

1. Carrega o `plano.md` via `@`

2. Lê os arquivos existentes do TarefasApp (`index.html`, `style.css`, `app.js`)

3. Carrega a skill **`js-patterns`** para garantir que o código siga os padrões do

projeto

4. Implementa as três funções: `filterTasks()`, `sortTasks()`, `renderFilteredTasks()`

5. Atualiza o HTML com os controles de filtro e ordenação

6. Atualiza o CSS com estilos para a nova `.filter-bar`

7. Ao final, invoca o command **`/revisar`** com o escopo da implementação

\### O Código Gerado (pelo Agente)

As funções principais que o agente implementa no `app.js`:

```
```js
// === Filtro e Ordenação ===
function filterTasks(tasks, filter) {
if (filter === "all") return tasks;
return tasks.filter((task) =>
filter === "completed" ? task.completed : !task.completed
);
}
function sortTasks(tasks, sortBy, order) {
const sorted = [...tasks];
sorted.sort((a, b) => {
if (sortBy === "date") {
```

L


```
return order === "asc"
? new Date(a.createdAt) - new Date(b.createdAt)
: new Date(b.createdAt) - new Date(a.createdAt);
}
if (sortBy === "priority") {
const levels = { high: 3, medium: 2, low: 1 };
return order === "asc"
? levels[a.priority] - levels[b.priority]
: levels[b.priority] - levels[a.priority];
}
return 0;
});
return sorted;
}
function renderFilteredTasks() {
const tasks = getTasks();
const filter = document.getElementById("filter-select").value;
const sortBy = document.getElementById("sort-select").value;
const filtered = filterTasks(tasks, filter);
const sorted = sortTasks(filtered, sortBy, "asc");
renderTaskList(sorted);
}
```

## HTML e CSS Gerados pelo Agente

Além das funções JavaScript, o agente também modifica o HTML e o CSS para incluir os controles de filtro. No index.html, ele adiciona um container .filter-bar dentro do <header> da aplicação, antes da <ul id="task-list">:

```
<div class="filter-bar">
<label for="filter-select">Filtrar:</label>
<select id="filter-select" aria-label="Filtrar tarefas por status">
<option value="all">Todas</option>
<option value="pending">Pendentes</option>
<option value="completed">Concluídas</option>
</select>
<label for="sort-select">Ordenar:</label>
<select id="sort-select" aria-label="Ordenar tarefas">
<option value="date-asc">Data (crescente)</option>
<option value="date-desc">Data (decrescente)</option>
<option value="priority">Prioridade</option>
</select>
</div>
```

No style.css, o agente adiciona uma classe .filter-bar com estilos consistentes com o design atual:

```
.filter-bar {
display: flex;
align-items: center;
gap: 0.5rem;
padding: 0.75rem 1rem;
background: var(--bg-secondary, #f5f5f5);
border-radius: 8px;
```

L


```
margin-bottom: 1rem;
}
.filter-bar label {
font-size: 0.875rem;
font-weight: 500;
color: var(--text-secondary, #555);
}
.filter-bar select {
padding: 0.375rem 0.75rem;
border: 1px solid var(--border-color, #ddd);
border-radius: 4px;
background: var(--bg-primary, #fff);
font-size: 0.875rem;
cursor: pointer;
}
.filter-bar select:focus {
outline: 2px solid var(--accent-color, #4a90d9);
outline-offset: 2px;
}
```

Note que o agente seguiu os padrões da skill js-patterns: classes semânticas (.filter-bar em vez de .filtro ou .div1), sem inline styles (tudo em CSS), seletores por classe em vez de por ID, e uso de variáveis CSS (var(--bg-secondary)) para manter consistência com o tema existente. Os aria-label nos selects garantem acessibilidade para leitores de tela — um requisito que o code-reviewer já havia sinalizado no plano.

## Como as Três Funções se Integram

O fluxo de dados é simples e previsível: quando o usuário muda o <select> de filtro ou ordenação, o evento change dispara renderFilteredTasks(). Esta função lê o estado atual das tarefas via getTasks(), passa pelo filterTasks() que devolve um subconjunto, passa pelo sortTasks() que reordena sem mutar o original, e entrega o resultado para renderTaskList() que atualiza o DOM.

Cada função tem uma responsabilidade única e não depende das outras:

- filterTasks() não sabe que existe ordenação — ela só filtra.

- sortTasks() não sabe que existe filtro — ela só ordena.

- renderFilteredTasks() coordena as duas, mas não sabe como cada uma funciona internamente.

Esta composição de funções puras é o padrão que a skill js-patterns recomenda e que o code-reviewer validou. É o mesmo padrão que você usará em qualquer feature futura: funções pequenas, cada uma fazendo uma coisa, combinadas por uma função orquestradora.

## O Pipeline /revisar em Ação

Quando o agente invoca /revisar, o command executa 3 etapas automaticamente:

Etapa 1 — Arquitetura (code-reviewer) O code-reviewer verifica se a implementação seguiu o plano. Ele confirma que as funções são puras, a separação de responsabilidades está correta e a integração com o código existente é limpa.


Etapa 2 — Implementação (agente principal) Com base no feedback do code-reviewer, o agente ajusta o que for necessário. Neste caso, o code-reviewer sugere adicionar aria-label nos selects para acessibilidade — o agente implementa.

Etapa 3 — Auditoria (security-auditor) O security-auditor examina o código com atenção especial para:

```
// Ponto crítico: renderização segura
function createTaskElement(task) {
const li = document.createElement("li");
li.className = "task-item";
// textContent sanitiza automaticamente — sem risco de XSS
const textSpan = document.createElement("span");
textSpan.textContent = task.text;
li.appendChild(textSpan);
return li;
}
```

O security-auditor verifica que o código usa textContent em vez de innerHTML para exibir o texto da tarefa — eliminando risco de XSS. Ele também confirma que não há manipulação insegura de DOM, que os eventos estão limpos e que não há vazamento de dados.

## O Artefato execução.md

```
\# Execução: Filtro e Ordenação no TarefasApp
## O que foi implementado
- [x] Select de filtro: "Todas", "Pendentes", "Concluídas"
- [x] Select de ordenação: "Data (crescente)", "Data (decrescente)", "Prioridade"
- [x] Função `filterTasks(tasks, filter)` — pura, sem efeitos colaterais
- [x] Função `sortTasks(tasks, sortBy, order)` — cópia antes de ordenar
- [x] Função `renderFilteredTasks()` — integra filter + sort + render
## Revisão (code-reviewer)
- Aprovado: funções seguem separação de responsabilidades
- Sugestão: adicionar aria-label nos selects — implementado
## Auditoria (security-auditor)
- Aprovado: sem uso de innerHTML, sem risco de XSS
- Aprovado: eventos conectados via addEventListener, sem onclick inline
- Nota: 9/10
## Como testar
1. Abra o index.html no navegador
2. Adicione algumas tarefas com prioridades diferentes
3. Use o filtro para mostrar só "Concluídas"
4. Use a ordenação para ver por data decrescente
```

## 7. O Resultado: Feature Entregue, Harness Validado


## O Que Aconteceu

Em 3 sessões, com prompts que você digita em menos de 2 minutos cada, o seu harness:

- 1. Pesquisou documentação oficial via MCP Context7 (Sessão 1)

- 2. Planejou a arquitetura com o subagente code-reviewer (Sessão 2)

- 3. Implementou seguindo os padrões da skill js-patterns (Sessão 3)

- 4. Revisou cada linha com o pipeline /revisar (Sessão 3)

- 5. Auditou segurança com o security-auditor (Sessão 3)

- 6. Documentou cada etapa em artefatos .md com handoff (Sessões 1, 2, 3)

Tudo isso sem você escrever uma linha de código manualmente. Você orquestrou.

## Onde Cada Peça Brilhou

| Onde Cada Peça Brilhou |   |   |   |
| --- | --- | --- | --- |
| Peça do Harness |   | Onde Apareceu | Por Que Foi Essencial |
| opencode.json AGENTS.md | + | Contexto de todas as sessões | Definiu as regras de stack e comportamento que o agente seguiu |
| Estratégia de 3 Sessões |   | Estrutura do fluxo | Manteve cada contexto enxuto e produziu artefatos curados |
| MCP Context7 |   | Sessão 1 | Trouxe documentação oficial de filter/sort sem sair do terminal |
| code-reviewer |   | Sessão 2 e Etapa 1 do /revisar | Garantiu que a arquitetura estava correta antes de implementar |
| js-patterns skill |   | Sessão 3 durante implementação | Assegurou que o código seguisse arrow functions, const/let, composição |
| /revisar command |   | Sessão 3 | Orquestrou o pipeline completo de revisão com um atalho |
| security-auditor |   | Etapa 3 do /revisar | Verificou ausência de XSS e manipulação insegura de DOM |
| Permissões |   | Durante toda a execução | code-reviewer e security-auditor tinham edit:deny — não podiam alterar código sem autorização |

## O Que Aprendemos

Esta aula não foi sobre filtro e ordenação. Foi sobre ver o harness funcionando como um sistema. Cada peça isolada é útil, mas o poder real aparece quando elas trabalham juntas:

Sem o MCP Context7, a pesquisa dependeria de busca manual. Em vez de o agente consultar a documentação oficial de Array.filter() automaticamente, você precisaria abrir o navegador, pesquisar no MDN, copiar e colar no prompt. O MCP Context7 elimina essa interrupção: documentação chega direto no contexto do agente, no momento certo. O ganho não é só de tempo — é de fluidez. Você não perde o foco interrompendo o fluxo para uma busca paralela.

Sem o handoff, cada sessão recomeçaria do zero. A estratégia de 3 sessões só funciona por causa dos artefatos .md. Sem eles, a Sessão 2 não saberia o que a Sessão 1 descobriu, e a Sessão 3 não teria um plano para seguir — cada sessão precisaria de um prompt longo reexplicando tudo. Os artefatos são a memória do fluxo: condensam conhecimento em formato portátil e reutilizável.


Sem a skill js-patterns, o código perderia consistência. A skill js-patterns é a memória de estilo do projeto. Quando o agente da Sessão 3 a carrega, ele sabe que deve usar arrow functions, const, classes semânticas e composição de funções. Sem a skill, o código seria funcional mas sem identidade — cada feature pareceria escrita por uma pessoa diferente.

Sem permissões e estratégia, o harness seria um caos. As permissões deny-all + allow-list (Aula 04) mantêm cada agente no seu papel: o security-auditor só audita, o code-reviewer só analisa, ninguém sobrescreve o trabalho alheio. A estratégia de 3 sessões dá a cada peça seu momento certo. Orquestração não é soma — é multiplicação: uma peça sozinha dá 1x, oito peças orquestradas podem dar 10x.

## O Padrão Que Você Repetirá

Este fluxo — pesquisar, planejar, executar com revisão — é o padrão que você usará em qualquer feature, em qualquer projeto. O TarefasApp foi o campo de treino. Amanhã pode ser um dashboard, uma landing page ou uma ferramenta interna. O harness não muda — o que muda é o código que ele produz.

## Quick Check 3

- 1. Por que o security-auditor verificou especificamente o uso de textContent em vez de innerHTML? Resposta: innerHTML interpreta strings como HTML, o que permite injeção de scripts maliciosos (XSS) se o conteúdo vier de entrada do usuário. textContent trata o conteúdo como texto puro, sanitizando automaticamente. Em um app de tarefas onde o texto vem do usuário, usar textContent é obrigatório.

- 2. Qual o risco de dar permissão edit: allow para o code-reviewer? Resposta: O code-reviewer foi desenhado para analisar código, não para modificá-lo. Com edit: allow, ele poderia alterar arquivos durante a análise — introduzindo mudanças não autorizadas ou violando o princípio do menor privilégio. A permissão edit: deny (configurada na Aula 04) força o code-reviewer a apenas analisar e recomendar, nunca modificar.

## Quick Check 4

## 1. Qual é a ordem correta das 3 sessões no fluxo completo e por que essa ordem importa?

Resposta: Pesquisa → Planejamento → Execução. A ordem importa porque cada sessão produz artefatos que a próxima consome: a pesquisa gera pesquisa.md (decisões técnicas), o planejamento usa esse conhecimento para criar plano.md (passos), e a execução segue o plano. Inverter essa ordem seria como escrever código antes de decidir a stack — retrabalho garantido.

## 2. Em que momento do fluxo você acionaria o security-auditor e por que não antes?

Resposta: Após a implementação estar funcional, mas antes de considerar a feature “entregue”. Não faz sentido auditar segurança de código que ainda vai mudar — você audita o que vai para produção. O code-reviewer vem antes (revisa lógica e padrões) e o security-auditor depois (verifica vulnerabilidades no código final).

## Mão na Massa — Sua Vez de Orquestrar

## Exercício Prático

## Dificuldade: Fácil | Duração: 20 minutos

Agora é sua vez. Você vai replicar o fluxo completo que acabou de ver, mas com uma feature diferente:


“Adicione um campo de busca por texto no TarefasApp. O usuário digita e a lista filtra em tempo real enquanto digita.”

Passo 1 — Sessão 1 (Pesquisa): Abra uma nova sessão e peça para o agente pesquisar, usando o MCP Context7, sobre:

- input evento input em JavaScript — como capturar cada tecla digitada

- Array.filter() com correspondência parcial de texto (case-insensitive)

- Debounce para evitar processamento a cada tecla

Salve em pesquisa-busca.md.

Passo 2 — Sessão 2 (Planejamento): Inicie nova sessão, carregue o @pesquisa-busca.md e peça para o code-reviewer analisar o código existente e propor onde adicionar: o campo de busca no HTML, a função de filtro por texto e o debounce. Salve em plano-busca.md.

Passo 3 — Sessão 3 (Execução): Inicie nova sessão, carregue o @plano-busca.md e peça para implementar. No final, use o command /revisar para revisar e auditar.

## Dicas para Cada Sessão

Para a Sessão 1 (Pesquisa): Seja específico sobre o que o Context7 deve pesquisar. Em vez de “pesquise sobre busca em JavaScript”, escreva “pesquise sobre o evento input e Array.filter() com case-insensitive”. O Context7 funciona melhor com consultas diretas — cada chamada é uma tool call que consome tokens, então consultas precisas economizam recursos.

Para a Sessão 2 (Planejamento): O code-reviewer precisa ver o código existente para analisar. Certifique-se de que a sessão está aberta no diretório do TarefasApp ou que o prompt inclui “leia os arquivos index.html, style.css e app.js antes de analisar”. Um code-reviewer sem acesso ao código tende a dar sugestões genéricas.

Para a Sessão 3 (Execução): O command /revisar espera que a implementação já esteja completa. Se você usar /revisar antes de o agente implementar, o pipeline não terá código novo para revisar. Execute /revisar apenas depois que o agente confirmar que a implementação está pronta. Uma dica: peça para o agente dizer “implementação concluída” antes de invocar o comando.

## Verificação:

- O O campo de busca aparece no HTML

- A lista filtra enquanto você digita

- O filtro é case-insensitive (busca “COMPRAR” encontra “comprar”)

- O O security-auditor aprovou o código (sem innerHTML, sem XSS)

- Você tem os 3 artefatos: pesquisa-busca.md, plano-busca.md, execução-busca.md

## Gabarito — O que Esperar

Se algo não sair como planejado no exercício prático, aqui estão três dicas de troubleshooting baseadas em problemas reais:


- 1. Se o agente não usar o Context7 espontaneamente. O MCP Context7 é uma ferramenta disponível, mas nem todo agente decide usá-la por conta própria — especialmente se o prompt não mencionar documentação externa. Solução: seja explícito no prompt da Sessão 1. Em vez de “pesquise sobre debounce”, escreva “use o MCP Context7 para pesquisar a documentação de debounce em JavaScript”. Ser explícito não tira a autonomia do agente — dá a ele a direção correta.

- 2. Se o code-reviewer retornar análise genérica. O code-reviewer analisa o escopo que você fornece. Se você pedir “analise o TarefasApp”, ele pode devolver observações superficiais. Solução: refine o prompt com especificidade. Em vez de “analise o código existente”, use “analise especificamente o arquivo app.js, foque na função renderTasks() e sugira onde encaixar o filtro sem refatorar a função existente”. Quanto mais específico, mais útil a análise.

- 3. Se o security-auditor não encontrar problemas em código inseguro. O security-auditor é tão bom quanto o escopo que ele recebe. Se você não pedir explicitamente para ele verificar pontos cegos, ele pode se concentrar apenas em XSS e ignorar outros vetores. Solução: no prompt do /revisar ou da Sessão 3, adicione “o security-auditor deve verificar também: (a) vazamento de dados no localStorage, (b) eventos que podem ser disparados múltiplas vezes, (c) manipulação insegura de classes CSS que pode expor informações”. Um auditor bem instruído é um auditor eficaz.

- 4. Se o agente implementar a feature mas ignorar os padrões da skill js-patterns. O agente carrega a skill apenas se você pedir ou se o AGENTS.md instruir. Se o código gerado usar var em vez de const/let ou onclick inline em vez de addEventListener, a skill não foi carregada. Solução: adicione no AGENTS.md uma regra como “sempre carregue a skill js-patterns antes de implementar qualquer código JavaScript”. Assim o carregamento se torna automático, e não uma etapa que você precisa lembrar.

- 5. Se o /revisar não funcionar. O command /revisar foi criado na Aula 03 no diretório .opencode/commands/revisar.md. Se ele não for reconhecido, verifique: (a) o arquivo existe no diretório correto, (b) o frontmatter YAML tem name: revisar e mode: command, (c) o opencode.json referencia o diretório .opencode/commands/ no campo commands. O erro mais comum é ter o arquivo salvo em .opencode/revisar.md em vez de .opencode/commands/revisar.md.

## Desafio Criativo

## Dificuldade: Difícil | Duração: 30 minutos

Sem aprender nada novo, apenas combinando o que você já sabe, que outra feature você consegue implementar? Descreva o fluxo de orquestração completo.

## Ideias para começar:

- 1. Tema escuro: Um botão de alternar tema claro/escuro que persiste no localStorage

- 2. Categorias com cores: Campos de categoria com input type="color" e filtro por categoria

- 3. Histórico de alterações: Cada edição de tarefa registra timestamp e quem alterou

- 4. Exportar lista: Botão que exporta as tarefas como JSON ou texto

- 5. Contador de tarefas: Badge no header mostrando “5 pendentes, 3 concluídas” atualizado em tempo real

- 6. Modo edição: Clique no texto da tarefa para editar inline com um <input> que aparece no lugar do <span>


## Formato da entrega (crie desafio-criativo.md):

```
\# Desafio Criativo — Aula 05
## Feature escolhida
[Descreva em 2-3 frases a feature que você vai implementar]
## Fluxo de orquestração
- Sessão 1 (Pesquisa): [O que o Context7 vai pesquisar?]
- Sessão 2 (Planejamento): [O que o code-reviewer vai analisar?]
- Sessão 3 (Execução): [Quais peças do harness serão acionadas?]
## Peças do harness usadas
- [ ] MCP Context7
- [ ] code-reviewer
- [ ] security-auditor
- [ ] js-patterns skill
- [ ] /revisar command
- [ ] Permissões
## Artefatos produzidos
- pesquisa-[feature].md
- plano-[feature].md
- execucao-[feature].md
```

## Resumo da Aula

## O Que Você Conquistou

- 1. Orquestração de ponta a ponta: você usou todas as 8 peças do seu harness em um fluxo real

- 2. Estratégia de 3 Sessões na prática: pesquisa (Context7), planejamento (code-reviewer), execução (/revisar)

- 3. Delegação inteligente: cada subagente fez o que sabe fazer melhor, no momento certo

- 4. Segurança por design: permissões deny-all garantiram que agentes especialistas não extrapolassem seu papel

- 5. Documentação automática: cada sessão produziu um artefato .md curado e reutilizável

- 6. Consciência de permissões: você entendeu que cada agente precisa de um perfil de permissões diferente — e que edit: deny para revisores é segurança, não limitação

- 7. Visão sistêmica do harness: você deixou de ver agentes, skills, commands e MCPs como peças isoladas e passou a vê-los como um sistema integrado de produção de software


## O Ciclo Que Você Repetirá

Em resumo, o ciclo completo se parece com isto:

- 1. Surge uma demanda — “preciso de filtro e ordenação”, “quero busca por texto”, “preciso de tema escuro”

- 2. Sessão 1 — Pesquisar — você abre uma sessão limpa e pede para o agente pesquisar a documentação via MCP Context7. Sai pesquisa.md.

- 3. Sessão 2 — Planejar — você abre outra sessão, carrega @pesquisa.md e delega a arquitetura para o code-reviewer. Sai plano.md.

- 4. Sessão 3 — Executar — você abre a última sessão, carrega @plano.md e pede a implementação com /revisar. Sai o código final + execução.md.

Cada sessão é independente, cada artefato é auto-contido, cada agente faz o que sabe fazer melhor. O diagrama abaixo mostra exatamente esse fluxo com as peças do harness que participam de cada etapa:


Cada caixa deste diagrama é uma peça que você construiu. O fluxo inteiro existe porque você configurou cada peça para funcionar em harmonia.

## Como Usar Este Ciclo Fora do TarefasApp

O ciclo pesquisar → planejar → executar com revisão não depende do TarefasApp. Ele funciona para qualquer feature em qualquer projeto porque o padrão é sobre como você pensa, não sobre o que você constrói. Veja como ele se adapta a contextos diferentes:

- Landing page nova: Sessão 1 pesquisa tendências de layout e componentes CSS via Context7. Sessão 2 planeja a árvore de componentes com o code-reviewer. Sessão 3 implementa com /revisar.

- API endpoint: Sessão 1 pesquisa a documentação do framework via Context7. Sessão 2 planeja a estrutura de rotas e validações. Sessão 3 implementa com revisão de segurança.

- Refatoração de CSS: Sessão 1 pesquisa variáveis CSS e design system. Sessão 2 planeja a migração. Sessão 3 executa com revisão de consistência visual.

O harness não se importa com o projeto — ele se importa com o ciclo. Uma vez que o ciclo está internalizado, você pode aplicá-lo a qualquer problema que envolva código novo, pesquisa de API ou decisões de arquitetura.

## 5 Sinais de Que Sua Orquestração Está Funcionando

Você saberá que dominou a orquestração quando estes sinais forem verdade no seu dia a dia:

- 1. Cada sessão tem um artefato claro — Você nunca termina uma sessão sem um arquivo .md de saída. Se o agente não produziu o artefato, a sessão não terminou.

- 2. Você não precisa repetir informações entre sessões — O handoff via @arquivo.md carrega todo o contexto necessário. Se você está copiando e colando informações de uma sessão para outra, o handoff não está funcionando.


- 3. O security-auditor encontra zero 🔴 em código gerado — O agente da Sessão 3 já internalizou os padrões de segurança (sem innerHTML, sem onclick inline, sanitização de entrada). Se o security-auditor aponta vermelhos com frequência, o agente principal precisa de melhores instruções no AGENTS.md.

- 4. Você consegue pular direto para a Sessão 3 em mudanças triviais — Quando a feature é simples (mudar uma cor, ajustar um texto), você não precisa de pesquisa ou planejamento. A orquestração madura é flexível: 3 sessões para features complexas, 1 sessão para mudanças simples.

- 5. O MCP Context7 é usado automaticamente sem você pedir — O agente aprendeu que, quando o prompt menciona “pesquisa” ou “documentação”, a ferramenta certa é o Context7. Se você ainda precisa explicitamente dizer “use o Context7”, o agente ainda não internalizou o padrão.

Se você ainda não atingiu todos os 5 sinais, não se preocupe: a orquestração é uma habilidade que se desenvolve com a prática. Cada feature nova que você implementar com o harness vai fortalecer um desses sinais. O importante é que você saiba para onde está indo — e agora você sabe exatamente como é uma orquestração madura.

## O Que Você Construiu Hoje

- Executou o fluxo completo de orquestração com todas as peças do harness

- Usou o MCP Context7 para pesquisa de documentação (Sessão 1)

- Delegou planejamento de arquitetura para o code-reviewer (Sessão 2)

- Implementou feature com js-patterns skill e revisão do /revisar (Sessão 3)

- Auditoriou segurança do código com security-auditor

- Produziu artefatos de handoff em cada sessão

## Autoavaliação: Quiz Rápido

- 1. Em qual sessão o MCP Context7 é mais útil e por quê? Resposta: Na Sessão 1 (Pesquisa). O Context7 consulta documentação técnica oficial — exatamente o que a fase de pesquisa precisa. Usá-lo nas Sessões 2 ou 3 desperdiçaria tokens, já que a fase de pesquisa já produziu o artefato com as informações necessárias.

- 2. Qual a diferença entre o code-reviewer e o security-auditor? Resposta: O code-reviewer foca em arquitetura, padrões e estrutura de código — ele sugere como organizar as funções e componentes. O security-auditor foca em vulnerabilidades, XSS, manipulação insegura de DOM e boas práticas de segurança. Um planeja a estrutura; o outro verifica a segurança.

- 3. Por que o command /revisar usa subtask: false? Resposta: Com subtask: false, o pipeline executa no contexto da sessão atual, permitindo que cada etapa (code-reviewer, implementação, security-auditor) veja o resultado das etapas anteriores. Se fosse subtask: true, cada etapa seria isolada e não haveria passagem de contexto entre elas.

- 4. O que aconteceria se você desse permissão edit: allow para o security-auditor? Resposta: O security-auditor poderia modificar o código que está auditando — o que viola o princípio de separação de responsabilidades. Um auditor independente não deve alterar o que audita. Com edit: deny, ele só pode relatar problemas, não corrigí-los automaticamente.

- 5. Qual a vantagem de ter artefatos .md separados em vez de uma longa conversa? Resposta: Artefatos são informação curada — condensam decisões importantes em ~200-500 tokens. Uma longa conversa acumula histórico exploratório, idas e vindas e repetições, consumindo 10x mais tokens. Além disso, artefatos são versionáveis no Git e reutilizáveis entre sessões.


- 6. Como você decidiria se uma nova funcionalidade merece o fluxo completo de 3 sessões ou pode ser feita em uma única sessão? Resposta: Se a funcionalidade envolve pesquisa (APIs desconhecidas), decisões de arquitetura (vários componentes) e código novo (mais de 50 linhas), use 3 sessões. Se é uma mudança trivial (corrigir cor de um botão, ajustar texto), uma única sessão basta. O custo de contexto das 3 sessões se paga quando o retrabalho evitado é maior que o custo das sessões.

7. Por que o security-auditor deve ter edit: deny mesmo que ele nunca tenha tentado modificar código? Resposta: Porque permissões não são sobre comportamento passado — são sobre capacidade futura. Um agente com edit: allow pode, em uma execução imprevista, alterar arquivos que não deveria. O princípio do menor privilégio diz: conceda a permissão mínima necessária para a tarefa. O security-auditor precisa de read para auditar e edit apenas para relatar (em .md). edit: deny em código fonte não é punição — é design seguro.

## Referências

## Documentação Oficial

- [OpenCode — Agents](https://opencode.ai/docs/agents/)

- [OpenCode — Commands](https://opencode.ai/docs/commands/)

- [OpenCode — Permissions](https://opencode.ai/docs/permissions/)

- [OpenCode — MCP](https://opencode.ai/docs/mcp/)

## MDN (Referência JavaScript)

- [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)

- [Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)

- [Evento ‘input’](https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event)

## Aulas Anteriores

- Aula 01 — Fundações e Economia de Modelos

- Aula 02 — Contexto, Sessões e Handoff

- Aula 03 — Agentes, Skills e Commands

- Aula 04 — Permissões, MCPs e Plugins

## FAQ

- P: Preciso ter TUDO funcionando perfeitamente para esta aula fazer sentido? R: Não. Se alguma peça do seu harness não está 100% funcional (ex: o MCP Context7 não conectou, o command /revisar não foi testado), esta aula ainda serve como roteiro do que você vai ajustar. Cada prompt que você tentar e não funcionar revela exatamente qual peça precisa de atenção.

P: E se o agente ignorar minhas instruções e pular etapas? R: Acontece. Reforce o prompt: “Siga EXATAMENTE a estratégia de 3 sessões. Na Sessão 1, apenas pesquisa e documentação — zero código.” Se o agente continuar pulando etapas, revise seu AGENTS.md e veja se as regras de stack e metodologia estão claras.

P: O MCP Context7 é gratuito? R: O servidor MCP do Context7 é gratuito para uso. O custo está nas tool calls que ele gera — cada consulta ao Context7 consome tokens de entrada (a pergunta) e saída (a resposta). Em uma sessão de pesquisa típica, o custo é de ~500-1000 tokens adicionais.

P: O code-reviewer e o security-auditor compartilham o mesmo arquivo de agente? R: Não, cada um tem seu próprio arquivo em .opencode/agents/. O code-reviewer foca em arquitetura e padrões de


código; o security-auditor foca em vulnerabilidades e XSS. Eles têm prompts diferentes, critérios diferentes e permissões diferentes (ambos edit: deny, mas com escopos de read distintos). Separar em dois agentes permite que cada um se especialize e que você os invoque de forma independente.

- P: Quantas sessões posso ter em paralelo? R: Quantas sua context window suportar. Cada sessão consome contexto independente. O OpenCode permite múltiplas sessões simultâneas — você pode ter a Sessão 1 pesquisando enquanto a Sessão 3 já está implementando. Apenas lembre-se do handoff: artefatos .md conectam as sessões.

P: Esta aula usou o TarefasApp. E se meu projeto for diferente? R: O padrão é o mesmo. Troque “TarefasApp” por “meu-dashboard” ou “minha-api” e o fluxo funciona igual. O harness não se importa com o projeto — ele se importa com o ciclo: pesquisar, planejar, executar com revisão.

P: O que fazer se uma das peças do harness estiver quebrada e eu não conseguir concluir o fluxo? R: Use a aula como diagnóstico. Se o MCP Context7 não conecta, você sabe que precisa revisar a configuração em opencode.json. Se o /revisar não executa, o problema está no command ou nas permissões. Cada prompt que falha revela exatamente qual peça precisa de reparo. A aula funciona como um teste de integração do seu harness — falhas são informação valiosa.

## Glossário

Termo

Orquestração

Handoff

code-reviewer

security-auditor

js-patterns

/revisar

MCP Context7

Deny-all allow-list

Definição

Coordenação de múltiplas peças do harness (agentes, skills, commands, MCPs) para executar um fluxo completo de trabalho

Protocolo de passagem de contexto entre sessões via artefatos .md consumidos com @arquivo.md

Subagente criado na Aula 03 que analisa código JavaScript e propõe arquitetura (mode: subagent, edit: deny)

Subagente criado na Aula 03 que revisa segurança, XSS, manipulação de DOM e boas práticas (mode: subagent, edit: deny)

Skill criada na Aula 03 com conhecimento injetável sobre padrões JavaScript vanilla (arrow functions, closures, módulo revelador)

Command criado na Aula 03 que orquestra pipeline de 3 etapas: arquitetura (code-reviewer), implementação, revisão (security-auditor)

Servidor MCP registrado na Aula 04 que fornece documentação técnica de bibliotecas e APIs via ferramentas query-docs e resolve-library-id

- \+ Padrão de segurança da Aula 04 onde um agente tem todas as ferramentas bloqueadas por padrão ("*": "deny") e apenas ferramentas específicas são liberadas explicitamente
