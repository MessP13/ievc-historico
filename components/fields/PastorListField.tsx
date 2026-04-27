// components/fields/PastorListField.tsx
import { useTranslation } from 'next-i18next'
import { Plus, Trash2 } from 'lucide-react'
import type { PastorEntry } from '@/lib/store'

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

interface Props {
  value?: PastorEntry[]
  onChange: (v: PastorEntry[]) => void
}

export default function PastorListField({ value = [], onChange }: Props) {
  const { t } = useTranslation('common')
  const q = (k: string) => t(`questions.pastor_list.${k}`)

  const add = () => {
    onChange([...value, { id: generateId(), name: '', yearStart: undefined, yearEnd: undefined }])
  }

  const remove = (id: string) => onChange(value.filter(p => p.id !== id))

  const update = (id: string, patch: Partial<PastorEntry>) => {
    onChange(value.map(p => p.id === id ? { ...p, ...patch } : p))
  }

  return (
    <div className="space-y-4">
      {value.map((pastor, i) => (
        <div key={pastor.id} className="card space-y-3 relative">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-earth-500 uppercase tracking-wide">
              Pastor {i + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(pastor.id)}
              className="p-2 text-earth-400 hover:text-red-500 transition-colors"
              aria-label="Remover"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <input
            type="text"
            placeholder={q('name_placeholder')}
            value={pastor.name}
            onChange={e => update(pastor.id, { name: e.target.value })}
            className="field-input"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-earth-600 mb-1">{q('year_start')}</label>
              <input
                type="number"
                inputMode="numeric"
                min={1990}
                max={2026}
                placeholder="Ex: 1998"
                value={pastor.yearStart ?? ''}
                onChange={e => update(pastor.id, { yearStart: e.target.value ? parseInt(e.target.value) : undefined })}
                className="field-input"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-earth-600 mb-1">{q('year_end')}</label>
              <input
                type="number"
                inputMode="numeric"
                min={1990}
                max={2026}
                placeholder={q('year_end_present')}
                value={pastor.yearEnd ?? ''}
                onChange={e => update(pastor.id, { yearEnd: e.target.value ? parseInt(e.target.value) : undefined })}
                className="field-input"
              />
            </div>
          </div>

          <input
            type="text"
            placeholder={q('notes_placeholder')}
            value={pastor.notes ?? ''}
            onChange={e => update(pastor.id, { notes: e.target.value })}
            className="field-input text-base"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-3 justify-center w-full py-4 rounded-xl border-2 border-dashed border-brand-300 text-brand-600 hover:bg-brand-50 transition-colors text-lg font-semibold"
      >
        <Plus size={22} />
        {q('add_button')}
      </button>
    </div>
  )
}
