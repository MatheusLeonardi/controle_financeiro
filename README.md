# Controle Financeiro

Aplicação simples para registrar receitas e gastos por mês, com persistência em SQLite.

## Requisitos

- Node.js (inclui o `npm`).

> **Windows:** instale o Node.js pelo site oficial (https://nodejs.org) para garantir que o `npm` esteja disponível no terminal. Após a instalação, feche e abra o terminal novamente.

## Como executar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Avisos do npm

Durante o `npm install` podem aparecer avisos de dependências legadas do ecossistema. Para verificar e tentar corrigir vulnerabilidades, use:

```bash
npm audit
npm audit fix
```

Se o npm sugerir `npm audit fix --force`, avalie porque ele pode atualizar dependências com mudanças de breaking change.

## Estrutura

- `public/` contém a interface web.
- `server.js` expõe a API e inicializa o banco em `data/finance.db`.
