# Rill walkthrough — Kids_Play

Fluxo demonstrado: criar a conta do responsável → criar o perfil da criança →
painel → galeria do Kapivarus. É o fluxo que o [progress.md](progress.md) já
registrou como verificado de ponta a ponta com o banco real.

## Passos numerados e comportamento esperado

Kids_Play — fluxo: criar conta do responsável, criar perfil da criança e abrir a galeria do Kapivarus.

Pré-requisitos: app em URL pública (ex.: Vercel); VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no deploy; schema.sql rodado no Supabase; confirmação de e-mail desligada (Authentication → Providers → Email).

Dados de teste: e-mail rill.teste@exemplo.com; senha nova (mín. 6); apelido "Testinho"; 2º ano; "Gotinha".

1. Abra a URL pública adicionada no Rill. Esperado: tela "Entrar" (/login). Se aparecer "Falta conectar o banco de dados", pare — faltam as variáveis do Supabase no deploy.
2. Clique "Cadastre-se". Esperado: formulário de cadastro.
3. Preencha e-mail e senha, clique "Criar conta". Esperado: entra logado e cai em "Criar perfil da criança" (/criar-perfil). Se aparecer "Quase lá!", a confirmação de e-mail ainda está ligada — desligue no Supabase.
4. Apelido "Testinho", toque "2º ano" e "Gotinha", clique "Salvar perfil". Esperado: /perfis mostra o cartão "Testinho — 2º ano".
5. Toque no cartão "Testinho". Esperado: /painel com "Oi, Testinho!", Kapivarus incentivando, XP/Moedas/Dias = 0, fase Aldeia.
6. Toque "Ver o Kapivarus em todas as poses". Esperado: /galeria com as 9 poses, cada uma com nome e momento de uso.
7. Toque "Trocar de perfil" e depois "Sair". Esperado: volta à lista de perfis; ao sair, à tela de login.

Falta confirmar: URL pública do app (obrigatória — localhost não funciona em nuvem) e Supabase preparado.

## Entradas que faltam (preencher no Rill)

- **URL pública do app** — não foi fornecida neste run. Execuções em nuvem não
  alcançam localhost; adicione a URL pública do deploy (ex.: Vercel).
- **Projeto Supabase preparado** — `VITE_SUPABASE_URL` e
  `VITE_SUPABASE_ANON_KEY` no deploy, `supabase/schema.sql` executado e
  confirmação de e-mail desligada. Sem isso o passo 1 já sinaliza o problema.

## Gravação manual (alvo local/privado)

Se você só tem o app local (`http://localhost:5173`), o Rill em nuvem não
consegue alcançá-lo. Grave manualmente:
https://userill.dev/record?utm_source=freebuff&utm_medium=paid&utm_campaign=rill
Ou grave um agente de navegador já existente:
https://userill.dev/docs/agent-quickstart?utm_source=freebuff&utm_medium=paid&utm_campaign=rill

## Verificação

_Etapas: 1452 caracteres (limite 1.500). Link: 2600
caracteres (limite 18.000). Nenhuma URL pública foi fornecida, então não foi
anexado `&url=`. Nenhuma gravação foi feita._

---

Your walkthrough is prepared. No recording has been made yet. In Rill, review the steps, add a public app URL, and choose Sign up to run if you need an account. The walkthrough uses Interact mode. Press Run to start it.

[Open your walkthrough in Rill](https://userill.dev/freebuff?utm_source=freebuff&utm_medium=paid&utm_campaign=rill&utm_content=text-ad&bfcid=bfc_1.eyJpZCI6ImYyZmZmMDQwLWQ1YTEtNGQzMC04ZGJjLTdhNWZhNTA4NzgxOCIsImMiOiIxNDQyMTUzOS1kYjNiLTQ1YzEtYjQ5OC1hYTMxOTFmNDkxYzAiLCJrIjoiNDU4ODZlNWEtYzkyZC00ZDUxLTg1ZjgtYzc4YTRmMTY3ZWYwIiwiaWF0IjoxNzkxNjY0MjM5fQ.XpLEWKKchHHDsGfA3qZY2ogV3ztZbvPC0J6CpxSd0NY#task=Kids_Play%20%E2%80%94%20fluxo%3A%20criar%20conta%20do%20respons%C3%A1vel%2C%20criar%20perfil%20da%20crian%C3%A7a%20e%20abrir%20a%20galeria%20do%20Kapivarus.%0A%0APr%C3%A9-requisitos%3A%20app%20em%20URL%20p%C3%BAblica%20(ex.%3A%20Vercel)%3B%20VITE_SUPABASE_URL%20e%20VITE_SUPABASE_ANON_KEY%20no%20deploy%3B%20schema.sql%20rodado%20no%20Supabase%3B%20confirma%C3%A7%C3%A3o%20de%20e-mail%20desligada%20(Authentication%20%E2%86%92%20Providers%20%E2%86%92%20Email).%0A%0ADados%20de%20teste%3A%20e-mail%20rill.teste%40exemplo.com%3B%20senha%20nova%20(m%C3%ADn.%206)%3B%20apelido%20%22Testinho%22%3B%202%C2%BA%20ano%3B%20%22Gotinha%22.%0A%0A1.%20Abra%20a%20URL%20p%C3%BAblica%20adicionada%20no%20Rill.%20Esperado%3A%20tela%20%22Entrar%22%20(%2Flogin).%20Se%20aparecer%20%22Falta%20conectar%20o%20banco%20de%20dados%22%2C%20pare%20%E2%80%94%20faltam%20as%20vari%C3%A1veis%20do%20Supabase%20no%20deploy.%0A2.%20Clique%20%22Cadastre-se%22.%20Esperado%3A%20formul%C3%A1rio%20de%20cadastro.%0A3.%20Preencha%20e-mail%20e%20senha%2C%20clique%20%22Criar%20conta%22.%20Esperado%3A%20entra%20logado%20e%20cai%20em%20%22Criar%20perfil%20da%20crian%C3%A7a%22%20(%2Fcriar-perfil).%20Se%20aparecer%20%22Quase%20l%C3%A1!%22%2C%20a%20confirma%C3%A7%C3%A3o%20de%20e-mail%20ainda%20est%C3%A1%20ligada%20%E2%80%94%20desligue%20no%20Supabase.%0A4.%20Apelido%20%22Testinho%22%2C%20toque%20%222%C2%BA%20ano%22%20e%20%22Gotinha%22%2C%20clique%20%22Salvar%20perfil%22.%20Esperado%3A%20%2Fperfis%20mostra%20o%20cart%C3%A3o%20%22Testinho%20%E2%80%94%202%C2%BA%20ano%22.%0A5.%20Toque%20no%20cart%C3%A3o%20%22Testinho%22.%20Esperado%3A%20%2Fpainel%20com%20%22Oi%2C%20Testinho!%22%2C%20Kapivarus%20incentivando%2C%20XP%2FMoedas%2FDias%20%3D%200%2C%20fase%20Aldeia.%0A6.%20Toque%20%22Ver%20o%20Kapivarus%20em%20todas%20as%20poses%22.%20Esperado%3A%20%2Fgaleria%20com%20as%209%20poses%2C%20cada%20uma%20com%20nome%20e%20momento%20de%20uso.%0A7.%20Toque%20%22Trocar%20de%20perfil%22%20e%20depois%20%22Sair%22.%20Esperado%3A%20volta%20%C3%A0%20lista%20de%20perfis%3B%20ao%20sair%2C%20%C3%A0%20tela%20de%20login.%0A%0AFalta%20confirmar%3A%20URL%20p%C3%BAblica%20do%20app%20(obrigat%C3%B3ria%20%E2%80%94%20localhost%20n%C3%A3o%20funciona%20em%20nuvem)%20e%20Supabase%20preparado.)
