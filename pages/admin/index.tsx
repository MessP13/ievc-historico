// pages/admin/index.tsx
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, Download, CheckCircle, XCircle, Clock, FileText } from 'lucide-react'

interface FormSummary {
  id: string
  churchName: string | null
  province: string | null
  district: string | null
  status: string
  submittedAt: string | null
  answerCount: number
  attachmentCount: number
}

interface Props {
  forms: FormSummary[]
  stats: { total: number; submitted: number; approved: number; rejected: number; draft: number }
}

const statusConfig = {
  DRAFT:     { label: 'Rascunho',   cls: 'bg-earth-100 text-earth-600',  icon: <Clock size={14} /> },
  SUBMITTED: { label: 'Pendente',   cls: 'bg-amber-100 text-amber-700',  icon: <Clock size={14} /> },
  APPROVED:  { label: 'Aprovado',   cls: 'bg-green-100 text-green-700',  icon: <CheckCircle size={14} /> },
  REJECTED:  { label: 'Rejeitado',  cls: 'bg-red-100 text-red-700',      icon: <XCircle size={14} /> },
}

export default function AdminDashboard({ forms, stats }: Props) {
  return (
    <>
      <Head><title>Painel Admin — IEVC</title></Head>
      <div className="min-h-screen bg-earth-50">
        {/* Header */}
        <header className="bg-white border-b border-earth-100 px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="font-display text-2xl text-earth-900">Painel de Revisão</h1>
              <p className="text-earth-500 text-sm">IEVC — Levantamento Histórico</p>
            </div>
            <Link href="/" className="text-brand-600 hover:text-brand-800 text-sm font-semibold">
              ← Voltar ao site
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total, cls: 'text-earth-800' },
              { label: 'Pendentes', value: stats.submitted, cls: 'text-amber-600' },
              { label: 'Aprovados', value: stats.approved, cls: 'text-green-600' },
              { label: 'Rascunhos', value: stats.draft, cls: 'text-earth-400' },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <p className={`font-display text-4xl font-bold ${s.cls}`}>{s.value}</p>
                <p className="text-earth-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Forms table */}
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-earth-100">
              <h2 className="font-display text-xl text-earth-900">Formulários recebidos</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-earth-50 border-b border-earth-100">
                  <tr>
                    {['Igreja', 'Localização', 'Respostas', 'Data', 'Estado', 'Acções'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-sm font-semibold text-earth-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-50">
                  {forms.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-earth-400 text-lg">
                        Ainda não há formulários submetidos.
                      </td>
                    </tr>
                  )}
                  {forms.map(f => {
                    const st = statusConfig[f.status as keyof typeof statusConfig] ?? statusConfig.DRAFT
                    return (
                      <tr key={f.id} className="hover:bg-earth-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-earth-800">{f.churchName ?? 'Sem nome'}</p>
                        </td>
                        <td className="px-4 py-4 text-earth-600 text-sm">
                          {f.district && <span>{f.district}, </span>}
                          {f.province}
                        </td>
                        <td className="px-4 py-4 text-earth-600 text-sm">
                          <div className="flex items-center gap-1">
                            <FileText size={14} />
                            {f.answerCount} resp.
                            {f.attachmentCount > 0 && <span className="ml-2">📎 {f.attachmentCount}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-earth-500 text-sm">
                          {f.submittedAt
                            ? format(new Date(f.submittedAt), 'dd MMM yyyy', { locale: ptBR })
                            : '—'}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${st.cls}`}>
                            {st.icon} {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/formulario/${f.id}`}
                              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 text-sm font-semibold"
                            >
                              <Eye size={16} /> Ver
                            </Link>
                            <a
                              href={`/api/forms/${f.id}/export?format=pdf`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-earth-500 hover:text-earth-700 text-sm"
                            >
                              <Download size={14} /> PDF
                            </a>
                            <a
                              href={`/api/forms/${f.id}/export?format=xlsx`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-earth-500 hover:text-earth-700 text-sm"
                            >
                              <Download size={14} /> Excel
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const [forms, total, submitted, approved, rejected, draft] = await Promise.all([
    prisma.form.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        province: { select: { name: true } },
        district: { select: { name: true } },
        _count: { select: { answers: true, attachments: true } },
      },
    }),
    prisma.form.count(),
    prisma.form.count({ where: { status: 'SUBMITTED' } }),
    prisma.form.count({ where: { status: 'APPROVED' } }),
    prisma.form.count({ where: { status: 'REJECTED' } }),
    prisma.form.count({ where: { status: 'DRAFT' } }),
  ])

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'pt', ['common'])),
      stats: { total, submitted, approved, rejected, draft },
      forms: forms.map(f => ({
        id: f.id,
        churchName: f.churchName,
        province: f.province?.name ?? null,
        district: f.district?.name ?? null,
        status: f.status,
        submittedAt: f.submittedAt?.toISOString() ?? null,
        answerCount: f._count.answers,
        attachmentCount: f._count.attachments,
      })),
    },
  }
}
