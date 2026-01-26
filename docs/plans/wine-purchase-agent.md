# Wine Purchase Agent Implementation Plan

## Overview
Implement AI-powered wine selection agent (Issue #9) and wine procurement workflow (Issue #10) using Claude API to recommend wines based on club preferences, budget, and past feedback.

## Architecture Decisions

### Core Approach
- **Server Actions** for wine agent (better Next.js 15 integration vs API routes)
- **Claude 3.5 Sonnet** with tool use for structured wine recommendations
- **Manual procurement MVP** (host manually purchases, tracks status)
- **Feedback loop** (rejected wines inform future recommendations)

### Key Technologies
- Anthropic SDK (`@anthropic-ai/sdk`) for Claude API
- Supabase PostgreSQL with migrations (follows existing pattern)
- TypeScript strict mode with comprehensive types
- Tailwind CSS for components

## Database Schema

### New Tables (1 migration file)
**Location**: `/home/abraham/wine-club/supabase/migrations/[timestamp]_wine_selection_and_procurement.sql`

1. **clubs** - Wine club information
   - Fields: id, host_id, name, description, budget_per_bottle (cents), frequency, wine_preferences (JSONB), member_count, is_active
   - Constraint: One active club per host

2. **wines** - Wine catalog
   - Fields: id, name, vineyard, vintage, region, country, wine_type (enum), price_cents, geography (JSONB), cultivation (JSONB), reputation_score, tasting_notes, description, purchase_url, alternate_urls (JSONB)
   - Indexes: wine_type, price_cents, region

3. **wine_recommendations** - Claude agent recommendations
   - Fields: id, club_id, wine_id, agent_reasoning, recommended_at, status (enum: pending/approved/rejected), reviewed_at, reviewed_by, rejection_reason, agent_session_id, quantity, estimated_total_cents
   - Indexes: club_id, status, agent_session_id

4. **wine_orders** - Order tracking
   - Fields: id, club_id, wine_id, recommendation_id, quantity, total_price_cents, order_status (enum: pending/ordered/shipped/delivered/cancelled), ordered_at, shipped_at, delivered_at, cancelled_at, tracking_url, tracking_number, delivery_address (JSONB), order_notes
   - Indexes: club_id, order_status, ordered_at
   - Constraint: Logical date ordering (ordered < shipped < delivered)

5. **wine_feedback** - User feedback for agent learning
   - Fields: id, club_id, wine_id, order_id, user_id, rating (1-5), notes
   - Constraint: One feedback per user per wine per club

6. **club_members** - Membership tracking (stub for Issue #4)
   - Fields: id, club_id, user_id, joined_at, is_active

### Enums
- `wine_type`: red, white, rose, sparkling, dessert, fortified
- `recommendation_status`: pending, approved, rejected
- `order_status`: pending, ordered, shipped, delivered, cancelled

### RLS Policies
- Hosts can view/manage their own clubs, recommendations, and orders
- Members can view clubs they belong to and orders for those clubs
- Service role can create recommendations (Claude agent)
- All tables have RLS enabled with appropriate policies

### Triggers
- `handle_updated_at()` for all tables (reuse existing function)

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install @anthropic-ai/sdk uuid
npm install -D @types/uuid
```

### Step 2: Environment Variables
Add to `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### Step 3: Database Migration
Create migration with all tables, enums, RLS policies, indexes, and triggers.
Run: `supabase db push` (or deploy via Supabase dashboard)

### Step 4: Type Definitions

**File**: `/home/abraham/wine-club/types/database.ts`
- Export interfaces for all database tables
- Export type unions for enums
- Include JSONB structure interfaces (WinePreferences, Geography, Cultivation, DeliveryAddress)

**File**: `/home/abraham/wine-club/types/wine-agent.ts`
- WineSelectionInput (clubId, budgetPerBottle, preferences, numberOfBottles, pastFeedback, rejectedWineIds)
- WineRecommendationResult (wine details + reasoning + confidence)
- WineSelectionResponse (recommendations, sessionId, totalEstimatedCost, reasoning)
- ApproveRecommendationInput / RejectRecommendationInput

### Step 5: Claude API Integration

**File**: `/home/abraham/wine-club/lib/claude-client.ts`
- Initialize Anthropic SDK with API key
- Export client and constants (model, max_tokens)

**File**: `/home/abraham/wine-club/lib/wine-agent-prompts.ts`
- `buildWineSelectionPrompt()` - Construct prompt with budget, preferences, past feedback, rejected wines
- `formatFeedbackForContext()` - Transform database feedback for prompt

**File**: `/home/abraham/wine-club/lib/wine-agent.ts`
- Define `wine_recommendation` tool schema for structured output
- `getWineRecommendations()` - Call Claude API with tool use
- Extract and validate tool response
- Ensure recommendations stay within budget

### Step 6: Server Actions

**File**: `/home/abraham/wine-club/lib/rate-limiter.ts`
- In-memory rate limiter (10 requests/hour per club for MVP)
- `checkRateLimit()` function

**File**: `/home/abraham/wine-club/app/actions/wine-selection.ts`
- `generateWineRecommendations(clubId, userId)`:
  - Verify host authorization
  - Fetch club preferences, past feedback, rejected wines
  - Check rate limit
  - Call Claude agent
  - Insert wines (or reuse existing) and recommendations
  - Return session ID and recommendation IDs

- `approveRecommendation(input, userId)`:
  - Verify authorization and status
  - Update recommendation to 'approved'
  - Create wine order with 'pending' status
  - Revalidate paths

- `rejectRecommendation(input, userId)`:
  - Verify authorization and status
  - Update recommendation to 'rejected' with reason
  - Revalidate paths

**File**: `/home/abraham/wine-club/app/actions/wine-orders.ts`
- `updateOrderStatus(input, userId)`:
  - Verify authorization
  - Update order status and timestamps
  - Add tracking info if provided
  - Revalidate paths

### Step 7: Frontend Components

**File**: `/home/abraham/wine-club/components/wine/GenerateRecommendationsButton.tsx`
- Button to trigger Claude agent
- Loading state (10-20 second wait)
- Error handling
- Calls `generateWineRecommendations()` server action

**File**: `/home/abraham/wine-club/components/wine/WineRecommendationCard.tsx`
- Display wine details (name, vineyard, region, price, tasting notes)
- Show agent reasoning in highlighted section
- Approve button → creates order, redirects to order page
- Reject button → shows textarea for reason, updates status
- Purchase link to retailer website

**File**: `/home/abraham/wine-club/components/orders/OrderCard.tsx`
- Summary view for order list
- Status badge with color coding
- Wine name, quantity, total, order date
- Click to view details

**File**: `/home/abraham/wine-club/components/orders/OrderStatusUpdate.tsx`
- Form to update order status
- Conditional fields (tracking URL/number for shipped/delivered)
- Manual notes field
- Calls `updateOrderStatus()` server action

### Step 8: Pages

**File**: `/home/abraham/wine-club/app/host/clubs/[clubId]/recommendations/page.tsx`
- Display club info and budget
- Show GenerateRecommendationsButton
- List pending recommendations as WineRecommendationCard components
- Auth: verify user is club host

**File**: `/home/abraham/wine-club/app/host/orders/[orderId]/page.tsx`
- Wine details section
- Order summary section (quantity, total, status, dates)
- Delivery address display
- OrderStatusUpdate component
- Manual purchase instructions for MVP
- Auth: verify user is club host

**File**: `/home/abraham/wine-club/app/host/clubs/[clubId]/orders/page.tsx`
- Order history for club
- Grid of OrderCard components
- Auth: verify user is club host

## Critical Files Summary

### Database
- `/home/abraham/wine-club/supabase/migrations/[timestamp]_wine_selection_and_procurement.sql`

### Types
- `/home/abraham/wine-club/types/database.ts`
- `/home/abraham/wine-club/types/wine-agent.ts`

### Backend Logic
- `/home/abraham/wine-club/lib/claude-client.ts`
- `/home/abraham/wine-club/lib/wine-agent-prompts.ts`
- `/home/abraham/wine-club/lib/wine-agent.ts`
- `/home/abraham/wine-club/lib/rate-limiter.ts`
- `/home/abraham/wine-club/app/actions/wine-selection.ts`
- `/home/abraham/wine-club/app/actions/wine-orders.ts`

### Frontend
- `/home/abraham/wine-club/components/wine/GenerateRecommendationsButton.tsx`
- `/home/abraham/wine-club/components/wine/WineRecommendationCard.tsx`
- `/home/abraham/wine-club/components/orders/OrderCard.tsx`
- `/home/abraham/wine-club/components/orders/OrderStatusUpdate.tsx`
- `/home/abraham/wine-club/app/host/clubs/[clubId]/recommendations/page.tsx`
- `/home/abraham/wine-club/app/host/orders/[orderId]/page.tsx`
- `/home/abraham/wine-club/app/host/clubs/[clubId]/orders/page.tsx`

## Security Notes

1. **RLS Policies**: Hosts can only access their own clubs' data
2. **Server Actions**: All actions verify user authorization before DB operations
3. **Service Role**: Used only server-side for Claude agent operations
4. **API Keys**: Claude API key never exposed to client
5. **Rate Limiting**: Prevents abuse of expensive AI calls (10/hour per club)

## Testing & Verification

### End-to-End Test Flow
1. Create a club with budget and preferences (prerequisite: Issue #3)
2. Navigate to `/host/clubs/{clubId}/recommendations`
3. Click "Get Wine Recommendations"
4. Wait 10-20 seconds for Claude to generate recommendation
5. Verify recommendation appears with wine details and reasoning
6. Test approval flow:
   - Click "Approve & Create Order"
   - Verify redirect to order detail page
   - Check order status is "pending"
7. Test order update flow:
   - Update status to "ordered" with tracking info
   - Verify timestamps update correctly
8. Test rejection flow:
   - Generate new recommendation
   - Click "Reject" and provide reason
   - Generate another recommendation
   - Verify agent considers rejection (check reasoning text)
9. Test rate limiting:
   - Generate 10+ recommendations within 1 hour
   - Verify 11th request is blocked with error message

### Database Verification
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('clubs', 'wines', 'wine_recommendations', 'wine_orders', 'wine_feedback');

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'wine%';

-- Test recommendation query
SELECT r.*, w.name, w.price_cents
FROM wine_recommendations r
JOIN wines w ON w.id = r.wine_id
WHERE r.club_id = 'test-club-id';
```

### API Verification
- Test Claude API connection independently
- Verify tool use returns structured data
- Test budget constraint validation
- Test prompt includes feedback context

## Future Enhancements (Post-MVP)

1. **Automated Purchasing**: Integrate wine retailer APIs
2. **Multiple Recommendations**: Generate 3-5 options simultaneously
3. **Real Wine Database**: Use Wine.com or Vivino API for tool use
4. **Email Notifications**: Order status change alerts
5. **Member Feedback**: Allow members to rate wines
6. **Advanced Preferences**: More sophisticated preference modeling
7. **Budget Optimization**: AI optimizes across multiple bottles

## Dependencies on Other Issues

- **Issue #3 (Host Club Creation)**: Required to create clubs before generating recommendations
- **Issue #2 (User Registration)**: Required for authentication
- **Issue #7 (Wine Profile Data Model)**: Implemented as part of this plan
- **Issue #6 (Host Budget Controls)**: Budget validation built into agent

## Cost Estimation

For 100 clubs with 4 recommendations/month:
- **Claude API**: ~$400/month (Claude 3.5 Sonnet)
- **Supabase**: Free tier sufficient
- **Total**: ~$400-500/month

## Implementation Time Estimate

By complexity:
1. Database schema: 2-3 hours (including testing)
2. Types: 30 minutes
3. Claude integration: 2-3 hours (including prompt engineering)
4. Server actions: 2-3 hours
5. Frontend components: 3-4 hours
6. Pages: 2-3 hours
7. Testing & refinement: 2-3 hours

**Total: ~15-20 hours** for full implementation and testing
