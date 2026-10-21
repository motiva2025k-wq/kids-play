// Registro do service worker (PWA) e aviso de versão nova.
//
// Só em produção: no `npm run dev` o service worker atrapalharia o hot reload
// e o E2E que roda contra o dev server. O `sw.js` também só existe depois de
// `npm run build`, que agora chama `scripts/gerar-sw.mjs`.
//
// O service worker gerado NÃO assume sozinho: ele espera a mensagem
// 'assumir-controle'. É isso que dá tempo de avisar na tela.

const ouvintes = new Set()
let esperando = null
let aplicando = false

function avisar() {
  for (const ouvinte of ouvintes) {
    try {
      ouvinte(true)
    } catch {
      // um ouvinte quebrado não pode derrubar o aviso dos outros
    }
  }
}

/** Assina o aviso. Devolve a função para cancelar a assinatura. */
export function assinarAtualizacao(ouvinte) {
  ouvintes.add(ouvinte)
  // A versão nova pode ter chegado antes de a tela montar.
  if (esperando) ouvinte(true)
  return () => ouvintes.delete(ouvinte)
}

/** Troca para a versão que está esperando; a página recarrega em seguida. */
export function aplicarAtualizacao() {
  if (!esperando) return
  aplicando = true
  try {
    esperando.postMessage('assumir-controle')
  } catch {
    // Se o worker já sumiu (ficou redundante), recarregar ainda resolve.
    window.location.reload()
  }
}

export function registrarServiceWorker() {
  if (!import.meta.env.PROD) return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', async () => {
    try {
      const registro = await navigator.serviceWorker.register('/sw.js')

      // Já havia uma versão esperando (outra aba atualizou antes).
      if (registro.waiting && navigator.serviceWorker.controller) {
        esperando = registro.waiting
        avisar()
      }

      registro.addEventListener('updatefound', () => {
        const nova = registro.installing
        if (!nova) return
        nova.addEventListener('statechange', () => {
          // Sem controlador é a primeira instalação: não é atualização.
          if (nova.state === 'installed' && navigator.serviceWorker.controller) {
            esperando = nova
            avisar()
          }
        })
      })

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Só recarrega quando alguém pediu: a primeira instalação também
        // dispara controllerchange e não deve recarregar a página.
        if (aplicando) window.location.reload()
      })
    } catch (erro) {
      // Sem service worker o app continua funcionando online: não é motivo
      // para quebrar a tela da criança.
      console.warn('[pwa] não deu para registrar o service worker:', erro?.message)
    }
  })
}
