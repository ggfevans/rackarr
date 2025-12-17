# Issue Development Workflow

Pick up the next ready issue, assess it, and either complete it or document blockers.

## Pre-flight

1. **Load project context:**
   - Read `docs/reference/SPEC.md` — authoritative technical reference
   - Read `docs/ARCHITECTURE.md` — entry points and patterns

2. **Check for prior work:**
   - Search memory: `mem-search` skill with issue keywords
   - Check WIP branches: `git branch -a | grep -E "(fix|feat|chore)/"`

## Issue Selection

Find the next issue (ready, highest priority, smallest size):

```bash
gh issue list -R Rackarr/Rackarr --state open --label ready --json number,title,labels \
  --jq 'sort_by(
    (.labels | map(.name) | if any(test("priority:urgent")) then 0
      elif any(test("priority:high")) then 1
      elif any(test("priority:medium")) then 2
      else 3 end),
    (.labels | map(.name) | if any(test("size:small")) then 0
      elif any(test("size:medium")) then 1
      else 2 end)
  ) | .[0]'
```

If no issues match, report "No ready issues available" and stop.

## Assessment Phase

1. **Read the issue** — `gh issue view <number>`
2. **Identify affected files** — from description or by searching codebase
3. **Read related code** — understand current implementation
4. **Check acceptance criteria** — must have clear requirements

### Decision Point

**If requirements are clear:** Continue to Implementation

**If ambiguous or needs investigation:**
- Conduct brief investigation (max 10 minutes)
- Comment findings:
  ```bash
  gh issue comment <number> --body "## Investigation Notes

  [findings]

  **Recommendation:** Ready to implement | Needs clarification on X | Blocked by Y"
  ```
- If blocked, stop and report. Otherwise continue.

## Implementation Phase

### 1. Create Branch

```bash
# Format: <type>/<issue-number>-<short-description>
# Types: fix, feat, chore, refactor, test, docs
git checkout -b fix/42-blob-handling-crash
```

### 2. TDD Workflow

For each acceptance criterion:

1. **Write failing test first**
   ```bash
   # Run specific test file while developing
   npm run test -- src/tests/MyComponent.test.ts
   ```

2. **Implement minimum code to pass**

3. **Refactor if needed** (while green)

4. **Repeat** for each criterion

### 3. Commit

Pre-commit hooks will automatically:
- Run `lint-staged` (eslint --fix, prettier --write on staged files)
- Run full test suite (`npm run test:run`)

**If commit fails:** Fix the failing tests, then retry.

```bash
git add -A
git commit -m "<type>: <description>

Fixes #<number>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### 4. Push and Create PR

```bash
git push -u origin <branch-name>

gh pr create --title "<type>: <description>" --body "## Summary
<brief description>

## Test plan
- [x] Tests added/updated
- [x] All tests pass
- [x] Build succeeds

Closes #<number>

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

### 5. Merge

```bash
gh pr merge --squash --delete-branch
```

Issue auto-closes from "Closes #N" in PR body.

## Handling Blockers

If blocked during implementation:

1. **Commit WIP** (if any progress):
   ```bash
   git add -A
   git commit -m "wip: partial progress on #<number>" --no-verify
   git push -u origin <branch-name>
   ```

2. **Comment on issue:**
   ```bash
   gh issue comment <number> --body "## Progress Update

   **Status:** Blocked

   **Completed:**
   - [x] Item 1

   **Blocker:**
   <description>

   **Next steps:**
   <what needs to happen>

   **Branch:** \`<branch-name>\` (WIP)"
   ```

3. **Report blocker** and stop

## Svelte 5 Requirements

```svelte
<!-- ✅ CORRECT -->
let count = $state(0);
let doubled = $derived(count * 2);

<!-- ❌ WRONG: Svelte 4 patterns -->
import { writable } from 'svelte/store';
$: doubled = count * 2;
```

**Reactivity — never mutate directly:**
```typescript
// ✅ Triggers update
layout.device_types = [...layout.device_types, newType];

// ❌ Bypasses reactivity
layout.device_types.push(newType);
```

## Testing Patterns

**File location:** `src/tests/<Name>.test.ts`

**Use factories:**
```typescript
import { createTestDevice, createTestRack } from './factories';
```

**Prefer test IDs:**
```typescript
screen.getByTestId('btn-save')
```

## Type-Specific Checklists

**bug:**
- [ ] Reproduce first
- [ ] Write failing test capturing bug
- [ ] Fix and verify
- [ ] Check for similar patterns elsewhere

**area:testing:**
- [ ] Follow existing patterns
- [ ] Use factories
- [ ] Test happy path + edge cases

**area:ui:**
- [ ] Test keyboard navigation
- [ ] Verify dark/light theme
- [ ] Use design tokens (not hardcoded values)

## Output

After completing or blocking:

```
## Issue #<number>: <title>

**Status:** Completed | Blocked | Needs Clarification
**Branch:** `<branch-name>`
**PR:** <url>

**Summary:** <what was done>
```
