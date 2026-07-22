---
name: api-rest-patterns
description: "Padrões de design para APIs REST: endpoints, métodos HTTP, status codes, validação e boas práticas"
license: MIT
metadata:
  version: "1.0"
  tags: [api, rest, http, backend]
---

# Padrões de Design para APIs REST

## O que é REST

REST (Representational State Transfer) é um estilo arquitetural para APIs web. Princípios fundamentais:

- **Stateless**: Cada requisição contém toda informação necessária. Servidor não guarda estado entre requests
- **Recursos**: Tudo é um recurso identificado por URI (`/livros`, `/livros/42`)
- **Verbos HTTP**: Ações são expressas pelo método HTTP, não pela URL
- **Representações**: Recursos podem ser retornados em JSON, XML, etc.

## Convenções de Endpoints

| Padrão | Significado | Exemplo |
|--------|-------------|---------|
| `GET /recurso` | Listar todos | `GET /livros` |
| `GET /recurso/:id` | Buscar um | `GET /livros/42` |
| `POST /recurso` | Criar novo | `POST /livros` |
| `PUT /recurso/:id` | Atualizar completo | `PUT /livros/42` |
| `PATCH /recurso/:id` | Atualizar parcial | `PATCH /livros/42` |
| `DELETE /recurso/:id` | Remover | `DELETE /livros/42` |

**Regras:**
- URLs em minúsculas, separadas por hífens: `/autores-livros`
- Versão na URL ou header: `/api/v1/livros`
- Nested resources com moderação: `/livros/42/autores` (evite 3+ níveis)

## Métodos HTTP

### GET — Leitura
- Nunca modifica dados
- Pode ser cacheado
- Seguro e idempotente
- Ex: `GET /livros?autor=Machado&pagina=1`

### POST — Criação
- Cria novo recurso
- Não idempotente (enviar 2x cria 2 recursos)
- Retorna 201 Created com Location header
- Ex: `POST /livros` com body `{ "titulo": "Dom Casmurro", "autor": "Machado" }`

### PUT — Atualização completa
- Substitui o recurso inteiro
- Idempotente (enviar 2x tem mesmo efeito)
- Retorna 200 ou 204
- Ex: `PUT /livros/42` com body completo

### PATCH — Atualização parcial
- Modifica campos específicos
- Idempotente
- Retorna 200 ou 204
- Ex: `PATCH /livros/42` com `{ "genero": "romance" }`

### DELETE — Remoção
- Remove o recurso
- Idempotente
- Retorna 204 No Content ou 404 se não existe
- Ex: `DELETE /livros/42`

## Status Codes

| Código | Significado | Quando usar |
|--------|-------------|-------------|
| 200 | OK | GET retorna dados, PUT/PATCH retorna recurso atualizado |
| 201 | Created | POST cria recurso com sucesso |
| 204 | No Content | DELETE ou PUT sem retorno |
| 400 | Bad Request | Validação falhou, dados inválidos |
| 401 | Unauthorized | Autenticação necessária ou falhou |
| 403 | Forbidden | Autenticado mas sem permissão |
| 404 | Not Found | Recurso não existe |
| 409 | Conflict | Conflito (ex: email duplicado) |
| 422 | Unprocessable Entity | Dados válidos mas sem sentido (ex: data no futuro) |
| 429 | Too Many Requests | Rate limit atingido |
| 500 | Internal Server Error | Erro inesperado no servidor |
| 503 | Service Unavailable | Serviço temporariamente indisponível |

## Boas Práticas

### Validação de Entrada
- Valide TODOS os dados de entrada no servidor (nunca confie no client)
- Retorne 400 com mensagem descritiva: `{ "erro": "titulo é obrigatório" }`
- Use schema validation (Zod, Joi, Yup)

### Paginação
- Para listas grandes, use paginação: `GET /livros?pagina=2&limite=20`
- Retorne metadata: `{ "dados": [...], "pagina": 2, "total": 150, "totalPaginas": 8 }`

### Tratamento de Erros
- Formato consistente: `{ "erro": "mensagem", "codigo": "VALIDACAO_FALHOU", "detalhes": [...] }`
- Log erros no servidor, retorne apenas mensagem genérica para 500
- Nunca exponha stack traces em produção

### Versionamento
- Use versionamento desde o início: `/api/v1/livros`
- Não remova campos antigos abruptamente — deprecate primeiro
- Comunique mudanças nos changelogs

### Segurança
- Rate limiting para prevenir abuso
- HTTPS obrigatório em produção
- Validação de Content-Type
- Sanitização de inputs contra XSS e SQL injection
