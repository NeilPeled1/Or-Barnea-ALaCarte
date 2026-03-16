#!/bin/bash
# Generates AUTH_SECRET and opens Vercel to add it.
# Copy the value below and paste in Vercel → Settings → Environment Variables.

AUTH_SECRET=$(openssl rand -base64 32)
echo ""
echo "=========================================="
echo "1. Copy this AUTH_SECRET (paste in Vercel):"
echo "=========================================="
echo ""
echo "$AUTH_SECRET"
echo ""
echo "=========================================="
echo "2. Add it in Vercel:"
echo "   https://vercel.com/neilpeled1s-projects/orbarneaalacarte/settings/environment-variables"
echo ""
echo "   Name:  AUTH_SECRET"
echo "   Value: (paste the value above)"
echo "   Environment: Production (and Preview if you want)"
echo ""
echo "3. Redeploy: Deployments → ... → Redeploy"
echo "=========================================="
echo ""

# Copy to clipboard on macOS
if command -v pbcopy &>/dev/null; then
  echo "$AUTH_SECRET" | pbcopy
  echo "✓ Copied to clipboard! Paste in Vercel."
else
  echo "Copy the value above manually."
fi
echo ""

# Open Vercel
open "https://vercel.com/neilpeled1s-projects/orbarneaalacarte/settings/environment-variables" 2>/dev/null || true
