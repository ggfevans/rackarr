# Testing Audit Report — Rackarr

**Date:** 2025-12-16
**Version audited:** 0.5.8
**Test count:** 1833 tests across 106 test files (94 unit/integration + 15 E2E)
**Total test code:** ~26,887 lines

## Executive Summary

The Rackarr test suite demonstrates **strong testing maturity** with comprehensive coverage across utilities, stores, components, and E2E workflows. The codebase follows modern best practices including behaviour-driven testing, the Testing Trophy approach (mostly integration, some unit, few E2E), and excellent accessibility focus.

**Key Strengths:**

- Comprehensive collision detection and spatial logic testing with edge cases
- Consistent AAA (Arrange-Act-Assert) pattern adherence (~95%)
- Strong accessibility testing with dedicated ARIA audit suites
- Proper Svelte 5 runes testing patterns (direct property access)
- Command pattern fully tested with execute/undo symmetry
- Round-trip testing for bidirectional transformations (YAML, coordinates)

**Primary Concerns:**

- E2E tests use brittle CSS class selectors (~60% of selectors)
- 13 E2E tests skipped covering critical save/load and airflow features
- Test helpers duplicated across 10+ files (no centralized utilities)
- Arbitrary `waitForTimeout()` calls create flakiness risks
- No coverage thresholds configured
- Minimal Playwright configuration (single browser, no retries)

**Overall Grade: A-** (91/100)

The test suite provides solid coverage and demonstrates mature engineering practices. The identified issues are primarily organizational and configuration-related rather than fundamental quality problems.

## Methodology

This audit evaluated Rackarr's testing practices against:

1. **Kent C. Dodds' Testing Philosophy** - Test behaviour, not implementation; avoid testing implementation details; prefer integration tests
2. **Testing Trophy Approach** - Mostly integration, some unit, few E2E
3. **Svelte Testing Library Best Practices** - Role-based queries, accessibility-first, user-centric testing
4. **Playwright Conventions** - Resilient selectors, page objects, flakiness prevention
5. **AAA Pattern** - Clear Arrange-Act-Assert structure

Five parallel subagent audits examined:

- Utility tests (21 files, ~4,000 lines)
- Store tests (13 files, ~2,500 lines)
- Component tests (35+ files, ~6,000 lines)
- E2E tests (15 files, ~3,200 lines)
- Test infrastructure (configs, setup, dependencies)

---

## 1. Test Organisation

### Current Structure

```
src/
├── tests/                    # 80 test files (unit + integration)
│   ├── setup.ts              # Global test setup
│   ├── setup.test.ts         # Verifies setup works
│   ├── helpers/              # Test helper components
│   │   └── ShimmerTest.svelte
│   ├── *.test.ts             # Feature/component tests
│   └── [no factories.ts]     # Missing centralized factories
│
├── lib/
│   ├── stores/
│   │   ├── history.test.ts           # Co-located store tests
│   │   ├── layout-raw-actions.test.ts
│   │   ├── layout-undo-redo.test.ts
│   │   └── commands/
│   │       ├── rack.test.ts          # Command pattern tests
│   │       ├── device.test.ts
│   │       ├── device-type.test.ts
│   │       └── types.test.ts
│   ├── data/brandPacks/
│   │   ├── mikrotik.test.ts          # Brand pack tests
│   │   └── ubiquiti.test.ts
│   ├── components/ui/Accordion/
│   │   └── Accordion.test.ts         # Co-located component test
│   └── utils/
│       └── analytics.test.ts         # Co-located utility test
│
e2e/                          # 15 Playwright spec files
├── basic-workflow.spec.ts
├── rack-configuration.spec.ts
├── dual-view.spec.ts
├── persistence.spec.ts
├── export.spec.ts
├── keyboard.spec.ts
├── airflow.spec.ts           # 6 tests skipped
├── responsive.spec.ts
└── ...
```

### Observations

- **Mixed location strategy:** Most tests in `src/tests/`, some co-located with source
- **Naming convention:** `.test.ts` for unit/integration, `.spec.ts` for E2E (consistent)
- **No centralized factories:** `createTestDevice()`, `createMockRack()` duplicated across files
- **No page object models:** E2E helpers embedded in spec files

### Decision Points

**DP-1.1: Test File Location**

- Current state: Hybrid (centralized `src/tests/` + co-located in `src/lib/`)
- Options:
  - (A) Fully centralized in `src/tests/` (current primary approach)
  - (B) Fully co-located next to source files
  - (C) Hybrid with clear rules (current implicit approach)
- Considerations: Co-location aids discoverability; centralized aids bulk operations. Hybrid needs documented rules.

**DP-1.2: Naming Convention**

- Current state: `.test.ts` for unit/integration, `.spec.ts` for E2E
- Options:
  - (A) Keep current semantic distinction
  - (B) Standardise on `.test.ts` for all
  - (C) Use `.unit.ts`, `.integration.ts`, `.e2e.ts` for clarity
- Considerations: Current approach works well. Vitest and Playwright both configured correctly.

---

## 2. Test Quality Patterns

### Strengths Observed

1. **Behaviour-driven test names** (~95% adherence):

   ```typescript
   // collision.test.ts:48
   it('returns {bottom:5, top:5} for 1U device at position 5', () => { ... })

   // selection-store.test.ts:72
   it('sets selectedId, selectedType, selectedRackId, and selectedDeviceIndex', () => { ... })
   ```

2. **Strong edge case coverage** (collision detection exemplary):
   - Boundary conditions (device exceeding rack top)
   - 0.5U device handling
   - Half-depth vs full-depth conflicts
   - Face-aware collision detection

3. **Round-trip testing** for bidirectional operations:

   ```typescript
   // coordinates.test.ts:273-299
   it('screenToSVG then svgToScreen returns original coordinates', () => { ... })

   // yaml.test.ts:341-436
   it('serialize then parse returns equivalent object', () => { ... })
   ```

4. **Accessibility testing** with dedicated suites:
   - `AriaAudit.test.ts` - All toolbar buttons have aria-label
   - `DialogA11y.test.ts` - Modal focus management
   - `contrast.test.ts` - WCAG AA compliance verification

5. **Factory pattern** with overrides:
   ```typescript
   function createMockDevice(overrides: Partial<PlacedDevice> = {}): PlacedDevice {
   	return { device_type: 'test-device', position: 10, face: 'front', ...overrides };
   }
   ```

### Areas for Improvement

1. **Magic constants duplicated** across test files:

   ```typescript
   // export.test.ts:438-441, dragdrop.test.ts:7-8
   const U_HEIGHT = 22;
   const RACK_PADDING = 4;
   const RAIL_WIDTH = 17;
   ```

2. **Heavy browser API mocking** in imageUpload.test.ts (40+ lines of mock setup)

3. **Some shallow tests** for timing-sensitive utilities:
   - `debounce.test.ts` - Only 4 tests, missing context preservation, error handling

4. **Direct store mutation** in some tests:
   ```typescript
   // EditPanel.test.ts:309
   layoutStore.layout.device_types.push(deviceType); // Should use store methods
   ```

### AAA Pattern Adherence

**Excellent examples (95% adherence):**

```typescript
// debounce.test.ts:23-36
it('resets timer on subsequent calls', () => {
	// ARRANGE
	const fn = vi.fn();
	const debouncedFn = debounce(fn, 100);

	// ACT
	debouncedFn();
	vi.advanceTimersByTime(50);
	debouncedFn(); // Reset timer
	vi.advanceTimersByTime(50);

	// ASSERT
	expect(fn).not.toHaveBeenCalled();
});
```

**Minor deviations:** Some tests include intermediate assertions within Arrange phase for debugging aid.

### Decision Points

**DP-2.1: Helper Function Strategy**

- Current state: Factories duplicated across test files
- Options:
  - (A) Create `src/tests/factories.ts` with all shared builders
  - (B) Create `src/tests/helpers/` directory with domain-grouped factories
  - (C) Keep inline but document required factories per feature
- Considerations: Duplication increases maintenance burden; centralization improves consistency.

**DP-2.2: Test Isolation**

- Current state: `beforeEach()` with store reset functions (consistent)
- Options:
  - (A) Keep current approach (working well)
  - (B) Add global afterEach cleanup in setup.ts
  - (C) Add automatic localStorage/sessionStorage reset
- Considerations: Current approach is solid. Could add storage reset to prevent pollution.

---

## 3. Coverage Analysis

### By Domain

| Domain      | Test Files | Tests | Estimated Coverage | Notes                        |
| ----------- | ---------- | ----- | ------------------ | ---------------------------- |
| Utilities   | 21         | ~400  | High               | Excellent edge case coverage |
| Stores      | 13         | ~387  | High               | Command pattern fully tested |
| Components  | 35+        | ~700  | High               | Strong accessibility focus   |
| E2E         | 15         | ~200  | Medium             | 13 tests skipped             |
| Brand Packs | 2          | ~20   | Medium             | Basic validation             |

### Gap Analysis

**Well-tested areas:**

- Collision detection (472 lines, 40+ tests)
- Coordinate transformations (round-trip verified)
- Command pattern (execute/undo symmetry)
- Keyboard shortcuts (comprehensive)
- Accessibility (ARIA, contrast, focus management)
- Dual-view system (comprehensive E2E)

**Under-tested areas:**

- File save/load (E2E tests skipped due to file chooser issues)
- Airflow visualization (6 E2E tests skipped)
- Undo/redo (only in unit tests, not E2E)
- Error boundaries (no error state testing)
- Performance (no large rack tests)
- Multi-device selection (not explicitly tested)

**Over-tested areas:**

- Starter library validation (263 lines testing 26 devices individually)

### Decision Points

**DP-3.1: Coverage Targets**

- Current state: No coverage thresholds configured
- Options:
  - (A) Add numeric thresholds (80% statements, branches, functions, lines)
  - (B) Qualitative guidelines without enforcement
  - (C) Per-domain thresholds (higher for utilities, lower for E2E)
- Considerations: Thresholds prevent regression but can encourage superficial tests.

---

## 4. Testing Trophy Assessment

### Current Distribution

| Test Type           | Count | Percentage | Trophy Ideal |
| ------------------- | ----- | ---------- | ------------ |
| Static (TypeScript) | N/A   | N/A        | Top          |
| Unit                | ~400  | 22%        | Small        |
| Integration         | ~1200 | 65%        | **Largest**  |
| E2E                 | ~200  | 11%        | Small        |

**Assessment:** Excellent alignment with Testing Trophy. Integration tests (component + store) form the bulk. E2E tests cover critical user journeys without over-testing.

### Recommendations

- **Maintain current balance** - Distribution is healthy
- **Increase E2E for skipped features** once file chooser issues resolved
- **Consider reducing unit tests** for trivial utilities (getter functions)

### Decision Points

**DP-4.1: Test Type Balance**

- Current state: 22% unit, 65% integration, 11% E2E
- Options:
  - (A) Maintain current distribution (recommended)
  - (B) Shift more to E2E for user journey coverage
  - (C) Add more unit tests for utility edge cases
- Considerations: Current balance aligns with Testing Trophy philosophy.

---

## 5. Svelte 5 / Runes Considerations

### Reactive State Testing

**Excellent pattern:** Direct property access without subscription boilerplate:

```typescript
// selection-store.test.ts:10-15
it('has no selection', () => {
	const store = getSelectionStore();
	expect(store.selectedId).toBeNull();
	expect(store.selectedType).toBeNull();
});
```

**$derived testing:**

```typescript
// ui-store.test.ts:166-175
it('zoomScale returns zoom / 100', () => {
	const store = getUIStore();
	expect(store.zoomScale).toBe(1); // $derived value
	store.setZoom(150);
	expect(store.zoomScale).toBe(1.5); // Updates reactively
});
```

**$effect testing:** Indirect through side effects (appropriate):

```typescript
// canvas-store.test.ts:324-337
it('updates zoom when panzoom emits zoom event', () => {
	store.setPanzoomInstance(mockPanzoom);
	mockPanzoom.zoomAbs(0, 0, 1.75);
	expect(store.zoom).toBe(1.75); // Effect ran
});
```

### Component Testing Patterns

**Svelte Testing Library usage:**

```typescript
// Dialog.test.ts:8
render(Dialog, { props: { open: true, title: 'Test Dialog' } });
expect(screen.getByRole('dialog')).toBeInTheDocument();
```

**Mixed user-event vs fireEvent:**

- Most tests: `fireEvent.click()` (faster)
- Accordion.test.ts: `userEvent.setup()` (more realistic)

### Decision Points

**DP-5.1: Runes Testing Strategy**

- Current state: Direct property access, effects tested via side effects
- Options:
  - (A) Keep current approach (recommended - tests behaviour, not implementation)
  - (B) Add explicit effect tracking helpers
  - (C) Create runes-specific test utilities
- Considerations: Current approach is correct. Effects are implementation details.

---

## 6. Test Infrastructure

### Configuration Assessment

**Vitest (vitest.config.ts):**

- Environment: jsdom (correct for components)
- Globals: enabled (cleaner test code)
- Coverage: text, json, html reporters
- **Missing:** Coverage thresholds, timeout configuration

**Playwright (playwright.config.ts):**

- Tests production build (good)
- **Missing:** Multi-browser, retries, screenshots, traces, viewport settings

**Setup (src/tests/setup.ts):**

- Jest-DOM matchers imported
- matchMedia mock (essential for responsive)
- **Missing:** ResizeObserver, IntersectionObserver mocks

### Custom Utilities

**Existing:**

- `src/tests/helpers/ShimmerTest.svelte` - Wrapper component
- Factory functions (duplicated in test files)
- E2E drag-drop helpers (duplicated in spec files)

**Missing:**

- `src/tests/factories.ts` - Centralized mock data
- `src/tests/matchers.ts` - Custom domain assertions
- `e2e/page-objects/` - Page object models
- `e2e/helpers/` - Shared E2E utilities

### Decision Points

**DP-6.1: Test Factory Pattern**

- Current state: Factory functions duplicated across 10+ files
- Options:
  - (A) Create `src/tests/factories.ts` with typed builders
  - (B) Create per-domain factory files (`factories/device.ts`, `factories/rack.ts`)
  - (C) Use Faker.js or similar library
- Considerations: Centralization reduces duplication and ensures consistency.

**DP-6.2: Mock Strategy**

- Current state: Inline mocks in test files
- Options:
  - (A) Create `src/tests/mocks/browser.ts` for Canvas, FileReader, Image
  - (B) Use MSW for API mocking (if backend integration planned)
  - (C) Keep inline for simplicity
- Considerations: Browser API mocks are complex; centralization aids maintenance.

---

## 7. E2E Strategy

### Workflow Coverage

**Well-covered journeys:**

- Rack creation/configuration (all options)
- Device drag-drop, move, delete
- Dual-view front/rear placement
- Image export (PNG, JPEG, SVG)
- Keyboard shortcuts
- Responsive behaviour (3 viewports)
- Archive format validation

**Gap journeys:**

- File save/load (3 tests skipped)
- Airflow visualization (6 tests skipped)
- Undo/redo (unit tests only)
- Error handling (limited)

### Selector Resilience

**Current distribution:**
| Strategy | Usage | Risk Level |
|----------|-------|------------|
| CSS classes | 60% | High |
| Text-based | 25% | Medium |
| ARIA/Roles | 10% | Low |
| IDs | 5% | Low |

**Problematic selectors:**

```typescript
// High risk (60% of selectors)
('.device-palette-item', '.rack-svg', '.toolbar-action-btn');

// Better approach (10% of selectors)
('[aria-label="New Rack"]');
page.getByRole('button', { name: /delete/i });
```

### Flakiness Risk

**High-risk patterns identified:**

1. **Arbitrary timeouts** (13 instances):

   ```typescript
   await page.waitForTimeout(100); // basic-workflow.spec.ts:85
   await page.waitForTimeout(500); // basic-workflow.spec.ts:99
   ```

2. **First/last assumptions:**

   ```typescript
   page.locator('.rack-container').first(); // Fragile to DOM changes
   ```

3. **No retry configuration** in Playwright

### Decision Points

**DP-7.1: Selector Strategy**

- Current state: 60% CSS classes, 25% text, 10% ARIA, 5% IDs
- Options:
  - (A) Add `data-testid` attributes throughout app (recommended)
  - (B) Shift to role-based queries where possible
  - (C) Keep CSS classes but add to component contract documentation
- Considerations: data-testid provides stability without accessibility requirements.

---

## 8. Documentation & Discoverability

### Existing Documentation

- `CLAUDE.md` - TDD protocol mentioned, test commands documented
- `docs/planning/spec-combined.md` - Feature specifications (test basis)
- No dedicated `TESTING.md`

### Test Readability

**Self-documenting strengths:**

- Descriptive test names (~95%)
- Nested describe blocks
- Version comments (e.g., "v0.2 always has a rack")
- Domain language used consistently

**Areas needing clarity:**

- Complex mock setups (imageUpload.test.ts)
- E2E helper functions lack JSDoc

### Decision Points

**DP-8.1: Test Documentation Standard**

- Current state: No dedicated testing guide
- Options:
  - (A) Create `docs/TESTING.md` with patterns, commands, debugging
  - (B) Add JSDoc to shared helpers only
  - (C) Rely on test names as documentation (current)
- Considerations: Documentation aids onboarding and consistency.

---

## Summary of Decision Points

| ID     | Topic                       | Options                                                               | Priority |
| ------ | --------------------------- | --------------------------------------------------------------------- | -------- |
| DP-1.1 | Test File Location          | A: Centralized / B: Co-located / C: Hybrid with rules                 | Low      |
| DP-1.2 | Naming Convention           | A: Keep `.test.ts`/`.spec.ts` / B: Standardize / C: Semantic suffixes | Low      |
| DP-2.1 | Helper Function Strategy    | A: Single factories.ts / B: Domain-grouped / C: Documented inline     | **High** |
| DP-2.2 | Test Isolation              | A: Keep current / B: Global cleanup / C: Add storage reset            | Medium   |
| DP-3.1 | Coverage Targets            | A: Numeric thresholds / B: Qualitative / C: Per-domain                | **High** |
| DP-4.1 | Test Type Balance           | A: Maintain current / B: More E2E / C: More unit                      | Low      |
| DP-5.1 | Runes Testing Strategy      | A: Keep current / B: Effect helpers / C: Runes utilities              | Low      |
| DP-6.1 | Test Factory Pattern        | A: Centralized file / B: Per-domain files / C: Use Faker              | **High** |
| DP-6.2 | Mock Strategy               | A: Centralized mocks / B: MSW / C: Keep inline                        | Medium   |
| DP-7.1 | Selector Strategy           | A: data-testid / B: Role-based / C: Document CSS classes              | **High** |
| DP-8.1 | Test Documentation Standard | A: TESTING.md guide / B: JSDoc only / C: Names as docs                | Medium   |

---

## Appendix A: File Inventory

### Unit/Integration Tests (src/tests/)

| File                     | Lines | Domain    |
| ------------------------ | ----- | --------- |
| export.test.ts           | 1165  | Utility   |
| layout-store.test.ts     | 1031  | Store     |
| collision.test.ts        | 472   | Utility   |
| Rack-component.test.ts   | 453   | Component |
| App.test.ts              | 433   | Component |
| layout-undo-redo.test.ts | 368   | Store     |
| Toolbar.test.ts          | 330   | Component |
| EditPanel.test.ts        | 317   | Component |
| dual-view.test.ts        | 321   | Component |
| keyboard.test.ts         | 293   | Utility   |
| rack.test.ts             | 285   | Utility   |
| yaml.test.ts             | 285   | Utility   |
| contrast.test.ts         | 283   | Utility   |
| airflow.test.ts          | 261   | Utility   |
| history.test.ts          | 260   | Store     |
| canvas-store.test.ts     | 250   | Store     |
| DevicePalette.test.ts    | 225   | Component |
| archive.test.ts          | 215   | Utility   |
| Sidebar.test.ts          | 203   | Component |
| RackDevice.test.ts       | 197   | Component |
| _(+60 more files)_       |       |           |

### E2E Tests (e2e/)

| File                       | Lines | Focus                             |
| -------------------------- | ----- | --------------------------------- |
| airflow.spec.ts            | 386   | Airflow visualization (6 skipped) |
| dual-view.spec.ts          | 321   | Front/rear views                  |
| starter-library.spec.ts    | 262   | Device library validation         |
| device-name.spec.ts        | 229   | Custom naming (3 skipped)         |
| archive-format.spec.ts     | 217   | YAML format (1 skipped)           |
| responsive.spec.ts         | 216   | Viewport testing                  |
| basic-workflow.spec.ts     | 212   | CRUD operations                   |
| export.spec.ts             | 193   | Image export                      |
| keyboard.spec.ts           | 192   | Shortcuts                         |
| persistence.spec.ts        | 192   | Save/load (2 skipped)             |
| view-reset.spec.ts         | 177   | Panzoom reset                     |
| rack-configuration.spec.ts | 174   | Rack options (3 skipped)          |
| single-rack.spec.ts        | 166   | Single-rack mode                  |
| shelf-category.spec.ts     | 142   | Shelf devices                     |
| device-images.spec.ts      | 126   | Image upload                      |

### Co-located Tests (src/lib/)

| File                                      | Lines | Domain    |
| ----------------------------------------- | ----- | --------- |
| stores/layout-undo-redo.test.ts           | 368   | Store     |
| stores/history.test.ts                    | 260   | Store     |
| stores/layout-raw-actions.test.ts         | 236   | Store     |
| stores/commands/rack.test.ts              | 240   | Commands  |
| stores/commands/device.test.ts            | 238   | Commands  |
| stores/commands/device-type.test.ts       | 215   | Commands  |
| stores/commands/types.test.ts             | 142   | Commands  |
| utils/analytics.test.ts                   | 98    | Utility   |
| components/ui/Accordion/Accordion.test.ts | 67    | Component |
| data/brandPacks/ubiquiti.test.ts          | ~100  | Data      |
| data/brandPacks/mikrotik.test.ts          | ~100  | Data      |

---

## Appendix B: Subagent Summaries

### Utility Tests Audit (Subagent 1)

- **Scope:** 21 test files covering utils
- **Key findings:** Excellent collision detection coverage, comprehensive edge cases, round-trip testing for bidirectional transformations
- **Grade:** A-
- **Primary issues:** Browser API mocking complexity, magic constants duplication

### Store Tests Audit (Subagent 2)

- **Scope:** 13 test files covering stores and commands
- **Key findings:** Consistent singleton + reset pattern, command execute/undo symmetry, proper Svelte 5 runes testing
- **Grade:** A- (93/100)
- **Primary issues:** File location inconsistency, magic number in history depth test

### Component Tests Audit (Subagent 3)

- **Scope:** 35+ test files covering Svelte components
- **Key findings:** Strong accessibility focus, role-based queries, comprehensive ARIA testing
- **Grade:** A- (92/100)
- **Primary issues:** Mixed CSS class reliance, direct store mutation in some tests

### E2E Tests Audit (Subagent 4)

- **Scope:** 15 Playwright spec files
- **Key findings:** Good dual-view coverage, responsive testing across viewports
- **Grade:** B+ (needs improvement)
- **Primary issues:** 60% CSS class selectors, 13 skipped tests, arbitrary timeouts, no page objects

### Test Infrastructure Audit (Subagent 5)

- **Scope:** Vitest, Playwright configs, setup.ts, package.json
- **Key findings:** Modern stack (Vitest 3.x, Playwright 1.x), proper Svelte 5 support
- **Grade:** B+ (needs polish)
- **Primary issues:** No coverage thresholds, minimal Playwright config, no centralized utilities
