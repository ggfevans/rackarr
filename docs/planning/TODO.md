# Rackarr Development Checklist

**Created:** 2025-12-11
**Updated:** 2025-12-11
**Feature:** Starter Library Rationalization
**Prompts:** `docs/planning/PROMPT-PLAN.md`

---

## Quick Reference

Mark items with `[x]` as they are completed. Each section corresponds to a prompt in PROMPT-PLAN.md.

---

## Phase 1: Add cable-management Category

### 1.1 — Add cable-management Category Type and Color

**Goal:** Add new category for cable management devices.

- [ ] Read `src/lib/types/index.ts`
- [ ] Read `src/lib/types/constants.ts`
- [ ] Read `src/lib/schemas/index.ts`
- [ ] Create `src/tests/types.test.ts` with category tests
- [ ] Write test: `cable-management` exists in ALL_CATEGORIES
- [ ] Write test: CATEGORY_COLOURS has color for `cable-management`
- [ ] Write test: color is `#4682B4` (Steel Blue)
- [ ] Write test: 12 total categories
- [ ] Run tests — should FAIL
- [ ] Add `'cable-management'` to DeviceCategory type
- [ ] Add `'cable-management': '#4682B4'` to CATEGORY_COLOURS
- [ ] Add `'cable-management'` to ALL_CATEGORIES array
- [ ] Update DeviceCategorySchema in schemas if needed
- [ ] Run `npm run test:run` — category tests pass
- [ ] Run `npm run check` — no TypeScript errors

**Acceptance Criteria:**

- [ ] 12 total device categories
- [ ] cable-management category has Steel Blue color (#4682B4)
- [ ] Schema validates cable-management

---

## Phase 2: Update Starter Library Tests

### 2.1 — Write Tests for New Starter Library

**Goal:** Write comprehensive TDD tests BEFORE implementation.

- [ ] Check for existing starterLibrary tests
- [ ] Create/update `src/tests/starterLibrary.test.ts`
- [ ] Write test: library contains exactly 26 items
- [ ] Write tests for **Server** category (3 items):
  - [ ] 1U Server
  - [ ] 2U Server
  - [ ] 4U Server
- [ ] Write tests for **Network** category (4 items):
  - [ ] 8-Port Switch
  - [ ] 24-Port Switch
  - [ ] 48-Port Switch
  - [ ] 1U Router/Firewall
- [ ] Write tests for **Patch Panel** category (2 items):
  - [ ] 24-Port Patch Panel
  - [ ] 48-Port Patch Panel
- [ ] Write tests for **Storage** category (3 items):
  - [ ] 1U Storage
  - [ ] 2U Storage
  - [ ] 4U Storage
- [ ] Write tests for **Power** category (3 items):
  - [ ] 1U PDU
  - [ ] 2U UPS
  - [ ] 4U UPS
- [ ] Write tests for **KVM** category (2 items):
  - [ ] 1U KVM
  - [ ] 1U Console Drawer
- [ ] Write tests for **AV/Media** category (2 items):
  - [ ] 1U Receiver
  - [ ] 2U Amplifier
- [ ] Write tests for **Cooling** category (1 item):
  - [ ] 1U Fan Panel
  - [ ] NOT 0.5U Blanking Fan (removed)
- [ ] Write tests for **Blank** category (3 items):
  - [ ] 0.5U Blank
  - [ ] 1U Blank
  - [ ] 2U Blank
- [ ] Write tests for **Shelf** category (2 items):
  - [ ] 1U Shelf
  - [ ] 2U Shelf
  - [ ] NOT 4U Shelf (removed)
- [ ] Write tests for **Cable Management** category (2 items):
  - [ ] 1U Brush Panel
  - [ ] 1U Cable Management
- [ ] Write tests for **Removed items**:
  - [ ] NOT 1U Generic
  - [ ] NOT 2U Generic
  - [ ] NOT 1U Router
  - [ ] NOT 1U Firewall
  - [ ] NOT 1U Switch
- [ ] Write tests for **Slug generation**:
  - [ ] 1U Router/Firewall → `1u-router-firewall`
  - [ ] 24-Port Switch → `24-port-switch`
  - [ ] 0.5U Blank → `0-5u-blank`
  - [ ] 1U Cable Management → `1u-cable-management`
- [ ] Write tests for **Required properties**:
  - [ ] Every device has slug
  - [ ] Every device has u_height > 0
  - [ ] Every device has category color
- [ ] Run tests — should FAIL (TDD)

**Acceptance Criteria:**

- [ ] All 26 device tests written
- [ ] Removed item tests written
- [ ] Slug generation tests written
- [ ] Tests fail initially (TDD protocol)

---

## Phase 3: Update Starter Library Implementation

### 3.1 — Update starterLibrary.ts

**Goal:** Make all tests pass by updating the implementation.

- [ ] Read failing tests from Phase 2
- [ ] Open `src/lib/data/starterLibrary.ts`
- [ ] **Add** new items:
  - [ ] 8-Port Switch (network)
  - [ ] 24-Port Switch (network)
  - [ ] 48-Port Switch (network)
  - [ ] 1U Storage (storage)
  - [ ] 1U Brush Panel (cable-management)
  - [ ] 1U Cable Management (cable-management)
- [ ] **Remove** old items:
  - [ ] 4U Shelf
  - [ ] 1U Generic
  - [ ] 2U Generic
  - [ ] 0.5U Blanking Fan
  - [ ] 1U Router (merged)
  - [ ] 1U Firewall (merged)
- [ ] **Rename** items:
  - [ ] 1U Switch → 1U Router/Firewall
  - [ ] 1U Patch Panel → 24-Port Patch Panel
  - [ ] 2U Patch Panel → 48-Port Patch Panel
- [ ] Verify total is exactly 26 items
- [ ] Organize by category with comments
- [ ] Run `npm run test:run` — all tests pass
- [ ] Run `npm run check` — no TypeScript errors
- [ ] Run `npm run lint` — no warnings
- [ ] Run `npm run dev` — visual verification

**Acceptance Criteria:**

- [ ] 26 devices total
- [ ] All tests pass
- [ ] Device Library sidebar shows correct devices

---

## Phase 4: Integration Testing

### 4.1 — E2E Test for Starter Library

**Goal:** Verify starter library works in the full application.

- [ ] Review existing E2E tests in `e2e/`
- [ ] Create `e2e/deviceLibrary.spec.ts`
- [ ] Write test: device palette shows starter items
- [ ] Write test: removed devices not shown
- [ ] Write test: can drag new switch to rack
- [ ] Write test: cable management category exists
- [ ] Run `npm run test:e2e` — all pass
- [ ] Manual verification in browser

**Acceptance Criteria:**

- [ ] E2E tests pass
- [ ] Manual testing successful

---

## Phase 5: Final Verification

### 5.1 — Final Review and Cleanup

**Goal:** Complete verification before commit.

**Automated Checks:**

- [ ] `npm run test:run` — all unit tests pass
- [ ] `npm run test:e2e` — all E2E tests pass
- [ ] `npm run check` — no TypeScript errors
- [ ] `npm run lint` — no warnings
- [ ] `npm run build` — builds successfully

**Code Review:**

- [ ] No console.log statements
- [ ] No TODO comments left
- [ ] Code is properly formatted
- [ ] Comments are helpful not redundant

**Manual Testing:**

- [ ] Start dev server: `npm run dev`
- [ ] Device Library shows 26 devices
- [ ] Devices grouped by category
- [ ] Colors match category colors
- [ ] Cable management has Steel Blue (#4682B4)
- [ ] Drag "24-Port Switch" to rack — works
- [ ] Drag "1U Brush Panel" to rack — works
- [ ] Save layout
- [ ] Reload page
- [ ] Load layout
- [ ] Devices preserved correctly

**Final Acceptance:**

- [ ] All automated checks pass
- [ ] Manual testing complete
- [ ] Ready for commit

---

## Files to Modify

| File                               | Changes                       |
| ---------------------------------- | ----------------------------- |
| `src/lib/types/index.ts`           | Add cable-management to type  |
| `src/lib/types/constants.ts`       | Add color + ALL_CATEGORIES    |
| `src/lib/schemas/index.ts`         | Update schema if needed       |
| `src/lib/data/starterLibrary.ts`   | Update device list (26 items) |
| `src/tests/types.test.ts`          | New category tests            |
| `src/tests/starterLibrary.test.ts` | Comprehensive library tests   |
| `e2e/deviceLibrary.spec.ts`        | E2E integration tests         |

---

## Progress Tracking

| Phase     | Description           | Items   | Done  | %      |
| --------- | --------------------- | ------- | ----- | ------ |
| 1         | Category Type         | 16      | 0     | 0      |
| 2         | Starter Library Tests | 47      | 0     | 0      |
| 3         | Implementation        | 25      | 0     | 0      |
| 4         | E2E Tests             | 8       | 0     | 0      |
| 5         | Final Verification    | 18      | 0     | 0      |
| **Total** |                       | **114** | **0** | **0%** |

---

## Quick Commands

```bash
# Development
npm run dev          # Start dev server

# Testing
npm run test         # Unit tests (watch mode)
npm run test:run     # Unit tests (single run)
npm run test:e2e     # E2E tests (Playwright)

# Quality
npm run check        # TypeScript check
npm run lint         # ESLint

# Build
npm run build        # Production build
```

---

_Last updated: 2025-12-11_
