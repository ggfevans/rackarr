# CLAUDE.md — Rackarr

**Project:** Rackarr — Rack Layout Designer for Homelabbers
**Version:** 0.1.0

---

## Planning Docs

Full planning documentation is symlinked in `.claude/context/`:

```
.claude/context/
├── spec.md              → Technical specification
├── prompt_plan.md       → Implementation prompts
├── todo.md              → Progress checklist
├── roadmap.md           → Version planning
└── CLAUDE-planning.md   → Full project instructions
```

**Read `.claude/context/CLAUDE-planning.md` for complete instructions including scope guard.**

## Autonomous Mode

When given an overnight execution prompt:

- You have explicit permission to work without pausing between prompts
- Do NOT ask for review or confirmation mid-session
- Do NOT pause to summarise progress until complete
- Continue until: all prompts done, test failure after 2 attempts, or genuine ambiguity requiring human decision
- I will review asynchronously via git commits and session-report.md

**Stopping conditions (ONLY these):**

1. All prompts in `prompt_plan.md` marked complete
2. Test failure you cannot resolve after 2 attempts
3. Ambiguity that genuinely requires human input (document in `blockers.md`)

If none of those conditions are met, proceed immediately to the next prompt.

---

## Quick Reference

### Tech Stack

- Svelte 5 with runes (`$state`, `$derived`, `$effect`)
- TypeScript strict mode
- Vitest + @testing-library/svelte + Playwright
- CSS custom properties (no Tailwind)
- SVG rendering

### Svelte 5 Runes (Required)

```svelte
<!-- ✅ CORRECT -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<!-- ❌ WRONG: Svelte 4 stores -->
<script lang="ts">
  import { writable } from 'svelte/store';
</script>
```

### TDD Protocol

1. Write tests FIRST
2. Run tests (should fail)
3. Implement to pass
4. Commit

### Commands

```bash
npm run dev          # Dev server
npm run test         # Unit tests (watch)
npm run test:run     # Unit tests (CI)
npm run test:e2e     # Playwright E2E
npm run build        # Production build
```

---

## Repository

| Location | URL                                              |
| -------- | ------------------------------------------------ |
| Primary  | https://git.falcon-wahoe.ts.net/ggfevans/rackarr |
| Mirror   | https://github.com/ggfevans/rackarr              |

- # Claude Code Task: Codebase Recon + Apply v0.2/v0.3 Spec Updates

### Part 1: Codebase State Verification

Before generating the v0.2 prompt_plan, verify the current codebase state.

#### 1.1 Check Core File Structure

Verify these directories/files exist:

```
src/lib/
├── components/     # Rack.svelte, Canvas.svelte, DevicePalette.svelte, etc.
├── stores/         # layout.ts, theme.ts, etc.
├── utils/          # dragdrop.ts, export.ts, etc.
├── types/          # index.ts or similar
└── data/           # starter device library
```

#### 1.2 Verify Key Utilities

Check current implementation of coordinate handling in drag-drop:

- Where is `calculateDropPosition()` defined?
- Where is `getDropFeedback()` defined?
- How is zoom scale currently passed/used?
- Are there any existing `screenToSVG` or coordinate transform utilities?

#### 1.3 Check Canvas/Zoom Implementation

- How is zoom currently implemented? (CSS transform? SVG viewBox?)
- What element receives the zoom transform?
- Is there existing pan functionality?

#### 1.4 Check for Unexpected Changes

Run `git status` and `git diff --stat HEAD~5` to see recent changes.

#### 1.5 Verify Test Structure

- Where are component tests?
- What test patterns are established?
- Any existing drag-drop tests?

#### 1.6 Check Migration Script Status

- Has `migrate-to-symlinks.sh` been run?
- Is there a `.claude/context/` directory with planning docs?

---

### Part 2: Apply Spec Updates

The following spec updates were agreed in planning but didn't persist to the vault. Apply them to the **repository files** (not Obsidian).

#### 2.1 Update v0.2 Spec: Add Section 4 (Technical Implementation)

**File:** `.claude/context/versions/v0.2-spec.md` (or wherever the v0.2 spec lives in repo)

Insert this new section **BEFORE** the "Out of Scope" section. After insertion, renumber subsequent sections (Out of Scope becomes 5, Migration Notes becomes 6, Success Criteria becomes 7, Related Documents becomes 8).

````markdown
---

## 4. Technical Implementation

### 4.1 Zoom/Pan Library: panzoom

**Decision:** Adopt [panzoom](https://github.com/anvaka/panzoom) (~3KB) for canvas zoom and pan.

**Rationale:**

- Provides smooth momentum-based animations
- Handles bounds constraints
- Framework-agnostic, works with SVG
- Eliminates need for custom zoom/pan code
- Enables future continuous scroll-wheel zoom

**Integration:**

```svelte
<script>
	import panzoom from 'panzoom';
	import { onMount } from 'svelte';

	let panZoomTarget: SVGGElement;
	let instance: ReturnType<typeof panzoom>;

	onMount(() => {
		instance = panzoom(panZoomTarget, {
			bounds: true,
			maxZoom: 2,
			minZoom: 0.25,
			smoothScroll: false // We control zoom via buttons
		});
		return () => instance.dispose();
	});

	function fitAll() {
		const { zoom, panX, panY } = calculateFitAll();
		instance.zoomAbs(panX, panY, zoom);
	}
</script>

<svg class="canvas">
	<g bind:this={panZoomTarget}>
		{#each racks as rack}
			<Rack {rack} />
		{/each}
	</g>
</svg>
```
````

**Canvas Structure Change:**

```
Before (v0.1):
<svg> → <Rack /> <Rack /> ...

After (v0.2):
<svg> → <g panzoom-target> → <Rack /> <Rack /> ...
```

### 4.2 Coordinate System: getScreenCTM()

**Decision:** Refactor coordinate transformation to use `getScreenCTM().inverse()`.

**Rationale:**

- Current approach manually compensates for zoom scale
- Breaks when pan (translate) transforms are added
- `getScreenCTM()` automatically accounts for all CSS transforms
- More robust across nested SVG structures

**Implementation:**

```typescript
/**
 * Convert screen coordinates to SVG user space coordinates.
 * Accounts for all transforms (zoom, pan, CSS) automatically.
 */
export function screenToSVG(
	svg: SVGSVGElement,
	clientX: number,
	clientY: number
): { x: number; y: number } {
	const pt = svg.createSVGPoint();
	pt.x = clientX;
	pt.y = clientY;
	const transformed = pt.matrixTransform(svg.getScreenCTM()!.inverse());
	return { x: transformed.x, y: transformed.y };
}

/**
 * Convert SVG user space coordinates to screen coordinates.
 */
export function svgToScreen(
	svg: SVGSVGElement,
	x: number,
	y: number
): { clientX: number; clientY: number } {
	const pt = svg.createSVGPoint();
	pt.x = x;
	pt.y = y;
	const transformed = pt.matrixTransform(svg.getScreenCTM()!);
	return { clientX: transformed.x, clientY: transformed.y };
}
```

**Migration:**

- Replace all `getBoundingClientRect()` + manual zoom compensation
- Remove `zoomScale` parameter from coordinate calculation functions
- Update drag-drop handlers to use new utilities

### 4.3 Dependency Addition

Add to `package.json`:

```json
{
	"dependencies": {
		"panzoom": "^9.4.3"
	}
}
```

````

#### 2.2 Update v0.2 Spec: Add Success Criteria Items

In the Success Criteria section, add these items:

```markdown
- [ ] panzoom library integrated for canvas zoom/pan
- [ ] Coordinate handling uses getScreenCTM() for transform-aware positioning
- [ ] Drag-and-drop works correctly at all zoom levels and pan positions
````

#### 2.3 Update v0.3 Spec: Add Section 11 (Technical Dependencies)

**File:** `.claude/context/versions/v0.3-spec.md` (or wherever v0.3 spec lives)

Insert this new section **BEFORE** the "Testing Requirements" section (which should become Section 12). Renumber all subsequent sections.

````markdown
---

## 11. Technical Dependencies

### 11.1 Gesture Library: Hammer.js

**Decision:** Adopt [@egjs/hammerjs](https://github.com/naver/hammer.js) (~7KB gzipped) for mobile gesture handling.

**Rationale:**

- Battle-tested cross-browser touch handling
- Unified API for tap, pinch, pan, swipe
- Handles edge cases (multi-touch, gesture conflicts)
- Active maintenance (@egjs fork)
- Avoids reinventing cross-browser gesture code

**Integration:**

```typescript
import Hammer from '@egjs/hammerjs';

function setupCanvasGestures(canvasElement: HTMLElement) {
	const hammer = new Hammer(canvasElement);

	// Enable pinch (disabled by default)
	hammer.get('pinch').set({ enable: true });

	// Configure pan for rack navigation
	hammer.get('pan').set({
		direction: Hammer.DIRECTION_HORIZONTAL,
		threshold: 30 // Prevent accidental triggers
	});

	hammer.on('tap', handleTap);
	hammer.on('pinch', handlePinch);
	hammer.on('panleft panright', handleSwipe);

	return () => hammer.destroy();
}
```
````

**Gesture Mapping:**

| Hammer Event         | Rackarr Action                             |
| -------------------- | ------------------------------------------ |
| `tap`                | Place device, select device, select U slot |
| `press` (long-press) | Enable drag mode for device                |
| `pinch`              | Zoom canvas                                |
| `panleft`/`panright` | Navigate between racks                     |

### 11.2 Coordinate Handling with v0.2 panzoom

Mobile gestures integrate with panzoom (added in v0.2):

```typescript
// Pinch-to-zoom via Hammer.js → panzoom
hammer.on('pinch', (e) => {
	const scale = e.scale;
	const center = { x: e.center.x, y: e.center.y };
	panzoomInstance.zoomTo(center.x, center.y, scale);
});
```

**Note:** Disable panzoom's built-in touch handling to avoid conflicts:

```typescript
panzoom(element, {
	// ... other options
	smoothScroll: false,
	zoomDoubleClickSpeed: 1, // Disable double-click zoom
	beforeMouseDown: () => false, // Disable mouse drag (we use buttons)
	beforeTouch: () => false // We handle touch via Hammer.js
});
```

### 11.3 Dependency Addition

Add to `package.json`:

```json
{
	"dependencies": {
		"@egjs/hammerjs": "^2.0.17"
	}
}
```

````

#### 2.4 Update v0.3 Spec: Add Success Criteria Items

In the Success Criteria section, add:

```markdown
- [ ] Hammer.js integrated for gesture handling
- [ ] Pinch-to-zoom integrates with panzoom smoothly
- [ ] No gesture conflicts between Hammer.js and panzoom
````

#### 2.5 Update Roadmap: Add Backlog Items

**File:** `.claude/context/roadmap.md` (or wherever roadmap lives)

Add these rows to the Backlog table:

```markdown
| 0U vertical PDU support | Rail-mounted PDUs (left/right rails), NetBox-style | Research |
| Svelvet Drawer pattern | Component pattern for drag-from-toolbar UX (reference: Svelvet library) | Research |
```

Add these entries to the Changelog table:

```markdown
| 2025-11-29 | Added panzoom library to v0.2 scope (smooth zoom/pan) |
| 2025-11-29 | Added 0U PDU support and Svelvet Drawer pattern to backlog |
| 2025-11-29 | Added Hammer.js to v0.3 scope (mobile gestures) |
```

---

### Part 3: Report Format

After completing Parts 1 and 2, respond with:

1. **File Structure:** Confirmed / Discrepancies found
2. **Coordinate Utilities:** Current location and implementation summary
3. **Zoom Implementation:** Current approach
4. **Git Status:** Clean / Changes found
5. **Test Structure:** Location and patterns
6. **Migration Status:** Script run? Context dir exists?
7. **Spec Updates Applied:** List files modified
8. **Flags for Planning:** Anything that would affect prompt_plan generation
