#!/bin/bash
# Resource monitoring script for multi-agent orchestration
# Continuously monitors system resources and kills agents if thresholds exceeded

set -euo pipefail

# Configuration
LOG_FILE="${LOG_FILE:-/tmp/claude-monitor.log}"
CHECK_INTERVAL="${CHECK_INTERVAL:-5}"  # seconds
MEMORY_THRESHOLD="${MEMORY_THRESHOLD:-80}"  # percent
CPU_THRESHOLD="${CPU_THRESHOLD:-90}"  # percent
DISK_THRESHOLD="${DISK_THRESHOLD:-90}"  # percent

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Initialize log
echo "=== Resource Monitor Started at $(date) ===" | tee -a "$LOG_FILE"
echo "Thresholds: Memory=${MEMORY_THRESHOLD}%, CPU=${CPU_THRESHOLD}%, Disk=${DISK_THRESHOLD}%" | tee -a "$LOG_FILE"
echo ""

# Function to get memory usage percentage
get_memory_usage() {
    free | awk '/Mem:/ {printf "%.0f", ($3/$2) * 100}'
}

# Function to get CPU load average (1 min)
get_cpu_load() {
    uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ','
}

# Function to get CPU usage as percentage
get_cpu_usage() {
    local cores=$(nproc)
    local load=$(get_cpu_load)
    awk -v load="$load" -v cores="$cores" 'BEGIN {printf "%.0f", (load/cores)*100}'
}

# Function to get disk usage percentage
get_disk_usage() {
    df -h /home/user/wine-club | awk 'NR==2 {print $5}' | tr -d '%'
}

# Function to count running Claude processes
count_claude_processes() {
    pgrep -f "claude" | wc -l
}

# Function to get memory usage of Claude processes
get_claude_memory() {
    ps aux | grep -E "claude|node.*claude" | grep -v grep | awk '{sum+=$6} END {printf "%.0f", sum/1024}'
}

# Function to kill Claude processes if needed
kill_claude_processes() {
    local reason="$1"
    echo -e "${RED}CRITICAL: Killing Claude processes - $reason${NC}" | tee -a "$LOG_FILE"

    # Get process list for logging
    echo "Processes being killed:" | tee -a "$LOG_FILE"
    ps aux | grep -E "claude|node.*claude" | grep -v grep | tee -a "$LOG_FILE"

    # Kill gracefully first (SIGTERM)
    pkill -TERM -f "claude" 2>/dev/null || true
    sleep 2

    # Force kill if still running (SIGKILL)
    pkill -KILL -f "claude" 2>/dev/null || true

    echo "All Claude processes terminated" | tee -a "$LOG_FILE"
}

# Function to display status
display_status() {
    local mem_usage=$1
    local cpu_usage=$2
    local disk_usage=$3
    local claude_count=$4
    local claude_mem=$5

    local mem_color=$GREEN
    local cpu_color=$GREEN
    local disk_color=$GREEN

    # Color code based on thresholds
    [ "$mem_usage" -gt $((MEMORY_THRESHOLD - 10)) ] && mem_color=$YELLOW
    [ "$mem_usage" -gt "$MEMORY_THRESHOLD" ] && mem_color=$RED

    [ "$cpu_usage" -gt $((CPU_THRESHOLD - 10)) ] && cpu_color=$YELLOW
    [ "$cpu_usage" -gt "$CPU_THRESHOLD" ] && cpu_color=$RED

    [ "$disk_usage" -gt $((DISK_THRESHOLD - 10)) ] && disk_color=$YELLOW
    [ "$disk_usage" -gt "$DISK_THRESHOLD" ] && disk_color=$RED

    echo -e "[$(date '+%H:%M:%S')] Memory: ${mem_color}${mem_usage}%${NC} | CPU: ${cpu_color}${cpu_usage}%${NC} | Disk: ${disk_color}${disk_usage}%${NC} | Claude Processes: $claude_count (${claude_mem}MB)"
}

# Main monitoring loop
echo "Starting monitoring loop (Ctrl+C to stop)..."
echo ""

while true; do
    mem_usage=$(get_memory_usage)
    cpu_usage=$(get_cpu_usage)
    disk_usage=$(get_disk_usage)
    claude_count=$(count_claude_processes)
    claude_mem=$(get_claude_memory)

    # Display current status
    display_status "$mem_usage" "$cpu_usage" "$disk_usage" "$claude_count" "$claude_mem"

    # Check thresholds and take action
    if [ "$mem_usage" -gt "$MEMORY_THRESHOLD" ]; then
        kill_claude_processes "Memory usage exceeded ${MEMORY_THRESHOLD}% (current: ${mem_usage}%)"
        break
    fi

    if [ "$cpu_usage" -gt "$CPU_THRESHOLD" ]; then
        echo -e "${YELLOW}WARNING: CPU usage high: ${cpu_usage}%${NC}" | tee -a "$LOG_FILE"
    fi

    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        kill_claude_processes "Disk usage exceeded ${DISK_THRESHOLD}% (current: ${disk_usage}%)"
        break
    fi

    # Log to file every 10 checks (every 50 seconds with 5s interval)
    if [ $(($(date +%s) % 50)) -eq 0 ]; then
        echo "[$(date)] Mem:${mem_usage}% CPU:${cpu_usage}% Disk:${disk_usage}% Claude:${claude_count} (${claude_mem}MB)" >> "$LOG_FILE"
    fi

    sleep "$CHECK_INTERVAL"
done

echo ""
echo "=== Resource Monitor Stopped at $(date) ===" | tee -a "$LOG_FILE"
