# Wine Club Setup Status

## ✅ Completed

### Infrastructure
- [x] Git repository initialized
- [x] GitHub repository created: https://github.com/ajfrai/wine-club
- [x] Node.js upgraded to v20.20.0 (was v12.22.9)
- [x] Vercel CLI installed (v50.5.0)
- [x] Supabase CLI installed (v2.72.7)

### Project Setup
- [x] Next.js 15 project structure created
- [x] TypeScript configured
- [x] Tailwind CSS configured
- [x] Project directories created (app/, lib/, components/, types/)
- [x] Supabase client configured in lib/supabase.ts
- [x] Environment variables template (.env.example)
- [x] .gitignore configured

### GitHub Issues
- [x] 13 MVP issues created with detailed acceptance criteria:
  1. Database Schema & Authentication Setup
  2. User Registration and Role Selection
  3. Host Club Creation
  4. Member Club Discovery and Join Flow
  5. Club Eligibility Validation (7 Member Minimum)
  6. Host Budget Controls and Preference Management
  7. Wine Profile Data Model
  8. Event Photo Upload and Requirements (2-3 Photos)
  9. Wine Selection Agent (Claude API Integration) - Critical Path
  10. Wine Procurement Workflow
  11. Delivery Tracking and Status Updates
  12. Member Payment to Host Flow
  13. Host Payment to Platform Flow

View all issues: https://github.com/ajfrai/wine-club/issues

## ⚠️ Requires Manual Setup

### Vercel Deployment
Run the following to link and deploy:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
vercel login  # or set VERCEL_TOKEN
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel --prod
```

**Or** import via Vercel Dashboard: https://vercel.com/new

### Supabase Project Linking
Link local project to remote:
```bash
~/.local/bin/supabase link --project-ref rsoyoepdjhhswmapmdya
```

## 🎯 Next Steps

1. **Link Vercel Project**
   - Run `vercel link` or import via dashboard
   - Set environment variables
   - Deploy to production

2. **Link Supabase Project**
   - Run `supabase link`
   - Create initial database migrations
   - Push schema to production

3. **Start Development**
   ```bash
   # Load nvm
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

   # Install dependencies
   npm install

   # Run dev server
   npm run dev
   ```

4. **Begin MVP Implementation**
   - Start with Issue #1: Database Schema & Authentication Setup
   - Follow the acceptance criteria in each issue
   - Work through issues sequentially or in parallel as appropriate

## 📋 Environment Variables

All required environment variables are configured in your shell:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPABASE_ACCESS_TOKEN`
- ✅ `GITHUB_TOKEN`

These are referenced in `.env.local` and ready to use.

## 🏗️ Project Architecture

```
wine-club/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components (empty, ready for MVP)
├── lib/                   # Utilities and configurations
│   └── supabase.ts       # Supabase client
├── types/                 # TypeScript type definitions (empty)
├── supabase/             # Supabase project files
│   ├── config.toml       # Supabase configuration
│   └── migrations/       # Database migrations (to be created)
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── next.config.ts        # Next.js configuration
└── vercel.json           # Vercel deployment configuration
```

## 🍷 Project Vision

AI-enriched wine club platform demonstrating how AI can strengthen real-world human connection. Zero profit model - purely community-focused.

**Core Features:**
- Hosts create clubs (min 7 members, 2-3 event photos required)
- AI handles wine selection, purchasing, delivery coordination
- Rich wine profiles with geography, cultivation, reputation
- Member → Host → Platform payment flow (zero markup)

See README.md for full vision and technical details.
