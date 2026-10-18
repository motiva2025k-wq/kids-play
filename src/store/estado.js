// Estado do aluno do Kids_Play.
// { moedas, nivel, dias_seguidos, inventario: { [id]: quantidade },
//   equipados: { avatar, moldura_fundo, balao, cenario, titulo },
//   lista_desejos: [ids], historico_compras: [{id, preco, data}],
//   configuracoes: { loja_ativa } }
//
// Aplication state lives in memory and is persisted to localStorage.
// The store reads a fresh snapshot on every write and notifies
// subscribers, so React components always render the latest data.
// Cross-tab coordination is handled with a simple storage event
// listener; concurrent tabs are not expected to race in this app.

const STORAGE_KEY = 'kidsplay.state.v1';

function leValor(origem = 'localStorage') {
  try {
    if (origem === 'localStorage') {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    }
    return null;
  } catch (err) {
    console.warn('[KidsPlay estado] não foi possível ler o estado:', err);
    return null;
  }
}

function escreveValor(valor) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valor));
    return true;
  } catch (err) {
    console.error('[KidsPlay estado] não foi possível gravar o estado:', err);
    return false;
  }
}

const DEFAULT_STATE = {
  moedas: 0,
  nivel: 1,
  dias_seguidos: 0,
  inventario: {},
  equipados: {
    avatar: 'mascote-azul',
    moldura_fundo: 'capa-de-nuvens',
    balao: 'balao-1',
    cenario: 'retangulo-laranja',
    titulo: 'titulo-leao',
  },
  lista_desejos: [],
  historico_compras: [],
  configuracoes: { loja_ativa: true },
};

let snapshot = leValor() ?? DEFAULT_STATE;
const listeners = new Set();

function notificar() {
  for (const listener of listeners) {
    try {
      listener(snapshot);
    } catch (err) {
      console.error('[KidsPlay estado] erro ao notificar listeners:', err);
    }
  }
}

export function useKidsPlay() {
  function getSnapshot() {
    return snapshot;
  }

  function subscribe(listener) {
    listeners.add(listener);
    listener(snapshot);
    return () => listeners.delete(listener);
  }

  return { state: snapshot, subscribe };
}

export function lerEstado() {
  const valor = leValor();
  return valor ? valor : DEFAULT_STATE;
}

export function gravarEstado(novoEstado) {
  const sucesso = escreveValor(novoEstado);
  if (sucesso) {
    // NOTIFICAÇÃO SÍNCRONA: o próprio tab não recebe o evento storage.
    snapshot = novoEstado;
    notificar();
  } else {
    console.error('[KidsPlay estado] gravação falhou; estado não foi atualizado.');
  }
  return sucesso;
}

export function lerDeOutraOrigem(novoEstado) {
  if (novoEstado && typeof novoEstado === 'object') {
    gravarEstado(novoEstado);
  }
}

/**
 * Sincroniza o estado armazenado em outra origem (outra aba) e re-escreve
 * o snapshot atual do app. Serve para o event storage reabilitar a própria
 * aba com os dados mais recentes, mantendo o schema do app e não o JSON bruto.
 */
export function sincronizarDoStorage() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const valor = JSON.parse(raw);
    if (!valor || typeof valor !== 'object') return false;

    const inteiro = {
      ...DEFAULT_STATE,
      moedas: typeof valor.moedas === 'number' ? valor.moedas : DEFAULT_STATE.moedas,
      nivel: typeof valor.nivel === 'number' ? valor.nivel : DEFAULT_STATE.nivel,
      dias_seguidos: typeof valor.dias_seguidos === 'number' ? valor.dias_seguidos : DEFAULT_STATE.dias_seguidos,
      inventario: typeof valor.inventario === 'object' && valor.inventario !== null
        ? valor.inventario
        : DEFAULT_STATE.inventario,
      equipados: typeof valor.equipados === 'object' && valor.equipados !== null
        ? valor.equipados
        : DEFAULT_STATE.equipados,
      lista_desejos: Array.isArray(valor.lista_desejos) ? valor.lista_desejos : DEFAULT_STATE.lista_desejos,
      historico_compras: Array.isArray(valor.historico_compras) ? valor.historico_compras : DEFAULT_STATE.historico_compras,
      configuracoes: typeof valor.configuracoes === 'object' && valor.configuracoes !== null
        ? valor.configuracoes
        : DEFAULT_STATE.configuracoes,
    };

    gravarEstado(inteiro);
    return true;
  } catch (erro) {
    console.warn('[KidsPlay estado] não foi possível sincronizar do storage:', erro.message);
    return false;
  }
}
