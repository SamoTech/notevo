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
  pinned?: boolean
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

export interface Tag {
  id: string
  user_id: string
  name: string
  color?: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'system'
  editor_mode: 'normal' | 'preview' | 'distraction_free'
  enable_mathjax: boolean
  enable_syntax_highlighting: boolean
  font_size: number
  auto_save: boolean
  keybindings_preset: 'default' | 'vim' | 'emacs'
  language: string
  created_at: string
  updated_at: string
}

export interface ExportData {
  notes: Note[]
  notebooks: Notebook[]
  tags: Tag[]
  settings?: UserSettings
  export_date: string
  version: string
}
