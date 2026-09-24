import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl || 'https://example.supabase.co', supabaseAnonKey || 'public-anon-key', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('example.supabase.co'))
}

export function safeJson<T>(value: T | null | undefined, fallback: T): T {
  return value ?? fallback
}

export async function withSupabaseFallback<T>(query: () => Promise<T>, fallbackValue: T): Promise<T> {
  if (!isSupabaseConfigured()) {
    return fallbackValue
  }

  try {
    return await query()
  } catch (error) {
    console.warn('Supabase query failed, falling back to local storage data:', error)
    return fallbackValue
  }
}

export function camelizeRow<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const output: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(row)) {
    const normalized = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
    output[normalized] = value
  }

  return output
}
