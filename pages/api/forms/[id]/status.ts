// pages/api/forms/[id]/status.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/apiAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return res.status(405).end()
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'Admin access required' })

  const formId = req.query.id as string
  const { status } = req.body

  if (!['APPROVED', 'REJECTED', 'SUBMITTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  const form = await prisma.form.update({
    where: { id: formId },
    data: {
      status,
      ...(status === 'APPROVED' ? { approvedAt: new Date() } : {}),
    },
  })

  res.json({ ok: true, form })
}
