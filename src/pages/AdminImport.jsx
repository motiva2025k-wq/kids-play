import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { isAdmin } from '../lib/admin.js'
import { useToast } from '../contexts/ToastContext.jsx'

export default function AdminImport() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { addToast } = useToast()
  const [jsonText, setJsonText] = useState('')
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState([])
  const [preview, setPreview] = useState(null)
  const [importando, setImportando] = useState(false)

  if (!isAdmin(usuario)) {
    return (
      <Layout>
        <Card className="p-6 text-center">
          <p className="text-lg">Acesso negado</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>Voltar</Button>
        </Card>
      </Layout>
    )
  }

  function normalizarTexto(texto) {
    return texto?.toLowerCase().replace(/\s+/g, ' ').trim()
  }

  async function validar() {
    setErrors([])
    let data
    try {
      data = JSON.parse(jsonText)
    } catch (e) {
      setErrors(['JSON inválido: ' + e.message])
      return
    }

    const novosErros = []
    if (!data.lote_id) novosErros.push('lote_id obrigatório')
    if (!data.ano || data.ano < 2 || data.ano > 4) novosErros.push('ano deve ser entre 2 e 4')
    if (!data.materia) novosErros.push('materia obrigatória')
    if (!data.missoes || !Array.isArray(data.missoes)) novosErros.push('missoes deve ser array')
    else {
      if (data.missoes.length < 1) novosErros.push('pelo menos 1 missão')
      data.missoes.forEach((missao, mi) => {
        if (!missao.titulo) novosErros.push(`missao ${mi+1}: titulo obrigatório`)
        if (!missao.perguntas || !Array.isArray(missao.perguntas)) {
          novosErros.push(`missao ${mi+1}: perguntas deve ser array`)
        } else {
          if (missao.perguntas.length < 5 || missao.perguntas.length > 8) {
            novosErros.push(`missao ${mi+1}: deve ter 5 a 8 perguntas`)
          }
          missao.perguntas.forEach((p, pi) => {
            if (!['multipla_escolha', 'verdadeiro_falso', 'completar', 'arrastar_soltar', 'contar_imagens'].includes(p.tipo)) {
              novosErros.push(`missao ${mi+1} perg ${pi+1}: tipo inválido`)
            }
            if (!p.enunciado || p.enunciado.length > 160) novosErros.push(`missao ${mi+1} perg ${pi+1}: enunciado inválido (max 160)`)
            if (p.dica && p.dica.length > 140) novosErros.push(`missao ${mi+1} perg ${pi+1}: dica muito longa`)
            if (p.explicacao && p.explicacao.length > 140) novosErros.push(`missao ${mi+1} perg ${pi+1}: explicacao muito longa`)
            if (!p.dados) novosErros.push(`missao ${mi+1} perg ${pi+1}: dados obrigatórios`)
            else {
              if (p.tipo === 'multipla_escolha') {
                if (!p.dados.alternativas || !Array.isArray(p.dados.alternativas)) novosErros.push(`missao ${mi+1} perg ${pi+1}: alternativas obrigatórias`)
                else {
                  if (p.dados.alternativas.length < 3 || p.dados.alternativas.length > 4) novosErros.push(`missao ${mi+1} perg ${pi+1}: 3-4 alternativas`)
                  const corretas = p.dados.alternativas.filter(a => a.correta).length
                  if (corretas !== 1) novosErros.push(`missao ${mi+1} perg ${pi+1}: exatamente 1 correta`)
                }
              }
            }
          })
        }
      })
    }

    setErrors(novosErros)
    if (novosErros.length === 0) {
      setPreview(data)
      addToast({ message: 'Validação OK' })
    }
  }

  async function importar() {
    if (!preview) return
    setImportando(true)
    try {
      // Implementação simplificada - registra lote
      const { error } = await supabase.from('lotes_importacao').upsert({
        lote_id: preview.lote_id,
        ano: preview.ano,
        materia: preview.materia,
        qtd_perguntas: preview.missoes.reduce((acc, m) => acc + (m.perguntas?.length || 0), 0),
        observacoes: 'Importado via admin'
      })
      if (error) throw error
      addToast({ message: 'Lote registrado como rascunho' })
      navigate('/admin/revisar')
    } catch (e) {
      addToast({ message: e.message })
    } finally {
      setImportando(false)
    }
  }

  async function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    const text = await f.text()
    setJsonText(text)
    setFile(f)
  }

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="secundario" onClick={() => navigate(-1)}>← Voltar</Button>
        <h1 className="text-2xl font-bold">Importar Lote</h1>
        <div className="w-20" />
      </div>

      <Card className="p-6 mb-4">
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">Arquivo JSON</label>
            <input type="file" accept=".json" onChange={handleFile} className="block" />
          </div>
          <div>
            <label className="block font-semibold mb-2">Ou cole JSON</label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full h-48 p-3 border-2 border-roxo-claro rounded-xl font-mono text-sm"
              placeholder='{"lote_id": "mat-2ano-001", "ano": 2, "materia": "Matemática", "missoes": [...]}'
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={validar}>Validar</Button>
            {preview && <Button variant="secundario" onClick={importar} disabled={importando}>Importar como RASCUNHO</Button>}
          </div>
        </div>
      </Card>

      {errors.length > 0 && (
        <Card className="p-6 mb-4 border-vermelho-escuro">
          <h2 className="font-bold mb-2 text-vermelho-escuro">Erros de validação</h2>
          <ul className="list-disc ml-6 space-y-1">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </Card>
      )}

      {preview && (
        <Card className="p-6">
          <h2 className="font-bold mb-2">Pré-visualização</h2>
          <p className="mb-4">Lote: {preview.lote_id} | Ano: {preview.ano} | Matéria: {preview.materia}</p>
          {preview.missoes.map((m, mi) => (
            <div key={mi} className="mb-4 p-3 border-2 border-roxo-claro rounded-xl">
              <p className="font-semibold">{m.titulo}</p>
              <p className="text-sm opacity-80">{m.perguntas?.length} perguntas</p>
            </div>
          ))}
        </Card>
      )}
    </Layout>
  )
}
