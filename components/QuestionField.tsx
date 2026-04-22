// components/QuestionField.tsx
import { useTranslation } from 'next-i18next'
import type { Question } from '@/lib/questions'
import { useFormStore, type AnswerValue, type DateFlexValue } from '@/lib/store'
import DateFlexField from './fields/DateFlexField'
import YesNoField from './fields/YesNoField'
import MultiSelectField from './fields/MultiSelectField'
import UploadField from './fields/UploadField'

interface Props {
  question: Question
}

export default function QuestionField({ question }: Props) {
  const { t } = useTranslation('common')
  const { answers, setAnswer } = useFormStore()

  const val = answers[question.key]
  const qKey = `questions.${question.key}`

  const label = t(`${qKey}.label`, { defaultValue: question.key })
  const placeholder = t(`${qKey}.placeholder`, { defaultValue: '' })

  const set = (v: AnswerValue) => setAnswer(question.key, v)

  return (
    <div className="space-y-2 animate-fade-up">
      {question.type !== 'UPLOAD' && (
        <label className="field-label">
          {label}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Example hint for timeline questions */}
      {t(`${qKey}.example`, { defaultValue: '' }) && (
        <p className="text-earth-500 text-base italic -mt-1 mb-1">
          {t(`${qKey}.example`)}
        </p>
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
              onClick={() => set(t(`${qKey}.unknown_option`))}
              className="text-base text-earth-500 underline mb-2 block"
            >
              → {t(`${qKey}.unknown_option`)}
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

      {question.type === 'UPLOAD' && (
        <div>
          <label className="field-label">{label}</label>
          <UploadField />
        </div>
      )}
    </div>
  )
}
