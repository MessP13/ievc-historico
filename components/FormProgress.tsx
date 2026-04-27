// components/FormProgress.tsx
import { SECTIONS, TOTAL_SECTIONS } from '@/lib/questions'
import { useFormStore } from '@/lib/store'

interface Props { currentSection: number }

export default function FormProgress({ currentSection }: Props) {
  const { isSaving, lastSaved } = useFormStore()
  const percent = Math.round((currentSection / TOTAL_SECTIONS) * 100)

  const saveLabel = isSaving
    ? 'A guardar...'
    : lastSaved ? 'Guardado ✓' : ''

  return (
    <div className="sticky top-0 z-30 bg-earth-50/95 backdrop-blur-sm border-b border-earth-100 px-4 py-3">
      <div className="max-w-2xl mx-auto space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold text-earth-700">
            Secção {currentSection} de {TOTAL_SECTIONS}
          </span>
          <span className={`text-earth-400 transition-opacity ${saveLabel ? 'opacity-100' : 'opacity-0'}`}>
            {saveLabel}
          </span>
          <span className="font-semibold text-brand-600">{percent}% concluído</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="hidden sm:flex justify-between px-0.5">
          {SECTIONS.map(s => (
            <div
              key={s.id}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                s.number < currentSection
                  ? 'bg-brand-500'
                  : s.number === currentSection
                    ? 'bg-brand-400 ring-2 ring-brand-200'
                    : 'bg-earth-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
