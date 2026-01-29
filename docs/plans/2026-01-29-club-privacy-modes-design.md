# Club Privacy Modes Design

**Date:** 2026-01-29
**Status:** Approved

## Overview

Add three privacy modes for wine clubs:
- **Anyone Can Join** (public) - Members can discover and join instantly
- **Approval Required** (request-based) - Members can discover and request to join
- **Invite Only** (private) - Hidden from discovery, requires join code

## Design Decisions

### Core Behavior
- **Discovery**: Public and request-based clubs visible in browse; private clubs hidden
- **Join codes**: Use existing `host_code` as private join code (visibility controlled by mode)
- **Existing members**: Unaffected when privacy settings change
- **Default setting**: None - hosts must explicitly choose during club creation
- **Editability**: Hosts can change privacy mode anytime

### Request Workflow (Approval Required mode)
- Members click "Request to Join" → creates pending membership
- Optional message field for members to explain why they want to join
- Host sees basic info (name, email) and message
- Host can approve (activates membership) or deny (deletes request)
- Denied requests silently removed - members can request again
- No auto-expiration of pending requests
- Badge shows pending request count on host dashboard

### UI Labels
- Database: `public`, `request`, `private`
- User-facing: "Anyone Can Join", "Approval Required", "Invite Only"

## Database Schema Changes

### hosts table
```sql
ALTER TABLE public.hosts
ADD COLUMN join_mode VARCHAR(20) NOT NULL DEFAULT 'request'
  CHECK (join_mode IN ('public', 'request', 'private'));
```

### memberships table
```sql
ALTER TABLE public.memberships
ADD COLUMN request_message TEXT;
```

**Notes:**
- Existing `status` column supports `'pending'` for join requests
- `request_message` stores optional message from member

### Migration for existing clubs
```sql
-- Default existing clubs to 'request' mode
UPDATE public.hosts
SET join_mode = 'request'
WHERE join_mode IS NULL;
```

## API Changes

### New Endpoints

**POST /api/member/join-with-code**
- Body: `{ host_code: string }`
- Looks up host by code, creates active membership
- Errors: invalid code, already a member

**POST /api/host/memberships/approve**
- Body: `{ membership_id: string }`
- Updates membership status to 'active'

**POST /api/host/memberships/deny**
- Body: `{ membership_id: string }`
- Deletes pending membership

### Updated Endpoints

**POST /api/member/memberships**
```typescript
// Check host's join_mode
if (join_mode === 'private') {
  return error('This is a private club. Use join code.')
}

if (join_mode === 'request') {
  // Create with status='pending' and optional request_message
  status = 'pending'
}

if (join_mode === 'public') {
  // Create with status='active' (instant join)
  status = 'active'
}
```

**GET /api/member/clubs**
- Exclude clubs where `join_mode = 'private'`
- Return `join_mode` for each club
- Hide `host_code` for private clubs

### RLS Policy Updates
- Hosts table: Allow anon/authenticated to read `join_mode` for discovery
- `host_code` remains readable (filtered in API based on join_mode)

## UI Changes

### Member UI - Browse Clubs Page

**Join with Code section (top of page):**
```tsx
<div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
  <form onSubmit={handleJoinWithCode}>
    <label className="text-sm font-medium text-gray-700">
      Join a Private Club
    </label>
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        placeholder="Enter club code"
        className="flex-1 px-4 py-2 border rounded-lg"
        maxLength={8}
      />
      <button className="px-6 py-2 bg-wine text-white rounded-lg">
        Join
      </button>
    </div>
  </form>
</div>
```

**ClubCard button logic:**
- Public + not joined: "Join" (instant)
- Public + joined: "Leave"
- Request + not joined: "Request to Join"
- Request + pending: "Pending..." (disabled)
- Request + joined: "Leave"

**Pending requests section:**
- Show member's pending requests with club name and status
- Optional cancel button

### Host UI - Club Creation

**Privacy mode selector (required):**
- Radio buttons or select dropdown
- Options with descriptions:
  - **Anyone Can Join**: Members can discover and join instantly
  - **Approval Required**: Members can discover your club and request to join
  - **Invite Only**: Club is hidden. Members need your code to join
- Form validation ensures selection before submission

### Host UI - Club Management

**Privacy Settings section:**
- Shows current mode with radio buttons to change
- Save button calls `PATCH /api/host/club`

**Host code display:**
- Always visible on host dashboard
- Description changes by mode:
  - Public/Request: "Your club code (shown on public page)"
  - Private: "Your private join code (share with people you want to invite)"

**Pending Requests card (sidebar):**
```tsx
<div className="bg-white rounded-lg shadow-sm border p-6">
  <h3 className="text-sm font-semibold mb-4">
    Pending Requests
    {pendingCount > 0 && (
      <span className="ml-2 bg-wine text-white rounded-full px-2 py-1 text-xs">
        {pendingCount}
      </span>
    )}
  </h3>
  {pending.map(request => (
    <div key={request.id} className="border-b pb-3 mb-3">
      <p className="font-medium">{request.user.full_name}</p>
      <p className="text-xs text-gray-500">{request.user.email}</p>
      {request.request_message && (
        <p className="text-sm text-gray-600 mt-1 italic">
          "{request.request_message}"
        </p>
      )}
      <div className="flex gap-2 mt-2">
        <button onClick={() => approve(request.id)}>Approve</button>
        <button onClick={() => deny(request.id)}>Deny</button>
      </div>
    </div>
  ))}
</div>
```

## Implementation Order

1. Database migration (add columns, set defaults)
2. Update API endpoints (join logic, approve/deny)
3. Update host UI (creation form, management page, pending requests)
4. Update member UI (browse page, join with code, pending view)
5. Update public club page to respect privacy if needed

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Member joins with code they're already in | Error: "Already a member" |
| Member requests when already pending | Error: "Request already sent" |
| Host approves already-approved membership | Idempotent (no error) |
| Member leaves then requests again | Allow (fresh request) |
| Invalid host code entered | Error: "Invalid club code" |
| Host changes privacy mode | Existing members unaffected |

## Testing Checklist

- [ ] Create club in each mode, verify browse behavior
- [ ] Join public club (instant)
- [ ] Request to join approval-required club
- [ ] Host approves request
- [ ] Host denies request
- [ ] Join private club with code
- [ ] Try invalid code
- [ ] Member cancels pending request
- [ ] Change club privacy mode
- [ ] Verify existing members unaffected by mode change
- [ ] Verify host_code visibility based on mode
