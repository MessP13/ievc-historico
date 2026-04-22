// pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const id = req.query.id as string
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json(user)
}
