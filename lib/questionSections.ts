import { SECTIONS } from './questions'

const SECTION_BY_QUESTION = SECTIONS.reduce<Record<string, string>>((acc, section) => {
  for (const question of section.questions) {
    acc[question.key] = section.id
  }
  return acc
}, {
  province_id: 'identification',
  district_id: 'identification',
  church_name: 'identification',
  attachments: 'materials',
})

export function getQuestionSection(questionKey: string): string {
  return SECTION_BY_QUESTION[questionKey] ?? 'other'
}

export function getFormMetadataFromAnswers(answers: Record<string, unknown>) {
  const provinceId = toNumberOrNull(answers.province_id)
  const districtId = toNumberOrNull(answers.district_id)
  const churchName = toStringOrNull(answers.church_name)
  const language = toStringOrNull(answers.language) ?? 'pt'
  const fullName = toStringOrNull(answers.full_name)
  const phone = toStringOrNull(answers.phone)

  return { provinceId, districtId, churchName, language, fullName, phone }
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function toStringOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}
