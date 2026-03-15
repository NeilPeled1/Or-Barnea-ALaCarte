#!/bin/bash
# Deploy A La Carte to Vercel
# Run: ./scripts/deploy.sh

set -e

echo "=== A La Carte Deployment ==="
echo ""

# Check if logged in to Vercel
if ! npx vercel whoami &>/dev/null; then
  echo "1. Logging in to Vercel (browser will open)..."
  npx vercel login
  echo ""
fi

echo "2. Deploying to Vercel..."
npx vercel deploy --prod --yes

echo ""
echo "=== Next steps ==="
echo "1. Go to https://vercel.com/dashboard"
echo "2. Open your project → Settings → Environment Variables"
echo "3. Add these variables:"
echo "   - DATABASE_URL (from neon.tech)"
echo "   - AUTH_SECRET (run: openssl rand -base64 32)"
echo "   - NEXTAUTH_URL (https://or-barnea-alacarte.vercel.app)"
echo "4. Redeploy: Project → Deployments → ... → Redeploy"
echo "5. Run migrations: DATABASE_URL=your-url npx prisma migrate deploy"
echo "6. Seed data: DATABASE_URL=your-url npx prisma db seed"
