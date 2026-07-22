## OpenCode Harness — Aula 04

## Permissões, MCPs e Plugins: Controlando e Expandindo seus Agentes

Duração estimada: 120 minutos (90min leitura + 30min prática) Nível: Iniciante Pré-requisitos: Aulas 01, 02 e 03 — Fundações, Contexto, Agentes e Orquestração

## Objetivos de Aprendizagem

Ao final desta aula, você será capaz de:

- Explicar o modelo de permissões allow/ask/deny como um padrão universal de segurança em software agêntico

- capacidades são necessárias para cada papel Aplicar o princípio do menor privilégio ao escopo de ferramentas de um agente, decidindo quais

- Escrever glob patterns para refinar permissões de edit e bash com escopo espacial

- (HTTP/SSE) Descrever a arquitetura cliente-servidor do MCP e diferenciar transporte local (stdio) de remoto

- Identificar os 4 estágios do ciclo de vida de um servidor MCP

- Mapear os hooks de ciclo de vida de plugins  eventos before/after e como interceptam sem quebrar o fluxo

- Calcular o trade-off entre adicionar ferramenta externa e o impacto em custo, contexto e segurança

- Configurar permissões com glob patterns no opencode.json  global, default_agent e por agente

- Registrar um servidor MCP nos modos local (stdio) e remoto (URL + headers)

- Auditar a configuração de permissões de um harness e identificar vulnerabilidades


## Como Usar Esta Aula

A primeira parte (seções 1-5) constrói os fundamentos universais de controle e extensão — mecanismos que valem para qualquer programa agêntico. A segunda parte (seções 6-10) aplica cada conceito no OpenCode, com configurações reais no opencode.json. Ao final, o arquivo separado de Questões de Aprendizagem traz as tarefas de checkpoint.

## Mapa Mental

Este diagrama mostra todos os conceitos que você vai dominar nesta aula:

i

O mapa mental acima mostra a estrutura da aula. Cada ramo representa um conceito que você vai explorar.

## Recapitulação das Aulas 01, 02 e 03

Antes de mergulhar nos mecanismos de controle e extensão, vamos ancorar esta aula nos conceitos que você já domina:

| Aula Conceito Onde aparece na Aula 04 Aula 01 Tool Calling MCPs são tool calls que atravessam a fronteira do processo — o mecanismo de decisão (gerar JSON com nome + |
| --- |
| parâmetros) é o mesmo |


| Aula Conceito Onde aparece na Aula 04 Aula 01 Context Window Cada MCP adicionado consome tokens com suas tool definitions antes mesmo de ser usado Aula 01 Custo por uso Ferramentas externas geram tool calls adicionais, cada uma consumindo tokens de entrada e saída Aula 02 Montagem do contexto As definições de tools dos MCPs entram na camada 3 da |
| --- |
| montagem de contexto Aula 02 Compactação Resultados de chamadas MCP entram no histórico e são compactados quando a janela atinge o limite Aula 03 Permissões de agentes A Aula 03 introduziu que agentes têm permissões. Esta aula |
| expande para glob patterns e cascata de permissões Aula 03 Sessões filhas Subagentes herdam ou sobrescrevem permissões configuradas — reforçando o menor privilégio Aula 03 Conhecimento injetável MCPs e skills são ambos carregados sob demanda, mas com diferença fundamental: skills injetam texto; MCPs expõem ferramentas executáveis |

A tabela acima mostra como esta aula se apoia no que você já aprendeu. Mantenha estas conexões em mente enquanto avança.

## FUNDAMENTOS: Mecanismos Universais de Controle e Extensão

Os conceitos desta seção são universais — valem para qualquer programa agêntico que precise controlar o que agentes podem fazer e como se conectam ao mundo externo. Na segunda parte, você verá como o OpenCode implementa cada um deles.

## 1. O Modelo de Permissões — Allow, Ask, Deny

## Por Que Agentes Precisam de Permissões

Na Aula 01, você aprendeu que agentes de IA tomam decisões em ciclo: recebem contexto, escolhem entre responder ou chamar ferramenta, processam o resultado e repetem. O que você ainda não considerou é que um agente bem-intencionado pode causar dano — não por malícia, mas por interpretação incorreta.

Um prompt ambíguo como “limpe os arquivos temporários” pode fazer um agente executar rm -rf /tmp/* — ou, se o contexto estiver confuso, rm -rf /*. Um pedido como “publique os resultados” pode fazer o agente enviar dados para uma API externa sem que você perceba.


O problema não é o agente ser malicioso, mas ser um preditor de próximo token: gera a ação mais provável dado o contexto. Se o contexto é ambíguo, a ação pode ser perigosa. Diferentemente de um programa tradicional, você não pode prever exatamente o que o agente fará.

É por isso que todo programa agêntico que interage com arquivos, rede ou processos externos implementa um gatekeeper de permissões — uma camada que inspeciona cada ação antes da execução e decide se permite, pede confirmação ou bloqueia.

Pense em um formulário HTML com <input type="file" accept=".jpg,.png">. O atributo accept é um gatekeeper — ele só deixa passar arquivos que atendem aos critérios. O gatekeeper de permissões faz o mesmo, mas para tool calls.

## Os Três Estados de Permissão

Allow (permitir): a ferramenta é executada imediatamente, sem intervenção humana. O gatekeeper verifica que a ação está na lista de permissões e o resultado volta para o contexto. Este é o estado para operações seguras e frequentes — como ler arquivos ou carregar skills.

Ask (perguntar): a ferramenta é interceptada e o usuário recebe uma pergunta: “O agente quer executar [ação]. Permitir?” O usuário pode aprovar, rejeitar ou modificar os parâmetros. Estado para operações necessárias mas arriscadas — como editar arquivos ou executar comandos.

Deny (negar): a ferramenta é bloqueada sem perguntar. O agente nem fica sabendo que ela existe — ou, se sabe, recebe uma negação silenciosa. Estado para operações que nunca deveriam ser executadas por aquele agente — como um code-reviewer tentando modificar código.


Observe que a decisão acontece antes da execução — nunca depois. O gatekeeper não é um auditor que registra o que aconteceu; é um guarda que decide o que pode acontecer.

## Categorias de Ferramentas e Risco

| Categoria | Exemplos | Risco | Permissão típica |
| --- | --- | --- | --- |
| Leitura de arquivos | Ler código, documentação, config | Baixo | allow |
| Edição de arquivos | Escrever código, modificar config | Alto | ask |
| Execução | de Rodar build, testes, scripts | Muito alto | ask |
| comandos |   |   |   |
| Acesso à rede | Fetch URLs, busca na web | Médio | allow ou ask |
| Delegação | Disparar subagentes | Médio | allow |
| Carregar skill | Injetar conhecimento | Baixo | allow |

A lógica é simples: ferramentas que só adicionam informação (leitura, skill) são baixo risco. Ferramentas que modificam o mundo externo (edição, execução) são alto risco e merecem ask.

## O Padrão Decorator nas Permissões

O gatekeeper implementa o padrão de projeto Decorator: envolve cada tool call com uma camada de verificação sem modificar a ferramenta em si. A ferramenta bash continua sendo bash — ela não sabe que existe um gatekeeper. Você pode modificar regras de permissão sem alterar uma linha das ferramentas.

## Quick Check 1

## 1. Qual a diferença prática entre ask e deny?

Resposta: ask interrompe a execução e pergunta ao usuário — ele pode aprovar, rejeitar ou modificar. deny bloqueia silenciosamente, sem consultar. ask é para operações necessárias mas que exigem julgamento humano (ex: deploy). deny é para operações que nunca deveriam ocorrer (ex: code-reviewer editando código).

## 2. Por que allow para todas as ferramentas é perigoso mesmo em desenvolvimento?

Resposta: Porque o agente não é determinístico. Um prompt ambíguo pode fazê-lo executar uma ação destrutiva. Com allow global, não há barreira de segurança. O modelo de permissões existe porque a saída do agente não é 100% previsível.


## 2. Glob Patterns e o Princípio do Menor Privilégio

## A Origem do Princípio

O princípio do menor privilégio foi formalizado por Saltzer e Schroeder em 1975: todo programa e todo usuário deve operar usando o conjunto mínimo de privilégios necessários para completar seu trabalho. Em sistemas operacionais, um servidor web roda como www-data, não como root. Em programas agênticos: cada agente deve receber exatamente as permissões que seu papel exige, e nada além.

## Escopo por Papel

Na Aula 03, você criou o code-reviewer — ele analisa código mas nunca edita, por isso configurou edit: "deny". Vamos expandir a matriz de necessidades:

| Papel |   | Precisa ler? | Precisa editar? | Precisa executar? | Precisa de rede? |
| --- | --- | --- | --- | --- | --- |
| Build | (agente | Sim | Sim | Sim | Talvez |
| principal) |   |   |   |   |   |
| Code Reviewer |   | Sim | Não | Não | Talvez |

Observe o padrão: leitura é quase sempre necessária; escrita e execução são específicas do papel.

## Restrição Contextual com Glob Patterns

Permissões binárias são um ponto de partida, mas raramente suficientes. O agente principal precisa editar — mas só arquivos JavaScript em src/, não arquivos de configuração na raiz. A solução são os glob patterns:

| Símbolo | Significado | Exemplo | O que casa |
| --- | --- | --- | --- |
| * | Qualquer sequência em um nível | *.js | app.js, utils.js (raiz) |
| ** | Qualquer sequência em qualquer | src/**/*.js | src/app.js, |
|   | profundidade |   | src/components/Button.js |
| ? | Exatamente um caractere | file?.js | file1.js, fileA.js |
| [abc] | Um caractere do conjunto | file[0-9].txt | file1.txt, file5.txt |
| {a,b} | Alternativas | *.{js,json} | app.js, package.json |

Com glob patterns, você transforma “pode editar — sim/não” em “pode editar apenas arquivos .js em src/components/”.

## Herança de Permissões entre Agentes

Quando um agente principal dispara um subagente, o subagente não herda as permissões do principal automaticamente. Cada agente tem seu próprio conjunto de permissões. Se o subagente não declara permissões, o sistema aplica um fallback.

Isso segue o menor privilégio: um agente principal (build) com edit: "allow" não deveria “contaminar” um subagente code-reviewer com essa mesma permissão.

## Quick Check 2

## 1. Que permissões um agente code-reviewer realmente precisa?

Resposta: Leitura de arquivos e talvez acesso à rede. Ele não precisa de edição, execução de comandos ou delegação. Dar permissão de edição a um code-reviewer viola o menor privilégio.

## 2. Por que glob patterns são mais seguros que permissões binárias?


Resposta: Permissões binárias (edit: "allow") dizem “pode editar qualquer arquivo”. Glob patterns (edit: "src/**/*.js") dizem “pode editar apenas JS em src/”. Mesmo que o agente tente modificar um arquivo crítico, o gatekeeper bloqueia.

## 3. Arquitetura MCP — stdio e HTTP/SSE

## O Problema que o MCP Resolve

Até 2024, cada plataforma de agentes tinha seu próprio formato para ferramentas externas. Seu harness já revisa código e segue suas convenções, mas está limitado ao que existe no seu disco. Para expandi-lo — conectar a repositórios remotos, testar interfaces no navegador — você precisa do Model Context Protocol (MCP). O MCP padroniza a comunicação entre agentes de IA e provedores de ferramentas externas, assim como o HTTP padronizou a comunicação entre navegadores e servidores.

## O Que é o MCP

O MCP define duas entidades:

- O Cliente MCP é incorporado ao programa agêntico. Ele inicia conexões, solicita a lista de ferramentas, encaminha tool calls e devolve respostas. Traduz tool calls do agente para JSON-RPC e vice-versa.

- O Servidor MCP é um processo independente que expõe ferramentas. Pode ser um executável local (modo stdio) ou um serviço remoto (modo SSE). Declara quais ferramentas oferece, o schema de parâmetros e como invocá-las.

## A arquitetura:

O ponto crucial é o desacoplamento: o agente não sabe que a ferramenta vive em outro processo. Para ele, github_search_issues é uma tool call como qualquer outra.

O diagrama abaixo mostra o fluxo de uma chamada MCP, desde a decisão do agente até o retorno do resultado.

## Transporte Local vs Remoto

stdio: servidor como processo filho, comunicação via stdin/stdout. Latência mínima, sem autenticação, dados não saem da máquina.

HTTP/SSE: servidor como serviço web acessível via URL. Requer autenticação (API keys, OAuth). Latência de rede, mas pode rodar em qualquer lugar e ser compartilhado.

| Característica | stdio | HTTP/SSE |
| --- | --- | --- |
| Localização | Mesmo sistema | Qualquer lugar com URL |


| Característica | stdio | HTTP/SSE |
| --- | --- | --- |
| Latência | Mínima (IPC local) | Depende da rede |
| Autenticação | Não necessária | API keys, tokens, OAuth |
| Compartilhamento | Exclusivo do processo | Múltiplos clientes |
| Dados | Não saem da máquina | Trafegam pela rede |

Uma analogia útil para fixar a diferença: o transporte stdio é como usar import em JavaScript — o módulo está no seu sistema de arquivos, sem latência de rede, resolução instantânea. O HTTP/SSE é como carregar um script via <script src="url"> — você precisa de uma URL completa, autenticação por headers, e arca com latência de rede em troca de acesso a recursos externos. A escolha entre stdio e HTTP/SSE é conceitualmente a mesma que você faz entre um módulo local e um CDN: baixa latência versus alcance global.

## O Ciclo de Vida de um Servidor MCP

7

NN

Estágio 1 — Conexão: o cliente estabelece a conexão. No modo stdio, inicia um subprocesso. No modo HTTP, abre uma conexão SSE.

Estágio 2 — Descoberta (tools/list): o cliente envia tools/list. O servidor responde com um array de ferramentas — nome, descrição e schema de parâmetros. Esta lista vira tool definitions no system prompt do agente.

Estágio 3 — Chamada (tools/call): o agente decide usar uma ferramenta. O cliente envia tools/call com nome e argumentos. O servidor executa a lógica.


Estágio 4 — Resposta: o servidor retorna o resultado. O cliente injeta no histórico. O agente decide o próximo passo.

Cada estágio tem implicações práticas importantes. Na conexão, o cliente deve gerenciar timeouts e reconexões — se o handshake falhar, o servidor é marcado como indisponível e suas ferramentas não entram no contexto. Na descoberta, o schema de cada ferramenta é convertido diretamente para tool definitions no formato do LLM — schemas complexos (objetos aninhados, enums, arrays) geram definições mais longas e consomem mais tokens. Na chamada, a latência total é a soma do transporte (IPC local ou rede) com o tempo de execução do servidor — chamadas que travam bloqueiam o ciclo do agente até timeout. Na resposta, o volume de dados retornado impacta diretamente o custo: uma ferramenta que retorna 5.000 tokens de resultado custa mais que a chamada em si.

Gerenciamento de erros por estágio: se a conexão falha, o servidor é ignorado e a sessão prossegue sem suas ferramentas. Se a descoberta falha (servidor não responde tools/list), o cliente registra erro e continua — ferramentas não ficam disponíveis. Se uma chamada individual falha (timeout, erro interno), o agente recebe uma mensagem de erro e pode tentar novamente ou escolher outra ferramenta. Se a resposta é muito grande, o cliente pode truncar ou compactar antes de injetar no histórico. Cada estágio com seu próprio tratamento de falha.

Cache de descoberta: para reduzir latência em sessões subsequentes, alguns clientes MCP cacheiam o resultado de tools/list. O cache é invalidado quando o servidor é reiniciado. Isso significa que a primeira sessão após configurar um MCP é mais lenta que as seguintes — o handshake inclui a descoberta completa.

## Por Que o MCP Importa

Assim como o HTTP permitiu que qualquer navegador acessasse qualquer servidor web, o MCP permite que qualquer agente use qualquer servidor de ferramentas. Um servidor MCP escrito em Python pode ser usado por um agente TypeScript — o protocolo é a interface; a implementação é irrelevante.

Isso cria um ecossistema: assim como pacotes npm são reutilizáveis entre projetos, servidores MCP são reutilizáveis entre harnesses.

## Quick Check 3

## 1. Qual a diferença entre transporte stdio e HTTP/SSE?

Resposta: stdio: servidor como processo local, latência mínima, sem autenticação, dados não saem da máquina. HTTP/SSE: servidor como serviço web, latência de rede, exige autenticação, permite compartilhamento entre clientes.

## 2. O que acontece na etapa tools/list e por que ela é essencial?

Resposta: O cliente solicita ao servidor a lista de ferramentas. O servidor responde com nome, descrição e schema de cada uma. Essencial porque é o momento em que as ferramentas são registradas no contexto do agente — e onde o custo de tokens é pago.

## 3. Se um MCP estiver offline ao iniciar a sessão, o que acontece?

Resposta: Suas ferramentas não estarão disponíveis. O OpenCode registra um aviso e continua com os demais servidores. A descoberta ocorre só na inicialização — se o servidor voltar depois, é preciso reiniciar a sessão.

## 4. Plugins — Hooks de Ciclo de Vida


## Onde MCPs Param, Plugins Começam

MCPs adicionam ferramentas externas — expandem o que o agente pode fazer. Plugins expandem como o sistema funciona: executar validação antes de toda tool call, registrar métricas depois de toda resposta, modificar variáveis de ambiente antes de comandos shell. MCPs são sobre adicionar ferramentas; plugins são sobre interceptar o ciclo de vida.

## O Padrão Observer Aplicado

Plugins seguem o padrão Observer: o sistema expõe eventos de ciclo de vida; plugins se registram para eventos específicos; quando o evento ocorre, todos os plugins registrados são notificados.

Pense em addEventListener no JavaScript do navegador. Você registra uma função para reagir a um evento (click, submit). O sistema chama sua função quando o evento ocorre — sem que você precise modificar o código do navegador. Um plugin no OpenCode faz exatamente isso: registra código para reagir a eventos do ciclo de vida do agente.

## Tipos de Hooks

Hooks de ferramenta: before (pré-execução) — validação adicional, logging, bloqueio condicional; after (pós-execução) — formatação de resultado, extração de métricas, cache.

Hooks de sessão: start — inicialização de recursos; end — limpeza, consolidação de logs; compact — logging de padrões de compactação.

Hooks de ambiente: env — modifica variáveis de ambiente antes de comandos shell.

Observe que hooks before podem interromper o fluxo: se retornar erro, a ferramenta nunca executa. Isso cria uma segunda camada de gatekeeping — mais flexível que allow/ask/deny, pois pode implementar regras dinâmicas.

## MCP vs Plugin

| Dimensão | MCP | Plugin |
| --- | --- | --- |
| O que adiciona | Ferramentas executáveis | Comportamento a eventos |
| O que o agente vê | Novas tools disponíveis | Nada — transparente |
| Onde executa | No servidor MCP (outro processo) | No mesmo processo |
| Propósito | Expandir capacidades | Expandir comportamento do sistema |

São complementares: MCPs para conectar o agente ao mundo externo; plugins para governar como o sistema se comporta.

## Encadeamento de Hooks

Múltiplos plugins podem se registrar no mesmo hook, formando uma cadeia. No hook tool.execute.before, por exemplo, um plugin de logging registra a chamada, um plugin de segurança valida os parâmetros e um plugin de throttle limita a frequência — todos executam em sequência antes da ferramenta rodar. Se qualquer plugin da cadeia retornar erro, os plugins seguintes não executam e a ferramenta é bloqueada. Essa composição permite construir comportamentos complexos juntando plugins simples, como pipeline de middleware.


Ordem de execução e prioridade: a ordem em que plugins são carregados determina a ordem da cadeia. Plugins de pacote carregam primeiro, depois plugins de projeto. Dentro de cada grupo, a ordem alfabética é usada. Se a ordem importa (ex: segurança antes de logging para não vazar parâmetros sensíveis), use prefixos numéricos nos nomes dos arquivos: 01-seguranca.js, 02-logging.js.

Exemplo prático: um harness de produção pode ter 4 plugins no hook tool.execute.before: (1) validação de schema dos argumentos, (2) verificação de rate limit por agente, (3) logging estruturado para auditoria, (4) injeção de headers de contexto. Se o rate limit estourar, o plugin #2 retorna erro, os plugins #3 e #4 não executam, e a ferramenta é bloqueada — economizando processamento desnecessário.

## Quick Check 4

## 1. Qual a diferença conceitual entre plugin e MCP?

Resposta: MCP adiciona ferramentas executáveis — expande o que o agente pode fazer. Plugin intercepta o ciclo de vida — expande como o sistema se comporta. O MCP é visível para o agente; o plugin é transparente.

## 2. Dê um exemplo de hook before útil para segurança.

Resposta: Um hook before na ferramenta bash que inspeciona o comando e bloqueia padrões perigosos (rm -rf /, git push --force). Diferente do allow/ask/deny (binário por ferramenta), o hook pode implementar regras semânticas baseadas no conteúdo dos parâmetros.

## 5. O Trade-off — Capacidade vs Custo, Contexto e Segurança

## O Preço de Cada Ferramenta

A decisão de habilitar uma ferramenta é um trade-off em quatro dimensões:

Custo de contexto (tokens): cada tool definition é carregada no system prompt. Uma ferramenta simples consome ~50-100 tokens; uma complexa, 300-500. Um MCP com 10 ferramentas pode consumir 3.000 tokens só em definições.

Custo financeiro (API): cada tool call gera tokens de entrada e saída. Ferramentas que retornam grandes volumes podem gerar milhares de tokens por chamada.

Superfície de segurança: cada MCP é um vetor de ataque. Um servidor remoto comprometido pode fazer prompt injection indireto. Um MCP local com permissões excessivas pode ser explorado.

Complexidade cognitiva: com 5 ferramentas, a decisão do agente é simples. Com 50, ele pode escolher a errada ou não chamar nenhuma.

Além dos tokens consumidos pelas definições, cada MCP adiciona ruído à decisão do agente. O LLM precisa avaliar centenas de tool definitions para decidir qual ferramenta chamar — e quanto mais opções, maior a chance de erro.

Na prática, agentes com mais de 30 ferramentas erram a escolha da tool com frequência significativamente maior que agentes com até 10 ferramentas. Não é questão de capacidade do modelo — é a natureza estatística da predição de próximo token: quanto mais opções, mais dispersa a distribuição de probabilidade.

Cálculo prático: em uma sessão típica de desenvolvimento com 3 MCPs (GitHub, Playwright, Context7), o custo só em definições é:

- GitHub: ~12 ferramentas × 200 tokens = 2.400 tokens

- Playwright: ~8 ferramentas × 250 tokens = 2.000 tokens

- Context7: ~2 ferramentas × 150 tokens = 300 tokens

- Total: ~4.700 tokens — antes da primeira interação


A relação entre ferramentas e eficácia não é linear — é uma curva em U.

No extremo esquerdo, o agente é limitado (poucas ferramentas, capacidade restrita). No meio, ponto ótimo (ferramentas certas, contexto equilibrado). No direito, sobrecarregado — contexto inflado, custo financeiro dispara, superfície de segurança máxima.

Habilite apenas as ferramentas que a tarefa atual realmente exige. Desabilite o que não está em uso.

## Custo Financeiro e Decisão

Uma sessão típica com o agente build (4 ferramentas built-in + 3 MCPs) consome ~5.000 tokens só em definições. A cada chamada MCP, adicione ~1.500 tokens de ida e volta (500 de entrada, 1.000 de saída). Com 15 chamadas por sessão, o custo por sessão é de ~27.500 tokens — dos quais ~18% são puramente estruturais (definições + overhead do protocolo). Em 20 sessões/dia, isso equivale a ~550.000 tokens/dia só de overhead, sem produzir uma linha de código.

Cálculo por modelo: no GPT-4 (US\$30/milhão de tokens de entrada, US\$60/milhão de saída), o overhead de 550.000 tokens/dia custa ~US\$16/dia só para carregar tool definitions que talvez nem sejam usadas. No Claude 3.5 Sonnet (US\$3/milhão entrada, US\$15/milhão saída), o mesmo overhead custa ~US\$3/dia. Modelos mais baratos tornam o desperdício menos crítico financeiramente, mas o consumo de contexto ainda compete com a janela disponível para o conteúdo útil.

Estratégia de redução: (1) separe MCPs sazonais em configurações de perfil — um perfil de desenvolvimento com GitHub + Context7, um de deploy com acesso a servidores, um de QA com Playwright. (2) Use comandos para ativar/desativar MCPs por sessão. (3) Monitore o uso real com telemetria de hook session.end e remova MCPs com <5% de taxa de utilização.

Antes de registrar um novo servidor MCP, responda três perguntas:

- 1. A ferramenta resolve um problema que aparece em >30% das sessões? Se não, o custo fixo de tokens não se justifica.

- 2. Existe alternativa mais leve? Uma skill pode injetar conhecimento; um command pode encapsular a operação. Nem tudo precisa ser MCP.

- 3. O ganho de capacidade supera o custo de contexto + superfície? Se só 2 de 10 ferramentas são usadas, ~80% dos tokens são desperdiçados.

## Quick Check 5

## 1. Um MCP com 8 ferramentas de ~250 tokens cada consome quantos tokens?

Resposta: Aproximadamente 2.000 tokens (8 × 250) — consumidos antes da primeira interação e permanentes na sessão.


## 2. Por que a superfície de segurança aumenta com cada MCP?

Resposta: Cada MCP é um canal de entrada/saída. Na entrada: servidor comprometido pode injetar instruções maliciosas (prompt injection indireto). Na saída: MCP com acesso à rede pode vazar dados. MCPs locais são processos com acesso ao sistema de arquivos.

## 3. Um hook tool.execute.before pode bloquear uma tool call? Como difere do modelo allow/ask/deny?

Resposta: Sim — se retornar erro, a ferramenta nunca executa. A diferença: allow/ask/deny é estático (tipo da ferramenta + glob). Um hook pode implementar regras dinâmicas baseadas no conteúdo dos parâmetros naquele momento.

## APLICAÇÃO: Controle e Extensão no OpenCode

Agora que você entende os mecanismos abstratos, vamos conectá-los à prática: permissões viram JSON, MCPs viram configurações no opencode.json, e plugins viram hooks que você pode configurar hoje.

## 6. Configurando Permissões no opencode.json

No OpenCode, o gatekeeper controla estas ferramentas:

| Ferramenta O que faz Risco edit Editar arquivos Alto bash Executar comandos shell Muito alto task Disparar subagentes Médio skill Carregar conhecimento Baixo webfetch Requisições HTTP Médio |
| --- |
| read Ler arquivos Baixo mcp__* Ferramentas de MCPs Variável Ferramentas MCP seguem a convenção mcp__<servidor>__<ferramenta>. |

## Configuração Global

```
{
"permission": {
"edit": "ask",
"bash": "ask",
"task": "allow",
"skill": "allow",
"webfetch": "allow"
}
}
```

Nesta configuração, edit e bash como ask — exigem confirmação humana antes de modificar arquivos ou executar comandos. task e skill como allow — operações internas de baixo risco que não justificam interrupção.


## Configuração por Agente no Frontmatter

Cada agente sobrescreve permissões globais. Um code-reviewer com menor privilégio:

```
\---
mode: subagent
permission:
edit: "deny"
bash: "deny"
task: "deny"
webfetch: "allow"
skill: "allow"
---
```

Este code-reviewer: não edita, não executa comandos, não dispara subagentes. Pode acessar a internet e carregar skills. Exatamente as permissões que seu papel de análise justifica.

## O Padrão Ouro: deny-all + allow-list

```
{
"permission": {
"*": "deny",
"read": "allow",
"skill": "allow"
}
}
```

"*": "deny" bloqueia qualquer ferramenta sem regra explícita. Depois, libera exatamente o necessário. Compare com allow-all + deny-list:

```
{
"permission": {
"*": "allow",
"bash": "deny"
}
}
```

O primeiro é mais seguro: novas ferramentas (de MCPs ou built-ins futuras) começam bloqueadas automaticamente. No segundo, começam liberadas até você lembrar de bloqueá-las — e esquecimentos são a fonte mais comum de vulnerabilidades em harnesses.

## Quando Usar Deny-all vs Allow-all em Cada Contexto

O padrão deny-all é obrigatório para agentes especializados (code-reviewer, pesquisador) mas pode ser flexibilizado no agente principal. Um bom compromisso é deny-all no frontmatter de agentes e allow-all apenas no global para built-ins seguras (read, skill, task). Para MCPs, sempre prefira deny-all no agente e libere ferramentas específicas — um MCP de GitHub com 12 ferramentas não deveria estar acessível por completo a um agente que só precisa buscar issues.

Deny-all hierárquico: a combinação de "*": "deny" no agente com "mcp__*": "deny" no global cria duas camadas de proteção. Se um novo MCP for registrado, o global nega por padrão. Se um novo agente for criado sem frontmatter, o global nega MCPs mas libera built-ins que o agente herda. Essa redundância


intencional é o equivalente ao depth-in-defense em segurança de rede — cada camada cobre as falhas da anterior.

## Exemplo de configuração completa:

```
{
"permission": {
"*": "allow",
"bash": "ask",
"mcp__*": "deny"
},
"default_agent": {
"permission": {
"edit": "ask",
"bash": "ask"
}
}
}
```

Nesta configuração, o global permite tudo com restrições. MCPs são negados no global — mesmo sem frontmatter, nenhum agente usa MCPs sem permissão explícita. O default_agent define que agentes sem frontmatter próprio herdam ask para edit e bash.


## Cascata de Resolução

A regra mais restritiva vence. Se o agente define edit: "deny" e o global define edit: "allow", o agente não pode editar. A ordem de resolução é: agente > default_agent > global.

## Permissões para MCPs

```
{
"permission": {
"mcp__github__search_issues": "allow",
"mcp__github__create_issue": "ask",
"mcp__github__*": "allow"
}
}
```

A primeira (search_issues) é liberada automaticamente — operação de baixo risco. A segunda (create_issue) exige confirmação — criará conteúdo em repositório real. A terceira é fallback: bloqueia qualquer outra ferramenta do GitHub que não tenha regra explícita.

## 7. Mão na Massa 1 — Blindando o TarefasApp

## Duração: 15 minutos | Dificuldade: Fácil

Você vai aplicar o princípio do menor privilégio nos agentes que criou na Aula 03: build e code-reviewer.

## Passo 1: Audite as permissões atuais

Abra o opencode.json e o frontmatter de cada agente em .opencode/agents/. Para cada agente, identifique:


Agente

Tem edit?

Tem bash?

Tem task?

Tem webfetch?

Build (agente principal)

## Passo 2: Configure o code-reviewer com deny-all

Edite .opencode/agents/code-reviewer.md:

```
\---
mode: subagent
permission:
"*": "deny"
"read": "allow"
"skill": "allow"
"webfetch": "allow"
---
```

## Passo 3: Restrinja o agente principal (build) com glob patterns

O agente principal (build) precisa editar, mas só arquivos em src/. Adicione no frontmatter:

```
\---
mode: subagent
permission:
"edit": ["src/**/*.js", "src/**/*.css", "src/**/*.html"]
"bash": "ask"
"task": "allow"
"skill": "allow"
---
```

## Passo 4: Teste as permissões

Inicie uma sessão com o code-reviewer e peça: “Edite o arquivo src/app.js para adicionar um comentário.” O code-reviewer deve ser bloqueado. Inicie uma sessão com o agente principal (build) e peça: “Edite package.json.” Deve ser bloqueado (fora do glob).

## Verificação:

- Code-reviewer não consegue editar arquivos

- Build só edita dentro de src/

- Build pode ler mas não editar

- Nenhum agente tem permissões que seu papel não justifica


## 8. Registrando MCPs no Harness

## O Campo mcp_servers

No OpenCode, servidores MCP são configurados no campo mcp_servers do opencode.json:

```
{
"mcp_servers": {
"nome-do-servidor": {
"type": "stdio",
"command": "npx",
"args": ["-y", "@exemplo/mcp-server"],
"env": {
"API_KEY": "sua-chave-aqui"
}
}
}
}
```

## Servidor Local (stdio)

```
{
"mcp_servers": {
"meu-mcp-local": {
"type": "stdio",
"command": "npx",
"args": ["-y", "@meu-pacote/mcp-server"],
"env": {
"MINHA_CHAVE": "valor"
}
}
}
}
```

- command: executável a invocar

- args: argumentos

- env: variáveis de ambiente (NUNCA hardcode tokens no comando)

## Servidor Remoto (HTTP/SSE)

{


```
"mcp_servers": {
"api-externa": {
"type": "sse",
"url": "https://api.exemplo.com/mcp",
"headers": {
"Authorization": "Bearer seu-token-aqui"
}
}
}
}
```

- url: endpoint SSE

- headers: autenticação

## Descoberta e Registro

Quando a sessão inicia, o OpenCode percorre cada servidor MCP registrado:

- 1. Inicia a conexão (subprocesso para stdio, conexão SSE para remoto)

- 2. Envia initialize (handshake do protocolo)

- 3. Envia tools/list para descobrir as ferramentas disponíveis

- 4. Registra cada ferramenta como mcp__<server>__<tool> no sistema de permissões

Se um servidor estiver offline, suas ferramentas não estarão disponíveis. O OpenCode registra um aviso e continua com os demais servidores.

## Nomenclatura

```
mcp__<nome-do-servidor>__<nome-da-ferramenta>
```

Exemplos: mcp__github__search_issues, mcp__meu-mcp-local__buscar_dados. O nome do servidor e da ferramenta são definidos pelo próprio servidor MCP durante a descoberta.

## Controle por Permissão

```
{
"permission": {
"mcp__github__*": "deny",
"mcp__github__search_issues": "allow"
}
}
```


Bloqueia todas as ferramentas do GitHub, libera apenas search_issues.

## 9. Mão na Massa 2 — Registrando e Usando o Context7 MCP

## Duração: 10 minutos | Dificuldade: Fácil

Neste exercício, você vai registrar um servidor MCP real — o Context7, que fornece documentação técnica — no seu opencode.json, verificar as ferramentas descobertas, fazer uma tool call e configurar permissões granulares.

## Passo 1: Registre o Context7 MCP no opencode.json

Adicione este bloco ao seu opencode.json, dentro da seção mcp_servers (se não existir, crie o campo):

```
{
"mcp_servers": {
"context7": {
"type": "stdio",
"command": "npx",
"args": ["-y", "@context7/mcp"]
}
}
}
```

## Passo 2: Inicie sessão e verifique as tools descobertas

Inicie uma nova sessão no OpenCode. No log de inicialização, procure por mensagens como Discovered N tools from context7. Se o servidor estiver funcionando, você verá as ferramentas disponíveis — tipicamente context7_query-docs e context7_resolve-library-id.

Se não houver log visível, verifique se o servidor está ativo manualmente:

```
npx -y @context7/mcp
```

Se retornar erro, confirme se Node.js está instalado (node --version deve ser ≥ 18). Se o servidor estiver offline, a sessão continua normalmente — o OpenCode registra um aviso e segue com os demais servidores.

## Passo 3: Faça uma tool call real

Com a sessão ativa, dê ao agente um comando que acione o Context7:

“Use o Context7 para me explicar como funciona o parâmetro permission no opencode.json”

O agente deve resolver o library ID do OpenCode e consultar a documentação. Se funcionar, você verá a resposta com a explicação. Se o agente não usar o MCP, verifique as permissões no passo seguinte.

## Passo 4: Configure permissões granulares

Agora restrinja o MCP Context7 a operações específicas. No opencode.json:


```
{
"permission": {
"mcp__context7__*": "deny",
"mcp__context7__context7_query-docs": "allow",
"mcp__context7__context7_resolve-library-id": "allow"
}
}
```

Isso bloqueia qualquer ferramenta futura que o Context7 venha a expor e libera apenas as duas operações de consulta. Depois crie um agente especializado pesquisador.md com "*": "deny" e libere apenas "mcp__context7__*": "allow" — ele pode consultar documentação mas não edita arquivos nem executa comandos.

## Verificação:

- Servidor Context7 aparece nos logs de inicialização da sessão

- Agente respondeu perguntas usando o Context7 (tool call bem-sucedida)

- Permissões granulares bloqueiam ferramentas não liberadas (teste com permissão negada)

## 10. Plugins Prontos e Auditoria de Segurança

## Onde Plugins Vivem

No OpenCode, plugins podem ser de projeto (.opencode/plugins/) ou de pacote (@opencode-ai/plugin-*). A diferença é que plugins de projeto são específicos do seu harness e versionados com ele; plugins de pacote podem ser distribuídos via npm e reutilizados entre projetos.

## Hooks Disponíveis

| Hook | Quando dispara | O que o plugin pode fazer |   |
| --- | --- | --- | --- |
| tool.execute.before | Antes de tool call | Validar, bloquear, | transformar |
|   |   | argumentos |   |
| tool.execute.after | Depois de tool call | Formatar resultado, | extrair |
|   |   | métricas |   |
| session.start | Início da sessão | Inicializar recursos |   |
| session.end | Fim da sessão | Limpar recursos, consolidar logs |   |
| session.compact | Na compactação | Ajustar estratégia de resumo |   |
| shell.env | Antes de comando shell | Modificar variáveis de ambiente |   |
| permission.deny | Quando tool é bloqueada | Notificar, registrar tentativa |   |

Além destes hooks nativos, plugins podem expor hooks customizados para integrações específicas.

## Plugin vs Custom Tool

- Plugin intercepta eventos. O agente não sabe que existe. Reage a before, after, start, end.


- Custom tool adiciona ferramenta. Aparece no system prompt. O agente decide quando usar.

A distinção é importante: um plugin de auditoria não aparece para o agente (evita que ele burle a auditoria). Uma custom tool de envio de email aparece para o agente (ele decide quando enviar).

Em resumo: plugins governam como o sistema opera; custom tools expandem o que o agente pode fazer. Ambos são mecanismos de extensão, mas em camadas diferentes.

## Exemplos de Uso Realista de Hooks

Hook tool.execute.before para bash seguro: valida comandos contra uma lista de padrões bloqueados (rm -rf, git push --force, curl para IPs internos) e restringe a execução a diretórios permitidos (./scripts/, ./tests/).

Hook shell.env para isolamento: adiciona NODE_ENV=development e remove variáveis de produção antes de qualquer comando shell. Impede que ferramentas de CI sejam acionadas acidentalmente durante o desenvolvimento.

Hook session.end para telemetria: registra número de tool calls, tokens consumidos, tempo de sessão e ferramentas mais usadas. Permite identificar quais MCPs são realmente utilizados e quais só consomem contexto.

Hook permission.deny para auditoria: loga toda tentativa de violação com timestamp, agente, ferramenta e parâmetros — essencial para detectar padrões de ataque ou agentes tentando operar fora do escopo.

## Auditoria de Segurança do Harness

Use este checklist para auditar seu harness:

- edit: "deny"? Permissões por agente: cada agente tem frontmatter com permission? O code-reviewer tem

- Glob patterns: ferramentas edit e bash têm glob patterns restritivos?

- Deny-all aplicado: agentes especializados usam "*": "deny" com allow-list?

- MCPs configurados: cada MCP tem permissões granulares (mcp__*)?

- MCPs não utilizados: há MCPs configurados que não são usados? Consomem tokens sem benefício.

- Superfície de rede: webfetch e websearch são restritos por agente? Algum agente não precisa deles?

- Princípio do menor privilégio: cada agente tem exatamente as permissões que seu papel exige?

- ação proibida e confirme que o gatekeeper bloqueia. Teste de penetração: você já tentou violar as próprias regras? Peça ao agente para executar uma

- Revisão periódica: a cada novo MCP adicionado, revise as permissões de todos os agentes. Um novo servidor pode expor ferramentas que agentes existentes não deveriam ter.

- documente a justificativa no frontmatter como comentário. Isso evita que exceções virem regras esquecidas. Documentação de exceções: se um agente precisa de uma permissão incomum para seu papel,


- headers de autenticação estão em env (não expostos ao agente) e se o MCP não retorna dados sensíveis que vazariam para o histórico. Isolamento de MCPs remotos: servidores SSE recebem dados do contexto via tool call. Revise se

- agentes e lista permissões explícitas vs herdadas, destacando inconsistências como edit: "allow" sem glob pattern. Auditoria automatizada: crie um comando personalizado (ex: /audit) que percorre todos os

- Teste de regressão: após alterar permissões globais, verifique se agentes existentes ainda funcionam. Uma mudança no global pode quebrar permissões que um agente dependia sem saber.

Checklist para novos MCPs: ao adicionar um servidor MCP, execute estes passos de segurança: 1. Liste todas as ferramentas que ele expõe (tools/list) 2. Associe cada ferramenta a um papel de agente que precisa dela 3. Configure "mcp__<server>__<tool>": "allow" apenas para os pares necessários 4. Negue o resto com "mcp__<server>__*": "deny" 5. Documente no AGENTS.md do projeto quais MCPs estão configurados e por quê

## Autoavaliação: Quiz Rápido

## 1. Qual a diferença fundamental entre allow, ask e deny no gatekeeper de permissões?

Resposta: allow executa a ferramenta imediatamente, sem intervenção humana. ask interrompe e pergunta ao usuário (que pode aprovar, rejeitar ou modificar). deny bloqueia silenciosamente — o agente nem fica sabendo que a ferramenta existe.

## 2. O que são glob patterns e por que são mais seguros que permissões binárias?

Resposta: Glob patterns são expressões de caminho que restringem o escopo de uma permissão a diretórios e extensões específicas (ex: edit: "src/**/*.js"). São mais seguros que permissões binárias (edit: "allow") porque limitam espacialmente o dano potencial — mesmo que o agente seja induzido a editar, só pode editar dentro do padrão permitido.

## 3. Qual a diferença entre transporte stdio e HTTP/SSE no MCP? Quando usar cada um?

Resposta: stdio: servidor como processo local, comunicação via stdin/stdout, latência mínima, sem autenticação, dados não saem da máquina. HTTP/SSE: servidor como serviço web, latência de rede, exige autenticação, dados trafegam pela rede. Use stdio para MCPs que você controla (locais); use HTTP/SSE para serviços externos compartilhados.

## 4. Qual a diferença conceitual entre MCP e Plugin?

Resposta: MCP adiciona ferramentas executáveis — expande o que o agente pode fazer. Plugin intercepta o ciclo de vida via hooks — expande como o sistema se comporta. MCPs são visíveis para o agente (aparecem como tools). Plugins são transparentes (o agente não sabe que existem).

## 5. Por que cada MCP adicionado tem um custo que vai além do financeiro?

Resposta: Cada MCP consome tokens com suas tool definitions no system prompt (custo de contexto), adiciona ruído à decisão do agente (quanto mais opções, maior a chance de erro), expande a superfície de segurança (cada MCP é um vetor de ataque) e aumenta a complexidade cognitiva do sistema. O custo financeiro (API) é apenas uma das quatro dimensões.


## 6. O que é o padrão deny-all + allow-list e por que ele é considerado o padrão ouro?

Resposta: "*": "deny" bloqueia todas as ferramentas que não têm regra explícita. Depois, você libera exatamente o necessário com permissões específicas. É o padrão ouro porque novas ferramentas (de MCPs ou built-ins futuras) começam bloqueadas automaticamente — ao contrário de allow-all + deny-list, onde começam liberadas até você lembrar de bloqueá-las.

## Mão na Massa 3: Exercícios Graduados

## Exercício 1 (Fácil) — Caça aos Globs

Você herdou um harness com esta configuração:

```
{
"permission": {
"edit": "allow",
"bash": "ask"
}
}
```

Identifique por que essa configuração viola o princípio do menor privilégio e reescreva-a com glob patterns restritivos e deny-all para um agente code-reviewer.

## Gabarito:

A configuração atual permite edit: "allow" sem restrição de escopo — o agente pode editar qualquer arquivo. Para um code-reviewer, edit deveria ser "deny". Para o agente principal (build), edit deve ser restrito com glob patterns.

Configuração corrigida para o global:

```
{
"permission": {
"*": "allow",
"bash": "ask",
"edit": "ask"
}
}
```

Configuração para o code-reviewer (no frontmatter):

```
\---
permission:
"*": "deny"
"read": "allow"
"skill": "allow"
"webfetch": "allow"
---
```


Configuração para o build (no frontmatter):

```
\---
permission:
"edit": ["src/**/*.js", "src/**/*.css", "src/**/*.html"]
"bash": "ask"
"task": "allow"
"skill": "allow"
---
```

A violação original: edit: "allow" sem glob pattern dá ao agente poder irrestrito de modificar qualquer arquivo no sistema — incluindo configurações críticas como opencode.json ou secrets.

## Exercício 2 (Médio) — Debug de Permissões

Você configurou um MCP do GitHub no seu harness, mas quando pede ao agente para buscar issues, ele responde “não tenho acesso a essa ferramenta”. A configuração atual é:

```
{
"mcp_servers": {
"github": {
"type": "stdio",
"command": "npx",
"args": ["-y", "@github/mcp-server"]
}
},
"permission": {
"mcp__github__*": "deny"
}
}
```

Diagnostique o problema, corrija a configuração e documente os passos que você seguiu para testar a correção.

## Gabarito:

O problema: "mcp__github__*": "deny" bloqueia TODAS as ferramentas do GitHub, incluindo search_issues. O agente nunca tem permissão para usar nenhuma tool do MCP.

Correção: liberar ferramentas específicas que o agente precisa:

```
{
"permission": {
"mcp__github__*": "deny",
"mcp__github__search_issues": "allow",
"mcp__github__create_issue": "ask"
}
}
```

Passos de diagnóstico: 1. Verificar se o MCP está ativo nos logs de inicialização (confirma que a conexão funciona) 2. Listar ferramentas disponíveis do GitHub (devem aparecer como mcp__github__search_issues, etc.) 3. Verificar permission no opencode.json — encontrar o


"mcp__github__*": "deny" que bloqueia tudo 4. Adicionar allow explícito para search_issues 5. Testar: “Busque issues abertas no repositório do OpenCode”

## Desafio (Difícil) — Auditoria Completa de Harness

Você recebeu um harness de um colega que está configurado assim:

```
{
"permission": {
"*": "allow"
},
"mcp_servers": {
"github": { "type": "stdio", "command": "npx", "args": ["-y", "@github/mcp-server"]
}
}
}
```

Com agentes: build (sem frontmatter de permissão), code-reviewer (sem frontmatter), e pesquisador (sem frontmatter).

Conduza uma auditoria completa:

- 1. Liste todas as vulnerabilidades desta configuração

- 2. Proponha uma configuração corrigida com deny-all, glob patterns e permissões granulares para MCPs

- 3. Crie os frontmatters para cada agente seguindo o menor privilégio

- 4. Documente em um parágrafo qual o risco mais crítico e por quê

## Gabarito:

- 1. Vulnerabilidades identificadas: - "*": "allow" libera todas as ferramentas built-in e futuras sem restrição — risco máximo - Nenhum agente tem frontmatter de permissão — todos herdam o global permissivo - MCP do GitHub com acesso total — qualquer agente pode criar issues, fechar PRs, modificar repositórios - Sem glob patterns: qualquer agente pode editar qualquer arquivo (inclusive config) - Sem isolamento de papéis: pesquisador pode editar código, code-reviewer pode executar comandos

## 2. Configuração global corrigida:

```
{
"permission": {
"*": "allow",
"bash": "ask",
"edit": "ask",
"mcp__*": "deny"
},
"mcp_servers": {
"github": {
"type": "stdio",
"command": "npx",
"args": ["-y", "@github/mcp-server"]
}
}
}
```


## 3. Frontmatters:

build:

```
\---
permission:
"edit": ["src/**/*.js", "src/**/*.css", "src/**/*.html"]
"bash": "ask"
"task": "allow"
"skill": "allow"
"mcp__github__search_issues": "allow"
---
```

## code-reviewer:

```
\---
permission:
"*": "deny"
"read": "allow"
"skill": "allow"
"webfetch": "allow"
---
```

## pesquisador:

```
\---
permission:
"*": "deny"
"read": "allow"
"webfetch": "allow"
"mcp__github__search_issues": "allow"
---
```

- 4. Risco mais crítico: o "*": "allow" combinado com a ausência de frontmatters significa que qualquer agente — incluindo um code-reviewer que só deveria analisar código — pode editar arquivos, executar comandos arbitrários e chamar qualquer ferramenta do MCP do GitHub. Um prompt malicioso ou ambíguo poderia fazer o code-reviewer executar git push --force ou modificar o próprio opencode.json para remover restrições. A vulnerabilidade não está em um agente específico, mas na ausência total de barreiras.

## Resumo da Aula

## Os 7 Conceitos Fundamentais

- 1. Modelo Allow/Ask/Deny: gatekeeper universal — allow executa, ask pergunta, deny bloqueia. A decisão é antes da execução.

- 2. Menor privilégio: cada agente recebe exatamente as permissões que seu papel exige. O code-reviewer não edita nem executa comandos.

- 3. Glob patterns: expressões de caminho que refinam permissões binárias em permissões cirúrgicas com escopo espacial.


- 4. transporte stdio (local) ou HTTP/SSE (remoto). MCP: protocolo que desacopla agentes de ferramentas externas. Comunicação via JSON-RPC,

- 5. Plugins: interceptam o ciclo de vida via hooks. MCPs adicionam ferramentas; plugins adicionam comportamentos.

- 6. Trade-off: cada ferramenta custa tokens, dinheiro e segurança. Habilite apenas o necessário.

- 7. Deny-all + allow-list: padrão ouro — "*": "deny" bloqueia tudo, libere apenas o necessário.

## O Que Você Construiu Hoje

- Permissões configuradas com glob patterns no opencode.json

- Frontmatter de agentes com deny-all + allow-list

- MCP registrado no harness

- Agente especializado com permissões granulares

- Auditoria de segurança do harness

| Conceito | Definição |
| --- | --- |
| Allow/Ask/Deny | Gatekeeper: executa, pergunta ou bloqueia antes da execução |
| Menor privilégio | Cada agente recebe só as permissões necessárias |
| Glob patterns | Expressões de caminho para permissões com escopo espacial |
| MCP (Model Context Protocol) | Protocolo para conectar agentes a ferramentas externas |
| Plugins | Hooks que interceptam o ciclo de vida (before/after) |
| Trade-off | Cada ferramenta custa tokens, dinheiro e expande superfície |
| Deny-all + allow-list | Padrão ouro: "*": "deny", libere apenas o necessário |

## Próxima Aula

Aula 05: Ferramentas Customizadas e Plugins Customizados — Depois de dominar permissões, MCPs e plugins prontos, você vai construir os seus próprios: custom tools com JavaScript e plugins com hooks de ciclo de vida. Vamos unir teoria e prática em componentes reutilizáveis.

## Referências

## Documentação Oficial

- [OpenCode — Permissions](https://opencode.ai/docs/config/#permissions)

- [OpenCode — MCP Servers](https://opencode.ai/docs/mcp-servers/)

- [OpenCode — Plugins](https://opencode.ai/docs/plugins/)

- [Model Context Protocol — Especificação](https://modelcontextprotocol.io/)

## Ferramentas

- [GitHub MCP Server](https://github.com/github/github-mcp-server)


- [Playwright MCP](https://github.com/microsoft/playwright-mcp)

- [Repositório oficial OpenCode](https://github.com/anomalyco/opencode)

## Artigos

- [Princípio do Menor Privilégio — Saltzer & Schroeder (1975)](https://en.wikipedia.org/wiki/Principle_of_least_privilege)

## Aulas Anteriores

- Aula 01: Fundamentos do LLM ao OpenCode

- Aula 02: Contexto, Sessões e Handoff

- Aula 03: Agentes, Skills, Comandos e Orquestração

## FAQ

P: Posso ter allow para todas as ferramentas? O agente é bem-comportado… R: Não recomendado. O agente é um preditor de próximo token — um contexto ambíguo pode fazê-lo executar algo destrutivo. Com allow global, não há barreira.

- P: Qual a diferença entre ask e deny na prática? R: ask pergunta ao usuário (aprov/rejeita/modifica). deny bloqueia silenciosamente.

- P: O que acontece com ferramentas de um MCP se o servidor cair no meio da sessão? R: Ficam indisponíveis. O OpenCode não reconecta automaticamente. É preciso reiniciar a sessão.

- P: Quantos MCPs posso configurar ao mesmo tempo? R: Tecnicamente, quantos quiser. Mas cada MCP consome tokens com suas tool definitions. Com 3-4 MCPs de 10 ferramentas cada, você pode estar usando 5-10% da janela de contexto só em definições — antes de qualquer interação.

- P: MCPs substituem skills? R: Não. Skills injetam conhecimento (texto). MCPs expõem ferramentas executáveis (ações). São complementares.

## Glossário

| Termo Definição Allow/Ask/Deny Os três estados do gatekeeper: executa, pergunta ou bloqueia. (Seção 1) Deny-all + allow-list Padrão: negar tudo, liberar só o necessário. (Seção 6) Gatekeeper Camada que inspeciona tool calls antes da execução. (Seção 1) |
| --- |
| Glob pattern Expressão de caminho para refinar permissões. (Seção 2) Hook Ponto de extensão para plugins: before, after, start, end. (Seção 4) MCP Model Context Protocol — padroniza comunicação com ferramentas externas. (Seção 3) Menor privilégio Princípio: cada agente só recebe o que precisa. (Seção 2) Plugin Código que intercepta eventos do ciclo de vida. (Seção 4) Tool definition Descrição da ferramenta no system prompt. Consome tokens. (Seção 5) |
