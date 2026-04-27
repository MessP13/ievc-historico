// lib/hooks/useAutoSave.ts
import { useEffect, useRef, useCallback } from 'react'
import { useFormStore } from '@/lib/store'
import toast from 'react-hot-toast'

const DEBOUNCE_MS = 2000

export function useAutoSave() {
  const {
    formId, userId, answers, attachments,
    isSaving, setSaving, setLastSaved, isSubmitted
  } = useFormStore()

  const timeoutRef = useRef<NodeJS.Timeout>()
  const prevAnswersRef = useRef<string>('')

  const save = useCallback(async () => {
    if (!formId || !userId || isSubmitted) return

    const answersJson = JSON.stringify(answers)
    if (answersJson === prevAnswersRef.current) return
    prevAnswersRef.current = answersJson

    setSaving(true)
    try {
      const res = await fetch(`/api/forms/${formId}/answers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      if (res.ok) {
        setLastSaved(new Date())
      }
    } catch {
      // Fail silently — offline mode, will retry
    } finally {
      setSaving(false)
    }
  }, [formId, userId, answers, isSubmitted, setSaving, setLastSaved])

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(save, DEBOUNCE_MS)
    return () => clearTimeout(timeoutRef.current)
  }, [answers, save])

  return { isSaving }
}
