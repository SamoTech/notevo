# Notevo 🔐

> Private encrypted notes — spiritual successor to [Laverna](https://github.com/Laverna/laverna)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-green?logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Notevo is a **zero-knowledge, end-to-end encrypted** note-taking app. Your notes are encrypted in the browser using AES-256-GCM before they ever leave your device. Not even the server can read them.

## ✨ Features

- 🔐 **AES-256-GCM encryption** — Web Crypto API, client-side only
- 🔑 **PBKDF2 key derivation** — 100,000 iterations, SHA-256
- 📝 **Markdown editor** — live split-pane preview
- 🔄 **Multi-device sync** — Supabase Realtime
- 🏷️ **Tags** — organize notes with custom tags
- 📤 **Laverna import** — migrate your `.json` backups
- 📱 **PWA** — works offline, installable
- 🌙 **Dark mode** — system preference + manual toggle

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (Postgres + Auth + Realtime) |
| Encryption | Web Crypto API (AES-GCM + PBKDF2) |
| Deploy | Vercel |

## 🚀 Getting Started

### 1. Clone
```bash
git clone https://github.com/SamoTech/notevo.git
cd notevo
pnpm install
```

### 2. Set up Supabase

Create a project at [supabase.com](https://supabase.com) and run the schema from `supabase/schema.sql`.

### 3. Environment
```bash
cp .env.example .env.local
# Fill in your Supabase URL and anon key
```

### 4. Run
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🗄️ Database Schema

See [`supabase/schema.sql`](supabase/schema.sql) — copy-paste into Supabase SQL Editor.

## 🔐 Encryption Model

```
Password → PBKDF2 (100k iterations) → AES-256-GCM key
Plaintext + IV → AES-GCM encrypt → Ciphertext
Ciphertext + IV + Salt → Stored in Supabase
```

The password **never leaves the browser**. Supabase stores only encrypted ciphertext, the IV, and the salt — all useless without your password.

## 📦 Project Structure

```
notevo/
├── lib/
│   ├── crypto.ts         # AES-GCM + PBKDF2
│   └── supabase.ts       # Supabase client helpers
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing
│   │   ├── login/page.tsx     # Auth
│   │   └── dashboard/
│   │       ├── page.tsx       # Notes list
│   │       └── new/page.tsx   # Note editor
│   └── components/
│       ├── NoteCard.tsx
│       ├── NoteEditor.tsx
│       └── Sidebar.tsx
├── supabase/
│   └── schema.sql
└── middleware.ts
```

## 🗺️ Roadmap

- [x] Foundation: Auth + encrypted CRUD
- [ ] Markdown editor with split preview
- [ ] Tags and notebooks
- [ ] Laverna import
- [ ] PWA + offline mode
- [ ] AI note summarizer (Groq)
- [ ] Share encrypted note via link

## 🤝 Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

MIT — see [LICENSE](LICENSE).

---

*Inspired by [Laverna](https://github.com/Laverna/laverna) (archived 2019). Built for 2026.*
