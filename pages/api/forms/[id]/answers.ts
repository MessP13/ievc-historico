// pages/api/forms/[id]/answers.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const formId = req.query.id as string

  if (req.method === 'PUT') {
    const { answers, userId } = req.body as { answers: Record<string, unknown>; userId?: string }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'answers required' })
    }
    if (!userId) return res.status(401).json({ error: 'userId required' })

    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { userId: true, status: true },
    })
    if (!form) return res.status(404).json({ error: 'Form not found' })
    if (form.userId !== userId) return res.status(403).json({ error: 'Forbidden' })
    if (form.status !== 'DRAFT') return res.status(409).json({ error: 'Form is not editable' })

    // Upsert each answer
    const ops = Object.entries(answers).map(([questionKey, value]) =>
      prisma.answer.upsert({
        where: { formId_questionKey: { formId, questionKey } },
        update: { value: value as any },
        create: {
          formId,
          questionKey,
          section: getSection(questionKey),
          value: value as any,
        },
      })
    )

    // Update form timestamp
    await prisma.$transaction([
      ...ops,
      prisma.form.update({
        where: { id: formId },
        data: { updatedAt: new Date() },
      }),
    ])

    return res.json({ ok: true, savedAt: new Date().toISOString() })
  }

  if (req.method === 'GET') {
    const userId = req.query.userId as string | undefined
    if (!userId) return res.status(401).json({ error: 'userId required' })
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { userId: true },
    })
    if (!form) return res.status(404).json({ error: 'Form not found' })
    if (form.userId !== userId) return res.status(403).json({ error: 'Forbidden' })

    const answers = await prisma.answer.findMany({ where: { formId } })
    return res.json(answers)
  }

  res.status(405).end()
}

// Map question key to section id
function getSection(key: string): string {
  const map: Record<string, string> = {
    full_name: 'identification', age: 'identification', language: 'identification',
    church_role: 'identification', join_year: 'identification',
    service_years: 'identification', phone: 'identification',
    founding_year: 'local_church', founder_name: 'local_church',
    first_leaders: 'local_church', first_worship_place: 'local_church',
    early_years_desc: 'local_church',
    missionaries_1996: 'missionary_memory', missionary_names: 'missionary_memory',
    missionary_locations: 'missionary_memory', missionary_impact: 'missionary_memory',
    missionary_stories: 'missionary_memory',
    church_growth: 'development', first_congregations: 'development',
    main_challenges: 'development', challenges_detail: 'development',
    remarkable_moments: 'development', external_support: 'development',
    external_support_detail: 'development',
    ievc_structure_year: 'structure', vcm_to_ievc_change: 'structure',
    leaders_that_period: 'structure',
    pastor_list: 'leadership', leader_formation: 'leadership',
    personal_testimony: 'testimonies', community_impact: 'testimonies',
    transformation: 'testimonies',
    has_photos: 'materials', has_documents: 'materials', willing_to_share: 'materials',
    referral_name: 'materials', referral_phone: 'materials',
    timeline_arrival: 'timeline', timeline_temple: 'timeline',
    timeline_first_leader: 'timeline', timeline_expansion: 'timeline',
    additional_info: 'final_notes',
  }
  return map[key] ?? 'other'
}
