#!/bin/bash
# Setup Vercel Environment Variables

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Setting up Vercel environment variables..."

# Check if vercel is authenticated
if ! vercel whoami &>/dev/null; then
  echo "Not authenticated. Running vercel login..."
  vercel login
fi

# Link project if not already linked
if [ ! -d ".vercel" ]; then
  echo "Linking Vercel project..."
  vercel link
fi

# Add environment variables
echo ""
echo "Adding environment variables to production, preview, and development..."

# Supabase variables
echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
echo "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL development

echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development

echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview
echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY development

# Anthropic API Key
echo "Adding ANTHROPIC_API_KEY..."
echo "$ANTHROPIC_API_KEY" | vercel env add ANTHROPIC_API_KEY production
echo "$ANTHROPIC_API_KEY" | vercel env add ANTHROPIC_API_KEY preview
echo "$ANTHROPIC_API_KEY" | vercel env add ANTHROPIC_API_KEY development

echo ""
echo "✅ All environment variables added!"
echo ""
echo "Triggering redeployment to apply changes..."
vercel --prod

echo ""
echo "✅ Setup complete!"
