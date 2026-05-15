// pages/api/forms/[id]/submit.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getFormMetadataFromAnswers, getQuestionSection } from '@/lib/questionSections'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const formId = req.query.id as string
  const { answers } = req.body

  try {
    const metadata = answers && typeof answers === 'object'
      ? getFormMetadataFromAnswers(answers)
      : null

    // Save final answers
    if (answers && typeof answers === 'object') {
      const ops = Object.entries(answers).map(([questionKey, value]) =>
        prisma.answer.upsert({
          where: { formId_questionKey: { formId, questionKey } },
          update: { value: value as any },
          create: {
            formId, questionKey,
            section: getQuestionSection(questionKey),
            value: value as any,
          },
        })
      )
      await prisma.$transaction(ops)

      if (Array.isArray((answers as any).pastor_list)) {
        const pastors = (answers as any).pastor_list
          .filter((item: any) => typeof item?.name === 'string' && item.name.trim())
          .map((item: any, index: number) => ({
            formId,
            name: item.name.trim(),
            yearStart: typeof item.yearStart === 'number' ? item.yearStart : null,
            yearEnd: typeof item.yearEnd === 'number' ? item.yearEnd : null,
            notes: typeof item.notes === 'string' ? item.notes : null,
            sortOrder: index,
          }))

        await prisma.$transaction([
          prisma.pastorEntry.deleteMany({ where: { formId } }),
          ...(pastors.length ? [prisma.pastorEntry.createMany({ data: pastors })] : []),
        ])
      }
    }

    // Mark as submitted
    const form = await prisma.form.update({
      where: { id: formId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        ...(metadata ? {
          provinceId: metadata.provinceId,
          districtId: metadata.districtId,
          churchName: metadata.churchName,
          language: metadata.language,
        } : {}),
      },
    })

    if (metadata?.fullName || metadata?.phone) {
      await prisma.user.update({
        where: { id: form.userId },
        data: {
          ...(metadata.fullName ? { fullName: metadata.fullName } : {}),
          ...(metadata.phone ? { phone: metadata.phone } : {}),
        },
      }).catch(() => undefined)
    }

    res.json({ ok: true, form })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to submit' })
  }
}
