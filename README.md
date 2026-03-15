# A La Carte

A culinary consulting platform for managing projects with restaurants, recipes, menus, ingredient costs, and client collaboration.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API routes, Server Actions
- **Database**: PostgreSQL, Prisma ORM
- **Auth**: NextAuth.js v5 (Auth.js)
- **State**: React Query, Server Components

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

1. Clone and install dependencies:

```bash
cd a-la-carte
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Configure `.env`:

- `DATABASE_URL`: PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/a_la_carte`)
- `AUTH_SECRET`: Generate with `openssl rand -base64 32` (or `NEXTAUTH_SECRET` for NextAuth v5)

4. Run database migrations:

```bash
npm run db:migrate
```

5. Seed demo data:

```bash
npm run db:seed
```

6. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

After seeding:

- **Admin**: `admin@alacarte.com` / `admin123`
- **Client**: `client@bistro.com` / `admin123`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema (no migrations) |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## Docker

```bash
docker build -t a-la-carte .
docker run -p 3000:3000 --env-file .env a-la-carte
```

Note: The database must be available at `DATABASE_URL`. Use Docker Compose for a full stack.

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register
│   ├── (dashboard)/     # Protected app
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── recipes/
│   │   ├── ingredients/
│   │   └── menus/
│   └── api/             # API routes
├── components/
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── recipe-cost.ts
└── middleware.ts
```

## Features

- **Projects**: Manage consulting engagements with organizations
- **Recipes**: Structured recipes with ingredients, quantities, prep time
- **Ingredients**: Cost database with supplier info
- **Menus**: Build menus from recipes, auto-calculate food cost and profit margin
- **Tasks**: Project task management with assignees
- **Files**: Project file storage (S3 integration ready)
- **Messages**: Per-project communication thread

## Food Cost Formulas

- **Recipe cost**: `sum(ingredient quantity × cost per unit)`
- **Food cost %**: `recipe cost / selling price × 100`
- **Profit margin**: `selling price - recipe cost`
