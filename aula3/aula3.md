## OpenCode Harness — Aula 03

## Agentes, Skills, Comandos e Orquestração

Duração estimada: 120 minutos (90min leitura + 30min prática)

Nível: Iniciante

Pré-requisitos: Aulas 01 e 02 — Fundações de LLM e Gestão de Contexto

## Objetivos de Aprendizagem

Ao final desta aula, você será capaz de:

- Explicar o modelo mental da equipe de agentes — por que um planner, um executor e um reviewer separados batem um agente monolítico

- Diferenciar agente principal de subagente e explicar por que o isolamento de contexto é uma vantagem, não uma limitação

- Descrever o ciclo de vida do conhecimento injetável: listado → carregado → ativo → descartado — e calcular a economia de tokens vs regras permanentes

- Identificar quando usar templates de automação e como placeholders expandem prompts com argumentos do usuário

- Mapear o ciclo de orquestração do agente principal: quando delegar, quando carregar conhecimento, quando perguntar e quando responder diretamente

- Criar um agente customizado definindo mode, permissions e system prompt no frontmatter YAML

- Criar um conhecimento injetável (skill) com estrutura de diretório e frontmatter corretos

- Criar um template de automação (command) com placeholders de argumentos e referências a agentes

- Diagnosticar problemas comuns de orquestração: subagente sem contexto, template sem argumentos, skill não reconhecida

- Projetar um mini-harness completo com agentes, skills e commands que orquestram um pipeline de revisão de código

## Como Usar Esta Aula

Esta aula está dividida em duas partes complementares. A primeira parte (seções 1 a 5) constrói os conceitos abstratos que todo programa agêntico implementa: o modelo de equipe, a delegação com isolamento de contexto, o conhecimento injetável sob demanda, os templates de automação e o ciclo de orquestração. A segunda parte (seções 6 a 9) conecta cada conceito da primeira parte à implementação


concreta no OpenCode, onde você construirá seu próprio harness pessoal com agentes, skills e commands funcionais.

Ao longo do caminho, você encontrará 5 Quick Checks (pausas de verificação) e 3 Mão na Massa (momentos de abrir o terminal e construir). Reserve cerca de 90 minutos de leitura + 30 minutos de prática.

## Mapa Mental

Este diagrama mostra todos os conceitos que você vai dominar nesta aula:

## Recapitulação das Aulas 01 e 02

Antes de mergulhar nos mecanismos de composição e orquestração, vamos ancorar esta aula nos conceitos que você já domina:

Aula

System Prompt

Aula 01

Tool Calling

Aula 01

Context Window

Aula 01

Regras Skills

Aula 02

de vida completo e frontmatter YAML

Conceito

Onde aparece na Aula 03

Cada agente tem seu próprio system prompt, definido no corpo do arquivo de configuração. A especialização começa aqui

A delegação para subagentes é implementada via tool call: o agente principal “chama” um subagente como ferramenta

O isolamento de contexto dos subagentes preserva a context window do agente principal

vs A Aula 03 aprofunda a distinção: conhecimento injetável (skills) tem ciclo


Aula

Conceito

Onde aparece na Aula 03

Context Assembly

Aula 02

Quando uma skill é carregada, ela se torna uma camada adicional no contexto

Compactação

O conhecimento injetável é descartado na compactação — principal vantagem sobre regras permanentes

Aula 02

Estratégia de

Aula 02

A orquestração de agentes é a versão automatizada da estratégia que você executou manualmente na Aula 02

3 Sessões

## FUNDAMENTOS: Mecanismos de Composição e Orquestração

Os conceitos desta parte são universais — valem para qualquer programa que gerencia múltiplos agentes de IA. Quando chegarmos à segunda parte, você verá como o OpenCode implementa cada um deles.

## 1. O Modelo Mental da Equipe

## Por Que Um Agente Monolítico Não Basta

Na Aula 01, você aprendeu que um agente de IA toma decisões em ciclo: recebe contexto, escolhe entre responder ou chamar uma ferramenta, processa o resultado e repete. Na Aula 02, você viu que esse ciclo gera um histórico que cresce a cada interação e eventualmente lota a context window.

Agora imagine um agente único tentando executar todas as fases de um projeto complexo — pesquisa, implementação, revisão, correção. O resultado é previsível: um system prompt quilométrico tentando cobrir todas as especialidades, um histórico inflado com decisões de design misturadas com detalhes de implementação, e uma context window que perde informações importantes. É como ter um único desenvolvedor obrigado a ser simultaneamente arquiteto, programador, revisor e especialista em segurança.

O modelo mental que resolve este problema é familiar: uma equipe.

Pense na delegação entre agentes como a delegação de eventos no DOM: assim como um elemento pai no JavaScript escuta eventos que borbulham dos filhos (event delegation) sem precisar tratar cada elemento individualmente, o agente principal gerencia tarefas delegadas sem executá-las diretamente. Ele captura o resultado consolidado — não o processo interno de cada subagente.

## Conheça os Papéis

Em qualquer programa agêntico que suporta composição, você encontra variações destes quatro papéis:

- O Planner recebe um problema amplo, pesquisa alternativas, decompõe em etapas e estrutura um plano de ação. Seu produto é um documento de direção — não código.

- O Executor recebe um plano detalhado e transforma cada item em código, configuração ou documentação. É o papel que mais consome tokens.

- O Reviewer recebe o produto do executor e avalia contra critérios de qualidade, estilo, segurança e completude. Não reescreve o código — aponta o que está bom, o que está ruim e o que está faltando.

Os Especialistas são acionados sob demanda. Um especialista em acessibilidade não precisa ficar na conversa o tempo todo — ele só é chamado quando o código precisa ser auditado. Especialistas são conhecimento profundo em espera.

Perceba o fluxo: o Planner entrega um artefato para o Executor, que entrega código para o Reviewer, que devolve feedback. Os especialistas só entram em cena quando necessário. Nenhum agente carrega o contexto completo dos outros.


Esta separação de responsabilidades não é apenas organização — é uma decisão econômica. Um planner não precisa de acesso ao sistema de arquivos (ele produz planos em texto). Um executor não precisa das skills de planejamento (ele precisa de skills técnicas). Cada agente carrega apenas o contexto necessário para seu papel, e o sistema como um todo opera com muito menos tokens do que um agente monolítico equivalente.

## Quick Check 1

## 1. Por que um único agente com system prompt gigante não substitui uma equipe de agentes especializados?

Resposta: Porque o system prompt compete com o histórico pelo mesmo espaço finito da context window. Um system prompt que tenta cobrir planejamento, implementação e revisão pode consumir 10.000+ tokens — tokens indisponíveis para arquivos, histórico ou raciocínio. Além disso, instruções conflitantes (“seja criativo no planejamento, mas conservador na implementação”) produzem resultados inconsistentes. Agentes especializados têm system prompts focados e curtos, liberando tokens para a tarefa real.

## 2. Qual a diferença entre os papéis de planner e reviewer?

Resposta: O planner atua antes da implementação: analisa requisitos, pesquisa alternativas e estrutura um plano. O reviewer atua depois: recebe o código pronto e avalia contra critérios de qualidade. O primeiro olha para frente (“o que precisa ser feito”); o segundo olha para trás (“o que foi feito está bom?”).

## 2. Agentes — Primários e Subagentes

## O Que Define um Agente

Um agente em um programa agêntico é definido por:

- System prompt: as instruções que definem personalidade, escopo e regras de conduta. Cada agente tem a sua própria

- Permissões: o que o agente pode fazer. O princípio do menor privilégio — cada agente recebe exatamente o que seu papel exige

- Ferramentas: capacidades disponíveis (editar arquivos, executar comandos, acessar APIs)

- Modo: como o agente é invocado — ponto de entrada (primary), sob demanda (subagent) ou ambos (all)

Cada combinação desses atributos produz um perfil de comportamento diferente.

## Agente Principal vs Subagente

A distinção crucial está no contexto — no que cada um “enxerga” da conversa.

O agente principal é o ponto de contato com o usuário. Gerencia o histórico, decide quando delegar e consolida resultados. Sua context window contém o system prompt, regras permanentes, histórico completo e definições de ferramentas.

O subagente é invocado pelo agente principal via task. Opera em uma sessão filha: contexto completamente novo e isolado. Não herda o histórico da conversa, não vê mensagens anteriores, não sabe o que foi lido ou modificado antes. O que recebe é exatamente o que o agente principal decide passar: descrição da tarefa, talvez alguns arquivos, e nada mais.


## O Mecanismo de Delegação

O fluxo é simples: o agente principal decide delegar → cria uma sessão filha com parentID → passa a descrição da tarefa → o subagente processa em contexto isolado → o resultado volta como texto → o agente principal consolida na resposta.

Uma analogia útil com CSS: cada subagente é como um escopo isolado. No CSS, você usa classes para estilizar componentes específicos sem vazar estilos para o resto da página — cada subagente tem seu próprio “shadow DOM” de contexto. O que acontece na sessão filha, fica na sessão filha.

## Por Que Isolamento é uma Vantagem

O isolamento oferece três vantagens decisivas:

Foco: Livre do ruído de 40 interações anteriores, o subagente concentra-se exclusivamente na tarefa. É como pedir a um colega para revisar uma função específica sem contar toda a história do projeto.

Paralelismo: Múltiplos subagentes podem ser disparados simultaneamente. Um pesquisa bibliotecas, outro analisa segurança, um terceiro revisa documentação — todos em paralelo, sem interferência.

Economia de tokens: Cada subagente começa com janela limpa, sem herdar dezenas de milhares de tokens de histórico. Para uma tarefa com 3 subagentes, a diferença pode ser de 30.000+ tokens.

## Quando Delegar — e Quando Não

Delegue quando: a tarefa exige conhecimento especializado, múltiplas subtarefas independentes podem ser executadas em paralelo, ou a exploração envolve risco que é melhor isolar em sessão descartável.

Não delegue quando: a tarefa é trivial (overhead da sessão filha supera o benefício), depende fortemente do contexto atual, ou requer input humano que o subagente não pode solicitar.

## Quick Check 2

## 1. O que um subagente NÃO recebe quando é invocado?

Resposta: Um subagente não recebe o histórico da conversa do agente principal, as mensagens anteriores do usuário, nem os arquivos lidos antes de sua invocação. Recebe exclusivamente: seu próprio system prompt, a descrição da tarefa passada pelo agente principal e — opcionalmente — arquivos ou trechos de contexto explicitamente incluídos na delegação.

## 2. Por que o isolamento de contexto é uma vantagem, não uma limitação?

Resposta: Oferece três vantagens: (1) foco — sem ruído do histórico; (2) paralelismo — múltiplos subagentes simultâneos sem conflito; (3) economia de tokens — janela limpa em vez de dezenas de milhares de tokens herdados. Além disso, força uma interface limpa: o agente principal precisa articular claramente o que espera, sem depender de contexto implícito.

## 3. Conhecimento Injetável


## Anatomia de um Conhecimento Injetável

## Revisão Rápida: Regras vs Conhecimento

Na Aula 02, você aprendeu a diferença: regras permanentes são carregadas no início da sessão e permanecem durante toda a conversa — definem comportamento base, estilo, convenções. Conhecimento injetável é carregado sob demanda quando uma tarefa específica exige expertise que não está nas regras. Uma vez concluída a tarefa, o conhecimento é removido do contexto.

Agora vamos abrir a caixa preta do conhecimento injetável e entender exatamente sua anatomia.

Um conhecimento injetável (skill) tem duas partes:

O frontmatter YAML — metadados que respondem: Qual o nome? O que contém? Quais as condições de uso?

O corpo Markdown — o conteúdo propriamente dito: instruções, exemplos, referências. Deve ser autossuficiente: quando o agente carrega, encontra tudo que precisa saber sobre o tópico.

A separação é crucial. O frontmatter é o que o agente “vê” o tempo todo — nomes e descrições no system prompt. O corpo é o que ele “carrega” quando decide que é relevante. Como uma biblioteca: você vê os títulos nas estantes, mas só abre o livro quando precisa.

## O Ciclo de Vida: Listado, Carregado, Ativo, Descartado

Estado 1: Listado — O conhecimento existe no sistema mas só ocupa 50-100 tokens (nome + descrição). O agente sabe que existe e pode carregá-lo quando relevante.

Estado 2: Carregado — O agente decide que a tarefa se beneficiaria do conhecimento e dispara uma tool call para injetá-lo no histórico.

Estado 3: Ativo — O conhecimento está no contexto e influencia as decisões. Ocupa tipicamente 800-3.000 tokens.

Estado 4: Descartado — Na compactação, o conhecimento é removido do contexto. Decisões tomadas com base nele são preservadas no resumo; o texto completo, não. Se necessário novamente, é recarregado — uma tool call de baixo custo.

## A Vantagem Econômica

Considere 20 conhecimentos especializados de ~1.500 tokens cada. Como regras permanentes, consumiriam 30.000 tokens em cada interação — em 50 interações, 1.500.000 tokens. Com carregamento sob demanda, se cada conhecimento é usado em 3 das 50 interações: 20 × 1.500 × 3 = 90.000 tokens. Economia de 94%.

## O Que NÃO Colocar no Corpo

- Regras de comportamento permanente: “Sempre use arrow functions” deve ser regra permanente, não skill — senão o agente “esquece” na compactação

- Restrições de segurança: crítico demais para depender de um conhecimento descartável

- Preferências pessoais: indentação, naming conventions


O corpo deve conter informações úteis para tarefas específicas e irrelevantes para as demais: padrões de projeto, APIs de bibliotecas, guias de estilo de tecnologia específica.

## Quick Check 3

## 1. Se um conhecimento tem 1.500 tokens e é usado em 3 de 10 sessões, qual a economia vs regra permanente?

Resposta: Como regra permanente: 1.500 × 10 = 15.000 tokens. Como conhecimento injetável: 1.500 × 3 = 4.500 tokens. Economia de 70%. Com 20 conhecimentos com padrão similar, a economia escala para centenas de milhares de tokens ao longo de dezenas de sessões.

## 2. Por que o conteúdo de um conhecimento não deve incluir instruções permanentes?

Resposta: Porque o conhecimento injetável é descartado na compactação. Instruções como “Sempre use JavaScript strict mode” seriam seguidas apenas enquanto o conhecimento estivesse ativo. Na primeira compactação, o conhecimento é removido e a instrução “esquecida”. Instruções contínuas devem ser regras permanentes.

## 4. Templates de Automação

## Atalhos Que Viram Prompts

Existe uma classe de tarefas que você executa repetidamente: “explique este código”, “traduza este texto”, “revise este arquivo”. Digitar o mesmo prompt longo toda vez é ineficiente.

Os templates de automação (commands) resolvem isto: um atalho que, quando acionado, expande para um prompt completo antes de ser enviado ao agente. O usuário digita /explicar; o programa substitui pelo prompt completo com instruções detalhadas e argumentos.

Pense como uma macro ou snippet: você define o esqueleto uma vez e reutiliza infinitas vezes, preenchendo apenas as partes que mudam.

## Anatomia de um Template

Os metadados definem qual agente processa o template, uma descrição e se a execução deve ser delegada como subtarefa.

O corpo do prompt é o texto enviado ao agente: instruções passo a passo, formatação esperada, restrições e exemplos. Escrito uma vez, executado centenas de vezes.

Os placeholders são as partes dinâmicas — espaços que serão preenchidos com argumentos do usuário no momento da execução.

## Tipos de Placeholders

Placeholder

Expande para

Exemplo

Todos os argumentos como string única

/explicar src/app.ts → \$ARGUMENTS = src/app.ts

\$ARGUMENTS

\$1, \$2, … \$9

Argumento posicional específico

/comparar forEach map → \$1 = forEach, \$2 = map

Saída do comando shell `git branch` → main executado

`comando`


Placeholder

Expande para

Exemplo

Conteúdo de um arquivo do @README.md → conteúdo do README

@arquivo

projeto

## Templates vs Prompts Manuais

Repetibilidade: O mesmo nível de qualidade em toda execução — sem esquecer instruções importantes na terceira vez.

Padronização: Em equipe, todos seguem o mesmo processo. O /revisar inclui verificações de acessibilidade, segurança e performance que um desenvolvedor apressado poderia pular.

Acessibilidade: Para iniciantes, funcionam como “rodinhas de bicicleta” — não precisam saber formular o prompt perfeito; usam o template que um colega experiente criou.

## Templates como Pipelines

Um template pode especificar qual agente deve processar o prompt. /revisar pode especificar agent: revisor — mesmo que o usuário esteja no agente build, o comando redireciona para o especialista. Com subtask: true, o processamento acontece em sessão filha isolada. É a orquestração empacotada em um atalho de uma linha.

Por exemplo, um template /revisar-codigo com agent: reviewer e subtask: true instrui o harness a: (1) capturar os argumentos do usuário com \$ARGUMENTS; (2) expandir o corpo do prompt com o código a ser revisado; (3) disparar uma tool call task para o agente reviewer; (4) o reviewer processa em sessão filha isolada e devolve o resultado como texto; (5) o agente principal incorpora o feedback na resposta. Tudo isso com uma linha digitada pelo usuário.

## Quick Check 4

## 1. Qual a diferença entre digitar um prompt manualmente e usar um template?

Resposta: Consistência e composição. O template garante que as mesmas instruções detalhadas sejam incluídas em todas as execuções — impossível de garantir manualmente. Além disso, templates incorporam placeholders automáticos (saída de comandos, conteúdo de arquivos) e podem redirecionar para o agente especialista correto automaticamente.

## 2. Por que templates são particularmente úteis para iniciantes?

Resposta: Funcionam como material educacional embutido. Um iniciante que usa /explicar-codigo não precisa saber estruturar um prompt eficaz — o template já contém instruções, formato e restrições. Conforme ganha experiência, pode inspecionar o template e aprender como prompts bem estruturados são escritos.

## 5. Orquestração — O Maestro por Trás das Tarefas

## O Ciclo de Decisão Ampliado

Com os conceitos de delegação, conhecimento injetável e templates, o ciclo de decisão do agente principal ganha nova dimensão. Ele decide entre quatro caminhos:

- 1. Responder diretamente: tarefa simples, contexto suficiente, nenhuma especialização necessária

- 2. Delegar para subagentes: tarefa complexa, exige especialização ou pode ser paralelizada

- 3. Carregar conhecimento injetável: tarefa exige expertise não carregada no momento


- 4. Perguntar ao usuário: tarefa ambígua, faltam informações ou decisão depende de preferências humanas

A cada interação, o agente principal avalia a tarefa e escolhe o caminho — ou uma combinação deles. Esta é a orquestração: quem faz o quê, com qual contexto e em qual ordem.

## Padrões de Orquestração

Pesquisa → Planejamento → Execução: três subagentes em sequência, cada um consumindo o artefato do anterior. Versão automatizada da estratégia das 3 sessões da Aula 02.

Especialista sob demanda: o mais simples — encontra uma subtarefa especializada e dispara um subagente. O especialista devolve o resultado e o principal continua.

Paralelismo: tarefas independentes executadas simultaneamente. Todos os subagentes são disparados ao mesmo tempo; o principal aguarda e consolida.

## O Dilema da Decisão Multi-Fator

Imagine: o revisor encontrou 12 problemas — 3 críticos (injeção de SQL, token exposto), 5 médios, 4 leves. O agente principal precisa decidir: corrigir tudo agora (2h, atrasa entrega) ou priorizar os críticos (30min, mas acumula débito técnico)? Este dilema envolve múltiplos critérios conflitantes — prazo, segurança, qualidade — que exigem raciocínio multi-fator.

A solução: um subagente de decisão com modelo premium. Três características: (1) modelo com reasoning tokens para raciocínio profundo; (2) system prompt mínimo — sem skills carregadas, só sabe decidir; (3) contexto cirúrgico — apenas opções, critérios e fatos. Processa em sessão isolada, sem viés, e devolve decisão estruturada com confiança e trade-offs.

A economia está no foco: você paga o preço do modelo premium (~100× mais caro) apenas nas decisões que realmente exigem esse poder de raciocínio — não em todas as interações. O subagente de decisão existe exclusivamente para resolver dilemas de trade-off; ele não planeja, não implementa, não revisa — ele decide.

## O Agente Principal como Maestro

Suas responsabilidades como orquestrador: avaliar qual caminho tomar, descrever claramente ao delegar, consolidar resultados dos subagentes, supervisionar falhas e contextualizar resultados técnicos para o usuário.

## Quando NÃO Orquestrar

Anti-padrões comuns: sobre-delegar (subagente para tarefa de 30 segundos), sub-delegar (implementar sistema complexo sem especialistas), dependência circular entre subagentes, paralelizar tarefas dependentes (implementar enquanto a arquitetura ainda está sendo definida).

Regra prática: delegue quando a tarefa justifica o overhead da sessão filha. Caso contrário, resolva diretamente.

## Quick Check 5

- 1. Dê um exemplo de tarefa que justifica 3 subagentes e um exemplo que não justifica nenhum.

Resposta: Justifica: “Implemente um sistema de login com OAuth2, JWT e CSRF.” — pode disparar especialista em segurança, planejador de arquitetura e executor. Não justifica: “Adicione um console.log na linha 42” — o agente principal faz com uma tool call.

- 2. O que o agente principal precisa incluir na descrição ao delegar?


Resposta: Objetivo claro, contexto relevante, formato esperado do resultado, restrições e critérios de qualidade. Descrição vaga (“melhore o código”) produz resultados inconsistentes. Descrição precisa (“revise src/auth.ts verificando validação de inputs, proteção contra injeção”) produz resultados previsíveis.

## 3. Qual a diferença entre \$ARGUMENTS e \$1, \$2 no corpo de um command?

Resposta: \$ARGUMENTS captura tudo que o usuário digitou após o atalho como uma string única — ideal para comandos que esperam um bloco contínuo de input, como /explicar-codigo src/app.js. \$1, \$2, etc. capturam argumentos posicionais individuais separados por espaço — ideais quando o comando espera múltiplos inputs com papéis diferentes, como /comparar forEach map. Ambos podem ser usados no mesmo template.

## APLICAÇÃO: Agentes, Skills e Commands no OpenCode

Agora que você entende os mecanismos abstratos, vamos ver como o OpenCode implementa cada um deles. Os conceitos ganham nomes concretos — tudo que era teoria agora vira arquivo no seu projeto.

## 6. Criando um Agente Customizado

## Onde os Agentes Vivem

No OpenCode, agentes são arquivos Markdown com frontmatter YAML e system prompt no corpo:

- Escopo de projeto: .opencode/agents/ — específicos do domínio

- Escopo global: ~/.config/opencode/agents/ — utilidades gerais

## Anatomia do Frontmatter

Campo

Obrigatório Descrição

Exemplo

Sim

Texto que aparece na lista de agentes

description

"Planeja estrutura de aulas"

Sim

primary (ponto de entrada), subagent (via task), all (ambos)

mode

mode: subagent

Não

Modelo específico para este agente

model:

model

opencode-go/deepseek-v4-pro

temperature

Não

Criatividade (0 = determinístico, 2 = criativo)

temperature: 0.3

Não

Máximo de iterações do loop agentivo

steps

steps: 15

Não

Permissões: edit, bash, etc.

permission: { edit: "deny", bash: "deny" }

permission

Não

Se true, não aparece na lista de agentes

hidden: false

hidden

O campo mode merece atenção: primary aparece como ponto de entrada; subagent só via tool call task; all funciona nos dois modos.


## Exemplo: Agente Tradutor

\---

description: "Traduz textos entre idiomas. Informe o texto e o idioma de destino"

mode: subagent

permission:

edit: "deny"

bash: "deny"

\---

Você é um tradutor profissional. Traduza o texto fornecido para o idioma solicitado.

## Regras:

- 1. Preserve a formatação original (quebras de linha, listas, blocos de código)

- 2. Mantenha termos técnicos no idioma original, com tradução entre parênteses na primeira ocorrência

- 3. Se houver código, NÃO traduza comentários nem strings

- 4. Se o idioma de destino não for especificado, pergunte

- 5. Entregue APENAS a tradução, sem comentários adicionais

Note: mode: subagent porque o tradutor é ferramenta interna, não ponto de entrada. permission: { edit: "deny", bash: "deny" } porque só processa texto — princípio do menor privilégio.

## Testando o Agente

Após criar .opencode/agents/tradutor.md, peça ao agente principal: “Use o tradutor para traduzir ‘Hello, world!’ para português”. O agente principal fará uma tool call task com subagent_type: tradutor, que processará em sessão filha isolada e devolverá apenas a tradução.

## Quick Check 6

## 1. O que o campo mode controla na definição de um agente?

Resposta: Controla como o agente pode ser invocado. mode: primary significa que ele aparece como ponto de entrada da conversa. mode: subagent significa que só pode ser invocado por outro agente via task. mode: all permite ambos.

- 2. Por que o agente tradutor tem permission: { edit: "deny", bash: "deny" }?

Resposta: Pelo princípio do menor privilégio. O tradutor só processa texto — ele não precisa editar arquivos nem executar comandos. Restringir permissões reduz a superfície de risco e mantém o agente focado na tarefa.

## 7. Criando um Conhecimento Injetável (Skill)

## Onde as Skills Vivem

Skills exigem estrutura de diretório específica:

- Escopo de projeto: .opencode/skills/<nome>/SKILL.md

- Escopo global: ~/.config/opencode/skills/<nome>/SKILL.md


- Compatível: ~/.agents/skills/<nome>/SKILL.md

O arquivo precisa se chamar SKILL.md (maiúsculo) dentro de um diretório com o nome da skill. Arquivo solto não é reconhecido.

## Anatomia do Frontmatter

Campo

Obrigatório Descrição

Exemplo

Sim

Identificador único. Deve corresponder ao nome do

name

name: css-bem

diretório

Sim

Descrição que aparece no system prompt. Agente decide carregar com base nela

description:

description

"Metodologia

BEM para CSS"

Não

Licença do conteúdo

license

license: MIT

Não

Requisitos de ambiente

compatibility

compatibility

:

"opencode>=1.

0"

Não

Informações adicionais

metadata:

{

metadata

version:

"1.0" }

O campo mais crítico é description. Se for vaga (“Conhecimento sobre CSS”), o agente pode não carregar quando necessário. Se for precisa (“Padrão BEM para nomenclatura de classes CSS: block, element, modifier”), o agente saberá exatamente quando usá-la.

## Estrutura de uma Skill (Exemplo)

O corpo da skill contém o conhecimento propriamente dito. Para uma skill css-bem, o corpo seria algo como:

\# Metodologia BEM para CSS

\## O que é BEM

BEM (Block, Element, Modifier) é uma metodologia de nomenclatura de classes CSS.

## \## Estrutura

- \- **Block**: Componente independente. Ex: `.header`, `.menu`, `.button`

- \- **Element**: Parte de um bloco. Sintaxe: `block__element`. Ex: `.menu__item`

- \- **Modifier**: Variação. Sintaxe: `block--modifier`. Ex: `.button--primary`

## \## Regras Práticas

- 1. NUNCA use elementos dentro de elementos: `.block__element__subelement`

- 2. Modificadores aplicam-se a blocos e elementos: `.button--large`

- 3. Em JavaScript, o bloco geralmente corresponde a uma função ou módulo

- 4. Com CSS moderno, BEM organiza classes customizadas quando utilitários não bastam

## \## Anti-Padrões Comuns

- \- Aninhamento profundo, nomes genéricos (`.box`, `.item`), estilo por tag

\---

name: js-patterns

description: "Padrões de código JavaScript moderno: async/await, destructuring, spread

operator, optional chaining, nullish coalescing. Inclui exemplos e anti-padrões"

license: MIT


```
metadata:
version: "1.0"
tags: [javascript, patterns, es6+]
---
# Padrões JavaScript Moderno
## Async/Await
- Use `async/await` em vez de `.then()` para legibilidade
- Trate erros com `try/catch`
- Evite `Promise.all()` sem `try/catch` — uma rejeição propaga o erro
## Destructuring
- Prefira `const { name, age } = user` a `const name = user.name`
- Use default values: `const { role = "user" } = user`
## Optional Chaining
- `user?.address?.city` em vez de `user && user.address && user.address.city`
## Spread Operator
- Cópias imutáveis: `const updated = { ...state, name: "novo" }`
## Anti-Padrões
- `await` em loops sequenciais que poderiam ser paralelos com `Promise.all()`
- Mutação direta de objetos: `state.name = "novo"` em vez de spread
```

## Debugando Skill que Não Aparece

- 1. O diretório tem o nome do name no frontmatter?

- 2. O arquivo se chama SKILL.md (maiúsculo)?

- 3. O frontmatter tem name e description? (ambos obrigatórios)

- 4. Está no diretório certo? .opencode/skills/ ou ~/.config/opencode/skills/

- 5. Reiniciou a sessão? Skills são escaneadas no início da sessão

## Quick Check 7

## 1. Qual a estrutura de diretório correta para uma skill chamada css-bem?

Resposta: .opencode/skills/css-bem/SKILL.md. O diretório deve ter o mesmo nome do campo name no frontmatter, e o arquivo PRECISA se chamar SKILL.md (maiúsculo). Arquivo solto em .opencode/skills/ não é reconhecido.

## 2. Por que a description é o campo mais crítico do frontmatter de uma skill?

Resposta: Porque é o único texto que o agente vê o tempo todo (listado no system prompt). Se a descrição for vaga, o agente pode não carregar a skill quando necessário. Se for precisa, ele identifica o momento certo de usar. A descrição é o “título na estante” que decide se o livro será aberto.


## 8. Criando um Template de Automação (Command)

## Onde os Commands Vivem

Commands são arquivos .md soltos (sem diretório):

- Escopo de projeto: .opencode/commands/<nome>.md

- Escopo global: ~/.config/opencode/commands/<nome>.md

O nome do arquivo define o atalho. Se o arquivo se chama explicar-codigo.md, o atalho será /explicar-codigo.

O fluxo de execução é: usuário digita /explicar-codigo src/utils.ts → o harness localiza o arquivo .opencode/commands/explicar-codigo.md → expande todos os placeholders (substituindo \$ARGUMENTS pelo conteúdo de src/utils.ts) → envia o prompt completo ao agente especificado no frontmatter. Tudo isso acontece em milissegundos, antes de qualquer chamada ao LLM.

## Anatomia do Frontmatter

| Campo | Obrigatório | Descrição | Exemplo |
| --- | --- | --- | --- |
| description | Sim | Texto que aparece na lista de | "Explica código linha por |
|   |   | commands | linha" |
| agent | Não | Qual agente processa. Omite = | agent: build |
|   |   | agente ativo |   |
| model | Não | Modelo específico | para este model: |
|   |   | comando | opencode-go/deepseek-v4-pro |
| subtask | Não | Se true, executa como subagente | subtask: true |
|   |   | (sessão filha) |   |

O campo agent é poderoso: permite que um command redirecione para um agente específico. /revisar com agent: revisor será processado pelo revisor mesmo que o usuário esteja no build.

## Exemplo: Command /explicar-codigo

\---

```
description: "Explica um arquivo ou trecho de código linha por linha, em português"
agent: build
subtask: false
---
```

Você é um professor de programação explicando código para um aluno iniciante.

Analise o seguinte código e produza uma explicação didática:

## \$ARGUMENTS

## Formato da resposta:

- 1. **Visão Geral** (2-3 frases): O que este código faz

- 2. **Estrutura** (lista): Partes principais (funções, classes, módulos)

- 3. **Linha a Linha** (tabela): Para cada linha, o que faz e por quê

- 4. **Conceitos** (lista): Conceitos de programação demonstrados

- 5. **Possíveis Melhorias** (lista): Sugestões de clareza ou eficiência


Ao digitar /explicar-codigo src/utils.ts, \$ARGUMENTS é substituído pelo conteúdo do arquivo. O prompt completo é enviado ao agente build, que entrega a explicação formatada.

O agente nunca vê \$ARGUMENTS — ele vê o conteúdo já expandido. O template é resolvido no nível do harness, não no nível do LLM. O fluxo completo: atalho → captura de argumentos → expansão de placeholders → envio ao agente → processamento → resposta formatada.

## Quick Check 8

## 1. Como o OpenCode sabe qual atalho usar para um comando?

Resposta: O nome do arquivo define o atalho. Se o arquivo está em .opencode/commands/explicar-codigo.md, o atalho é /explicar-codigo. O harness localiza o arquivo pelo nome, expande os placeholders e envia o prompt completo ao agente — tudo antes de qualquer chamada ao LLM.

## 2. O que acontece se um command não especificar agent no frontmatter?

Resposta: O comando é processado pelo agente ativo no momento — o mesmo com quem o usuário está conversando. Se o comando especificar agent: revisor, ele redireciona para o agente revisor mesmo que o usuário esteja no build. Sem agent, o processamento fica no agente atual.

## 9. O Fluxo Completo — Da Pergunta ao Artefato

## Um Cenário Realista

Vamos acompanhar uma tarefa do início ao fim, observando a orquestração em ação. Um desenvolvedor precisa criar uma página de perfil de usuário em HTML + CSS + JavaScript com acessibilidade. O que poderia ser horas de trabalho manual é orquestrado automaticamente.

L]

-

L]


## Passo a Passo

Passo 1 — Pesquisa: O agente principal (build) avalia a tarefa e dispara o @pesquisador para buscar diretrizes WCAG. O subagente opera em sessão filha isolada — apenas a descrição da tarefa. Resultado: “WCAG 2.1 AA requer contraste 4.5:1, labels em inputs, navegação por teclado…”

Passo 2 — Planejamento: Com a pesquisa, dispara o @planejador, que recebe requisitos + pesquisa de acessibilidade e estrutura: componentes necessários, estrutura de arquivos, estados de cada componente, pontos de verificação de acessibilidade.

Passo 3 — Execução: Dispara o @content-writer, que carrega skills sob demanda (lesson-design, dokumon-markdown) — cada skill é uma tool call que injeta ~1.500 tokens de conhecimento especializado. Implementa os componentes seguindo o plano.

Passo 4 — Revisão: Dispara o @reviewer. Em sessão isolada, sem o histórico de decisões do writer, avalia o código como está. Feedback estruturado: “Problema 1: ProfileForm sem aria-labels. Problema 2: Contraste 3.8:1 (mínimo 4.5:1).”

Passo 5 — Correção: O build reenvia para o writer com instruções específicas. O writer aplica correções. O build entrega o artefato final: código funcional, acessível e revisado.

Perceba o padrão: em cada passo, o agente principal avalia a tarefa e decide entre os quatro caminhos da orquestração. Na pesquisa, delegou para um especialista. No planejamento, delegou novamente. Na execução, delegou e carregou conhecimento sob demanda. Na revisão, delegou com contexto mínimo. O agente principal nunca desaparece — ele coordena cada transição, consolida cada resultado e decide quando avançar.

## O Que Este Fluxo Demonstra

Cada conceito da primeira parte em ação no mundo real:

- Modelo de equipe: Planner (pesquisa+estrutura) → Executor (código) → Reviewer (avaliação) → Executor (correção)

- Delegação com isolamento: O reviewer não viu o writer errar três vezes — só o resultado final. Revisão mais objetiva

- Conhecimento injetável: Skills carregadas sob demanda, descartadas na compactação. Zero desperdício

- Templates: Este fluxo empacotado em um comando /criar-pagina executaria 5 passos com uma linha

- Orquestração: O agente principal nunca executa — ele coordena. Decide a cada passo qual caminho tomar

Este fluxo demonstra o princípio central da aula: um harness bem projetado transforma uma tarefa complexa em uma coreografia de agentes especializados. Cada conceito da primeira parte — modelo de equipe, delegação, conhecimento injetável, templates, orquestração — aparece em ação concreta. O que separa um usuário casual de um praticante sério de programação agêntica é exatamente a capacidade de projetar esta coreografia: saber quando delegar, qual contexto passar, quais skills carregar e como consolidar resultados.

Nota: Os nomes exatos dependem do seu harness. No de criação de aulas, são pdf-extractor, lesson-planner, content-writer e reviewer. O importante é o padrão.


## Autoavaliação: Quiz Rápido

## 1. Quais são os quatro papéis no modelo mental da equipe de agentes? Resposta:

Planner (estrutura o plano), Executor (implementa), Reviewer (avalia qualidade) e Especialistas (conhecimento sob demanda). Cada um com system prompt próprio e permissões mínimas.

## 2. O que significa “isolamento de contexto” para subagentes e por que é vantagem? Resposta:

Significa que o subagente não herda o histórico da sessão principal. É vantagem porque oferece: (1) foco — sem ruído de interações anteriores; (2) paralelismo — múltiplos subagentes simultâneos; (3) economia de tokens — janela limpa em vez de dezenas de milhares de tokens herdados.

## 3. Qual a diferença entre o ciclo de vida de uma regra permanente e de uma skill? Resposta:

A regra permanente é carregada no início da sessão e fica ativa durante toda a conversa — nunca é removida. A skill tem ciclo de vida completo: listada (50-100 tokens como descrição), carregada sob demanda (tool call), ativa no contexto, descartada na compactação. A skill pode ser recarregada se necessário, mas não persiste entre compactações.

## 4. Quais campos são obrigatórios no frontmatter de um agente no OpenCode? Resposta:

Dois campos obrigatórios: description (texto que aparece na lista de agentes) e mode (primary, subagent ou all). Os demais — model, temperature, steps, permission, hidden — são opcionais.

## 5. Qual arquivo uma skill PRECISA ter e qual o campo mais importante do frontmatter? Resposta:

A skill PRECISA ter o arquivo SKILL.md (maiúsculo) dentro de um diretório com o nome da skill. O campo mais importante do frontmatter é description, pois é o que o agente usa para decidir se deve carregar a skill.

## 6. Qual a diferença entre \$ARGUMENTS e \$1 no corpo de um command? Resposta:

\$ARGUMENTS captura tudo que o usuário digitou após o atalho como uma string única — ideal para comandos que esperam um bloco contínuo de input. \$1, \$2, etc. capturam argumentos posicionais individuais separados por espaço — ideais quando o comando espera múltiplos inputs com papéis diferentes.

## Mão na Massa 1 — Conhecendo Seu Harness

## Duração: 5 minutos

Antes de criar, conheça o que já existe no seu harness. Liste os agentes, skills e commands do seu projeto com ls -la .opencode/agents/, ls -la .opencode/skills/ e ls -la .opencode/commands/. Inspecione o agente lesson-planner.md (observe mode, permission, system prompt), a skill lesson-design/SKILL.md (observe name, description, corpo) e o command /create-lesson (observe agent, placeholders, corpo). Pergunte-se: por que lesson-planner é subagent? Por que lesson-design é skill e não regra permanente? Quantos agentes o /create-lesson referencia?

## Mão na Massa 2 — Criando Skill e Command

## Duração: 10 minutos

Crie uma skill css-bem em .opencode/skills/css-bem/SKILL.md com frontmatter contendo name: css-bem e description descritiva, e corpo Markdown explicando a metodologia BEM (Block, Element, Modifier). Depois crie o comando /resumir em .opencode/commands/resumir.md com agent: build,


\$ARGUMENTS como placeholder e formato de resposta estruturado (título, resumo, pontos-chave, termos). Teste: em nova sessão, peça “carregue a skill css-bem” e digite /resumir seguido de um texto.

## Mão na Massa 3 — Monte Seu Próprio Pipeline (Desafio)

## Duração: 20 minutos | Dificuldade: Difícil

Crie um mini-harness completo para revisão de funções JavaScript com 4 peças:

## 1. Skill js-patterns

.opencode/skills/js-patterns/SKILL.md:

\---

name: js-patterns

description: "Padrões e boas práticas de JavaScript moderno: arrow functions,

const/let, template literals, destructuring, early returns, e funções puras. Inclui

exemplos e anti-padrões comuns"

license: MIT

metadata:

version: "1.0"

tags: [javascript, patterns, vanilla, es6]

\---

\# Padrões de Código JavaScript

\## Composição de Funções

Princípio fundamental. Funções pequenas e focadas se combinam para formar comportamentos complexos.

```
```js
function formatName(user) {
return `${user.firstName} ${user.lastName}`.trim();
}
function formatEmail(email) {
return email.toLowerCase();
}
function formatUser(user) {
return {
name: formatName(user),
email: formatEmail(user.email),
};
}
```
```

Aplicação: sempre que uma função pode ser decomposta em responsabilidades menores — cada função faz uma coisa e a composição orquestra o resultado.

\## Closure para Estado Privado

Encapsula estado em closures, expondo apenas a interface pública.


```
```js
function createCounter(initialValue = 0) {
let count = initialValue;
return {
increment: () => ++count,
decrement: () => --count,
getValue: () => count,
reset: () => {
count = initialValue;
return count;
},
};
}
```
Aplicação: encapsulamento de estado sem expor variáveis internas.
## Módulo Revelador (Revealing Module Pattern)
Define API pública apontando para funções privadas.
```js
const UserService = (function () {
const API_URL = "/api/users";
function formatUser(user) {
return { id: user.id, name: user.name.trim() };
}
async function fetchUsers() {
const res = await fetch(API_URL);
const data = await res.json();
return data.map(formatUser);
}
return { fetchUsers };
})();
```
Aplicação: organização de código com API explícita e detalhes internos ocultos.
## Padrão Observer (Pub/Sub)
Comunicação desacoplada entre partes do sistema.
```js
function createEventBus() {
const listeners = {};
return {
on(event, callback) {
(listeners[event] ||= []).push(callback);
},
off(event, callback) {
listeners[event] = listeners[event]?.filter((cb) => cb !== callback);
},
emit(event, data) {
listeners[event]?.forEach((cb) => cb(data));
},
};
```

L


}

```

Aplicação: comunicação entre módulos sem acoplamento direto.

\## Anti-Padrões

- \- Funções com > 50 linhas sem responsabilidade clara XXXXX

-

Callback hell: aninhamento profundo com callbacks — use Promises ou async/await

-

`==` em vez de `===`: coerção implícita causa bugs sutis

-

innerHTML sem sanitização: risco de XSS — use textContent ou sanitize

-

Manipulação de DOM sem null check: sempre verifique se o elemento existe

## 2. Agente code-reviewer

.opencode/agents/code-reviewer.md:

\---

```
description: "Analisa código JavaScript e sugere arquitetura: padrões, estrutura de funções, separação de responsabilidades e gerenciamento de estado"
mode: subagent
permission:
edit: "deny"
bash: "deny"
---
```

Você é um arquiteto de código JavaScript. Analise requisitos e proponha a estrutura ideal.

Para cada solicitação, produza:

- 1. **Análise dos Requisitos** (3-5 frases): O que o componente precisa fazer?

- 2. **Padrão(ões) Recomendado(s)**: Qual padrão JS melhor atende? JUSTIFIQUE

- 3. **Estrutura de Subcomponentes**: Como dividir? Responsabilidade de cada um

- 4. **Interface de Módulo** (JSDoc): Parâmetros e retorno de cada função

- 5. **Gerenciamento de Estado**: Onde vive cada estado? (variáveis locais, closures, pub/sub)

- 6. **Pontos de Atenção**: Performance, acessibilidade, edge cases

Carregue a skill `js-patterns` se precisar de referência sobre padrões JavaScript.

## 3. Agente security-auditor

.opencode/agents/security-auditor.md:

```
\---
description: "Revisa código JavaScript quanto a padrões, boas práticas, performance e
segurança"
mode: subagent
permission:
edit: "deny"
bash: "deny"
---
```


Você é um revisor de código JavaScript. Analise o código e produza feedback estruturado.

## Critérios:

- 1. **Padrão adequado?** O padrão usado é o mais apropriado?

- 2. **Divisão de responsabilidades?** Módulos e funções com até 300 linhas?

- 3. **Parâmetros e retornos bem definidos?** Tipagem JSDoc completa?

- 4. **Gerenciamento de estado correto?** Estado no nível certo?

- 5. **Performance?** Debounce/throttle onde necessário? Sem loops aninhados desnecessários?

- 6. **Acessibilidade?** ARIA labels, navegação por teclado, contraste?

- 7. **Cobertura de edge cases?** Loading, empty, error states?

## Formato da resposta:

- \- **Resumo** (2-3 frases): Qualidade geral

- \- **Problemas** (lista): Severidade 🔴 🟡 🟢, local, descrição, sugestão

- \- **Acertos** (lista): O que está bem feito

- \- **Nota**: 1-10

Carregue a skill `js-patterns` se precisar de referência.

## 4. Command /revisar

.opencode/commands/revisar.md:

\---

description: "Revisa código JavaScript com pipeline completo: analisa padrões, audita segurança e sugere melhorias"

agent: build

subtask: false

\---

Você vai revisar um código JavaScript completo seguindo um pipeline de 3 etapas.

\## Requisitos do Componente

## \$ARGUMENTS

\## Etapa 1: Arquitetura

Use o subagente @code-reviewer para analisar os requisitos e propor a estrutura ideal. AGUARDE o resultado.

\## Etapa 2: Implementação

Com base na arquitetura, implemente o componente. Carregue a skill `js-patterns` se precisar de referência. Gere código JavaScript com: funções bem nomeadas, responsabilidades separadas, gerenciamento de estado com closures ou objetos, estilização com classes CSS semânticas, tratamento de estados loading/empty/error/dados.

\## Etapa 3: Revisão

Use o subagente @security-auditor para revisar o código. Problemas 🔴 devem ser corrigidos antes de entregar. 🟡 ou 🟢 viram "Melhorias Sugeridas".

L


## \## Entrega Final

- \- Código completo do componente

- \- Lista de melhorias sugeridas

- \- Instruções de uso (1-2 exemplos)

## Verificação

Quando o usuário digitar /revisar um seletor de datas acessível com navegação por teclado, o harness deve: (1) invocar code-reviewer para sugerir estrutura; (2) implementar o código; (3) invocar security-auditor para validar. O ciclo completo implementa Arquitetura → Implementação → Revisão — o padrão central de orquestração que você aprendeu na primeira parte.

## Mão na Massa 4: Exercícios Graduados

## Exercício 1 (Fácil) — Inspecione Seu Harness

Liste todos os agentes, skills e commands disponíveis no seu projeto atual usando comandos de terminal. Para cada agente, identifique o mode e as permission. Para cada skill, identifique o name e a description no frontmatter. Crie uma tabela com suas descobertas.

## Gabarito:

ls -la .opencode/agents/

ls -la .opencode/skills/

ls -la .opencode/commands/

## Exemplo de tabela esperada:

| | Agente | | mode | | permission | | |
| --- | --- | --- | --- |
| |-----------------|------------|------------------| |   |   |   |
| | lesson-planner | subagent | edit: allow |   |   | | |
| | content-writer | subagent | bash: allow |   |   | | |
| | reviewer | | subagent | edit: deny |   | | |

Verifique se cada agente tem apenas as permissões necessárias para seu papel — esse é o princípio do menor privilégio em ação.

## Exercício 2 (Médio) — Crie um Agente + Skill + Command Integrados

Crie três peças que funcionam juntas: (1) uma skill validar-email com frontmatter completo e corpo Markdown explicando como validar endereços de email com regex e boas práticas; (2) um agente validador com mode: subagent que carrega a skill validar-email e devolve validações estruturadas; (3) um command /validar que usa agent: validador, subtask: true e o placeholder \$ARGUMENTS para receber os dados a validar. Teste o pipeline completo.


## Gabarito:

Skill: .opencode/skills/validar-email/SKILL.md com:

```
\---
name: validar-email
description: "Regras e padrões para validação de endereços de email: regex básico,
verificação de domínio, boas práticas de sanitização"
license: MIT
---
# Validação de Email
## Regras
1. Use regex `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/` como primeira filtragem
2. Verifique se o domínio tem registro MX (opcional)
3. Normalize para minúsculas antes de armazenar
4. Nunca confie apenas em validação client-side
```

Agente: .opencode/agents/validador.md com mode: subagent e system prompt instruindo validação estruturada.

Command: .opencode/commands/validar.md com agent: validador, subtask: true e corpo usando \$ARGUMENTS.

Para testar, inicie nova sessão e digite: /validar email@exemplo.com. O harness deve carregar o validador em sessão filha, que carrega a skill validar-email, processa e devolve o resultado.

## Desafio (Difícil) — Pipeline de Orquestração com 3 Agentes

Projete um pipeline completo de revisão de código JavaScript que envolve três agentes em sequência. O comando /revisar-codigo deve: (1) primeiro invocar um analisador que carrega uma skill de padrões JS e produz uma análise estrutural; (2) depois invocar um revisor que avalia segurança e qualidade; (3) por fim consolidar os resultados em um relatório único. Cada agente opera em sessão filha isolada. Os resultados de um agente devem ser passados como contexto para o próximo — sem que nenhum agente veja o histórico completo.

## Gabarito:

A chave do desafio está na descrição da tarefa passada a cada subagente. O command /revisar-codigo deve incluir instruções explícitas de fluxo:

```
\---
description: "Revisão completa de código JavaScript com pipeline de 3 estágios: análise
→ auditoria → relatório consolidado"
agent: build
subtask: false
---
Você vai revisar um código JavaScript em 3 etapas:
## Etapa 1: Análise Estrutural
Invoque o subagente `analisador` com o código completo ($ARGUMENTS).
Aguarde o resultado — ele produzirá a análise de padrões, estrutura e boas práticas.
## Etapa 2: Auditoria de Segurança
Invoque o subagente `revisor` passando o código E a análise da etapa 1.
```


Aguarde o resultado — ele produzirá a auditoria com severidades.

\## Etapa 3: Relatório Consolidado

Combine os resultados da etapa 1 e etapa 2 em um relatório único:

- \- Resumo executivo

- \- Problemas críticos (corrigir antes de entregar)

- \- Melhorias sugeridas

- \- Pontos fortes do código

O diferencial está no encadeamento: o agente principal (build) atua como orquestrador, passando o resultado de cada etapa como contexto para a próxima. Nenhum subagente tem acesso ao histórico completo — cada um vê apenas o que precisa. Isso é o padrão de orquestração em ação.

## Resumo da Aula

## Os 5 Mecanismos Que Você Domina Agora

- 1. O harness é uma equipe, não um indivíduo: Planner analisa e estrutura, Executor implementa, Reviewer avalia, Especialistas entram sob demanda. Cada papel é um agente com system prompt focado e permissões mínimas.

- 2. Subagentes operam em sessões filhas com contexto isolado — isso é vantagem: Foco (sem ruído), paralelismo (múltiplos simultâneos), economia de tokens (janela limpa). A delegação é uma tool call com parentID; o resultado volta como texto.

- 3. Conhecimento injetável (skills) economiza ~94% de tokens: Ciclo de vida listado → carregado → ativo → descartado. Skills são diretórios com SKILL.md. A description no frontmatter é o que o agente usa para decidir quando carregar.

- 4. Templates de automação (commands) padronizam prompts: Arquivo .md com frontmatter (agent, description, subtask) e placeholders (\$ARGUMENTS, \$1-\$9, shell, arquivos). Garantem repetibilidade, padronização e acessibilidade.

- 5. A orquestração é o ciclo de decisão: delegar, carregar conhecimento, perguntar ou responder: O agente principal coordena. Padrões como pesquisa→planejamento→execução emergem naturalmente quando você projeta com agentes.

## Mapa Rápido: Conceito → Aplicação no OpenCode

Conceito (Parte 1)

Modelo de equipe Delegação com isolamento Conhecimento injetável Templates de automação Orquestração

Tool call task com sessão filha

Skills com frontmatter + corpo

Commands com placeholders

Agente principal decidindo 4

caminhos

Implementação (Parte 2)

Arquivo

Agentes primários e subagentes

.opencode/agents/<nome>.md

Automático via harness

.opencode/skills/<nome>/SKILL.md

.opencode/commands/<nome>.md

AGENTS.md + opencode.json


## O Que Você Construiu Hoje

- Compreendeu o modelo mental da equipe de agentes e os quatro papéis

- Entendeu delegação com sessões filhas e isolamento de contexto

- Aprendeu o ciclo de vida do conhecimento injetável e calculou economia de tokens

- Construiu skill js-patterns com estrutura de diretório correta

- Criou os agentes code-reviewer e security-auditor

- Criou o command /revisar com placeholders e pipeline de 3 etapas

- Diagnosticou problemas de orquestração (subagente sem contexto, template sem argumentos)

- Projetou um mini-harness completo com 4 peças integradas

- Conectou cada conceito da parte teórica (FUNDAMENTOS) a uma implementação concreta (APLICAÇÃO)

- Experimentou o padrão de orquestração Arquitetura → Implementação → Revisão no mini-harness

AN

## Próxima Aula

## Aula 04: Permissões, MCPs e Plugins Prontos

Agora que você sabe criar agentes, skills e commands — e orquestrá-los em pipelines — a Aula 04 expande o que seus agentes podem fazer para além do sistema de arquivos local: permissões granulares (allow, deny, ask), MCP (Model Context Protocol) para conectar agentes a APIs e bancos de dados, e plugins para estender o OpenCode além do nativo.

## Referências

- [OpenCode — Documentação Oficial](https://opencode.ai/docs/)

- [OpenCode — Agents](https://opencode.ai/docs/agents/)

- [OpenCode — Skills](https://opencode.ai/docs/skills/)

- [OpenCode — Commands](https://opencode.ai/docs/commands/)

- [MDN — JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

- Aula 01 — Fundações e Economia de Modelos

- Aula 02 — Contexto, Sessões e Handoff

## FAQ

## P: Posso ter um agente que é subagente e principal ao mesmo tempo?

R: Sim, usando mode: all. O agente aparece como opção de entrada e também pode ser invocado via task. Use com moderação — agentes com responsabilidades duplas tendem a ter system prompts mais longos e menos focados.

P: Skills são carregadas automaticamente ou preciso pedir?


R: O agente decide automaticamente. A description da skill aparece no system prompt como parte da lista de skills disponíveis. Quando o agente encontra uma tarefa que corresponde, ele dispara uma tool call para carregá-la. Você também pode pedir explicitamente.

## P: Quantos subagentes posso disparar em paralelo?

R: Não há limite rígido no OpenCode, mas o limite prático vem de três fatores: disponibilidade do modelo (cada subagente faz chamadas LLM), custo (cada sessão filha consome tokens) e complexidade de consolidação. 3 a 5 subagentes paralelos é um bom ponto de partida.

## P: Se eu modificar uma skill durante uma sessão, o agente vê a mudança?

R: Não durante a mesma sessão. Skills são escaneadas no início da sessão. Para ver a mudança, inicie uma nova sessão — análogo a modificar um arquivo de configuração que requer “reinicialização”.

## P: Qual a diferença entre mode: all e mode: subagent na prática?

R: mode: subagent significa que o agente só pode ser invocado por outro agente via task. O usuário não o vê como opção de entrada. mode: all permite ambos: o usuário pode conversar diretamente com o agente (ex: “quero usar o tradutor agora”) e outros agentes podem invocá-lo via task.

## Glossário

Termo

Agente Principal (Primary)

Subagente (Subagent)

parentID

Isolamento de Contexto

Conhecimento Injetável (Skill)

Template de

Automação (Command)

Orquestração

Placeholder

Definição

Ponto de entrada da conversa. Gerencia o histórico, decide quando delegar e consolida resultados. mode: primary

Invocado por outro agente via task. Opera em sessão filha com contexto isolado. mode: subagent

Identificador que vincula sessão filha à sessão pai na hierarquia de persistência

Subagente não herda o histórico da sessão principal — recebe apenas a descrição da tarefa

Conhecimento carregado sob demanda. Diretório com SKILL.md: frontmatter YAML + corpo Markdown

Atalho que expande para prompt completo. Arquivo .md com frontmatter e placeholders

Processo de decisão do agente principal: responder, delegar, carregar conhecimento ou perguntar

Marcador no corpo de um command substituído por valores dinâmicos (\$ARGUMENTS, \$1-\$9, shell, @arquivo)
