// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Lazy singleton — only created when first called, not at import time
// This avoids build errors when env vars are not available during SSG
let _supabase: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    _supabase = createClient(url, key)
  }
  return _supabase
}

// Keep backwards-compat export (lazy proxy)
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getSupabase() as any)[prop]
  }
})

// Server-side client with elevated permissions — always lazy
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase server env vars')
  return createClient(url, key, { auth: { persistSession: false } })
}
