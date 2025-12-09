# Rackarr Development Prompt Plan

**Created:** 2025-12-09
**Updated:** 2025-12-09

---

## Overview

This document contains prompts for a code-generation LLM to implement features and bug fixes in a test-driven, incremental manner. Each prompt builds on the previous ones, ensuring no orphaned code and continuous integration.

### Implementation Principles

1. **TDD Protocol**: Write tests first, then implement to pass
2. **Incremental Progress**: Small, focused changes that build on each other
3. **No Big Jumps**: Each step is testable and verifiable
4. **Integration First**: Wire up changes immediately after implementation
5. **Bug Fixes First**: Critical bugs take priority over new features

---

## Phase 0: Critical Bug Fixes (v0.4.9)

### Prompt 0.1 — Fix Multi-Device Selection Bug (PRIORITY)

````text
Fix the bug where selecting a device on canvas selects ALL devices of the same type instead of just the clicked device.

**Problem:**
When clicking a device in the rack visualization, all devices that share the same libraryId (device type) become selected/highlighted. Selection should only highlight the single clicked device instance.

**Root Cause Investigation:**
1. Read `src/lib/stores/selection.svelte.ts` to understand selection state
2. Read `src/lib/components/RackDevice.svelte` to see how selection is rendered
3. Read `src/lib/components/Rack.svelte` to see how click events propagate
4. Identify where selection comparison uses `libraryId` instead of device index

**Expected Behavior:**
- Clicking a device selects ONLY that specific placed device instance
- Selection highlight (border/outline) appears on the clicked device only
- Other devices of the same type remain unselected
- EditPanel shows properties for the single selected device

**Implementation (TDD):**

First, write/update tests in `src/tests/selection.test.ts`:
```typescript
describe('device selection', () => {
  it('selects only the clicked device, not all devices of same type', () => {
    // Setup: rack with two devices of same libraryId at different positions
    // Action: select device at position 5
    // Assert: only device at position 5 is selected
    // Assert: device at position 10 (same libraryId) is NOT selected
  });

  it('selection uses device index, not libraryId', () => {
    // Verify selection state uses deviceIndex for identification
  });
});
````

Then, fix the implementation:

1. Ensure `selectDevice()` stores the unique device index, not libraryId
2. Ensure `RackDevice` compares selection using index position, not libraryId
3. Ensure visual selection highlight uses index-based comparison

**Verification:**

1. Run `npm run test:run` — selection tests pass
2. Run `npm run dev` and manually test:
   - Add two devices of same type (e.g., two "1U Server")
   - Click one device
   - Verify ONLY that device shows selection highlight
   - Verify the other device of same type is NOT highlighted

**Acceptance Criteria:**

- [ ] Only clicked device shows selection highlight
- [ ] Devices of same type are NOT all selected
- [ ] EditPanel shows correct device properties
- [ ] Selection persists correctly when clicking different devices
- [ ] Tests verify the fix

`````

---

## Phase 1: Airflow Visualization (v0.5.0)

**Objective:** Implement the redesigned airflow visualization feature using edge stripes instead of overlaid arrows.
**Spec:** `docs/planning/spec-airflow.md`
**Research:** `docs/planning/research-airflow.md`

### Current State Summary

The codebase already has:

- `AirflowIndicator.svelte` component (arrow-based, needs rewrite)
- `airflow.ts` utilities (conflict detection, direction helpers)
- UI store with `airflowMode` toggle
- EditPanel/AddDeviceForm with airflow dropdowns (6 options, needs reduction to 4)
- Design tokens for airflow colors in `tokens.css`
- Test files for airflow components and utilities

### Target State

- 4 airflow types: `passive`, `front-to-rear`, `rear-to-front`, `side-to-rear`
- Edge stripe + small arrow indicator (not overlaid arrows)
- Conflict highlighting with orange border
- 'A' keyboard shortcut for toggle
- Export support

---

### Prompt 1.1 — Update Airflow Schema to 4 Types

````text
Update the Airflow type and schema to support only 4 types as specified in docs/planning/spec-airflow.md.

**Task:**
1. Read the current schema in `src/lib/schemas/index.ts` to understand the existing AirflowSchema
2. Read the current types in `src/lib/types/index.ts` to see the Airflow type definition
3. Read the existing tests in `src/tests/airflow.test.ts` to understand test coverage

**Implementation (TDD):**

First, update the tests in `src/tests/airflow.test.ts`:
- Add tests verifying the 4 supported types: 'passive', 'front-to-rear', 'rear-to-front', 'side-to-rear'
- Add tests that removed types are NOT in the schema (left-to-right, right-to-left, bottom-to-top, top-to-bottom, rear-to-side, mixed)

Then, update the schema and types:
1. In `src/lib/schemas/index.ts`, update `AirflowSchema` to:
   ```typescript
   export const AirflowSchema = z.enum(['passive', 'front-to-rear', 'rear-to-front', 'side-to-rear']);
`````

2. In `src/lib/types/index.ts`, update the `Airflow` type to match:

   ```typescript
   export type Airflow = 'passive' | 'front-to-rear' | 'rear-to-front' | 'side-to-rear';
   ```

3. Run `npm run test:run` to verify tests pass
4. Run `npm run check` to ensure no TypeScript errors

**Acceptance Criteria:**

- Only 4 airflow types are valid in schema
- TypeScript type matches schema
- All existing tests that reference removed types are updated or removed
- No TypeScript compilation errors

````

---

## Phase 2: Update UI Dropdowns

### Prompt 2.1 — Update EditPanel Airflow Dropdown

```text
Update the airflow dropdown in EditPanel to show only 4 options.

**Task:**
1. Read `src/lib/components/EditPanel.svelte` to find the airflow dropdown
2. Read existing tests in `src/tests/EditPanel.test.ts`

**Implementation (TDD):**

First, update tests in `src/tests/EditPanel.test.ts`:
- Test that dropdown shows exactly 4 options
- Test option labels match spec: "Passive (no active cooling)", "Front to Rear", "Rear to Front", "Side to Rear"
- Test that selecting each option updates the device correctly

Then, update `EditPanel.svelte`:
1. Find the `AIRFLOW_OPTIONS` array (around line 185)
2. Update to only 4 options:
   ```typescript
   const AIRFLOW_OPTIONS = [
     { value: 'passive', label: 'Passive (no active cooling)' },
     { value: 'front-to-rear', label: 'Front to Rear' },
     { value: 'rear-to-front', label: 'Rear to Front' },
     { value: 'side-to-rear', label: 'Side to Rear' }
   ];
````

**Acceptance Criteria:**

- Dropdown shows exactly 4 options
- Labels are user-friendly as specified
- Selecting an option updates device airflow correctly
- Tests pass

````

### Prompt 2.2 — Update AddDeviceForm Airflow Dropdown

```text
Update the airflow dropdown in AddDeviceForm to match EditPanel.

**Task:**
1. Read `src/lib/components/AddDeviceForm.svelte` to find the airflow dropdown
2. Read existing tests in `src/tests/AddDeviceForm.test.ts`

**Implementation (TDD):**

First, update tests in `src/tests/AddDeviceForm.test.ts`:
- Test dropdown shows exactly 4 options
- Test default value is 'passive'
- Test selecting each option works

Then, update `AddDeviceForm.svelte`:
1. Update `AIRFLOW_OPTIONS` to match EditPanel (same 4 options)
2. Verify default value is 'passive'

**Acceptance Criteria:**
- Dropdown matches EditPanel exactly
- Default is 'passive'
- Tests pass
````

---

## Phase 3: Rewrite AirflowIndicator Component

### Prompt 3.1 — Write Tests for New AirflowIndicator

````text
Write comprehensive tests for the new edge stripe + arrow AirflowIndicator design BEFORE implementing.

**Context:**
The new design uses:
- 4px edge stripe (blue=intake, red=exhaust)
- Small directional arrow
- Hollow circle for passive
- Stripe on LEFT for front view, RIGHT for rear view

**Task:**
1. Read the spec in `docs/planning/spec-airflow.md` section "Visual Design"
2. Read existing tests in `src/tests/AirflowIndicator.test.ts`

**Implementation:**

Rewrite `src/tests/AirflowIndicator.test.ts` with new test cases:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import AirflowIndicator from '$lib/components/AirflowIndicator.svelte';

describe('AirflowIndicator - Edge Stripe Design', () => {
  const defaultProps = { width: 400, height: 50 };

  describe('passive airflow', () => {
    it('renders hollow circle for passive airflow', () => {
      const { container } = render(AirflowIndicator, {
        props: { airflow: 'passive', view: 'front', ...defaultProps }
      });
      const circle = container.querySelector('circle');
      expect(circle).toBeTruthy();
      expect(circle?.getAttribute('fill')).toBe('none');
      expect(circle?.getAttribute('stroke')).toBeTruthy();
    });

    it('does not render edge stripe for passive', () => {
      const { container } = render(AirflowIndicator, {
        props: { airflow: 'passive', view: 'front', ...defaultProps }
      });
      const rects = container.querySelectorAll('rect');
      expect(rects.length).toBe(0);
    });
  });

  describe('front-to-rear airflow', () => {
    it('renders blue stripe on LEFT in front view', () => {
      const { container } = render(AirflowIndicator, {
        props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
      });
      const stripe = container.querySelector('rect');
      expect(stripe).toBeTruthy();
      expect(stripe?.getAttribute('x')).toBe('0');
      expect(stripe?.getAttribute('fill')).toMatch(/#60a5fa|var\(--colour-airflow-intake\)/i);
    });

    it('renders red stripe on RIGHT in rear view', () => {
      const { container } = render(AirflowIndicator, {
        props: { airflow: 'front-to-rear', view: 'rear', ...defaultProps }
      });
      const stripe = container.querySelector('rect');
      expect(stripe).toBeTruthy();
      const x = parseFloat(stripe?.getAttribute('x') || '0');
      expect(x).toBeGreaterThan(defaultProps.width - 10); // Near right edge
      expect(stripe?.getAttribute('fill')).toMatch(/#f87171|var\(--colour-airflow-exhaust\)/i);
    });

    it('renders directional arrow', () => {
      const { container } = render(AirflowIndicator, {
        props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
      });
      const arrow = container.querySelector('polyline, path');
      expect(arrow).toBeTruthy();
    });
  });

  describe('rear-to-front airflow', () => {
    it('renders red stripe on LEFT in front view (exhaust)', () => {
      const { container } = render(AirflowIndicator, {
        props: { airflow: 'rear-to-front', view: 'front', ...defaultProps }
      });
      const stripe = container.querySelector('rect');
      expect(stripe?.getAttribute('x')).toBe('0');
      expect(stripe?.getAttribute('fill')).toMatch(/#f87171|var\(--colour-airflow-exhaust\)/i);
    });

    it('renders blue stripe on RIGHT in rear view (intake)', () => {
      const { container } = render(AirflowIndicator, {
        props: { airflow: 'rear-to-front', view: 'rear', ...defaultProps }
      });
      const stripe = container.querySelector('rect');
      const x = parseFloat(stripe?.getAttribute('x') || '0');
      expect(x).toBeGreaterThan(defaultProps.width - 10);
      expect(stripe?.getAttribute('fill')).toMatch(/#60a5fa|var\(--colour-airflow-intake\)/i);
    });
  });

  describe('side-to-rear airflow', () => {
    it('renders blue stripe on LEFT in front view', () => {
      const { container } = render(AirflowIndicator, {
        props: { airflow: 'side-to-rear', view: 'front', ...defaultProps }
      });
      const stripe = container.querySelector('rect');
      expect(stripe?.getAttribute('x')).toBe('0');
      expect(stripe?.getAttribute('fill')).toMatch(/#60a5fa|var\(--colour-airflow-intake\)/i);
    });

    it('renders red stripe on RIGHT in rear view', () => {
      const { container } = render(AirflowIndicator, {
        props: { airflow: 'side-to-rear', view: 'rear', ...defaultProps }
      });
      const stripe = container.querySelector('rect');
      const x = parseFloat(stripe?.getAttribute('x') || '0');
      expect(x).toBeGreaterThan(defaultProps.width - 10);
    });
  });

  describe('stripe dimensions', () => {
    it('stripe is 4px wide', () => {
      const { container } = render(AirflowIndicator, {
        props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
      });
      const stripe = container.querySelector('rect');
      expect(stripe?.getAttribute('width')).toBe('4');
    });

    it('stripe spans full device height', () => {
      const { container } = render(AirflowIndicator, {
        props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
      });
      const stripe = container.querySelector('rect');
      expect(stripe?.getAttribute('height')).toBe(String(defaultProps.height));
    });
  });

  describe('arrow animation class', () => {
    it('arrow has airflow-arrow class for animation', () => {
      const { container } = render(AirflowIndicator, {
        props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
      });
      const arrow = container.querySelector('.airflow-arrow');
      expect(arrow).toBeTruthy();
    });
  });
});
````

**Acceptance Criteria:**

- Tests cover all 4 airflow types
- Tests verify stripe position (left vs right based on view)
- Tests verify stripe color (blue=intake, red=exhaust)
- Tests verify passive renders circle only
- Tests verify arrow has animation class
- Tests should FAIL at this point (implementation not done yet)

````

### Prompt 3.2 — Implement New AirflowIndicator Component

```text
Rewrite AirflowIndicator.svelte to use edge stripes + small arrows instead of overlaid arrows.

**Task:**
1. Read the failing tests from Prompt 3.1
2. Read the spec in `docs/planning/spec-airflow.md` section "Visual Design"
3. Read the existing component at `src/lib/components/AirflowIndicator.svelte`

**Implementation:**

Completely rewrite `src/lib/components/AirflowIndicator.svelte`:

```svelte
<script lang="ts">
  import type { Airflow, RackView } from '$lib/types';

  interface Props {
    airflow: Airflow;
    view: RackView;
    width: number;
    height: number;
  }

  let { airflow, view, width, height }: Props = $props();

  // Constants
  const STRIPE_WIDTH = 4;
  const ARROW_SIZE = 8;

  // Determine if this view shows intake or exhaust
  const isIntakeSide = $derived.by(() => {
    if (airflow === 'passive') return false;
    if (airflow === 'front-to-rear') return view === 'front';
    if (airflow === 'rear-to-front') return view === 'rear';
    if (airflow === 'side-to-rear') return view === 'front'; // Side intake shown on front
    return false;
  });

  // Stripe color based on intake/exhaust
  const stripeColor = $derived(isIntakeSide ? '#60a5fa' : '#f87171');

  // Stripe position: LEFT for front view, RIGHT for rear view
  const stripeX = $derived(view === 'front' ? 0 : width - STRIPE_WIDTH);

  // Arrow positioning - next to stripe, centered vertically
  const arrowX = $derived(view === 'front' ? STRIPE_WIDTH + 4 : width - STRIPE_WIDTH - ARROW_SIZE - 4);
  const arrowY = $derived(height / 2);

  // Arrow points - chevron shape
  const arrowPoints = $derived.by(() => {
    const cx = arrowX;
    const cy = arrowY;
    const size = ARROW_SIZE;

    // Arrow direction: intake points INTO device (toward center), exhaust points OUT
    if (view === 'front') {
      if (isIntakeSide) {
        // Intake on front: arrow points right (into device)
        return `${cx},${cy - size / 2} ${cx + size},${cy} ${cx},${cy + size / 2}`;
      } else {
        // Exhaust on front: arrow points left (out of device)
        return `${cx + size},${cy - size / 2} ${cx},${cy} ${cx + size},${cy + size / 2}`;
      }
    } else {
      if (isIntakeSide) {
        // Intake on rear: arrow points left (into device)
        return `${cx + size},${cy - size / 2} ${cx},${cy} ${cx + size},${cy + size / 2}`;
      } else {
        // Exhaust on rear: arrow points right (out of device)
        return `${cx},${cy - size / 2} ${cx + size},${cy} ${cx},${cy + size / 2}`;
      }
    }
  });

  // Passive circle dimensions
  const circleRadius = $derived(Math.min(10, height / 4));
</script>

{#if airflow === 'passive'}
  <!-- Hollow circle for passive devices -->
  <circle
    cx={width / 2}
    cy={height / 2}
    r={circleRadius}
    stroke="#9ca3af"
    stroke-width="2"
    fill="none"
    opacity="0.7"
  />
{:else}
  <!-- Edge stripe -->
  <rect
    x={stripeX}
    y="0"
    width={STRIPE_WIDTH}
    {height}
    fill={stripeColor}
    opacity="0.85"
  />

  <!-- Directional arrow -->
  <polyline
    points={arrowPoints}
    stroke={stripeColor}
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
    class="airflow-arrow"
  />
{/if}

<style>
  @keyframes airflow-march {
    from {
      stroke-dashoffset: 8;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  .airflow-arrow {
    stroke-dasharray: 4 4;
    animation: airflow-march 0.8s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .airflow-arrow {
      animation: none;
      stroke-dasharray: none;
    }
  }
</style>
````

**Verification:**

1. Run `npm run test:run` - all AirflowIndicator tests should pass
2. Run `npm run check` - no TypeScript errors
3. Run `npm run dev` and visually verify:
   - Toggle airflow mode with toolbar button
   - Add devices with different airflow types
   - Verify stripes appear on correct sides

**Acceptance Criteria:**

- All tests from Prompt 3.1 pass
- Passive shows hollow circle only
- Active airflow shows 4px stripe + small arrow
- Stripe on left (front view) or right (rear view)
- Blue = intake, Red = exhaust
- Animation respects prefers-reduced-motion

````

---

## Phase 4: Update Airflow Utilities

### Prompt 4.1 — Update Conflict Detection for 4 Types

```text
Update airflow conflict detection utilities for the simplified 4-type system.

**Task:**
1. Read `src/lib/utils/airflow.ts`
2. Read tests in `src/tests/airflow.test.ts`
3. Read spec section "Conflict Detection" in `docs/planning/spec-airflow.md`

**Implementation (TDD):**

First, update tests in `src/tests/airflow.test.ts`:

```typescript
describe('conflict detection - simplified types', () => {
  describe('hasAirflowConflict', () => {
    // Conflicts occur when adjacent devices have opposing airflow
    it('front-to-rear above rear-to-front = conflict on rear face', () => {
      expect(hasAirflowConflict('front-to-rear', 'rear-to-front', 'rear')).toBe(true);
    });

    it('rear-to-front above front-to-rear = conflict on front face', () => {
      expect(hasAirflowConflict('rear-to-front', 'front-to-rear', 'front')).toBe(true);
    });

    it('same direction = no conflict', () => {
      expect(hasAirflowConflict('front-to-rear', 'front-to-rear', 'front')).toBe(false);
      expect(hasAirflowConflict('front-to-rear', 'front-to-rear', 'rear')).toBe(false);
    });

    it('passive never conflicts', () => {
      expect(hasAirflowConflict('passive', 'front-to-rear', 'front')).toBe(false);
      expect(hasAirflowConflict('front-to-rear', 'passive', 'rear')).toBe(false);
      expect(hasAirflowConflict('passive', 'passive', 'front')).toBe(false);
    });

    it('side-to-rear does not create conflicts', () => {
      expect(hasAirflowConflict('side-to-rear', 'front-to-rear', 'front')).toBe(false);
      expect(hasAirflowConflict('side-to-rear', 'rear-to-front', 'rear')).toBe(false);
    });
  });

  describe('getAirflowDirection', () => {
    it('front-to-rear: intake on front, exhaust on rear', () => {
      expect(getAirflowDirection('front-to-rear', 'front')).toBe('intake');
      expect(getAirflowDirection('front-to-rear', 'rear')).toBe('exhaust');
    });

    it('rear-to-front: exhaust on front, intake on rear', () => {
      expect(getAirflowDirection('rear-to-front', 'front')).toBe('exhaust');
      expect(getAirflowDirection('rear-to-front', 'rear')).toBe('intake');
    });

    it('side-to-rear: intake on front (sides), exhaust on rear', () => {
      expect(getAirflowDirection('side-to-rear', 'front')).toBe('intake');
      expect(getAirflowDirection('side-to-rear', 'rear')).toBe('exhaust');
    });

    it('passive: neutral on all faces', () => {
      expect(getAirflowDirection('passive', 'front')).toBe('neutral');
      expect(getAirflowDirection('passive', 'rear')).toBe('neutral');
    });
  });
});
````

Then, update `src/lib/utils/airflow.ts`:

1. Remove logic for deprecated types (left-to-right, etc.)
2. Simplify `hasAirflowConflict` for 4 types
3. Update `getAirflowDirection` for 4 types
4. Ensure `findAirflowConflicts` works with simplified logic

**Acceptance Criteria:**

- All conflict detection tests pass
- No references to deprecated airflow types
- side-to-rear correctly handled (no conflict generation)

````

---

## Phase 5: Conflict Highlighting

### Prompt 5.1 — Add Conflict Border to RackDevice

```text
Add orange conflict border to devices when airflow conflicts are detected.

**Task:**
1. Read `src/lib/components/RackDevice.svelte`
2. Read `src/lib/utils/airflow.ts` for conflict detection
3. Read spec section "Conflict Detection" in `docs/planning/spec-airflow.md`

**Implementation (TDD):**

First, add tests in `src/tests/RackDevice.test.ts`:

```typescript
describe('conflict highlighting', () => {
  it('renders orange border when hasConflict is true and airflowMode is on', () => {
    const { container } = render(RackDevice, {
      props: {
        device: mockDevice,
        position: 1,
        rackView: 'front',
        airflowMode: true,
        hasConflict: true,
        // ... other required props
      }
    });
    const deviceRect = container.querySelector('.device-body');
    expect(deviceRect).toHaveClass('airflow-conflict');
  });

  it('does not render conflict border when airflowMode is off', () => {
    const { container } = render(RackDevice, {
      props: {
        device: mockDevice,
        position: 1,
        rackView: 'front',
        airflowMode: false,
        hasConflict: true,
      }
    });
    const deviceRect = container.querySelector('.device-body');
    expect(deviceRect).not.toHaveClass('airflow-conflict');
  });
});
````

Then, update `RackDevice.svelte`:

1. Add `hasConflict` prop (boolean)
2. Add conditional class to device rect when `airflowMode && hasConflict`
3. Add CSS for conflict border:
   ```css
   .airflow-conflict {
   	stroke: var(--colour-airflow-conflict);
   	stroke-width: 2px;
   }
   ```

**Integration:**
After updating RackDevice, update `Rack.svelte` to:

1. Import `findAirflowConflicts` from airflow utils
2. Compute conflicts when airflowMode is on
3. Pass `hasConflict` prop to each RackDevice

**Acceptance Criteria:**

- Conflicting devices show orange 2px border
- Border only visible when airflowMode is ON
- Non-conflicting devices have no special border

````

### Prompt 5.2 — Wire Conflict Detection to Rack

```text
Wire up conflict detection in Rack component to pass hasConflict to RackDevice.

**Task:**
1. Read `src/lib/components/Rack.svelte`
2. Understand how devices are rendered
3. Wire up conflict detection

**Implementation (TDD):**

First, add tests in `src/tests/Rack.test.ts` or `src/tests/RackVisuals.test.ts`:

```typescript
describe('conflict detection integration', () => {
  it('passes hasConflict=true to devices with airflow conflicts', () => {
    // Set up rack with conflicting devices
    // Verify RackDevice receives hasConflict=true
  });
});
````

Then, update `Rack.svelte`:

```typescript
import { findAirflowConflicts } from '$lib/utils/airflow';

// ... existing code ...

// Compute conflicts only when airflowMode is on
const conflicts = $derived.by(() => {
	if (!airflowMode) return new Set<number>();
	const conflictList = findAirflowConflicts(rack, deviceLibrary);
	// Return set of device positions that have conflicts
	return new Set(conflictList.flatMap((c) => [c.lowerPosition, c.upperPosition]));
});

// In the device rendering loop, check if device position is in conflict set
// Pass hasConflict={conflicts.has(device.position)} to RackDevice
```

**Acceptance Criteria:**

- Conflict detection runs when airflowMode is on
- Conflicting device positions are identified
- hasConflict prop passed correctly to RackDevice
- Visual verification: place front-to-rear and rear-to-front adjacent, see orange borders

````

---

## Phase 6: Keyboard Shortcut

### Prompt 6.1 — Add 'A' Key Toggle for Airflow Mode

```text
Add keyboard shortcut 'A' to toggle airflow visualization mode.

**Task:**
1. Read `src/lib/components/KeyboardHandler.svelte`
2. Read existing keyboard shortcuts in spec
3. Read `src/lib/stores/ui.svelte.ts` for toggleAirflowMode

**Implementation (TDD):**

First, add tests in `src/tests/KeyboardHandler.test.ts`:

```typescript
describe('airflow shortcut', () => {
  it('A key toggles airflow mode', async () => {
    render(KeyboardHandler);
    expect(uiStore.airflowMode).toBe(false);

    await fireEvent.keyDown(document, { key: 'a' });
    expect(uiStore.airflowMode).toBe(true);

    await fireEvent.keyDown(document, { key: 'a' });
    expect(uiStore.airflowMode).toBe(false);
  });

  it('A key does not toggle when input is focused', async () => {
    // Verify shortcut doesn't fire when typing in form fields
  });
});
````

Then, update `KeyboardHandler.svelte`:

1. Add handler for 'a' or 'A' key
2. Call `uiStore.toggleAirflowMode()`
3. Ensure it doesn't fire when form inputs are focused

**Acceptance Criteria:**

- 'A' key toggles airflow mode
- Shortcut disabled when typing in form fields
- Works regardless of caps lock state

````

### Prompt 6.2 — Update Help Panel with 'A' Shortcut

```text
Add 'A' shortcut to the help panel / keyboard shortcuts documentation.

**Task:**
1. Read `src/lib/components/HelpPanel.svelte`
2. Find where keyboard shortcuts are listed

**Implementation:**

Update `HelpPanel.svelte` to include:
- `A` — Toggle airflow visualization

Place it in the appropriate section with other view toggles (near 'I' for display mode toggle).

**Acceptance Criteria:**
- Help panel shows 'A' shortcut
- Description matches spec: "Toggle airflow visualization"
- Grouped with other view-related shortcuts
````

---

## Phase 7: Export Support

### Prompt 7.1 — Include Airflow Indicators in Exports

````text
Ensure airflow indicators appear in exported images when airflowMode is enabled.

**Task:**
1. Read `src/lib/utils/export.ts`
2. Read `src/lib/components/ExportDialog.svelte`
3. Understand how exports are rendered

**Implementation (TDD):**

First, add E2E test in `e2e/export.spec.ts`:

```typescript
test('exported image includes airflow indicators when mode is on', async ({ page }) => {
  // Create layout with devices that have airflow set
  // Enable airflow mode
  // Export as PNG
  // Verify export includes airflow visualization
});
````

Then, update export logic:

1. Ensure `airflowMode` state is passed to export rendering
2. When airflowMode is true, include AirflowIndicator in rendered output
3. Verify PDF, PNG, SVG all include indicators

**Note:** Animation will NOT appear in static exports (expected behavior per spec).

**Acceptance Criteria:**

- Exported PNG/SVG/PDF shows airflow stripes when mode is on
- Export does not show airflow when mode is off
- Animation not present in exports (static representation)

````

---

## Phase 8: Final Integration & Testing

### Prompt 8.1 — End-to-End Workflow Test

```text
Create comprehensive E2E test for the complete airflow workflow.

**Task:**
1. Read existing E2E tests in `e2e/`
2. Create new test file `e2e/airflow.spec.ts`

**Implementation:**

Create `e2e/airflow.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Airflow Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Create a new rack or load test layout
  });

  test('toggle airflow mode with A key', async ({ page }) => {
    // Verify airflow mode is off by default
    // Press 'A' key
    // Verify airflow indicators appear
    // Press 'A' again
    // Verify indicators disappear
  });

  test('toggle airflow mode with toolbar button', async ({ page }) => {
    // Click airflow toggle button
    // Verify indicators appear
  });

  test('edit device airflow in EditPanel', async ({ page }) => {
    // Select a device
    // Open EditPanel
    // Change airflow dropdown
    // Verify device updates
  });

  test('create device with airflow in AddDeviceForm', async ({ page }) => {
    // Open Add Device dialog
    // Set airflow to front-to-rear
    // Create device
    // Place in rack
    // Enable airflow mode
    // Verify stripe appears
  });

  test('conflict highlighting', async ({ page }) => {
    // Create two devices: front-to-rear and rear-to-front
    // Place them adjacent
    // Enable airflow mode
    // Verify orange border on both
  });

  test('airflow persists in save/load', async ({ page }) => {
    // Create device with specific airflow
    // Save layout
    // Clear/reset
    // Load layout
    // Verify airflow preserved
  });
});
````

**Acceptance Criteria:**

- All E2E tests pass
- Complete workflow verified from creation to export

````

### Prompt 8.2 — Visual Regression Testing (Optional)

```text
Add visual regression tests for airflow indicators if the project uses visual testing.

**Task:**
1. Check if visual testing is set up (e.g., Percy, Playwright visual comparisons)
2. If available, add visual snapshots

**Implementation:**

If Playwright visual comparisons are available:

```typescript
test('airflow indicator visual regression', async ({ page }) => {
  await page.goto('/');
  // Set up rack with all 4 airflow types
  // Enable airflow mode
  await expect(page.locator('.rack-container')).toMatchSnapshot('airflow-all-types.png');
});
````

**Acceptance Criteria:**

- Visual snapshots captured for all airflow types
- Both front and rear views covered

````

### Prompt 8.3 — Final Code Review and Cleanup

```text
Perform final review and cleanup of all airflow-related code.

**Task:**
1. Run all tests: `npm run test:run`
2. Run type checking: `npm run check`
3. Run linting: `npm run lint`
4. Review all modified files for:
   - Dead code removal
   - Consistent naming
   - No TODO comments left
   - Proper TypeScript types
   - Spec compliance

**Checklist:**
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] No console.log statements
- [ ] Only 4 airflow types in UI
- [ ] Help panel updated
- [ ] Keyboard shortcut works
- [ ] Export includes indicators

**Final Verification:**
1. `npm run dev` - manual testing
2. Test all 4 airflow types visually
3. Test conflict highlighting
4. Test 'A' keyboard shortcut
5. Test export with airflow on
6. Test save/load preserves airflow

**Acceptance Criteria:**
- All checks pass
- Feature matches spec exactly
- Ready for PR/release
````

---

## Phase 9: Documentation and Release

### Prompt 9.1 — Update SPEC.md with Completed Feature

```text
Update the main specification document with the completed airflow feature.

**Task:**
1. Read `docs/planning/SPEC.md`
2. Update relevant sections

**Updates:**
1. Update version to 0.5.0
2. Update Airflow type list to show only 4 types
3. Add "Edge stripe visualization" to component list
4. Update keyboard shortcuts table with 'A'
5. Add airflow to export options if not already there

**Acceptance Criteria:**
- SPEC.md reflects v0.5.0 features
- Airflow section is accurate
```

### Prompt 9.2 — Update ROADMAP.md

````text
Move airflow visualization from Planned to Released in roadmap.

**Task:**
1. Read `docs/planning/ROADMAP.md`
2. Move v0.5.0 entry from Planned to Released
3. Add changelog entry

**Updates:**
```markdown
## Released

### v0.5.0 — Airflow Visualization

**Status:** Complete
**Spec:** `docs/planning/spec-airflow.md`

- 4 simplified airflow types (passive, front-to-rear, rear-to-front, side-to-rear)
- Edge stripe + arrow visualization (blue=intake, red=exhaust)
- Conflict highlighting (orange border)
- 'A' keyboard shortcut toggle
- Export support
````

**Acceptance Criteria:**

- Roadmap accurately reflects completed status
- Changelog entry added

```

---

## Summary

| Phase | Prompts | Focus |
|-------|---------|-------|
| 1 | 1.1 | Schema and type updates |
| 2 | 2.1-2.2 | UI dropdowns (EditPanel, AddDeviceForm) |
| 3 | 3.1-3.2 | AirflowIndicator component rewrite |
| 4 | 4.1 | Conflict detection utilities |
| 5 | 5.1-5.2 | Conflict highlighting in RackDevice |
| 6 | 6.1-6.2 | Keyboard shortcut 'A' |
| 7 | 7.1 | Export support |
| 8 | 8.1-8.3 | E2E testing and cleanup |
| 9 | 9.1-9.2 | Documentation updates |

**Total: 13 prompts across 9 phases**

Each prompt is self-contained but builds on previous work. No orphaned code — each change is integrated immediately.
```
