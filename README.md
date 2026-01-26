# Wine Club - AI-Enriched Community Wine Sharing Platform

An AI-driven wine club platform that demonstrates how AI can enrich real-life community building through taste-making and event orchestration.

## Vision

This is part of a broader exploration into how AI can strengthen the fabric of real-world human connection. We're not building another app that keeps people on screens - we're building infrastructure that gets people into the same room, sharing a bottle, learning about where it came from, and building the kind of casual recurring community that modern life has quietly eroded. The AI handles the logistics so humans can focus on each other.

**Zero profit. Pure community.**

## Core Concept

Hosts create wine clubs with a minimum of 7 members. The app agentically handles:
- Wine selection based on host preferences and budget
- Wine procurement and purchasing
- Delivery coordination
- Rich wine profiles with geography, cultivation, reputation, and vineyard imagery

Members pay hosts; hosts pay the app. Zero profit model - purely community-focused.

## Key Features

- **Host/Member Management**: Role-based signup and club administration
- **Budget Controls**: Host-defined budgets with feedback loops
- **Agentic Wine Procurement**: AI-driven wine selection and delivery tracking
- **Rich Wine Profiles**: Geographic data, cultivation details, reputation scoring, vineyard imagery
- **Photo Requirements**: Clubs must post 2-3 event photos
- **Member Thresholds**: Minimum 7 members for club eligibility

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel
- **AI**: Claude API for agentic wine selection and orchestration

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
wine-club/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utilities and configurations
├── types/           # TypeScript type definitions
├── supabase/        # Supabase migrations and functions
└── public/          # Static assets
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
