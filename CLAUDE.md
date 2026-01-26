# CLAUDE.md - AI Assistant Guide for Wine Club

This document provides comprehensive guidance for AI assistants working with the Wine Club codebase.

## Project Overview

Wine Club is an AI-enriched community wine sharing platform built to strengthen real-world human connection. The platform enables hosts to create wine clubs with members, handling wine selection, procurement, and delivery coordination through AI agents.

**Core Philosophy**: Zero profit, pure community - the app facilitates getting people into the same room to share wine and build community.

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 15.1.0 |
| Language | TypeScript | 5.7.2 |
| UI | React | 19.0.0 |
| Styling | Tailwind CSS | 3.4.17 |
| Animation | Framer Motion | 12.29.0 |
| Forms | React Hook Form + Zod | 7.71.1 / 4.3.6 |
| Database | Supabase (PostgreSQL) | 2.48.1 |
| Payments | Stripe | 20.2.0 |
| Icons | Lucide React | 0.563.0 |
| Deployment | Vercel | - |

## Directory Structure

```
wine-club/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API route handlers
│   │   └── stripe/        # Stripe payment endpoints
│   │       ├── setup-intent/route.ts
│   │       └── save-payment/route.ts
│   ├── signup/            # Signup page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components (Header)
│   ├── signup/           # Signup flow components
│   │   ├── SignupContainer.tsx
│   │   ├── SplitPanel.tsx
│   │   ├── HostForm.tsx
│   │   ├── MemberForm.tsx
│   │   ├── PaymentSetupStep.tsx
│   │   └── FormCloseButton.tsx
│   └── ui/               # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Textarea.tsx
│       └── Checkbox.tsx
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # Authentication functions
│   ├── supabase.ts       # Supabase client
│   ├── stripe-client.ts  # Stripe client (frontend)
│   └── validations/      # Zod schemas
│       ├── host-signup.schema.ts
│       └── member-signup.schema.ts
├── types/                 # TypeScript type definitions
│   └── auth.types.ts     # Auth-related types
├── supabase/             # Supabase configuration
│   ├── config.toml
│   └── migrations/       # Database migrations (chronological)
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Key Conventions

### Code Style

- **TypeScript**: Strict mode enabled, use explicit types for function parameters and return values
- **React**: Functional components with hooks, use `'use client'` directive for client components
- **Imports**: Use `@/` path alias for absolute imports (e.g., `@/components/ui/Button`)
- **Component exports**: Named exports preferred (e.g., `export const Button`)
- **File naming**: PascalCase for components, camelCase for utilities

### Component Patterns

```typescript
// UI Component pattern
interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Component: React.FC<ComponentProps> = ({
  variant = 'primary',
  isLoading = false,
  className = '',
  children,
  ...props
}) => {
  // Implementation
};
```

```typescript
// Form Component pattern with forwardRef
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    // Implementation
  }
);
Input.displayName = 'Input';
```

### Styling Conventions

- **Tailwind CSS** for all styling
- **Custom color palette** defined in `tailwind.config.ts`:
  - `sunburst-*` (50-900): Primary action colors (red/orange tones)
  - `wine-*` (light, DEFAULT, dark): Brand colors
- **Responsive design**: Mobile-first approach, use `sm:`, `md:`, `lg:` breakpoints
- **Animations**: Use Framer Motion for complex animations, Tailwind transitions for simple ones

### Form Handling

- Use **React Hook Form** with **Zod** for validation
- Schema files located in `lib/validations/`
- Example pattern:
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### API Routes

- Located in `app/api/` using Next.js App Router conventions
- Use `NextRequest` and `NextResponse` from `next/server`
- Pattern for API routes:
```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validate input
    // Process request
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Message' }, { status: 500 });
  }
}
```

## Database Schema

### Tables

**users** (extends auth.users)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users |
| email | TEXT | Unique email |
| role | user_role | 'host' or 'member' |
| full_name | TEXT | User's full name |
| stripe_customer_id | TEXT | Stripe customer ID |
| has_payment_method | BOOLEAN | Payment setup status |
| payment_setup_completed_at | TIMESTAMPTZ | When payment was set up |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**hosts**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References users.id |
| club_address | TEXT | Where club meetings happen |
| delivery_address | TEXT | Wine delivery address |
| about_club | TEXT | Club description (optional) |
| wine_preferences | TEXT | Host's wine preferences (optional) |
| host_code | VARCHAR(8) | Unique 8-char code for invites |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### RLS Policies

Row Level Security is enabled on all tables:
- Users can only read/update their own profile
- Hosts table is readable by all authenticated users (for member discovery)
- Insert policies require matching `auth.uid()`

### Database Functions

- `generate_host_code()`: Generates unique 8-character alphanumeric codes
- `handle_new_user()`: Trigger function to create user profile on auth signup
- `handle_updated_at()`: Trigger function to update timestamps

## Environment Variables

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For server-side only

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # Client-side
STRIPE_SECRET_KEY=sk_test_xxx                    # Server-side only
```

### Setup

```bash
cp .env.example .env.local
# Fill in the values
```

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Common Development Tasks

### Adding a New Page

1. Create file in `app/` directory (e.g., `app/dashboard/page.tsx`)
2. Add `'use client'` if using hooks or browser APIs
3. Import components using `@/` alias

### Adding a New API Route

1. Create folder structure in `app/api/`
2. Add `route.ts` file with HTTP method handlers
3. Use server-side Supabase client for database operations

### Adding a New Component

1. Create in appropriate subfolder under `components/`
2. Use TypeScript interfaces for props
3. Follow existing patterns for styling with Tailwind

### Adding Database Migrations

1. Create new SQL file in `supabase/migrations/`
2. Follow naming: `YYYYMMDDHHMMSS_description.sql`
3. Run with `npx supabase db push` or via Supabase dashboard

### Testing Stripe Integration

Use test card: `4242 4242 4242 4242` with any future date and CVC

## Authentication Flow

1. User fills signup form (Host or Member)
2. `signupHost()` or `signupMember()` in `lib/auth.ts` is called
3. Creates auth user via `supabase.auth.signUp()`
4. Trigger creates user profile in `public.users`
5. For hosts: Additional row created in `hosts` table
6. Redirects to payment setup step
7. Stripe setup intent created, payment method saved
8. User redirected to dashboard

## Type Definitions

Key types in `types/auth.types.ts`:

```typescript
type UserRole = 'host' | 'member';

interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  stripe_customer_id: string | null;
  has_payment_method: boolean;
  payment_setup_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Host {
  id: string;
  user_id: string;
  club_address: string;
  delivery_address: string;
  about_club: string | null;
  wine_preferences: string | null;
  host_code: string;
  created_at: string;
  updated_at: string;
}
```

## Deployment

The app is deployed to **Vercel** with auto-deploy from GitHub.

### Deployment Checklist

1. Ensure all environment variables are set in Vercel dashboard
2. Run database migrations on Supabase
3. Test signup flow with Stripe test cards
4. Verify RLS policies are working

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## Important Notes for AI Assistants

### Do's

- Use the established component patterns and styling conventions
- Follow TypeScript strict mode requirements
- Use Zod schemas for form validation
- Apply proper RLS policies when adding database tables
- Use environment variables for sensitive data
- Test Stripe integration with test mode credentials

### Don'ts

- Don't commit `.env` files or expose secrets
- Don't bypass RLS policies without security review
- Don't use inline styles - use Tailwind classes
- Don't create API routes without proper error handling
- Don't skip TypeScript types

### Common Gotchas

1. **Client vs Server Components**: Remember `'use client'` directive
2. **Supabase Auth**: User profile created via trigger, not manual insert
3. **Stripe API Version**: Currently using `2025-12-15.clover`
4. **Host Codes**: Generated server-side to ensure uniqueness
5. **Path Aliases**: Use `@/` for imports from project root

## File Reference Quick Links

- Main types: `types/auth.types.ts`
- Auth logic: `lib/auth.ts`
- Form schemas: `lib/validations/*.schema.ts`
- Tailwind config: `tailwind.config.ts`
- Database schema: `supabase/migrations/`
