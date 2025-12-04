# Dual-View Rack Display Specification

**Status:** Draft
**Date:** 2025-12-04
**Target Version:** v0.4.0

---

## Overview

This specification defines two related UI features:

1. **Dual-View Rack Display** — Show front and rear views side-by-side instead of a toggle
2. **Blocked Slot Visual Indicator** — Show reduced opacity for slots blocked by full-depth devices

These features work together: showing both views simultaneously makes the blocked slot visualization more intuitive and useful.

### Goals

1. **Visual clarity** — See both faces of the rack at once
2. **Spatial awareness** — Understand depth conflicts without toggling
3. **Faster workflow** — No need to switch views to see what's on the other side
4. **ADHD-friendly** — Less mode switching, more visual context

### Non-Goals

- 3D perspective view
- Animated view transitions
- Collapsible views (always show both)

---

## 1. Dual-View Rack Display

### 1.1 Layout

Display two rack SVGs side-by-side within a single container:

```
┌─────────────────────────────────────────────────────┐
│                   "Racky McRackface"                │
├─────────────────────────┬───────────────────────────┤
│         FRONT           │          REAR             │
├─────────────────────────┼───────────────────────────┤
│  ┌─────────────────┐    │    ┌─────────────────┐    │
│  │ 42             │    │    │             42  │    │
│  │ 41             │    │    │             41  │    │
│  │ 40 ┌─────────┐ │    │    │ ┌─────────┐ 40  │    │
│  │ 39 │ Server  │ │    │    │ │ Server  │ 39  │    │
│  │ 38 └─────────┘ │    │    │ └─────────┘ 38  │    │
│  │ ...           │    │    │           ...  │    │
│  │  1             │    │    │              1  │    │
│  └─────────────────┘    │    └─────────────────┘    │
└─────────────────────────┴───────────────────────────┘
```

### 1.2 Component Structure

**Before (current):**

```
Canvas
└── Rack (single view, has RackViewToggle)
    ├── RackViewToggle
    └── devices (filtered by rack.view)
```

**After:**

```
Canvas
└── RackDualView (new container)
    ├── Rack (front view, label="FRONT")
    │   └── devices (face='front' or 'both')
    └── Rack (rear view, label="REAR")
        └── devices (face='rear' or 'both')
```

### 1.3 Visual Design

#### Rack Name

- Single rack name centered above both views
- Font: Geist Sans, 13px, semibold
- Positioned at top of the dual-view container

#### View Labels

- "FRONT" and "REAR" labels above each rack
- Font: Geist Sans, 11px, uppercase, muted color
- Centered above each rack's U number column

#### U Number Positions

- **Front view:** U numbers on the LEFT rail (as currently)
- **Rear view:** U numbers on the RIGHT rail (mirrored)
- This mirrors real-world rack labeling conventions

#### Spacing

- Gap between front and rear: 24px (--spacing-lg)
- Both racks should have equal width

### 1.4 Removed Components

**Remove:**

- `RackViewToggle` component (no longer needed)
- `rack.view` property usage for filtering (always show both)
- View toggle keyboard shortcut (if any)

**Keep:**

- `rack.view` property in data model (for export compatibility)
- `face` property on devices (still needed for placement logic)

### 1.5 Selection Behavior

- Clicking either view selects the rack
- Selection outline appears around the entire dual-view container
- Device selection works independently in each view
- Clicking a device in either view selects that specific device

### 1.6 Drag and Drop

- Devices can be dropped onto either view
- Drop position determines which face the device is placed on:
  - Drop on front view → `face: 'front'`
  - Drop on rear view → `face: 'rear'`
- Full-depth devices (from library with `is_full_depth: true`) → `face: 'both'`
- Device appears in both views when `face: 'both'`

### 1.7 Edit Panel

The device face selector in the edit panel remains:

- When a device is selected, show face dropdown (front/rear/both)
- Changing face moves device between views
- For full-depth device types, default to 'both'

---

## 2. Blocked Slot Visual Indicator

### 2.1 Concept

When a device occupies U slots with `face: 'both'` (full-depth), those slots are blocked on the opposite face. Show this visually with reduced opacity.

### 2.2 Visual Treatment

**Blocked slots styling:**

- Overlay color: `rgba(255, 255, 255, 0.05)` in dark theme, `rgba(0, 0, 0, 0.05)` in light
- Optional diagonal stripe pattern (subtle, 45deg)
- Lower priority than actual devices (devices render on top)

**When to show:**

- In REAR view: Show blocked indicator for slots occupied by `face: 'front'` or `face: 'both'` devices with `is_full_depth: true`
- In FRONT view: Show blocked indicator for slots occupied by `face: 'rear'` or `face: 'both'` devices with `is_full_depth: true`
- Half-depth devices (is_full_depth: false) do NOT block the opposite face

### 2.3 Determining Blocked Slots

For each view, calculate blocked slots:

```typescript
function getBlockedSlots(rack: Rack, view: RackView, deviceLibrary: Device[]): URange[] {
	const blocked: URange[] = [];

	for (const placedDevice of rack.devices) {
		// Skip devices on same face
		if (placedDevice.face === view) continue;

		const deviceType = deviceLibrary.find((d) => d.id === placedDevice.libraryId);
		if (!deviceType) continue;

		// Only full-depth devices block the opposite face
		if (deviceType.is_full_depth !== true && placedDevice.face !== 'both') continue;

		// This device blocks slots on the opposite face
		blocked.push({
			bottom: placedDevice.position,
			top: placedDevice.position + deviceType.height - 1
		});
	}

	return blocked;
}
```

### 2.4 SVG Rendering

Render blocked slot indicators BEFORE devices (so devices appear on top):

```svelte
<!-- Blocked slot overlay -->
{#each blockedSlots as slot}
	<rect
		class="blocked-slot"
		x={RAIL_WIDTH}
		y={(rack.height - slot.top) * U_HEIGHT + RACK_PADDING + RAIL_WIDTH}
		width={interiorWidth}
		height={(slot.top - slot.bottom + 1) * U_HEIGHT}
		fill="var(--colour-rack-blocked)"
		opacity="0.15"
	/>
{/each}
```

### 2.5 Design Tokens

Add to `tokens.css`:

```css
:root {
	--colour-rack-blocked: rgba(128, 128, 128, 0.3);
	--colour-rack-blocked-pattern: url('data:image/svg+xml,...'); /* diagonal stripes */
}

[data-theme='light'] {
	--colour-rack-blocked: rgba(0, 0, 0, 0.1);
}
```

### 2.6 Drop Preview Interaction

When dragging over a blocked slot:

- Show drop preview in error state (red)
- Tooltip: "Blocked by full-depth device on {opposite face}"
- Drop is rejected with collision detection

---

## 3. Data Model Changes

### 3.1 Rack Type (no change needed)

The `view` property can remain for backwards compatibility but is no longer used for filtering:

```typescript
interface Rack {
	// ... existing fields
	view: RackView; // Keep for export/serialization, default to 'front'
}
```

### 3.2 Device Type Enhancement

Ensure `is_full_depth` is properly supported:

```typescript
interface Device {
	// ... existing fields
	is_full_depth?: boolean; // Default: true
}
```

### 3.3 Default Behavior

- If `is_full_depth` is undefined, treat as `true` (most devices are full-depth)
- Only explicitly `is_full_depth: false` devices allow opposite-face placement

---

## 4. Component Changes

### 4.1 New Components

**`RackDualView.svelte`**

- Container for front and rear rack views
- Handles shared rack name display
- Manages selection at container level
- Passes correct face filter to each Rack

### 4.2 Modified Components

**`Rack.svelte`**

- Remove `RackViewToggle` usage
- Add `faceFilter` prop to specify which face to display
- Add `blockedSlots` rendering
- Add `viewLabel` prop for "FRONT" / "REAR" label
- Mirror U labels for rear view

**`Canvas.svelte`**

- Replace `Rack` with `RackDualView`
- Remove view change handler
- Update selection handling for dual-view

**`RackDevice.svelte`**

- No changes needed (devices already have face property)

### 4.3 Removed Components

**`RackViewToggle.svelte`**

- Remove completely (or mark as deprecated)

---

## 5. User Interface Updates

### 5.1 Toolbar

Remove any view toggle button if present (currently the toggle is on the rack itself).

### 5.2 Edit Panel

Device face selector remains:

- Shows for selected device
- Options: Front, Rear, Both
- "Both" is default for devices with `is_full_depth: true`

### 5.3 Keyboard Shortcuts

Remove any keyboard shortcut for view toggle.

Add (optional):

- `F` key while device selected: Set face to 'front'
- `R` key while device selected: Set face to 'rear'
- `B` key while device selected: Set face to 'both'

### 5.4 Help Panel

Update documentation:

- Remove mention of view toggle
- Add explanation of dual-view layout
- Document blocked slot indicators

---

## 6. Export Changes

### 6.1 Image Export

**Current:** Exports single view based on `rack.view`

**New options:**

- Export front view only
- Export rear view only
- Export both views side-by-side (default)

Add to ExportOptions:

```typescript
interface ExportOptions {
	// ... existing
	exportView?: 'front' | 'rear' | 'both'; // default: 'both'
}
```

### 6.2 Data Export

No changes to `.rackarr.zip` format. The `view` property remains for backwards compatibility.

---

## 7. Testing Strategy

### 7.1 Unit Tests

**RackDualView:**

- Renders both front and rear views
- Shows correct rack name above both views
- Displays FRONT and REAR labels
- Selection affects entire container
- Device drop on front view sets face to 'front'
- Device drop on rear view sets face to 'rear'

**Blocked Slots:**

- Full-depth front device blocks rear slots
- Full-depth rear device blocks front slots
- Half-depth devices don't block
- Both-face devices show in both views
- Correct slots are highlighted

### 7.2 Integration Tests

- Place device via drag-drop on each view
- Device appears in correct view after placement
- Full-depth device appears in both views
- Blocked slot prevents drop (shows error)

### 7.3 E2E Tests

- Full workflow with dual-view
- Export both views
- Load/save preserves device faces

---

## 8. Implementation Order

### Phase 1: Dual-View Container

1. Create `RackDualView.svelte` component
2. Modify `Rack.svelte` to accept face filter
3. Update `Canvas.svelte` to use `RackDualView`
4. Mirror U labels for rear view
5. Remove `RackViewToggle` from Rack
6. Update selection handling

### Phase 2: Blocked Slot Indicators

7. Add `getBlockedSlots()` utility function
8. Add blocked slot rendering to `Rack.svelte`
9. Add design tokens for blocked styling
10. Update drop preview for blocked slots

### Phase 3: Polish

11. Update export to support both views
12. Update Help panel documentation
13. Add keyboard shortcuts for face selection
14. Remove deprecated view toggle code

---

## 9. File Structure

```
src/lib/components/
├── RackDualView.svelte     # NEW: Container for front+rear
├── Rack.svelte             # MODIFIED: Accept face filter, blocked slots
├── RackDevice.svelte       # UNCHANGED
├── RackViewToggle.svelte   # DEPRECATED/REMOVE
└── Canvas.svelte           # MODIFIED: Use RackDualView

src/lib/utils/
├── collision.ts            # Already has face-aware logic
└── blocked-slots.ts        # NEW: getBlockedSlots utility
```

---

## 10. Success Criteria

- [ ] Front and rear views displayed side-by-side
- [ ] "FRONT" and "REAR" labels above each view
- [ ] Single rack name centered above both views
- [ ] U labels mirrored on rear view (right side)
- [ ] Device drop on front view → face='front'
- [ ] Device drop on rear view → face='rear'
- [ ] Full-depth devices appear in both views
- [ ] Blocked slots show reduced opacity indicator
- [ ] Drop rejected on blocked slots with clear feedback
- [ ] RackViewToggle removed from UI
- [ ] Export supports both views
- [ ] All existing tests pass

---

## Changelog

| Date       | Change                |
| ---------- | --------------------- |
| 2025-12-04 | Initial specification |
