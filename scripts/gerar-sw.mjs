#!/usr/bin/env node
// Gera `dist/sw.js` depois do `vite build`.
//
// Por que um script e não uma dependência: os nomes dos arquivos no Vite são
// hasheados (index-Dpkl8YMR.js). Só quem olha o `dist/` sabe o que existe, e
// essa lista precisa estar dentro do service worker para o app abrir offline.
//
// A versão do cache é um hash do conteúdo de todos os arquivos: mudou uma
// pergunta em `conteudo-local.json`, muda o hash, o navegador baixa o SW novo
// e o cache antigo é jogado fora no `activate`.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(raiz, 'dist')

function listar(pasta, saida = []) {
  for (const nome of readdirSync(pasta).sort()) {
    const caminho = join(pasta, nome)
    if (statSync(caminho).isDirectory()) listar(caminho, saida)
    else saida.push(caminho)
  }
  return saida
}

let arquivos
try {
  arquivos = listar(dist)
} catch {
  console.error(`\n  ✗ Não achei ${dist}. Rode o build antes.\n`)
  process.exit(1)
}

const caminhoUrl = (absoluto) => `/${relative(dist, absoluto).split(sep).join('/')}`

// `sw.js` não se precacheia (ele é o próprio service worker) e source map não
// serve para a criança abrir o app.
const precache = arquivos
  .filter((a) => !a.endsWith('.map') && !a.endsWith(`${sep}sw.js`))
  .map(caminhoUrl)
  .sort()

if (!precache.includes('/index.html')) {
  console.error('\n  ✗ O build não gerou index.html — sem ele não há app offline.\n')
  process.exit(1)
}

const hash = createHash('sha256')
for (const url of precache) {
  hash.update(url)
  hash.update(readFileSync(join(dist, url.replace(/^\//, '').split('/').join(sep))))
}
const versao = hash.digest('hex').slice(0, 12)

const sw = `// GERADO por scripts/gerar-sw.mjs — não edite à mão.
// Versão do cache: derivada do conteúdo do build.
const VERSAO = '${versao}'
const CACHE_APP = 'kids-play-app-' + VERSAO
const CACHE_RUNTIME = 'kids-play-runtime-' + VERSAO
const RAIZ = '/index.html'
const PRECACHE = ${JSON.stringify(precache, null, 2)}

self.addEventListener('install', (evento) => {
  evento.waitUntil((async () => {
    const cache = await caches.open(CACHE_APP)
    // Tudo-ou-nada deixaria o app sem offline por causa de um único arquivo;
    // cada um entra por conta própria e as falhas aparecem no console.
    const resultados = await Promise.allSettled(
      PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' }))),
    )
    const falhas = resultados.filter((r) => r.status === 'rejected').length
    if (falhas) console.warn('[sw] ' + falhas + ' arquivo(s) não entraram no cache')
    // NÃO chama skipWaiting: a versão nova fica esperando para que a tela
    // possa avisar. Quem decide é a criança/adulto, em src/lib/pwa.js.
  })())
})

// A tela pede a troca quando a pessoa toca em "Atualizar agora".
self.addEventListener('message', (evento) => {
  if (evento.data === 'assumir-controle') self.skipWaiting()
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil((async () => {
    const nomes = await caches.keys()
    await Promise.all(
      nomes
        .filter((nome) => nome !== CACHE_APP && nome !== CACHE_RUNTIME)
        .map((nome) => caches.delete(nome)),
    )
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request
  if (pedido.method !== 'GET') return

  const url = new URL(pedido.url)
  // Outro domínio (Supabase, fontes externas) passa direto: nada de servir
  // dado autenticado velho como se fosse atual.
  if (url.origin !== self.location.origin) return

  if (pedido.mode === 'navigate') {
    evento.respondWith(responderNavegacao(pedido))
    return
  }
  evento.respondWith(responderArquivo(pedido))
})

// ignoreVary é obrigatório: o servidor manda Vary: Origin e o script
// crossorigin da página inclui Origin na requisição. O arquivo foi guardado
// por um fetch sem esse cabeçalho, então sem ignoreVary o match falha e o
// app fica sem JS justamente quando está offline.
const OPCOES_MATCH = { ignoreVary: true }

// Qualquer rota do React Router vira o mesmo index.html.
async function responderNavegacao(pedido) {
  const cache = await caches.open(CACHE_APP)
  const shell = await cache.match(RAIZ, OPCOES_MATCH)
  if (shell) return shell

  try {
    return await fetch(pedido)
  } catch {
    return new Response('Sem conexão e sem cópia local deste app.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

async function responderArquivo(pedido) {
  const cache = await caches.open(CACHE_APP)
  const salvo = await cache.match(pedido, OPCOES_MATCH)
  if (salvo) return salvo

  try {
    const resposta = await fetch(pedido)
    if (resposta.ok) {
      const runtime = await caches.open(CACHE_RUNTIME)
      runtime.put(pedido, resposta.clone())
    }
    return resposta
  } catch {
    return new Response('', { status: 504, statusText: 'Offline' })
  }
}
`

writeFileSync(join(dist, 'sw.js'), sw, 'utf8')

console.log(`\n  ✓ dist/sw.js`)
console.log(`    versão: ${versao}`)
console.log(`    arquivos no cache: ${precache.length}`)
console.log('')
