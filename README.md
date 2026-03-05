# RentStack

A multi-tenant property management SaaS built with Next.js 16, Prisma 7, and PostgreSQL.

## Tech Stack

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Database** — PostgreSQL via Prisma 7
- **Auth** — JWT (bcryptjs + jsonwebtoken), HTTP-only cookies
- **Styling** — Tailwind CSS + shadcn/ui
- **Payments** — Stripe (webhooks ready)
- **Email** — Email service (pluggable)
- **Storage** — Storage service (pluggable)

## Features

- Multi-tenant architecture — each landlord/company gets their own organization
- Role-based access control — `admin`, `manager`, `tenant`
- Property & unit management
- Tenant and lease tracking
- Rent payment tracking
- Maintenance request workflow
- Expense tracking per property
- Subscription/billing logic per organization

## Project Structure

```
app/
├── (marketing)/        → Public pages (/, /pricing)
├── (auth)/             → Login & Register
├── (dashboard)/        → Protected landlord dashboard
│   ├── dashboard/      → Overview
│   ├── properties/
│   ├── tenants/
│   ├── leases/
│   ├── payments/
│   └── maintenance/
└── api/                → API routes (auth, properties, tenants, leases, payments, webhooks)

features/               → Feature modules (components + server actions + types)
lib/                    → auth.ts, session.ts, permission.ts
db/                     → Prisma client singleton
proxy/                  → Auth & role middleware
services/               → Stripe, email, storage
prisma/                 → schema.prisma + migrations
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/rental_saas"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

10 models: `Organization`, `User`, `Subscription`, `Property`, `Unit`, `Tenant`, `Lease`, `Payment`, `MaintenanceRequest`, `Expense`.

To explore the database visually:

```bash
npx prisma studio
```

## Auth Flow

```
POST /api/auth/register  →  create org + admin user  →  set JWT cookie
POST /api/auth/login     →  verify credentials        →  set JWT cookie
POST /api/auth/logout    →  clear cookie
GET  /dashboard/*        →  proxy validates JWT        →  forwards x-user-id, x-user-role
GET  /dashboard/maintenance → role check (admin only)
```

## Deployment

The easiest way to deploy is via [Vercel](https://vercel.com). Make sure to set all environment variables in your project settings.

```bash
vercel deploy
```
