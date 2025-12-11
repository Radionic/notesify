# Notesify

![Notesify](public/demo.jpg?raw=true)

<div align="center">
Notesify is a cross-platform, feature-rich, AI-powered notes taking app. An open source alternative to NotebookLM.
</div>

## Getting Started

[Try Notesify online here!](https://notesify.ai)

Desktop/mobile apps will be available when the app is more stable.

## Development

```bash
cp .env.example .env # Update your .env file with your environment variables

pnpm install
pnpm dev
```

```bash
# For converting PPTX/DOCX to PDF using Gotenberg
cd server
docker compose up -d
```

```bash
# Update migration file after modifying schema
pnpm db:generate
```

## Tech Stack

- Web framework: [TanStack Start](https://tanstack.com/start), [Vite](https://vitejs.dev), [React](https://react.dev)
- Routing: [TanStack Router](https://tanstack.com/router)
- Query: [TanStack Query](https://tanstack.com/query)
- UI: [Shadcn UI](https://ui.shadcn.com), [Tailwind CSS](https://tailwindcss.com)
- Auth: [Better Auth](https://www.better-auth.com)
- State management: [Jotai](https://jotai.org)
- PDF viewer: [PDF.js](https://mozilla.github.io/pdf.js)
- AI: [AI SDK](https://sdk.vercel.ai)
- Database: [Neon](https://neon.com), [Drizzle ORM](https://orm.drizzle.team), [Cloudflare Vectorize](https://developers.cloudflare.com/vectorize)
