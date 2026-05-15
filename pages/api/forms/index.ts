// pages/api/forms/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, clientId, provinceId, districtId, churchName, language, fullName, phone } = req.body

    const stableUserId = userId || clientId || randomUUID()
    const cleanPhone = typeof phone === 'string' && phone.trim() ? phone.trim() : null
    const cleanName = typeof fullName === 'string' && fullName.trim() ? fullName.trim() : null

    let user = await prisma.user.findUnique({ where: { id: stableUserId } })

    if (!user && cleanPhone) {
      user = await prisma.user.findUnique({ where: { phone: cleanPhone } })
    }

    if (user) {
      const phoneOwner = cleanPhone
        ? await prisma.user.findUnique({ where: { phone: cleanPhone } })
        : null
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(cleanName ? { fullName: cleanName } : {}),
          ...(cleanPhone && user.phone.startsWith('draft:') && (!phoneOwner || phoneOwner.id === user.id)
            ? { phone: cleanPhone }
            : {}),
        },
      })
    } else {
      user = await prisma.user.create({
        data: {
          id: stableUserId,
          phone: cleanPhone ?? `draft:${stableUserId}`,
          fullName: cleanName,
        },
      })
    }

    const draft = await prisma.form.findFirst({
      where: { userId: user.id, status: 'DRAFT' },
      orderBy: { updatedAt: 'desc' },
    })

    if (draft) {
      const form = await prisma.form.update({
        where: { id: draft.id },
        data: {
          provinceId: provinceId ?? draft.provinceId,
          districtId: districtId ?? draft.districtId,
          churchName: churchName ?? draft.churchName,
          language: language ?? draft.language,
        },
      })
      return res.status(200).json({ ...form, user })
    }

    const form = await prisma.form.create({
      data: {
        userId: user.id,
        provinceId: provinceId ?? null,
        districtId: districtId ?? null,
        churchName: churchName ?? null,
        language: language ?? 'pt',
      },
    })

    return res.status(201).json({ ...form, user })
  }

  res.status(405).end()
}
