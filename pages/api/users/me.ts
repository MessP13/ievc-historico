// pages/api/users/me.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { fullName, phone, userId } = req.body
    if (!userId) return res.status(400).json({ error: 'userId required' })

    const user = await prisma.user.upsert({
      where: { phone },
      update: { fullName },
      create: { id: userId, phone, fullName },
    })
    return res.json(user)
  }
  res.status(405).end()
}
