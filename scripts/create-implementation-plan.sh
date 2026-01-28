#!/bin/bash
# Creates detailed implementation plan with contracts and dependency analysis
# Run this BEFORE parallel orchestration to prevent conflicts

set -euo pipefail

PROJECT_ROOT="/home/user/wine-club"
DOCS_DIR="$PROJECT_ROOT/docs/browse-clubs"
PLAN_FILE="$DOCS_DIR/implementation-plan.md"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "Creating Implementation Plan"
echo "=========================================="
echo ""

# Create docs directory
mkdir -p "$DOCS_DIR"

echo -e "${BLUE}Launching planning agent...${NC}"
echo ""

cd "$PROJECT_ROOT"

# Launch Claude Code to create the plan
claude --model sonnet << 'EOF'
You are the lead architect for the browse clubs feature implementation.

Your job is to create a comprehensive implementation plan that will allow 7 agents to work in parallel without conflicts.

## Your Tasks

1. **Analyze all GitHub issues #61-68**
   - Read each issue in detail
   - Identify dependencies between issues
   - Determine what files each issue will touch

2. **Create dependency graph**
   - Show which issues block which others
   - Identify safe parallel execution groups

3. **Define contracts**
   - TypeScript interfaces that all agents must follow
   - API request/response shapes
   - Component prop interfaces
   - Database schema changes

4. **Create file ownership matrix**
   - List every file that will be created or modified
   - Assign ownership to specific issues
   - Flag files that multiple issues might touch (HIGH RISK)

5. **Write verification checklist**
   - Per-issue acceptance criteria
   - Integration test checklist
   - Build verification steps

Create the following files in /home/user/wine-club/docs/browse-clubs/:

### 1. implementation-plan.md
Overall plan with:
- Executive summary
- Timeline and phases
- Risk assessment
- Success criteria

### 2. dependency-graph.md
Visual dependency graph showing:
- Which issues block others
- Safe parallel execution groups
- Critical path

### 3. contracts.ts (TypeScript file)
All interface definitions:
```typescript
// Database response types
export interface NearbyClubEnhanced extends NearbyClub {
  member_count: number;
  wine_preferences: string | null;
  recent_event_date: string | null;
}

// API contracts
export interface GetNearbyClubsRequest {
  latitude: number;
  longitude: number;
  radius_miles: number;
}

export interface GetNearbyClubsResponse {
  clubs: NearbyClubEnhanced[];
}

// ... (define ALL interfaces needed across issues)
```

### 4. file-ownership.md
Table format:
| File Path | Owner Issue | Conflict Risk | Notes |
|-----------|-------------|---------------|-------|
| /types/member.types.ts | #61 | HIGH - Multiple issues read | Define first |
| /components/dashboard/ClubCard.tsx | #62 | MEDIUM | Others import |
| ... | ... | ... | ... |

### 5. verification-checklist.md
Per-issue checklist:
```markdown
## Issue #61
- [ ] Migration file created
- [ ] RPC function updated
- [ ] Returns member_count in response
- [ ] npm run build passes
- [ ] Committed and pushed

## Issue #62
...
```

### 6. integration-plan.md
How to merge all issues:
- Merge order
- Integration testing steps
- Rollback strategy

## Important Guidelines

- Be EXTREMELY detailed in the contracts.ts file
- Flag ANY file that multiple issues will modify
- Create strict boundaries - each issue should own specific files
- If two issues need to modify the same file, that's a dependency

Save all files to /home/user/wine-club/docs/browse-clubs/

When done, output:
"✓ Implementation plan created. Review files in docs/browse-clubs/"
EOF

echo ""
echo -e "${GREEN}✓ Planning complete${NC}"
echo ""
echo "Review the plan in: $DOCS_DIR"
echo ""
echo "Next steps:"
echo "  1. Review the implementation plan"
echo "  2. Adjust if needed"
echo "  3. Run: ./scripts/orchestrate-parallel.sh"
