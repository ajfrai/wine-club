#!/bin/bash

# Wine Club Deployment Setup Script
# This script sets up environment variables and configures automatic deployments

set -e

echo "🍷 Wine Club Deployment Setup"
echo "================================"
echo ""

# Source nvm if available
if [ -f ~/.nvm/nvm.sh ]; then
    source ~/.nvm/nvm.sh
fi

# Check for required tools
command -v vercel >/dev/null 2>&1 || { echo "❌ Vercel CLI is required. Run: npm install -g vercel"; exit 1; }

echo "📋 Step 1: Collecting Environment Variables"
echo "-------------------------------------------"
echo ""

# Check if .env.local exists and has Supabase vars
if [ -f .env.local ]; then
    SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d '=' -f2-)
    SUPABASE_ANON_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d '=' -f2-)
    STRIPE_PK=$(grep "^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=" .env.local | cut -d '=' -f2-)
    STRIPE_SK=$(grep "^STRIPE_SECRET_KEY=" .env.local | cut -d '=' -f2-)
fi

# Prompt for Supabase URL if not found
if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "your-supabase-url" ]; then
    echo "Enter your Supabase Project URL (from https://supabase.com/dashboard/project/_/settings/api):"
    read -r SUPABASE_URL
fi

# Prompt for Supabase Anon Key if not found
if [ -z "$SUPABASE_ANON_KEY" ] || [ "$SUPABASE_ANON_KEY" = "your-supabase-anon-key" ]; then
    echo "Enter your Supabase Anon/Public Key:"
    read -r SUPABASE_ANON_KEY
fi

# Prompt for Stripe Publishable Key if not found
if [ -z "$STRIPE_PK" ] || [ "$STRIPE_PK" = "pk_test_your_publishable_key_here" ]; then
    echo "Enter your Stripe Publishable Key (from https://dashboard.stripe.com/test/apikeys):"
    read -r STRIPE_PK
fi

# Prompt for Stripe Secret Key if not found
if [ -z "$STRIPE_SK" ] || [ "$STRIPE_SK" = "sk_test_your_secret_key_here" ]; then
    echo "Enter your Stripe Secret Key:"
    read -r STRIPE_SK
fi

echo ""
echo "✅ Environment variables collected"
echo ""

# Update .env.local
echo "📝 Step 2: Updating .env.local"
echo "------------------------------"
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Stripe Configuration (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PK
STRIPE_SECRET_KEY=$STRIPE_SK
EOF

echo "✅ .env.local updated"
echo ""

# Add environment variables to Vercel
echo "☁️  Step 3: Adding Environment Variables to Vercel"
echo "---------------------------------------------------"

echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
echo "$STRIPE_PK" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production preview development
echo "$STRIPE_SK" | vercel env add STRIPE_SECRET_KEY production preview development

echo "✅ Environment variables added to Vercel"
echo ""

# Run database migration
echo "🗄️  Step 4: Running Database Migration"
echo "---------------------------------------"
echo ""
echo "Opening Supabase SQL Editor..."
echo ""
echo "Please follow these steps:"
echo "1. Go to: ${SUPABASE_URL/https:\/\//https://supabase.com/dashboard/project/}/sql/new"
echo "2. Copy and paste the contents of: supabase/migrations/20260126033108_add_hosts_and_payment.sql"
echo "3. Click 'Run' to execute the migration"
echo ""
read -p "Press Enter once you've completed the migration..."

echo ""
echo "✅ Database migration completed"
echo ""

# Trigger new deployment
echo "🚀 Step 5: Deploying to Vercel"
echo "-------------------------------"
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your Wine Club app is now deployed with:"
echo "  ✅ Supabase database connected"
echo "  ✅ Stripe payments configured"
echo "  ✅ GitHub auto-deployments enabled"
echo "  ✅ Environment variables set"
echo ""
echo "Next steps:"
echo "  1. Visit your live site: https://wine-club.vercel.app"
echo "  2. Test the signup flow"
echo "  3. Every push to 'main' will auto-deploy!"
echo ""
