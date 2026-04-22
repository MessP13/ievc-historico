// components/LocationSelector.tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useFormStore } from '@/lib/store'

interface Province { id: number; name: string }
interface District { id: number; name: string; provinceId: number }

export default function LocationSelector() {
  const { t } = useTranslation('common')
  const { answers, setAnswer } = useFormStore()
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)

  const provinceId = answers['province_id'] as number | undefined
  const districtId = answers['district_id'] as number | undefined

  useEffect(() => {
    fetch('/api/provinces').then(r => r.json()).then(setProvinces)
  }, [])

  useEffect(() => {
    if (!provinceId) { setDistricts([]); return }
    setLoadingDistricts(true)
    fetch(`/api/provinces/${provinceId}/districts`)
      .then(r => r.json())
      .then(setDistricts)
      .finally(() => setLoadingDistricts(false))
  }, [provinceId])

  return (
    <div className="space-y-4">
      {/* Province */}
      <div>
        <label className="field-label">
          Província <span className="text-red-400">*</span>
        </label>
        <select
          value={provinceId ?? ''}
          onChange={e => {
            setAnswer('province_id', parseInt(e.target.value) || null)
            setAnswer('district_id', null)
          }}
          className="field-input bg-white"
        >
          <option value="">Seleccione a província...</option>
          {provinces.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* District */}
      {provinceId && (
        <div>
          <label className="field-label">
            Distrito <span className="text-red-400">*</span>
          </label>
          <select
            value={districtId ?? ''}
            onChange={e => setAnswer('district_id', parseInt(e.target.value) || null)}
            disabled={loadingDistricts}
            className="field-input bg-white"
          >
            <option value="">
              {loadingDistricts ? 'A carregar...' : 'Seleccione o distrito...'}
            </option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Church name */}
      <div>
        <label className="field-label">
          Nome da igreja local <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Ex: IEVC Beira Central"
          value={(answers['church_name'] as string) ?? ''}
          onChange={e => setAnswer('church_name', e.target.value)}
          className="field-input"
        />
      </div>
    </div>
  )
}
