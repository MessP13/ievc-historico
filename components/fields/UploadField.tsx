// components/fields/UploadField.tsx
import { useRef, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { Upload, X, ImageIcon, FileText, Loader2 } from 'lucide-react'
import { useFormStore, type AttachmentLocal } from '@/lib/store'
import { compressImage, generateThumbnailUrl, formatFileSize } from '@/lib/compress'

function generateId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export default function UploadField() {
  const { t } = useTranslation('common')
  const { attachments, addAttachment, updateAttachment, removeAttachment } = useFormStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)

  const processFile = async (file: File) => {
    const localId = generateId()

    // Add placeholder immediately
    addAttachment({
      localId,
      uploadStatus: 'pending',
      originalFilename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    })

    setProcessing(true)
    try {
      // Compress if image
      const processed = file.type.startsWith('image/') ? await compressImage(file) : file
      const previewUrl = file.type.startsWith('image/') ? await generateThumbnailUrl(processed) : undefined

      updateAttachment(localId, {
        file: processed,
        previewUrl,
        sizeBytes: processed.size,
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files)
    for (const f of arr) {
      if (f.size > 10 * 1024 * 1024) continue // skip >10MB
      await processFile(f)
    }
  }

  const uploadOne = async (att: AttachmentLocal) => {
    if (!att.file || att.uploadStatus === 'uploading' || att.uploadStatus === 'uploaded') return

    updateAttachment(att.localId, { uploadStatus: 'uploading' })

    try {
      const form = new FormData()
      form.append('file', att.file)
      form.append('localId', att.localId)
      if (att.description) form.append('description', att.description)

      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      updateAttachment(att.localId, {
        uploadStatus: 'uploaded',
        remoteUrl: data.fileUrl,
        thumbnailUrl: data.thumbnailUrl,
      })
    } catch {
      updateAttachment(att.localId, { uploadStatus: 'failed' })
    }
  }

  const statusBadge = (status: AttachmentLocal['uploadStatus']) => {
    const map = {
      pending:   { text: t('upload.pending'),   cls: 'bg-earth-100 text-earth-600' },
      uploading: { text: t('upload.uploading'),  cls: 'bg-brand-100 text-brand-700' },
      uploaded:  { text: t('upload.uploaded'),   cls: 'bg-green-100 text-green-700' },
      failed:    { text: t('upload.failed'),     cls: 'bg-red-100 text-red-700' },
    }
    const { text, cls } = map[status]
    return <span className={`text-sm px-2 py-1 rounded-lg font-medium ${cls}`}>{text}</span>
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging ? 'border-brand-500 bg-brand-50' : 'border-earth-200 bg-white hover:border-brand-300 hover:bg-brand-50'
        }`}
      >
        <Upload className="mx-auto mb-3 text-brand-400" size={32} />
        <p className="text-lg font-semibold text-earth-700">{t('questions.attachments.drag_text')}</p>
        <p className="text-base text-earth-400 mt-1">{t('upload.max_size')}</p>
        <p className="text-sm text-earth-400 mt-0.5">{t('upload.compress_notice')}</p>
        <button
          type="button"
          className="mt-4 btn-primary max-w-xs mx-auto"
          onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
        >
          {processing
            ? <><Loader2 size={18} className="animate-spin" /> A processar...</>
            : t('questions.attachments.button')}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={e => e.target.files && handleFiles(e.target.files)}
      />

      {/* Attachment list */}
      {attachments.map((att) => (
        <div key={att.localId} className="card flex gap-4">
          {/* Thumbnail */}
          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-earth-100 flex items-center justify-center">
            {att.previewUrl
              ? <img src={att.previewUrl} alt="" className="w-full h-full object-cover" />
              : att.mimeType?.includes('image')
                ? <ImageIcon className="text-earth-400" size={28} />
                : <FileText className="text-earth-400" size={28} />
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-medium text-earth-800 truncate">{att.originalFilename}</p>
              <button
                type="button"
                onClick={() => removeAttachment(att.localId)}
                className="p-1 text-earth-400 hover:text-red-500 flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {statusBadge(att.uploadStatus)}
              {att.sizeBytes && (
                <span className="text-sm text-earth-400">{formatFileSize(att.sizeBytes)}</span>
              )}
            </div>

            <input
              type="text"
              placeholder={t('questions.attachments.description_placeholder')}
              value={att.description ?? ''}
              onChange={e => updateAttachment(att.localId, { description: e.target.value })}
              className="field-input text-base"
            />

            {att.uploadStatus !== 'uploaded' && att.file && (
              <button
                type="button"
                onClick={() => uploadOne(att)}
                disabled={att.uploadStatus === 'uploading'}
                className="text-brand-600 text-sm font-semibold hover:text-brand-800 disabled:opacity-50"
              >
                {att.uploadStatus === 'uploading' ? t('upload.uploading') : '↑ Enviar agora'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
