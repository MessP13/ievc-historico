// pages/api/provinces/[id]/districts.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const provinceId = parseInt(req.query.id as string)
  if (isNaN(provinceId)) return res.status(400).json({ error: 'Invalid province id' })
  const districts = await prisma.district.findMany({
    where: { provinceId },
    orderBy: { name: 'asc' },
  })
  res.json(districts)
}
