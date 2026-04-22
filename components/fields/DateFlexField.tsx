// components/fields/DateFlexField.tsx
import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import type { DateFlexValue } from '@/lib/store'

interface Props {
  value?: DateFlexValue | null
  onChange: (v: DateFlexValue) => void
  questionKey?: string
}

type Mode = 'exact' | 'range' | 'unknown'

export default function DateFlexField({ value, onChange, questionKey }: Props) {
  const { t } = useTranslation('common')

  const detectMode = (): Mode => {
    if (!value) return 'exact'
    if (value.uncertain) return 'unknown'
    if (value.rangeStart || value.rangeEnd) return 'range'
    return 'exact'
  }

  const [mode, setMode] = useState<Mode>(detectMode)

  const currentYear = new Date().getFullYear()

  const update = (patch: Partial<DateFlexValue>) => {
    onChange({ type: 'date_flex', ...value, ...patch })
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    if (m === 'unknown') update({ uncertain: true, exact: null, rangeStart: null, rangeEnd: null })
    if (m === 'exact') update({ uncertain: false, rangeStart: null, rangeEnd: null })
    if (m === 'range') update({ uncertain: false, exact: null })
  }

  const validateYear = (y: number) => y >= 1900 && y <= currentYear

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex flex-col sm:flex-row gap-2">
        {(['exact', 'range', 'unknown'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`choice-pill flex-1 justify-center text-base ${
              mode === m ? 'choice-pill-selected' : 'choice-pill-unselected'
            }`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
              mode === m ? 'border-brand-600 bg-brand-600' : 'border-earth-300'
            }`} />
            <span>
              {m === 'exact' && t('date_flex.know_exact')}
              {m === 'range' && t('date_flex.know_approximate')}
              {m === 'unknown' && t('date_flex.dont_know')}
            </span>
          </button>
        ))}
      </div>

      {/* Exact year */}
      {mode === 'exact' && (
        <input
          type="number"
          inputMode="numeric"
          min={1900}
          max={currentYear}
          placeholder={t('date_flex.year_placeholder')}
          value={value?.exact ?? ''}
          onChange={(e) => {
            const n = parseInt(e.target.value)
            if (!e.target.value) update({ exact: null })
            else if (validateYear(n)) update({ exact: n })
          }}
          className="field-input"
        />
      )}

      {/* Range */}
      {mode === 'range' && (
        <div className="flex gap-3 items-center">
          <input
            type="number"
            inputMode="numeric"
            min={1900}
            max={currentYear}
            placeholder={t('date_flex.from_placeholder')}
            value={value?.rangeStart ?? ''}
            onChange={(e) => {
              const n = parseInt(e.target.value)
              if (!e.target.value) update({ rangeStart: null })
              else if (validateYear(n)) update({ rangeStart: n })
            }}
            className="field-input"
          />
          <span className="text-earth-400 text-xl flex-shrink-0">—</span>
          <input
            type="number"
            inputMode="numeric"
            min={1900}
            max={currentYear}
            placeholder={t('date_flex.to_placeholder')}
            value={value?.rangeEnd ?? ''}
            onChange={(e) => {
              const n = parseInt(e.target.value)
              if (!e.target.value) update({ rangeEnd: null })
              else if (validateYear(n)) update({ rangeEnd: n })
            }}
            className="field-input"
          />
        </div>
      )}

      {/* Notes always visible for context */}
      {mode !== 'unknown' && (
        <input
          type="text"
          placeholder={t('date_flex.notes_placeholder')}
          value={value?.notes ?? ''}
          onChange={(e) => update({ notes: e.target.value })}
          className="field-input text-base text-earth-600"
        />
      )}

      {mode === 'unknown' && (
        <p className="text-earth-500 text-base italic px-1">
          {t('date_flex.notes_placeholder')}
        </p>
      )}
    </div>
  )
}
