#!/bin/bash

# Add Stripe API Keys to Vercel
# Run this script after you've obtained your Stripe test keys

set -e

# Source nvm if available
if [ -f ~/.nvm/nvm.sh ]; then
    source ~/.nvm/nvm.sh
fi

echo "🔑 Stripe API Keys Setup"
echo "========================"
echo ""
echo "Get your Stripe test keys from: https://dashboard.stripe.com/test/apikeys"
echo ""

# Prompt for publishable key
echo "Enter your Stripe Publishable Key (starts with pk_test_):"
read -r STRIPE_PK

# Prompt for secret key
echo "Enter your Stripe Secret Key (starts with sk_test_):"
read -r STRIPE_SK

echo ""
echo "Adding keys to Vercel..."

# Add to production
echo "$STRIPE_PK" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
echo "$STRIPE_SK" | vercel env add STRIPE_SECRET_KEY production

# Add to preview
echo "$STRIPE_PK" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY preview
echo "$STRIPE_SK" | vercel env add STRIPE_SECRET_KEY preview

# Update local .env.local
sed -i "s|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PK|" .env.local
sed -i "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SK|" .env.local

echo ""
echo "✅ Stripe keys added successfully!"
echo ""
echo "Redeploying to Vercel with new environment variables..."
vercel --prod

echo ""
echo "🎉 Complete! Your app is now fully configured with Stripe payments."
echo ""
