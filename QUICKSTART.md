# Quickstart Kids_Play

## 1. Instalar dependências
```bash
npm i
```

## 2. Variáveis de ambiente
Criar `.env.local`:
```env
VITE_SUPABASE_URL=seu_url
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

## 3. Rodar dev
```bash
npm run dev
```

## 4. Aplicar migrações Supabase (ordem)
SQL Editor: 
1. `supabase/migrations/20251010_fase5_ranks.sql`
2. `supabase/migrations/20251010_fase6_loja.sql`
3. `supabase/migrations/20251010_fase6b_equipar_item.sql`
4. `supabase/migrations/20251010_fase7_notificacoes.sql`
5. `supabase/migrations/20251010_fase8_relatorios_pais.sql`

## 5. Edge Function + Storage
- Bucket `fotos-perfis` (privado)
- Deploy: `supabase functions deploy ranking/foto`

## Uso local (sem Supabase, offline)

Para rodar o app sem internet e sem projeto Supabase:

```bash
npm run instalar-local
npm run dev
```

O instalador cria `.env.local` com `VITE_MODO_LOCAL=1` e gera o conteúdo das
missões a partir de `banco-de-questoes/`. Perfis, missões, ranking e relatório
dos pais ficam em `localStorage` — nada sai do aparelho.

**O que vem embarcado:** **Matemática do 2º, 3º e 4º ano** — 15 missões e 90
atividades (adição e subtração até 100 no 2º; multiplicação do 2 ao 5 no 3º;
multiplicação e divisão no 4º). Para aumentar, basta acrescentar arquivos em
`banco-de-questoes/` e rodar `npm run gerar-conteudo` — `npm run testar`
valida cada banco antes de publicar.

As telas de admin (importar/revisar) explicam que precisam de conexão.

Para voltar a usar o Supabase, remova a linha `VITE_MODO_LOCAL=1` do `.env.local`.

Testes do modo local: `npm run testar` (unitários) e `npm run testar-modo-local`
(E2E — pare o `npm run dev` antes).

## Instalar como app (PWA)

O build gera um service worker e o app passa a funcionar como aplicativo:

```bash
npm run build      # gera dist/ + dist/sw.js
npm run preview    # serve em http://localhost:4173
```

Abra no navegador: o Chrome/Edge mostram **Instalar** na barra de endereço; no
Android, "Adicionar à tela inicial"; no iPhone, Compartilhar → "Adicionar à
Tela de Início".

Depois da primeira visita o app abre **sem servidor e sem internet**: o service
worker guarda o build inteiro (`dist/sw.js` é gerado no `npm run build`), o
conteúdo das missões vai embutido no bundle e o progresso fica em
`localStorage`. Para servir o `dist/` de um jeito simples, qualquer servidor
estático serve — ou até abrir pelo `npm run preview` uma vez.

O service worker **só existe em produção** (no `npm run dev` ele atrapalharia o
hot reload), e requisições para o Supabase passam direto, sem cache.

Quando você publica uma versão nova, quem já tem o app aberto vê uma faixa
"Versão nova do Kids_Play" com **Depois** e **Atualizar agora**. O app não
troca de versão sozinho justamente para não apagar uma missão em andamento.

Testes do PWA (constroem, servem e desligam a rede):

```bash
npm run testar-pwa
```

## 6. Build
```bash
npm run build && npm run preview
```

## 7. Testes
```bash
npm run testar            # unitários (node --test)
npx playwright test       # E2E (opcional, com o app online)
```
