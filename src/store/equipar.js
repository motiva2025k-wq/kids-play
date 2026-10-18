// Equipamento do Kids_Play.
// Aplica um item no slot do perfil e atualiza estado.equipados.
// Itens únicos não são removidos, nem o inventário muda.

import { lerEstado, gravarEstado } from './estado.js';

const SLOTS = ['avatar', 'moldura_fundo', 'balao', 'cenario', 'titulo'];

export function slotDoItem(id) {
  const estado = lerEstado();
  return SLOTS.find((slot) => estado.equipados?.[slot] === id) ?? null;
}

export function equiparItem(id) {
  const estado = lerEstado();
  const item = estado.inventario?.[id];

  if (!item || item < 1) {
    return { sucesso: false, mensagem: 'Item não disponível no inventário.' };
  }

  const novo = {
    ...estado,
    inventario: { ...estado.inventario, [id]: Math.max(0, (item || 0) - 1) },
    equipados: { ...estado.equipados, [slotDoItem(id) ?? 'cenario']: id },
  };

  const gravou = gravarEstado(novo);
  if (gravou) {
    return { sucesso: true, mensagem: 'Item equipado.', estadoAtualizado: true };
  }

  return { sucesso: false, mensagem: 'Não foi possível gravar a troca.' };
}
