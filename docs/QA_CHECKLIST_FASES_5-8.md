# QA Checklist – Fases 5–8

## FASE 5 – Ranking
- [ ] Ranking carrega Semanal/Mensal/Global
- [ ] Pódio 1–3 correto (ouro/prata/bronze)
- [ ] Lista 4–10 limpa, sem "último"
- [ ] Card "Você": posição, XP falta subir, vizinhos 2 acima/2 abaixo
- [ ] Evolução pessoal mostra frase positiva
- [ ] Privacidade: perfil com mostrar_no_ranking=false não aparece p/ outros
- [ ] Foto assinada só se mostrar_foto_no_ranking=true
- [ ] Hall da Fama exibe top3 por liga/período
- [ ] fechar_periodo gera hall_da_fama + trofeus_esforco + primeiro_trono

## FASE 6 – Loja/Inventário
- [ ] Loja lista itens ativos
- [ ] Compra com moedas suficientes funciona
- [ ] Compra sem moedas mostra erro gentil
- [ ] Item único não repete compra
- [ ] Inventário mostra itens adquiridos
- [ ] Equipar avatar atualiza avatar_id no perfil
- [ ] Equipar/desquipar borda/tema alterna
- [ ] Feedback Kapivarus ao comprar

## FASE 7 – Notificações/Toasts
- [ ] Toast ao subir de nível
- [ ] Toast ao ganhar medalhas (prioriza 1ª)
- [ ] Toasts não-invasivos, auto-dismiss
- [ ] Respeita prefers-reduced-motion
- [ ] ToastProvider global

## FASE 8 – Relatórios Pais
- [ ] Semanal/Mensal alternam
- [ ] Cards: dias, XP, missões, taxa acerto
- [ ] Streak atual/maior
- [ ] Gráfico constância (verdes = estudou)
- [ ] Frase positiva e foco em esforço
- [ ] Acesso via Painel/Painel Responsável

## Geral
- [ ] Build Vite OK
- [ ] Rotas protegidas corretas
- [ ] Sem vazamento dados privados
- [ ] Acessibilidade: foco visível, áreas 48px
- [ ] TDAH-friendly: listas curtas, 1 info principal
