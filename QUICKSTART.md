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

## 6. Build
```bash
npm run build && npm run preview
```

## 7. Testes
```bash
npx playwright test  # E2E (opcional)
```
