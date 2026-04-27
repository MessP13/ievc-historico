// pages/api/forms/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, provinceId, districtId, churchName, language } = req.body

    if (!userId) return res.status(400).json({ error: 'userId required' })

    const form = await prisma.form.create({
      data: {
        userId,
        provinceId: provinceId ?? null,
        districtId: districtId ?? null,
        churchName: churchName ?? null,
        language: language ?? 'pt',
      },
    })

    return res.status(201).json(form)
  }

  res.status(405).end()
}
