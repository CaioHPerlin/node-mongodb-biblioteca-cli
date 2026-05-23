# Biblioteca CLI com MongoDB - Disciplina Bancos NoSQL

CLI em TypeScript para gerenciar livros e empréstimos usando MongoDB. Extremamente simples, feita para fins educacionais e aberta à expansão.

## Requisitos

- Node.js instalado
- pnpm instalado
- Uma instância do MongoDB acessível pela aplicação

## Configuração

1. Instale as dependências:

```bash
pnpm install
```

2. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

3. Ajuste o valor de `MONGODB_URL` no arquivo `.env`, se necessário.

Exemplo padrão:

```env
MONGODB_URL=mongodb://localhost:27017
```

O projeto usa o banco `biblioteca`.

## Como rodar

Inicie a aplicação com:

```bash
pnpm start
```

Ao abrir, o CLI exibirá o menu principal com os módulos:

- `Livros`
- `Empréstimos`

## Scripts úteis

Executar a aplicação:

```bash
pnpm start
```

Validar tipos:

```bash
pnpm typecheck
```

Gerar build TypeScript:

```bash
pnpm build
```

## Funcionalidades

### Livros

- Listar livros
- Cadastrar livro
- Atualizar livro
- Remover livro

### Empréstimos

- Listar todos
- Listar ativos
- Listar atrasados
- Criar empréstimo
- Registrar devolução

## Estrutura do projeto

```text
src/
	common/       utilitários compartilhados, config e conexão com banco
	modules/
		livros/     entidades, repository, service e menu de livros
		emprestimos/ entidades, repository, service e menu de empréstimos
```

## Observações

- As coleções são `livros` e `emprestimos`.
- Se `MONGODB_URL` estiver ausente ou inválida, a aplicação encerra na inicialização.
