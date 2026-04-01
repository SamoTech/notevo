import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Note = {
  id: string
  user_id: string
  notebook_id: string | null
  title: string
  encrypted_body: string
  iv: string
  salt: string
  tags: string[]
  is_encrypted: boolean
  created_at: string
  updated_at: string
}

export type Notebook = {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}
