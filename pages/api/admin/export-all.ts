// pages/api/admin/export-all.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'
import { isAdminRequest } from '@/lib/apiAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'Admin access required' })

  const forms = await prisma.form.findMany({
    where: { status: { in: ['SUBMITTED', 'APPROVED'] } },
    include: {
      province: { select: { name: true } },
      district: { select: { name: true } },
      answers: { orderBy: { questionKey: 'asc' } },
    },
    orderBy: { submittedAt: 'desc' },
  })

  const wb = new ExcelJS.Workbook()
  wb.creator = 'IEVC Sistema Histórico'
  wb.created = new Date()

  // ── Sheet 1: Resumo ──────────────────────────────────────────────────
  const wsResumo = wb.addWorksheet('Resumo')
  wsResumo.columns = [
    { header: 'ID', key: 'id', width: 38 },
    { header: 'Igreja', key: 'church', width: 30 },
    { header: 'Distrito', key: 'district', width: 20 },
    { header: 'Província', key: 'province', width: 20 },
    { header: 'Estado', key: 'status', width: 15 },
    { header: 'Submetido', key: 'submitted', width: 18 },
    { header: 'Respostas', key: 'answers', width: 12 },
  ]
  wsResumo.getRow(1).font = { bold: true }
  wsResumo.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF7EE' } }

  for (const f of forms) {
    wsResumo.addRow({
      id: f.id,
      church: f.churchName ?? '',
      district: f.district?.name ?? '',
      province: f.province?.name ?? '',
      status: f.status,
      submitted: f.submittedAt?.toLocaleDateString('pt') ?? '',
      answers: f.answers.length,
    })
  }

  // ── Sheet 2: Todas as respostas ──────────────────────────────────────
  const wsAll = wb.addWorksheet('Todas as Respostas')

  // Collect all unique question keys
  const allKeys = [...new Set(forms.flatMap(f => f.answers.map(a => a.questionKey)))]

  wsAll.columns = [
    { header: 'Igreja', key: 'church', width: 25 },
    { header: 'Distrito', key: 'district', width: 18 },
    { header: 'Província', key: 'province', width: 18 },
    ...allKeys.map(k => ({ header: k, key: k, width: 30 })),
  ]
  wsAll.getRow(1).font = { bold: true }

  for (const f of forms) {
    const answerMap = Object.fromEntries(f.answers.map(a => [a.questionKey, a.value]))
    const row: Record<string, any> = {
      church: f.churchName ?? '',
      district: f.district?.name ?? '',
      province: f.province?.name ?? '',
    }
    for (const key of allKeys) {
      const v = answerMap[key]
      row[key] = formatCell(v)
    }
    wsAll.addRow(row)
  }

  const buffer = await wb.xlsx.writeBuffer()
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="ievc_historico_completo_${new Date().toISOString().slice(0,10)}.xlsx"`)
  res.send(Buffer.from(buffer))
}

function formatCell(value: any): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') {
    if (value.type === 'date_flex') {
      if (value.uncertain) return `Incerto: ${value.notes ?? ''}`
      if (value.exact) return String(value.exact)
      if (value.rangeStart || value.rangeEnd) return `${value.rangeStart ?? '?'}-${value.rangeEnd ?? '?'}`
    }
    if (value.type === 'multi_select') return value.selected?.join(', ') ?? ''
    if (value.type === 'yes_no') return value.value ? 'Sim' : 'Não'
  }
  return JSON.stringify(value)
}
