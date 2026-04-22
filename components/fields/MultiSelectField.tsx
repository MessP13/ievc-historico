// components/fields/MultiSelectField.tsx
import { useTranslation } from 'next-i18next'
import { Check } from 'lucide-react'
import type { SelectOption } from '@/lib/questions'

interface Props {
  options: SelectOption[]
  value?: string[]
  onChange: (v: string[]) => void
  otherValue?: string
  onOtherChange?: (v: string) => void
}

export default function MultiSelectField({
  options, value = [], onChange, otherValue = '', onOtherChange
}: Props) {
  const { t } = useTranslation('common')

  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt))
    else onChange([...value, opt])
  }

  const hasOther = options.some(o => o.value === 'other')

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const selected = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`choice-pill w-full ${selected ? 'choice-pill-selected' : 'choice-pill-unselected'}`}
          >
            <span className={`w-6 h-6 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
              selected ? 'bg-brand-600 border-brand-600' : 'border-earth-300 bg-white'
            }`}>
              {selected && <Check size={14} color="white" strokeWidth={3} />}
            </span>
            <span className="text-lg">{opt.label}</span>
          </button>
        )
      })}

      {hasOther && value.includes('other') && onOtherChange && (
        <input
          type="text"
          placeholder={t('questions.main_challenges.other_placeholder', 'Especifique...')}
          value={otherValue}
          onChange={e => onOtherChange(e.target.value)}
          className="field-input mt-2"
        />
      )}
    </div>
  )
}
