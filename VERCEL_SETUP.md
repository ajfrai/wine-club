# Vercel Deployment Setup

## Quick Deploy (Recommended)

Click this button to deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ajfrai/wine-club&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20credentials%20for%20the%20wine%20club%20platform&envLink=https://github.com/ajfrai/wine-club/blob/main/DEPLOYMENT.md&project-name=wine-club&repository-name=wine-club)

**Or** visit: https://vercel.com/new/clone?repository-url=https://github.com/ajfrai/wine-club

## Manual Import

1. Go to https://vercel.com/new
2. Import your GitHub repository: `ajfrai/wine-club`
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://rsoyoepdjhhswmapmdya.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (from your env)
   - `SUPABASE_SERVICE_ROLE_KEY`: (from your env)
4. Click "Deploy"

## Via CLI (If you have a Vercel account)

```bash
# Authenticate
vercel login

# Link project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: https://rsoyoepdjhhswmapmdya.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste your anon key

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste your service role key

# Deploy
vercel --prod
```

## After Deployment

Once deployed, your app will be live at:
- Production: `https://wine-club-[username].vercel.app`
- You can configure a custom domain in Vercel dashboard

## Environment Variables Reference

Get these from your shell environment:
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
```

## Auto-Deploy on Push

Once connected, Vercel will automatically deploy:
- `main` branch → Production
- Other branches → Preview deployments
