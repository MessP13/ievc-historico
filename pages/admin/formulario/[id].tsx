// pages/admin/formulario/[id].tsx
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { prisma } from '@/lib/prisma'
import { CheckCircle, XCircle, Download, ArrowLeft, Image, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'

interface Props {
  form: {
    id: string
    churchName: string | null
    province: string | null
    district: string | null
    language: string
    status: string
    submittedAt: string | null
    answers: { questionKey: string; section: string; value: any }[]
    attachments: { id: string; fileUrl: string | null; thumbnailUrl: string | null; description: string | null; mimeType: string | null }[]
  }
}

const SECTION_ORDER = [
  'identification', 'local_church', 'missionary_memory', 'development',
  'structure', 'leadership', 'testimonies', 'materials', 'timeline', 'final_notes'
]

const SECTION_LABELS: Record<string, string> = {
  identification: '1. Identificação',
  local_church: '2. Igreja Local',
  missionary_memory: '3. Memória Missionária',
  development: '4. Desenvolvimento',
  structure: '5. Estrutura IEVC',
  leadership: '6. Liderança',
  testimonies: '7. Testemunhos',
  materials: '8. Materiais',
  timeline: '9. Cronologia',
  final_notes: '10. Observações Finais',
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value || '—'
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') {
    if (value.type === 'date_flex') {
      if (value.uncertain) return `Incerto${value.notes ? ` — ${value.notes}` : ''}`
      if (value.exact) return `${value.exact}${value.notes ? ` (${value.notes})` : ''}`
      if (value.rangeStart || value.rangeEnd) return `Entre ${value.rangeStart ?? '?'} e ${value.rangeEnd ?? '?'}${value.notes ? ` — ${value.notes}` : ''}`
    }
    if (value.type === 'multi_select') {
      const parts = [value.selected?.join(', ')]
      if (value.other) parts.push(value.other)
      return parts.filter(Boolean).join(' + ') || '—'
    }
    if (value.type === 'yes_no') return value.value ? 'Sim' : 'Não'
    return JSON.stringify(value)
  }
  return '—'
}

export default function AdminFormDetail({ form }: Props) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)

  const grouped = SECTION_ORDER.reduce((acc, sec) => {
    acc[sec] = form.answers.filter(a => a.section === sec)
    return acc
  }, {} as Record<string, Props['form']['answers']>)

  const updateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/forms/${form.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(status === 'APPROVED' ? 'Formulário aprovado!' : 'Formulário rejeitado.')
      router.push('/admin')
    } catch {
      toast.error('Não foi possível actualizar o estado.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <Head><title>Revisão — {form.churchName ?? 'Formulário'}</title></Head>
      <div className="min-h-screen bg-earth-50">
        {/* Header */}
        <header className="bg-white border-b border-earth-100 px-6 py-4 sticky top-0 z-20">
          <div className="max-w-4xl mx-auto flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-earth-500 hover:text-earth-800">
                <ArrowLeft size={22} />
              </Link>
              <div>
                <h1 className="font-display text-xl text-earth-900">{form.churchName ?? 'Igreja não especificada'}</h1>
                <p className="text-earth-500 text-sm">{form.district}, {form.province} · {form.language.toUpperCase()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Export buttons */}
              {(['pdf', 'docx', 'xlsx'] as const).map(fmt => (
                <a
                  key={fmt}
                  href={`/api/forms/${form.id}/export?format=${fmt}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-earth-200 text-earth-600 hover:bg-earth-50 text-sm font-medium"
                >
                  <Download size={14} /> {fmt.toUpperCase()}
                </a>
              ))}

              {/* Approve / Reject */}
              {form.status !== 'APPROVED' && (
                <button
                  onClick={() => updateStatus('APPROVED')}
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50"
                >
                  <CheckCircle size={16} /> Aprovar
                </button>
              )}
              {form.status !== 'REJECTED' && (
                <button
                  onClick={() => updateStatus('REJECTED')}
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm disabled:opacity-50"
                >
                  <XCircle size={16} /> Rejeitar
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Meta */}
          <div className="card flex flex-wrap gap-6 text-sm text-earth-600">
            <span>Estado: <strong className="text-earth-900">{form.status}</strong></span>
            <span>Submetido: <strong>{form.submittedAt ? format(new Date(form.submittedAt), 'dd MMM yyyy HH:mm', { locale: ptBR }) : '—'}</strong></span>
            <span>Respostas: <strong>{form.answers.length}</strong></span>
            <span>Anexos: <strong>{form.attachments.length}</strong></span>
          </div>

          {/* Answers by section */}
          {SECTION_ORDER.map(sec => {
            const answers = grouped[sec] ?? []
            if (answers.length === 0 && sec !== 'leadership') return null
            return (
              <div key={sec} className="card space-y-4">
                <h2 className="font-display text-xl text-earth-900 pb-3 border-b border-earth-100">
                  {SECTION_LABELS[sec]}
                </h2>
                {answers.map(a => (
                  <div key={a.questionKey}>
                    <p className="text-xs font-semibold text-earth-400 uppercase tracking-wide mb-1">
                      {a.questionKey.replace(/_/g, ' ')}
                    </p>
                    <p className="text-earth-800 text-base leading-relaxed whitespace-pre-wrap">
                      {formatValue(a.value)}
                    </p>
                  </div>
                ))}
              </div>
            )
          })}

          {/* Attachments */}
          {form.attachments.length > 0 && (
            <div className="card space-y-4">
              <h2 className="font-display text-xl text-earth-900 pb-3 border-b border-earth-100">
                Fotos e Documentos ({form.attachments.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {form.attachments.map(att => (
                  <a
                    key={att.id}
                    href={att.fileUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl overflow-hidden border border-earth-100 hover:border-brand-300 transition-colors"
                  >
                    {att.thumbnailUrl || att.mimeType?.startsWith('image/') ? (
                      <img
                        src={att.thumbnailUrl ?? att.fileUrl ?? ''}
                        alt={att.description ?? ''}
                        className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-32 bg-earth-100 flex items-center justify-center">
                        <FileText size={32} className="text-earth-400" />
                      </div>
                    )}
                    {att.description && (
                      <p className="p-2 text-xs text-earth-600 truncate">{att.description}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
  const id = params?.id as string

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      province: { select: { name: true } },
      district: { select: { name: true } },
      answers: { orderBy: { createdAt: 'asc' } },
      attachments: true,
    },
  })

  if (!form) return { notFound: true }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'pt', ['common'])),
      form: {
        id: form.id,
        churchName: form.churchName,
        province: form.province?.name ?? null,
        district: form.district?.name ?? null,
        language: form.language,
        status: form.status,
        submittedAt: form.submittedAt?.toISOString() ?? null,
        answers: form.answers.map(a => ({
          questionKey: a.questionKey,
          section: a.section,
          value: a.value,
        })),
        attachments: form.attachments.map(a => ({
          id: a.id,
          fileUrl: a.fileUrl,
          thumbnailUrl: a.thumbnailUrl,
          description: a.description,
          mimeType: a.mimeType,
        })),
      },
    },
  }
}
