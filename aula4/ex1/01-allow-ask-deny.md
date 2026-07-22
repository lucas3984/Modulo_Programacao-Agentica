# Questão 1 — Classificando Ações

## Tabela de classificação

| Ação | Classificação | Justificativa | Se ask: o que verificar? |
|---|---|---|---|
| A) Ler Button.tsx | **allow** | Leitura é baixo risco, só adiciona informação ao contexto. | — |
| B) Modificar package.json | **ask** | Editar arquivo de configuração crítico (dependências) é alto risco. | Verificar qual dependência será adicionada, a versão e se a fonte é confiável. |
| C) Revisor editar auth.ts | **deny** | O papel de revisor não deve editar, viola o princípio do menor privilégio | — |
| D) Executar npm install | **ask** | Muito alto risco, pode instalar código arbitrário. | Verificar as dependências e porque o modelo quer instalar. |
| E) Carregar skill | **allow** | Carregar skill injeta conhecimento — operação de baixo risco e frequente . | — |
| F) Fetch API externa | **allow** | Acesso à rede é risco médio; webfetch é tipicamente allow no global. | - |
| G) rm -rf node_modules | **ask** | Comando bash destrutivo, mas padrão seguro (node_modules é recriável com npm install). | Confirmar que é o diretório correto e que não há alterações locais não versionadas. |
| H) Disparar subagente | **allow** | Delegação (task) é operação interna de risco médio, tipicamente allow mas depende do agente | — |

## Padrão identificado

Ferramentas que apenas **adicionam informação ao contexto** (leitura, skill, task) tendem a **allow**; ferramentas que **modificam o sistema** (edição, execução de comandos) tendem a **ask** ou **deny**. O **papel do agente** é o fator decisivo. Um revisor recebe deny para edição enquanto um executor recebe ask ou allow, pois a mesma ferramenta tem risco diferente dependendo de quem a invoca.

## Conclusão

Deny impede a que o comando ocorra, enquanto ask permite que seja usado desde que autorizado pelo humano. É importante pois alguns comandos, embora tenham potencial destrutivo, são necessários


