import { useEffect, useState } from 'react';
import { lerEstado } from './estado.js';
import { comprarItem } from './loja.js';

/** useKidsPlayReact — versão React acessível do estado do Kids_Play.
 *
 * Regras de consumo:
 *   • Cada instância recebe o estado atual via lerEstado() no useState e
 *     mantém seu próprio snapshot em memória. Assim, cada consumidor reage
 *     ao storage sem compartilhar o mesmo objeto entre telas.
 *   • O event listener de storage reescreve o snapshot do app com o estado
 *     mais recente, sempre que um novo estado aparece no storage.
 *   • Apenas um clique ativo por vez pode concluir uma compra. A transação
 *     por comprarItem revalida o estado no momento da escrita.
 */
export function useKidsPlayReact() {
  const [state, setState] = useState(() => lerEstado());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function onStorage() {
      // Sincroniza com o estado do storage e re-renderiza o snapshot atualizado.
      const atualizado = lerEstado();
      if (atualizado) {
        setState(atualizado);
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Consumidores (Painel, PainelPais) fazem const { state, purchase } = useKidsPlayReact():
  // o snapshot precisa voltar dentro da chave `state`, não espalhado — espalhar
  // deixava `state` undefined e derrubava a renderização (tela em branco).
  return {
    state,
    purchase: (id) => comprarItem(state, id),
  };
}
