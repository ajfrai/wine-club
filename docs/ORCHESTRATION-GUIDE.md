# Multi-Agent Orchestration Guide

This guide explains how to safely run multiple Claude Code agents in parallel for the browse clubs feature implementation.

## Quick Start

```bash
# 1. Benchmark your machine
./scripts/benchmark-machine.sh

# 2. Create implementation plan (contracts & dependencies)
./scripts/create-implementation-plan.sh

# 3. Review the plan
cat docs/browse-clubs/implementation-plan.md

# 4. Start resource monitoring in a separate terminal
./scripts/monitor-resources.sh

# 5. Orchestrate parallel execution
./scripts/orchestrate-parallel.sh --max-agents 8
```

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Orchestration System                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐      ┌──────────────────┐              │
│  │ Benchmark      │─────▶│ Resource Monitor │              │
│  │ Machine        │      │ (background)     │              │
│  └────────────────┘      └──────────────────┘              │
│          │                        │                         │
│          ▼                        ▼                         │
│  ┌────────────────┐      ┌──────────────────┐              │
│  │ Planning Agent │      │ Kill Switch      │              │
│  │ (contracts)    │      │ (if overload)    │              │
│  └────────────────┘      └──────────────────┘              │
│          │                                                  │
│          ▼                                                  │
│  ┌──────────────────────────────────────────┐              │
│  │    Parallel Agent Orchestrator           │              │
│  │                                           │              │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │              │
│  │  │Agent │ │Agent │ │Agent │ │Agent │   │              │
│  │  │ #62  │ │ #63  │ │ #64  │ │ #65  │ ...│              │
│  │  └──────┘ └──────┘ └──────┘ └──────┘   │              │
│  │                                           │              │
│  │  Each in separate git worktree           │              │
│  └──────────────────────────────────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Phase Breakdown

### Phase 0: Benchmarking & Planning (30 minutes)

**Benchmark the machine:**
```bash
./scripts/benchmark-machine.sh
```

**Output:**
- Machine specs (CPU, RAM, disk)
- Recommended max concurrent agents
- Risk assessment
- Configuration file: `/tmp/claude-orchestration-config.env`

**Create implementation plan:**
```bash
./scripts/create-implementation-plan.sh
```

**Output files in `docs/browse-clubs/`:**
- `implementation-plan.md` - Overall strategy
- `dependency-graph.md` - Issue dependencies
- `contracts.ts` - TypeScript interfaces
- `file-ownership.md` - File conflict matrix
- `verification-checklist.md` - Acceptance criteria
- `integration-plan.md` - Merge strategy

### Phase 1: Foundation (2-3 hours, serial)

**Issue #61 is BLOCKING** - Must complete first

This issue:
- Updates database schema
- Adds RPC function for member_count
- Defines TypeScript types used by all other issues

```bash
# Orchestrator handles this automatically
# Issue #61 runs first, others wait
```

### Phase 2: Parallel Implementation (2-3 hours, parallel)

Once #61 completes, launch issues #62-68 simultaneously:

**Haiku agents (5 issues):**
- #62: Enhance ClubCard component
- #64: Add text search and sorting
- #65: Add empty states
- #66: Loading skeletons and polish
- #68: Cleanup test data script

**Sonnet agents (2 issues):**
- #63: Create club details page
- #67: Create test clubs

```bash
# Orchestrator launches all 7 in parallel
# Each in separate git worktree
# Monitored by resource monitor
```

## Scripts Reference

### `benchmark-machine.sh`

Analyzes system capacity and creates configuration.

**Usage:**
```bash
./scripts/benchmark-machine.sh
```

**Output:**
- System specs
- Recommended max agents
- Risk level
- Config file: `/tmp/claude-orchestration-config.env`

**When to run:**
- First time setup
- After system upgrades
- If experiencing performance issues

---

### `monitor-resources.sh`

Continuously monitors CPU, memory, disk usage. Kills agents if thresholds exceeded.

**Usage:**
```bash
# Run in separate terminal
./scripts/monitor-resources.sh

# Or with custom thresholds
MEMORY_THRESHOLD=85 CPU_THRESHOLD=95 ./scripts/monitor-resources.sh
```

**Thresholds (default):**
- Memory: 80%
- CPU: 90%
- Disk: 90%

**Kill switch:**
- Automatically kills all Claude processes if thresholds exceeded
- Logs to `/tmp/claude-monitor.log`

**Output:**
```
[14:22:35] Memory: 45% | CPU: 30% | Disk: 15% | Claude Processes: 7 (3500MB)
```

---

### `create-implementation-plan.sh`

Launches planning agent to create contracts and dependency analysis.

**Usage:**
```bash
./scripts/create-implementation-plan.sh
```

**Creates:**
- `docs/browse-clubs/implementation-plan.md`
- `docs/browse-clubs/dependency-graph.md`
- `docs/browse-clubs/contracts.ts`
- `docs/browse-clubs/file-ownership.md`
- `docs/browse-clubs/verification-checklist.md`
- `docs/browse-clubs/integration-plan.md`

**When to run:**
- Before parallel orchestration
- When adding new issues
- When dependencies change

---

### `orchestrate-parallel.sh`

Main orchestration script. Manages agent lifecycle and resource allocation.

**Usage:**
```bash
# Run all 8 agents (default max from benchmark)
./scripts/orchestrate-parallel.sh

# Run with custom max
./scripts/orchestrate-parallel.sh --max-agents 5

# Run in batches if needed
./scripts/orchestrate-parallel.sh --max-agents 4 --batched

# Dry run (see plan without executing)
./scripts/orchestrate-parallel.sh --dry-run

# Custom config
./scripts/orchestrate-parallel.sh --config /path/to/config.env
```

**Options:**
- `--max-agents N` - Max concurrent agents (default: from benchmark)
- `--batched` - Run in batches if more issues than max agents
- `--dry-run` - Show execution plan without running
- `--config FILE` - Use custom config file
- `-h, --help` - Show help

**Execution flow:**
1. Load configuration
2. Start resource monitor
3. Run issue #61 (blocking)
4. Launch issues #62-68 in parallel
5. Wait for completion
6. Report results

**Logs:**
- Monitor: `/tmp/claude-monitor.log`
- Monitor output: `/tmp/claude-monitor-output.log`
- Per-issue: `/tmp/claude-issue-{N}.log`

---

## Configuration

### Environment Variables

**Resource Monitoring:**
```bash
MEMORY_THRESHOLD=80      # Kill agents if memory exceeds 80%
CPU_THRESHOLD=90         # Warn if CPU exceeds 90%
DISK_THRESHOLD=90        # Kill agents if disk exceeds 90%
CHECK_INTERVAL=5         # Check every 5 seconds
```

**Orchestration:**
```bash
MAX_AGENTS=8             # Max concurrent agents
BATCHED=false            # Run in batches
DRY_RUN=false            # Dry run mode
CONFIG_FILE=/tmp/claude-orchestration-config.env
```

### Generated Config File

Located at `/tmp/claude-orchestration-config.env`:

```bash
# System specs
CPU_CORES=16
TOTAL_RAM_MB=21504
AVAILABLE_RAM_MB=21146

# Concurrency limits
MAX_CONCURRENT_AGENTS=8
CONSERVATIVE_MAX_AGENTS=5
RISK_LEVEL=VERY_LOW

# Resource thresholds
MEMORY_THRESHOLD=80
CPU_THRESHOLD=90
DISK_THRESHOLD=90

# Timing
AGENT_LAUNCH_DELAY=3
```

---

## Monitoring & Debugging

### Real-time Monitoring

**Terminal 1: Resource monitor**
```bash
./scripts/monitor-resources.sh
```

**Terminal 2: Watch agent logs**
```bash
tail -f /tmp/claude-issue-*.log
```

**Terminal 3: System resources**
```bash
watch -n 2 'free -h && echo "" && uptime'
```

### Check Agent Status

```bash
# Count running agents
pgrep -f "claude" | wc -l

# See agent processes
ps aux | grep claude | grep -v grep

# Check logs
ls -lh /tmp/claude-*.log
```

### If Something Goes Wrong

**Agents stuck:**
```bash
# Kill all Claude processes
pkill -TERM -f "claude"

# Force kill if needed
pkill -KILL -f "claude"
```

**Clean up worktrees:**
```bash
# List worktrees
git worktree list

# Remove worktree
git worktree remove ../wine-club-62
```

**Reset everything:**
```bash
# Kill agents
pkill -f "claude"

# Remove worktrees
for i in {61..68}; do
  git worktree remove ../wine-club-$i 2>/dev/null || true
done

# Clean logs
rm /tmp/claude-*.log
```

---

## Risk Management

### Risk Levels (from benchmark)

**VERY_LOW (Your machine):**
- ✓ 16+ CPU cores
- ✓ 20+ GB RAM
- ✓ Can run 8+ agents safely

**LOW:**
- ✓ 8-16 GB RAM
- ✓ 4-8 CPU cores
- Run 4-8 agents safely

**MEDIUM:**
- ⚠️ 4-8 GB RAM
- ⚠️ 2-4 CPU cores
- Run 2-4 agents, batched

**HIGH:**
- ⚠️ <4 GB RAM
- ⚠️ <2 CPU cores
- Run 1-2 agents maximum, sequential

### Kill Switch Triggers

Monitor kills agents if:
1. **Memory usage > 80%** (configurable)
2. **Disk usage > 90%**
3. **Manual intervention** (Ctrl+C on monitor)

### Preventing Conflicts

1. **Git worktrees** - Each agent has isolated file system
2. **Contracts** - Predefined interfaces prevent API mismatches
3. **File ownership** - Each issue owns specific files
4. **Dependency order** - Issue #61 runs first (blocking)

---

## Benchmarking Results

Your machine (as of 2026-01-28):

```
CPU: 16 cores
RAM: 21GB
Risk: VERY_LOW

Recommended: 8 concurrent agents
Conservative: 5 concurrent agents

✓ Can run all 8 agents in parallel safely
```

---

## FAQ

**Q: Can I run agents on different branches?**
A: Yes, each agent works in a separate worktree with its own branch.

**Q: What happens if my machine runs out of memory?**
A: The resource monitor kills all Claude processes automatically.

**Q: Can I resume agents after they're killed?**
A: Yes, use `claude /resume` in the worktree directory.

**Q: How do I merge the branches?**
A: Merge in dependency order: #61 first, then #62-68 in any order.

**Q: What if two agents modify the same file?**
A: The planning agent flags this in file-ownership.md. Avoid if possible.

**Q: Can I run fewer agents?**
A: Yes, use `--max-agents N` to limit concurrency.

**Q: Do I need to monitor manually?**
A: No, the monitor script runs automatically and has a kill switch.

**Q: What's the cost of running 8 agents?**
A: ~$5-10 for the entire feature (estimated, depends on complexity).

---

## Success Criteria

After orchestration completes:

**Per Issue:**
- [ ] Branch created and pushed
- [ ] Code committed with clear messages
- [ ] `npm run build` passes
- [ ] No merge conflicts with main

**Integration:**
- [ ] All branches merge cleanly
- [ ] Full `npm run build` passes
- [ ] Browse clubs feature works end-to-end
- [ ] Vercel preview deployment successful

**System:**
- [ ] No machine crashes
- [ ] Resource usage stayed within limits
- [ ] All agent logs available

---

## Troubleshooting

### Issue: Agent not starting

**Check:**
```bash
# Worktree exists?
ls -la ../wine-club-62

# Git status clean?
cd ../wine-club-62 && git status

# Log file shows errors?
cat /tmp/claude-issue-62.log
```

**Fix:**
```bash
# Remove and recreate worktree
git worktree remove ../wine-club-62
./scripts/orchestrate-parallel.sh
```

---

### Issue: Monitor killed agents

**Check:**
```bash
cat /tmp/claude-monitor.log | grep "CRITICAL"
```

**Fix:**
- Reduce `--max-agents`
- Increase thresholds (risky)
- Close other applications

---

### Issue: Merge conflicts

**Check:**
```bash
cat docs/browse-clubs/file-ownership.md
```

**Fix:**
- Review which files conflict
- Manually resolve in main branch
- Re-run affected agents if needed

---

## Next Steps

After orchestration completes:

1. **Review each branch:**
   ```bash
   for i in {61..68}; do
     cd ../wine-club-$i
     git log --oneline
     git diff main
   done
   ```

2. **Integration testing:**
   ```bash
   cd /home/user/wine-club
   git checkout main
   git pull
   npm run build
   ```

3. **Create PRs:**
   - Merge #61 first
   - Then merge #62-68
   - Vercel creates preview for each

4. **Cleanup:**
   ```bash
   # Remove worktrees
   for i in {61..68}; do
     git worktree remove ../wine-club-$i
   done

   # Delete branches (after merge)
   git branch -d issue-62-branch issue-63-branch ...
   ```

---

## Contact & Support

For issues with orchestration:
1. Check logs in `/tmp/claude-*.log`
2. Review monitor output
3. Consult planning docs in `docs/browse-clubs/`

For Claude Code issues:
- Documentation: https://code.claude.com/docs
- Issues: https://github.com/anthropics/claude-code/issues
