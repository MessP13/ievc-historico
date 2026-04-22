import type { NextApiRequest } from 'next'

export function isAdminRequest(req: NextApiRequest): boolean {
  const configuredKey = process.env.ADMIN_API_KEY
  // Backward-compatible: when key is not configured, keep previous behavior.
  if (!configuredKey) return true

  const headerKey = req.headers['x-admin-key']
  const providedKey = Array.isArray(headerKey) ? headerKey[0] : headerKey
  return providedKey === configuredKey
}

