# Deployment Guide

## Prerequisites

- Node.js 18+ (current system has v12.22.9 - needs upgrade)
- Vercel CLI
- Supabase CLI (installed at `~/.local/bin/supabase`)

## Supabase Setup

The Supabase project is already configured:
- **Project URL**: https://rsoyoepdjhhswmapmdya.supabase.co
- Environment variables are set in `.env.local`

### Link Local Project to Supabase

```bash
~/.local/bin/supabase link --project-ref rsoyoepdjhhswmapmdya
```

### Run Migrations

```bash
~/.local/bin/supabase db push
```

## Vercel Setup

**Note:** Requires Node.js 18+ to run Vercel CLI.

### Option 1: Via CLI (Recommended)

Once Node is upgraded:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
vercel --prod
```

### Option 2: Via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import the GitHub repository: https://github.com/ajfrai/wine-club
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

## Environment Variables

All required environment variables are already set in your shell:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_TOKEN`

## Next Steps

1. **Upgrade Node.js** to v18+ (recommended: v20 LTS)
   - Using nvm: `nvm install 20 && nvm use 20`
   - Or download from https://nodejs.org

2. **Complete Vercel Setup**
   ```bash
   vercel link
   vercel env pull .env.local
   vercel --prod
   ```

3. **Start Development**
   ```bash
   npm install
   npm run dev
   ```

## Current Status

- ✅ Git repository initialized
- ✅ GitHub repository created: https://github.com/ajfrai/wine-club
- ✅ Supabase initialized (needs linking)
- ⚠️ Vercel setup blocked by Node v12 (needs upgrade)
- ✅ 13 MVP issues created
- ✅ Project structure scaffolded
