// pages/admin/formularios/[id].tsx
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { prisma } from '@/lib/prisma'
import { useRouter } from 'next/router'
import { ArrowLeft, CheckCircle, XCircle, Download, Edit3, Image } from 'lucide-react'
import toast from 'react-hot-toast'

interface FormDetail {
  id: string
  churchName: string | null
  province: string | null
  district: string | null
  language: string
  status: string
  submittedAt: string | null
  answers: { questionKey: string; section: string; value: any }[]
  attachments: { id: string; fileUrl: string | null; thumbnailUrl: string | null; description: string | null }[]
}

interface Props { form: FormDetail }

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
      if (value.rangeStart || value.rangeEnd) return `${value.rangeStart ?? '?'} – ${value.rangeEnd ?? '?'}${value.notes ? ` (${value.notes})` : ''}`
    }
    if (value.type === 'multi_select') return value.selected?.join(', ') ?? '—'
    if (value.type === 'yes_no') return value.value ? `Sim${value.notes ? ` — ${value.notes}` : ''}` : 'Não'
  }
  return JSON.stringify(value)
}

export default function AdminFormDetail({ form }: Props) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const grouped = form.answers.reduce<Record<string, typeof form.answers>>((acc, a) => {
    const s = a.section ?? 'other'
    if (!acc[s]) acc[s] = []
    acc[s].push(a)
    return acc
  }, {})

  const updateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/forms/${form.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(status === 'APPROVED' ? 'Formulário aprovado ✓' : 'Formulário rejeitado')
      router.replace(router.asPath)
    } catch {
      toast.error('Erro ao actualizar estado')
    } finally {
      setUpdating(false)
    }
  }

  const statusClasses: Record<string, string> = {
    DRAFT: 'bg-earth-100 text-earth-600',
    SUBMITTED: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }

  const statusLabels: Record<string, string> = {
    DRAFT: 'Rascunho', SUBMITTED: 'Pendente', APPROVED: 'Aprovado', REJECTED: 'Rejeitado',
  }

  return (
    <>
      <Head><title>{form.churchName ?? 'Formulário'} — Admin IEVC</title></Head>
      <div className="min-h-screen bg-earth-50">
        {/* Header */}
        <header className="bg-white border-b border-earth-100 px-6 py-4 sticky top-0 z-20">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link href="/admin" className="p-2 text-earth-500 hover:text-earth-800">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl text-earth-900 truncate">
                {form.churchName ?? 'Sem nome'}
              </h1>
              <p className="text-earth-500 text-sm">
                {[form.district, form.province].filter(Boolean).join(', ') || 'Localização não especificada'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClasses[form.status]}`}>
              {statusLabels[form.status]}
            </span>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Action bar */}
          {form.status === 'SUBMITTED' && (
            <div className="card flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <p className="text-earth-700 font-semibold flex-1">
                Este formulário está à espera de revisão.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => updateStatus('REJECTED')}
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-semibold transition-colors disabled:opacity-50"
                >
                  <XCircle size={18} /> Rejeitar
                </button>
                <button
                  onClick={() => updateStatus('APPROVED')}
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 font-semibold transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={18} /> Aprovar
                </button>
              </div>
            </div>
          )}

          {/* Export buttons */}
          <div className="flex gap-3 flex-wrap">
            {[
              { fmt: 'pdf',  label: 'Exportar PDF' },
              { fmt: 'docx', label: 'Exportar Word' },
              { fmt: 'xlsx', label: 'Exportar Excel' },
            ].map(({ fmt, label }) => (
              <a
                key={fmt}
                href={`/api/forms/${form.id}/export?format=${fmt}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-earth-200 text-earth-700 hover:bg-earth-50 font-semibold text-base transition-colors"
              >
                <Download size={16} /> {label}
              </a>
            ))}
          </div>

          {/* Answers by section */}
          {Object.entries(SECTION_LABELS).map(([sectionId, sectionLabel]) => {
            const sectionAnswers = grouped[sectionId]
            if (!sectionAnswers?.length) return null
            return (
              <div key={sectionId} className="card space-y-4">
                <h2 className="font-display text-xl text-earth-800 border-b border-earth-100 pb-3">
                  {sectionLabel}
                </h2>
                <dl className="space-y-4">
                  {sectionAnswers.map(a => (
                    <div key={a.questionKey}>
                      <dt className="text-sm font-semibold text-earth-500 uppercase tracking-wide mb-1">
                        {a.questionKey.replace(/_/g, ' ')}
                      </dt>
                      <dd className="text-earth-800 text-base leading-relaxed whitespace-pre-wrap">
                        {formatValue(a.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )
          })}

          {/* Attachments */}
          {form.attachments.length > 0 && (
            <div className="card space-y-4">
              <h2 className="font-display text-xl text-earth-800 border-b border-earth-100 pb-3 flex items-center gap-2">
                <Image size={20} /> Anexos ({form.attachments.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {form.attachments.map(att => (
                  <div key={att.id} className="space-y-2">
                    {att.thumbnailUrl ? (
                      <a href={att.fileUrl ?? '#'} target="_blank" rel="noreferrer">
                        <img
                          src={att.thumbnailUrl}
                          alt={att.description ?? ''}
                          className="w-full h-32 object-cover rounded-xl border border-earth-100 hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ) : (
                      <a
                        href={att.fileUrl ?? '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full h-32 rounded-xl bg-earth-100 text-earth-500 hover:bg-earth-200 transition-colors"
                      >
                        <Download size={24} />
                      </a>
                    )}
                    {att.description && (
                      <p className="text-sm text-earth-600 leading-snug">{att.description}</p>
                    )}
                  </div>
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
      province: true,
      district: true,
      answers: { orderBy: { section: 'asc' } },
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
        })),
      },
    },
  }
}
