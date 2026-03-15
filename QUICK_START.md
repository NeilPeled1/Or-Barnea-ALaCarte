# Fix 404 – Deploy Your App

The 404 error means the app isn’t deployed yet. Follow these steps:

## 1. Log in to Vercel

In your terminal:

```bash
cd a-la-carte
npx vercel login
```

A browser window will open. Sign in with GitHub, Google, or email.

## 2. Create a database (Neon)

1. Open [neon.tech](https://neon.tech) and sign up (free)
2. Create a new project
3. Copy the **connection string** (PostgreSQL URL)

## 3. Deploy

```bash
npx vercel deploy --prod
```

When asked for a project name, use: **or-barnea-alacarte**

## 4. Add environment variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Open your project → **Settings** → **Environment Variables**
3. Add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `AUTH_SECRET` | Run `openssl rand -base64 32` and paste the result |
| `NEXTAUTH_URL` | `https://or-barnea-alacarte.vercel.app` |

4. Go to **Deployments** → ** Redeploy** (latest deployment)

## 5. Run migrations

```bash
DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
DATABASE_URL="your-neon-connection-string" npx prisma db seed
```

## 6. Done

Your app should be live at: **https://or-barnea-alacarte.vercel.app**

Demo logins:
- Admin: `admin@alacarte.com` / `admin123`
- Client: `client@bistro.com` / `admin123`
