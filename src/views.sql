-- ============================================================
-- Kids_Play — Fase 3: Banco de dados (Supabase + RLS)
--
-- ORDEM DE EXECUÇÃO:
--  1. Tabelas + políticas de segurança (RLS)
--  2. Funções auxiliares (se necessário; aqui só view)
--  3. SEED: 5 matérias + 2º ano Português (3 missões) + 2º ano Matemática (3 missões)
-- ============================================================
-- NOTA: execute no SQL Editor do Supabase (ou no CLI com `psql`).
-- O user que executar DEVE ter permissão para criar tabelas.
-- Após a criação, configure as chaves estrangeiras e a 당내 M2M se necessário.

--------------------------------------------------
-- 0. Garante extensões úteis (se ainda não tiver)
--------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------
-- 1. Tabela materias
--------------------------------------------------
CREATE TABLE IF NOT EXISTS materias (
  id TEXT PRIMARY KEY,                  -- ex.: 'portugues','matematica','ciencias','historia','geografia'
  nome TEXT NOT NULL,
  icone TEXT,                           -- opcional (emoji ou id de svg)
  cor  TEXT,                            -- hex, ex.: '#4c1d95'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- 2. Tabela missoes
--------------------------------------------------
CREATE TABLE IF NOT EXISTS missoes (
  id            BIGSERIAL PRIMARY KEY,
  materia_id    TEXT NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  ano           INT NOT NULL CHECK (ano IN (2,3,4)),
  titulo        TEXT NOT NULL,
  descricao     TEXT NOT NULL,
  ordem         INT NOT NULL,
  dificuldade   INT NOT NULL CHECK (dificuldade BETWEEN 1 AND 3),
  ativa         BOOLEAN NOT NULL DEFAULT TRUE,
  criada_em     TIMESTAMPTZ DEFAULT NOW(),
  atualizada_em TIMESTAMPTZ DEFAULT NOW(),

  -- Campos de progresso (opcional; usados pelo app)
  -- "disponivel_para": quem pode iniciar (null = qualquer uma que satisfaça RLS)
  -- "concluida_por": array de ids de crianças que já concluíram (via trigger/regras no app)
  -- Aqui deixamos que o backend controle; a RLS só vai permitir leitura.
  CONSTRAINT uq_missao_ano_materia_ordem UNIQUE (ano, materia_id, ordem)
);

--------------------------------------------------
-- 3. Tabela perguntas
--------------------------------------------------
CREATE TABLE IF NOT EXISTS perguntas (
  id            BIGSERIAL PRIMARY KEY,
  missao_id     BIGINT NOT NULL REFERENCES missoes(id) ON DELETE CASCADE,
  tipo          TEXT NOT NULL CHECK (tipo IN (
                  'multipla_escolha',
                  'verdadeiro_falso',
                  'completar',
                  'arrastar_soltar',
                  'contar_imagens'
                )),
  enunciado     TEXT NOT NULL,
  dados         JSONB NOT NULL DEFAULT '{}',   -- formato conforme o tipo (ver seção 2 abaixo)
  dica          TEXT,
  explicacao    TEXT,
  ordem         INT NOT NULL,
  criada_em     TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_pergunta_missao_ordem UNIQUE (missao_id, ordem)
);

--------------------------------------------------
-- 4. Tabela tentativas_missao
--------------------------------------------------
CREATE TABLE IF NOT EXISTS tentativas_missao (
  id              BIGSERIAL PRIMARY KEY,
  crianca_id      UUID NOT NULL,              -- igual ao auth.users.id da criança (via conta do responsável)
  missao_id       BIGINT NOT NULL REFERENCES missoes(id) ON DELETE CASCADE,
  iniciada_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  concluida_em    TIMESTAMPTZ,                -- null = pausada / não terminada
  acertos         INT NOT NULL DEFAULT 0,
  total           INT NOT NULL DEFAULT 0,
  xp_ganho        INT NOT NULL DEFAULT 0,
  moedas_ganhas   INT NOT NULL DEFAULT 0,
  refeita         BOOLEAN NOT NULL DEFAULT FALSE, -- true se já era uma repetição (repetição vale 50%)
  criada_em       TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_tentativa_crianca_missao UNIQUE (crianca_id, missao_id)
);

--------------------------------------------------
-- 5. Tabela respostas
--------------------------------------------------
CREATE TABLE IF NOT EXISTS respostas (
  id                     BIGSERIAL PRIMARY KEY,
  tentativa_id           BIGINT NOT NULL REFERENCES tentativas_missao(id) ON DELETE CASCADE,
  pergunta_id            BIGINT NOT NULL REFERENCES perguntas(id) ON DELETE CASCADE,
  correta                BOOLEAN NOT NULL,
  tentativas_na_pergunta INT NOT NULL DEFAULT 1,
  usou_dica              BOOLEAN NOT NULL DEFAULT FALSE,
  tempo_segundos         INT,                  -- opcional (não usado para punir)
  detalhes               JSONB,                -- { modo: 'primeira'|'dica'|'apos_erro', xp, ... }
  criada_em              TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_resposta_tentativa_pergunta UNIQUE (tentativa_id, pergunta_id)
);

--------------------------------------------------
-- Índices úteis (performance)
--------------------------------------------------
CREATE INDEX IF NOT EXISTS ix_missoes_materia_ano ON missoes(materia_id, ano, ativa, ordem);
CREATE INDEX IF NOT EXISTS ix_perguntas_missao ON perguntas(missao_id, ordem);
CREATE INDEX IF NOT EXISTS ix_tentativas_crianca ON tentativas_missao(crianca_id);
CREATE INDEX IF NOT EXISTS ix_respostas_tentativa ON respostas(tentativa_id);

--------------------------------------------------
-- ROW LEVEL SECURITY — políticas
--------------------------------------------------
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE missoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tentativas_missao ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;

-- 1) materias: qualquer usuário logado lê. Nenhum escreve (só admin via service role).
CREATE POLICY "materias_le_any" ON materias FOR SELECT USING (auth.role() = 'authenticated');

-- 2) missoes: qualquer usuário logado lê.
CREATE POLICY "missoes_le_any" ON missoes FOR SELECT USING (auth.role() = 'authenticated');

-- 3) perguntas: qualquer usuário logado lê.
CREATE POLICY "perguntas_le_any" ON perguntas FOR SELECT USING (auth.role() = 'authenticated');

-- 4) tentativas_missao: a criança só lê/escreve os PRÓPRIOS registros.
CREATE POLICY "tentativas_le_proprias" ON tentativas_missao
  FOR SELECT USING (crianca_id = auth.uid());
CREATE POLICY "tentativas_ins_proprias" ON tentativas_missao
  FOR INSERT WITH CHECK (crianca_id = auth.uid());
CREATE POLICY "tentativas_upd_proprias" ON tentativas_missao
  FOR UPDATE USING (crianca_id = auth.uid());

-- 5) respostas: a criança só lê/escreve as PRÓPRIAS respostas.
CREATE POLICY "respostas_le_proprias" ON respostas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tentativas_missao t
      WHERE t.id = tentativa_id
        AND t.crianca_id = auth.uid()
    )
  );
CREATE POLICY "respostas_ins_proprias" ON respostas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tentativas_missao t
      WHERE t.id = tentativa_id
        AND t.crianca_id = auth.uid()
    )
  );
CREATE POLICY "respostas_upd_proprias" ON respostas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tentativas_missao t
      WHERE t.id = tentativa_id
        AND t.crianca_id = auth.uid()
    )
  );

-- NOTA: as políticas acima permitem que o app insira/atualize os registros
-- da própria criança. Aplicação pega o id do auth.users via session do Supabase.
-- O "service role" (admin) ignora RLS para os fins de seed e admin.

--------------------------------------------------
-- VIEW: desempenho_por_missao (para Fase 6 — modo Reforço)
--------------------------------------------------
CREATE OR REPLACE VIEW desempenho_por_missao AS
SELECT
  t.crianca_id,
  t.missao_id,
  m.titulo    AS titulo_missao,
  m.ano       AS ano,
  m.materia_id,
  COUNT(r.id) AS total_perguntas,
  SUM(CASE WHEN r.correta THEN 1 ELSE 0 END) AS acertos,
  CASE WHEN COUNT(r.id) > 0 THEN SUM(CASE WHEN r.correta THEN 1 ELSE 0 END)::numeric / COUNT(r.id) ELSE NULL END AS taxa_acerto,
  COUNT(CASE WHEN NOT r.correta THEN 1 END)  AS erros
FROM tentativas_missao t
JOIN missoes m ON m.id = t.missao_id
LEFT JOIN respostas r ON r.tentativa_id = t.id
WHERE t.concluida_em IS NOT NULL
  AND t.crianca_id = auth.uid()          -- opcional: view filtrada por criança logada (se quiser)
GROUP BY t.crianca_id, t.missao_id, m.titulo, m.ano, m.materia_id;

-- Se a view for usada pelo backend para análise entre crianças, remova a linha
-- "AND t.crianca_id = auth.uid()" e use RLS adequado. Aqui mantive a versão
-- já filtrada para exemplo de uso predito no modo reforço.

--------------------------------------------------
-- SEED — 5 matérias
--------------------------------------------------
INSERT INTO materias (id, nome, icone, cor) VALUES
  ('portugues', 'Português', '🔤', '#4c1d95'),
  ('matematica', 'Matemática', '🔢', '#7a5600'),
  ('ciencias', 'Ciências', '🔬', '#0369a1'),
  ('historia', 'História', '📜', '#7f1d1d'),
  ('geografia', 'Geografia', '🌍', '#2e7d32')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED — 2º ANO DE PORTUGUÊS (3 missões × 6 perguntas)
-- ============================================================

-- Missão 1: Vocales e sílabas (BNCC EF02LP01 / EF02LP02)
-- "Identificar os fonemas vocálicos e as sílabas da palavra."
INSERT INTO missoes (materia_id, ano, titulo, descricao, ordem, dificuldade)
VALUES
  ('portugues', 2, 'Vogais e sílabas: conheço bem', 'Vamos brincar com vozes e divisão das palavras em partes.', 1, 1);

-- Perguntas
INSERT INTO perguntas (missao_id, tipo, enunciado, dados, dica, explicacao, ordem)
SELECT id,
  CASE WHEN p.num = 1 THEN 'multipla_escolha'
       WHEN p.num = 2 THEN 'verdadeiro_falso'
       WHEN p.num = 3 THEN 'completar'
       WHEN p.num = 4 THEN 'arrastar_soltar'
       WHEN p.num = 5 THEN 'contar_imagens'
       WHEN p.num = 6 THEN 'multipla_escolha'
  END,
  CASE p.num
    WHEN 1 THEN 'Qual é a vogal que aparece no nome "Bia"?'
    WHEN 2 THEN 'A palavra "joia" tem 2 sílabas: jo-ia. Verdadeiro ou falso?'
    WHEN 3 THEN 'Complete: "A _____ do cachorro é fofa." (dica: começa com m)'
    WHEN 4 THEN 'Ordene as sílabas para formar a palavra "casa": ca - sa'
    WHEN 5 THEN 'Quantas vogais aparece na palavra "azeite"?'
    WHEN 6 THEN 'Qual palavra tem a vogal "i" no início?'
  END,
  CASE p.num
    WHEN 1 THEN '{"alternativas":[{"texto":"A","correta":true},{"texto":"E","correta":false},{"texto":"O","correta":false},{"texto":"U","correta":false}]}'::jsonb
    WHEN 2 THEN '{"correta":true,"respostaCorretaTexto":"Sim, jo-ia tem duas sílabas."}'::jsonb
    WHEN 3 THEN '{"opcoes":[{"texto":"mãe"},{"texto":"pai"},{"texto":"pato"}],"correta":"mãe","respostaCorretaTexto":"A mãe do cachorro é fofa."}'::jsonb
    WHEN 4 THEN '{"modo":"ordenar","itens":[{"id":"ca","texto":"ca"},{"id":"sa","texto":"sa"}],"ordemEsperada":["ca","sa"],"respostaCorretaTexto":"ca + sa = casa"}'::jsonb
    WHEN 5 THEN '{"opcoes":[3,4,5,6],"correta":4,"respostaCorretaTexto":"A palavra doce tem 4 vogais (a, e, i, e)."}'::jsonb
    WHEN 6 THEN '{"alternativas":[{"texto":"iguana","correta":true},{"texto":"casa","correta":false},{"texto":"bola","correta":false},{"texto":"rato","correta":false}]}'::jsonb
  END,
  CASE p.num
    WHEN 1 THEN 'Lembre-se: as vogais são A, E, I, O, U.'
    WHEN 2 THEN 'Divida a palavra em partes: jo - ia.'
    WHEN 3 THEN 'Pense em quem cuida do cachorro em casa.'
    WHEN 4 THEN 'Primeiro vem o começo da palavra e depois o resto.'
    WHEN 5 THEN 'Conte as vogais: a - z - e - i - t - e.'
    WHEN 6 THEN 'Olhe a primeira letra de cada palavra.'
  END,
  CASE p.num
    WHEN 1 THEN 'A vogal A aparece no nome Bia.'
    WHEN 2 THEN 'Joia tem duas sílabas: jo (1) e ia (2).'
    WHEN 3 THEN 'A palavra "mãe" começa com M.'
    WHEN 4 THEN 'O começo da palavra casa é "ca" e o final é "sa".'
    WHEN 5 THEN 'Na palavra "azeite" há 4 vogais: a, e, i, e.'
    WHEN 6 THEN 'A palavra "iguana" começa com a vogal I.'
  END,
  p.num
FROM missoes,
     (SELECT ROW_NUMBER() OVER () AS num FROM generate_series(1,6)) p
WHERE missoes.titulo = 'Vogais e sílabas: conheço bem'
ON CONFLICT DO NOTHING;

-- Missão 2: Palavras com nh, lh, ch, rr (BNCC EF02LP09)
INSERT INTO missoes (materia_id, ano, titulo, descricao, ordem, dificuldade)
VALUES
  ('portugues', 2, 'Brincando com nh, lh, ch, rr', 'Vamos aprender sons especiais das palavras que às vezes confundem.', 2, 2);

INSERT INTO perguntas (missao_id, tipo, enunciado, dados, dica, explicacao, ordem)
SELECT id,
  CASE WHEN p.num = 1 THEN 'verdadeiro_falso'
       WHEN p.num = 2 THEN 'multipla_escolha'
       WHEN p.num = 3 THEN 'completar'
       WHEN p.num = 4 THEN 'arrastar_soltar'
       WHEN p.num = 5 THEN 'contar_imagens'
       WHEN p.num = 6 THEN 'verdadeiro_falso'
  END,
  CASE p.num
    WHEN 1 THEN 'A palavra "menino" tem o som de NH no meio. Verdadeiro ou falso?'
    WHEN 2 THEN 'Qual palavra tem o som de CH?'
    WHEN 3 THEN 'Complete: "O avião _____ no céu." (soa como "voa")'
    WHEN 4 THEN 'Ordene as sílabas para formar a palavra "aranha": a - ran - ha'
    WHEN 5 THEN 'Quantas palavras da lista têm "RR": carro, casa, rato, terra?'
    WHEN 6 THEN 'A palavra "rato" tem o som de "rr". Verdadeiro ou falso?'
  END,
  CASE p.num
    WHEN 1 THEN '{"correta":true,"respostaCorretaTexto":"Sim, menino tem NH no meio."}'::jsonb
    WHEN 2 THEN '{"alternativas":[{"texto":"chuva","correta":true},{"texto":"lua","correta":false},{"texto":"rato","correta":false},{"texto":"bola","correta":false}]}'::jsonb
    WHEN 3 THEN '{"opcoes":[{"texto":"voa"},{"texto":"pisa"},{"texto":"corre"}],"correta":"voa","respostaCorretaTexto":"O avião voa no céu."}'::jsonb
    WHEN 4 THEN '{"modo":"ordenar","itens":[{"id":"a","texto":"a"},{"id":"ran","texto":"ran"},{"id":"ha","texto":"ha"}],"ordemEsperada":["a","ran","ha"],"respostaCorretaTexto":"a + ran + ha = aranha"}'::jsonb
    WHEN 5 THEN '{"opcoes":[1,2,3,4],"correta":2,"respostaCorretaTexto":"Carro e terra têm RR."}'::jsonb
    WHEN 6 THEN '{"correta":true,"respostaCorretaTexto":"Sim, rato tem RR no início."}'::jsonb
  END,
  CASE p.num
    WHEN 1 THEN 'Fale a palavra devagar: me-ni-no. O NH está no meio.'
    WHEN 2 THEN 'O CH faz som de "nho" — pense em chuva, chave, chocalho.'
    WHEN 3 THEN 'O avião vai para o céu mais alto.'
    WHEN 4 THEN 'A palavra aranha começa com A e termina com HA.'
    WHEN 5 THEN 'Carro e terra têm RR; casa e rato têm R só no início.'
    WHEN 6 THEN 'Rato começa com dois Rs. Diga "r-r-rato" devagar.'
  END,
  CASE p.num
    WHEN 1 THEN 'NH aparece em menino, rainha, ninho…'
    WHEN 2 THEN 'CH está em chuva, chave, chocolate…'
    WHEN 3 THEN 'O verbo voar serve: o avião voa no céu.'
    WHEN 4 THEN 'As sílabas de aranha são a - ran - ha.'
    WHEN 5 THEN 'Duas palavras têm RR: carro e terra.'
    WHEN 6 THEN 'Rato começa com RR e faz som forte de R.'
  END,
  p.num
FROM missoes,
     (SELECT ROW_NUMBER() OVER () AS num FROM generate_series(1,6)) p
WHERE missoes.titulo = 'Brincando com nh, lh, ch, rr'
ON CONFLICT DO NOTHING;

-- Missão 3: Ler frases e entender o sentido (BNCC EF02LP17 / EF02LP18)
INSERT INTO missoes (materia_id, ano, titulo, descricao, ordem, dificuldade)
VALUES
  ('portugues', 2, 'Frases: leio e compreendo', 'Vamos ler frases simples e descobrir o que elas significam.', 3, 3);

INSERT INTO perguntas (missao_id, tipo, enunciado, dados, dica, explicacao, ordem)
SELECT id,
  CASE WHEN p.num = 1 THEN 'verdadeiro_falso'
       WHEN p.num = 2 THEN 'multipla_escolha'
       WHEN p.num = 3 THEN 'completar'
       WHEN p.num = 4 THEN 'arrastar_soltar'
       WHEN p.num = 5 THEN 'contar_imagens'
       WHEN p.num = 6 THEN 'verdadeiro_falso'
  END,
  CASE p.num
    WHEN 1 THEN 'A frase "O gato mia." fala de um barulho de gato. Verdadeiro ou falso?'
    WHEN 2 THEN 'Qual a frase que está no passado?'
    WHEN 3 THEN 'Complete: "A menina _____ no parque." (soa como "brinca")'
    WHEN 4 THEN 'Coloque em ordem: "na," "escola," "está," "Marina" -> frase'
    WHEN 5 THEN 'Quantas palavras tenham mais de 5 letras na lista: casa, bola, menina, amigo, escola?'
    WHEN 6 THEN 'A frase "Eu gosto de chocolate." diz o que a pessoa gosta. Verdadeiro ou falso?'
  END,
  CASE p.num
    WHEN 1 THEN '{"correta":true,"respostaCorretaTexto":"Sim, "mia" é o som do gato."}'::jsonb
    WHEN 2 THEN '{"alternativas":[{"texto":"Eu brinquei ontem.","correta":true},{"texto":"Eu brinco hoje.","correta":false},{"texto":"Eu vou brincar.","correta":false}],"respostaCorretaTexto":""}'::jsonb
    WHEN 3 THEN '{"opcoes":[{"texto":"brinca"},{"texto":"corre"},{"texto":"dorme"}],"correta":"brinca","respostaCorretaTexto":"A menina brinca no parque."}'::jsonb
    WHEN 4 THEN '{"modo":"ordenar","itens":[{"id":"na","texto":"na"},{"id":"escola","texto":"escola"},{"id":"está","texto":"está"},{"id":"Marina","texto":"Marina"}],"ordemEsperada":["Marina","está","na","escola"],"respostaCorretaTexto":"Marina está na escola."}'::jsonb
    WHEN 5 THEN '{"opcoes":[1,2,3,4],"correta":2,"respostaCorretaTexto":"menina e escola têm mais de 5 letras."}'::jsonb
    WHEN 6 THEN '{"correta":true,"respostaCorretaTexto":"Sim, gostar de algo mostra preferência."}'::jsonb
  END,
  CASE p.num
    WHEN 1 THEN 'O gato faz "miau" — esse barulho é "mia".'
    WHEN 2 THEN 'Palavras como "brinquei" indicam que algo aconteceu antes.'
    WHEN 3 THEN 'O parque é um lugar de brincadeira.'
    WHEN 4 THEN 'O nome Marina vem primeiro, depois o verbo e depois o lugar.'
    WHEN 5 THEN 'menina (6 letras) e escola (7) são maiores que 5.'
    WHEN 6 THEN 'Gostar de chocolate diz que você prefere chocolate.'
  END,
  CASE p.num
    WHEN 1 THEN 'Miar é o som do gato, como "miau".'
    WHEN 2 THEN 'Ontem = passado. Hoje = presente. Amanhã = futuro.'
    WHEN 3 THEN 'Brincar é comum no parque.'
    WHEN 4 THEN 'Sua frase correta é: Marina está na escola.'
    WHEN 5 THEN 'Duas palavras: menina e escola têm mais de 5 letras.'
    WHEN 6 THEN 'Gosto de = prefiro, gosto mais.'
  END,
  p.num
FROM missoes,
     (SELECT ROW_NUMBER() OVER () AS num FROM generate_series(1,6)) p
WHERE missoes.titulo = 'Frases: leio e compreendo'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED — 2º ANO DE MATEMÁTICA (3 missões × 6 perguntas)
-- ============================================================

-- Missão 1: Contagem e números até 20 (BNCC EF02MA01)
INSERT INTO missoes (materia_id, ano, titulo, descricao, ordem, dificuldade)
VALUES
  ('matematica', 2, 'Conto até 20 com calma', 'Contar objetos e reconocer os números até 20.', 1, 1);

INSERT INTO perguntas (missao_id, tipo, enunciado, dados, dica, explicacao, ordem)
SELECT id,
  CASE WHEN p.num = 1 THEN 'contar_imagens'
       WHEN p.num = 2 THEN 'multipla_escolha'
       WHEN p.num = 3 THEN 'verdadeiro_falso'
       WHEN p.num = 4 THEN 'completar'
       WHEN p.num = 5 THEN 'arrastar_soltar'
       WHEN p.num = 6 THEN 'contar_imagens'
  END,
  CASE p.num
    WHEN 1 THEN 'Quantos bolinhas você conta na imagem?'
    WHEN 2 THEN 'Qual é o número que vem depois de 12?'
    WHEN 3 THEN '15 vem depois de 14. Verdadeiro ou falso?'
    WHEN 4 THEN 'Complete: "O número 19 é par? _____ (sim/não)"'
    WHEN 5 THEN 'Ordene os números de menor para maior: 5, 8, 2, 10'
    WHEN 6 THEN 'Quantas pontas tem uma estrela?'
  END,
  CASE p.num
    WHEN 1 THEN '{"opcoes":[5,6,7,8],"correta":6,"respostaCorretaTexto":"Você contou 6 bolinhas."}'::jsonb
    WHEN 2 THEN '{"alternativas":[{"texto":"13","correta":true},{"texto":"11","correta":false},{"texto":"14","correta":false},{"texto":"15","correta":false}]}'::jsonb
    WHEN 3 THEN '{"correta":true,"respostaCorretaTexto":"Sim, 15 vem depois de 14."}'::jsonb
    WHEN 4 THEN '{"opcoes":[{"texto":"sim"},{"texto":"não"}],"correta":"não","respostaCorretaTexto":"19 é ímpar, não é par."}'::jsonb
    WHEN 5 THEN '{"modo":"ordenar","itens":[{"id":"5","texto":"5"},{"id":"8","texto":"8"},{"id":"2","texto":"2"},{"id":"10","texto":"10"}],"ordemEsperada":["2","5","8","10"],"respostaCorretaTexto":"2, 5, 8, 10"}'::jsonb
    WHEN 6 THEN '{"opcoes":[4,5,6,7],"correta":5,"respostaCorretaTexto":"Uma estrela tem 5 pontas."}'::jsonb
  END,
  CASE p.num
    WHEN 1 THEN 'Conte cada bolinha com os dedos.'
    WHEN 2 THEN 'Depois de 12 vem o sucessor: 12+1.'
    WHEN 3 THEN 'A sequência é 13, 14, 15…'
    WHEN 4 THEN 'Números pares terminam em 0,2,4,6,8.'
    WHEN 5 THEN 'O menor número vem primeiro na ordem.'
    WHEN 6 THEN 'Conte as pontas da estrela no desenho.'
  END,
  CASE p.num
    WHEN 1 THEN '6 é o total de bolinhas na imagem.'
    WHEN 2 THEN '12+1 = 13.'
    WHEN 3 THEN 'Verdade: 14, depois 15.'
    WHEN 4 THEN '19 é ímpar; não é par.'
    WHEN 5 THEN 'Ordem crescente: 2 < 5 < 8 < 10.'
    WHEN 6 THEN 'Estrela de 5 pontas: 1,2,3,4,5 = 5.'
  END,
  p.num
FROM missoes,
     (SELECT ROW_NUMBER() OVER () AS num FROM generate_series(1,6)) p
WHERE missoes.titulo = 'Conto até 20 com calma'
ON CONFLICT DO NOTHING;

-- Missão 2: Adição com soma até 20 (BNCC EF02MA05)
INSERT INTO missoes (materia_id, ano, titulo, descricao, ordem, dificuldade)
VALUES
  ('matematica', 2, 'Somar com as mãos e de cabeça', 'Resolvendo somas simples até 20.', 2, 2);

INSERT INTO perguntas (missao_id, tipo, enunciado, dados, dica, explicacao, ordem)
SELECT id,
  CASE WHEN p.num = 1 THEN 'multipla_escolha'
       WHEN p.num = 2 THEN 'contar_imagens'
       WHEN p.num = 3 THEN 'verdadeiro_falso'
       WHEN p.num = 4 THEN 'completar'
       WHEN p.num = 5 THEN 'arrastar_soltar'
       WHEN p.num = 6 THEN 'multipla_escolha'
  END,
  CASE p.num
    WHEN 1 THEN '3 + 4 = ?'
    WHEN 2 THEN 'Quantas frutas no total? 5 maçãs + 2 bananas'
    WHEN 3 THEN '8 + 5 = 13. Verdadeiro ou falso?'
    WHEN 4 THEN 'Complete: 9 + 7 = ____'
    WHEN 5 THEN 'Ordene as operações do menor resultado para o maior: 2+2, 5+5, 1+1, 3+3'
    WHEN 6 THEN 'Qual a soma que dá 10?'
  END,
  CASE p.num
    WHEN 1 THEN '{"alternativas":[{"texto":"7","correta":true},{"texto":"6","correta":false},{"texto":"8","correta":false},{"texto":"9","correta":false}]}'::jsonb
    WHEN 2 THEN '{"opcoes":[6,7,8,9],"correta":7,"respostaCorretaTexto":"5 maçãs + 2 bananas = 7 frutas."}'::jsonb
    WHEN 3 THEN '{"correta":true,"respostaCorretaTexto":"Sim: 8+5=13."}'::jsonb
    WHEN 4 THEN '{"opcoes":[{"texto":"15"},{"texto":"16"}],"correta":"16","respostaCorretaTexto":"9+7=16."}'::jsonb
    WHEN 5 THEN '{"modo":"ordenar","itens":[{"id":"2+2","texto":"2+2=4"},{"id":"5+5","texto":"5+5=10"},{"id":"1+1","texto":"1+1=2"},{"id":"3+3","texto":"3+3=6"}],"ordemEsperada":["1+1","2+2","3+3","5+5"],"respostaCorretaTexto":"1+1=2, 2+2=4, 3+3=6, 5+5=10"}'::jsonb
    WHEN 6 THEN '{"alternativas":[{"texto":"4+6","correta":true},{"texto":"5+3","correta":false},{"texto":"6+6","correta":false},{"texto":"2+5","correta":false}]}'::jsonb
  END,
  CASE p.num
    WHEN 1 THEN 'Conte do 3: 4, 5, 6, 7.'
    WHEN 2 THEN 'Some as maçãs com as bananas.'
    WHEN 3 THEN '8+2=10, mais 3 = 13.'
    WHEN 4 THEN '9+1=10, mais 6 = 16.'
    WHEN 5 THEN 'Calcule antes de ordenar.'
    WHEN 6 THEN 'Procure a opção cuja soma resulta em 10.'
  END,
  CASE p.num
    WHEN 1 THEN '3+4=7.'
    WHEN 2 THEN '5+2=7 frutas no total.'
    WHEN 3 THEN '8+5 = 13.'
    WHEN 4 THEN '9+7 = 16.'
    WHEN 5 THEN 'Ordem por resultado: 1+1=2, 2+2=4, 3+3=6, 5+5=10.'
    WHEN 6 THEN '4+6 = 10.'
  END,
  p.num
FROM missoes,
     (SELECT ROW_NUMBER() OVER () AS num FROM generate_series(1,6)) p
WHERE missoes.titulo = 'Somar com as mãos e de cabeça'
ON CONFLICT DO NOTHING;

-- Missão 3: Subtração simples (BNCC EF02MA06)
INSERT INTO missoes (materia_id, ano, titulo, descricao, ordem, dificuldade)
VALUES
  ('matematica', 2, 'Tire e veja o que sobra', 'Introdução à subtração com números pequenos.', 3, 3);

INSERT INTO perguntas (missao_id, tipo, enunciado, dados, dica, explicacao, ordem)
SELECT id,
  CASE WHEN p.num = 1 THEN 'ultipla_escolha'
       WHEN p.num = 2 THEN 'contar_imagens'
       WHEN p.num = 3 THEN 'verdadeiro_falso'
       WHEN p.num = 4 THEN 'completar'
       WHEN p.num = 5 THEN 'arrastar_soltar'
       WHEN p.num = 6 THEN 'verdadeiro_falso'
  END,
  CASE p.num
    WHEN 1 THEN '6 - 2 = ?'
    WHEN 2 THEN '7 bolinhas, tirando 3: quantas sobram?'
    WHEN 3 THEN '10 - 4 = 7. Verdadeiro ou falso?'
    WHEN 4 THEN 'Complete: 8 - 3 = ____'
    WHEN 5 THEN 'Ordene do maior resultado para o menor: 9-2, 5-1, 4-4, 7-3'
    WHEN 6 THEN '0 menos 0 dá 0. Verdadeiro ou falso?'
  END,
  CASE p.num
    WHEN 1 THEN '{"alternativas":[{"texto":"4","correta":true},{"texto":"3","correta":false},{"texto":"5","correta":false},{"texto":"2","correta":false}]}'::jsonb
    WHEN 2 THEN '{"opcoes":[3,4,5,6],"correta":4,"respostaCorretaTexto":"7 - 3 = 4 bolinhas sobram."}'::jsonb
    WHEN 3 THEN '{"correta":false,"respostaCorretaTexto":"10 - 4 = 6, não 7."}'::jsonb
    WHEN 4 THEN '{"opcoes":[{"texto":"5"},{"texto":"6"}],"correta":"5","respostaCorretaTexto":"8 - 3 = 5."}'::jsonb
    WHEN 5 THEN '{"modo":"ordenar","itens":[{"id":"9-2","texto":"9-2=7"},{"id":"5-1","texto":"5-1=4"},{"id":"4-4","texto":"4-4=0"},{"id":"7-3","texto":"7-3=4"}],"ordemEsperada":["9-2","5-1","7-3","4-4"],"respostaCorretaTexto":"Resultados: 7,4,4,0"}'::jsonb
    WHEN 6 THEN '{"correta":true,"respostaCorretaTexto":"0 - 0 = 0."}'::jsonb
  END,
  CASE p.num
    WHEN 1 THEN 'Conte do 6: 2,3,4.'
    WHEN 2 THEN 'De 7 tire 3 e conte o que sobra.'
    WHEN 3 THEN '10 - 4 = 6.'
    WHEN 4 THEN '8 - 3 = 5.'
    WHEN 5 THEN 'Calcule o resultado antes de ordenar.'
    WHEN 6 THEN '0 - 0 = 0.'
  END,
  CASE p.num
    WHEN 1 THEN '6-2 = 4.'
    WHEN 2 THEN '7-3 = 4.'
    WHEN 3 THEN 'Falso: 10-4=6.'
    WHEN 4 THEN '8-3 = 5.'
    WHEN 5 THEN '9-2=7, 5-1=4, 7-3=4, 4-4=0.'
    WHEN 6 THEN 'Verdade: 0-0=0.'
  END,
  p.num
FROM missoes,
     (SELECT ROW_NUMBER() OVER () AS num FROM generate_series(1,6)) p
WHERE missoes.titulo = 'Tire e veja o que sobra'
ON CONFLICT DO NOTHING;

-- ============================================================
-- FIM DO SEED
-- ============================================================
