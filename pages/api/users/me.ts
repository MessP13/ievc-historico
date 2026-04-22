// pages/api/users/me.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { fullName, phone, userId } = req.body
    if (!phone) return res.status(400).json({ error: 'phone required' })

    const user = userId
      ? await prisma.user.upsert({
          where: { phone },
          update: { fullName },
          create: { id: userId, phone, fullName },
        })
      : await prisma.user.upsert({
          where: { phone },
          update: { fullName },
          create: { phone, fullName },
        })
    return res.json(user)
  }
  res.status(405).end()
}
