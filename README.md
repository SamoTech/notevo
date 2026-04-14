<div align="center">

![Notevo](docs/assets/banner.svg)

<img src="public/logo.svg" alt="Notevo Logo" width="64" height="64" />

# Notevo

**Private encrypted notes — free forever.**

> The open-source, zero-knowledge successor to Laverna.  
> Built for 2026 with Next.js 15, TypeScript & AES-256-GCM encryption.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-notevo--io.vercel.app-4f98a3?style=flat-square&logo=vercel)](https://notevo-io.vercel.app)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy%20to-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSamoTech%2Fnotevo)
[![MIT License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Open Issues](https://img.shields.io/github/issues/SamoTech/notevo?style=flat-square)](https://github.com/SamoTech/notevo/issues)
[![Stars](https://img.shields.io/github/stars/SamoTech/notevo?style=flat-square)](https://github.com/SamoTech/notevo/stargazers)

</div>

---

<!-- DEVLENS:START -->
![DevLens Health](https://img.shields.io/badge/DevLens%20Health-82%2F100-brightgreen?style=flat-square&logo=github) **Overall health: 82/100** — *Last updated: 2026-04-14*

| Dimension | Progress | Score | Weight |
|---|---|---|---|
| 📝 **README Quality** | `███████░░░` | ![72](https://img.shields.io/badge/72-green?style=flat-square) | 20% |
| 🔥 **Commit Activity** | `██████████` | ![100](https://img.shields.io/badge/100-brightgreen?style=flat-square) | 20% |
| 🌿 **Repo Freshness** | `██████████` | ![100](https://img.shields.io/badge/100-brightgreen?style=flat-square) | 15% |
| 📚 **Documentation** | `█████░░░░░` | ![48](https://img.shields.io/badge/48-yellow?style=flat-square) | 15% |
| ⚙️ **CI/CD Setup** | `██████████` | ![100](https://img.shields.io/badge/100-brightgreen?style=flat-square) | 15% |
| 🎯 **Issue Response** | `██████████` | ![100](https://img.shields.io/badge/100-brightgreen?style=flat-square) | 10% |
| ⭐ **Community Signal** | `█░░░░░░░░░` | ![10](https://img.shields.io/badge/10-red?style=flat-square) | 5% |

Improving the documentation score from its current 48/100 can significantly boost the overall health score of the DevLens repository.
<!-- DEVLENS:END -->

---

## Why Notevo?

[Laverna](https://github.com/Laverna/laverna) was one of the best open-source encrypted note apps — 10k+ stars, beloved by the privacy community. It hasn't been updated since 2019 and has [438 open issues](https://github.com/Laverna/laverna/issues). Notevo is its spiritual successor: same zero-knowledge encryption philosophy, rebuilt for 2026 with a modern stack, active maintenance, and a promise to stay **free forever**.

**No account required. No servers storing your notes. No ads. No paywalls. Ever.**

---

## Features

| | Feature | Details |
|---|---|---|
| 🔐 | **AES-256-GCM Encryption** | PBKDF2 key derivation (100k iterations). Password never leaves your browser. |
| 📝 | **Full Markdown Editor** | Live split-pane preview. Bold, italic, headings, code, links — full syntax. |
| 🔖 | **Tags & Notebooks** | Organize notes with tags. Instant filter and search across all content. |
| 📦 | **Import Laverna Backups** | Paste your old Laverna JSON export — all notes migrate in one click. |
| ☁️ | **Optional Cloud Sync** | Supabase-backed sync (encrypted). Access from any browser. |
| 🌙 | **Dark Mode** | System preference respected + manual toggle in the header. |
| 📤 | **Export to Markdown** | Export any note or all notes as `.md` files. Your data, always portable. |
| ⌨️ | **Keyboard Shortcuts** | `N` new note · `Ctrl+F` search · `Esc` close panels. |
| 🛡️ | **Privacy First** | No analytics, no trackers, no ads. |
| 🛠️ | **Self-Hostable** | MIT license. Deploy to Vercel, Netlify, or your own server in minutes. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + CSS Custom Properties |
| Auth | Supabase Auth (email/password) |
| Database | Supabase Postgres + Row Level Security |
| Encryption | Web Crypto API — AES-256-GCM + PBKDF2 |
| Deployment | Vercel (auto-deploy from `main`) |

---

## Quick Start

```bash
git clone https://github.com/SamoTech/notevo
cd notevo
npm install
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — that's it.

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSamoTech%2Fnotevo)

---

## License

**MIT** — fork it, self-host it, build on it, own it.

---

<div align="center">

Built with ❤️ by [Ossama Hashim](https://github.com/SamoTech) · [notevo-io.vercel.app](https://notevo-io.vercel.app)

*Free forever. Private by design.*

</div>
