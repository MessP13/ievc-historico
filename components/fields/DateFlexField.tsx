// components/fields/DateFlexField.tsx
import { useState } from 'react'
import type { DateFlexValue } from '@/lib/store'

interface Props {
  value?: DateFlexValue | null
  onChange: (v: DateFlexValue) => void
  questionKey?: string
}

type Mode = 'exact' | 'range' | 'unknown'

export default function DateFlexField({ value, onChange }: Props) {
  const detectMode = (): Mode => {
    if (!value) return 'exact'
    if (value.uncertain) return 'unknown'
    if (value.rangeStart || value.rangeEnd) return 'range'
    return 'exact'
  }

  const [mode, setMode] = useState<Mode>(detectMode)
  const currentYear = new Date().getFullYear()

  const update = (patch: Partial<DateFlexValue>) =>
    onChange({ type: 'date_flex', ...value, ...patch })

  const switchMode = (m: Mode) => {
    setMode(m)
    if (m === 'unknown') update({ uncertain: true, exact: null, rangeStart: null, rangeEnd: null })
    if (m === 'exact')   update({ uncertain: false, rangeStart: null, rangeEnd: null })
    if (m === 'range')   update({ uncertain: false, exact: null })
  }

  const MODES = [
    { key: 'exact' as Mode,   label: 'Sei o ano exacto' },
    { key: 'range' as Mode,   label: 'Sei aproximadamente' },
    { key: 'unknown' as Mode, label: 'Não sei' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => switchMode(key)}
            className={`choice-pill flex-1 justify-center text-base ${
              mode === key ? 'choice-pill-selected' : 'choice-pill-unselected'
            }`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
              mode === key ? 'border-brand-600 bg-brand-600' : 'border-earth-300'
            }`} />
            {label}
          </button>
        ))}
      </div>

      {mode === 'exact' && (
        <input
          type="number" inputMode="numeric" min={1900} max={currentYear}
          placeholder="Ex: 1998"
          value={value?.exact ?? ''}
          onChange={e => {
            const n = parseInt(e.target.value)
            if (!e.target.value) update({ exact: null })
            else if (n >= 1900 && n <= currentYear) update({ exact: n })
          }}
          className="field-input"
        />
      )}

      {mode === 'range' && (
        <div className="flex gap-3 items-center">
          <input
            type="number" inputMode="numeric" min={1900} max={currentYear}
            placeholder="De: ex. 1995"
            value={value?.rangeStart ?? ''}
            onChange={e => {
              const n = parseInt(e.target.value)
              if (!e.target.value) update({ rangeStart: null })
              else if (n >= 1900 && n <= currentYear) update({ rangeStart: n })
            }}
            className="field-input"
          />
          <span className="text-earth-400 text-xl flex-shrink-0">—</span>
          <input
            type="number" inputMode="numeric" min={1900} max={currentYear}
            placeholder="Até: ex. 2000"
            value={value?.rangeEnd ?? ''}
            onChange={e => {
              const n = parseInt(e.target.value)
              if (!e.target.value) update({ rangeEnd: null })
              else if (n >= 1900 && n <= currentYear) update({ rangeEnd: n })
            }}
            className="field-input"
          />
        </div>
      )}

      {mode !== 'unknown' && (
        <input
          type="text"
          placeholder="Notas sobre esta data (opcional)..."
          value={value?.notes ?? ''}
          onChange={e => update({ notes: e.target.value })}
          className="field-input text-base text-earth-600"
        />
      )}
    </div>
  )
}
