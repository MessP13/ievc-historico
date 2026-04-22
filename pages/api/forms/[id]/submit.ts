// pages/api/forms/[id]/submit.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const formId = req.query.id as string
  const { answers, userId } = req.body
  if (!userId) return res.status(401).json({ error: 'userId required' })

  try {
    const formOwner = await prisma.form.findUnique({
      where: { id: formId },
      select: { userId: true, status: true },
    })
    if (!formOwner) return res.status(404).json({ error: 'Form not found' })
    if (formOwner.userId !== userId) return res.status(403).json({ error: 'Forbidden' })
    if (formOwner.status !== 'DRAFT') return res.status(409).json({ error: 'Form already submitted' })

    // Save final answers
    if (answers && typeof answers === 'object') {
      const ops = Object.entries(answers).map(([questionKey, value]) =>
        prisma.answer.upsert({
          where: { formId_questionKey: { formId, questionKey } },
          update: { value: value as any },
          create: {
            formId, questionKey,
            section: getSection(questionKey),
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
