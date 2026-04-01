export interface Note {
  id: string
  user_id: string
  notebook_id?: string | null
  title: string
  encrypted_body: string
  iv: string
  salt: string
  tags: string[]
  is_encrypted: boolean
  created_at: string
  updated_at: string
}

export interface Notebook {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}
