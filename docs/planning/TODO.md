# Rackarr Development Checklist

**Created:** 2025-12-09
**Updated:** 2025-12-09
**Prompts:** `docs/planning/PROMPT-PLAN.md`

---

## Quick Reference

Mark items with `[x]` as they are completed. Each section corresponds to a prompt in PROMPT-PLAN.md.

**Priority Order:**

1. Phase 0 — Critical bug fixes (v0.4.9) ← **DO THIS FIRST**
2. Phase 1 — Airflow visualization (v0.5.0)

---

## Phase 0: Critical Bug Fixes (v0.4.9)

### 0.1 — Fix Multi-Device Selection Bug (PRIORITY)

**Problem:** Selecting a device selects ALL devices of the same type.

- [ ] Read `src/lib/stores/selection.svelte.ts`
- [ ] Read `src/lib/components/RackDevice.svelte`
- [ ] Read `src/lib/components/Rack.svelte`
- [ ] Identify root cause (likely comparing `libraryId` instead of device index)
- [ ] Write test: selecting device only selects that device, not others of same type
- [ ] Write test: selection uses device index, not libraryId
- [ ] Fix `selectDevice()` to store unique device index
- [ ] Fix `RackDevice` selection comparison to use index
- [ ] Fix visual highlight to use index-based comparison
- [ ] Run `npm run test:run` — selection tests pass
- [ ] Run `npm run check` — no TypeScript errors
- [ ] Manual test: add two devices of same type, click one, verify only one selected
- [ ] Verify EditPanel shows correct device properties

**Acceptance Criteria:**

- [ ] Only clicked device shows selection highlight
- [ ] Devices of same type are NOT all selected
- [ ] EditPanel shows correct device properties
- [ ] Selection persists correctly when clicking different devices

---

## Phase 1: Airflow Visualization (v0.5.0)

**Spec:** `docs/planning/spec-airflow.md`

### 1.1 — Update Airflow Schema to 4 Types

- [ ] Read current `src/lib/schemas/index.ts`
- [ ] Read current `src/lib/types/index.ts`
- [ ] Read existing `src/tests/airflow.test.ts`
- [ ] Write tests for 4 supported types
- [ ] Write tests verifying removed types are invalid
- [ ] Update `AirflowSchema` in schemas/index.ts
- [ ] Update `Airflow` type in types/index.ts
- [ ] Run `npm run test:run` — all tests pass
- [ ] Run `npm run check` — no TypeScript errors

---

## Phase 2: Update UI Dropdowns

### 2.1 — Update EditPanel Airflow Dropdown

- [ ] Read `src/lib/components/EditPanel.svelte`
- [ ] Read `src/tests/EditPanel.test.ts`
- [ ] Add test: dropdown shows exactly 4 options
- [ ] Add test: option labels match spec
- [ ] Add test: selecting option updates device
- [ ] Update `AIRFLOW_OPTIONS` array to 4 options
- [ ] Labels: "Passive (no active cooling)", "Front to Rear", "Rear to Front", "Side to Rear"
- [ ] Run tests — EditPanel tests pass
- [ ] Manually verify dropdown in browser

### 2.2 — Update AddDeviceForm Airflow Dropdown

- [ ] Read `src/lib/components/AddDeviceForm.svelte`
- [ ] Read `src/tests/AddDeviceForm.test.ts`
- [ ] Add test: dropdown shows 4 options
- [ ] Add test: default is 'passive'
- [ ] Update `AIRFLOW_OPTIONS` to match EditPanel
- [ ] Run tests — AddDeviceForm tests pass
- [ ] Manually verify in browser

---

## Phase 3: Rewrite AirflowIndicator Component

### 3.1 — Write Tests for New AirflowIndicator

- [ ] Read spec "Visual Design" section
- [ ] Read existing `src/tests/AirflowIndicator.test.ts`
- [ ] Write test: passive renders hollow circle
- [ ] Write test: passive has no stripe
- [ ] Write test: front-to-rear has blue stripe LEFT (front view)
- [ ] Write test: front-to-rear has red stripe RIGHT (rear view)
- [ ] Write test: rear-to-front has red stripe LEFT (front view)
- [ ] Write test: rear-to-front has blue stripe RIGHT (rear view)
- [ ] Write test: side-to-rear has blue stripe LEFT (front view)
- [ ] Write test: side-to-rear has red stripe RIGHT (rear view)
- [ ] Write test: stripe is 4px wide
- [ ] Write test: stripe spans full device height
- [ ] Write test: arrow has .airflow-arrow class
- [ ] Write test: renders directional arrow
- [ ] Run tests — tests should FAIL (not implemented yet)

### 3.2 — Implement New AirflowIndicator Component

- [ ] Read failing tests from 3.1
- [ ] Read spec "Visual Design" section
- [ ] Backup or review existing `AirflowIndicator.svelte`
- [ ] Implement Props interface with Svelte 5 runes
- [ ] Implement `isIntakeSide` derived state
- [ ] Implement `stripeColor` derived (blue/red)
- [ ] Implement `stripeX` derived (left/right based on view)
- [ ] Implement `arrowPoints` derived for chevron shape
- [ ] Implement passive circle rendering
- [ ] Implement edge stripe rendering
- [ ] Implement directional arrow rendering
- [ ] Add CSS keyframes for marching animation
- [ ] Add prefers-reduced-motion media query
- [ ] Run tests — all AirflowIndicator tests pass
- [ ] Run `npm run check` — no TypeScript errors
- [ ] Manually verify in browser with dev server

---

## Phase 4: Update Airflow Utilities

### 4.1 — Update Conflict Detection for 4 Types

- [ ] Read `src/lib/utils/airflow.ts`
- [ ] Read `src/tests/airflow.test.ts`
- [ ] Add test: front-to-rear above rear-to-front = conflict on rear
- [ ] Add test: rear-to-front above front-to-rear = conflict on front
- [ ] Add test: same direction = no conflict
- [ ] Add test: passive never conflicts
- [ ] Add test: side-to-rear does not create conflicts
- [ ] Add test: getAirflowDirection for front-to-rear
- [ ] Add test: getAirflowDirection for rear-to-front
- [ ] Add test: getAirflowDirection for side-to-rear
- [ ] Add test: getAirflowDirection for passive = neutral
- [ ] Remove logic for deprecated types
- [ ] Simplify `hasAirflowConflict` function
- [ ] Update `getAirflowDirection` function
- [ ] Update `findAirflowConflicts` function
- [ ] Run tests — all airflow utility tests pass

---

## Phase 5: Conflict Highlighting

### 5.1 — Add Conflict Border to RackDevice

- [ ] Read `src/lib/components/RackDevice.svelte`
- [ ] Read `src/tests/RackDevice.test.ts`
- [ ] Add test: orange border when hasConflict && airflowMode
- [ ] Add test: no border when airflowMode off
- [ ] Add `hasConflict` prop to RackDevice
- [ ] Add conditional `.airflow-conflict` class
- [ ] Add CSS: `.airflow-conflict { stroke: var(--colour-airflow-conflict); stroke-width: 2px; }`
- [ ] Run tests — RackDevice conflict tests pass

### 5.2 — Wire Conflict Detection to Rack

- [ ] Read `src/lib/components/Rack.svelte`
- [ ] Add test: passes hasConflict=true to conflicting devices
- [ ] Import `findAirflowConflicts` utility
- [ ] Add `conflicts` derived state (computed when airflowMode on)
- [ ] Pass `hasConflict` prop to each RackDevice
- [ ] Run tests — Rack conflict tests pass
- [ ] Manually verify: place front-to-rear + rear-to-front adjacent, see orange borders

---

## Phase 6: Keyboard Shortcut

### 6.1 — Add 'A' Key Toggle for Airflow Mode

- [ ] Read `src/lib/components/KeyboardHandler.svelte`
- [ ] Read `src/tests/KeyboardHandler.test.ts`
- [ ] Add test: 'A' key toggles airflowMode
- [ ] Add test: shortcut disabled when input focused
- [ ] Add handler for 'a'/'A' key
- [ ] Call `uiStore.toggleAirflowMode()`
- [ ] Add input focus check to prevent firing in forms
- [ ] Run tests — keyboard tests pass
- [ ] Manually verify 'A' key toggles airflow mode

### 6.2 — Update Help Panel with 'A' Shortcut

- [ ] Read `src/lib/components/HelpPanel.svelte`
- [ ] Find keyboard shortcuts list
- [ ] Add entry: `A — Toggle airflow visualization`
- [ ] Place near 'I' (display mode toggle)
- [ ] Manually verify in Help panel

---

## Phase 7: Export Support

### 7.1 — Include Airflow Indicators in Exports

- [ ] Read `src/lib/utils/export.ts`
- [ ] Read `src/lib/components/ExportDialog.svelte`
- [ ] Add E2E test: exported image includes airflow when mode on
- [ ] Verify `airflowMode` passed to export rendering
- [ ] Verify PNG export includes stripes
- [ ] Verify SVG export includes stripes
- [ ] Verify PDF export includes stripes
- [ ] Verify animation not present in exports (static)
- [ ] Run E2E tests — export tests pass
- [ ] Manually verify exports

---

## Phase 8: Final Integration & Testing

### 8.1 — End-to-End Workflow Test

- [ ] Create `e2e/airflow.spec.ts`
- [ ] Test: toggle with 'A' key
- [ ] Test: toggle with toolbar button
- [ ] Test: edit airflow in EditPanel
- [ ] Test: create device with airflow in AddDeviceForm
- [ ] Test: conflict highlighting for adjacent devices
- [ ] Test: airflow persists in save/load
- [ ] Run E2E tests — all airflow E2E tests pass

### 8.2 — Visual Regression Testing (Optional)

- [ ] Check if visual testing configured
- [ ] If yes: add visual snapshots for all airflow types
- [ ] If yes: cover both front and rear views
- [ ] Run visual tests if applicable

### 8.3 — Final Code Review and Cleanup

- [ ] Run `npm run test:run` — ALL tests pass
- [ ] Run `npm run check` — no TypeScript errors
- [ ] Run `npm run lint` — no warnings
- [ ] Check for console.log statements — remove any
- [ ] Check for TODO comments — address or remove
- [ ] Verify only 4 airflow types in UI
- [ ] Verify Help panel updated
- [ ] Verify keyboard shortcut works
- [ ] Verify export includes indicators
- [ ] Manual testing:
  - [ ] Test all 4 airflow types visually
  - [ ] Test front view indicators
  - [ ] Test rear view indicators
  - [ ] Test conflict highlighting (adjacent opposing devices)
  - [ ] Test 'A' keyboard shortcut
  - [ ] Test toolbar button toggle
  - [ ] Test export with airflow on
  - [ ] Test save/load preserves airflow
  - [ ] Test with prefers-reduced-motion (no animation)

---

## Phase 9: Documentation and Release

### 9.1 — Update SPEC.md with Completed Feature

- [ ] Update version to 0.5.0
- [ ] Update Airflow type list (4 types only)
- [ ] Update keyboard shortcuts table (add 'A')
- [ ] Add edge stripe to component list
- [ ] Review entire Airflow section for accuracy

### 9.2 — Update ROADMAP.md

- [ ] Move v0.5.0 from Planned to Released
- [ ] Add changelog entry with date
- [ ] List completed features:
  - [ ] 4 simplified airflow types
  - [ ] Edge stripe + arrow visualization
  - [ ] Conflict highlighting
  - [ ] 'A' keyboard shortcut
  - [ ] Export support

---

## Final Sign-Off

- [ ] All Phase 1 items complete
- [ ] All Phase 2 items complete
- [ ] All Phase 3 items complete
- [ ] All Phase 4 items complete
- [ ] All Phase 5 items complete
- [ ] All Phase 6 items complete
- [ ] All Phase 7 items complete
- [ ] All Phase 8 items complete
- [ ] All Phase 9 items complete
- [ ] `npm run build` succeeds
- [ ] Feature matches spec exactly
- [ ] Ready for version tag and release

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

## Files Modified (Reference)

### Phase 0 (v0.4.9 Bug Fix)

| File                                   | Changes                     |
| -------------------------------------- | --------------------------- |
| `src/lib/stores/selection.svelte.ts`   | Fix selection by index      |
| `src/lib/components/RackDevice.svelte` | Fix selection comparison    |
| `src/lib/components/Rack.svelte`       | Fix click event propagation |
| `src/tests/selection.test.ts`          | Selection tests             |

### Phase 1 (v0.5.0 Airflow)

| File                                         | Changes                            |
| -------------------------------------------- | ---------------------------------- |
| `src/lib/schemas/index.ts`                   | AirflowSchema → 4 types            |
| `src/lib/types/index.ts`                     | Airflow type → 4 types             |
| `src/lib/utils/airflow.ts`                   | Conflict detection updates         |
| `src/lib/components/AirflowIndicator.svelte` | Complete rewrite                   |
| `src/lib/components/RackDevice.svelte`       | Add hasConflict prop, conflict CSS |
| `src/lib/components/Rack.svelte`             | Wire conflict detection            |
| `src/lib/components/EditPanel.svelte`        | 4 dropdown options                 |
| `src/lib/components/AddDeviceForm.svelte`    | 4 dropdown options                 |
| `src/lib/components/KeyboardHandler.svelte`  | Add 'A' shortcut                   |
| `src/lib/components/HelpPanel.svelte`        | Add 'A' to shortcuts               |
| `src/lib/utils/export.ts`                    | Airflow in exports                 |
| `src/tests/airflow.test.ts`                  | Updated tests                      |
| `src/tests/AirflowIndicator.test.ts`         | New edge stripe tests              |
| `src/tests/RackDevice.test.ts`               | Conflict tests                     |
| `e2e/airflow.spec.ts`                        | New E2E test file                  |
| `docs/planning/SPEC.md`                      | v0.5.0 updates                     |
| `docs/planning/ROADMAP.md`                   | Release entry                      |

---

## Estimated Progress Tracking

| Phase                     | Items   | Done  | %      |
| ------------------------- | ------- | ----- | ------ |
| **0. Bug Fixes (v0.4.9)** | **13**  | **0** | **0%** |
| 1. Airflow Schema         | 21      | 0     | 0%     |
| 2. Dropdowns              | 16      | 0     | 0%     |
| 3. AirflowIndicator       | 32      | 0     | 0%     |
| 4. Utilities              | 18      | 0     | 0%     |
| 5. Conflicts              | 16      | 0     | 0%     |
| 6. Keyboard               | 13      | 0     | 0%     |
| 7. Export                 | 11      | 0     | 0%     |
| 8. Integration            | 25      | 0     | 0%     |
| 9. Documentation          | 13      | 0     | 0%     |
| **Total**                 | **178** | **0** | **0%** |

---

_Last updated: 2025-12-09_
