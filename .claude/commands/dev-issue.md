# Issue Development Workflow v4

Pick up the next ready issue, assess it, and either complete it or document blockers.
Designed for autonomous operation with subagent delegation and memory-assisted context.
**Now supports parallel sessions via git worktrees.**

---

## Parallel Sessions (Worktree Mode)

Git worktrees allow multiple Claude sessions to work on different issues simultaneously without conflicts.

### How It Works

```
~/code/
├── Rackarr/                    # Main worktree (main branch)
├── Rackarr-issue-38/           # Worktree for issue #38
└── Rackarr-issue-41/           # Worktree for issue #41
```

Each worktree is an independent directory with its own files, but they share git history.

### When to Use Worktrees

| Scenario                      | Recommendation         |
| ----------------------------- | ---------------------- |
| Single issue                  | Stay in main directory |
| Parallel issues (independent) | Use worktrees          |
| Reviewing someone else's work | Use worktrees          |

### Worktree Commands Reference

```bash
# Create worktree for an issue
git worktree add ../Rackarr-issue-<N> -b <type>/<N>-<description>

# List all worktrees (shows which issues are "claimed")
git worktree list

# Remove worktree after merging
git worktree remove ../Rackarr-issue-<N>

# Prune stale references
git worktree prune
```

---

## Memory Integration

This workflow uses the `mem-search` skill to leverage past work context:

| Phase          | Memory Use                        | Benefit                                       |
| -------------- | --------------------------------- | --------------------------------------------- |
| Pre-flight     | Get recent context                | Skip re-reading docs if recent work covers it |
| Assessment     | Search for prior work on issue    | Avoid repeating failed approaches             |
| Planning       | Find past architectural decisions | Maintain consistency                          |
| Error Recovery | Search for similar past bugs      | Apply known solutions faster                  |
| Completion     | Document key learnings            | Build knowledge base for future               |

**When to use memory vs. fresh exploration:**

- **Memory first:** Decisions, patterns, past attempts, known gotchas
- **Fresh exploration:** Current file contents, test results, git state

---

## Permissions Granted

You have **explicit permission** to perform the following WITHOUT asking:

| Action                     | Scope                                                                     |
| -------------------------- | ------------------------------------------------------------------------- |
| Create/switch git branches | Any branch matching `(fix\|feat\|chore\|refactor\|test\|docs)/<number>-*` |
| Create/remove worktrees    | Sibling directories named `Rackarr-issue-<N>`                             |
| Edit files                 | All files in `src/`, `docs/`, test files                                  |
| Run commands               | `npm test`, `npm run build`, `npm run lint`, `npm install`, `gh` CLI      |
| Git operations             | add, commit, push (to non-main branches), fetch, pull, worktree           |
| Create PRs                 | Via `gh pr create`                                                        |
| Merge PRs                  | Via `gh pr merge --squash` after checks pass                              |
| Comment on issues          | Via `gh issue comment`                                                    |

**STOP and ask only for:**

- Force push to any branch
- Any operation on `main` branch directly
- Deleting branches not created in this session
- Removing worktrees not created in this session
- Genuine ambiguity requiring human judgment

---

## Phase 1: Pre-flight (Parallel)

Launch these operations **in parallel** using the Task tool:

### 1a. Worktree Detection

Determine if we're in a worktree and what issues are already claimed:

```bash
# Check if we're in a worktree (vs main working directory)
git rev-parse --is-inside-work-tree && git worktree list

# Parse output to identify:
# 1. Current worktree path and branch
# 2. Other worktrees and their branches (extract issue numbers from branch names)
```

**Parse worktree list to extract claimed issues:**

- Branch pattern: `(fix|feat|test|...)/<number>-*` → issue #<number> is claimed
- Store claimed issue numbers to filter from available issues

**If already in a worktree (not main directory):**

- Extract issue number from current branch name
- Skip to Phase 2 with that specific issue (don't pick a new one)
- This allows resuming work in an existing worktree

### 1b. Context Loading (Memory-First Approach)

**Step 1: Search Memory** (use mem-search skill)

```
mcp__plugin_claude-mem_claude-mem-search__get_recent_context:
  project: "Rackarr"
  limit: 30
```

This provides:

- Recent architectural decisions
- Patterns from past implementations
- Known gotchas and solutions

**Step 2: Fill Gaps** (only if memory lacks coverage)
If memory doesn't cover core architecture, use Explore agent:

```
Prompt: "Read docs/reference/SPEC.md and docs/ARCHITECTURE.md.
Summarize: (1) key architectural patterns, (2) file organization,
(3) testing conventions. Keep summary under 500 words."
```

### 1c. WIP Branch Check (Bash)

```bash
git fetch origin --prune
git branch -a | grep -E "(fix|feat|chore|refactor|test|docs)/" || echo "No WIP branches"
```

### 1d. Issue Fetch (Bash)

```bash
gh issue list -R Rackarr/Rackarr --state open --label ready \
  --json number,title,labels,body \
  --jq 'sort_by(
    (.labels | map(.name) | if any(test("priority:urgent")) then 0
      elif any(test("priority:high")) then 1
      elif any(test("priority:medium")) then 2
      else 3 end),
    (.labels | map(.name) | if any(test("size:small")) then 0
      elif any(test("size:medium")) then 1
      else 2 end)
  ) | .[0:5]'  # Fetch top 5 for filtering
```

**Filter out claimed issues:** Remove any issues whose number matches a worktree branch from step 1a.

**If no unclaimed issues:** Write to progress file, report "No ready issues available (N issues claimed by other worktrees)", and stop.

---

## Phase 2: Issue Assessment

### 2a. Select Issue

From the fetched issues, pick the first one. Read full details:

```bash
gh issue view <number> --json number,title,body,labels,comments
```

### 2a-1. Historical Context Check (mem-search skill)

**Before proceeding**, search memory for past work on this issue:

```
mcp__plugin_claude-mem_claude-mem-search__search:
  query: "#<number> OR <keywords from title>"
  project: "Rackarr"
  limit: 10
```

Also search for related patterns:

```
mcp__plugin_claude-mem_claude-mem-search__search:
  concepts: "<feature area from issue>"
  type: "decision,bugfix"
  limit: 10
```

This reveals:

- **Prior attempts:** WIP branches, partial implementations
- **Design decisions:** Why things were built a certain way
- **Known patterns:** What worked/failed in similar areas
- **Blockers encountered:** Issues to watch for

**If prior work exists:** Review it before planning. Don't repeat failed approaches.

### 2b. Determine Complexity

**Simple Issue** (proceed directly to implementation):

- Has `size:small` label AND
- Acceptance criteria are explicit AND
- Affects ≤3 files (estimate from description)

**Complex Issue** (requires planning):

- Has `size:medium` or `size:large` label OR
- Has `type:feature` or architectural scope OR
- Acceptance criteria need interpretation OR
- Affects >3 files or multiple subsystems

### 2c. For Complex Issues: Use Plan Agent

**First:** If not already done, search memory for architectural decisions in this area:

```
mcp__plugin_claude-mem_claude-mem-search__search:
  concepts: "<feature area>"
  type: "decision"
  project: "Rackarr"
  limit: 5
```

**Then:** Launch Task with `subagent_type: Plan`, including memory context:

```
Prompt: "Design implementation for Issue #<number>: <title>

<paste issue body>

Relevant past decisions from this project:
<paste memory search results if any>

Consider:
1. Which files need changes
2. What tests to write (TDD)
3. Any architectural decisions (check if past decisions constrain this)
4. Risk areas

Output a numbered implementation plan."
```

Review the plan. If reasonable, proceed. If concerns, note them and continue (don't block on minor issues).

### 2d. Identify Affected Files (Task: Explore agent)

For issues where affected files aren't obvious:

```
Prompt: "Find files related to: <feature/component from issue>.
Search for: imports, type definitions, component usages, test files.
Return file paths with brief relevance notes."
```

---

## Phase 3: Implementation

### 3a. Create Branch (or Worktree)

**If already in a worktree for this issue:** Skip to 3b (branch already exists).

**If in main directory, choose approach:**

#### Option A: Same-directory branch (default, single session)

```bash
# Ensure clean state
git checkout main
git pull origin main

# Create branch: <type>/<issue-number>-<short-description>
git checkout -b fix/42-short-description
```

#### Option B: New worktree (enables parallel sessions)

Use this when you want to allow other sessions to work on different issues:

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create worktree with branch in sibling directory
git worktree add ../Rackarr-issue-42 -b fix/42-short-description

# Install dependencies in new worktree
cd ../Rackarr-issue-42
npm install

# Stay here for development
```

**Worktree naming convention:** `<repo-name>-issue-<number>`

**Note:** After creating a worktree, you must run `npm install` as each worktree has its own `node_modules/`.

### 3b. Update Progress File

```bash
cat >> .claude/session-progress.md << 'EOF'

## Issue #<number>: <title>
**Started:** $(date -Iseconds)
**Branch:** `<branch-name>`
**Status:** In Progress

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
EOF
```

### 3c. TDD Workflow

For each acceptance criterion:

1. **Write failing test first**

   ```bash
   npm run test -- src/tests/<TestFile>.test.ts --reporter=verbose
   ```

2. **Implement minimum code to pass**
   - Use Read tool to understand existing code
   - Use Edit tool for changes
   - Follow Svelte 5 patterns (see Quick Reference below)

3. **Verify test passes**

   ```bash
   npm run test:run
   ```

4. **Mark criterion complete in progress file**

### 3d. Pre-Commit Verification

Before committing, run full verification:

```bash
npm run lint && npm run test:run && npm run build
```

**If failures occur:** See Error Recovery section.

### 3e. Commit

```bash
git add -A
git commit -m "$(cat <<'EOF'
<type>: <description>

Fixes #<number>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### 3f. Push and Create PR

```bash
git push -u origin <branch-name>

gh pr create --title "<type>: <description> (Issue #<number>)" --body "$(cat <<'EOF'
## Summary
<1-3 bullets describing changes>

## Changes
- `file1.ts`: <what changed>
- `file2.svelte`: <what changed>

## Test Plan
- [x] Unit tests added/updated
- [x] All tests pass (`npm run test:run`)
- [x] Build succeeds (`npm run build`)
- [x] Lint passes (`npm run lint`)

Closes #<number>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 3g. Merge (Auto)

Wait for CI checks, then merge:

```bash
# Check PR status
gh pr checks --watch

# Merge when checks pass
gh pr merge --squash --delete-branch --auto
```

If `--auto` not available:

```bash
gh pr merge --squash --delete-branch
```

### 3h. Worktree Cleanup (if using worktrees)

**If working in a worktree**, clean up after merge:

```bash
# Return to main directory
cd ../Rackarr

# Update main with merged changes
git checkout main
git pull origin main

# Remove the worktree
git worktree remove ../Rackarr-issue-42

# Prune any stale references
git worktree prune
```

**If staying to work on another issue**, you can reuse the worktree:

```bash
# From within the worktree, update and create new branch
git fetch origin main:main
git checkout -b fix/43-next-issue
```

### 3i. Update Progress File

```bash
# Update status
sed -i 's/Status:** In Progress/Status:** Completed/' .claude/session-progress.md

# Add completion note
cat >> .claude/session-progress.md << 'EOF'
**Completed:** $(date -Iseconds)
**PR:** <pr-url>
EOF
```

---

## Phase 4: Continue or Stop

### Check for More Issues

```bash
gh issue list -R Rackarr/Rackarr --state open --label ready --json number | jq 'length'
```

### Decision

**If more issues exist AND in autonomous mode:**

- Return to Phase 1 immediately
- Do NOT pause for confirmation

**If in a worktree:**

- After completing the current issue, clean up (3h)
- Either return to main directory for next issue, OR
- Reuse worktree for next issue if continuing in this session

**If no more issues:**

- Write final summary to progress file
- Clean up any worktrees
- Report completion

**Stopping conditions (ONLY these stop the loop):**

1. No ready issues remaining (excluding claimed worktrees)
2. Blocker hit (after error recovery attempts)
3. User interruption

---

## Error Recovery

### Test Failures

**Attempt 1:** Read test output carefully, fix obvious issues.

**Attempt 2:** Search memory for similar past failures:

```
mcp__plugin_claude-mem_claude-mem-search__search:
  query: "<error message keywords>"
  type: "bugfix"
  project: "Rackarr"
  limit: 5
```

Check if we've solved this pattern before. Also check:

- Svelte 5 reactivity issues (see Quick Reference)
- Async timing issues

**Attempt 3:** Launch Task with Plan agent:

```
Prompt: "Tests are failing after 2 fix attempts.

Test output: <paste>

Implementation: <paste relevant code>

Related past fixes from memory:
<paste memory search results if any>

Analyze the mismatch and suggest a fix."
```

**After 3 failures:** Proceed to Blocker Handling.

### Lint/Build Failures

Usually auto-fixable:

```bash
npm run lint -- --fix
```

If not auto-fixable, read the error and fix manually. These rarely need multiple attempts.

---

## Blocker Handling

If genuinely blocked:

### 1. Commit WIP

```bash
git add -A
git commit -m "wip: partial progress on #<number>" --no-verify
git push -u origin <branch-name>
```

### 2. Comment on Issue

```bash
gh issue comment <number> --body "$(cat <<'EOF'
## Progress Update

**Status:** Blocked

**Completed:**
- [x] Item 1
- [x] Item 2

**Blocker:**
<clear description of what's blocking>

**Attempted:**
<what was tried>

**Next Steps:**
<what needs to happen to unblock>

**Branch:** `<branch-name>` (WIP)
EOF
)"
```

### 3. Update Progress File

```bash
cat >> .claude/session-progress.md << 'EOF'

**Status:** BLOCKED
**Blocker:** <description>
**Branch:** `<branch-name>` (WIP)
EOF
```

### 4. Stop

Do not continue to next issue. Report blocker and stop.

---

## Quick Reference

### Worktree Commands

```bash
# Create worktree for issue
git worktree add ../Rackarr-issue-<N> -b <type>/<N>-<desc>

# List all worktrees (see claimed issues)
git worktree list

# Remove worktree after merge
git worktree remove ../Rackarr-issue-<N>

# Detect if in worktree (empty = main, path = worktree)
git rev-parse --git-common-dir | grep -v "^\.git$" || echo ""

# Extract issue number from branch
git branch --show-current | grep -oP '(?<=/)\d+(?=-)'
```

### Svelte 5 Runes (Required)

```svelte
<!-- ✅ CORRECT -->
let count = $state(0);
let doubled = $derived(count * 2);
let items = $state<Item[]>([]);

<!-- ❌ WRONG: Svelte 4 -->
import { writable } from 'svelte/store';
$: doubled = count * 2;
```

### Reactivity (Critical)

```typescript
// ✅ Triggers reactivity
items = [...items, newItem];
object = { ...object, key: newValue };

// ❌ Silent failure - no update
items.push(newItem);
object.key = newValue;
```

### Testing Patterns

```typescript
// Use factories
import { createTestDevice, createTestRack } from './factories';

// Prefer test IDs
screen.getByTestId('btn-save');

// File location: src/tests/<Name>.test.ts
```

### Memory Search (mem-search skill)

```
# Recent context for current project
mcp__plugin_claude-mem_claude-mem-search__get_recent_context:
  project: "Rackarr"
  limit: 30

# Search by query (full-text)
mcp__plugin_claude-mem_claude-mem-search__search:
  query: "error handling archive"
  project: "Rackarr"

# Search by type (decision, bugfix, feature, refactor, discovery)
mcp__plugin_claude-mem_claude-mem-search__search:
  type: "decision"
  project: "Rackarr"

# Search by concepts (feature areas)
mcp__plugin_claude-mem_claude-mem-search__search:
  concepts: "archive,zip,export"
  project: "Rackarr"

# Timeline around a specific observation
mcp__plugin_claude-mem_claude-mem-search__get_context_timeline:
  anchor: <observation_id>
  depth_before: 10
  depth_after: 10
```

### Type-Specific Checklists

**bug:**

- [ ] Reproduce first
- [ ] Write failing test capturing bug
- [ ] Fix and verify
- [ ] Check for similar patterns elsewhere

**feature:**

- [ ] Understand acceptance criteria
- [ ] Plan approach (if complex)
- [ ] TDD implementation
- [ ] Update docs if needed

**area:ui:**

- [ ] Keyboard navigation works
- [ ] Dark/light theme correct
- [ ] Uses design tokens (not hardcoded)

---

## Output Format

After each issue (completed or blocked):

```
## Issue #<number>: <title>

**Status:** ✅ Completed | ❌ Blocked
**Branch:** `<branch-name>`
**PR:** <url> (if created)
**Duration:** <time>

**Summary:**
<what was done>

**Files Changed:**
- `file1.ts`: <change summary>
- `file2.svelte`: <change summary>

**Key Learnings:** (for future memory)
- <patterns discovered>
- <non-obvious decisions made and why>
- <gotchas encountered>
```

Note: Key learnings are automatically captured by claude-mem and will be available in future sessions via memory search.

After session ends:

```
## Session Summary

**Issues Completed:** N
**Issues Blocked:** M
**Total Time:** X

**Completed:**
1. #42: Title - PR #123
2. #43: Title - PR #124

**Blocked:**
1. #44: Title - <blocker reason>
```
