#!/bin/bash
# CI Monitor Hook - Waits for GitHub Actions after push to main
# Blocks Claude on CI failure with diagnostic info for auto-investigation
# Version: 1.0.2

set -e

# Read JSON input from stdin
json=$(cat)

command=$(echo "$json" | jq -r '.tool_input.command // ""')
exit_code=$(echo "$json" | jq -r '.tool_response.exitCode // 0')
cwd=$(echo "$json" | jq -r '.cwd // ""')

# Only process successful git push commands
if [[ "$exit_code" != "0" ]]; then
  exit 0
fi

# Check if this is a git push command
if [[ ! "$command" =~ ^git[[:space:]]+push ]]; then
  exit 0
fi

# Determine if pushing to main
is_main_push=false

# Explicit push to main/origin main
if [[ "$command" =~ (origin[[:space:]]+main|main$|main[[:space:]]) ]]; then
  is_main_push=true
fi

# Simple "git push" - check current branch
if [[ "$command" =~ ^git[[:space:]]+push[[:space:]]*$ ]] || [[ "$command" =~ ^git[[:space:]]+push[[:space:]]+-[a-zA-Z] ]]; then
  current_branch=$(cd "$cwd" && git branch --show-current 2>/dev/null)
  if [[ "$current_branch" == "main" ]]; then
    is_main_push=true
  fi
fi

if [[ "$is_main_push" != "true" ]]; then
  exit 0
fi

# --- CI Monitoring starts here ---

# Target workflow name (the main build/deploy workflow)
TARGET_WORKFLOW="Deploy to Dev (GitHub Pages)"

echo "Waiting for CI workflow to start..." >&2

# Wait for workflow to appear (max 60 seconds)
workflow_found=false
for i in {1..12}; do
  sleep 5
  # Get recent workflow runs, filter for target workflow on main
  run_info=$(gh run list --limit 10 --json databaseId,status,conclusion,name,headBranch,createdAt,url 2>/dev/null || echo "")

  if [[ -n "$run_info" ]] && [[ "$run_info" != "[]" ]]; then
    # Find the target workflow on main branch
    filtered=$(echo "$run_info" | jq -r --arg name "$TARGET_WORKFLOW" '[.[] | select(.name == $name and .headBranch == "main")] | .[0] // empty')

    if [[ -n "$filtered" ]] && [[ "$filtered" != "null" ]]; then
      run_info="[$filtered]"
      workflow_found=true
      break
    fi
  fi
done

if [[ "$workflow_found" != "true" ]]; then
  echo "Warning: No '$TARGET_WORKFLOW' workflow detected after push to main" >&2
  exit 0
fi

run_id=$(echo "$run_info" | jq -r '.[0].databaseId')
workflow_name=$(echo "$run_info" | jq -r '.[0].name')
run_url=$(echo "$run_info" | jq -r '.[0].url')

echo "Monitoring: $workflow_name (Run #$run_id)" >&2
echo "URL: $run_url" >&2
echo "" >&2

# Poll for completion (max 10 minutes = 60 iterations * 10 seconds)
max_iterations=60
iteration=0
spinner=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')

while [[ $iteration -lt $max_iterations ]]; do
  run_info=$(gh run view "$run_id" --json status,conclusion,jobs 2>/dev/null || echo "")

  if [[ -z "$run_info" ]]; then
    echo "Error: Could not fetch workflow status" >&2
    exit 0
  fi

  status=$(echo "$run_info" | jq -r '.status // "unknown"')
  conclusion=$(echo "$run_info" | jq -r '.conclusion // ""')

  # Show spinner with status
  spin_char="${spinner[$((iteration % 10))]}"
  printf "\r%s CI Status: %s " "$spin_char" "$status" >&2

  if [[ "$status" == "completed" ]]; then
    echo "" >&2

    if [[ "$conclusion" == "success" ]]; then
      echo "CI passed successfully" >&2
      cat << EOF
{
  "decision": "allow",
  "additionalContext": "CI workflow '$workflow_name' completed successfully. Build and tests passed."
}
EOF
      exit 0
    else
      # CI FAILED - Block Claude and provide diagnostic info
      echo "CI FAILED with conclusion: $conclusion" >&2
      echo "" >&2

      # Get failed job details
      failed_jobs=$(echo "$run_info" | jq -r '.jobs[] | select(.conclusion == "failure") | .name' 2>/dev/null || echo "")

      # Get workflow logs summary
      logs=$(gh run view "$run_id" --log-failed 2>/dev/null | tail -100 || echo "No logs available")

      # Output diagnostic info to stderr (shown to Claude when blocking)
      cat << EOF >&2

================================================================================
CI FAILURE DETECTED - AUTO-INVESTIGATION REQUIRED
================================================================================

Workflow: $workflow_name
Run ID: $run_id
URL: $run_url
Conclusion: $conclusion

Failed Jobs:
$failed_jobs

Last 100 lines of failed job logs:
--------------------------------------------------------------------------------
$logs
--------------------------------------------------------------------------------

Please investigate the CI failure above and fix the issue.
================================================================================
EOF

      # Exit 2 blocks Claude from proceeding
      exit 2
    fi
  fi

  sleep 10
  ((iteration++))
done

echo "" >&2
echo "Warning: CI still running after 10 minutes. Continuing without waiting." >&2
exit 0
