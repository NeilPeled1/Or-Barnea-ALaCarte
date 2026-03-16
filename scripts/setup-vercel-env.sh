#!/bin/bash
# Run this AFTER: npx vercel login
# Adds AUTH_SECRET to all environments and redeploys
# Note: NEXTAUTH_URL is NOT needed on Vercel (auto-detected)

set -e
cd "$(dirname "$0")/.."

# Generate AUTH_SECRET
AUTH_SECRET=$(openssl rand -base64 32)
echo "Generated AUTH_SECRET (first 12 chars): ${AUTH_SECRET:0:12}..."

# Add AUTH_SECRET to ALL environments (Production, Preview, Development)
for env in production preview development; do
  echo "Adding AUTH_SECRET to $env..."
  echo "$AUTH_SECRET" | npx vercel env add AUTH_SECRET "$env" --force
done

echo ""
echo "Environment variables added. Redeploying..."
npx vercel --prod

echo ""
echo "Done! Redeploy complete. If issues persist, check Vercel Dashboard → Settings → Environment Variables."
