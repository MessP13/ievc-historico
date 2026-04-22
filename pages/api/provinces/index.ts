// pages/api/provinces/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const provinces = await prisma.province.findMany({ orderBy: { name: 'asc' } })
  res.json(provinces)
}
