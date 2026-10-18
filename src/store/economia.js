// Economia do Kids_Play.
// Referencia os ganhos do catálogo economia.ganhos, mas não decide onde
// cada fonte é acionada. As telas de missão, meta e constância chamam
// creditarMoedas com o motivo do evento.

import { gravarEstado, lerEstado } from './estado.js';

const LOCK_KEY = 'KidsPlay:compra';

let bloqueioEmAndamento = false;

export async function aguardarOuRecusar() {
  if (bloqueioEmAndamento) {
    return false;
  }
  bloqueioEmAndamento = true;
  return true;
}

export function creditarMoedas(valor) {
  if (!Number.isFinite(valor) || valor <= 0) return;

  const estado = lerEstado();

  if (estado.moedas + valor < 0) {
    return;
  }

  estado.moedas += valor;
  gravarEstado(estado);
}

export function debitarMoedas(valor) {
  if (!Number.isFinite(valor) || valor < 0) return false;

  const estado = lerEstado();

  if (estado.moedas < valor) {
    return false;
  }

  estado.moedas -= valor;
  gravarEstado(estado);
  return true;
}

export function zerarBloqueio() {
  bloqueioEmAndamento = false;
}
