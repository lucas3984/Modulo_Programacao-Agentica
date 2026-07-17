# O que é Tool Calling?

Tool calling (ou chamada de ferramentas) é o mecanismo que permite a um LLM
interagir com o mundo real — como criar arquivos, executar comandos ou buscar
na web — através de funções pré-definidas.

## Como funciona

1. O LLM recebe um prompt em linguagem natural
2. Ele decide qual ferramenta usar com base no contexto
3. Gera um JSON estruturado com os parâmetros da chamada
4. O runtime (host) executa a ferramenta no sistema real
5. O resultado volta para o LLM, que prepara a resposta final

## Exemplo em JavaScript

```js
// Simulação do ciclo de tool calling

const ferramentas = {
  criarArquivo: (path, conteudo) => {
    console.log(`Arquivo ${path} criado com ${conteudo.length} caracteres`);
    return { sucesso: true, path };
  }
};

function agente(prompt) {
  // Passo 1: interpretar o prompt
  if (prompt.includes("criar arquivo")) {
    // Passo 2: decidir a ferramenta e gerar o JSON
    const toolCall = {
      ferramenta: "criarArquivo",
      argumentos: {
        path: "saudacao.js",
        conteudo: 'export function saudacao(nome) {\n  return `Olá, ${nome}!`;\n}'
      }
    };

    // Passo 3: runtime executa a ação real
    const resultado = ferramentas[toolCall.ferramenta](
      toolCall.argumentos.path,
      toolCall.argumentos.conteudo
    );

    // Passo 4: LLM interpreta o resultado
    return `Arquivo "${resultado.path}" criado com sucesso!`;
  }
}

console.log(agente("Crie um arquivo saudacao.js"));
// Saída: Arquivo saudacao.js criado com 52 caracteres
//        Arquivo "saudacao.js" criado com sucesso!
```

O LLM **propõe** a ação (JSON), o runtime **executa** a ação real — essa
separação é o coração do tool calling.
