# Test Deployment Setup

## Deployment URLs

### Production (Main Branch)
- **URL:** https://wine-club-six.vercel.app
- **Branch:** `main`
- **Test Mode:** ❌ Disabled (forms are empty)
- **Use for:** Production testing, sharing with real users

### Test Environment (Test Branch)
- **URL:** https://wine-club-git-test-ajfrais-projects.vercel.app
- **Branch:** `test`
- **Test Mode:** ✅ Enabled (forms are pre-filled)
- **Use for:** Quick testing, development

## Test Mode Features

When `NEXT_PUBLIC_TEST_MODE=true` is set:

### Host Form Auto-Fill
- **Full Name:** Test Host User
- **Email:** test.host.[timestamp]@example.com (unique per page load)
- **Password:** TestPass123!
- **Club Address:** 123 Wine Street, Napa, CA 94558
- **About Club:** This is a test wine club for development purposes.
- **Wine Preferences:** Pinot Noir, Chardonnay, Bordeaux blends

### Member Form Auto-Fill
- **Full Name:** Test Member User
- **Email:** test.member.[timestamp]@example.com (unique per page load)
- **Password:** TestPass123!
- **Find Nearby:** ✅ Checked by default

### Visual Indicator
A yellow banner appears at the top of the page: "🧪 TEST MODE - Forms are pre-filled for testing"

## Environment Variables Configured

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | ✅ | ✅ |
| `STRIPE_SECRET_KEY` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_TEST_MODE` | ❌ | ✅ | ✅ |

## How to Use

### For Quick Testing (Test Branch)
1. Visit: https://wine-club-git-test-ajfrais-projects.vercel.app/signup
2. You'll see the yellow test mode banner
3. Forms are pre-filled - just click "Create Host Account" or "Create Member Account"
4. Test the full signup flow without typing

### For Production Testing (Main Branch)
1. Visit: https://wine-club-six.vercel.app/signup
2. No test mode banner (normal experience)
3. Fill out forms manually
4. Test the real user experience

## Debugging with Logs

Both deployments have comprehensive logging enabled. Open browser console (F12) to see:

```
[SignupPage] handleHostSignup called
[SignupPage] Form data: { email: "...", fullName: "..." }
[SignupPage] Calling signupHost function
[signupHost] Starting host signup process
[signupHost] Step 1: Creating auth user in Supabase
[signupHost] Step 1 success: User created with ID: ...
[signupHost] Step 2: Updating user profile
[signupHost] Step 2 success: Profile updated
...
```

## Making Changes

### Update Test Branch
```bash
git checkout test
# make changes
git add .
git commit -m "your message"
git push origin test
# Vercel auto-deploys to test URL
```

### Update Production
```bash
git checkout main
# make changes
git add .
git commit -m "your message"
git push origin main
# Vercel auto-deploys to production URL
```

### Sync Test Branch with Main
```bash
git checkout test
git merge main
git push origin test
```

## Vercel CLI Commands

```bash
# View all deployments
source ~/.nvm/nvm.sh && vercel ls

# View environment variables
source ~/.nvm/nvm.sh && vercel env ls

# Check deployment logs
source ~/.nvm/nvm.sh && vercel logs [deployment-url]

# Pull latest env vars locally
source ~/.nvm/nvm.sh && vercel env pull
```

## What Was Deployed

✅ **Logging changes** - Comprehensive debug logging throughout signup flow
✅ **Test mode** - Auto-filled forms for quick testing
✅ **Stripe keys** - Payment processing fully configured
✅ **Separate URLs** - Production and test environments isolated
