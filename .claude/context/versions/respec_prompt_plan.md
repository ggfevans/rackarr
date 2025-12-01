# Rackarr Single-Rack Rescope — Implementation Prompt Plan

**Version:** 0.1.1-rescope
**Created:** 2025-12-01
**Spec Reference:** `rackarr-single-rack-rescope-spec.md`
**Execution Mode:** Autonomous (no pauses between prompts)

---

## Overview

This document contains a series of implementation prompts for the Rackarr single-rack rescope. Each prompt is designed to be:

1. **Small and focused** — One clear objective per prompt
2. **Test-driven** — Tests written first, implementation follows
3. **Incremental** — Each builds on the previous, no orphaned code
4. **Verifiable** — Clear success criteria with runnable tests

### Codebase Context

- **Framework:** Svelte 5 with runes (`$state`, `$derived`, `$effect`)
- **Testing:** Vitest + @testing-library/svelte (unit), Playwright (E2E)
- **Current state:** MAX_RACKS=1 already set in constants.ts (commit dd8981b)
- **Key files:**
  - Layout store: `src/lib/stores/layout.svelte.ts`
  - Canvas: `src/lib/components/Canvas.svelte`
  - App: `src/App.svelte`
  - Dialog base: `src/lib/components/Dialog.svelte`
  - ConfirmDialog: `src/lib/components/ConfirmDialog.svelte`

### Execution Guidelines

```
STOPPING CONDITIONS (only these):
1. All prompts marked complete
2. Test failure after 2 fix attempts
3. Genuine ambiguity requiring human input (document in blockers.md)

Otherwise: Proceed immediately to next prompt.
```

---

## Prompt 0: Verify Prerequisites

**Objective:** Confirm clean baseline before implementation.

```text
PROMPT 0: VERIFY PREREQUISITES

Before starting implementation, verify the codebase is in a clean state:

1. Run `npm install` to ensure all dependencies are installed
2. Run `npm run test:run` — ALL tests must pass
3. Run `npm run build` — Build must succeed with no errors
4. Run `git status` — Note any uncommitted changes

EXPECTED STATE:
- 791+ tests passing
- Build succeeds
- MAX_RACKS = 1 in src/lib/types/constants.ts

If any step fails, fix before proceeding. Do NOT continue with failing tests.

SUCCESS CRITERIA:
- [ ] npm install completes
- [ ] All unit tests pass
- [ ] Build succeeds
- [ ] Baseline documented
```

---

## Prompt 1: Layout Store — Single Rack Enforcement

**Objective:** Ensure layout store properly enforces single rack limit with correct error messages.

````text
PROMPT 1: LAYOUT STORE SINGLE RACK ENFORCEMENT

The MAX_RACKS constant is already set to 1. Now update the layout store to:
1. Import MAX_RACKS from constants (remove any local definition)
2. Use dynamic error message that reflects the constant value
3. Update tests to expect single-rack behavior

FILES TO MODIFY:
- src/lib/stores/layout.svelte.ts
- src/tests/layout-store.test.ts

STEP 1: Update layout store imports
Replace any local MAX_RACKS constant with import from constants:

```typescript
import { DEFAULT_DEVICE_FACE, MAX_RACKS } from '$lib/types/constants';
````

Remove the local `const MAX_RACKS = 6;` if present.

STEP 2: Update duplicateRack error message
Change hardcoded "6 racks" to dynamic message:

```typescript
if (layout.racks.length >= MAX_RACKS) {
	return { error: `Maximum of ${MAX_RACKS} rack${MAX_RACKS === 1 ? '' : 's'} allowed` };
}
```

STEP 3: Update tests
In layout-store.test.ts, update tests that reference 6 racks:

- Test "returns null when 6 racks exist" → "returns null when 1 rack exists (single-rack mode)"
- Test "returns error when 6 racks exist" → "returns error when 1 rack exists (single-rack mode)"
- Update expectations from 6 to 1
- Update error message expectations to "Maximum of 1 rack allowed"

STEP 4: Run tests

```bash
npm run test:run
```

All tests must pass before committing.

COMMIT MESSAGE:
feat(rescope): enforce single rack limit in layout store

SUCCESS CRITERIA:

- [ ] No local MAX_RACKS in layout store
- [ ] Error messages use dynamic template
- [ ] Tests updated for single-rack expectations
- [ ] All tests pass

````

---

## Prompt 2: Create ConfirmReplaceDialog Component

**Objective:** Create a new dialog component for save-first confirmation when replacing an existing rack.

```text
PROMPT 2: CREATE CONFIRM REPLACE DIALOG COMPONENT

Create a new dialog component that shows when user clicks "New Rack" while a rack exists.
Dialog offers three options: Save First, Replace, Cancel.

REFERENCE: rackarr-single-rack-rescope-spec.md Part 5.4

STEP 1: Write tests first
Create src/tests/ConfirmReplaceDialog.test.ts:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ConfirmReplaceDialog from '$lib/components/ConfirmReplaceDialog.svelte';
import { resetLayoutStore, getLayoutStore } from '$lib/stores/layout.svelte';

describe('ConfirmReplaceDialog', () => {
  beforeEach(() => {
    resetLayoutStore();
  });

  it('does not render when open is false', () => {
    render(ConfirmReplaceDialog, {
      props: { open: false, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with title when open', () => {
    const store = getLayoutStore();
    store.addRack('Test Rack', 42);

    render(ConfirmReplaceDialog, {
      props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Replace Current Rack?')).toBeInTheDocument();
  });

  it('displays rack name in message', () => {
    const store = getLayoutStore();
    store.addRack('My Homelab', 42);

    render(ConfirmReplaceDialog, {
      props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
    });

    expect(screen.getByText(/My Homelab/)).toBeInTheDocument();
  });

  it('displays device count with correct pluralization (1 device)', () => {
    const store = getLayoutStore();
    store.addRack('Rack', 42);
    const device = store.addDeviceToLibrary({ name: 'Server', height: 2, category: 'server', colour: '#4A90D9' });
    store.placeDevice(store.racks[0].id, device.id, 1);

    render(ConfirmReplaceDialog, {
      props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
    });

    expect(screen.getByText(/1 device placed/)).toBeInTheDocument();
  });

  it('displays device count with correct pluralization (3 devices)', () => {
    const store = getLayoutStore();
    store.addRack('Rack', 42);
    for (let i = 0; i < 3; i++) {
      const device = store.addDeviceToLibrary({ name: `Device ${i}`, height: 1, category: 'server', colour: '#4A90D9' });
      store.placeDevice(store.racks[0].id, device.id, i + 1);
    }

    render(ConfirmReplaceDialog, {
      props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
    });

    expect(screen.getByText(/3 devices placed/)).toBeInTheDocument();
  });

  it('handles zero devices', () => {
    const store = getLayoutStore();
    store.addRack('Empty Rack', 42);

    render(ConfirmReplaceDialog, {
      props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
    });

    expect(screen.getByText(/0 devices placed/)).toBeInTheDocument();
  });

  it('uses "Untitled Rack" for empty rack name', () => {
    const store = getLayoutStore();
    store.addRack('', 42);

    render(ConfirmReplaceDialog, {
      props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
    });

    expect(screen.getByText(/Untitled Rack/)).toBeInTheDocument();
  });

  it('calls onSaveFirst when Save First button clicked', async () => {
    const store = getLayoutStore();
    store.addRack('Rack', 42);
    const onSaveFirst = vi.fn();

    render(ConfirmReplaceDialog, {
      props: { open: true, onSaveFirst, onReplace: vi.fn(), onCancel: vi.fn() }
    });

    await fireEvent.click(screen.getByText('Save First'));
    expect(onSaveFirst).toHaveBeenCalledOnce();
  });

  it('calls onReplace when Replace button clicked', async () => {
    const store = getLayoutStore();
    store.addRack('Rack', 42);
    const onReplace = vi.fn();

    render(ConfirmReplaceDialog, {
      props: { open: true, onSaveFirst: vi.fn(), onReplace, onCancel: vi.fn() }
    });

    await fireEvent.click(screen.getByText('Replace'));
    expect(onReplace).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Cancel button clicked', async () => {
    const store = getLayoutStore();
    store.addRack('Rack', 42);
    const onCancel = vi.fn();

    render(ConfirmReplaceDialog, {
      props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel }
    });

    await fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('renders three buttons with correct labels', () => {
    const store = getLayoutStore();
    store.addRack('Rack', 42);

    render(ConfirmReplaceDialog, {
      props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
    });

    expect(screen.getByText('Save First')).toBeInTheDocument();
    expect(screen.getByText('Replace')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
````

STEP 2: Run tests (should fail - component doesn't exist)

```bash
npm run test:run -- src/tests/ConfirmReplaceDialog.test.ts
```

STEP 3: Create component
Create src/lib/components/ConfirmReplaceDialog.svelte:

```svelte
<script lang="ts">
	import Dialog from './Dialog.svelte';
	import { getLayoutStore } from '$lib/stores/layout.svelte';

	interface Props {
		open: boolean;
		onSaveFirst: () => void;
		onReplace: () => void;
		onCancel: () => void;
	}

	let { open, onSaveFirst, onReplace, onCancel }: Props = $props();

	const layoutStore = getLayoutStore();

	const rackName = $derived(layoutStore.racks[0]?.name || 'Untitled Rack');
	const deviceCount = $derived(layoutStore.racks[0]?.devices.length ?? 0);
	const deviceWord = $derived(deviceCount === 1 ? 'device' : 'devices');
	const message = $derived(
		`"${rackName}" has ${deviceCount} ${deviceWord} placed. Save your layout first?`
	);
</script>

<Dialog {open} title="Replace Current Rack?" width="420px" onclose={onCancel}>
	{#snippet children()}
		<p class="message">{message}</p>

		<div class="actions">
			<button type="button" class="btn btn-primary" onclick={onSaveFirst}> Save First </button>
			<button type="button" class="btn btn-destructive" onclick={onReplace}> Replace </button>
			<button type="button" class="btn btn-secondary" onclick={onCancel}> Cancel </button>
		</div>
	{/snippet}
</Dialog>

<style>
	.message {
		margin: 0 0 24px 0;
		color: var(--colour-text-secondary);
		line-height: 1.5;
	}

	.actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.btn {
		padding: 8px 16px;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
		transition: opacity 0.15s;
	}

	.btn:hover {
		opacity: 0.9;
	}

	.btn-primary {
		background: var(--colour-primary);
		color: white;
	}

	.btn-destructive {
		background: var(--colour-error, #dc3545);
		color: white;
	}

	.btn-secondary {
		background: transparent;
		border: 1px solid var(--colour-border);
		color: var(--colour-text);
	}
</style>
```

STEP 4: Run tests (should pass)

```bash
npm run test:run -- src/tests/ConfirmReplaceDialog.test.ts
```

STEP 5: Run full test suite

```bash
npm run test:run
```

COMMIT MESSAGE:
feat(rescope): add ConfirmReplaceDialog component

SUCCESS CRITERIA:

- [ ] All ConfirmReplaceDialog tests pass
- [ ] Component renders correctly with rack data
- [ ] Three buttons with correct styling
- [ ] Full test suite passes

````

---

## Prompt 3: Integrate Dialog into App.svelte

**Objective:** Wire the ConfirmReplaceDialog into the New Rack flow in App.svelte.

```text
PROMPT 3: INTEGRATE CONFIRM REPLACE DIALOG INTO APP

Modify App.svelte to show the ConfirmReplaceDialog when user clicks "New Rack"
while a rack already exists.

REFERENCE: rackarr-single-rack-rescope-spec.md Part 5.4

STEP 1: Read current App.svelte to understand existing flow
Identify:
- Where handleNewRack is called
- How newRackFormOpen state is managed
- How save functionality works

STEP 2: Add state and dialog integration
Add to App.svelte script section:

```typescript
import ConfirmReplaceDialog from '$lib/components/ConfirmReplaceDialog.svelte';

// Add new state
let showReplaceDialog = $state(false);
let pendingSaveFirst = $state(false);

// Modify handleNewRack to check for existing rack
function handleNewRack(): void {
  if (layoutStore.racks.length > 0) {
    showReplaceDialog = true;
  } else {
    newRackFormOpen = true;
  }
}

// Handle Save First button
function handleSaveFirst(): void {
  showReplaceDialog = false;
  pendingSaveFirst = true;
  // Trigger save - reuse existing save logic
  handleSave();
}

// Handle Replace button
function handleReplace(): void {
  showReplaceDialog = false;
  layoutStore.resetLayout();
  newRackFormOpen = true;
}

// Handle Cancel button
function handleCancelReplace(): void {
  showReplaceDialog = false;
}

// Modify existing handleSave completion to check pendingSaveFirst
// After successful save, if pendingSaveFirst is true:
function handleSaveComplete(): void {
  if (pendingSaveFirst) {
    pendingSaveFirst = false;
    layoutStore.resetLayout();
    newRackFormOpen = true;
  }
}
````

STEP 3: Add dialog to template
Add before closing main element:

```svelte
<ConfirmReplaceDialog
	open={showReplaceDialog}
	onSaveFirst={handleSaveFirst}
	onReplace={handleReplace}
	onCancel={handleCancelReplace}
/>
```

STEP 4: Update existing save flow
Find the existing save handler and ensure it calls handleSaveComplete()
after successful save. This may require modifying how the save dialog
communicates completion back to App.svelte.

STEP 5: Test manually

1. Start dev server: `npm run dev`
2. Create a rack
3. Click "New Rack" button
4. Verify dialog appears with rack name and device count
5. Test each button:
   - Cancel: Dialog closes, rack unchanged
   - Replace: Rack cleared, new rack form opens
   - Save First: Save dialog opens, after save rack cleared, new rack form opens

STEP 6: Run full test suite

```bash
npm run test:run
```

COMMIT MESSAGE:
feat(rescope): integrate save-first dialog for new rack flow

SUCCESS CRITERIA:

- [ ] Dialog shows when clicking New Rack with existing rack
- [ ] Cancel closes dialog without changes
- [ ] Replace clears rack and opens new rack form
- [ ] Save First triggers save, then clears and opens form
- [ ] All tests pass

````

---

## Prompt 4: Handle Multi-Rack File Loading

**Objective:** When loading a file with multiple racks, load only the first rack and show a warning toast.

```text
PROMPT 4: HANDLE MULTI-RACK FILE LOADING

Modify the file loading logic to detect multi-rack files, load only the first rack,
and show a warning toast to the user.

REFERENCE: rackarr-single-rack-rescope-spec.md Part 4.1, Part 5.2

STEP 1: Write tests first
Add to src/tests/layout-store.test.ts (or create layout-store-rescope.test.ts):

```typescript
describe('Multi-Rack File Loading', () => {
  beforeEach(() => {
    resetLayoutStore();
  });

  it('loads only first rack from multi-rack file', () => {
    const store = getLayoutStore();
    const multiRackLayout = {
      version: '0.2.0',
      name: 'Multi-Rack Layout',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      settings: { theme: 'dark' as const },
      deviceLibrary: [],
      racks: [
        { id: 'rack-1', name: 'First Rack', height: 42, width: 19, position: 0, view: 'front' as const, devices: [] },
        { id: 'rack-2', name: 'Second Rack', height: 24, width: 19, position: 1, view: 'front' as const, devices: [] },
        { id: 'rack-3', name: 'Third Rack', height: 18, width: 19, position: 2, view: 'front' as const, devices: [] }
      ]
    };

    store.loadLayout(multiRackLayout);

    expect(store.racks).toHaveLength(1);
    expect(store.racks[0].name).toBe('First Rack');
  });

  it('preserves full device library from multi-rack file', () => {
    const store = getLayoutStore();
    const multiRackLayout = {
      version: '0.2.0',
      name: 'Test',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      settings: { theme: 'dark' as const },
      deviceLibrary: [
        { id: 'dev-1', name: 'Server', height: 2, category: 'server' as const, colour: '#4A90D9' },
        { id: 'dev-2', name: 'Switch', height: 1, category: 'network' as const, colour: '#50C878' }
      ],
      racks: [
        { id: 'rack-1', name: 'Rack 1', height: 42, width: 19, position: 0, view: 'front' as const, devices: [] },
        { id: 'rack-2', name: 'Rack 2', height: 24, width: 19, position: 1, view: 'front' as const, devices: [] }
      ]
    };

    store.loadLayout(multiRackLayout);

    // All library devices preserved even though only first rack loaded
    expect(store.deviceLibrary).toHaveLength(2);
  });

  it('loads single-rack file normally', () => {
    const store = getLayoutStore();
    const singleRackLayout = {
      version: '0.2.0',
      name: 'Single Rack',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      settings: { theme: 'dark' as const },
      deviceLibrary: [],
      racks: [
        { id: 'rack-1', name: 'Only Rack', height: 42, width: 19, position: 0, view: 'front' as const, devices: [] }
      ]
    };

    store.loadLayout(singleRackLayout);

    expect(store.racks).toHaveLength(1);
    expect(store.racks[0].name).toBe('Only Rack');
  });
});
````

STEP 2: Modify layout store loadLayout function
In src/lib/stores/layout.svelte.ts, update the loadLayout function:

```typescript
/**
 * Load an existing layout
 * Automatically migrates from older versions
 * v0.1.1: Loads only first rack from multi-rack files
 * @param layoutData - Layout to load
 * @returns Number of racks that were in the original file (for toast display)
 */
function loadLayout(layoutData: Layout): number {
	const migrated = migrateLayout(layoutData);
	const originalRackCount = migrated.racks.length;

	// Single-rack mode: only load first rack
	const singleRackData = {
		...migrated,
		racks: migrated.racks.slice(0, 1)
	};

	layout = singleRackData;
	isDirty = false;

	return originalRackCount;
}
```

STEP 3: Update App.svelte to show toast
In App.svelte handleLoad function, use the return value:

```typescript
async function handleLoad(file: File): Promise<void> {
	try {
		const layoutData = await readLayoutFile(file);
		const originalRackCount = layoutStore.loadLayout(layoutData);

		if (originalRackCount > 1) {
			toastStore.showToast(
				`Layout contained ${originalRackCount} racks. Loaded first rack only.`,
				'warning'
			);
		} else {
			toastStore.showToast('Layout loaded successfully', 'success');
		}

		selectionStore.clearSelection();
	} catch (error) {
		toastStore.showToast(error instanceof Error ? error.message : 'Failed to load layout', 'error');
	}
}
```

STEP 4: Run tests

```bash
npm run test:run
```

COMMIT MESSAGE:
feat(rescope): handle multi-rack file loading with warning toast

SUCCESS CRITERIA:

- [ ] Multi-rack files load only first rack
- [ ] Warning toast shows rack count for multi-rack files
- [ ] Device library fully preserved
- [ ] Single-rack files load normally
- [ ] All tests pass

````

---

## Prompt 5: Disable Cross-Rack Device Moves

**Objective:** Ensure cross-rack device moves are blocked (even though there's only one rack).

```text
PROMPT 5: DISABLE CROSS-RACK DEVICE MOVES

Even with single-rack mode, we should explicitly block cross-rack moves for safety.
This ensures the code is defensive if somehow multiple racks exist.

REFERENCE: rackarr-single-rack-rescope-spec.md Part 1.3, Part 5.3

STEP 1: Update moveDeviceToRack in layout store
In src/lib/stores/layout.svelte.ts:

```typescript
/**
 * Move a device from one rack to another
 * v0.1.1: Cross-rack moves disabled in single-rack mode
 * @returns false - cross-rack moves are not supported
 */
function moveDeviceToRack(
  fromRackId: string,
  deviceIndex: number,
  toRackId: string,
  newPosition: number
): boolean {
  // Same rack? Delegate to moveDevice
  if (fromRackId === toRackId) {
    return moveDevice(fromRackId, deviceIndex, newPosition);
  }

  // Cross-rack moves blocked in single-rack mode
  console.debug('Cross-rack move blocked in single-rack mode');
  return false;
}
````

STEP 2: Update tests
Modify existing cross-rack tests to expect false return and no state change.
In src/tests/layout-store.test.ts, update the moveDeviceToRack tests:

```typescript
describe('moveDeviceToRack', () => {
	// Keep existing same-rack delegation test

	it('blocks cross-rack moves in single-rack mode', () => {
		// Note: This test requires temporarily having 2 racks which isn't normally possible
		// Skip or mark as documenting expected behavior when MAX_RACKS > 1
	});
});
```

Since we can't easily test cross-rack with MAX_RACKS=1, we can:

1. Test that same-rack moves still work (delegation to moveDevice)
2. Add a comment documenting the behavior

STEP 3: Check for any cross-rack drop handlers in components
Search for references to moveDeviceToRack in components and ensure they handle
the false return appropriately.

STEP 4: Run tests

```bash
npm run test:run
```

COMMIT MESSAGE:
refactor(rescope): disable cross-rack device moves

SUCCESS CRITERIA:

- [ ] moveDeviceToRack returns false for different rack IDs
- [ ] Same-rack moves still work (delegates to moveDevice)
- [ ] All tests pass

````

---

## Prompt 6: Simplify Canvas Layout

**Objective:** Change Canvas from horizontal rack row to centered single rack.

```text
PROMPT 6: SIMPLIFY CANVAS LAYOUT

Replace the multi-rack horizontal row layout with a simple centered single rack.

REFERENCE: rackarr-single-rack-rescope-spec.md Part 3.3

STEP 1: Read current Canvas.svelte
Understand the current structure with .rack-row and rack iteration.

STEP 2: Simplify the template
Replace the rack iteration with direct single rack reference:

FROM:
```svelte
<div class="rack-row">
  {#each sortedRacks as rack (rack.id)}
    <Rack {rack} ... />
  {/each}
</div>
````

TO:

```svelte
<div class="rack-wrapper">
	{#if layoutStore.racks[0]}
		<Rack rack={layoutStore.racks[0]} ... />
	{/if}
</div>
```

STEP 3: Update CSS
Replace .rack-row styles with .rack-wrapper centering styles:

```css
.rack-wrapper {
	display: inline-block;
	/* Panzoom handles centering via fitAll */
}
```

Remove:

- .rack-row flex styles
- RACK_GAP constant usage
- Any multi-rack positioning logic

STEP 4: Remove unused derived state
If there's a sortedRacks derived, remove it since we only have one rack.

STEP 5: Update Canvas tests
In src/tests/Canvas.test.ts, update tests to expect .rack-wrapper instead of .rack-row:

```typescript
it('renders rack wrapper instead of rack row', () => {
	const store = getLayoutStore();
	store.addRack('Test', 42);

	const { container } = render(Canvas);

	expect(container.querySelector('.rack-wrapper')).toBeInTheDocument();
	expect(container.querySelector('.rack-row')).not.toBeInTheDocument();
});
```

STEP 6: Run tests

```bash
npm run test:run
```

STEP 7: Visual verification

```bash
npm run dev
```

Create a rack and verify it displays centered on canvas.

COMMIT MESSAGE:
refactor(rescope): simplify canvas to single centered rack

SUCCESS CRITERIA:

- [ ] Canvas renders single rack in .rack-wrapper
- [ ] No .rack-row element in DOM
- [ ] Rack displays correctly
- [ ] All tests pass

````

---

## Prompt 7: Simplify fitAll Calculation

**Objective:** Simplify the fitAll zoom calculation for a single rack.

```text
PROMPT 7: SIMPLIFY FIT ALL CALCULATION

The current fitAll calculates bounding box for multiple racks. Simplify for single rack.

REFERENCE: rackarr-single-rack-rescope-spec.md Part 3.5

STEP 1: Review current fitAll implementation
Check src/lib/stores/canvas.svelte.ts and src/lib/utils/canvas.ts for:
- calculateFitAll or similar function
- How it handles multiple racks
- Bounding box calculations

STEP 2: Simplify to single rack
If there's complex bounding box logic, simplify to:

```typescript
/**
 * Calculate fit-all parameters for single rack
 */
export function calculateFitAllSingleRack(
  rackHeight: number,
  viewportWidth: number,
  viewportHeight: number
): { zoom: number; panX: number; panY: number } {
  // Constants from existing code
  const U_HEIGHT = 17.78; // mm per U, scaled
  const RACK_WIDTH = 482.6; // 19" rack width in mm
  const PADDING = 50; // Padding around rack

  const rackPixelHeight = rackHeight * U_HEIGHT + 100; // Include rails
  const rackPixelWidth = RACK_WIDTH;

  const contentWidth = rackPixelWidth + PADDING * 2;
  const contentHeight = rackPixelHeight + PADDING * 2;

  const zoomX = viewportWidth / contentWidth;
  const zoomY = viewportHeight / contentHeight;
  const zoom = Math.min(zoomX, zoomY, 2); // Max zoom 2x

  const scaledWidth = rackPixelWidth * zoom;
  const scaledHeight = rackPixelHeight * zoom;
  const panX = (viewportWidth - scaledWidth) / 2;
  const panY = (viewportHeight - scaledHeight) / 2;

  return { zoom, panX, panY };
}
````

STEP 3: Update canvas store fitAll
In src/lib/stores/canvas.svelte.ts:

```typescript
function fitAll(racks: Rack[]): void {
	if (!panzoomInstance || !canvasElement || racks.length === 0) return;

	const rack = racks[0];
	const { zoom, panX, panY } = calculateFitAllSingleRack(
		rack.height,
		canvasElement.clientWidth,
		canvasElement.clientHeight
	);

	panzoomInstance.zoomAbs(0, 0, zoom);
	panzoomInstance.moveTo(panX, panY);
}
```

STEP 4: Remove multi-rack bounding box code
If there's calculateRacksBoundingBox or similar, either:

- Remove if unused
- Add TODO comment for v0.3 restoration

STEP 5: Run tests

```bash
npm run test:run
```

STEP 6: Visual verification
Create racks of different heights and verify fitAll centers them properly.

COMMIT MESSAGE:
refactor(rescope): simplify fit-all for single rack

SUCCESS CRITERIA:

- [ ] fitAll works correctly for single rack
- [ ] Rack is centered in viewport
- [ ] Different height racks center correctly
- [ ] All tests pass

````

---

## Prompt 8: Remove Rack Reordering UI

**Objective:** Remove drag handles and reordering functionality from racks.

```text
PROMPT 8: REMOVE RACK REORDERING UI

Since there's only one rack, remove the reordering drag handles and logic.

REFERENCE: rackarr-single-rack-rescope-spec.md Part 1

STEP 1: Check Rack.svelte for drag handles
Look for:
- Drag handle elements (grip icons, etc.)
- ondragstart/ondragend handlers for rack reordering
- CSS for drag handles

STEP 2: Remove drag handle UI
If present, remove:
- The drag handle element from the rack header
- Associated CSS
- ondragstart/ondragend handlers for reordering

STEP 3: Check Canvas.svelte for rack reorder handling
Look for:
- onrackdrag or similar events
- reorderRacks calls
- Rack drag state management

Remove any rack reordering logic.

STEP 4: Keep reorderRacks in store (no-op)
The store function can remain for forward compatibility, it just won't be called.
Optionally add a comment:

```typescript
/**
 * Reorder racks by swapping positions
 * Note: Not used in single-rack mode (v0.1.1), kept for v0.3 multi-rack
 */
function reorderRacks(fromIndex: number, toIndex: number): void {
  // ... existing implementation
}
````

STEP 5: Update tests
If there are rack reorder tests, either:

- Keep them (they test store logic that still works)
- Add skip comment noting they're for v0.3

STEP 6: Run tests

```bash
npm run test:run
```

COMMIT MESSAGE:
refactor(rescope): remove rack reordering UI

SUCCESS CRITERIA:

- [ ] No drag handles visible on rack
- [ ] Rack reorder events removed from Canvas
- [ ] Store function preserved for forward compatibility
- [ ] All tests pass

````

---

## Prompt 9: Clean Up Dead Code

**Objective:** Remove unused multi-rack code paths.

```text
PROMPT 9: CLEAN UP DEAD CODE

Remove or comment unused multi-rack code for cleaner codebase.

STEP 1: Search for multi-rack references
```bash
grep -r "sortedRacks\|rack-row\|RACK_GAP\|racksBoundingBox" src/
````

STEP 2: Remove unused items
For each found reference:

- If dead code: Remove entirely
- If might be needed for v0.3: Add TODO comment

STEP 3: Check constants
In src/lib/types/constants.ts:

- Remove RACK_GAP if unused
- Add comment to MAX_RACKS:

```typescript
/**
 * Maximum number of racks allowed
 * v0.1.1: Single rack mode for stability
 * v0.3.0: Will increase to 6 for multi-rack support
 */
export const MAX_RACKS = 1;
```

STEP 4: Check for unused imports
Run through modified files and remove unused imports.

STEP 5: Run tests

```bash
npm run test:run
```

STEP 6: Run build

```bash
npm run build
```

Ensure no build warnings about unused code.

COMMIT MESSAGE:
chore(rescope): remove unused multi-rack code

SUCCESS CRITERIA:

- [ ] No dead multi-rack code in components
- [ ] Constants documented for future
- [ ] No unused imports
- [ ] Build succeeds without warnings
- [ ] All tests pass

````

---

## Prompt 10: Update E2E Tests

**Objective:** Update Playwright E2E tests for single-rack behavior.

```text
PROMPT 10: UPDATE E2E TESTS

Update existing E2E tests and add new ones for single-rack behavior.

STEP 1: Review existing E2E tests
```bash
ls -la e2e/
````

Identify tests that may reference multiple racks.

STEP 2: Update multi-rack.spec.ts
Rename to single-rack.spec.ts and update tests:

```typescript
// e2e/single-rack.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Single Rack Mode', () => {
	test('shows confirmation dialog when creating second rack', async ({ page }) => {
		await page.goto('/');

		// Create first rack
		await page.click('[data-testid="new-rack-button"]');
		await page.fill('[data-testid="rack-name-input"]', 'My Rack');
		await page.click('[data-testid="create-rack-confirm"]');

		// Verify rack exists
		await expect(page.locator('[data-testid="rack"]')).toHaveCount(1);

		// Try to create second rack
		await page.click('[data-testid="new-rack-button"]');

		// Should show confirmation dialog
		await expect(page.locator('text=Replace Current Rack?')).toBeVisible();
	});

	test('Replace button clears rack and opens form', async ({ page }) => {
		await page.goto('/');

		// Create rack
		await page.click('[data-testid="new-rack-button"]');
		await page.fill('[data-testid="rack-name-input"]', 'Old Rack');
		await page.click('[data-testid="create-rack-confirm"]');

		// Click New Rack, then Replace
		await page.click('[data-testid="new-rack-button"]');
		await page.click('text=Replace');

		// Create Rack form should appear
		await expect(page.locator('[data-testid="rack-name-input"]')).toBeVisible();
	});

	test('Cancel preserves existing rack', async ({ page }) => {
		await page.goto('/');

		// Create rack
		await page.click('[data-testid="new-rack-button"]');
		await page.fill('[data-testid="rack-name-input"]', 'My Rack');
		await page.click('[data-testid="create-rack-confirm"]');

		// Click New Rack, then Cancel
		await page.click('[data-testid="new-rack-button"]');
		await page.click('text=Cancel');

		// Rack should still exist
		await expect(page.locator('[data-testid="rack"]')).toHaveCount(1);
	});
});
```

STEP 3: Add multi-rack load test

```typescript
test('loads multi-rack file with warning', async ({ page }) => {
	await page.goto('/');

	// Create a multi-rack test fixture file or use fileChooser
	// This may require a test fixture file in e2e/fixtures/

	// After load, verify warning toast
	await expect(page.locator('.toast-warning')).toBeVisible();
	await expect(page.locator('.toast-warning')).toContainText('racks');
});
```

STEP 4: Run E2E tests

```bash
npm run test:e2e
```

Fix any failures.

COMMIT MESSAGE:
test(rescope): update E2E tests for single-rack mode

SUCCESS CRITERIA:

- [ ] Single-rack E2E tests pass
- [ ] Confirmation dialog flow tested
- [ ] No references to creating multiple racks
- [ ] All E2E tests pass

````

---

## Prompt 11: Update Documentation

**Objective:** Update user-facing and developer documentation for single-rack scope.

```text
PROMPT 11: UPDATE DOCUMENTATION

Update documentation to reflect single-rack scope.

STEP 1: Update README.md
Add/modify:
- Feature list: "Single rack editing (multi-rack planned for v0.3)"
- Remove mentions of multiple racks in features
- Add note about loading multi-rack files

STEP 2: Update CHANGELOG.md
Add entry for v0.1.1:

```markdown
## [0.1.1] - 2025-XX-XX

### Changed
- Rescoped to single-rack editing for v0.1 stability
- Multi-rack support planned for v0.3

### Added
- Save-first confirmation dialog when replacing rack
- Warning toast when loading multi-rack files

### Removed
- Multi-rack canvas display (deferred to v0.3)
- Cross-rack device moves (deferred to v0.3)
- Rack reordering UI (deferred to v0.3)
````

STEP 3: Update .claude/context/roadmap.md
Apply version restructure from spec Part 2.

STEP 4: Check for stale documentation
Search for "multiple racks" or "6 racks" in docs and update.

STEP 5: Verify build

```bash
npm run build
```

COMMIT MESSAGE:
docs(rescope): update documentation for single-rack scope

SUCCESS CRITERIA:

- [ ] README reflects single-rack scope
- [ ] CHANGELOG has v0.1.1 entry
- [ ] Roadmap updated
- [ ] No stale multi-rack references in docs

````

---

## Prompt 12: Final Verification

**Objective:** Complete verification checklist before release.

```text
PROMPT 12: FINAL VERIFICATION

Run through complete verification checklist.

FUNCTIONAL TESTS (manual):
- [ ] Can create a rack (empty canvas)
- [ ] New Rack with existing rack shows confirmation dialog
- [ ] Save First → Save dialog → Reset → Create Rack works
- [ ] Save First → Cancel Save → returns to canvas unchanged
- [ ] Replace → Reset → Create Rack works
- [ ] Cancel → closes dialog, rack unchanged
- [ ] Escape key triggers Cancel
- [ ] Click outside dialog triggers Cancel
- [ ] Dialog shows correct rack name and device count
- [ ] Device drag-drop works at all zoom levels
- [ ] Fit All centers rack correctly
- [ ] Save produces valid JSON
- [ ] Load works for single-rack files
- [ ] Load works for multi-rack files (first rack only, warning shown)
- [ ] Export PNG/SVG/PDF works

TECHNICAL TESTS:
```bash
npm run test:run    # All unit tests
npm run test:e2e    # All E2E tests
npm run build       # Production build
````

- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] No console errors in browser

CODE QUALITY:

- [ ] No dead multi-rack code
- [ ] ConfirmReplaceDialog complete
- [ ] Documentation updated

FINAL COMMIT (if all checks pass):

```bash
git add -A
git commit -m "feat(rescope): complete single-rack rescope for v0.1.1"
```

SUCCESS CRITERIA:

- [ ] All functional tests pass
- [ ] All automated tests pass
- [ ] Build succeeds
- [ ] Documentation complete
- [ ] Ready for release

````

---

## Appendix: Quick Reference

### File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/types/constants.ts` | Modified | MAX_RACKS = 1 (done) |
| `src/lib/stores/layout.svelte.ts` | Modified | Import constant, dynamic error, loadLayout truncation |
| `src/lib/stores/canvas.svelte.ts` | Modified | Simplified fitAll |
| `src/lib/components/Canvas.svelte` | Modified | Single rack wrapper, remove rack-row |
| `src/lib/components/ConfirmReplaceDialog.svelte` | **Created** | Save-first dialog |
| `src/App.svelte` | Modified | Dialog integration, multi-rack toast |
| `src/tests/ConfirmReplaceDialog.test.ts` | Created | Dialog tests |
| `src/tests/layout-store.test.ts` | Modified | Single-rack expectations |
| `e2e/single-rack.spec.ts` | Created/Modified | E2E tests |
| `README.md` | Modified | Feature list |
| `CHANGELOG.md` | Modified | v0.1.1 entry |

### Test Commands

```bash
npm run test:run              # All unit tests
npm run test:run -- path      # Specific test file
npm run test:e2e              # Playwright E2E
npm run dev                   # Dev server for manual testing
npm run build                 # Production build
````

### Commit Message Format

```
feat(rescope): <description>     # New feature
refactor(rescope): <description> # Code change without feature change
test(rescope): <description>     # Test changes
docs(rescope): <description>     # Documentation
chore(rescope): <description>    # Maintenance
```

---

_End of Implementation Prompt Plan_
