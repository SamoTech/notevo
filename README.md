# Notevo

> Private encrypted note-taking. The open-source Laverna successor.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSamoTech%2Fnotevo)

**Live demo:** Coming soon on Vercel

---

## Why Notevo?

[Laverna](https://github.com/Laverna/laverna) was one of the best open-source encrypted note apps — 10k+ stars, beloved by the privacy community. It hasn't been updated since 2019 and has [438 open issues](https://github.com/Laverna/laverna/issues). Notevo is its spiritual successor: same zero-knowledge encryption philosophy, rebuilt for 2026 with Next.js 15, TypeScript, and Supabase.

---

## Features

- 🔐 **AES-GCM encryption** — PBKDF2 key derivation (100k iterations). Password never leaves your device
- 📝 **Full Markdown** — live preview, headings, bold, italic, code
- 🔖 **Notebooks & tags** — organize and filter your notes
- 📦 **Import Laverna backups** — paste your old JSON export, all notes migrate instantly
- ☁️ **Sync via Supabase** — access from any browser, no native app needed
- 🌙 **Dark mode** — system preference + manual toggle
- 🛠 **Self-hostable** — MIT license, deploy anywhere

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | CSS Custom Properties (Nexus Design System) |
| Auth | Supabase Auth (email/password) |
| Database | Supabase Postgres + RLS |
| Encryption | Web Crypto API (AES-GCM + PBKDF2) |
| Deployment | Vercel |

---

## Quick start

```bash
git clone https://github.com/SamoTech/notevo
cd notevo
npm install
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database setup

All migrations are in Supabase. If self-hosting, run:

```sql
-- See supabase/migrations/ for full schema
-- Or use the Supabase dashboard to apply migrations
```

---

## Contributing

PRs welcome. If you're migrating from Laverna, open an issue — we want to make that path seamless.

---

## License

MIT — fork it, self-host it, own it.
