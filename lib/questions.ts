// lib/questions.ts
// Central definition of all form questions, types, and sections

export type QuestionType =
  | 'TEXT'
  | 'TEXT_LONG'
  | 'NUMBER'
  | 'PHONE'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'YES_NO'
  | 'DATE_FLEX'
  | 'PASTOR_LIST'
  | 'UPLOAD'

export interface SelectOption {
  value: string
  label: string  // will be translated
}

export interface Question {
  key: string
  type: QuestionType
  required?: boolean
  options?: SelectOption[]   // for SELECT / MULTI_SELECT
  placeholder?: string
  maxLength?: number
}

export interface Section {
  id: string
  number: number
  questions: Question[]
}

export const SECTIONS: Section[] = [
  {
    id: 'identification',
    number: 1,
    questions: [
      { key: 'full_name',      type: 'TEXT',   required: true, maxLength: 100 },
      { key: 'age',            type: 'NUMBER',  required: false },
      { key: 'language',       type: 'SELECT',  required: true, options: [
        { value: 'pt', label: 'Português' },
        { value: 'en', label: 'English' },
        { value: 'sn', label: 'Sena' },
        { value: 'ts', label: 'Tsonga / Changana' },
        { value: 'nd', label: 'Ndau' },
        { value: 'other', label: 'Outro / Other' },
      ]},
      { key: 'church_role',    type: 'SELECT',  required: true, options: [
        { value: 'member',    label: 'Membro' },
        { value: 'deacon',    label: 'Diácono' },
        { value: 'elder',     label: 'Ancião' },
        { value: 'pastor',    label: 'Pastor' },
        { value: 'missionary',label: 'Missionário' },
        { value: 'other',     label: 'Outro' },
      ]},
      { key: 'join_year',      type: 'DATE_FLEX', required: false },
      { key: 'service_years',  type: 'NUMBER',    required: false },
      { key: 'phone',          type: 'PHONE',     required: true },
    ]
  },
  {
    id: 'local_church',
    number: 2,
    questions: [
      { key: 'founding_year',       type: 'DATE_FLEX',    required: false },
      { key: 'founder_name',        type: 'TEXT',         required: false, maxLength: 200 },
      { key: 'first_leaders',       type: 'TEXT_LONG',    required: false },
      { key: 'first_worship_place', type: 'MULTI_SELECT', required: false, options: [
        { value: 'house',    label: 'Casa particular' },
        { value: 'school',   label: 'Escola' },
        { value: 'outdoor',  label: 'Ao ar livre' },
        { value: 'other',    label: 'Outro' },
      ]},
      { key: 'early_years_desc',    type: 'TEXT_LONG',    required: false },
    ]
  },
  {
    id: 'missionary_memory',
    number: 3,
    questions: [
      { key: 'missionaries_1996',       type: 'TEXT_LONG', required: false },
      { key: 'missionary_names',        type: 'TEXT',      required: false, maxLength: 300 },
      { key: 'missionary_locations',    type: 'TEXT',      required: false, maxLength: 300 },
      { key: 'missionary_impact',       type: 'TEXT_LONG', required: false },
      { key: 'missionary_stories',      type: 'TEXT_LONG', required: false },
    ]
  },
  {
    id: 'development',
    number: 4,
    questions: [
      { key: 'church_growth',      type: 'TEXT_LONG',    required: false },
      { key: 'first_congregations',type: 'TEXT',         required: false, maxLength: 300 },
      { key: 'main_challenges',    type: 'MULTI_SELECT', required: false, options: [
        { value: 'financial',    label: 'Financeiros' },
        { value: 'leadership',   label: 'Falta de liderança' },
        { value: 'community',    label: 'Resistência da comunidade' },
        { value: 'persecution',  label: 'Perseguição religiosa' },
        { value: 'infrastructure', label: 'Falta de infraestrutura' },
        { value: 'other',        label: 'Outros' },
      ]},
      { key: 'challenges_detail',  type: 'TEXT_LONG',    required: false },
      { key: 'remarkable_moments', type: 'TEXT_LONG',    required: false },
      { key: 'external_support',   type: 'YES_NO',       required: false },
      { key: 'external_support_detail', type: 'TEXT_LONG', required: false },
    ]
  },
  {
    id: 'structure',
    number: 5,
    questions: [
      { key: 'ievc_structure_year',  type: 'DATE_FLEX',  required: false },
      { key: 'vcm_to_ievc_change',   type: 'TEXT_LONG',  required: false },
      { key: 'leaders_that_period',  type: 'TEXT_LONG',  required: false },
    ]
  },
  {
    id: 'leadership',
    number: 6,
    questions: [
      { key: 'pastor_list',         type: 'PASTOR_LIST', required: false },
      { key: 'leader_formation',    type: 'TEXT_LONG',   required: false },
    ]
  },
  {
    id: 'testimonies',
    number: 7,
    questions: [
      { key: 'personal_testimony',  type: 'TEXT_LONG', required: false },
      { key: 'community_impact',    type: 'TEXT_LONG', required: false },
      { key: 'transformation',      type: 'TEXT_LONG', required: false },
    ]
  },
  {
    id: 'materials',
    number: 8,
    questions: [
      { key: 'has_photos',       type: 'YES_NO', required: false },
      { key: 'has_documents',    type: 'YES_NO', required: false },
      { key: 'willing_to_share', type: 'YES_NO', required: false },
      { key: 'attachments',      type: 'UPLOAD', required: false },
      { key: 'referral_name',    type: 'TEXT',   required: false, maxLength: 100 },
      { key: 'referral_phone',   type: 'PHONE',  required: false },
    ]
  },
  {
    id: 'timeline',
    number: 9,
    questions: [
      { key: 'timeline_arrival',       type: 'DATE_FLEX', required: false },
      { key: 'timeline_temple',        type: 'DATE_FLEX', required: false },
      { key: 'timeline_first_leader',  type: 'DATE_FLEX', required: false },
      { key: 'timeline_expansion',     type: 'DATE_FLEX', required: false },
    ]
  },
  {
    id: 'final_notes',
    number: 10,
    questions: [
      { key: 'additional_info', type: 'TEXT_LONG', required: false },
    ]
  },
]

export const TOTAL_SECTIONS = SECTIONS.length

export function getSectionById(id: string): Section | undefined {
  return SECTIONS.find(s => s.id === id)
}

export function getSectionByNumber(n: number): Section | undefined {
  return SECTIONS.find(s => s.number === n)
}
