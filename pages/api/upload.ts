// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { createServerClient } from '@/lib/supabase'

export const config = { api: { bodyParser: false } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    keepExtensions: true,
  })

  try {
    const [fields, files] = await form.parse(req)

    const fileArray = files.file
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray
    const localId = Array.isArray(fields.localId) ? fields.localId[0] : fields.localId
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description

    if (!file) return res.status(400).json({ error: 'No file provided' })

    const supabase = createServerClient()
    const ext = path.extname(file.originalFilename ?? '.bin')
    const fileName = `uploads/${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`

    const fileBuffer = fs.readFileSync(file.filepath)

    const { error } = await supabase.storage
      .from('ievc-historico')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype ?? 'application/octet-stream',
        upsert: false,
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('ievc-historico')
      .getPublicUrl(fileName)

    // Clean up temp file
    fs.unlink(file.filepath, () => {})

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
}
