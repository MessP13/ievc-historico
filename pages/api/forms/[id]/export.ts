// pages/api/forms/[id]/export.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx'
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const formId = req.query.id as string
  const format = (req.query.format as string) ?? 'pdf'

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      province: true,
      district: true,
      answers: { orderBy: { createdAt: 'asc' } },
      pastors: { orderBy: { sortOrder: 'asc' } },
      attachments: true,
    },
  })

  if (!form) return res.status(404).json({ error: 'Form not found' })

  const answers = Object.fromEntries(form.answers.map(a => [a.questionKey, a.value]))
  const name = (answers.full_name as string) ?? 'Anónimo'
  const church = form.churchName ?? 'Igreja não especificada'
  const province = form.province?.name ?? ''
  const district = form.district?.name ?? ''
  const title = `IEVC — Levantamento Histórico\n${church} — ${district}, ${province}`

  // ── PDF ─────────────────────────────────────────────────────────────────
  if (format === 'pdf') {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('IEVC — Levantamento Histórico', 15, 20)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`${church}`, 15, 30)
    doc.text(`${district}, ${province}`, 15, 36)
    doc.text(`Inquirido: ${name}`, 15, 42)
    doc.text(`Submetido: ${form.submittedAt?.toLocaleDateString('pt') ?? 'N/D'}`, 15, 48)

    let y = 58

    const sectionLabels: Record<string, string> = {
      identification: '1. Identificação', local_church: '2. Igreja Local',
      missionary_memory: '3. Memória Missionária', development: '4. Desenvolvimento',
      structure: '5. Estrutura IEVC', leadership: '6. Liderança',
      testimonies: '7. Testemunhos', materials: '8. Materiais',
      timeline: '9. Cronologia', final_notes: '10. Observações Finais',
    }

    for (const answer of form.answers) {
      const val = formatValueForExport(answer.value)
      if (!val) continue

      if (y > 265) { doc.addPage(); y = 15 }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(answer.questionKey.replace(/_/g, ' ').toUpperCase(), 15, y)
      y += 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      const lines = doc.splitTextToSize(val, 180)
      doc.text(lines, 15, y)
      y += lines.length * 6 + 4
    }

    // Pastors table
    if (form.pastors.length > 0) {
      if (y > 240) { doc.addPage(); y = 15 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('Pastores', 15, y); y += 8

      ;(doc as any).autoTable({
        startY: y,
        head: [['Nome', 'Início', 'Fim', 'Notas']],
        body: form.pastors.map(p => [p.name, p.yearStart ?? '', p.yearEnd ?? 'Hoje', p.notes ?? '']),
        margin: { left: 15, right: 15 },
      })
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="ievc_${formId}.pdf"`)
    return res.send(pdfBuffer)
  }

  // ── WORD ────────────────────────────────────────────────────────────────
  if (format === 'docx') {
    const children: any[] = [
      new Paragraph({ text: 'IEVC — Levantamento Histórico', heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: `Igreja: ${church} — ${district}, ${province}` }),
      new Paragraph({ text: `Inquirido: ${name}` }),
      new Paragraph({ text: `Data: ${form.submittedAt?.toLocaleDateString('pt') ?? 'N/D'}` }),
      new Paragraph({ text: '' }),
    ]

    for (const answer of form.answers) {
      const val = formatValueForExport(answer.value)
      if (!val) continue
      children.push(
        new Paragraph({
          text: answer.questionKey.replace(/_/g, ' '),
          heading: HeadingLevel.HEADING_3,
        }),
        new Paragraph({ text: val }),
        new Paragraph({ text: '' }),
      )
    }

    if (form.pastors.length > 0) {
      children.push(new Paragraph({ text: 'Pastores', heading: HeadingLevel.HEADING_2 }))
      const rows = [
        new TableRow({ children: ['Nome', 'Início', 'Fim', 'Notas'].map(h =>
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })
        )}),
        ...form.pastors.map(p =>
          new TableRow({ children: [p.name, String(p.yearStart ?? ''), String(p.yearEnd ?? 'Hoje'), p.notes ?? ''].map(t =>
            new TableCell({ children: [new Paragraph({ text: t })] })
          )})
        ),
      ]
      children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }))
    }

    const doc = new Document({ sections: [{ children }] })
    const buffer = await Packer.toBuffer(doc)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="ievc_${formId}.docx"`)
    return res.send(buffer)
  }

  // ── EXCEL ───────────────────────────────────────────────────────────────
  if (format === 'xlsx') {
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Respostas')

    ws.columns = [
      { header: 'Campo', key: 'key', width: 30 },
      { header: 'Resposta', key: 'value', width: 80 },
      { header: 'Secção', key: 'section', width: 20 },
    ]

    ws.getRow(1).font = { bold: true }

    for (const answer of form.answers) {
      ws.addRow({
        key: answer.questionKey,
        value: formatValueForExport(answer.value) ?? '',
        section: answer.section,
      })
    }

    // Pastors sheet
    if (form.pastors.length > 0) {
      const ws2 = wb.addWorksheet('Pastores')
      ws2.columns = [
        { header: 'Nome', key: 'name', width: 30 },
        { header: 'Ano Início', key: 'yearStart', width: 15 },
        { header: 'Ano Fim', key: 'yearEnd', width: 15 },
        { header: 'Notas', key: 'notes', width: 40 },
      ]
      ws2.getRow(1).font = { bold: true }
      form.pastors.forEach(p => ws2.addRow({ name: p.name, yearStart: p.yearStart, yearEnd: p.yearEnd, notes: p.notes }))
    }

    const buffer = await wb.xlsx.writeBuffer()
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="ievc_${formId}.xlsx"`)
    return res.send(Buffer.from(buffer))
  }

  res.status(400).json({ error: 'Unknown format. Use: pdf, docx, xlsx' })
}

function formatValueForExport(value: any): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value || null
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.join(', ')

  if (typeof value === 'object') {
    if (value.type === 'date_flex') {
      if (value.uncertain) return value.notes ? `Incerto: ${value.notes}` : 'Não sabe'
      if (value.exact) return String(value.exact)
      if (value.rangeStart || value.rangeEnd) return `${value.rangeStart ?? '?'} – ${value.rangeEnd ?? '?'}`
      return value.notes ?? null
    }
    if (value.type === 'multi_select') return value.selected?.join(', ') ?? null
    if (value.type === 'yes_no') return value.value ? 'Sim' : 'Não'
    if (value.type === 'repeatable') return value.items?.map((i: any) => i.name).join(', ') ?? null
    return JSON.stringify(value)
  }
  return null
}
