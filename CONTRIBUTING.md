# Contributing to Notevo

Thanks for your interest in contributing! 🎉

## Getting Started

1. Fork the repository
2. Clone: `git clone https://github.com/YOUR_USERNAME/notevo.git`
3. Install: `pnpm install`
4. Create `.env.local` from `.env.example`
5. Run: `pnpm dev`

## Roadmap / Good First Issues

- [ ] Add Markdown preview with `marked` + `DOMPurify`
- [ ] Laverna JSON import
- [ ] PWA service worker
- [ ] Tag filtering in dashboard
- [ ] Export notes as `.md` files
- [ ] AI note summarizer (Groq API)

## Code Style

- TypeScript strict mode
- ESLint + Next.js rules
- Tailwind for styling
- No unnecessary dependencies

## Pull Request Guidelines

- One feature per PR
- Include TypeScript types
- Test locally before submitting
- Add a clear description

## Security

Never log or transmit plaintext note content. Encryption happens in `lib/crypto.ts` — treat it as security-critical code.
