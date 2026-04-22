// components/FormProgress.tsx
import { useTranslation } from 'next-i18next'
import { SECTIONS, TOTAL_SECTIONS } from '@/lib/questions'
import { useFormStore } from '@/lib/store'
import { Check } from 'lucide-react'

interface Props {
  currentSection: number
}

export default function FormProgress({ currentSection }: Props) {
  const { t } = useTranslation('common')
  const { isSaving, lastSaved } = useFormStore()
  const percent = Math.round((currentSection / TOTAL_SECTIONS) * 100)

  const saveLabel = isSaving
    ? t('nav.saving')
    : lastSaved
      ? `${t('nav.saved')} ✓`
      : ''

  return (
    <div className="sticky top-0 z-30 bg-earth-50/95 backdrop-blur-sm border-b border-earth-100 px-4 py-3">
      <div className="max-w-2xl mx-auto space-y-2">
        {/* Top row */}
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold text-earth-700">
            {t('progress.section', { current: currentSection, total: TOTAL_SECTIONS })}
          </span>
          <span className={`text-earth-400 transition-opacity ${saveLabel ? 'opacity-100' : 'opacity-0'}`}>
            {saveLabel}
          </span>
          <span className="font-semibold text-brand-600">
            {t('progress.percent', { percent })}
          </span>
        </div>

        {/* Progress bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>

        {/* Section dots — hidden on tiny screens */}
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
