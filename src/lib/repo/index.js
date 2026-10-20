// Ponto ÚNICO de escolha da implementação do repositório.
// As telas importam daqui e nunca de ../supabase.js diretamente.
import { modoLocal } from '../modo.js'
import * as supabaseRepo from './supabase.js'
import * as localRepo from './local.js'

export const repo = modoLocal ? localRepo : supabaseRepo
