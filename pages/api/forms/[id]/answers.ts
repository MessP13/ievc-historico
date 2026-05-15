// pages/api/forms/[id]/answers.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getFormMetadataFromAnswers, getQuestionSection } from '@/lib/questionSections'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const formId = req.query.id as string

  if (req.method === 'PUT') {
    const { answers } = req.body as { answers: Record<string, unknown> }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'answers required' })
    }

    const metadata = getFormMetadataFromAnswers(answers)

    // Upsert each answer
    const ops = Object.entries(answers).map(([questionKey, value]) =>
      prisma.answer.upsert({
        where: { formId_questionKey: { formId, questionKey } },
        update: { value: value as any },
        create: {
          formId,
          questionKey,
          section: getQuestionSection(questionKey),
          value: value as any,
        },
      })
    )

    // Update form timestamp
    await prisma.$transaction([
      ...ops,
      prisma.form.update({
        where: { id: formId },
        data: {
          provinceId: metadata.provinceId,
          districtId: metadata.districtId,
          churchName: metadata.churchName,
          language: metadata.language,
          updatedAt: new Date(),
        },
      }),
    ])

    if (Array.isArray(answers.pastor_list)) {
      const pastors = answers.pastor_list
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

    if (metadata.fullName || metadata.phone) {
      const form = await prisma.form.findUnique({ where: { id: formId }, select: { userId: true } })
      if (form) {
        await prisma.user.update({
          where: { id: form.userId },
          data: {
            ...(metadata.fullName ? { fullName: metadata.fullName } : {}),
            ...(metadata.phone ? { phone: metadata.phone } : {}),
          },
        }).catch(() => undefined)
      }
    }

    return res.json({ ok: true, savedAt: new Date().toISOString() })
  }

  if (req.method === 'GET') {
    const answers = await prisma.answer.findMany({ where: { formId } })
    return res.json(answers)
  }

  res.status(405).end()
}
