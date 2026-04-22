// lib/compress.ts
import imageCompression from 'browser-image-compression'

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    initialQuality: 0.7,
    fileType: 'image/jpeg',
  }

  try {
    const compressed = await imageCompression(file, options)
    return compressed
  } catch {
    return file // fallback to original
  }
}

export function generateThumbnailUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
