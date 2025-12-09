# Airflow Visualization Specification (v0.5.0)

**Version:** 0.5.0
**Status:** Ready for Implementation
**Created:** 2025-12-09
**Research:** `docs/planning/research-airflow.md`

---

## Overview

Redesign the airflow visualization feature to use edge stripes instead of overlaid arrows. This approach matches hardware vendor conventions (Cisco, Juniper) and minimizes visual clutter.

### Design Principles

- **Minimal footprint** - 4px edge stripe, single small arrow
- **Industry conventions** - Blue=intake, Red=exhaust (matches Cisco/Juniper hardware)
- **Non-obtrusive** - Toggle on/off, doesn't compete with device content
- **Accessible** - Position + color for color-blind users; respects reduced motion

---

## Scope

### In Scope (v0.5.0)

| Feature                 | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| Simplified airflow set  | 4 types: passive, front-to-rear, rear-to-front, side-to-rear |
| Edge stripe indicator   | 4px colored stripe on device edge                            |
| Small directional arrow | Single arrow reinforcing flow direction                      |
| Passive indicator       | Hollow circle for devices with no active airflow             |
| Conflict highlighting   | Orange border on devices with conflicting airflow            |
| Animated flow           | Subtle marching animation (respects reduced-motion)          |
| Keyboard shortcut       | `A` key toggles airflow mode                                 |
| Export support          | Include indicators in exports (when mode enabled)            |

### Out of Scope

| Feature              | Reason                                                    |
| -------------------- | --------------------------------------------------------- |
| Lateral airflow      | Removed (left-to-right, right-to-left) - rare in homelabs |
| CFD/thermal modeling | Beyond scope of simple visualization                      |
| Rack-level fans      | Future feature (0U accessories system)                    |

---

## Airflow Types

### Supported Types (4)

| Type            | Description                            | Use Case                    |
| --------------- | -------------------------------------- | --------------------------- |
| `passive`       | No active airflow                      | Patch panels, shelves, PDUs |
| `front-to-rear` | Air intake at front, exhaust at rear   | Most servers, storage       |
| `rear-to-front` | Air intake at rear, exhaust at front   | Some switches               |
| `side-to-rear`  | Air intake from sides, exhaust at rear | Older Cisco access switches |

### Removed Types

- `left-to-right` - Lateral flow, rare in homelabs
- `right-to-left` - Lateral flow, rare in homelabs

### Schema Update

Update `AirflowSchema` in `src/lib/schemas/index.ts`:

```typescript
export const AirflowSchema = z.enum(['passive', 'front-to-rear', 'rear-to-front', 'side-to-rear']);
```

---

## Visual Design

### Edge Stripe + Arrow Indicator

```
FRONT VIEW                           REAR VIEW
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│▌→ Server 1                      │  │                     Server 1 →▐│
│▌  (blue stripe + arrow)         │  │         (red stripe + arrow)  ▐│
├─────────────────────────────────┤  ├─────────────────────────────────┤
│                     Switch   ←▐│  │▌← Switch                        │
│       (red stripe + arrow)    ▐│  │▌  (blue stripe + arrow)         │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│○  Patch Panel                   │  │                   Patch Panel ○│
│   (hollow circle, no stripe)    │  │   (hollow circle, no stripe)   │
└─────────────────────────────────┘  └─────────────────────────────────┘
```

### Component Elements

| Element         | Size/Style                    | Purpose                       |
| --------------- | ----------------------------- | ----------------------------- |
| Edge stripe     | 4px wide, full device height  | Primary airflow indicator     |
| Arrow           | Single small chevron (8-10px) | Explicit direction            |
| Hollow circle   | 10px diameter, 2px stroke     | Passive device marker         |
| Conflict border | 2px orange/amber              | Highlight conflicting devices |

### Color Specification

| Element         | Color                 | Token                       |
| --------------- | --------------------- | --------------------------- |
| Intake stripe   | `#60a5fa` (blue-400)  | `--colour-airflow-intake`   |
| Exhaust stripe  | `#f87171` (red-400)   | `--colour-airflow-exhaust`  |
| Passive circle  | `#9ca3af` (gray-400)  | `--colour-airflow-passive`  |
| Conflict border | `#f59e0b` (amber-500) | `--colour-airflow-conflict` |

### Positioning by View and Airflow Type

| Airflow Type    | Front View                       | Rear View                       |
| --------------- | -------------------------------- | ------------------------------- |
| `front-to-rear` | Blue stripe LEFT, arrow → right  | Red stripe RIGHT, arrow → right |
| `rear-to-front` | Red stripe LEFT, arrow ← left    | Blue stripe RIGHT, arrow ← left |
| `side-to-rear`  | Blue stripe LEFT, arrow ↘ corner | Red stripe RIGHT, arrow → right |
| `passive`       | Hollow circle (centered)         | Hollow circle (centered)        |

### Arrow Direction Logic

- **Blue stripe (intake)**: Arrow points INTO the device (toward center)
- **Red stripe (exhaust)**: Arrow points OUT of the device (toward edge)

---

## Animation

### Marching Dots Animation

```css
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

/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
	.airflow-arrow {
		animation: none;
	}
}
```

**Notes:**

- Animation applies to arrow element only (stripe is static)
- Duration: 0.8s (slightly slower than original spec for subtlety)
- Disabled for users with reduced-motion preference
- Animation won't appear in static exports (SVG/PNG/PDF)

---

## Conflict Detection

### Detection Logic

Conflicts occur when adjacent devices (vertically touching) have opposing primary airflow directions:

| Lower Device    | Upper Device    | Conflict? | Face  |
| --------------- | --------------- | --------- | ----- |
| `front-to-rear` | `rear-to-front` | YES       | rear  |
| `rear-to-front` | `front-to-rear` | YES       | front |
| `front-to-rear` | `front-to-rear` | No        | -     |
| `passive`       | Any             | No        | -     |
| Any             | `passive`       | No        | -     |
| `side-to-rear`  | Any             | No        | -     |

### Visual Indicator

When conflict detected:

- Both conflicting devices receive orange/amber border (2px)
- Border appears on the conflicting face (front or rear)
- Border only visible when airflow mode is ON

```
┌─────────────────────────────────┐
│▌→ Server 1 (front-to-rear)      │  ← Normal
╔═════════════════════════════════╗
║                     Switch   ←▐║  ← Orange border (conflict)
╚═════════════════════════════════╝
│○  Patch Panel                   │  ← Normal
```

---

## Component Changes

### AirflowIndicator.svelte (Rewrite)

Replace current arrow-based implementation with edge stripe + small arrow:

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

	// Determine intake/exhaust side
	const isIntakeSide = $derived.by(() => {
		if (airflow === 'passive') return false;
		if (airflow === 'front-to-rear') return view === 'front';
		if (airflow === 'rear-to-front') return view === 'rear';
		if (airflow === 'side-to-rear') return view === 'front';
		return false;
	});

	// Stripe color
	const stripeColor = $derived(isIntakeSide ? '#60a5fa' : '#f87171');

	// Stripe position: left for front, right for rear
	const stripeX = $derived(view === 'front' ? 0 : width - 4);

	// Arrow direction
	const arrowPoints = $derived.by(() => {
		// ... calculate arrow polyline points based on airflow and view
	});
</script>

{#if airflow === 'passive'}
	<!-- Hollow circle for passive -->
	<circle
		cx={width / 2}
		cy={height / 2}
		r={Math.min(10, height / 4)}
		stroke="#9ca3af"
		stroke-width="2"
		fill="none"
		opacity="0.7"
	/>
{:else}
	<!-- Edge stripe -->
	<rect x={stripeX} y="0" width="4" {height} fill={stripeColor} opacity="0.85" />

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
```

### Files to Modify

| File                        | Changes                                        |
| --------------------------- | ---------------------------------------------- |
| `src/lib/schemas/index.ts`  | Update `AirflowSchema` to 4 types              |
| `src/lib/types/index.ts`    | Update `Airflow` type                          |
| `AirflowIndicator.svelte`   | Rewrite with edge stripe + arrow               |
| `RackDevice.svelte`         | Add conflict border styling                    |
| `EditPanel.svelte`          | Update dropdown to 4 options                   |
| `AddDeviceForm.svelte`      | Update dropdown to 4 options                   |
| `src/lib/utils/airflow.ts`  | Update conflict detection for simplified types |
| `src/lib/styles/tokens.css` | Ensure airflow tokens exist                    |

---

## UI Changes

### Dropdown Options (EditPanel, AddDeviceForm)

```
Airflow Direction
┌─────────────────────────────────┐
│ Passive (no active cooling)     │ ← default
│ Front to Rear                   │
│ Rear to Front                   │
│ Side to Rear                    │
└─────────────────────────────────┘
```

### Toolbar Button

- Icon: `IconWind` (existing)
- Tooltip: "Toggle Airflow View (A)"
- Active state: Highlighted when airflow mode is ON

---

## Keyboard Shortcuts

| Key | Action                            |
| --- | --------------------------------- |
| `A` | Toggle airflow visualization mode |

---

## Testing Requirements

### Unit Tests

| Test                  | Description                               |
| --------------------- | ----------------------------------------- |
| Edge stripe position  | Left on front view, right on rear view    |
| Stripe color          | Blue for intake, red for exhaust          |
| Passive indicator     | Hollow circle renders, no stripe          |
| Conflict detection    | front-to-rear vs rear-to-front = conflict |
| No false conflicts    | passive never triggers conflict           |
| side-to-rear handling | No conflict detection for this type       |
| Animation class       | Arrow has `.airflow-arrow` class          |

### E2E Tests

| Test                | Description                                  |
| ------------------- | -------------------------------------------- |
| Toggle airflow mode | 'A' key and button both toggle               |
| Visual appearance   | Stripe visible on devices with airflow set   |
| Conflict highlight  | Orange border appears on conflicting devices |
| Export with airflow | Indicators appear in exported SVG/PNG        |

---

## Implementation Order

1. **Schema**: Update `AirflowSchema` to 4 types
2. **Types**: Update `Airflow` type definition
3. **Tokens**: Verify airflow color tokens exist
4. **AirflowIndicator**: Rewrite component with edge stripe + arrow
5. **RackDevice**: Add conflict border styling
6. **Conflict utils**: Update `findAirflowConflicts` for new types
7. **Forms**: Update dropdowns in AddDeviceForm and EditPanel
8. **Tests**: Update unit tests for new visual approach
9. **E2E**: Add/update E2E tests

---

## Design Tokens

Ensure these exist in `src/lib/styles/tokens.css`:

```css
/* Airflow Visualization */
--colour-airflow-intake: var(--blue-400); /* #60a5fa */
--colour-airflow-exhaust: var(--red-400); /* #f87171 */
--colour-airflow-passive: var(--neutral-400); /* #9ca3af */
--colour-airflow-conflict: var(--amber-500); /* #f59e0b */
```

---

## Acceptance Criteria

1. Airflow mode toggle works via 'A' key and toolbar button
2. Devices with `front-to-rear` show blue stripe on left (front view), red on right (rear view)
3. Devices with `rear-to-front` show opposite (red left front, blue right rear)
4. Devices with `side-to-rear` show blue left (front), red right (rear)
5. Passive devices show hollow circle only, no stripe
6. Single small arrow appears next to stripe indicating direction
7. Arrow has subtle marching animation (disabled for prefers-reduced-motion)
8. Conflicting adjacent devices have orange border
9. Dropdown shows 4 options: Passive, Front to Rear, Rear to Front, Side to Rear
10. Exports include airflow indicators when mode is enabled
