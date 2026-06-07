# Lucky Services Platform

Production rebuild of Lucky Services Centre as a full service-operations platform.

The public website preserves the existing Lucky Services Centre design language, while the foundation moves to:

- Next.js App Router
- TypeScript
- Supabase Postgres/Auth/Realtime/Storage
- Tailwind CSS
- shadcn/Radix-ready UI primitives
- Meta Pixel/GA-ready tracking architecture

## Product Flow

```txt
Customer submits booking
→ booking saved as pending
→ WhatsApp confirmation opens
→ admin sees booking in dashboard
→ admin confirms details
→ admin assigns technician
→ technician sees assigned job
→ technician updates status
→ admin tracks lifecycle and history
```

## Important Directories

```txt
src/app/                    Next.js routes
src/app/(marketing)         Public website routes are represented by root/service/area pages
src/app/admin/              Admin dashboard and booking management
src/app/technician/         Technician job dashboard
src/app/api/bookings/       Booking creation endpoint
src/components/marketing/   Public site design components
src/components/booking/     Booking form and conversion flow
src/data/                   Central business identity and service catalog
src/features/bookings/      Booking domain helpers
src/lib/                    Supabase, SEO, validation, tracking helpers
supabase/migrations/        Database schema
supabase/seed.sql           Initial category and area seed data
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill Supabase keys in `.env.local`.

4. Run the database migration in Supabase:

```bash
supabase db push
```

5. Start development:

```bash
npm run dev
```

## Verification

In this Codex environment, `node` exists but `npm`, `pnpm`, and `yarn` are unavailable, so dependency install and `next build` could not be executed here.

Once a package manager is available, run:

```bash
npm run typecheck
npm run build
```

## Current Status

Implemented:

- Next.js app foundation
- Preserved public homepage design
- Service pages
- Area SEO page pattern
- Booking form with WhatsApp handoff
- Booking API route
- Email/password staff login
- Protected admin and technician route groups
- Admin dashboard shell
- Admin booking list/detail surfaces
- Admin confirm/cancel/assign booking actions
- Admin technician list
- Admin-created technician accounts
- Technician dashboard and job detail surfaces
- Technician accept/on-the-way/complete actions
- Supabase operations schema

Next implementation steps:

- Install dependencies and run the Next.js build
- Create Supabase project and run migrations
- Create first admin profile
- Add realtime subscriptions for new bookings and assigned jobs
- Add notification worker for WhatsApp/SMS/email updates
- Add Playwright tests after dependencies are installed

See `PRODUCTION_NOTES.md` for the first admin setup and deployment checklist.
