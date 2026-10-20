// Registro do service worker (PWA).
//
// Só em produção: no `npm run dev` o service worker atrapalharia o hot reload
// e o E2E que roda contra o dev server. O `sw.js` também só existe depois de
// `npm run build`, que agora chama `scripts/gerar-sw.mjs`.
export function registrarServiceWorker() {
  if (!import.meta.env.PROD) return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((erro) => {
      // Sem service worker o app continua funcionando online: não é motivo
      // para quebrar a tela da criança.
      console.warn('[pwa] não deu para registrar o service worker:', erro?.message)
    })
  })
}
