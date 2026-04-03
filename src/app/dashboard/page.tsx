'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { encryptNote, decryptNote } from '@/lib/crypto'
import type { Note } from '@/lib/types'

// ── i18n ──────────────────────────────────────────────────
type Locale = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'zh'
const LOCALES: Record<Locale, string> = { en: 'English', ar: 'العربية', fr: 'Français', es: 'Español', de: 'Deutsch', zh: '中文' }
const T: Record<Locale, Record<string, string>> = {
  en: {
    appName: 'Notevo', newNote: 'New note', search: 'Search notes…', all: 'All', encrypted: '🔐 Encrypted', plain: 'Plain',
    noNotes: 'No notes yet.', noNotesSub: 'Press + to create one.', noSelected: 'No note selected', noSelectedSub: 'Select a note or create a new one',
    untitled: 'Untitled', saving: 'Saving…', saved: 'Saved', words: 'words', word: 'word', chars: 'chars', char: 'char',
    addTag: 'Add tag…', noteTitle: 'Note title…', encryptedContent: 'Encrypted content',
    encryptNote: 'Encrypt note', decryptNote: 'Decrypt note', encryptDesc: 'Protect this note with AES-256 encryption',
    decryptDesc: 'Enter your password to permanently decrypt this note', password: 'Password', confirmPassword: 'Confirm password',
    choosePass: 'Choose a strong password…', confirmPassPh: 'Confirm password…', enterPass: 'Enter your password…',
    cancel: 'Cancel', warnNoRecover: 'This password cannot be recovered. If lost, the note cannot be decrypted. Store it safely.',
    incorrectPass: 'Incorrect password', enterPassErr: 'Enter your password', enterAPass: 'Enter a password',
    passMismatch: 'Passwords do not match', passShort: 'Password must be at least 4 characters',
    noteEncrypted: '🔐 Encrypted', unlockNote: 'Unlock note', noteEncryptedTitle: 'Note is encrypted',
    noteEncryptedDesc: 'Enter your password to read and edit this note',
    delete: 'Delete note', deleteConfirm: 'Delete this note? This cannot be undone.',
    export: 'Export as Markdown', exportAll: 'Export all notes', importNotes: 'Import notes',
    duplicate: 'Duplicate note', pin: 'Pin note', unpin: 'Unpin note', pinned: '📌 Pinned',
    fullscreen: 'Fullscreen', exitFullscreen: 'Exit fullscreen',
    sortUpdated: 'Last updated', sortCreated: 'Date created', sortTitle: 'Title A–Z',
    shortcuts: 'Keyboard shortcuts', shortcutsClose: 'Close',
    signOut: 'Sign out', darkMode: 'Toggle dark mode', language: 'Language',
    startWriting: 'Start writing in Markdown…',
    importSuccess: 'Imported {n} note(s) successfully.', importError: 'Invalid file format.',
    bold: 'Bold', italic: 'Italic', code: 'Code', h1: 'H1', h2: 'H2', h3: 'H3',
    ul: '• List', ol: '1. List', quote: '" Quote', link: '🔗 Link',
    edit: 'Edit', split: 'Split', preview: 'Preview',
  },
  ar: {
    appName: 'نوتيفو', newNote: 'ملاحظة جديدة', search: 'بحث في الملاحظات…', all: 'الكل', encrypted: '🔐 مشفّرة', plain: 'عادية',
    noNotes: 'لا توجد ملاحظات بعد.', noNotesSub: 'اضغط + لإنشاء واحدة.', noSelected: 'لم يتم تحديد ملاحظة', noSelectedSub: 'اختر ملاحظة أو أنشئ واحدة جديدة',
    untitled: 'بدون عنوان', saving: 'جارٍ الحفظ…', saved: 'تم الحفظ', words: 'كلمات', word: 'كلمة', chars: 'حرف', char: 'حرف',
    addTag: 'أضف وسماً…', noteTitle: 'عنوان الملاحظة…', encryptedContent: 'محتوى مشفّر',
    encryptNote: 'تشفير الملاحظة', decryptNote: 'فك التشفير', encryptDesc: 'احمِ هذه الملاحظة بتشفير AES-256',
    decryptDesc: 'أدخل كلمة المرور لفك التشفير نهائياً', password: 'كلمة المرور', confirmPassword: 'تأكيد كلمة المرور',
    choosePass: 'اختر كلمة مرور قوية…', confirmPassPh: 'تأكيد كلمة المرور…', enterPass: 'أدخل كلمة المرور…',
    cancel: 'إلغاء', warnNoRecover: 'لا يمكن استرداد كلمة المرور. إذا فُقدت، لن تتمكن من فك تشفير الملاحظة.',
    incorrectPass: 'كلمة مرور غير صحيحة', enterPassErr: 'أدخل كلمة المرور', enterAPass: 'أدخل كلمة مرور',
    passMismatch: 'كلمتا المرور غير متطابقتين', passShort: 'يجب أن تكون كلمة المرور 4 أحرف على الأقل',
    noteEncrypted: '🔐 مشفّرة', unlockNote: 'فتح الملاحظة', noteEncryptedTitle: 'الملاحظة مشفّرة',
    noteEncryptedDesc: 'أدخل كلمة المرور للقراءة والتحرير',
    delete: 'حذف', deleteConfirm: 'حذف هذه الملاحظة؟ لا يمكن التراجع.',
    export: 'تصدير كـ Markdown', exportAll: 'تصدير كل الملاحظات', importNotes: 'استيراد ملاحظات',
    duplicate: 'تكرار الملاحظة', pin: 'تثبيت', unpin: 'إلغاء التثبيت', pinned: '📌 مثبّتة',
    fullscreen: 'ملء الشاشة', exitFullscreen: 'خروج من ملء الشاشة',
    sortUpdated: 'آخر تحديث', sortCreated: 'تاريخ الإنشاء', sortTitle: 'العنوان أ-ي',
    shortcuts: 'اختصارات لوحة المفاتيح', shortcutsClose: 'إغلاق',
    signOut: 'تسجيل الخروج', darkMode: 'تبديل الوضع الليلي', language: 'اللغة',
    startWriting: 'ابدأ الكتابة بـ Markdown…',
    importSuccess: 'تم استيراد {n} ملاحظة بنجاح.', importError: 'صيغة الملف غير صالحة.',
    bold: 'عريض', italic: 'مائل', code: 'كود', h1: 'H1', h2: 'H2', h3: 'H3',
    ul: '• قائمة', ol: '1. قائمة', quote: '" اقتباس', link: '🔗 رابط',
    edit: 'تحرير', split: 'مقسّم', preview: 'معاينة',
  },
  fr: {
    appName: 'Notevo', newNote: 'Nouvelle note', search: 'Rechercher…', all: 'Tout', encrypted: '🔐 Chiffrée', plain: 'Normal',
    noNotes: 'Aucune note.', noNotesSub: 'Appuyez sur + pour en créer une.', noSelected: 'Aucune note sélectionnée', noSelectedSub: 'Sélectionnez une note ou créez-en une',
    untitled: 'Sans titre', saving: 'Enregistrement…', saved: 'Enregistré', words: 'mots', word: 'mot', chars: 'car.', char: 'car.',
    addTag: 'Ajouter un tag…', noteTitle: 'Titre de la note…', encryptedContent: 'Contenu chiffré',
    encryptNote: 'Chiffrer la note', decryptNote: 'Déchiffrer', encryptDesc: 'Protégez cette note avec AES-256',
    decryptDesc: 'Entrez votre mot de passe pour déchiffrer définitivement', password: 'Mot de passe', confirmPassword: 'Confirmer',
    choosePass: 'Choisissez un mot de passe…', confirmPassPh: 'Confirmer…', enterPass: 'Votre mot de passe…',
    cancel: 'Annuler', warnNoRecover: 'Ce mot de passe ne peut pas être récupéré.',
    incorrectPass: 'Mot de passe incorrect', enterPassErr: 'Entrez votre mot de passe', enterAPass: 'Entrez un mot de passe',
    passMismatch: 'Les mots de passe ne correspondent pas', passShort: 'Au moins 4 caractères requis',
    noteEncrypted: '🔐 Chiffrée', unlockNote: 'Déverrouiller', noteEncryptedTitle: 'Note chiffrée',
    noteEncryptedDesc: 'Entrez votre mot de passe pour lire et modifier cette note',
    delete: 'Supprimer', deleteConfirm: 'Supprimer cette note ? Irréversible.',
    export: 'Exporter en Markdown', exportAll: 'Exporter toutes', importNotes: 'Importer',
    duplicate: 'Dupliquer', pin: 'Épingler', unpin: 'Désépingler', pinned: '📌 Épinglée',
    fullscreen: 'Plein écran', exitFullscreen: 'Quitter le plein écran',
    sortUpdated: 'Dernière modif.', sortCreated: 'Date de création', sortTitle: 'Titre A–Z',
    shortcuts: 'Raccourcis clavier', shortcutsClose: 'Fermer',
    signOut: 'Déconnexion', darkMode: 'Thème sombre', language: 'Langue',
    startWriting: 'Commencez à écrire en Markdown…',
    importSuccess: '{n} note(s) importée(s).', importError: 'Format de fichier invalide.',
    bold: 'Gras', italic: 'Italique', code: 'Code', h1: 'H1', h2: 'H2', h3: 'H3',
    ul: '• Liste', ol: '1. Liste', quote: '" Citation', link: '🔗 Lien',
    edit: 'Éditer', split: 'Divisé', preview: 'Aperçu',
  },
  es: {
    appName: 'Notevo', newNote: 'Nueva nota', search: 'Buscar notas…', all: 'Todo', encrypted: '🔐 Cifrada', plain: 'Normal',
    noNotes: 'Sin notas.', noNotesSub: 'Presiona + para crear una.', noSelected: 'Ninguna nota seleccionada', noSelectedSub: 'Selecciona una nota o crea una nueva',
    untitled: 'Sin título', saving: 'Guardando…', saved: 'Guardado', words: 'palabras', word: 'palabra', chars: 'car.', char: 'car.',
    addTag: 'Añadir etiqueta…', noteTitle: 'Título de la nota…', encryptedContent: 'Contenido cifrado',
    encryptNote: 'Cifrar nota', decryptNote: 'Descifrar nota', encryptDesc: 'Protege esta nota con AES-256',
    decryptDesc: 'Introduce tu contraseña para descifrar definitivamente', password: 'Contraseña', confirmPassword: 'Confirmar',
    choosePass: 'Elige una contraseña segura…', confirmPassPh: 'Confirmar contraseña…', enterPass: 'Tu contraseña…',
    cancel: 'Cancelar', warnNoRecover: 'Esta contraseña no se puede recuperar.',
    incorrectPass: 'Contraseña incorrecta', enterPassErr: 'Introduce tu contraseña', enterAPass: 'Introduce una contraseña',
    passMismatch: 'Las contraseñas no coinciden', passShort: 'Mínimo 4 caracteres',
    noteEncrypted: '🔐 Cifrada', unlockNote: 'Desbloquear nota', noteEncryptedTitle: 'Nota cifrada',
    noteEncryptedDesc: 'Introduce tu contraseña para leer y editar esta nota',
    delete: 'Eliminar', deleteConfirm: '¿Eliminar esta nota? No se puede deshacer.',
    export: 'Exportar como Markdown', exportAll: 'Exportar todas', importNotes: 'Importar',
    duplicate: 'Duplicar nota', pin: 'Fijar nota', unpin: 'Desfijar nota', pinned: '📌 Fijada',
    fullscreen: 'Pantalla completa', exitFullscreen: 'Salir de pantalla completa',
    sortUpdated: 'Última actualización', sortCreated: 'Fecha de creación', sortTitle: 'Título A–Z',
    shortcuts: 'Atajos de teclado', shortcutsClose: 'Cerrar',
    signOut: 'Cerrar sesión', darkMode: 'Modo oscuro', language: 'Idioma',
    startWriting: 'Empieza a escribir en Markdown…',
    importSuccess: '{n} nota(s) importada(s).', importError: 'Formato de archivo inválido.',
    bold: 'Negrita', italic: 'Cursiva', code: 'Código', h1: 'H1', h2: 'H2', h3: 'H3',
    ul: '• Lista', ol: '1. Lista', quote: '" Cita', link: '🔗 Enlace',
    edit: 'Editar', split: 'División', preview: 'Vista previa',
  },
  de: {
    appName: 'Notevo', newNote: 'Neue Notiz', search: 'Notizen suchen…', all: 'Alle', encrypted: '🔐 Verschlüsselt', plain: 'Normal',
    noNotes: 'Keine Notizen.', noNotesSub: '+ drücken, um eine zu erstellen.', noSelected: 'Keine Notiz ausgewählt', noSelectedSub: 'Notiz auswählen oder neue erstellen',
    untitled: 'Ohne Titel', saving: 'Speichern…', saved: 'Gespeichert', words: 'Wörter', word: 'Wort', chars: 'Zeichen', char: 'Zeichen',
    addTag: 'Tag hinzufügen…', noteTitle: 'Notiztitel…', encryptedContent: 'Verschlüsselter Inhalt',
    encryptNote: 'Notiz verschlüsseln', decryptNote: 'Entschlüsseln', encryptDesc: 'Schütze diese Notiz mit AES-256',
    decryptDesc: 'Passwort eingeben zum dauerhaften Entschlüsseln', password: 'Passwort', confirmPassword: 'Bestätigen',
    choosePass: 'Starkes Passwort wählen…', confirmPassPh: 'Passwort bestätigen…', enterPass: 'Passwort eingeben…',
    cancel: 'Abbrechen', warnNoRecover: 'Dieses Passwort kann nicht wiederhergestellt werden.',
    incorrectPass: 'Falsches Passwort', enterPassErr: 'Passwort eingeben', enterAPass: 'Passwort eingeben',
    passMismatch: 'Passwörter stimmen nicht überein', passShort: 'Mindestens 4 Zeichen erforderlich',
    noteEncrypted: '🔐 Verschlüsselt', unlockNote: 'Notiz entsperren', noteEncryptedTitle: 'Notiz ist verschlüsselt',
    noteEncryptedDesc: 'Passwort eingeben zum Lesen und Bearbeiten',
    delete: 'Löschen', deleteConfirm: 'Diese Notiz löschen? Nicht rückgängig zu machen.',
    export: 'Als Markdown exportieren', exportAll: 'Alle exportieren', importNotes: 'Importieren',
    duplicate: 'Notiz duplizieren', pin: 'Anheften', unpin: 'Loslösen', pinned: '📌 Angeheftet',
    fullscreen: 'Vollbild', exitFullscreen: 'Vollbild beenden',
    sortUpdated: 'Zuletzt geändert', sortCreated: 'Erstellungsdatum', sortTitle: 'Titel A–Z',
    shortcuts: 'Tastenkürzel', shortcutsClose: 'Schließen',
    signOut: 'Abmelden', darkMode: 'Dunkelmodus', language: 'Sprache',
    startWriting: 'In Markdown schreiben…',
    importSuccess: '{n} Notiz(en) importiert.', importError: 'Ungültiges Dateiformat.',
    bold: 'Fett', italic: 'Kursiv', code: 'Code', h1: 'H1', h2: 'H2', h3: 'H3',
    ul: '• Liste', ol: '1. Liste', quote: '" Zitat', link: '🔗 Link',
    edit: 'Bearbeiten', split: 'Geteilt', preview: 'Vorschau',
  },
  zh: {
    appName: 'Notevo', newNote: '新建笔记', search: '搜索笔记…', all: '全部', encrypted: '🔐 已加密', plain: '普通',
    noNotes: '暂无笔记。', noNotesSub: '按 + 创建新笔记。', noSelected: '未选择笔记', noSelectedSub: '选择笔记或创建新笔记',
    untitled: '无标题', saving: '保存中…', saved: '已保存', words: '字', word: '字', chars: '符', char: '符',
    addTag: '添加标签…', noteTitle: '笔记标题…', encryptedContent: '已加密内容',
    encryptNote: '加密笔记', decryptNote: '解密笔记', encryptDesc: '使用 AES-256 保护此笔记',
    decryptDesc: '输入密码以永久解密此笔记', password: '密码', confirmPassword: '确认密码',
    choosePass: '选择强密码…', confirmPassPh: '确认密码…', enterPass: '输入密码…',
    cancel: '取消', warnNoRecover: '此密码无法恢复。丢失后将无法解密笔记。',
    incorrectPass: '密码错误', enterPassErr: '请输入密码', enterAPass: '请输入密码',
    passMismatch: '两次密码不一致', passShort: '密码至少需要4个字符',
    noteEncrypted: '🔐 已加密', unlockNote: '解锁笔记', noteEncryptedTitle: '笔记已加密',
    noteEncryptedDesc: '输入密码以阅读和编辑此笔记',
    delete: '删除', deleteConfirm: '删除此笔记？此操作无法撤销。',
    export: '导出为 Markdown', exportAll: '导出全部笔记', importNotes: '导入笔记',
    duplicate: '复制笔记', pin: '置顶笔记', unpin: '取消置顶', pinned: '📌 已置顶',
    fullscreen: '全屏', exitFullscreen: '退出全屏',
    sortUpdated: '最近更新', sortCreated: '创建日期', sortTitle: '标题 A–Z',
    shortcuts: '键盘快捷键', shortcutsClose: '关闭',
    signOut: '退出登录', darkMode: '切换深色模式', language: '语言',
    startWriting: '开始用 Markdown 写作…',
    importSuccess: '成功导入 {n} 条笔记。', importError: '文件格式无效。',
    bold: '加粗', italic: '斜体', code: '代码', h1: 'H1', h2: 'H2', h3: 'H3',
    ul: '• 列表', ol: '1. 列表', quote: '" 引用', link: '🔗 链接',
    edit: '编辑', split: '分割', preview: '预览',
  },
}

// ── CRYPTO (AES-GCM via Web Crypto API) ───────────────────
// Replaced with centralized implementation in @/lib/crypto.ts
// Using 600,000 PBKDF2 iterations per OWASP 2024 recommendation

// ── MARKDOWN ──────────────────────────────────────────────
const DANGEROUS_PROTOCOLS = /^(javascript:|vbscript:|data:|file:)/i

function renderMarkdown(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, label, url) => {
      const sanitizedUrl = url.trim()
      if (DANGEROUS_PROTOCOLS.test(sanitizedUrl)) {
        return `[${label}](#blocked-link)`
      }
      return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`
    })
    .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
    .replace(/((?:<li>[\s\S]*?<\/li>\n?)+)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hbulopqh]|<\/)(.+)$/gm, '<p>$1</p>')
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function fmtDate(ts: number): string {
  const d = new Date(ts), now = new Date()
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }

type ViewMode = 'edit' | 'split' | 'preview'
type FilterMode = 'all' | 'encrypted' | 'plain'
type SortMode = 'updated' | 'created' | 'title'

interface LocalNote {
  id: string
  title: string
  body: string
  tags: string[]
  encrypted: boolean
  iv: string | null
  salt: string | null
  createdAt: number
  updatedAt: number
  pinned?: boolean
  dbId?: string
}

export default function Dashboard() {
  const [notes, setNotes] = useState<LocalNote[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [sortMode, setSortMode] = useState<SortMode>('updated')
  const [searchQ, setSearchQ] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [unlocked, setUnlocked] = useState<Record<string, string>>({})
  const [unlockPass, setUnlockPass] = useState('')
  const [unlockErr, setUnlockErr] = useState('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [encryptOpen, setEncryptOpen] = useState(false)
  const [epPass, setEpPass] = useState('')
  const [epConfirm, setEpConfirm] = useState('')
  const [epDecPass, setEpDecPass] = useState('')
  const [epErr, setEpErr] = useState('')
  const [epDecErr, setEpDecErr] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [locale, setLocale] = useState<Locale>('en')
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [sortMenuOpen, setSortMenuOpen] = useState(false)

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSavingRef = useRef(false)
  const persistedRef = useRef<Record<string, string>>({})
  const currentIdRef = useRef<string | null>(null)
  const notesRef = useRef<LocalNote[]>([])
  const titleRef = useRef('')
  const bodyRef = useRef('')
  const tagsRef = useRef<string[]>([])
  const importInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  const t = (key: string, vars?: Record<string, string | number>) => {
    let str = T[locale]?.[key] ?? T.en[key] ?? key
    if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, String(v)) })
    return str
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Keep refs in sync with state
  useEffect(() => { currentIdRef.current = currentId }, [currentId])
  useEffect(() => { notesRef.current = notes }, [notes])
  useEffect(() => { titleRef.current = title }, [title])
  useEffect(() => { bodyRef.current = body }, [body])
  useEffect(() => { tagsRef.current = tags }, [tags])

  // ── THEME + LOCALE ──
  useEffect(() => {
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const stored = localStorage.getItem('notevo-theme') as 'light' | 'dark' | null
    const t = stored || (sysDark ? 'dark' : 'light')
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    const storedLocale = localStorage.getItem('notevo-locale') as Locale | null
    if (storedLocale && T[storedLocale]) setLocale(storedLocale)
    setIsMobile(window.innerWidth <= 700)
    const onResize = () => setIsMobile(window.innerWidth <= 700)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // RTL support for Arabic
  useEffect(() => {
    document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr')
  }, [locale])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('notevo-theme', next)
  }

  const setAndSaveLocale = (l: Locale) => {
    setLocale(l)
    localStorage.setItem('notevo-locale', l)
    setShowLangMenu(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ── LOAD NOTES FROM SUPABASE ──
  useEffect(() => {
    const supabase = createClient()

    // Wrap in a real Promise so .catch() is always available
    Promise.resolve(supabase.auth.getUser()).then(({ data: { user } }) => {
      if (!user) {
        // FIX 1: call setLoading(false) before redirecting so the
        // component never stays stuck on a blank loading screen.
        setLoading(false)
        router.push('/login')
        return
      }

      return Promise.resolve(
        supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
      ).then(({ data, error }) => {
        // FIX 2 & 3: handle error explicitly so setLoading is always called.
        if (error) {
          console.error('Failed to load notes:', error.message)
          setNotes(sampleNotes())
          setLoading(false)
          return
        }
        if (data && data.length > 0) {
          const mapped: LocalNote[] = data.map((n: Note) => ({
            id: n.id,
            dbId: n.id,
            title: n.title,
            body: n.encrypted_body,
            tags: n.tags || [],
            encrypted: n.is_encrypted,
            iv: n.iv,
            salt: n.salt,
            pinned: n.pinned || false,
            createdAt: new Date(n.created_at).getTime(),
            updatedAt: new Date(n.updated_at).getTime(),
          }))
          mapped.forEach(n => { persistedRef.current[n.id] = n.id })
          setNotes(mapped)
        } else {
          setNotes(sampleNotes())
        }
        // FIX 4: setLoading(false) is guaranteed on every code path.
        setLoading(false)
      })
    }).catch((err: unknown) => {
      // FIX 4 (cont): catch unexpected rejections so loading is never
      // left as true if getUser() or the query itself throws.
      console.error('Unexpected error loading notes:', err)
      setNotes(sampleNotes())
      setLoading(false)
    })
  }, [router])

  function sampleNotes(): LocalNote[] {
    return [
      {
        id: uid(), title: 'Welcome to Notevo 👋',
        body: '# Welcome to Notevo\n\nA **private**, encrypted note-taking app.\n\n## Features\n\n- ✅ Markdown editing with live preview\n- 🔐 AES-256 note encryption\n- 🏷️ Tags for organisation\n- 💾 Auto-save\n- 📌 Pin notes to top\n- 🌍 Multi-language support\n- ↕️ Sort & filter notes\n- 📥 Import / Export\n\nStart editing or press **+** to create a new one.',
        tags: ['welcome', 'demo'], encrypted: false, iv: null, salt: null, pinned: false,
        createdAt: Date.now() - 86400000, updatedAt: Date.now() - 3600000,
      },
      {
        id: uid(), title: 'Markdown cheatsheet',
        body: '# Markdown Cheatsheet\n\n**Bold**, *Italic*, `inline code`\n\n## Lists\n\n- Item one\n- Item two\n\n## Quote\n\n> The best way to predict the future is to invent it.',
        tags: ['reference'], encrypted: false, iv: null, salt: null, pinned: false,
        createdAt: Date.now() - 3600000, updatedAt: Date.now() - 600000,
      }
    ]
  }

  // ── WORD COUNT ──
  useEffect(() => {
    setWordCount(body.trim() ? body.trim().split(/\s+/).length : 0)
    setCharCount(body.length)
  }, [body])

  // ── SELECT NOTE ──
  const selectNote = useCallback((id: string) => {
    setCurrentId(id)
    const note = notes.find(n => n.id === id)
    if (!note) return
    setTitle(note.title)
    setTags(note.tags)
    if (!note.encrypted) {
      setBody(note.body)
    } else if (unlocked[id] !== undefined) {
      setBody(unlocked[id])
    } else {
      setBody('')
    }
    setUnlockPass('')
    setUnlockErr('')
    if (isMobile) setMobileSidebarOpen(false)
  }, [notes, unlocked, isMobile])

  const currentNote = notes.find(n => n.id === currentId) || null
  const isLocked = !!currentNote?.encrypted && unlocked[currentId!] === undefined

  // ── AUTOSAVE ──
  const doSave = useCallback(async () => {
    const id = currentIdRef.current
    if (!id) return
    if (isSavingRef.current) return
    isSavingRef.current = true

    const note = notesRef.current.find(n => n.id === id)
    if (!note) { isSavingRef.current = false; return }

    setSaveStatus('saving')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { isSavingRef.current = false; return }

    const titleVal = titleRef.current.trim() || 'Untitled'
    const encrypted_body = note.encrypted ? note.body : bodyRef.current
    const currentTags = tagsRef.current
    const existingDbId = persistedRef.current[id]

    if (!existingDbId) {
      const { data: inserted, error } = await supabase.from('notes').insert({
        user_id: user.id,
        title: titleVal,
        encrypted_body,
        iv: note.iv,
        salt: note.salt,
        tags: currentTags,
        is_encrypted: note.encrypted,
        pinned: note.pinned || false,
        created_at: new Date(note.createdAt).toISOString(),
        updated_at: new Date().toISOString(),
      }).select('id').single()

      if (!error && inserted) {
        const dbId: string = inserted.id
        persistedRef.current[id] = dbId
        persistedRef.current[dbId] = dbId
        setNotes(prev => prev.map(n =>
          n.id === id
            ? { ...n, title: titleVal, body: encrypted_body, tags: currentTags, updatedAt: Date.now(), dbId, id: dbId }
            : n
        ))
        setCurrentId(dbId)
        currentIdRef.current = dbId
      }
    } else {
      await supabase.from('notes').update({
        title: titleVal,
        encrypted_body,
        iv: note.iv,
        salt: note.salt,
        tags: currentTags,
        is_encrypted: note.encrypted,
        pinned: note.pinned || false,
        updated_at: new Date().toISOString(),
      }).eq('id', existingDbId)

      setNotes(prev => prev.map(n =>
        n.id === id
          ? { ...n, title: titleVal, body: encrypted_body, tags: currentTags, updatedAt: Date.now() }
          : n
      ))
    }

    isSavingRef.current = false
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!currentId || isLocked) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaveStatus('saving')
    saveTimerRef.current = setTimeout(doSave, 800)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [title, body, tags, currentId, isLocked, doSave])

  // ── CREATE NOTE ──
  const createNote = () => {
    const note: LocalNote = {
      id: uid(), title: '', body: '', tags: [],
      encrypted: false, iv: null, salt: null, pinned: false,
      createdAt: Date.now(), updatedAt: Date.now(),
    }
    setNotes(prev => [note, ...prev])
    setCurrentId(note.id)
    setTitle('')
    setBody('')
    setTags([])
    setUnlockPass('')
    setUnlockErr('')
    setTimeout(() => document.getElementById('note-title-input')?.focus(), 50)
  }

  // ── DUPLICATE NOTE ──
  const duplicateNote = () => {
    if (!currentNote) return
    const copy: LocalNote = {
      ...currentNote,
      id: uid(),
      dbId: undefined,
      title: currentNote.title + ' (copy)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
    }
    setNotes(prev => [copy, ...prev])
    setCurrentId(copy.id)
    setTitle(copy.title)
    setBody(copy.encrypted ? '' : copy.body)
    setTags(copy.tags)
  }

  // ── PIN / UNPIN ──
  const togglePin = async () => {
    if (!currentNote) return
    const newPinned = !currentNote.pinned
    setNotes(prev => prev.map(n => n.id === currentId ? { ...n, pinned: newPinned } : n))
    const dbId = persistedRef.current[currentId!]
    if (dbId) {
      const supabase = createClient()
      await supabase.from('notes').update({ pinned: newPinned }).eq('id', dbId)
    }
  }

  // ── DELETE ──
  const deleteNote = async () => {
    if (!currentId || !currentNote) return
    if (!confirm(t('deleteConfirm'))) return
    const dbId = persistedRef.current[currentId]
    if (dbId) {
      const supabase = createClient()
      await supabase.from('notes').delete().eq('id', dbId)
      delete persistedRef.current[currentId]
      delete persistedRef.current[dbId]
    }
    setNotes(prev => prev.filter(n => n.id !== currentId))
    setCurrentId(null)
    setTitle('')
    setBody('')
    setTags([])
  }

  // ── UNLOCK ──
  const handleUnlock = async () => {
    if (!currentNote || !unlockPass) { setUnlockErr(t('enterPassErr')); return }
    try {
      const result = await decryptNote(unlockPass, currentNote.body, currentNote.iv!, currentNote.salt!)
      if (result.success && result.text) {
        setUnlocked(prev => ({ ...prev, [currentId!]: result.text }))
        setBody(result.text)
        setUnlockErr('')
      } else {
        setUnlockErr(t('incorrectPass'))
      }
    } catch {
      setUnlockErr(t('incorrectPass'))
    }
  }

  // ── FORMAT TOOLBAR ──
  const fmt = (type: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const s = ta.selectionStart, e = ta.selectionEnd
    const sel = body.slice(s, e)
    let rep = '', cs = 0, ce = 0
    switch (type) {
      case 'bold':   rep = `**${sel || 'bold text'}**`; cs = 2; ce = rep.length - 2; break
      case 'italic': rep = `*${sel || 'italic text'}*`; cs = 1; ce = rep.length - 1; break
      case 'code':   rep = `\`${sel || 'code'}\``; cs = 1; ce = rep.length - 1; break
      case 'h1':     rep = `# ${sel || 'Heading 1'}`; cs = 2; ce = rep.length; break
      case 'h2':     rep = `## ${sel || 'Heading 2'}`; cs = 3; ce = rep.length; break
      case 'h3':     rep = `### ${sel || 'Heading 3'}`; cs = 4; ce = rep.length; break
      case 'ul':     rep = `- ${sel || 'List item'}`; cs = 2; ce = rep.length; break
      case 'ol':     rep = `1. ${sel || 'List item'}`; cs = 3; ce = rep.length; break
      case 'quote':  rep = `> ${sel || 'Quote'}`; cs = 2; ce = rep.length; break
      case 'link': {
        const url = prompt('URL:', 'https://'); if (!url) return
        rep = `[${sel || 'Link text'}](${url})`; cs = 1; ce = (sel || 'Link text').length + 1; break
      }
    }
    const newBody = body.slice(0, s) + rep + body.slice(e)
    setBody(newBody)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + cs, s + ce) }, 0)
  }

  // ── EXPORT SINGLE ──
  const exportNote = () => {
    if (!currentNote) return
    const content = currentNote.encrypted
      ? (unlocked[currentId!] ?? '[Encrypted — unlock first]')
      : body
    const blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (title || 'note').replace(/[^a-z0-9]/gi, '_') + '.md'
    a.click()
  }

  // ── EXPORT ALL ──
  const exportAllNotes = () => {
    const lines: string[] = []
    notes.forEach(n => {
      lines.push(`# ${n.title || 'Untitled'}`)
      lines.push(`> Tags: ${n.tags.join(', ')}`)
      lines.push(`> Created: ${new Date(n.createdAt).toLocaleString()}`)
      lines.push('')
      if (n.encrypted) {
        lines.push('[Encrypted content]')
      } else {
        lines.push(n.body)
      }
      lines.push('\n---\n')
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `notevo-export-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
  }

  // ── IMPORT NOTES ──
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        let imported: LocalNote[] = []

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text)
          const arr = Array.isArray(parsed) ? parsed : [parsed]
          imported = arr.map((n: Partial<LocalNote>) => ({
            id: uid(),
            title: n.title || 'Untitled',
            body: n.body || '',
            tags: Array.isArray(n.tags) ? n.tags : [],
            encrypted: false,
            iv: null, salt: null, pinned: false,
            createdAt: n.createdAt || Date.now(),
            updatedAt: Date.now(),
          }))
        } else {
          // .md — split by ---
          const sections = text.split(/\n---\n/)
          imported = sections.filter(s => s.trim()).map(s => {
            const lines = s.trim().split('\n')
            const titleLine = lines.find(l => l.startsWith('# '))
            const title = titleLine ? titleLine.replace(/^# /, '') : 'Untitled'
            const body = lines.filter(l => !l.startsWith('> ')).join('\n').trim()
            return {
              id: uid(), title, body,
              tags: [], encrypted: false, iv: null, salt: null, pinned: false,
              createdAt: Date.now(), updatedAt: Date.now(),
            }
          })
        }

        if (imported.length === 0) throw new Error('empty')
        setNotes(prev => [...imported, ...prev])
        showToast(t('importSuccess', { n: imported.length }))
      } catch {
        showToast(t('importError'))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── ENCRYPT PANEL ──
  const openEncryptPanel = () => {
    setEpPass(''); setEpConfirm(''); setEpDecPass(''); setEpErr(''); setEpDecErr('')
    setEncryptOpen(true)
  }

  const doEncryptAction = async () => {
    if (!currentNote) return
    if (currentNote.encrypted) {
      if (!epDecPass) { setEpDecErr(t('enterPassErr')); return }
      try {
        const result = await decryptNote(epDecPass, currentNote.body, currentNote.iv!, currentNote.salt!)
        if (result.success && result.text) {
          setNotes(prev => prev.map(n => n.id === currentId
            ? { ...n, body: result.text, encrypted: false, iv: null, salt: null }
            : n
          ))
          setUnlocked(prev => { const next = { ...prev }; delete next[currentId!]; return next })
          setBody(result.text)
          setEncryptOpen(false)
        } else {
          setEpDecErr(t('incorrectPass'))
        }
      } catch { setEpDecErr(t('incorrectPass')) }
    } else {
      if (!epPass) { setEpErr(t('enterAPass')); return }
      if (epPass !== epConfirm) { setEpErr(t('passMismatch')); return }
      if (epPass.length < 4) { setEpErr(t('passShort')); return }
      const { ciphertext, iv, salt } = await encryptNote(epPass, body)
      setUnlocked(prev => ({ ...prev, [currentId!]: body }))
      setNotes(prev => prev.map(n => n.id === currentId
        ? { ...n, body: ciphertext, encrypted: true, iv, salt }
        : n
      ))
      setEncryptOpen(false)
    }
  }

  // ── FILTERED + SORTED NOTES ──
  const filteredNotes = notes
    .filter(n => {
      if (filterMode === 'encrypted' && !n.encrypted) return false
      if (filterMode === 'plain' && n.encrypted) return false
      if (searchQ) {
        const q = searchQ.toLowerCase()
        const titleMatch = n.title.toLowerCase().includes(q)
        const bodyMatch = !n.encrypted && n.body.toLowerCase().includes(q)
        if (!titleMatch && !bodyMatch) return false
      }
      return true
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      if (sortMode === 'updated') return b.updatedAt - a.updatedAt
      if (sortMode === 'created') return b.createdAt - a.createdAt
      if (sortMode === 'title') return (a.title || '').localeCompare(b.title || '')
      return 0
    })

  // ── KEYBOARD SHORTCUTS ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setEncryptOpen(false); setShowShortcuts(false); setShowLangMenu(false); setSortMenuOpen(false) }
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) setShowShortcuts(true)
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'n' || e.key === 'N') createNote()
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); document.getElementById('search-input')?.focus() }
      if (e.key === 'F' && e.shiftKey) setIsFullscreen(v => !v)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const showPreviewPane = viewMode === 'preview' || viewMode === 'split'
  const showEditorPane = viewMode === 'edit' || viewMode === 'split'

  const sortLabel = sortMode === 'updated' ? t('sortUpdated') : sortMode === 'created' ? t('sortCreated') : t('sortTitle')

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        :root,[data-theme="light"]{
          --bg:#f7f6f2;--surface:#ffffff;--surface-2:#f3f2ef;
          --border:rgba(0,0,0,.09);--divider:rgba(0,0,0,.07);
          --text:#1a1917;--muted:#6b6a67;--faint:#b0afa9;
          --primary:#01696f;--primary-h:#0c4e54;--primary-hi:#cedcd8;
          --danger:#a12c7b;--warn-bg:#fff8ed;--warn-border:#f5c97a;
          --shadow-sm:0 1px 3px rgba(0,0,0,.07);
          --shadow-md:0 4px 16px rgba(0,0,0,.09);
          --shadow-lg:0 12px 40px rgba(0,0,0,.13);
          --r:8px;--r-lg:12px;--r-xl:16px;
          --font-body:'Inter',sans-serif;
          --font-display:'Instrument Serif',Georgia,serif;
          --sidebar-w:260px;--topbar-h:52px;
        }
        [data-theme="dark"]{
          --bg:#141312;--surface:#1c1b19;--surface-2:#232220;
          --border:rgba(255,255,255,.08);--divider:rgba(255,255,255,.06);
          --text:#d8d7d3;--muted:#7a7976;--faint:#4a4946;
          --primary:#4f98a3;--primary-h:#3a7f8a;--primary-hi:#1f3436;
          --danger:#d163a7;--warn-bg:#2a2318;--warn-border:#7a5820;
          --shadow-sm:0 1px 3px rgba(0,0,0,.3);
          --shadow-md:0 4px 16px rgba(0,0,0,.4);
          --shadow-lg:0 12px 40px rgba(0,0,0,.5);
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden;-webkit-font-smoothing:antialiased}
        body{font-family:var(--font-body);background:var(--bg);color:var(--text)}
        button{cursor:pointer;background:none;border:none;font:inherit;color:inherit}
        input,textarea{font:inherit;color:inherit;background:none;border:none;outline:none}
        #notevo-root{display:flex;flex-direction:column;height:100vh;overflow:hidden}
        .icon-btn{width:34px;height:34px;border-radius:var(--r);display:flex;align-items:center;justify-content:center;color:var(--muted);transition:background .15s,color .15s;flex-shrink:0}
        .icon-btn:hover{background:var(--surface-2);color:var(--text)}
        .icon-btn.active-btn{color:var(--primary);background:var(--primary-hi)}
        .stab{font-size:12px;font-weight:500;padding:4px 10px;border-radius:99px;color:var(--muted);transition:background .15s,color .15s}
        .stab:hover{background:var(--surface-2);color:var(--text)}
        .stab.active{background:var(--primary-hi);color:var(--primary)}
        .note-item{padding:10px;border-radius:var(--r-lg);cursor:pointer;transition:background .12s;position:relative;margin-bottom:2px}
        .note-item:hover{background:var(--surface-2)}
        .note-item.active{background:var(--primary-hi)}
        .note-item.active .note-item-title{color:var(--primary)}
        .note-item-title{font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
        .note-item-meta{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted)}
        .note-item-excerpt{font-size:12px;color:var(--muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .fmt-btn{height:28px;padding:0 8px;border-radius:6px;font-size:12px;font-weight:600;color:var(--muted);display:flex;align-items:center;gap:4px;transition:background .12s,color .12s;white-space:nowrap}
        .fmt-btn:hover{background:var(--surface-2);color:var(--text)}
        .vtab{height:26px;padding:0 10px;font-size:11px;font-weight:600;color:var(--muted);transition:background .12s,color .12s;white-space:nowrap}
        .vtab.active{background:var(--primary-hi);color:var(--primary)}
        .tag-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:500;background:var(--primary-hi);color:var(--primary)}
        .field label{display:block;font-size:12px;font-weight:600;color:var(--muted);margin-bottom:5px;letter-spacing:.03em;text-transform:uppercase}
        .field input{width:100%;height:38px;border:1px solid var(--border);border-radius:var(--r);padding:0 12px;font-size:14px;background:var(--surface-2);color:var(--text);transition:border-color .15s,box-shadow .15s}
        .field input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(1,105,111,.12);outline:none}
        .btn-cancel{flex:1;height:36px;border-radius:var(--r);border:1px solid var(--border);font-size:13px;font-weight:600;color:var(--muted);transition:background .15s}
        .btn-cancel:hover{background:var(--surface-2);color:var(--text)}
        .btn-primary-action{flex:2;height:36px;border-radius:var(--r);background:var(--primary);color:#fff;font-size:13px;font-weight:600;transition:background .15s}
        .btn-primary-action:hover{background:var(--primary-h)}
        .btn-danger-action{flex:2;height:36px;border-radius:var(--r);background:var(--danger);color:#fff;font-size:13px;font-weight:600;transition:opacity .15s}
        .btn-danger-action:hover{opacity:.85}
        #md-textarea::-webkit-scrollbar,#preview-pane::-webkit-scrollbar,#note-list-scroll::-webkit-scrollbar{width:4px}
        #md-textarea::-webkit-scrollbar-thumb,#preview-pane::-webkit-scrollbar-thumb,#note-list-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px}
        #preview-pane h1{font-family:var(--font-display);font-size:26px;font-weight:400;margin:0 0 16px;color:var(--text);line-height:1.2}
        #preview-pane h2{font-size:18px;font-weight:700;margin:24px 0 10px;color:var(--text)}
        #preview-pane h3{font-size:15px;font-weight:700;margin:18px 0 8px;color:var(--text)}
        #preview-pane p{margin:0 0 14px;line-height:1.7;font-size:14px;color:var(--text)}
        #preview-pane ul,#preview-pane ol{margin:0 0 14px;padding-left:20px}
        #preview-pane li{margin-bottom:4px;font-size:14px;line-height:1.6}
        #preview-pane code{font-family:monospace;font-size:13px;background:var(--surface-2);padding:2px 5px;border-radius:4px;color:var(--primary)}
        #preview-pane pre{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;overflow-x:auto;margin:0 0 14px}
        #preview-pane pre code{background:none;padding:0;color:var(--text)}
        #preview-pane blockquote{border-left:3px solid var(--primary);padding:2px 0 2px 14px;margin:0 0 14px;color:var(--muted)}
        #preview-pane a{color:var(--primary);text-decoration:underline}
        #preview-pane hr{border:none;border-top:1px solid var(--border);margin:20px 0}
        #preview-pane img{max-width:100%;border-radius:var(--r)}
        #preview-pane table{width:100%;border-collapse:collapse;margin:0 0 14px;font-size:13px}
        #preview-pane th{background:var(--surface-2);font-weight:600;padding:8px 12px;border:1px solid var(--border);text-align:left}
        #preview-pane td{padding:7px 12px;border:1px solid var(--border)}
        .dropdown-menu{position:absolute;top:calc(100% + 6px);right:0;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);box-shadow:var(--shadow-md);min-width:160px;z-index:300;overflow:hidden}
        .dropdown-item{display:flex;align-items:center;gap:8px;padding:9px 14px;font-size:13px;color:var(--text);cursor:pointer;transition:background .12s;white-space:nowrap}
        .dropdown-item:hover{background:var(--surface-2)}
        .dropdown-item.active-item{color:var(--primary);font-weight:600}
        .kbd{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 5px;background:var(--surface-2);border:1px solid var(--border);border-radius:4px;font-size:11px;font-family:monospace;color:var(--muted)}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes toast-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:700px){
          #sidebar{position:fixed;inset:var(--topbar-h) 0 0 0;z-index:200;transform:translateX(-100%);transition:transform .2s;width:100%!important}
          #sidebar.mobile-open{transform:translateX(0)}
          #mobile-hamburger{display:flex!important}
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />

      {/* hidden import input */}
      <input ref={importInputRef} type="file" accept=".json,.md" style={{ display: 'none' }} onChange={handleImport} />

      <div id="notevo-root" style={isFullscreen ? { position: 'fixed', inset: 0, zIndex: 1000 } : {}}>

        {/* ── TOPBAR ── */}
        <header style={{ height: 'var(--topbar-h)', minHeight: 'var(--topbar-h)', display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', zIndex: 100, flexShrink: 0 }}>

          <button id="mobile-hamburger" className="icon-btn" style={{ display: 'none' }} onClick={() => setMobileSidebarOpen(v => !v)} title="Toggle sidebar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>

          <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-.3px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--primary)' }}>
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M7 8h10M7 12h7M7 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="19" cy="19" r="5" fill="var(--primary)" />
              <path d="M17 19l1.5 1.5L21 17" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('appName')}
          </a>

          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 2px' }} />

          {currentId && (
            <>
              <button className="icon-btn" onClick={openEncryptPanel} title={t('encryptNote')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </button>
              <button className={`icon-btn${currentNote?.pinned ? ' active-btn' : ''}`} onClick={togglePin} title={currentNote?.pinned ? t('unpin') : t('pin')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              </button>
              <button className="icon-btn" onClick={duplicateNote} title={t('duplicate')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              </button>
              <button className="icon-btn" onClick={exportNote} title={t('export')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              </button>
              <button className="icon-btn" onClick={deleteNote} title={t('delete')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
              </button>
            </>
          )}

          <div style={{ flex: 1 }} />

          {currentId && !isLocked && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: saveStatus === 'saved' ? 'var(--primary)' : 'var(--faint)', transition: 'color .2s', marginRight: 4 }}>
              {saveStatus === 'saved'
                ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> {t('saved')}</>
                : saveStatus === 'saving'
                ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin .8s linear infinite' }}><circle cx="12" cy="12" r="9" /></svg> {t('saving')}</>
                : null
              }
            </span>
          )}

          {/* Export all */}
          <button className="icon-btn" onClick={exportAllNotes} title={t('exportAll')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /><line x1="4" y1="3" x2="8" y2="3" /></svg>
          </button>

          {/* Import */}
          <button className="icon-btn" onClick={() => importInputRef.current?.click()} title={t('importNotes')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          </button>

          {/* Fullscreen */}
          <button className={`icon-btn${isFullscreen ? ' active-btn' : ''}`} onClick={() => setIsFullscreen(v => !v)} title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}>
            {isFullscreen
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
            }
          </button>

          {/* Shortcuts help */}
          <button className="icon-btn" onClick={() => setShowShortcuts(true)} title={t('shortcuts')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </button>

          {/* Language picker */}
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={() => setShowLangMenu(v => !v)} title={t('language')} style={{ fontSize: 13, width: 'auto', padding: '0 8px', gap: 4, display: 'flex', alignItems: 'center' }}>
              🌍 <span style={{ fontSize: 11, fontWeight: 600 }}>{locale.toUpperCase()}</span>
            </button>
            {showLangMenu && (
              <div className="dropdown-menu" style={{ minWidth: 140 }}>
                {(Object.entries(LOCALES) as [Locale, string][]).map(([code, label]) => (
                  <div key={code} className={`dropdown-item${locale === code ? ' active-item' : ''}`} onClick={() => setAndSaveLocale(code)}>
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="icon-btn" onClick={toggleTheme} title={t('darkMode')}>
            {theme === 'dark'
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            }
          </button>

          <button className="icon-btn" onClick={handleSignOut} title={t('signOut')} style={{ marginLeft: 2 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </header>

        {/* ── APP BODY ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* ── SIDEBAR ── */}
          <aside id="sidebar" className={mobileSidebarOpen ? 'mobile-open' : ''}
            style={{ width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '0 10px', height: 32 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)', flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input id="search-input" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={t('search')} style={{ flex: 1, fontSize: 13, background: 'none', border: 'none', outline: 'none', color: 'var(--text)' }} />
              </div>
              <button className="icon-btn" onClick={createNote} title={t('newNote')} style={{ background: 'var(--primary)', color: '#fff', borderRadius: 'var(--r)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>

            {/* filter tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              {(['all', 'encrypted', 'plain'] as FilterMode[]).map(f => (
                <button key={f} className={`stab${filterMode === f ? ' active' : ''}`} onClick={() => setFilterMode(f)}>
                  {t(f)}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <div style={{ position: 'relative' }}>
                <button className="icon-btn" style={{ width: 'auto', padding: '0 8px', fontSize: 11, gap: 4 }} onClick={() => setSortMenuOpen(v => !v)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="9" y1="18" x2="15" y2="18" /></svg>
                  <span style={{ fontWeight: 600 }}>{sortLabel}</span>
                </button>
                {sortMenuOpen && (
                  <div className="dropdown-menu">
                    {(['updated', 'created', 'title'] as SortMode[]).map(s => (
                      <div key={s} className={`dropdown-item${sortMode === s ? ' active-item' : ''}`} onClick={() => { setSortMode(s); setSortMenuOpen(false) }}>
                        {t('sort' + s.charAt(0).toUpperCase() + s.slice(1))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* note list */}
            <div id="note-list-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, color: 'var(--muted)', fontSize: 13 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin .8s linear infinite', marginRight: 8 }}><circle cx="12" cy="12" r="9" /></svg>
                  Loading…
                </div>
              ) : filteredNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📝</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{t('noNotes')}</div>
                  <div style={{ fontSize: 12 }}>{t('noNotesSub')}</div>
                </div>
              ) : filteredNotes.map(note => (
                <div
                  key={note.id}
                  className={`note-item${note.id === currentId ? ' active' : ''}`}
                  onClick={() => selectNote(note.id)}
                >
                  <div className="note-item-title">
                    {note.pinned && <span style={{ marginRight: 4 }}>📌</span>}
                    {note.encrypted && <span style={{ marginRight: 4 }}>🔐</span>}
                    {escHtml(note.title || t('untitled'))}
                  </div>
                  <div className="note-item-meta">
                    <span>{fmtDate(note.updatedAt)}</span>
                    {note.tags.length > 0 && <span style={{ color: 'var(--primary)' }}>#{note.tags[0]}</span>}
                  </div>
                  {!note.encrypted && note.body && (
                    <div className="note-item-excerpt">{note.body.replace(/[#*`>]/g, '').slice(0, 60)}</div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* ── EDITOR AREA ── */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            {!currentId ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: 16, opacity: 0.4 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t('noSelected')}</div>
                <div style={{ fontSize: 13 }}>{t('noSelectedSub')}</div>
              </div>
            ) : isLocked ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 16, color: 'var(--primary)' }}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{t('noteEncryptedTitle')}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>{t('noteEncryptedDesc')}</div>
                <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="password"
                    value={unlockPass}
                    onChange={e => setUnlockPass(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                    placeholder={t('enterPass')}
                    style={{ height: 40, border: `1px solid ${unlockErr ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 'var(--r)', padding: '0 14px', fontSize: 14, background: 'var(--surface-2)', color: 'var(--text)' }}
                  />
                  {unlockErr && <div style={{ fontSize: 12, color: 'var(--danger)' }}>{unlockErr}</div>}
                  <button onClick={handleUnlock} style={{ height: 40, borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 600 }}>{t('unlockNote')}</button>
                </div>
              </div>
            ) : (
              <>
                {/* title + tags row */}
                <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
                  <input
                    id="note-title-input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t('noteTitle')}
                    style={{ width: '100%', fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)', background: 'none', border: 'none', outline: 'none', marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    {tags.map(tag => (
                      <span key={tag} className="tag-chip">
                        #{tag}
                        <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} style={{ color: 'inherit', opacity: 0.6, fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                          e.preventDefault()
                          const newTag = tagInput.trim().replace(/,/g, '')
                          if (newTag && !tags.includes(newTag)) setTags(prev => [...prev, newTag])
                          setTagInput('')
                        }
                      }}
                      placeholder={tags.length === 0 ? t('addTag') : ''}
                      style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', outline: 'none', minWidth: 80 }}
                    />
                  </div>
                </div>

                {/* format toolbar + view toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', flexShrink: 0 }}>
                  {(['bold','italic','code','h1','h2','h3','ul','ol','quote','link'] as const).map(f => (
                    <button key={f} className="fmt-btn" onClick={() => fmt(f)}>{t(f)}</button>
                  ))}
                  <div style={{ flex: 1 }} />
                  <div style={{ display: 'flex', gap: 2, background: 'var(--surface-2)', borderRadius: 'var(--r)', padding: 2 }}>
                    {(['edit','split','preview'] as ViewMode[]).map(v => (
                      <button key={v} className={`vtab${viewMode === v ? ' active' : ''}`} onClick={() => setViewMode(v)} style={{ borderRadius: 6 }}>{t(v)}</button>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--faint)', marginLeft: 8 }}>
                    {wordCount} {wordCount === 1 ? t('word') : t('words')} · {charCount} {charCount === 1 ? t('char') : t('chars')}
                  </div>
                </div>

                {/* editor + preview */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
                  {showEditorPane && (
                    <textarea
                      id="md-textarea"
                      ref={textareaRef}
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      placeholder={t('startWriting')}
                      spellCheck
                      style={{
                        flex: 1, resize: 'none', padding: '16px 20px', fontSize: 14, lineHeight: 1.7,
                        fontFamily: 'var(--font-body)', color: 'var(--text)', background: 'var(--bg)',
                        border: 'none', outline: 'none', overflowY: 'auto',
                        borderRight: viewMode === 'split' ? '1px solid var(--border)' : 'none',
                      }}
                    />
                  )}
                  {showPreviewPane && (
                    <div
                      id="preview-pane"
                      style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', background: 'var(--surface)' }}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
                    />
                  )}
                </div>
              </>
            )}
          </main>
        </div>

        {/* ── ENCRYPT MODAL ── */}
        {encryptOpen && currentNote && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEncryptOpen(false)}>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-xl)', padding: 28, width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                {currentNote.encrypted ? t('decryptNote') : t('encryptNote')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                {currentNote.encrypted ? t('decryptDesc') : t('encryptDesc')}
              </div>

              {currentNote.encrypted ? (
                <div className="field" style={{ marginBottom: 16 }}>
                  <label>{t('password')}</label>
                  <input type="password" value={epDecPass} onChange={e => setEpDecPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && doEncryptAction()} placeholder={t('enterPass')} />
                  {epDecErr && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>{epDecErr}</div>}
                </div>
              ) : (
                <>
                  <div style={{ background: 'var(--warn-bg)', border: '1px solid var(--warn-border)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
                    ⚠️ {t('warnNoRecover')}
                  </div>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label>{t('password')}</label>
                    <input type="password" value={epPass} onChange={e => setEpPass(e.target.value)} placeholder={t('choosePass')} />
                  </div>
                  <div className="field" style={{ marginBottom: 16 }}>
                    <label>{t('confirmPassword')}</label>
                    <input type="password" value={epConfirm} onChange={e => setEpConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && doEncryptAction()} placeholder={t('confirmPassPh')} />
                  </div>
                  {epErr && <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 12 }}>{epErr}</div>}
                </>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-cancel" onClick={() => setEncryptOpen(false)}>{t('cancel')}</button>
                <button className={currentNote.encrypted ? 'btn-danger-action' : 'btn-primary-action'} onClick={doEncryptAction}>
                  {currentNote.encrypted ? t('decryptNote') : t('encryptNote')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SHORTCUTS MODAL ── */}
        {showShortcuts && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowShortcuts(false)}>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-xl)', padding: 28, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>{t('shortcuts')}</div>
              {[
                ['N', 'New note'],
                ['Ctrl+F', 'Search'],
                ['Shift+F', 'Fullscreen'],
                ['?', 'Show shortcuts'],
                ['Esc', 'Close panels'],
              ].map(([key, desc]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--divider)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text)' }}>{desc}</span>
                  <span className="kbd">{key}</span>
                </div>
              ))}
              <button onClick={() => setShowShortcuts(false)} style={{ marginTop: 20, width: '100%', height: 36, borderRadius: 'var(--r)', background: 'var(--surface-2)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{t('shortcutsClose')}</button>
            </div>
          </div>
        )}

        {/* ── TOAST ── */}
        {toast && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--text)', color: 'var(--bg)', padding: '10px 20px', borderRadius: 'var(--r-xl)', fontSize: 13, fontWeight: 600, boxShadow: 'var(--shadow-lg)', zIndex: 600, animation: 'toast-in .2s ease', whiteSpace: 'nowrap' }}>
            {toast}
          </div>
        )}

      </div>
    </>
  )
}
