# Airflow Visualization Research

**Created:** 2025-12-09
**Status:** Research Complete
**Purpose:** Investigate alternative UX approaches for airflow visualization

---

## Problem Statement

The current airflow visualization implementation uses animated arrows overlaid on device rectangles. User feedback indicates this approach is:

- **Confusing** - Multiple arrows per device are hard to interpret
- **Cluttered** - Visual noise obscures device labels/images
- **Not intuitive** - Arrow direction meaning isn't immediately clear

This document researches how other tools and industries solve this problem.

---

## Current Implementation Analysis

### What We Built

```
┌─────────────────────────────────────┐
│ →→  →→   Server 1                   │  ← Two sets of arrows + background tint
│   (arrows + blue tint overlay)      │
├─────────────────────────────────────┤
│ ←← ←←               Switch          │  ← Arrows pointing opposite direction
│   (arrows + red tint overlay)       │
└─────────────────────────────────────┘
```

**Issues:**

1. Arrows take up significant visual space on each device
2. Two arrows per device doubles the visual noise
3. Blue/red background tints compete with device colors
4. Direction meaning (into device vs out of device) is ambiguous
5. Hollow circle for passive is easy to miss

---

## Industry Research

### 1. NetBox (Open Source DCIM)

**Source:** [NetBox GitHub Issue #3839](https://github.com/netbox-community/netbox/issues/3839)

NetBox takes a **metadata-only approach**:

- Airflow is stored as a field on DeviceType (`front-to-rear`, `rear-to-front`, etc.)
- **No built-in visualization** - left to plugins or reporting scripts
- Rationale: "validation logic and visualization details were intentionally left to plugins"

**Takeaway:** Even the most popular open-source DCIM doesn't attempt in-rack visualization. The data exists, but users query/report on it rather than see it overlaid.

### 2. Enterprise DCIM Tools (Sunbird, dcTrack)

**Source:** [Sunbird DCIM 3D Visualization](https://www.sunbirddcim.com/product/data-center-visualization)

Enterprise tools use fundamentally different approaches:

- **3D floor maps** with pressure overlays and heat maps
- **Time-lapse videos** showing airflow patterns over time
- **Sensor data integration** from physical hardware
- **CFD (Computational Fluid Dynamics)** modeling

**Takeaway:** Professional tools don't put arrows on rack diagrams. They use environmental data visualization at the room level, not device level.

### 3. Hardware Vendor Conventions (Cisco, Juniper)

**Source:** [FS.com - Port Side Intake vs Exhaust](https://www.fs.com/blog/port-side-intake-vs-port-side-exhaust-whats-the-difference-79.html)

Physical hardware uses color coding on the physical equipment:

- **Blue** = Port-side exhaust (cold aisle facing ports)
- **Red/Burgundy** = Port-side intake (hot aisle facing ports)
- Labels: "AIR IN" / "AIR OUT" on fan modules

**Key insight:** Color is applied to the **edge** where air flows, not overlaid on the whole device.

### 4. Scientific/Engineering Diagrams

**Source:** [ResearchGate - IVC Rack Schematics](https://www.researchgate.net/figure/IVC-rack-schematics-indicating-airflow-direction-sampling-site-and-cage-location-Blue_fig1_236126798)

Scientific rack diagrams use:

- **Blue arrows** = Supply/intake airflow
- **Red arrows** = Exhaust airflow
- Arrows are placed **at the edges** of the equipment, not across them

---

## UX Design Patterns Research

### Status Indicator Best Practices

**Source:** [Carbon Design System - Status Indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/)

Key principles:

1. **Never use color alone** - pair with shape or text for accessibility
2. **Minimize clutter** - "over-communicating statuses can overwhelm users"
3. **Position matters** - place indicators where noticeable but not obstructive

### Edge/Stripe Indicators

**Source:** [MindSphere Design System - Context & Status](https://design.mindsphere.io/patterns/context-status.html)

Vertical stripe indicators are recommended for:

- Table rows
- Expandable sections
- **Scrollable lists** (exactly our use case)

> "The vertical indicator is intended for highlighting of table rows, expandable groups and sections within content."

### Badge Design Patterns

**Source:** [Mobbin - Badge UI Design](https://mobbin.com/glossary/badge)

Badges are:

- Small, non-intrusive visual cues
- Quick to read at a glance
- Positioned at corners or edges

---

## Alternative Approaches to Consider

### Option A: Edge Stripe Indicator

Instead of arrows across the device, use thin colored stripes at the device edges:

```
         FRONT VIEW                           REAR VIEW
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│▌ Server 1                       │    │                       Server 1 ▐│
│▌ (blue stripe = intake)         │    │          (red stripe = exhaust) ▐│
├─────────────────────────────────┤    ├─────────────────────────────────┤
│                       Switch   ▐│    │▌ Switch                         │
│       (red stripe = exhaust)   ▐│    │▌ (blue stripe = intake)         │
├─────────────────────────────────┤    ├─────────────────────────────────┤
│  Patch Panel (no stripe)        │    │  Patch Panel (no stripe)        │
└─────────────────────────────────┘    └─────────────────────────────────┘
```

**Pros:**

- Minimal visual footprint (2-4px stripe)
- Clear color meaning (blue = cool air in, red = hot air out)
- Matches hardware vendor conventions
- Doesn't obscure device labels/images
- No animation needed

**Cons:**

- Doesn't show direction explicitly (relies on color semantics)
- May be subtle for users unfamiliar with convention

### Option B: Corner Badge/Icon

Small badge in corner of device showing airflow type:

```
┌─────────────────────────────────┐
│🔵→  Server 1                    │  ← Small badge with icon
├─────────────────────────────────┤
│                       Switch ←🔴│  ← Opposite corner for exhaust view
├─────────────────────────────────┤
│○    Patch Panel                 │  ← Passive indicator (hollow circle)
└─────────────────────────────────┘
```

**Pros:**

- Very compact
- Can show direction with single small arrow
- Color reinforces meaning
- Easily ignorable when not needed

**Cons:**

- May be too subtle at small scale
- Corner placement may conflict with other UI elements

### Option C: Tooltip/Hover Only

No persistent indicators - show airflow info on hover:

```
┌─────────────────────────────────┐
│  Server 1                       │
│    [hover shows: "↠ Front to Rear"]
├─────────────────────────────────┤
│                       Switch    │
│    [hover shows: "↞ Rear to Front"]
└─────────────────────────────────┘
```

**Pros:**

- Zero visual clutter
- Full information available on demand
- Export shows clean diagram

**Cons:**

- No at-a-glance overview
- Requires interaction to see airflow
- Conflict detection harder to visualize
- Doesn't work in static exports

### Option D: Dual-Edge Gradient

Gradient from intake to exhaust across the device:

```
┌─────────────────────────────────┐
│░░▒▒▓▓  Server 1          ██████│  ← Blue-to-red gradient
├─────────────────────────────────┤
│██████  Switch          ░░▒▒▓▓░░│  ← Reversed gradient
└─────────────────────────────────┘
```

**Pros:**

- Shows flow direction without arrows
- Subtle when muted colors used
- Intuitive (cool→hot)

**Cons:**

- May clash with device colors
- Harder to distinguish on colored devices
- Complex to implement in SVG

### Option E: Simplified Single Arrow + Edge

Combine a minimal single arrow with edge stripe:

```
FRONT VIEW (shows what this side does)
┌─────────────────────────────────┐
│▌→ Server 1                      │  ← Blue stripe + single arrow = "air enters here"
├─────────────────────────────────┤
│                       Switch ←▐│  ← Red stripe + arrow = "air exits here"
├─────────────────────────────────┤
│○  Patch Panel                   │  ← Passive: just hollow circle, no stripe
└─────────────────────────────────┘
```

**Pros:**

- Combines best of both: color for quick scan, arrow for explicit direction
- Single arrow per device (not two)
- Edge stripe provides primary cue, arrow reinforces
- Minimal but informative

**Cons:**

- Still adds some visual elements (though much less than current)

---

## Conflict Indicator Alternatives

Current spec calls for dashed orange line between conflicting devices. Alternatives:

### Option 1: Subtle Warning Badge

Small orange/amber badge at conflict boundary:

```
├─────────────────────────────────┤
│  Server 1 (front-to-rear)       │
├───────────────⚠─────────────────┤  ← Small centered warning icon
│  Switch (rear-to-front)         │
├─────────────────────────────────┤
```

### Option 2: No Visual - Report Only

- Remove visual conflict indicator entirely
- Add "Airflow Conflicts" count/list to EditPanel when rack selected
- Less visual clutter, information still accessible

### Option 3: Device Outline Highlight

Highlight conflicting devices with orange/amber border:

```
┌─────────────────────────────────┐
│  Server 1                       │  ← Normal
╔═════════════════════════════════╗
║  Switch (conflict!)             ║  ← Orange border
╚═════════════════════════════════╝
│  Patch Panel                    │  ← Normal
```

---

## Recommendations

Based on research, the recommended approach is **Option A (Edge Stripe)** with **Option 2 conflict handling**:

### Primary Recommendation: Edge Stripes

1. **Front view**: Blue stripe on left edge = air intake
2. **Rear view**: Red stripe on right edge = air exhaust
3. **Passive**: No stripe (device unchanged)
4. **Stripe width**: 3-4px, solid color

**Rationale:**

- Matches hardware vendor conventions (Cisco/Juniper)
- Minimal visual footprint
- Doesn't compete with device content
- Works well in exports
- No animation needed (reduces complexity)
- Color-blind safe when paired with position (left vs right)

### Conflict Handling: Report-Based

1. Remove visual conflict line from rack view
2. When airflow mode is ON and rack is selected, show conflict summary in EditPanel:
   ```
   Airflow Conflicts (2)
   • U3-U5: Front-to-rear above rear-to-front
   • U10-U12: Similar conflict
   ```
3. Clicking a conflict could highlight both devices

**Rationale:**

- Conflicts are important but rare
- Visual indicators between devices add clutter
- Report-based approach provides more actionable information
- Keeps rack view clean

---

## Implementation Notes

### Edge Stripe Implementation

```svelte
<!-- In AirflowIndicator.svelte -->
{#if airflow !== 'passive'}
	<!-- Left edge stripe for intake (front view) or exhaust (rear view) -->
	<rect x="0" y="0" width="4" {height} fill={isIntake ? '#60a5fa' : '#f87171'} opacity="0.8" />
{/if}
```

### Stripe Positioning by View

| Airflow Type  | Front View          | Rear View           |
| ------------- | ------------------- | ------------------- |
| front-to-rear | Blue stripe (left)  | Red stripe (right)  |
| rear-to-front | Red stripe (left)   | Blue stripe (right) |
| left-to-right | No stripe (lateral) | No stripe (lateral) |
| right-to-left | No stripe (lateral) | No stripe (lateral) |
| side-to-rear  | Blue stripe (left)  | Red stripe (right)  |
| passive       | No stripe           | No stripe           |

---

## Sources

### DCIM & Infrastructure

- [NetBox GitHub Issue #3839 - Add device field to indicate airflow](https://github.com/netbox-community/netbox/issues/3839)
- [NetBox DeviceType Documentation](https://netboxlabs.com/docs/netbox/models/dcim/devicetype/)
- [Sunbird DCIM 3D Visualization](https://www.sunbirddcim.com/product/data-center-visualization)
- [NetBox Labs - Open Source DCIM Tools](https://netboxlabs.com/blog/open-source-dcim-tools/)

### Hardware Conventions

- [FS.com - Port Side Intake vs Port Side Exhaust](https://www.fs.com/blog/port-side-intake-vs-port-side-exhaust-whats-the-difference-79.html)
- [Juniper EX4100 Cooling System](https://www.juniper.net/documentation/us/en/hardware/ex4100/topics/concept/ex4100-cooling-system.html)
- [Kerry Cordero - Cisco Nexus Airflow](https://cordero.me/cisco-nexus-port-side-exhaust-vs-port-side-intake/)

### UX Design Patterns

- [Carbon Design System - Status Indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/)
- [MindSphere - Context & Status Patterns](https://design.mindsphere.io/patterns/context-status.html)
- [HPE Design System - Status Indicator](https://design-system.hpe.design/templates/status-indicator)
- [Mobbin - Badge UI Design](https://mobbin.com/glossary/badge)
- [NN/g - Indicators, Validations, and Notifications](https://www.nngroup.com/articles/indicators-validations-notifications/)

### Data Center Best Practices

- [RackSolutions - Data Center Airflow Management](https://www.racksolutions.com/news/blog/data-center-airflow-management/)
- [Upsite Technologies - Airflow Management](https://www.upsite.com/resources/airflow-management-education/)
- [Graphical Networks - Rack Elevation Diagrams Guide](https://graphicalnetworks.com/blog-rack-diagrams-your-ultimate-guide/)

---

## Next Steps

1. **Get user feedback** on recommended approach (edge stripes)
2. If approved, update `spec-airflow-visualization.md` with new design
3. Implement simplified `AirflowIndicator.svelte` component
4. Add conflict reporting to EditPanel
5. Update tests for new visual approach
