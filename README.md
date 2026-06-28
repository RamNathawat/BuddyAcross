# BuddyAcross

> Hyperlocal task marketplace — connecting Taskers with trusted local Buddies.

## Tech Stack

| Layer       | Technology                      |
| ----------- | ------------------------------- |
| Frontend    | Next.js 15, Tailwind CSS, shadcn/ui |
| Backend     | Node.js, Express, TypeScript    |
| Database    | PostgreSQL (Supabase)           |
| ORM         | Drizzle                         |
| Auth        | Supabase Auth (Phone OTP)       |
| Storage     | Cloudinary                      |
| Realtime    | Supabase Realtime               |
| Deployment  | Vercel (web) + Railway (api)    |

## Getting Started

### Prerequisites

- Node.js >= 20
- npm
- Supabase account
- Cloudinary account

### Setup

```bash
# Clone and install
npm install

# Copy environment variables
cp .env.example .env
# Fill in your values in .env

# Start development
npm run dev:web   # Frontend on :3000
npm run dev:api   # Backend on :4000
```

### Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev:web` | Start Next.js dev server     |
| `npm run dev:api` | Start Express dev server     |
| `npm run build`   | Build all workspaces         |
| `npm run lint`    | Lint frontend                |
| `npm run format`  | Format all files             |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate`  | Run migrations             |
| `npm run db:studio`   | Open Drizzle Studio        |

## Project Structure

```
buddyacross/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/
│   └── shared/       # Shared types, constants, utilities
└── package.json      # Root workspace
```
Ram Nathawat