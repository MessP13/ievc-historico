// components/QuestionField.tsx
import { useTranslation } from 'next-i18next'
import type { Question } from '@/lib/questions'
import { useFormStore, type AnswerValue, type DateFlexValue, type PastorEntry } from '@/lib/store'
import DateFlexField from './fields/DateFlexField'
import YesNoField from './fields/YesNoField'
import MultiSelectField from './fields/MultiSelectField'
import PastorListField from './fields/PastorListField'
import UploadField from './fields/UploadField'

// Fallback labels in Portuguese for when i18n hasn't loaded yet
const FALLBACK_LABELS: Record<string, { label: string; placeholder?: string }> = {
  full_name:             { label: 'Nome completo', placeholder: 'Ex: João Manuel da Silva' },
  age:                   { label: 'Idade (opcional)', placeholder: 'Ex: 65' },
  language:              { label: 'Língua preferida' },
  church_role:           { label: 'Função na igreja' },
  join_year:             { label: 'Ano de entrada na IEVC' },
  service_years:         { label: 'Anos de serviço', placeholder: 'Ex: 15' },
  phone:                 { label: 'Contacto / WhatsApp', placeholder: '+258 84 000 0000' },
  founding_year:         { label: 'Ano de fundação da igreja' },
  founder_name:          { label: 'Quem fundou esta igreja?' },
  first_leaders:         { label: 'Primeiros líderes locais', placeholder: 'Liste os nomes...' },
  first_worship_place:   { label: 'Local dos primeiros cultos' },
  early_years_desc:      { label: 'Como foram os primeiros anos?', placeholder: 'Conte como foi...' },
  missionaries_1996:     { label: 'O que sabe sobre os missionários de 1996?', placeholder: 'Partilhe o que sabe...' },
  missionary_names:      { label: 'Nomes de missionários', placeholder: 'Ex: Pastor João...' },
  missionary_locations:  { label: 'Onde trabalharam os missionários?' },
  missionary_impact:     { label: 'Impacto dos missionários', placeholder: 'Descreva o que mudou...' },
  missionary_stories:    { label: 'Histórias marcantes com missionários', placeholder: 'Partilhe uma história...' },
  church_growth:         { label: 'Como a igreja cresceu?', placeholder: 'Conte o processo...' },
  first_congregations:   { label: 'Primeiras congregações', placeholder: 'Nomes e locais...' },
  main_challenges:       { label: 'Principais desafios' },
  challenges_detail:     { label: 'Explique esses desafios', placeholder: 'Como foram enfrentados?' },
  remarkable_moments:    { label: 'Momentos marcantes (milagres, avivamentos...)', placeholder: 'Conte o que aconteceu...' },
  external_support:      { label: 'Houve apoio externo (Brasil, Inglaterra...)?' },
  external_support_detail: { label: 'Explique esse apoio', placeholder: 'Quem ajudou, quando e como?' },
  ievc_structure_year:   { label: 'Quando a igreja ficou estruturada como IEVC?' },
  vcm_to_ievc_change:    { label: 'O que mudou com a transição VCM → IEVC em 2010?', placeholder: 'Mudanças que sentiu...' },
  leaders_that_period:   { label: 'Líderes principais nesse período', placeholder: 'Nomes e funções...' },
  pastor_list:           { label: 'Pastores que lideraram esta igreja' },
  leader_formation:      { label: 'Como foram formados novos líderes?', placeholder: 'Descreva o processo...' },
  personal_testimony:    { label: 'A sua experiência marcante na igreja', placeholder: 'Uma história que mudou a sua vida...' },
  community_impact:      { label: 'Impacto da igreja na comunidade', placeholder: 'Exemplos concretos...' },
  transformation:        { label: 'Testemunhos de transformação', placeholder: 'Histórias de vidas transformadas...' },
  has_photos:            { label: 'Possui fotos antigas da igreja?' },
  has_documents:         { label: 'Possui documentos históricos?' },
  willing_to_share:      { label: 'Disposto a partilhar esses materiais?' },
  attachments:           { label: 'Enviar fotos ou documentos' },
  referral_name:         { label: 'Alguém que possa contribuir? Nome:', placeholder: 'Nome da pessoa' },
  referral_phone:        { label: 'Contacto dessa pessoa', placeholder: '+258 8X XXX XXXX' },
  timeline_arrival:      { label: 'Chegada da igreja a esta área', placeholder: 'Ex: 1998 ou "cerca de 2000"' },
  timeline_temple:       { label: 'Construção do templo / sede', placeholder: 'Ex: 2003' },
  timeline_first_leader: { label: 'Primeira liderança local', placeholder: 'Ex: 2001' },
  timeline_expansion:    { label: 'Expansão para outras áreas', placeholder: 'Ex: 2005-2010' },
  additional_info:       { label: 'Algo importante que não foi perguntado?', placeholder: 'Acrescente aqui...' },
}

interface Props {
  question: Question
}

export default function QuestionField({ question }: Props) {
  const { t } = useTranslation('common')
  const { answers, setAnswer } = useFormStore()

  const val = answers[question.key]
  const qKey = `questions.${question.key}`

  // Use translation if available, fallback to hardcoded PT
  const fallback = FALLBACK_LABELS[question.key]
  const rawLabel = t(`${qKey}.label`, { defaultValue: '' })
  const label = rawLabel && !rawLabel.includes('.label') ? rawLabel : (fallback?.label ?? question.key)
  const rawPlaceholder = t(`${qKey}.placeholder`, { defaultValue: '' })
  const placeholder = rawPlaceholder && !rawPlaceholder.includes('.placeholder') ? rawPlaceholder : (fallback?.placeholder ?? '')

  const set = (v: AnswerValue) => setAnswer(question.key, v)

  return (
    <div className="space-y-2 animate-fade-up">
      {question.type !== 'UPLOAD' && (
        <label className="field-label">
          {label}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {question.type === 'TEXT' && (
        <input
          type="text"
          placeholder={placeholder}
          value={(val as string) ?? ''}
          maxLength={question.maxLength}
          onChange={e => set(e.target.value)}
          className="field-input"
        />
      )}

      {question.type === 'TEXT_LONG' && (
        <>
          {question.key === 'missionaries_1996' && (
            <button
              type="button"
              onClick={() => set('Não estava presente / Não sei')}
              className="text-base text-earth-500 underline mb-2 block"
            >
              → Não estava presente / Não sei
            </button>
          )}
          <textarea
            placeholder={placeholder}
            value={(val as string) ?? ''}
            onChange={e => set(e.target.value)}
            className="field-textarea"
            rows={5}
          />
        </>
      )}

      {question.type === 'NUMBER' && (
        <input
          type="number"
          inputMode="numeric"
          placeholder={placeholder}
          value={(val as number) ?? ''}
          onChange={e => set(e.target.value ? parseInt(e.target.value) : null)}
          className="field-input"
        />
      )}

      {question.type === 'PHONE' && (
        <input
          type="tel"
          placeholder={placeholder}
          value={(val as string) ?? ''}
          onChange={e => set(e.target.value)}
          className="field-input"
        />
      )}

      {question.type === 'SELECT' && question.options && (
        <div className="space-y-2">
          {question.options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set(opt.value)}
              className={`choice-pill w-full ${val === opt.value ? 'choice-pill-selected' : 'choice-pill-unselected'}`}
            >
              <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                val === opt.value ? 'border-brand-600 bg-brand-600' : 'border-earth-300'
              }`} />
              <span className="text-lg">{opt.label}</span>
            </button>
          ))}
        </div>
      )}

      {question.type === 'MULTI_SELECT' && question.options && (
        <MultiSelectField
          options={question.options}
          value={(val as string[]) ?? []}
          onChange={v => set(v)}
          otherValue={(answers[`${question.key}_other`] as string) ?? ''}
          onOtherChange={v => setAnswer(`${question.key}_other`, v)}
        />
      )}

      {question.type === 'YES_NO' && (
        <YesNoField
          value={val === undefined ? undefined : (val as boolean | null)}
          onChange={v => set(v)}
          allowUnsure
        />
      )}

      {question.type === 'DATE_FLEX' && (
        <DateFlexField
          value={(val as DateFlexValue) ?? null}
          onChange={v => set(v)}
          questionKey={question.key}
        />
      )}

      {question.type === 'PASTOR_LIST' && (
        <PastorListField
          value={(val as PastorEntry[]) ?? []}
          onChange={v => set(v)}
        />
      )}

      {question.type === 'UPLOAD' && (
        <div>
          <label className="field-label">{label}</label>
          <UploadField />
        </div>
      )}
    </div>
  )
}
