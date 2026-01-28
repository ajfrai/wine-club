#!/bin/bash
# Intelligent orchestration script for parallel Claude Code agents
# Respects machine capacity and monitors resources during execution

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default configuration
CONFIG_FILE="${CONFIG_FILE:-/tmp/claude-orchestration-config.env}"
MAX_AGENTS="${MAX_AGENTS:-4}"
BATCHED="${BATCHED:-false}"
DRY_RUN="${DRY_RUN:-false}"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --max-agents)
            MAX_AGENTS="$2"
            shift 2
            ;;
        --batched)
            BATCHED=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --max-agents N    Maximum concurrent agents (default: 4)"
            echo "  --batched         Run in batches if needed"
            echo "  --dry-run         Show plan without executing"
            echo "  --config FILE     Use custom config file"
            echo "  -h, --help        Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Load configuration if exists
if [ -f "$CONFIG_FILE" ]; then
    echo -e "${GREEN}Loading configuration from $CONFIG_FILE${NC}"
    source "$CONFIG_FILE"
    echo ""
else
    echo -e "${YELLOW}Warning: Config file not found. Run ./scripts/benchmark-machine.sh first${NC}"
    echo "Using defaults..."
    echo ""
fi

# Project root
PROJECT_ROOT="/home/user/wine-club"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "Claude Code Parallel Orchestration"
echo "=========================================="
echo ""
echo "Configuration:"
echo "  Max concurrent agents: $MAX_AGENTS"
echo "  Batched execution: $BATCHED"
echo "  Dry run: $DRY_RUN"
echo ""

# Define issue configurations
# Format: issue_number:model:description
declare -a ISSUES=(
    "61:sonnet:Update get_nearby_clubs RPC with member count"
    "62:haiku:Enhance ClubCard component"
    "63:sonnet:Create club details page"
    "64:haiku:Add text search and sorting"
    "65:haiku:Add empty states"
    "66:haiku:Add loading skeletons and polish"
    "67:sonnet:Create test clubs"
    "68:haiku:Cleanup test data script"
)

# Function to check if monitor is running
check_monitor() {
    if pgrep -f "monitor-resources.sh" > /dev/null; then
        echo -e "${GREEN}✓ Resource monitor is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ Resource monitor not running${NC}"
        return 1
    fi
}

# Function to start resource monitor
start_monitor() {
    if ! check_monitor; then
        echo "Starting resource monitor..."
        bash ./scripts/monitor-resources.sh > /tmp/claude-monitor-output.log 2>&1 &
        MONITOR_PID=$!
        echo "Monitor PID: $MONITOR_PID"
        sleep 2

        if check_monitor; then
            echo -e "${GREEN}✓ Monitor started successfully${NC}"
        else
            echo -e "${RED}✗ Failed to start monitor${NC}"
            exit 1
        fi
    fi
    echo ""
}

# Function to get current resource usage
get_current_resources() {
    local mem_usage=$(free | awk '/Mem:/ {printf "%.0f", ($3/$2) * 100}')
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
    local claude_count=$(pgrep -f "claude" | wc -l)

    echo "Current: Memory ${mem_usage}% | Load ${cpu_load} | Claude processes: ${claude_count}"
}

# Function to check if safe to launch agent
is_safe_to_launch() {
    local current_agents=$(pgrep -f "claude" | wc -l)
    local mem_usage=$(free | awk '/Mem:/ {printf "%.0f", ($3/$2) * 100}')

    if [ "$current_agents" -ge "$MAX_AGENTS" ]; then
        echo -e "${YELLOW}Max agents ($MAX_AGENTS) reached${NC}"
        return 1
    fi

    if [ "$mem_usage" -gt 70 ]; then
        echo -e "${YELLOW}Memory usage too high (${mem_usage}%)${NC}"
        return 1
    fi

    return 0
}

# Function to create worktree for issue
create_worktree() {
    local issue_num=$1
    local worktree_path="../wine-club-${issue_num}"
    local branch_name="issue-${issue_num}-branch"

    if [ -d "$worktree_path" ]; then
        echo -e "${YELLOW}Worktree already exists: $worktree_path${NC}"
        return 0
    fi

    echo "Creating worktree for issue #${issue_num}..."
    git worktree add "$worktree_path" -b "$branch_name" 2>/dev/null || {
        echo -e "${YELLOW}Branch exists, checking out...${NC}"
        git worktree add "$worktree_path" "$branch_name"
    }
}

# Function to launch agent for issue
launch_agent() {
    local issue_num=$1
    local model=$2
    local description=$3
    local worktree_path="../wine-club-${issue_num}"

    echo -e "${BLUE}Launching agent for issue #${issue_num} (model: ${model})${NC}"
    echo "  Description: $description"
    echo "  Worktree: $worktree_path"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN] Would launch: claude --model $model 'Implement issue #${issue_num}'${NC}"
        return 0
    fi

    # Create worktree
    create_worktree "$issue_num"

    # Launch agent in background
    cd "$worktree_path"

    # Create log file
    local log_file="/tmp/claude-issue-${issue_num}.log"

    # Launch Claude Code
    nohup claude --model "$model" << EOF > "$log_file" 2>&1 &
Review GitHub issue #${issue_num}: ${description}

Read the issue details, understand requirements, and implement the solution.

Guidelines:
- Follow /home/user/wine-club/CLAUDE.md rules
- No local dev servers (npm run dev)
- Run 'npm run build' to verify
- Commit changes when complete
- Push to branch when ready

Start implementation.
EOF

    local agent_pid=$!
    echo "  Agent PID: $agent_pid"
    echo "  Log: $log_file"
    echo ""

    cd "$PROJECT_ROOT"
}

# Function to wait for agents to complete
wait_for_agents() {
    echo "Waiting for agents to complete..."
    echo "You can monitor progress in separate terminals or check logs in /tmp/claude-issue-*.log"
    echo ""

    while [ $(pgrep -f "claude" | wc -l) -gt 0 ]; do
        get_current_resources
        sleep 10
    done

    echo -e "${GREEN}All agents completed${NC}"
}

# Main execution flow
main() {
    echo "=== Phase 0: Pre-flight checks ==="
    echo ""

    # Check if benchmark was run
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${YELLOW}Running benchmark first...${NC}"
        bash ./scripts/benchmark-machine.sh
        source "$CONFIG_FILE"
        echo ""
    fi

    # Start resource monitor
    start_monitor

    echo "=== Phase 1: Foundation (Issue #61) ==="
    echo "This issue must complete before others can start"
    echo ""

    if [ "$DRY_RUN" = false ]; then
        # Launch issue #61 (blocking)
        launch_agent 61 sonnet "Update get_nearby_clubs RPC with member count"

        echo "Waiting for issue #61 to complete before proceeding..."
        echo "(This is a blocking dependency)"
        echo ""

        # Wait for issue #61 to complete
        while pgrep -f "claude.*61" > /dev/null; do
            get_current_resources
            sleep 10
        done

        echo -e "${GREEN}✓ Issue #61 completed${NC}"
        echo ""
    else
        echo -e "${YELLOW}[DRY RUN] Would wait for issue #61${NC}"
        echo ""
    fi

    echo "=== Phase 2: Parallel Implementation (Issues #62-68) ==="
    echo ""

    if [ "$BATCHED" = true ] && [ "${#ISSUES[@]}" -gt "$MAX_AGENTS" ]; then
        # Batched execution
        echo "Running in batches of $MAX_AGENTS agents"
        echo ""

        local batch_num=1
        local count=0

        for issue_config in "${ISSUES[@]:1}"; do  # Skip issue 61
            IFS=':' read -r issue_num model description <<< "$issue_config"

            if is_safe_to_launch || [ "$DRY_RUN" = true ]; then
                launch_agent "$issue_num" "$model" "$description"
                ((count++))

                # Wait between launches
                sleep 3

                # Wait if batch full
                if [ $((count % MAX_AGENTS)) -eq 0 ]; then
                    echo "Batch $batch_num full, waiting for completion..."
                    wait_for_agents
                    ((batch_num++))
                    echo ""
                    echo "Starting batch $batch_num..."
                    echo ""
                fi
            else
                echo "Waiting for resources before launching issue #${issue_num}..."
                sleep 5
            fi
        done

        # Wait for final batch
        if [ "$DRY_RUN" = false ]; then
            wait_for_agents
        fi

    else
        # Parallel execution (all at once)
        echo "Launching all agents in parallel (max: $MAX_AGENTS concurrent)"
        echo ""

        for issue_config in "${ISSUES[@]:1}"; do  # Skip issue 61
            IFS=':' read -r issue_num model description <<< "$issue_config"

            # Wait for available slot
            while ! is_safe_to_launch && [ "$DRY_RUN" = false ]; do
                echo "Waiting for resources..."
                sleep 5
            done

            launch_agent "$issue_num" "$model" "$description"

            # Stagger launches
            sleep 3
        done

        echo ""
        echo "All agents launched"
        echo ""

        if [ "$DRY_RUN" = false ]; then
            wait_for_agents
        fi
    fi

    echo ""
    echo "=========================================="
    echo "Orchestration Complete"
    echo "=========================================="
    echo ""

    if [ "$DRY_RUN" = false ]; then
        echo "Review logs:"
        echo "  Monitor: /tmp/claude-monitor.log"
        echo "  Agent logs: /tmp/claude-issue-*.log"
        echo ""
        echo "Next steps:"
        echo "  1. Review each issue's branch"
        echo "  2. Run 'npm run build' to verify integration"
        echo "  3. Create pull requests for each issue"
        echo "  4. Merge in dependency order (#61 first)"
    fi
}

# Run main
main

# Cleanup
trap "pkill -P $$ 2>/dev/null || true" EXIT
