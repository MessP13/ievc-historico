// components/fields/YesNoField.tsx
import { Check, X, HelpCircle } from 'lucide-react'

interface Props {
  value?: boolean | null
  onChange: (v: boolean | null) => void
  allowUnsure?: boolean
}

export default function YesNoField({ value, onChange, allowUnsure = false }: Props) {
  const options = [
    { v: true,  label: 'Sim',             icon: <Check size={20} /> },
    { v: false, label: 'Não',             icon: <X size={20} /> },
    ...(allowUnsure ? [{ v: null, label: 'Não tenho certeza', icon: <HelpCircle size={20} /> }] : []),
  ]

  return (
    <div className="flex gap-3">
      {options.map(({ v, label, icon }) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`choice-pill flex-1 justify-center text-lg font-semibold ${
            value === v ? 'choice-pill-selected' : 'choice-pill-unselected'
          }`}
        >
          <span className={value === v ? 'text-brand-600' : 'text-earth-400'}>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  )
}
