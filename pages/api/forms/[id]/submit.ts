// pages/api/forms/[id]/submit.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const formId = req.query.id as string
  const { answers } = req.body

  try {
    // Save final answers
    if (answers && typeof answers === 'object') {
      const ops = Object.entries(answers).map(([questionKey, value]) =>
        prisma.answer.upsert({
          where: { formId_questionKey: { formId, questionKey } },
          update: { value: value as any },
          create: {
            formId, questionKey,
            section: questionKey,
            value: value as any,
          },
        })
      )
      await prisma.$transaction(ops)
    }

    // Mark as submitted
    const form = await prisma.form.update({
      where: { id: formId },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    })

    res.json({ ok: true, form })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to submit' })
  }
}
