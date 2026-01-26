#!/bin/bash
# Quick Vercel Environment Setup

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Vercel CLI found at: $(which vercel)"
echo ""
echo "Step 1: Logging into Vercel..."
vercel login

echo ""
echo "Step 2: Linking project..."
vercel link

echo ""
echo "Step 3: Adding environment variables..."
echo ""

# Add all environment variables to all environments at once
echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
printf "%s" "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development

echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
printf "%s" "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development

echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
printf "%s" "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development

echo "Adding ANTHROPIC_API_KEY..."
printf "%s" "$ANTHROPIC_API_KEY" | vercel env add ANTHROPIC_API_KEY production preview development

echo ""
echo "✅ All environment variables added!"
echo ""
echo "Verifying environment variables..."
vercel env ls

echo ""
echo "Step 4: Redeploying to apply changes..."
vercel --prod

echo ""
echo "🎉 Setup complete! Your app is deployed with all environment variables."
