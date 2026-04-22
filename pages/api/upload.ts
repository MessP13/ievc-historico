// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { createServerClient } from '@/lib/supabase'

export const config = { api: { bodyParser: false } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024 })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Upload parse failed' })

    const file = Array.isArray(files.file) ? files.file[0] : files.file as File
    const localId = Array.isArray(fields.localId) ? fields.localId[0] : fields.localId
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description

    if (!file) return res.status(400).json({ error: 'No file' })

    try {
      const supabase = createServerClient()
      const ext = path.extname(file.originalFilename ?? '.bin')
      const fileName = `uploads/${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`

      const fileBuffer = fs.readFileSync(file.filepath)

      const { data, error } = await supabase.storage
        .from('ievc-historico')
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype ?? 'application/octet-stream',
          upsert: false,
        })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('ievc-historico')
        .getPublicUrl(fileName)

      // Clean temp file
      fs.unlinkSync(file.filepath)

      res.json({
        ok: true,
        localId,
        fileUrl: urlData.publicUrl,
        thumbnailUrl: file.mimetype?.startsWith('image/') ? urlData.publicUrl : null,
        originalFilename: file.originalFilename,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        description,
      })
    } catch (err) {
      console.error('Upload error:', err)
      res.status(500).json({ error: 'Upload failed' })
    }
  })
}
