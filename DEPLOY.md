# Deploy A La Carte to the Web

Deploy your app in ~10 minutes using **Vercel** (hosting) + **Neon** (database). Both have free tiers.

---

## Quick Deploy (from Terminal)

If you have the code locally and want to deploy without GitHub:

```bash
cd a-la-carte

# 1. Log in to Vercel (opens browser)
npx vercel login

# 2. Create a Neon database at neon.tech, copy the connection string

# 3. Deploy (use project name or-barnea-alacarte when prompted)
npx vercel deploy --prod
```

Then in [Vercel Dashboard](https://vercel.com/dashboard) → your project → **Settings** → **Environment Variables**, add:
- `DATABASE_URL` = your Neon connection string
- `AUTH_SECRET` = run `openssl rand -base64 32`
- `NEXTAUTH_URL` = `https://or-barnea-alacarte.vercel.app`

Redeploy, then run:
```bash
DATABASE_URL="your-neon-url" npx prisma migrate deploy
DATABASE_URL="your-neon-url" npx prisma db seed
```

---

## Full Deploy (with GitHub)

## Step 1: Create a Neon Database (2 min)

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Click **New Project** → name it `a-la-carte` → **Create Project**
3. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)

## Step 2: Push Code to GitHub (2 min)

1. Create a new repo at [github.com/new](https://github.com/new)
2. In your terminal:

```bash
cd a-la-carte
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 3: Deploy to Vercel (3 min)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Set **Project Name** to `or-barnea-alacarte` (so your URL is `https://or-barnea-alacarte.vercel.app`)
5. Before deploying, add these **Environment Variables**:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon connection string from Step 1 |
| `AUTH_SECRET` | Run `openssl rand -base64 32` and paste the output |
| `NEXTAUTH_URL` | `https://or-barnea-alacarte.vercel.app` |

6. Click **Deploy**

## Step 4: Run Database Migrations (1 min)

After the first deploy, run migrations to create tables:

```bash
# Set your DATABASE_URL first (or use the one from Neon)
export DATABASE_URL="your-neon-connection-string"
npx prisma migrate deploy
```

Then seed demo data (optional):

```bash
npx prisma db seed
```

## Step 5: Share Your Link

Your app will be live at: **https://or-barnea-alacarte.vercel.app**

Demo accounts (after seeding):
- Admin: `admin@alacarte.com` / `admin123`
- Client: `client@bistro.com` / `admin123`

---

## Alternative: Railway (All-in-One)

[Railway](https://railway.app) offers app + database in one place:

1. Sign up at railway.app
2. **New Project** → **Deploy from GitHub** (connect your repo)
3. Add **PostgreSQL** plugin (Railway creates `DATABASE_URL` automatically)
4. Add env vars: `AUTH_SECRET`, `NEXTAUTH_URL` (your Railway URL)
5. Deploy

Run migrations from your machine:
```bash
DATABASE_URL="your-railway-postgres-url" npx prisma migrate deploy
DATABASE_URL="your-railway-postgres-url" npx prisma db seed
```
