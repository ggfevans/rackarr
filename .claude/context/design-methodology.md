# Rackarr — Design Methodology & UX Guidelines

**Purpose:** Inform design decisions for Rackarr's UX based on established patterns for canvas-based applications, drag-and-drop interfaces, and accessible web design.

**Version:** 2.0 — Expanded with researched UX patterns, concrete examples, and reconciliation with current codebase.

---

## Design Principles Summary

Before diving into specific patterns, these are the core principles that should guide every design decision in Rackarr:

1. **Direct Manipulation First** — Users should feel like they're physically moving equipment
2. **Feedback at Every Step** — No action should occur without immediate visual confirmation
3. **Discoverable Affordances** — Draggable items must look draggable; drop zones must be obvious
4. **Consistent Visual Language** — One colour means one thing throughout the application
5. **Keyboard Parity** — Every mouse action has a keyboard equivalent

---

## 1. Canvas-Based Application Patterns

### 1.1 Core Canvas Concepts

Canvas-based applications like Figma, Miro, and design tools share common interaction paradigms:

| Concept                         | Description                                                                            | Rackarr Application                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Infinite vs. Bounded Canvas** | Infinite canvases (Miro) allow unlimited space; bounded canvases constrain to viewport | Rackarr uses **bounded canvas** — racks have fixed dimensions, horizontal scroll for overflow |
| **Direct Manipulation**         | Objects respond immediately to user input, mimicking physical interaction              | Devices snap to U positions, visual feedback during drag                                      |
| **Object-Action Model**         | Select object first, then act on it                                                    | Click device/rack to select → then edit/delete/move                                           |
| **Spatial Memory**              | Users remember where things are visually                                               | Consistent rack positioning, bottom-aligned for orientation                                   |

### 1.2 Zoom & Pan Patterns

**Standard Approaches:**

- **Fixed zoom levels** (50%, 75%, 100%, 150%, 200%) — simpler, predictable
- **Continuous zoom** (scroll wheel) — more flexible, complex to implement

**Recommendation for v0.1:** Fixed zoom levels with +/- controls. "Fit All" deferred to roadmap.

### 1.3 Selection Patterns

**Single vs. Multi-Select:**

- **Single-select** (current spec): Simpler, appropriate for v0.1
- Multi-select enables bulk operations but adds complexity

**Selection States:**

```
Unselected → Hover → Selected → Active (editing)
```

Each state needs distinct visual treatment.

---

## 2. Drag-and-Drop UX Best Practices

### 2.1 The Seven Commandments of DnD

Based on UX Studio's research, critical DnD design requirements:

1. **Tangibility should be immediately visible** — Draggable items need visual affordance (handles, cursor change)
2. **Hover confirmation** — Additional feedback when cursor enters draggable area
3. **Ghost image during drag** — Show what's being moved
4. **Clear drop zones** — Indicate valid/invalid targets
5. **Magnetic snapping** — Objects "snap" to valid positions
6. **Animation on drop** — Brief transition (100ms) confirms placement
7. **Elevation/shadow** — Dragged items appear "lifted" in z-dimension

### 2.2 DnD Interaction States

Every drag-and-drop requires states for:

| State                   | Visual Treatment                     | Rackarr Implementation               |
| ----------------------- | ------------------------------------ | ------------------------------------ |
| **Resting**             | Default appearance                   | Device at rest in rack               |
| **Hover**               | Subtle highlight, cursor change      | Pointer → grab cursor                |
| **Grabbed**             | Elevated, shadow, "lifted"           | Device shadow, slight scale          |
| **Dragging**            | Ghost at origin, item follows cursor | Semi-transparent ghost remains       |
| **Over Valid Target**   | Drop zone highlights green/blue      | U position highlights valid          |
| **Over Invalid Target** | Drop zone highlights red/grey        | Occupied U shows red, no-drop cursor |
| **Dropped**             | Brief settle animation               | Device snaps into place              |

### 2.3 Collision Handling (Block Approach)

The spec already defines "block approach" — reinforce with:

- **Pre-emptive feedback**: Show valid drop zones BEFORE user attempts drop
- **Graceful rejection**: Invalid drops return item to origin with feedback
- **Clear messaging**: Visual indicator why drop failed (occupied, too tall)

### 2.4 Snap Behaviour

```
Device centre crosses U boundary → Snap to that U
```

**Snap threshold:** ~50% overlap triggers snap indication

**Visual feedback during drag:**

- Show ghost outline where device WILL land
- Highlight the target U positions

---

## 3. Design System Approach

### 3.1 CSS Custom Properties Strategy

The spec already defines CSS custom properties. This is the correct approach:

**Benefits:**

- Runtime theme switching (dark/light)
- Consistent values across components
- SVG elements can inherit styles
- No build step required

**Structure:**

```css
:root {
	/* Foundational tokens */
	--spacing-unit: 4px;
	--u-height: 22px;
	--rack-width: 220px;

	/* Semantic tokens (reference foundational) */
	--device-padding: calc(var(--spacing-unit) * 2);

	/* Theme tokens (dark mode default) */
	--colour-bg: var(--colour-bg-dark);
	--colour-text: var(--colour-text-dark);
}

[data-theme='light'] {
	--colour-bg: var(--colour-bg-light);
	--colour-text: var(--colour-text-light);
}
```

### 3.2 Component Hierarchy (Atomic Design)

Apply Brad Frost's Atomic Design methodology:

| Level         | Examples in Rackarr                                           |
| ------------- | ------------------------------------------------------------- |
| **Atoms**     | Buttons, icons, labels, colour swatches                       |
| **Molecules** | Form fields (label + input), toolbar buttons (icon + tooltip) |
| **Organisms** | Device card, rack view, edit panel, toolbar                   |
| **Templates** | Main layout (toolbar + canvas + drawers)                      |
| **Pages**     | Complete application state                                    |

### 3.3 Theming Architecture

**Theme Scope:**

- Dark (default) — matches \*arr app aesthetic
- Light — primarily for export with transparent/white background

**Theme Switching:**

```javascript
// Store preference
localStorage.setItem('theme', 'dark');

// Apply at document level
document.documentElement.setAttribute('data-theme', theme);
```

**Export Override:**
When exporting with light background, temporarily apply light theme to SVG, export, revert.

---

## 4. Svelte 5 Design Considerations

### 4.1 Runes for State Management

Svelte 5 runes replace stores for component state. Rackarr should use:

| Rune       | Use Case in Rackarr                                                 |
| ---------- | ------------------------------------------------------------------- |
| `$state`   | Current racks array, selected item, theme preference                |
| `$derived` | Computed values (total U used, device overlap detection)            |
| `$effect`  | Side effects (sessionStorage sync, export operations)               |
| `$props`   | Component inputs (rack data to RackView, device data to DeviceCard) |

### 4.2 Shared State Pattern

For global state (racks, devices), use `.svelte.js` files:

```javascript
// lib/stores/layout.svelte.js
export function createLayoutStore() {
	let racks = $state([]);
	let selectedId = $state(null);

	let selectedItem = $derived(
		racks.find((r) => r.id === selectedId) ??
			racks.flatMap((r) => r.devices).find((d) => d.id === selectedId)
	);

	return {
		get racks() {
			return racks;
		},
		get selectedItem() {
			return selectedItem;
		}
		// ... methods
	};
}
```

### 4.3 Component Library Considerations

For v0.1, **build from scratch** rather than adopting a UI library:

**Rationale:**

- Rackarr's UI is highly custom (SVG racks, drag-and-drop)
- Most UI libraries focus on forms/dashboards, not canvas apps
- Control over bundle size and theming
- Learning opportunity for Svelte 5 patterns

**Future consideration:** Bits UI or Melt UI for accessible primitives if needed in later versions.

---

## 5. Desktop vs. Mobile Design Strategy

### 5.1 Current Position

The spec explicitly excludes mobile for v0.1: "Desktop browser users only. No mobile/tablet support."

This is pragmatic for MVP — drag-and-drop on touch devices requires fundamentally different interactions.

### 5.2 Future Mobile Considerations

When mobile support is added (backlog), consider:

**Option A: Responsive Design**

- Same codebase, CSS breakpoints
- Touch-friendly tap targets (48px minimum)
- Gestures for zoom/pan
- Bottom-sheet drawers instead of side panels

**Option B: Adaptive Design (Recommended)**

- Desktop: Full drag-and-drop experience
- Mobile: Simplified "list view" for device management
- Different interaction paradigms per platform

**Key Mobile Challenges:**
| Desktop Pattern | Mobile Challenge | Potential Solution |
|-----------------|------------------|-------------------|
| Drag-and-drop | Touch imprecision, no hover | Tap-to-select, tap-target-to-place |
| Side drawers | Screen real estate | Bottom sheets, full-screen modals |
| Keyboard shortcuts | No keyboard | Gesture alternatives, menu actions |
| Hover states | No hover | Touch feedback, long-press menus |

### 5.3 Touch Target Guidelines

When implementing mobile (future):

- **Minimum touch target**: 48×48px (Google Material Design)
- **Spacing between targets**: 8px minimum
- **Thumb zone awareness**: Primary actions in comfortable reach

---

## 6. Accessibility Guidelines

### 6.1 Keyboard Navigation (v0.1 Requirement)

The spec already defines keyboard shortcuts. Implementation notes:

**Tab Order:**

```
Toolbar → Canvas (racks) → Left drawer → Right drawer
```

**Within Canvas:**

```
Tab: Next rack
Arrow keys: Navigate within rack/reorder
Enter: Select/activate
Escape: Deselect, close drawers
```

**Focus Management:**

- Always maintain visible focus indicator
- Trap focus in modals/drawers when open
- Return focus to trigger element on close

### 6.2 ARIA Considerations

For custom components:

```html
<!-- Draggable device -->
<div
	role="button"
	tabindex="0"
	aria-grabbed="false"
	aria-label="1U Server at position U10"
	aria-describedby="device-controls-hint"
>
	1U Server
</div>

<!-- Drop zone -->
<div role="listbox" aria-label="Rack 1, 18 units" aria-dropeffect="move">
	<!-- U slots -->
</div>
```

### 6.3 Screen Reader Announcements (Roadmap)

For v0.4 accessibility improvements:

- Live regions for drag-and-drop status
- Announcements for selection changes
- Confirmation of successful actions

### 6.4 Colour Contrast

**WCAG AA Requirements:**

- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Test with:** WebAIM Contrast Checker

---

## 7. Interaction Design Principles

### 7.1 Feedback Immediacy

| Action         | Feedback Timing               |
| -------------- | ----------------------------- |
| Button click   | Immediate (< 100ms)           |
| Drag start     | Immediate                     |
| Drop animation | 100-200ms                     |
| Save to file   | Progress indicator if > 500ms |
| Export         | Progress indicator always     |

### 7.2 Error Prevention & Recovery

**Destructive Actions:**

- Rack deletion with devices: Confirmation dialog
- Device deletion: No confirmation (reversible with undo — roadmap)

**Invalid Actions:**

- Collision during drag: Visual feedback, block drop
- Resize populated rack: Gentle error message

### 7.3 Undo/Redo (Roadmap v0.3)

Plan architecture now for future implementation:

- Command pattern for all state mutations
- History stack with configurable depth
- Persist undo stack in sessionStorage?

---

## 8. Visual Design Principles

### 8.1 Minimal & Flat

The spec calls for "minimal, flat design. No skeuomorphism."

**Implement:**

- Solid fills, no gradients
- Subtle shadows only for elevation/drag states
- Geometric shapes
- Monospace or clean sans-serif typography

### 8.2 Information Hierarchy

```
Primary:   Rack contents (devices)
Secondary: Rack chrome (rails, numbers)
Tertiary:  Canvas background, toolbar
```

**Visual weight:** Devices > Rack frame > Background

### 8.3 Animation Guidelines

- **Purpose:** Communicate state changes, not decoration
- **Duration:** 100-200ms for micro-interactions
- **Easing:** ease-out for most transitions
- **Reduce motion:** Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
	* {
		animation-duration: 0.01ms !important;
		transition-duration: 0.01ms !important;
	}
}
```

---

## 9. Design Validation Checklist

Before implementing each component, verify:

- [ ] **Keyboard accessible** — Can complete all actions with keyboard?
- [ ] **Focus visible** — Is focus state clearly visible?
- [ ] **Touch-friendly** — (future) Are targets 48px+?
- [ ] **Colour contrast** — Meets WCAG AA?
- [ ] **Theme aware** — Works in both dark/light mode?
- [ ] **State coverage** — All interaction states designed?
- [ ] **Error handling** — Invalid states have feedback?
- [ ] **Responsive** — (future) Breakpoints considered?

---

## 10. Key Resources

### Design Systems References

- [W3C Design System](https://design-system.w3.org/) — Excellent CSS architecture
- [Carbon Design System](https://carbondesignsystem.com/) — IBM's comprehensive system
- [Open Web Components](https://open-wc.org/guides/community/component-libraries/) — Component library patterns

### Accessibility

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Keyboard Accessibility](https://webaim.org/techniques/keyboard/)

### Drag-and-Drop

- [Accessible Drag and Drop Patterns](https://medium.com/salesforce-ux/4-major-patterns-for-accessible-drag-and-drop-1d43f64ebf09) — Salesforce UX
- [Smart Interface Design Patterns](https://smart-interface-design-patterns.com/articles/drag-and-drop-ux/)

### Svelte 5

- [Svelte 5 Runes Documentation](https://svelte.dev/blog/runes)
- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)

---

## 11. Implementation Priorities

For v0.1, focus on:

1. **Core DnD states** — All 7 states for device drag-and-drop
2. **Keyboard navigation** — Full shortcut implementation
3. **Theme system** — CSS custom properties foundation
4. **Visual focus** — Clear focus indicators
5. **Semantic HTML** — Buttons are `<button>`, etc.

Defer to roadmap:

- Screen reader announcements (v0.4)
- Undo/redo (v0.3)
- Mobile support (backlog)
- Advanced accessibility (v0.4)

---

_This document should be referenced during prompt_plan.md implementation to ensure consistent UX decisions._

---

## 12. Research-Backed UX Patterns (Expanded)

This section provides detailed guidance based on research into successful canvas-based applications including Figma, Miro, Lucid, Svelte Flow, Svelvet, and enterprise design systems (Carbon, PatternFly, Cloudscape).

### 12.1 Direct Manipulation Fundamentals

**Source:** Lucid Design Blog, Nielsen Norman Group

Direct manipulation is the core interaction paradigm for spatial applications. Users expect to act directly on objects rather than through menus or dialogs.

**Key Principles:**

| Principle               | Description                                  | Rackarr Implementation                                    |
| ----------------------- | -------------------------------------------- | --------------------------------------------------------- |
| **Visibility**          | Objects of interest are continuously visible | Rack always shows all U slots; devices visible in library |
| **Incremental Actions** | Small actions with immediate feedback        | Drag pixel-by-pixel, snap shows preview                   |
| **Reversibility**       | Easy to undo/correct mistakes                | Return-to-origin on invalid drop; undo stack (v0.3)       |
| **Physical Metaphor**   | Mimics real-world behaviour                  | Devices "lift" when grabbed, "settle" when dropped        |

**Example from Lucid:**

> Selection handles and points appear when an object is selected, providing visual signifiers and targets for editing, positioning, resizing, and connecting objects.

**Rackarr Reconciliation:**

- ✅ Rack selection shows edit panel — good
- ⚠️ Device selection handles not visible in library — needs drag affordance
- ⚠️ No resize handles on racks (correct — racks resize via properties, not drag)

### 12.2 Visual Affordance for Draggable Elements

**Sources:** Nielsen Norman Group, Pencil & Paper UX, UX Movement, Cloudscape Design System

The research is clear: **users cannot discover drag-and-drop without visual cues**.

**The Affordance Problem:**

> "Creating an obvious signifier for drag–and–drop is challenging. A drag–and–drop signifier has to signal two functions — (1) that the item is 'grabbable' and (2) what dragging it somewhere will accomplish." — Nielsen Norman Group

**Established Affordance Patterns:**

| Pattern                   | Description                     | When to Use                                       |
| ------------------------- | ------------------------------- | ------------------------------------------------- |
| **Six-dot grip** (⋮⋮)     | Two columns of three dots       | List reordering, cards, draggable rows            |
| **Horizontal lines** (☰) | Three horizontal bars           | Reorderable items (conflicts with hamburger menu) |
| **Cursor change**         | `default` → `grab` → `grabbing` | Always, on hover and during drag                  |
| **Elevation on hover**    | Slight lift with shadow         | Cards, draggable components                       |
| **Dotted border**         | Dashed outline on drop zones    | File upload areas, empty states                   |

**VMware Clarity Design System Approach:**

> "Use a distinct colour choice that isn't used often in your design system to identify drag and drop interactions. Avoid colours that already have significance (e.g., red for destructive actions)."

VMware uses **purple** exclusively for drag-and-drop interactions.

**Rackarr Recommendation:**

1. Add six-dot grip icon to device library items (left side)
2. Use a distinct accent colour (suggest: blue `#3b82f6`) for all DnD highlights
3. Change cursor on hover: `grab`; during drag: `grabbing`
4. Add subtle elevation (`box-shadow`) on library item hover

**Current State Assessment (from screenshot):**

- ❌ No visible drag handles on device library items
- ❌ Devices look like static list items, not draggable cards
- ⚠️ Cursor change may be implemented (not visible in static screenshot)
- ✅ Category colours provide grouping (blue, purple, red) — good but not drag-specific

### 12.3 Interaction State Matrix

**Sources:** Nielsen Norman Group (Button States), Dynatrace Design System, LogRocket

Every interactive element needs **all** of these states designed:

**Core States (Mutually Exclusive):**

| State              | Trigger           | Visual Treatment                         | CSS Pseudo-class |
| ------------------ | ----------------- | ---------------------------------------- | ---------------- |
| **Rest/Default**   | Initial state     | Base appearance                          | —                |
| **Hover**          | Mouse enters area | Subtle highlight, cursor change          | `:hover`         |
| **Focus**          | Tab navigation    | Visible outline (accessibility critical) | `:focus-visible` |
| **Active/Pressed** | Mouse down        | Darker/depressed appearance              | `:active`        |
| **Disabled**       | Cannot interact   | Reduced opacity, no cursor change        | `:disabled`      |

**Additive States (Can combine with above):**

| State              | Trigger                   | Visual Treatment                     |
| ------------------ | ------------------------- | ------------------------------------ |
| **Selected**       | User has chosen this item | Persistent highlight, checkmark      |
| **Dragging**       | Currently being dragged   | Elevated, semi-transparent at origin |
| **Drop Target**    | Valid item dragged over   | Highlight border, background change  |
| **Invalid Target** | Invalid item dragged over | Red highlight, `no-drop` cursor      |
| **Loading**        | Async operation           | Spinner, disabled interaction        |

**Rackarr Component State Requirements:**

```
Device Library Item:
  rest → hover(grab cursor, slight lift) → grabbed(elevated, shadow) →
  dragging(ghost at origin) → dropped(settle animation)

Rack U Slot:
  rest(subtle grid) → hover(highlight if empty) →
  valid-target(blue highlight) → invalid-target(red, no-drop cursor) →
  occupied(device rendered)

Toolbar Button:
  rest → hover(background change) → focus(outline) →
  active(pressed) → [disabled if N/A]

Edit Panel Input:
  rest → focus(border highlight) → invalid(red border, error message)
```

**Current State Assessment:**

- ⚠️ Cannot assess all states from static screenshot
- ✅ Delete button has clear destructive (red) styling
- ⚠️ Edit panel inputs appear to have focus states (need to verify)
- ❌ Empty rack slots show no hover preview

### 12.4 Drop Zone Design

**Sources:** Nielsen Norman Group, Eleken, Pencil & Paper

Drop zones are the "magnetic targets" where dragged items land. They must be obvious **before** the user tries to drop.

**Drop Zone Best Practices:**

1. **Staged Feedback:**
   - **Empty state:** Subtle indication target exists (dotted border, light background)
   - **Ready state:** Highlight when dragged item approaches
   - **Active state:** Intensify when item is directly over zone

2. **Magnetic Effect:**

   > "The drop zone becomes active before the user has dragged a file all the way within the border of the file uploader... This solution effectively increases the area of the drop zone, and provides a feeling of magnetic attraction." — Nielsen Norman Group

3. **Preview Before Drop:**
   > "Show the background objects moving out of the way before the user releases the item. This short animation gives a preview of what will happen." — Nielsen Norman Group

**Rackarr Drop Zone Requirements:**

For **Rack U Slots:**

- Empty slots should have very subtle visual distinction (lighter grid line)
- When dragging a device, highlight the target U positions in blue
- Multi-U devices should highlight ALL affected slots (e.g., 4U device highlights 4 slots)
- Occupied slots should highlight red with `cursor: no-drop`

For **Canvas (when dragging from library):**

- Show "snap preview" of where rack/device will land
- Existing racks should glow if device is compatible

**Snap Trigger Timing:**

> "The most natural version of this interaction uses neither edge nor cursor — instead, it begins the reshuffling animation once the center of the dragged object overlaps the target." — Nielsen Norman Group

**Current State Assessment:**

- ❌ Empty rack slots appear identical to each other (no drop preview visible)
- ⚠️ Cannot see hover/drop states from static screenshot
- Recommendation: Add light blue highlight to target U slot(s) during drag

### 12.5 Drawer/Panel Design Patterns

**Sources:** PatternFly, Material UI, Ant Design, Mobbin

Rackarr uses a **three-panel layout**: Left drawer (Device Library), Canvas (center), Right panel (Edit). This is a well-established pattern.

**Panel Types:**

| Type                  | Behaviour                      | Use Case                              |
| --------------------- | ------------------------------ | ------------------------------------- |
| **Permanent**         | Always visible, fixed position | Desktop apps with constant navigation |
| **Persistent**        | Toggleable, pushes content     | Desktop apps, detail panels           |
| **Temporary/Overlay** | Toggleable, overlays content   | Mobile, modal-like interactions       |

**PatternFly Guidance:**

> "An inline drawer is placed beside page content, making the rest of the page content more compact (but still visible). An overlay drawer appears 'on top' of page content."

**Rackarr Panel Recommendations:**

**Left Panel (Device Library):**

- Type: **Persistent** (toggleable via "Device Library" button)
- Should push canvas content when opened
- Header should include: Title, Search, Close button
- Consider collapsible sections for categories

**Right Panel (Edit):**

- Type: **Persistent**, context-sensitive
- Opens when item selected, closes on deselect or explicit close
- Should push canvas when open (current behaviour appears correct)
- **Important:** Highlight selected item in canvas to maintain context

**Panel Interaction Patterns:**

| Action                            | Behaviour                               |
| --------------------------------- | --------------------------------------- |
| Select rack                       | Open right panel with rack properties   |
| Select device                     | Open right panel with device properties |
| Deselect (Escape or click canvas) | Close right panel                       |
| Click close button                | Close panel, deselect item              |
| Click different item              | Update panel contents (no animation)    |

**Current State Assessment:**

- ✅ Three-panel layout is correct pattern
- ✅ Right panel shows contextual properties
- ✅ Close button present on right panel
- ⚠️ Left panel toggle could be more prominent
- ⚠️ Consider: Should clicking canvas close left panel? (mobile thinking)

### 12.6 Toolbar Design

**Sources:** W3C ARIA Toolbar Pattern, PatternFly, Microsoft Design Guidelines

**Core Toolbar Principles:**

1. **Tooltips on every control** — Icons alone are ambiguous
2. **Logical grouping** — Use dividers between functional groups
3. **Keyboard navigation** — Arrow keys move within toolbar, Tab moves out
4. **State indication** — Toggle buttons show on/off state clearly

**ARIA Toolbar Pattern:**

> "A toolbar is a container for grouping a set of controls... Implement focus management so the keyboard Tab sequence includes one stop for the toolbar and arrow keys move focus among controls." — W3C

**Toolbar Grouping Best Practice:**

```
[File Operations] | [Zoom Controls] | [View Toggles] | [Help]
  New, Save, Export     -, %, +         Theme, Help      ?
```

**Current Toolbar Analysis (from screenshot):**

```
[Device Library] [+] [Save] [Export] [Import?] [Delete?] | [Search] [Zoom: 77%] [?] [?] | [Theme] [Help]
```

**Recommendations:**

1. Add tooltips to every icon
2. Group related functions with subtle dividers
3. Zoom display is good, but consider +/- buttons alongside
4. Confirm all icons have accessible labels (`aria-label`)

### 12.7 Spatial Grid Systems

**Sources:** Carbon Design System, Smashing Magazine, designsystems.com

**The 8pt Grid System:**

Rackarr already uses specific measurements (`--u-height: 22px`), but overall spacing should follow a consistent scale.

**Recommended Spacing Scale:**

```css
:root {
	--space-1: 4px; /* Tight: icon padding */
	--space-2: 8px; /* Default: between related items */
	--space-3: 12px; /* Comfortable: form field gaps */
	--space-4: 16px; /* Spacious: section padding */
	--space-5: 24px; /* Large: panel padding */
	--space-6: 32px; /* Extra: major section gaps */
}
```

**Carbon Design System Guidance:**

> "Choosing a smaller base unit like 4pt, 5pt, or 6pt can open you up to too many variables. I find that 8pt increments are the right balance of being visually distant while having a reasonable number of variables."

**Rackarr Application:**

- Panel padding: `--space-4` (16px)
- Form field gaps: `--space-2` (8px)
- Section dividers: `--space-4` (16px) margin
- Toolbar button padding: `--space-2` (8px)
- Device library item padding: `--space-2` (8px) vertical, `--space-3` (12px) horizontal

### 12.8 Svelte Ecosystem Patterns

**Sources:** Svelte Flow, Svelvet

Both Svelte Flow and Svelvet provide relevant patterns for canvas-based Svelte applications.

**Svelvet Features Relevant to Rackarr:**

1. **Snap-to-Grid:**

   > "Toggle between free movement and snap-to-grid modes for precise node placement on the canvas."

   Rackarr uses U-based snapping, which is similar but more constrained.

2. **Keyboard Navigation:**

   > "Users can now navigate the canvas using standard keyboard controls. When the graph is focused, use the arrow keys to pan. The '0', '-', and '=' keys reset, zoom out and zoom in."

   Rackarr should adopt similar keyboard conventions.

3. **Drawer Component:**

   > "A new drag-and-drop Drawer component that can take custom Nodes, Anchors and Edges as props and add them to the canvas via the UI."

   This validates Rackarr's Device Library drawer approach.

**Svelte Flow Patterns:**

1. **Custom Nodes:**

   > "Svelte Flow nodes are just Svelte components. Create custom nodes to have full control with interactive components."

   Rackarr devices should be Svelte components with their own state and rendering.

2. **Built-in Controls:**

   > "Background, Minimap, Controls, and Panel components are ready-to-use."

   Consider: Minimap for complex multi-rack layouts (v0.3 or later).

---

## 13. Current UI Analysis & Recommendations

Based on the screenshot provided, here is a detailed analysis of the current implementation with specific recommendations.

### 13.1 Device Library (Left Panel)

**What Works:**

- ✅ Categorized grouping (Servers, Network, Patch Panels, Power)
- ✅ Category headers are clear and collapsible-looking
- ✅ Each device shows name and U-height badge
- ✅ Colour-coded category indicators (blue, purple, red)
- ✅ Search field at top
- ✅ "Import" and "+ Add Device" buttons at bottom

**What Needs Improvement:**

| Issue                       | Impact                                 | Recommendation                                       |
| --------------------------- | -------------------------------------- | ---------------------------------------------------- |
| No drag handles             | Users may not know items are draggable | Add 6-dot grip icon on left of each item             |
| Items look like static list | Low affordance for drag                | Add hover state: slight lift, shadow, `cursor: grab` |
| Category colours are small  | Hard to scan quickly                   | Consider larger colour block or left border accent   |
| U-height badge styling      | Badge looks disabled                   | Make badge more prominent, perhaps pill-shaped       |

**Visual Mockup Suggestion:**

```
┌─────────────────────────────┐
│ Device Library           ✕  │
├─────────────────────────────┤
│ 🔍 Search devices...        │
├─────────────────────────────┤
│ SERVERS ▼                   │
│ ┌─────────────────────────┐ │
│ │ ⋮⋮ ■ 1U Server    [1U]  │ │  ← 6-dot grip, colour block, pill badge
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ ⋮⋮ ■ 2U Server    [2U]  │ │
│ └─────────────────────────┘ │
│ ...                         │
├─────────────────────────────┤
│  ↓ Import    [+ Add Device] │
└─────────────────────────────┘
```

### 13.2 Canvas (Center)

**What Works:**

- ✅ Rack is clearly rendered with U numbers
- ✅ Front/Rear toggle is present
- ✅ Dark background provides good contrast
- ✅ Rack has clear header with name

**What Needs Improvement:**

| Issue                                  | Impact                             | Recommendation                           |
| -------------------------------------- | ---------------------------------- | ---------------------------------------- |
| U slots are visually identical         | Hard to see where devices can drop | Add subtle alternating row shading       |
| No visible selection indicator on rack | Unclear which rack is selected     | Add blue border or glow to selected rack |
| U numbers are small                    | Hard to read at distance           | Consider larger font or hover-to-magnify |
| Rack interior is same colour as canvas | Low contrast                       | Slightly lighter interior background     |

**Rack Visual Enhancement:**

```
Current:                      Recommended:
┌─────────────────┐           ┌─────────────────┐
│   Rack 1        │           │ ░░ Rack 1 ░░░░ │  ← Subtle texture on header
│ Front | Rear    │           │ [Front] [Rear]  │  ← More button-like toggle
├─────────────────┤           ├─────────────────┤
│42 ┌───────────┐ │           │42│░░░░░░░░░░░░░│ │  ← Alternating row shading
│41 ├───────────┤ │           │41│             │ │
│40 ├───────────┤ │           │40│░░░░░░░░░░░░░│ │
│...             ...          │...             ...
```

### 13.3 Edit Panel (Right)

**What Works:**

- ✅ Clear "Edit" header with close button
- ✅ Name field is editable
- ✅ Height has both input and quick presets (12U, 18U, 24U, 42U)
- ✅ Position and Devices are read-only metadata
- ✅ Delete Rack is red (destructive action)

**What Needs Improvement:**

| Issue                      | Impact                          | Recommendation                              |
| -------------------------- | ------------------------------- | ------------------------------------------- |
| "Edit" is generic          | Doesn't say what's being edited | Change to "Edit Rack" or show rack name     |
| Preset buttons not aligned | 42U wraps to second line        | Use grid layout or smaller buttons          |
| No visual hierarchy        | All fields same weight          | Group into sections with subtle dividers    |
| Delete has no confirmation | Accidental deletion risk        | Add confirmation dialog for non-empty racks |

**Panel Structure Recommendation:**

```
┌─────────────────────────────┐
│ Edit: Rack 1             ✕  │  ← Contextual title
├─────────────────────────────┤
│ ▸ Properties                │  ← Section header
│   Name: [Rack 1        ]    │
│   Height: [42] U            │
│   [12U] [18U] [24U] [42U]   │  ← Even grid
├─────────────────────────────┤
│ ▸ Information               │
│   Position: 1               │
│   Devices: 0                │
│   Capacity: 42U free        │  ← Add this
├─────────────────────────────┤
│                             │
│  [ Delete Rack ]            │  ← At bottom, clear separation
└─────────────────────────────┘
```

### 13.4 Toolbar

**What Works:**

- ✅ Device Library button is prominent with icon and text
- ✅ Zoom percentage is displayed
- ✅ Theme toggle is present
- ✅ Clean, minimal design

**What Needs Improvement:**

| Issue                   | Impact                    | Recommendation                     |
| ----------------------- | ------------------------- | ---------------------------------- |
| Icons lack tooltips     | Users must guess function | Add tooltips on hover              |
| Zoom has no +/- buttons | Must know shortcuts       | Add increment/decrement buttons    |
| No visual grouping      | Functions blend together  | Add subtle dividers between groups |
| Help icon unclear       | May not be discovered     | Add "Help" label or tooltip        |

**Toolbar Layout Recommendation:**

```
[Device Library ▼] | [+] [💾] [📤] [📥] [🗑️] | [🔍] [77%] [-][+] | [☀️] [?]
     ↑                    ↑                        ↑              ↑
  Toggle drawer      File ops                  Zoom controls   Settings

With tooltips:
[+] → "Add Rack (N)"
[💾] → "Save (Ctrl+S)"
[📤] → "Export as PNG"
...
```

---

## 14. Implementation Checklist (Expanded)

### 14.1 Drag-and-Drop Implementation Checklist

- [ ] **Affordance:** Devices in library have visible drag handles (6-dot grip)
- [ ] **Cursor states:** `grab` on hover, `grabbing` during drag
- [ ] **Ghost image:** Semi-transparent copy follows cursor during drag
- [ ] **Origin indicator:** Faded/ghost remains at original position
- [ ] **Valid drop zones:** Empty U slots highlight blue when draggable approaches
- [ ] **Invalid drop zones:** Occupied slots highlight red with `no-drop` cursor
- [ ] **Multi-U preview:** Dragging 4U device highlights 4 target slots
- [ ] **Snap feedback:** Clear preview of final position before drop
- [ ] **Drop animation:** 100-200ms settle animation on successful drop
- [ ] **Return animation:** Item returns to origin on invalid drop
- [ ] **Keyboard alternative:** Can place devices via keyboard (select + arrow + Enter)

### 14.2 Interaction States Checklist

For each interactive element, verify all states are implemented:

**Device Library Item:**

- [ ] Rest state
- [ ] Hover state (lift + shadow + cursor change)
- [ ] Focus state (visible outline)
- [ ] Grabbed state (elevated)
- [ ] Dragging state (ghost + cursor)

**Rack U Slot:**

- [ ] Empty rest state
- [ ] Empty hover state
- [ ] Valid drop target state
- [ ] Invalid drop target state
- [ ] Occupied state (device rendered)

**Toolbar Button:**

- [ ] Rest state
- [ ] Hover state
- [ ] Focus state
- [ ] Active/pressed state
- [ ] Disabled state (if applicable)

**Edit Panel Input:**

- [ ] Rest state
- [ ] Hover state
- [ ] Focus state
- [ ] Invalid state (with error message)

### 14.3 Accessibility Checklist

- [ ] All interactive elements are keyboard focusable
- [ ] Focus order is logical (left-to-right, top-to-bottom)
- [ ] Focus indicator is clearly visible (not just browser default)
- [ ] All icon buttons have `aria-label`
- [ ] Toolbar has `role="toolbar"` with arrow key navigation
- [ ] Drag operations have keyboard alternatives
- [ ] Colour contrast meets WCAG AA (4.5:1 for text)
- [ ] `prefers-reduced-motion` is respected
- [ ] Error messages are associated with inputs (`aria-describedby`)

---

## 15. Visual Design Tokens (Expanded)

### 15.1 Colour Palette

```css
:root {
	/* Backgrounds */
	--colour-bg-app: #1a1a2e; /* Main app background */
	--colour-bg-canvas: #16213e; /* Canvas area */
	--colour-bg-panel: #1f1f38; /* Drawer/panel backgrounds */
	--colour-bg-card: #2a2a4a; /* Cards, inputs */

	/* Text */
	--colour-text-primary: #e4e4e7; /* Main text */
	--colour-text-secondary: #a1a1aa; /* Muted text, labels */
	--colour-text-disabled: #52525b; /* Disabled text */

	/* Accent (Primary action, selection) */
	--colour-accent: #3b82f6; /* Blue - primary actions */
	--colour-accent-hover: #2563eb; /* Darker blue on hover */

	/* Drag-and-Drop (Distinct colour per VMware guidance) */
	--colour-dnd-valid: #3b82f6; /* Blue - valid drop zone */
	--colour-dnd-invalid: #ef4444; /* Red - invalid drop zone */
	--colour-dnd-dragging: #3b82f6; /* Blue - item being dragged */

	/* State colours */
	--colour-success: #22c55e; /* Green - success states */
	--colour-warning: #f59e0b; /* Amber - warnings */
	--colour-error: #ef4444; /* Red - errors, destructive */

	/* Borders */
	--colour-border: #3f3f5a; /* Default borders */
	--colour-border-focus: #3b82f6; /* Focus ring */

	/* Device Categories */
	--colour-category-servers: #3b82f6; /* Blue */
	--colour-category-network: #8b5cf6; /* Purple */
	--colour-category-storage: #06b6d4; /* Cyan */
	--colour-category-power: #ef4444; /* Red */
	--colour-category-patch: #f59e0b; /* Amber */
}
```

### 15.2 Typography

```css
:root {
	/* Font families */
	--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
	--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

	/* Font sizes (modular scale) */
	--text-xs: 0.75rem; /* 12px - badges, captions */
	--text-sm: 0.875rem; /* 14px - secondary text */
	--text-base: 1rem; /* 16px - body text */
	--text-lg: 1.125rem; /* 18px - headings */
	--text-xl: 1.25rem; /* 20px - panel titles */

	/* Font weights */
	--font-normal: 400;
	--font-medium: 500;
	--font-semibold: 600;

	/* Line heights */
	--leading-tight: 1.25;
	--leading-normal: 1.5;
}
```

### 15.3 Shadows & Elevation

```css
:root {
	/* Elevation levels */
	--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
	--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
	--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);

	/* Drag elevation */
	--shadow-drag: 0 8px 16px rgba(0, 0, 0, 0.6);

	/* Focus ring */
	--ring-focus: 0 0 0 2px var(--colour-bg-app), 0 0 0 4px var(--colour-border-focus);
}
```

### 15.4 Transitions

```css
:root {
	/* Durations */
	--duration-fast: 100ms; /* Micro-interactions */
	--duration-normal: 200ms; /* Standard transitions */
	--duration-slow: 300ms; /* Complex animations */

	/* Easings */
	--ease-out: cubic-bezier(0, 0, 0.2, 1);
	--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

	/* Composed transitions */
	--transition-colors:
		color var(--duration-fast) var(--ease-out),
		background-color var(--duration-fast) var(--ease-out),
		border-color var(--duration-fast) var(--ease-out);
	--transition-transform: transform var(--duration-normal) var(--ease-out);
	--transition-shadow: box-shadow var(--duration-normal) var(--ease-out);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
	:root {
		--duration-fast: 0ms;
		--duration-normal: 0ms;
		--duration-slow: 0ms;
	}
}
```

---

## 16. References & Further Reading

### Research Sources Used

**Canvas & Spatial Design:**

- Lucid Design Blog: "Design for Canvas-Based Applications" — Direct manipulation patterns
- Bruno Scheufler: "Building Canvas-Based Web Applications" — Technical implementation

**Drag-and-Drop:**

- Nielsen Norman Group: "Drag-and-Drop: How to Design for Ease of Use" (2023)
- Pencil & Paper: "Drag & Drop UX Design Best Practices"
- Eleken: "Drag and Drop UI Examples and UX Tips"
- Smashing Magazine: "Drag-and-Drop UX Guidelines"
- VMware Clarity: "Drag and Drop for Design Systems"
- Salesforce UX: "4 Major Patterns for Accessible Drag and Drop"
- Cloudscape Design System: Drag-and-Drop Pattern

**Interaction States:**

- Nielsen Norman Group: "Button States: Communicate Interaction" (2025)
- Dynatrace Developer: Interaction States Documentation
- Cloud Four: "Designing Button States"
- LogRocket: "Designing Button States"

**Layout & Grids:**

- Carbon Design System: 2x Grid Overview
- designsystems.com: "Spacing, Grids, and Layouts"
- Smashing Magazine: "Building Better UI Designs With Layout Grids"
- Nielsen Norman Group: "Using Grids in Interface Designs" (2025)

**Drawers & Panels:**

- PatternFly: Drawer Design Guidelines
- Material UI: React Drawer Component
- Ant Design: Drawer Component
- Mobbin: Drawer UI Design Best Practices

**Toolbars:**

- W3C ARIA: Toolbar Pattern
- PatternFly: Toolbar Design Guidelines
- Microsoft: Toolbars Design Guidelines

**Svelte Ecosystem:**

- Svelte Flow: Official Documentation
- Svelvet: GitHub Repository & Documentation

---

_Document Version: 2.0_
_Last Updated: 2025-11-30_
_Next Review: After v0.2 implementation_
