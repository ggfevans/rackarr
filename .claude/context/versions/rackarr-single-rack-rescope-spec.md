# Rackarr v0.1 — Single-Rack Rescope Specification

**Version:** 0.1.1-rescope  
**Status:** Ready for Implementation  
**Created:** 2025-11-30  
**Updated:** 2025-11-30  
**Purpose:** Reduce scope from multi-rack to single-rack editing to stabilise panzoom/DnD integration

---

## Executive Summary

### Why This Rescope

The current v0.1 implementation supports multiple racks (up to 6) with cross-rack device moves and horizontal layout. This creates compounding complexity in coordinate transforms when combined with panzoom (zoom + pan + multiple positioned elements).

**Key insight:** Most homelabbers have 0 or 1 rack. Single-rack covers the primary use case while dramatically simplifying the technical implementation.

### What Changes

| Aspect           | Before (Multi-Rack)            | After (Single-Rack)            |
| ---------------- | ------------------------------ | ------------------------------ |
| Rack limit       | 6 racks                        | 1 rack                         |
| Canvas layout    | Horizontal row, bottom-aligned | Single centered rack           |
| Cross-rack moves | Supported                      | Removed                        |
| Rack reordering  | Drag handles                   | Removed                        |
| Fit All zoom     | Complex bounding box           | Simple centering               |
| Coordinate math  | Multi-element transforms       | Single element transforms      |
| Test surface     | ~6× scenarios                  | Baseline                       |
| New Rack action  | Creates additional rack        | Save-first confirmation dialog |

### What Stays the Same

- Data model (Layout still has `racks: Rack[]` — just limited to length 1)
- Device library and drag-drop
- Same-rack device placement and moves
- Save/Load JSON format
- Export PNG/SVG/PDF
- Theme, keyboard navigation
- All v0.2+ features remain on roadmap

---

## Part 1: Specification Updates

### 1.1 Canvas Layout (Replaces Spec Section 4.4)

**Previous:**

> Multiple racks displayed in a horizontal row. Bottom-aligned. Maximum 6 racks.

**New:**

```markdown
### 4.4 Canvas Layout

- Single rack displayed, centered in canvas
- Rack centered horizontally and vertically
- Automatic "Fit" on load (rack centered with padding)
- Panzoom enabled for zoom/pan of single rack

> **v0.1 Scope:** Single rack editing only. Layout files may contain
> multiple racks (for forward compatibility), but only the first rack
> is displayed and editable. Multi-rack support planned for v0.3.
```

### 1.2 Rack Limit (New Constraint)

**Add to Spec Section 5.1 (Rack Properties):**

```markdown
#### 5.1.2 Rack Limit

v0.1 supports **one rack per layout**. The UI enforces this via a confirmation dialog.

**New Rack with Existing Rack:**
When user clicks "New Rack" and a rack already exists, a confirmation dialog appears
offering to save the current layout before replacing.

- **Save First:** Opens save dialog, then clears layout and opens Create Rack dialog
- **Replace:** Clears layout immediately and opens Create Rack dialog
- **Cancel:** Closes dialog, no action taken

See Part 5.4 for full dialog specification.

**Loading Multi-Rack Files:**

- Shows toast: "Layout contained N racks. Loaded first rack only."
- Only first rack is loaded and displayed
- Device library preserved in full

**Data Model:**

- `racks[]` array preserved for forward compatibility
- Maximum length enforced at UI layer, not data layer
```

### 1.3 Drag and Drop (Simplify Spec Section 7)

**Remove from Spec Section 7.2:**

- Cross-rack device movement
- Multi-rack drop detection

**Updated Section 7.2:**

```markdown
### 7.2 Device Movement

- **Within rack:** Drag device to new U position
- Device snaps to nearest valid U
- Collision detection prevents overlap
- Visual feedback: ghost image during drag, green/red drop zones

> **Removed in v0.1:** Cross-rack device moves (planned for v0.3 multi-rack support)
```

### 1.4 Out of Scope (Update Spec Section 16)

**Add to Section 16:**

```markdown
### 16.1 Deferred to v0.3 (Multi-Rack)

- Multiple racks on canvas
- Cross-rack device moves
- Rack reordering via drag
- Horizontal rack row layout
- Complex "Fit All" bounding box calculations
- Bottom-aligned racks of different heights
```

### 1.5 Success Criteria (Update Spec Section 20)

**Replace multi-rack criterion:**

```markdown
## 20. Success Criteria

v0.1 is complete when:

- [x] User can create a rack with custom height (1-100U)
- [x] User can add devices from palette via drag-and-drop
- [x] Devices snap to U positions, collisions blocked
- [x] User can reposition devices within the rack
- [ ] **Single rack limit enforced with save-first dialog**
- [ ] **Canvas displays single centered rack**
- [ ] **Loading multi-rack files loads first rack only**
- [x] Half-U devices supported (0.5U increments)
- [x] Layout saves to JSON and loads correctly
- [x] Export produces PNG/JPEG/SVG/PDF
- [x] Dark/light theme works
- [x] All keyboard shortcuts functional
- [x] Runs as static files in Docker container
```

---

## Part 2: Roadmap Updates

### 2.1 Version Restructure

```markdown
## Released

(None yet — v0.1.1 will be first release)

---

## In Progress

### v0.1.1 — MVP (Single Rack)

**Status:** 🔨 In Development  
**Target:** TBD

**Scope:**

- [x] Single-page rack layout designer
- [x] Create/edit single rack (1-100U)
- [x] Device library with starter devices
- [x] Drag-and-drop placement with collision detection
- [ ] Single rack limit with save-first dialog
- [ ] Centered rack canvas layout
- [ ] Simplified panzoom integration
- [x] Save/load JSON layouts
- [x] Export PNG/JPEG/SVG/PDF
- [x] Dark/light theme
- [x] Keyboard navigation
- [x] Docker deployment

---

## Planned

### v0.2.0 — Multi-View & Polish

**Scope:**

- [ ] Rear rack view toggle
- [ ] Device face assignment (front/rear/both)
- [ ] Import device library from JSON
- [ ] UI refinements (drawer toggle, icons, rack title position)
- [ ] Layout duplication (creates new file)

### v0.3.0 — Multi-Rack

**Scope:**

- [ ] Multiple racks on canvas (up to 6)
- [ ] Cross-rack device moves
- [ ] Rack reordering via drag
- [ ] Horizontal layout with bottom-alignment
- [ ] "Fit All" zoom for multiple racks
- [ ] Bounding box calculations

### v0.4.0 — Mobile & PWA

(Current v0.3 mobile spec moves here)
```

---

## Part 3: Architecture Changes

### 3.1 Data Model (No Change)

The `Layout` interface remains unchanged:

```typescript
interface Layout {
	version: string;
	name: string;
	created: string;
	modified: string;
	settings: LayoutSettings;
	deviceLibrary: Device[];
	racks: Rack[]; // Keep as array — just limit to length 1
}
```

**Rationale:** Forward compatibility. When v0.3 adds multi-rack, existing v0.1 files work without migration.

### 3.2 Constants Update

**File:** `src/lib/types/constants.ts`

```typescript
// Change from:
export const MAX_RACKS = 6;

// To:
export const MAX_RACKS = 1;
```

### 3.3 Canvas Structure (Simplified)

**Current (Complex):**

```html
<div class="canvas">
	<div class="panzoom-container">
		<div class="rack-row">
			<!-- Horizontal flex container -->
			<Rack />
			<!-- Multiple racks -->
			<Rack />
			<Rack />
		</div>
	</div>
</div>
```

**New (Simple):**

```html
<div class="canvas">
	<div class="panzoom-container">
		<div class="rack-wrapper">
			<!-- Centering wrapper -->
			<Rack />
			<!-- Single rack -->
		</div>
	</div>
</div>
```

### 3.4 Coordinate Handling (Simplified)

**Current complexity:**

1. Screen coordinates → panzoom transform
2. Panzoom coordinates → rack-row offset
3. Rack-row coordinates → specific rack position
4. Rack position → SVG internal coordinates

**New simplicity:**

1. Screen coordinates → panzoom transform
2. Panzoom coordinates → single rack SVG
3. Done.

The `screenToSVG()` utility handles steps 1-2 automatically via `getScreenCTM()`.

### 3.5 Fit All (Trivialised)

**Current algorithm:**

```typescript
function fitAll(racks, viewportWidth, viewportHeight) {
	const bounds = calculateRacksBoundingBox(racks); // Complex
	// ... complex centering math for arbitrary bounds
}
```

**New algorithm:**

```typescript
function fitAll(rack, viewportWidth, viewportHeight) {
	// Single rack dimensions are known constants
	const rackWidth = RACK_WIDTH + RACK_PADDING * 2;
	const rackHeight = rack.height * U_HEIGHT + RACK_PADDING * 2 + RAIL_WIDTH * 2;

	const zoomX = viewportWidth / (rackWidth + FIT_ALL_PADDING * 2);
	const zoomY = viewportHeight / (rackHeight + FIT_ALL_PADDING * 2);
	const zoom = Math.min(zoomX, zoomY, 2);

	// Center single element
	const panX = (viewportWidth - rackWidth * zoom) / 2;
	const panY = (viewportHeight - rackHeight * zoom) / 2;

	return { zoom, panX, panY };
}
```

---

## Part 4: Migration & Data Handling

### 4.1 Loading Multi-Rack Files

When a user loads a file containing multiple racks:

```typescript
function loadLayout(data: Layout): void {
	// Validate basic structure
	if (!isValidLayout(data)) {
		toast.error('Invalid layout file');
		return;
	}

	// Handle multi-rack files gracefully
	if (data.racks.length > 1) {
		toast.warning(`Layout contained ${data.racks.length} racks. Loaded first rack only.`);
	}

	// Apply layout with only first rack
	const singleRackLayout: Layout = {
		...data,
		racks: data.racks.slice(0, 1)
	};

	applyLayout(singleRackLayout);
}
```

### 4.2 Saving Layouts

No change to save format. Layouts save with `racks[]` containing 0 or 1 rack.

### 4.3 Device Library References

When loading a multi-rack file, device library entries may reference devices only placed in racks[1+]. These are preserved in the library but not visible on canvas.

**Decision:** Keep all library entries. User can still place them in the single rack.

### 4.4 Session Storage

Current session auto-save may contain multi-rack data from before rescope. On first load after rescope:

```typescript
function restoreSession(): void {
	const saved = sessionStorage.getItem('rackarr-session');
	if (!saved) return;

	const data = JSON.parse(saved);
	if (data.racks?.length > 1) {
		// Clear stale multi-rack session
		sessionStorage.removeItem('rackarr-session');
		toast.info('Previous session cleared (multi-rack not supported)');
		return;
	}

	applyLayout(data);
}
```

---

## Part 5: Error Handling

### 5.1 Rack Creation Limit

**Trigger:** Programmatic attempt to create second rack (edge case).

**Response:**

```typescript
function addRack(name: string, height: number): void {
	if (racks.length >= MAX_RACKS) {
		debug.log('Rack creation blocked: single rack mode');
		return;
	}
	// ... create rack
}
```

Note: Primary enforcement is via UI dialog (see 5.4), not store rejection.

### 5.2 Multi-Rack Load Warning

**Trigger:** User loads `.rackarr.json` with multiple racks.

**Response:**

- Toast: "Layout contained N racks. Loaded first rack only."
- Severity: `warning` (yellow)
- Duration: 5 seconds

### 5.3 Cross-Rack Drop Attempt

**Trigger:** (Edge case) If somehow two racks exist, drag device from one to another.

**Response:**

- Drop is rejected silently
- No error toast (this shouldn't happen in normal use)
- Debug log: "Cross-rack drop blocked in single-rack mode"

### 5.4 New Rack with Existing Rack (Save-First Dialog)

**Trigger:** User clicks "New Rack" when a rack already exists on the canvas.

#### User Flow

```
User clicks "New Rack" button
         │
         ▼
   ┌─────────────┐
   │ Rack exists?│
   └─────────────┘
         │
    No   │   Yes
    │    │
    │    ▼
    │  ┌────────────────────────────────────────────┐
    │  │                                            │
    │  │  Replace Current Rack?                     │
    │  │                                            │
    │  │  "Main Rack" has 5 devices placed.         │
    │  │  Save your layout first?                   │
    │  │                                            │
    │  │   [Save First]   [Replace]   [Cancel]      │
    │  │                                            │
    │  └────────────────────────────────────────────┘
    │         │              │            │
    │         │              │            └──► No action
    │         │              │
    │         │              └──► Clear layout ──► Create Rack dialog
    │         │
    │         └──► Save dialog ──► (after save) ──► Clear layout ──► Create Rack dialog
    │
    └──► Create Rack dialog (no confirmation needed)
```

#### Dialog Specification

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Title**         | "Replace Current Rack?"                                                   |
| **Message**       | Dynamic: `"{rackName}" has {n} device{s} placed. Save your layout first?` |
| **Button 1**      | "Save First" (primary styling — blue)                                     |
| **Button 2**      | "Replace" (destructive styling — red/orange)                              |
| **Button 3**      | "Cancel" (secondary/ghost styling)                                        |
| **Default focus** | "Cancel" (safest default)                                                 |
| **Escape key**    | Triggers Cancel                                                           |
| **Enter key**     | Triggers focused button                                                   |
| **Click outside** | Triggers Cancel                                                           |

#### Button Behaviours

| Button         | Action                                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Save First** | 1. Close confirmation dialog<br>2. Open save dialog<br>3. After successful save → clear layout → open Create Rack dialog<br>4. If save cancelled → return to canvas (no replacement) |
| **Replace**    | 1. Close confirmation dialog<br>2. Clear layout (reset store)<br>3. Open Create Rack dialog                                                                                          |
| **Cancel**     | 1. Close confirmation dialog<br>2. No other action                                                                                                                                   |

#### Edge Cases

| Scenario                                   | Behaviour                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| Save dialog cancelled                      | Return to canvas, rack preserved, no Create Rack dialog                     |
| Save fails (error)                         | Show error toast, return to canvas, rack preserved                          |
| 0 devices placed                           | Message says "0 devices placed" (still show dialog — rack config has value) |
| Rack has no name                           | Use "Untitled Rack" in message                                              |
| Create Rack dialog cancelled after Replace | Canvas shows WelcomeScreen (empty state)                                    |

#### Message Templates

```typescript
// Standard case
`"${rackName}" has ${deviceCount} device${deviceCount !== 1 ? 's' : ''} placed. Save your layout first?`;

// Examples:
// "Main Rack" has 5 devices placed. Save your layout first?
// "Network Rack" has 1 device placed. Save your layout first?
// "My Rack" has 0 devices placed. Save your layout first?
```

#### Visual Design

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ⚠️  Replace Current Rack?                      │
│                                                 │
│  "Main Rack" has 5 devices placed.              │
│  Save your layout first?                        │
│                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ Save First  │ │   Replace   │ │  Cancel  │  │
│  └─────────────┘ └─────────────┘ └──────────┘  │
│     primary        destructive     secondary    │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Styling notes:**

- Warning icon (⚠️) optional but reinforces destructive nature
- "Save First" uses primary colour (blue) — recommended action
- "Replace" uses destructive colour (red/orange) — dangerous action
- "Cancel" uses secondary/ghost styling — safe exit

---

## Part 6: Testing Plan

### 6.1 Unit Tests — Store Enforcement

**File:** `src/tests/layout-store-rescope.test.ts`

```typescript
describe('Single Rack Enforcement', () => {
	beforeEach(() => {
		const store = getLayoutStore();
		store.reset();
	});

	it('allows creating first rack', () => {
		const store = getLayoutStore();
		store.addRack('My Rack', 42);
		expect(store.racks).toHaveLength(1);
	});

	it('blocks creating second rack at store level', () => {
		const store = getLayoutStore();
		store.addRack('First Rack', 42);
		store.addRack('Second Rack', 24);
		expect(store.racks).toHaveLength(1);
	});

	it('allows rack after delete', () => {
		const store = getLayoutStore();
		store.addRack('First', 42);
		store.deleteRack(store.racks[0].id);
		store.addRack('Second', 24);
		expect(store.racks).toHaveLength(1);
		expect(store.racks[0].name).toBe('Second');
	});
});

describe('Multi-Rack File Loading', () => {
	it('loads first rack from multi-rack file', () => {
		const store = getLayoutStore();
		const multiRackLayout = createMockLayout({
			racks: [
				createMockRack({ name: 'Rack A', height: 42 }),
				createMockRack({ name: 'Rack B', height: 24 }),
				createMockRack({ name: 'Rack C', height: 18 })
			]
		});

		store.loadLayout(multiRackLayout);

		expect(store.racks).toHaveLength(1);
		expect(store.racks[0].name).toBe('Rack A');
	});

	it('shows warning toast for multi-rack file', () => {
		const store = getLayoutStore();
		const toastStore = getToastStore();
		const multiRackLayout = createMockLayout({
			racks: [createMockRack(), createMockRack(), createMockRack()]
		});

		store.loadLayout(multiRackLayout);

		expect(toastStore.messages).toContainEqual(
			expect.objectContaining({
				type: 'warning',
				message: expect.stringContaining('3 racks')
			})
		);
	});

	it('preserves all device library entries from multi-rack file', () => {
		const store = getLayoutStore();
		const multiRackLayout = createMockLayout({
			deviceLibrary: [
				createMockDevice({ id: 'dev-1', name: 'Server' }),
				createMockDevice({ id: 'dev-2', name: 'Switch' }),
				createMockDevice({ id: 'dev-3', name: 'UPS' })
			],
			racks: [
				createMockRack({ devices: [{ libraryId: 'dev-1', position: 1, face: 'front' }] }),
				createMockRack({ devices: [{ libraryId: 'dev-2', position: 1, face: 'front' }] })
			]
		});

		store.loadLayout(multiRackLayout);

		// All library devices preserved even though only rack[0] loaded
		expect(store.deviceLibrary).toHaveLength(3);
	});
});
```

### 6.2 Unit Tests — Confirm Replace Dialog

**File:** `src/tests/ConfirmReplaceDialog.test.ts`

```typescript
import { render, fireEvent, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConfirmReplaceDialog from '$lib/components/ConfirmReplaceDialog.svelte';
import { getLayoutStore } from '$lib/stores/layout.svelte';

describe('ConfirmReplaceDialog', () => {
	beforeEach(() => {
		const store = getLayoutStore();
		store.reset();
	});

	it('displays rack name and device count', () => {
		const store = getLayoutStore();
		store.addRack('My Homelab', 42);
		const deviceId = store.addDevice({ name: 'Server', height: 2, category: 'server' });
		store.placeDevice(store.racks[0].id, deviceId, 1);

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});

		expect(screen.getByText(/My Homelab/)).toBeInTheDocument();
		expect(screen.getByText(/1 device placed/)).toBeInTheDocument();
	});

	it('pluralizes devices correctly for multiple devices', () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);
		// Add and place 3 devices
		for (let i = 0; i < 3; i++) {
			const id = store.addDevice({ name: `Device ${i}`, height: 1, category: 'server' });
			store.placeDevice(store.racks[0].id, id, i + 1);
		}

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});

		expect(screen.getByText(/3 devices placed/)).toBeInTheDocument();
	});

	it('handles zero devices gracefully', () => {
		const store = getLayoutStore();
		store.addRack('Empty Rack', 42);

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});

		expect(screen.getByText(/0 devices placed/)).toBeInTheDocument();
	});

	it('calls onSaveFirst when Save First clicked', async () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);
		const onSaveFirst = vi.fn();

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst, onReplace: vi.fn(), onCancel: vi.fn() }
		});

		await fireEvent.click(screen.getByText('Save First'));
		expect(onSaveFirst).toHaveBeenCalledOnce();
	});

	it('calls onReplace when Replace clicked', async () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);
		const onReplace = vi.fn();

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace, onCancel: vi.fn() }
		});

		await fireEvent.click(screen.getByText('Replace'));
		expect(onReplace).toHaveBeenCalledOnce();
	});

	it('calls onCancel when Cancel clicked', async () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);
		const onCancel = vi.fn();

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel }
		});

		await fireEvent.click(screen.getByText('Cancel'));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('calls onCancel when Escape pressed', async () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);
		const onCancel = vi.fn();

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel }
		});

		await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('calls onCancel when clicking overlay', async () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);
		const onCancel = vi.fn();

		const { container } = render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel }
		});

		await fireEvent.click(container.querySelector('.dialog-overlay')!);
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('does not render when open is false', () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);

		render(ConfirmReplaceDialog, {
			props: { open: false, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('uses "Untitled Rack" for nameless rack', () => {
		const store = getLayoutStore();
		store.addRack('', 42); // Empty name

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});

		expect(screen.getByText(/Untitled Rack/)).toBeInTheDocument();
	});
});
```

### 6.3 Component Tests — Canvas

**File:** `src/tests/Canvas-rescope.test.ts`

```typescript
describe('Canvas Single Rack Layout', () => {
	it('renders single rack centered', () => {
		const store = getLayoutStore();
		store.addRack('Test Rack', 42);

		const { container } = render(Canvas);

		const rackWrapper = container.querySelector('.rack-wrapper');
		expect(rackWrapper).toBeInTheDocument();
	});

	it('does not render rack-row class', () => {
		const store = getLayoutStore();
		store.addRack('Test Rack', 42);

		const { container } = render(Canvas);

		expect(container.querySelector('.rack-row')).not.toBeInTheDocument();
	});

	it('calls fitAll on mount', async () => {
		const store = getLayoutStore();
		const canvasStore = getCanvasStore();
		const fitAllSpy = vi.spyOn(canvasStore, 'fitAll');

		store.addRack('Test Rack', 42);
		render(Canvas);

		await waitFor(() => {
			expect(fitAllSpy).toHaveBeenCalled();
		});
	});
});
```

### 6.4 Integration Tests — New Rack Flow

**File:** `src/tests/new-rack-flow.test.ts`

```typescript
describe('New Rack with Existing Rack Flow', () => {
	beforeEach(() => {
		getLayoutStore().reset();
	});

	it('opens confirmation dialog when rack exists', async () => {
		const store = getLayoutStore();
		store.addRack('Old Rack', 42);

		const { getByText, getByRole } = render(App);

		await fireEvent.click(getByText('New Rack'));

		expect(getByRole('dialog')).toBeInTheDocument();
		expect(getByText('Replace Current Rack?')).toBeInTheDocument();
	});

	it('skips dialog when no rack exists', async () => {
		const { getByText, queryByRole } = render(App);

		await fireEvent.click(getByText('New Rack'));

		// Should go straight to Create Rack dialog, no confirmation
		expect(queryByRole('dialog')).not.toHaveTextContent('Replace Current Rack?');
		expect(getByText('Create Rack')).toBeInTheDocument();
	});

	it('Save First → Save → Create Rack flow', async () => {
		const store = getLayoutStore();
		store.addRack('Old Rack', 42);

		const { getByText } = render(App);

		// Click New Rack
		await fireEvent.click(getByText('New Rack'));

		// Confirmation dialog appears
		expect(getByText('Replace Current Rack?')).toBeInTheDocument();

		// Click Save First
		await fireEvent.click(getByText('Save First'));

		// Save dialog appears
		expect(getByText('Save Layout')).toBeInTheDocument();

		// Complete save (mock file download)
		await fireEvent.click(getByText('Save'));

		// Create Rack dialog appears, old rack cleared
		expect(store.racks).toHaveLength(0);
		expect(getByText('Create Rack')).toBeInTheDocument();
	});

	it('Save First → Cancel Save → stays on canvas', async () => {
		const store = getLayoutStore();
		store.addRack('Old Rack', 42);

		const { getByText, queryByText } = render(App);

		await fireEvent.click(getByText('New Rack'));
		await fireEvent.click(getByText('Save First'));

		// Cancel the save dialog
		await fireEvent.click(getByText('Cancel'));

		// Should be back on canvas with rack preserved
		expect(store.racks).toHaveLength(1);
		expect(store.racks[0].name).toBe('Old Rack');
		expect(queryByText('Create Rack')).not.toBeInTheDocument();
	});

	it('Replace flow clears rack and opens create dialog', async () => {
		const store = getLayoutStore();
		store.addRack('Old Rack', 42);

		const { getByText } = render(App);

		await fireEvent.click(getByText('New Rack'));
		await fireEvent.click(getByText('Replace'));

		expect(store.racks).toHaveLength(0);
		expect(getByText('Create Rack')).toBeInTheDocument();
	});

	it('Cancel returns to canvas unchanged', async () => {
		const store = getLayoutStore();
		store.addRack('Old Rack', 42);

		const { getByText, queryByText } = render(App);

		await fireEvent.click(getByText('New Rack'));
		await fireEvent.click(getByText('Cancel'));

		expect(store.racks).toHaveLength(1);
		expect(queryByText('Replace Current Rack?')).not.toBeInTheDocument();
	});
});
```

### 6.5 E2E Tests (Playwright)

**File:** `e2e/single-rack.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Single Rack Mode', () => {
	test('shows confirmation dialog when creating second rack', async ({ page }) => {
		await page.goto('/');

		// Create first rack
		await page.click('[data-testid="new-rack-button"]');
		await page.fill('[data-testid="rack-name-input"]', 'My Rack');
		await page.fill('[data-testid="rack-height-input"]', '42');
		await page.click('[data-testid="create-rack-confirm"]');

		// Verify rack exists
		await expect(page.locator('[data-testid="rack"]')).toHaveCount(1);

		// Try to create second rack
		await page.click('[data-testid="new-rack-button"]');

		// Should show confirmation dialog
		await expect(page.locator('[role="dialog"]')).toBeVisible();
		await expect(page.locator('text=Replace Current Rack?')).toBeVisible();
	});

	test('Save First button triggers save dialog', async ({ page }) => {
		await page.goto('/');

		// Create rack with device
		await page.click('[data-testid="new-rack-button"]');
		await page.fill('[data-testid="rack-name-input"]', 'My Rack');
		await page.click('[data-testid="create-rack-confirm"]');

		// Add a device (drag-drop or click)
		// ...

		// Click New Rack
		await page.click('[data-testid="new-rack-button"]');

		// Click Save First
		await page.click('text=Save First');

		// Save dialog should appear
		await expect(page.locator('text=Save Layout')).toBeVisible();
	});

	test('Replace button clears and opens create dialog', async ({ page }) => {
		await page.goto('/');

		// Create first rack
		await page.click('[data-testid="new-rack-button"]');
		await page.fill('[data-testid="rack-name-input"]', 'Old Rack');
		await page.click('[data-testid="create-rack-confirm"]');

		// Click New Rack
		await page.click('[data-testid="new-rack-button"]');

		// Click Replace
		await page.click('text=Replace');

		// Create Rack dialog should appear
		await expect(page.locator('text=Create Rack')).toBeVisible();

		// Old rack should be gone
		await expect(page.locator('[data-testid="rack"]')).toHaveCount(0);
	});

	test('Cancel button preserves existing rack', async ({ page }) => {
		await page.goto('/');

		// Create first rack
		await page.click('[data-testid="new-rack-button"]');
		await page.fill('[data-testid="rack-name-input"]', 'My Rack');
		await page.click('[data-testid="create-rack-confirm"]');

		// Try to create second rack
		await page.click('[data-testid="new-rack-button"]');

		// Cancel
		await page.click('text=Cancel');

		// Dialog should close, rack preserved
		await expect(page.locator('[role="dialog"]')).not.toBeVisible();
		await expect(page.locator('[data-testid="rack"]')).toHaveCount(1);
	});

	test('loads multi-rack file with warning', async ({ page }) => {
		await page.goto('/');

		// Upload multi-rack file
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles('test-fixtures/multi-rack-layout.json');

		// Warning toast shown
		await expect(page.locator('.toast-warning')).toBeVisible();
		await expect(page.locator('.toast-warning')).toContainText('racks');

		// Only first rack loaded
		await expect(page.locator('[data-testid="rack"]')).toHaveCount(1);
	});
});
```

---

## Part 7: Implementation Prompts

Execute these prompts sequentially via Claude Code.

### Prompt R1: Single Rack Limit with Save-First Dialog

**Goal:** Enforce single rack limit with user-friendly save-first confirmation dialog.

**Spec reference:** Part 1.2, Part 3.2, Part 5.4

**New files:**

- `src/lib/components/ConfirmReplaceDialog.svelte`

**Modified files:**

- `src/lib/types/constants.ts` — MAX_RACKS = 1
- `src/lib/stores/layout.svelte.ts` — Block second rack at store level
- `src/lib/components/Toolbar.svelte` (or relevant component) — Dialog integration

**Tests first:**

1. Write store enforcement tests (`layout-store-rescope.test.ts`)
2. Write dialog component tests (`ConfirmReplaceDialog.test.ts`)
3. Write integration tests (`new-rack-flow.test.ts`)

**Implementation:**

1. Update `src/lib/types/constants.ts`:

   ```typescript
   // Single rack mode for v0.1 - multi-rack planned for v0.3
   export const MAX_RACKS = 1;
   ```

2. Update `src/lib/stores/layout.svelte.ts` to block at store level:

   ```typescript
   function addRack(name: string, height: number, view?: RackView): void {
   	if (racks.length >= MAX_RACKS) {
   		debug.log('Rack creation blocked at store level: single rack mode');
   		return;
   	}
   	// ... existing creation logic
   }
   ```

3. Create `src/lib/components/ConfirmReplaceDialog.svelte`:

   ```svelte
   <script lang="ts">
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

   	const message = $derived(
   		`"${rackName}" has ${deviceCount} device${deviceCount !== 1 ? 's' : ''} placed. Save your layout first?`
   	);

   	function handleKeydown(event: KeyboardEvent) {
   		if (event.key === 'Escape') {
   			onCancel();
   		}
   	}
   </script>

   {#if open}
   	<div
   		class="dialog-overlay"
   		role="dialog"
   		aria-modal="true"
   		aria-labelledby="dialog-title"
   		onkeydown={handleKeydown}
   		onclick={onCancel}
   	>
   		<div class="dialog-content" onclick={(e) => e.stopPropagation()}>
   			<h2 id="dialog-title" class="dialog-title">Replace Current Rack?</h2>

   			<p class="dialog-message">{message}</p>

   			<div class="dialog-actions">
   				<button class="btn btn-primary" onclick={onSaveFirst}> Save First </button>
   				<button class="btn btn-destructive" onclick={onReplace}> Replace </button>
   				<button class="btn btn-secondary" onclick={onCancel} autofocus> Cancel </button>
   			</div>
   		</div>
   	</div>
   {/if}

   <style>
   	.dialog-overlay {
   		position: fixed;
   		inset: 0;
   		background: rgba(0, 0, 0, 0.5);
   		display: flex;
   		align-items: center;
   		justify-content: center;
   		z-index: 1000;
   	}

   	.dialog-content {
   		background: var(--colour-surface);
   		border: 1px solid var(--colour-border);
   		border-radius: 8px;
   		padding: 24px;
   		max-width: 400px;
   		width: 90%;
   	}

   	.dialog-title {
   		margin: 0 0 12px 0;
   		font-size: 1.25rem;
   		color: var(--colour-text);
   	}

   	.dialog-message {
   		margin: 0 0 24px 0;
   		color: var(--colour-text-secondary);
   		line-height: 1.5;
   	}

   	.dialog-actions {
   		display: flex;
   		gap: 12px;
   		justify-content: flex-end;
   	}

   	.btn {
   		padding: 8px 16px;
   		border-radius: 4px;
   		font-size: 0.875rem;
   		cursor: pointer;
   		border: none;
   	}

   	.btn-primary {
   		background: var(--colour-primary);
   		color: white;
   	}

   	.btn-destructive {
   		background: var(--colour-error);
   		color: white;
   	}

   	.btn-secondary {
   		background: transparent;
   		border: 1px solid var(--colour-border);
   		color: var(--colour-text);
   	}
   </style>
   ```

4. Update toolbar/UI component with dialog integration:

   ```typescript
   let showReplaceDialog = $state(false);
   let showCreateRackDialog = $state(false);
   let pendingSaveFirst = $state(false);

   function handleNewRackClick(): void {
   	const store = getLayoutStore();

   	if (store.racks.length > 0) {
   		showReplaceDialog = true;
   	} else {
   		showCreateRackDialog = true;
   	}
   }

   function handleSaveFirst(): void {
   	showReplaceDialog = false;
   	pendingSaveFirst = true;
   	triggerSaveDialog();
   }

   function handleSaveComplete(success: boolean): void {
   	if (pendingSaveFirst && success) {
   		pendingSaveFirst = false;
   		layoutStore.reset();
   		showCreateRackDialog = true;
   	} else {
   		pendingSaveFirst = false;
   	}
   }

   function handleReplace(): void {
   	showReplaceDialog = false;
   	layoutStore.reset();
   	showCreateRackDialog = true;
   }

   function handleCancelReplace(): void {
   	showReplaceDialog = false;
   }
   ```

   ```svelte
   <ConfirmReplaceDialog
   	open={showReplaceDialog}
   	onSaveFirst={handleSaveFirst}
   	onReplace={handleReplace}
   	onCancel={handleCancelReplace}
   />
   ```

**Commit:** `feat(rescope): add single rack limit with save-first dialog`

---

### Prompt R2: Handle Multi-Rack File Loading

**Goal:** Load only first rack from multi-rack files with warning toast.

**Spec reference:** Part 4.1, Part 5.2

**Tests:** Add to `layout-store-rescope.test.ts` (already defined in Part 6.1)

**Implementation:**

Update `src/lib/stores/layout.svelte.ts` `loadLayout()`:

```typescript
function loadLayout(data: Layout): void {
	if (!isValidLayout(data)) {
		toast.error('Invalid layout file');
		return;
	}

	// Handle multi-rack files
	if (data.racks.length > 1) {
		toast.warning(`Layout contained ${data.racks.length} racks. Loaded first rack only.`);
	}

	// Apply with single rack only
	const singleRackData = {
		...data,
		racks: data.racks.slice(0, 1)
	};

	// ... apply layout
	name = singleRackData.name;
	settings = singleRackData.settings;
	deviceLibrary = singleRackData.deviceLibrary; // Keep full library
	racks = singleRackData.racks;
}
```

**Commit:** `feat(rescope): handle multi-rack file loading with warning`

---

### Prompt R3: Remove Cross-Rack Device Moves

**Goal:** Remove cross-rack DnD functionality.

**Spec reference:** Part 1.3

**Implementation:**

1. In `src/lib/stores/layout.svelte.ts`:

   ```typescript
   function moveDeviceToRack(...): void {
     debug.log('Cross-rack move blocked in single-rack mode');
     return;
   }
   ```

2. In `src/lib/components/Rack.svelte`:

   ```typescript
   function handleDrop(event: DragEvent) {
   	// ... existing parsing

   	// Block cross-rack drops
   	if (dragData.type === 'rack-device' && dragData.sourceRackId !== rack.id) {
   		debug.log('Cross-rack drop blocked');
   		dropPreview = null;
   		return;
   	}

   	// ... rest of handler
   }
   ```

3. Update/remove affected tests that assume cross-rack moves work.

**Commit:** `refactor(rescope): disable cross-rack device moves`

---

### Prompt R4: Simplify Canvas Layout

**Goal:** Replace rack-row horizontal layout with centered single rack.

**Spec reference:** Part 3.3

**Implementation:**

1. Update `src/lib/components/Canvas.svelte`:

   ```svelte
   <div class="canvas" bind:this={canvasContainer}>
     <div class="panzoom-container" bind:this={panzoomContainer}>
       {#if hasRacks}
         <div class="rack-wrapper">
           <Rack
             rack={layoutStore.racks[0]}
             {deviceLibrary}
             <!-- ... other props -->
           />
         </div>
       {:else}
         <WelcomeScreen onnewrack={handleNewRack} {onload} />
       {/if}
     </div>
   </div>
   ```

2. Update CSS:

   ```css
   .rack-wrapper {
   	display: inline-block;
   }

   /* Remove .rack-row styles */
   ```

3. Remove `sortedRacks`, `{#each}` iteration, rack gap/ordering logic.

**Commit:** `refactor(rescope): simplify canvas to single centered rack`

---

### Prompt R5: Simplify Fit All

**Goal:** Simplify fitAll calculation for single rack.

**Spec reference:** Part 3.5

**Implementation:**

Update `src/lib/utils/canvas.ts`:

```typescript
/**
 * Calculate fit-all for single rack (simplified)
 */
export function calculateFitAllSingleRack(
	rackHeight: number,
	viewportWidth: number,
	viewportHeight: number
): FitAllResult {
	const rackPixelHeight = rackHeight * U_HEIGHT + RACK_PADDING + RAIL_WIDTH * 2;
	const rackPixelWidth = RACK_WIDTH;

	const contentWidth = rackPixelWidth + FIT_ALL_PADDING * 2;
	const contentHeight = rackPixelHeight + FIT_ALL_PADDING * 2;

	const zoomX = viewportWidth / contentWidth;
	const zoomY = viewportHeight / contentHeight;
	const zoom = Math.min(zoomX, zoomY, FIT_ALL_MAX_ZOOM);

	const scaledWidth = rackPixelWidth * zoom;
	const scaledHeight = rackPixelHeight * zoom;
	const panX = (viewportWidth - scaledWidth) / 2;
	const panY = (viewportHeight - scaledHeight) / 2;

	return { zoom, panX, panY };
}
```

Update `src/lib/stores/canvas.svelte.ts`:

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

**Commit:** `refactor(rescope): simplify fit-all for single rack`

---

### Prompt R6: Remove Rack Reordering

**Goal:** Remove drag handles and reorder functionality.

**Spec reference:** Part 1

**Implementation:**

1. In `src/lib/components/Rack.svelte`:
   - Remove drag handle element
   - Remove rack reorder drag handlers
   - Remove reorder-related state

2. In `src/lib/stores/layout.svelte.ts`:
   - Keep `reorderRack()` as no-op or remove if unused

3. Update tests to remove reorder expectations.

**Commit:** `refactor(rescope): remove rack reordering UI`

---

### Prompt R7: Clean Up Dead Code

**Goal:** Remove unused multi-rack code.

**Implementation:**

1. In `src/lib/utils/canvas.ts`:
   - Remove or simplify `calculateRacksBoundingBox()`
   - Remove `racksToPositions()` if unused
   - Remove `RACK_GAP` and related constants if unused

2. In `src/lib/components/Canvas.svelte`:
   - Remove `sortedRacks` derived state
   - Remove rack iteration logic
   - Remove multi-rack event handlers

3. In `src/lib/types/constants.ts`:
   - Add comment: `// Single rack mode for v0.1 - multi-rack planned for v0.3`

4. Search codebase for remaining multi-rack dead code.

**Commit:** `chore(rescope): remove unused multi-rack code`

---

### Prompt R8: Update Documentation

**Goal:** Update user-facing and developer documentation.

**Implementation:**

1. Update `README.md`:
   - Clarify single-rack scope
   - Update feature list
   - Add "Multi-rack support planned for v0.3"

2. Update `.claude/context/spec.md`:
   - Apply Part 1 changes from this document

3. Update `.claude/context/roadmap.md`:
   - Apply Part 2 changes from this document

4. Update `CHANGELOG.md`:

   ```markdown
   ## [0.1.1] - YYYY-MM-DD

   ### Changed

   - Rescoped to single-rack editing for v0.1 stability
   - Multi-rack support planned for v0.3

   ### Added

   - Save-first confirmation dialog when replacing rack
   - Warning toast when loading multi-rack files

   ### Removed

   - Multi-rack canvas display
   - Cross-rack device moves
   - Rack reordering
   ```

5. Update help panel if it mentions multiple racks.

**Commit:** `docs(rescope): update documentation for single-rack scope`

---

## Part 8: Verification Checklist

After completing all prompts, verify:

### Functional

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
- [ ] Device drag-drop works with pan offset
- [ ] Fit All centers rack correctly
- [ ] Save produces valid JSON with single rack
- [ ] Load works for single-rack files
- [ ] Load works for multi-rack files (first rack only, warning shown)
- [ ] Export PNG/SVG/PDF works

### Technical

- [ ] No console errors
- [ ] All tests pass (including new dialog tests)
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] Panzoom integration stable
- [ ] No coordinate transform bugs

### Code Quality

- [ ] No dead code for multi-rack features
- [ ] Constants reflect single-rack limit
- [ ] ConfirmReplaceDialog component complete
- [ ] Dialog integration complete
- [ ] Documentation updated
- [ ] CHANGELOG updated

---

## Appendix A: File Change Summary

| File                                             | Change Type | Description                                  |
| ------------------------------------------------ | ----------- | -------------------------------------------- |
| `src/lib/types/constants.ts`                     | Modify      | MAX_RACKS = 1                                |
| `src/lib/stores/layout.svelte.ts`                | Modify      | Single rack enforcement, loadLayout handling |
| `src/lib/stores/canvas.svelte.ts`                | Modify      | Simplified fitAll                            |
| `src/lib/utils/canvas.ts`                        | Modify      | Single rack calculations                     |
| `src/lib/components/Canvas.svelte`               | Modify      | Remove rack-row, single rack                 |
| `src/lib/components/Rack.svelte`                 | Modify      | Remove drag handle, block cross-rack         |
| `src/lib/components/Toolbar.svelte`              | Modify      | Dialog integration                           |
| `src/lib/components/ConfirmReplaceDialog.svelte` | **Create**  | Save-first confirmation dialog               |
| `src/tests/layout-store-rescope.test.ts`         | Create      | Store enforcement tests                      |
| `src/tests/ConfirmReplaceDialog.test.ts`         | Create      | Dialog component tests                       |
| `src/tests/new-rack-flow.test.ts`                | Create      | Integration tests                            |
| `src/tests/Canvas-rescope.test.ts`               | Create      | Canvas layout tests                          |
| `e2e/single-rack.spec.ts`                        | Create      | E2E tests                                    |
| `.claude/context/spec.md`                        | Modify      | Spec updates                                 |
| `.claude/context/roadmap.md`                     | Modify      | Roadmap restructure                          |
| `README.md`                                      | Modify      | Feature list update                          |
| `CHANGELOG.md`                                   | Modify      | v0.1.1 entry                                 |

---

## Appendix B: Rollback Plan

If rescope causes unforeseen issues:

1. `git revert` the rescope commits
2. Set `MAX_RACKS = 6`
3. Restore multi-rack Canvas layout
4. Re-enable cross-rack moves
5. Remove ConfirmReplaceDialog (or keep for future use)

The data model is unchanged, so no migration issues.

---

## Appendix C: ConfirmReplaceDialog Component Reference

### Props

| Prop          | Type         | Description                                                    |
| ------------- | ------------ | -------------------------------------------------------------- |
| `open`        | `boolean`    | Whether dialog is visible                                      |
| `onSaveFirst` | `() => void` | Called when Save First clicked                                 |
| `onReplace`   | `() => void` | Called when Replace clicked                                    |
| `onCancel`    | `() => void` | Called when Cancel clicked, Escape pressed, or overlay clicked |

### Derived State

| State         | Source                                 | Description                                  |
| ------------- | -------------------------------------- | -------------------------------------------- |
| `rackName`    | `layoutStore.racks[0]?.name`           | Current rack name (or "Untitled Rack")       |
| `deviceCount` | `layoutStore.racks[0]?.devices.length` | Number of placed devices                     |
| `message`     | Computed                               | Full message with rack name and device count |

### Keyboard Handling

| Key    | Action             |
| ------ | ------------------ |
| Escape | Calls `onCancel()` |

### Accessibility

| Attribute         | Value                         |
| ----------------- | ----------------------------- |
| `role`            | `dialog`                      |
| `aria-modal`      | `true`                        |
| `aria-labelledby` | Points to dialog title        |
| Default focus     | Cancel button (safest option) |

---

_End of Rescope Specification_
