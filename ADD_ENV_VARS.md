# Quick Vercel Environment Variable Setup

## One-Line Setup (Copy & Paste)

After running `vercel login` and `vercel link`, run this:

```bash
export NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
echo "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development && \
echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development && \
echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development && \
echo "$ANTHROPIC_API_KEY" | vercel env add ANTHROPIC_API_KEY production preview development && \
echo "✅ All environment variables added!"
```

## Step-by-Step

### 1. Authenticate with Vercel
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
vercel login
```

### 2. Link Project (if not already linked)
```bash
vercel link
# Select your account
# Choose wine-club project
```

### 3. Add Each Environment Variable

```bash
# Supabase URL (public)
echo "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development

# Supabase Anon Key (public)
echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development

# Supabase Service Role Key (secret)
echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development

# Anthropic API Key (secret)
echo "$ANTHROPIC_API_KEY" | vercel env add ANTHROPIC_API_KEY production preview development
```

### 4. Redeploy with New Variables
```bash
vercel --prod
```

## Or Use Vercel Dashboard

1. Go to https://vercel.com/[your-username]/wine-club/settings/environment-variables
2. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://rsoyoepdjhhswmapmdya.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (from `echo $NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `SUPABASE_SERVICE_ROLE_KEY` = (from `echo $SUPABASE_SERVICE_ROLE_KEY`)
   - `ANTHROPIC_API_KEY` = (from `echo $ANTHROPIC_API_KEY`)
3. Check: Production, Preview, Development
4. Save
5. Redeploy

## Verify Environment Variables

```bash
vercel env ls
```

## Your Current Values

Run these to see your values:
```bash
echo "NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY"
echo "ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY"
```
