// lib/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DateFlexValue {
  type: 'date_flex'
  exact?: number | null
  rangeStart?: number | null
  rangeEnd?: number | null
  uncertain?: boolean
  notes?: string
}

export interface AttachmentLocal {
  localId: string
  file?: File
  previewUrl?: string
  description?: string
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed'
  remoteUrl?: string
  thumbnailUrl?: string
  originalFilename?: string
  mimeType?: string
  sizeBytes?: number
}

export type AnswerValue =
  | string
  | number
  | boolean
  | string[]
  | DateFlexValue
  | null

export interface FormState {
  formId: string | null
  userId: string | null
  currentSection: number
  answers: Record<string, AnswerValue>
  attachments: AttachmentLocal[]
  isSaving: boolean
  lastSaved: Date | null
  isSubmitted: boolean

  // Actions
  setFormId: (id: string) => void
  setUserId: (id: string) => void
  setSection: (n: number) => void
  setAnswer: (key: string, value: AnswerValue) => void
  setAttachments: (attachments: AttachmentLocal[]) => void
  addAttachment: (attachment: AttachmentLocal) => void
  updateAttachment: (localId: string, updates: Partial<AttachmentLocal>) => void
  removeAttachment: (localId: string) => void
  setSaving: (v: boolean) => void
  setLastSaved: (d: Date) => void
  setSubmitted: (v: boolean) => void
  reset: () => void
}

const initialState = {
  formId: null,
  userId: null,
  currentSection: 1,
  answers: {},
  attachments: [],
  isSaving: false,
  lastSaved: null,
  isSubmitted: false,
}

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      ...initialState,

      setFormId: (id) => set({ formId: id }),
      setUserId: (id) => set({ userId: id }),
      setSection: (n) => set({ currentSection: n }),
      setAnswer: (key, value) =>
        set((state) => ({ answers: { ...state.answers, [key]: value } })),
      setAttachments: (attachments) => set({ attachments }),
      addAttachment: (attachment) =>
        set((state) => ({ attachments: [...state.attachments, attachment] })),
      updateAttachment: (localId, updates) =>
        set((state) => ({
          attachments: state.attachments.map((a) =>
            a.localId === localId ? { ...a, ...updates } : a
          ),
        })),
      removeAttachment: (localId) =>
        set((state) => ({
          attachments: state.attachments.filter((a) => a.localId !== localId),
        })),
      setSaving: (v) => set({ isSaving: v }),
      setLastSaved: (d) => set({ lastSaved: d }),
      setSubmitted: (v) => set({ isSubmitted: v }),
      reset: () => set(initialState),
    }),
    {
      name: 'ievc-form-storage',
      // Don't persist File objects (not serializable)
      partialize: (state) => ({
        ...state,
        attachments: state.attachments.map(({ file, ...rest }) => rest),
      }),
    }
  )
)
