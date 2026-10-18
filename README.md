# Projeto Integrador — Impactos da Paralisia Cerebral na Trajetória Acadêmica

**Integrantes:** Maria Rita Bertoldi Borges, Mia Vieira Cardoso Iglesias Cabral, Sofia Torres Woltmann, Valentina de Borba Farias

## Estrutura

| Pasta / arquivo | Função |
|-----------------|--------|
| `PI/` | Frontend principal (mapa, artigos, preferências, componentes) |
| `index.html` | Entrada do site — redireciona para o mapa de conteúdos |
| `forms.html`, `lista.html` | Formulário de cadastro (localStorage no GitHub Pages) |
| `backend/` | API Express + MySQL para desenvolvimento local |

**Deploy (GitHub Pages):** [https://valentinabfarias.github.io/PI/](https://valentinabfarias.github.io/PI/)

## Desenvolvimento local

### 1. Dependências

```bash
npm install
```

### 2. Frontend estático (recomendado para páginas e artigos)

```bash
npm run serve
```

Abra `http://localhost:5500/PI/pages/map.html` (ou a raiz, que redireciona).

### 3. Backend + MySQL (opcional)

1. Crie o banco `cadastro_formulario` e a tabela `formulario` (campos: `id`, `nome`, `email`, `senha`, `data_cadastro`).
2. Ajuste usuário/senha em `backend/server.js` ou variáveis `DB_*`.
3. Execute:

```bash
npm start
```

Acesse `http://localhost:3000` — o Express serve o mesmo frontend da raiz do repositório.

## Mapa da jornada e PDFs

- A home (`PI/pages/map.html`) mostra etapas em sequência, com a **cobrinha** na fase atual e desbloqueio progressivo.
- Configuração das etapas: `PI/data/journey.json`.
- PDFs publicados: `PI/uploads/pdfs/` (caminho gravado em cada etapa).
- **Menu** (canto superior): navegação, tema claro/escuro/alto contraste, tamanho do texto e link para preferências.
- **Admin** (`PI/pages/admin.html`): envio de PDF por etapa com `npm start` e chave `ADMIN_KEY` (padrão em dev: `pi-admin-dev`).

## Publicar no GitHub Pages

- Branch `main`, pasta `/ (root)`.
- Após `git push`, o `index.html` na raiz redireciona para `PI/pages/map.html`.
- O mapa usa `map.js` (não é necessário PHP no servidor).

## Notas

- Imagens de artigo (`shanghai.jpg`, etc.) podem ser adicionadas em `PI/assets/`.
- `map.php` foi mantido apenas como referência; o deploy usa `map.js`.
