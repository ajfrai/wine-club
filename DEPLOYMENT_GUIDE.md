# Vercel Deployment Guide

## Quick Deploy (Web Interface - Recommended)

Since your repository is already pushed to GitHub, you can deploy directly from the Vercel dashboard:

### Step 1: Connect to Vercel
1. Go to https://vercel.com
2. Sign in (or create account if needed)
3. Click "Add New..." → "Project"
4. Import your GitHub repository: `ajfrai/wine-club`

### Step 2: Configure Build Settings
Vercel will auto-detect Next.js. Settings should be:
- **Framework Preset:** Next.js
- **Root Directory:** ./
- **Build Command:** `next build`
- **Output Directory:** .next
- **Install Command:** `npm install`

### Step 3: Add Environment Variables
Click "Environment Variables" and add:

**Supabase Variables** (you should already have these):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Stripe Variables** (get from https://dashboard.stripe.com/test/apikeys):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
```

**Important:** Add these to all three environments:
- ✅ Production
- ✅ Preview
- ✅ Development

### Step 4: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a live URL like: `wine-club.vercel.app`

### Step 5: Run Database Migration
After deployment, you need to run the database migration:

```bash
# Run migration on Supabase
npx supabase db push

# Or if you're using Supabase dashboard:
# 1. Go to https://supabase.com/dashboard
# 2. Select your project
# 3. Go to "SQL Editor"
# 4. Copy contents of: supabase/migrations/20260126033108_add_hosts_and_payment.sql
# 5. Run the SQL
```

## Alternative: Deploy via CLI (if you fix Node version)

If you upgrade Node to v18+, you can use:
```bash
npx vercel --prod
```

## Post-Deployment Checklist

- [ ] Verify deployment URL works
- [ ] Test home page loads
- [ ] Run database migration
- [ ] Test signup flow (host and member)
- [ ] Verify Stripe integration works with test card
- [ ] Check error logs in Vercel dashboard

## Testing Stripe on Vercel

Use test card for testing:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (12/34)
- CVC: Any 3 digits
- ZIP: Any ZIP code

## Troubleshooting

**Build fails:**
- Check environment variables are set correctly
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

**Database errors:**
- Make sure migration has been run
- Verify Supabase environment variables are correct
- Check RLS policies are enabled

**Stripe errors:**
- Verify Stripe API keys are correct
- Make sure you're using test mode keys
- Check Stripe dashboard for error details

## Domain Setup (Optional)

To add a custom domain:
1. Go to project settings in Vercel
2. Click "Domains"
3. Add your domain and follow DNS instructions

---

Your deployment is ready! Visit the Vercel URL to see your wine club signup page live.
