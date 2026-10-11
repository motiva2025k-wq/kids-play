# Kids_Play — Plano de Trabalho

**Objetivo:** App web de reforço escolar gamificado (2º–4º ano, foco TDAH) com React + Vite + Tailwind, Supabase, Vercel.

**Próximo passo:** Usuário confirma a FASE 2 (pode pedir ajustes no Kapivarus pelo visual); depois FASE 3 (banco de perguntas + motor de missões).

## Fases

### Phase 1: Estrutura, banco (SQL + RLS), login e perfil da criança
**Status:** complete
- [x] Explorar contexto / classificar tarefa (arquitetural)
- [x] Apresentar estrutura de pastas e esquema do banco ao usuário
- [x] Aguardar aprovação (gate do brainstorming) — APROVADO
- [x] Criar scaffold do projeto (Vite 8 + React 19 + Tailwind 4)
- [x] Criar supabase/schema.sql com RLS completo
- [x] Auth (cadastro/login do responsável) + CRUD perfil da criança
- [x] Instruções de rodar/testar/publicar (README.md)
- [x] Verificar: npm install, build, dev server + teste no navegador
- [x] Usuário criou o projeto Supabase e rodou o schema.sql (teste 4/4 ✓)
- [x] E2E completo com banco real: cadastro → login → perfil da criança → painel; guardian_id correto e isolamento entre famílias (RLS) verificados

### Phase 2: Design system + Kapivarus (SVG, 9 poses) + home
**Status:** complete
- [x] Kapivarus.jsx com 9 poses (coroa, óculos, capa; olhos/boca/braços/acentos parametrizados)
- [x] Componentes BalaoFala e BarraProgresso
- [x] Página /galeria com as 9 poses e o momento de uso de cada uma
- [x] Painel com Kapivarus incentivando + meta do dia + link da galeria
- [x] Verificação: build ✓ + revisão visual pose a pose no navegador (3 rodadas de correção)

### Phase 3: Banco de perguntas JSON + motor de missões (4 tipos de exercício)
**Status:** pending

### Phase 4: Gamificação (XP, moedas, níveis, streak, medalhas, loja) + Modo Reforço
**Status:** pending

### Phase 5: Ranking (semanal/mensal/global, pódio, ligas, troféu de esforço)
**Status:** pending

### Phase 6: Painel dos pais + privacidade/consentimento + ajustes TDAH
**Status:** pending

### Phase 7: Publicação final (Vercel + Supabase) e testes
**Status:** pending

## Decisions Made
- Tarefas novas entram como fases adicionais quando solicitadas.
- FASE 1 aprovada com foto no ranking desligada por padrão (privacidade).
- Login apenas do responsável; criança escolhe perfil no aparelho sem senha.
- Nomes de tabelas em inglês (padrão Supabase), comentários/UI em português.
- Tailwind v4 via plugin @tailwindcss/vite; Lexend empacotada por @fontsource (sem CDN).

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
