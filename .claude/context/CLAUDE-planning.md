---
created: 2025-11-27T02:54
updated: 2025-11-27T13:47
---

# CLAUDE.md — Rackarr Project Instructions

**Project:** Rackarr — Rack Layout Designer for Homelabbers  
**Version:** 0.1.0  
**Methodology:** Harper Reed LLM Codegen (TDD)

---

## Identity

You are assisting with **Rackarr**, a lightweight, FOSS, web-based rack layout designer. You are working with a developer who uses TDD and prefers clear, incremental progress.

**Reference Documents:**

- `spec.md` — Complete technical specification (the source of truth)
- `prompt_plan.md` — Sequenced implementation prompts
- `todo.md` — Checkable progress tracker

---

## Svelte MCP Server

You have access to the **Svelte MCP server** with comprehensive Svelte 5 and SvelteKit documentation.

### Available MCP Tools

#### 1. `list-sections`

Use this **FIRST** to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.

**When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.**

#### 2. `get-documentation`

Retrieves full documentation content for specific sections. Accepts single or multiple sections.

**After calling `list-sections`, you MUST analyze the returned documentation sections (especially the `use_cases` field) and then use `get-documentation` to fetch ALL documentation sections relevant to the user's task.**

#### 3. `svelte-autofixer`

Analyzes Svelte code and returns issues and suggestions.

**You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.**

#### 4. `playground-link`

Generates a Svelte Playground link with the provided code.

**After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.**

---

## Tech Stack

| Component   | Technology                                                |
| ----------- | --------------------------------------------------------- |
| Framework   | **Svelte 5** with runes (`$state`, `$derived`, `$effect`) |
| Build       | Vite                                                      |
| Language    | TypeScript (strict mode)                                  |
| Testing     | Vitest + @testing-library/svelte                          |
| E2E Testing | Playwright                                                |
| Linting     | ESLint + Prettier                                         |
| Pre-commit  | Husky + lint-staged                                       |
| Styling     | CSS custom properties                                     |
| Rendering   | SVG                                                       |
| Deployment  | Static files (nginx/Docker)                               |

---

## Code Style

### Svelte 5 Runes (CRITICAL)

This project uses **Svelte 5 runes**, NOT the legacy Svelte 4 store API.

```svelte
<!-- ✅ CORRECT: Svelte 5 runes -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('count changed:', count);
  });
</script>

<!-- ❌ WRONG: Svelte 4 stores -->
<script lang="ts">
  import { writable, derived } from 'svelte/store';
  const count = writable(0);
</script>
```

### Store Files

Store files use `.svelte.ts` extension for runes support:

```typescript
// src/lib/stores/layout.svelte.ts
let layout = $state<Layout>(createLayout('Untitled'));
let isDirty = $state(false);

let racks = $derived(layout.racks);
let deviceLibrary = $derived(layout.deviceLibrary);

export function getLayoutStore() {
	return {
		get layout() {
			return layout;
		},
		get isDirty() {
			return isDirty;
		},
		get racks() {
			return racks;
		}
		// ... actions
	};
}
```

### TypeScript

- Strict mode enabled
- Explicit types for function parameters and returns
- Interfaces over type aliases for objects
- Use `unknown` over `any`

```typescript
// ✅ CORRECT
function createDevice(params: CreateDeviceParams): Device {
	// ...
}

// ❌ WRONG
function createDevice(params: any) {
	// ...
}
```

### CSS

- Use CSS custom properties from `app.css`
- Theme via `[data-theme="dark"]` and `[data-theme="light"]` selectors
- No CSS-in-JS or Tailwind

```css
/* ✅ CORRECT */
.rack {
	background: var(--colour-rack-interior);
	height: calc(var(--u-height) * var(--rack-height));
}

/* ❌ WRONG */
.rack {
	background: #2d2d2d;
	height: 396px;
}
```

### File Organization

```
src/
  lib/
    components/     # Svelte components (.svelte)
    stores/         # Svelte 5 stores (.svelte.ts)
    types/          # TypeScript types and interfaces
    utils/          # Pure utility functions
    data/           # Static data (starter library)
  tests/            # Test files (.test.ts)
  app.css           # Global styles + CSS custom properties
  App.svelte        # Root component
  main.ts           # Entry point
```

---

## Testing (TDD)

### Test-Driven Development Protocol

**For every feature:**

1. Write tests FIRST
2. Run tests (they should fail)
3. Implement minimum code to pass
4. Refactor if needed
5. Verify all tests pass
6. Commit

### Test File Naming

```
src/lib/utils/device.ts       → src/tests/device.test.ts
src/lib/components/Rack.svelte → src/tests/Rack.test.ts
src/lib/stores/layout.svelte.ts → src/tests/layout-store.test.ts
```

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';

describe('createDevice', () => {
	it('generates UUID when id not provided', () => {
		const device = createDevice({ name: 'Test', height: 1, category: 'server' });
		expect(device.id).toMatch(/^[0-9a-f-]{36}$/);
	});

	it('applies default colour from category', () => {
		const device = createDevice({ name: 'Test', height: 1, category: 'server' });
		expect(device.colour).toBe('#4A90D9');
	});
});
```

### Running Tests

```bash
npm run test          # Watch mode
npm run test:run      # Single run (CI)
npm run test:e2e      # Playwright E2E
```

---

## Git Workflow

### Commit Messages

Follow conventional commits matching the prompt_plan.md:

```
feat(types): add core TypeScript type definitions
feat(device): add device utility functions with validation
feat(store): add layout store with Svelte 5 runes
chore: project scaffolding with Svelte 5, Vite, and testing infrastructure
test(e2e): comprehensive E2E test suite
docs: add README, CHANGELOG, LICENSE, CONTRIBUTING
```

### Pre-commit Hooks

Commits are blocked unless:

- ESLint passes
- Prettier formatting applied
- All tests pass

```bash
# If pre-commit fails
npm run lint:fix      # Fix linting issues
npm run format        # Fix formatting
npm run test:run      # Run tests
```

### One Logical Change Per Commit

Each prompt in `prompt_plan.md` = one commit. Don't bundle multiple prompts.

---

## Prompt Plan Execution

### Workflow

1. Read the next incomplete prompt from `prompt_plan.md`
2. Write tests first (TDD)
3. Implement to pass tests
4. Run full test suite
5. Commit with specified message
6. Mark prompt complete in `prompt_plan.md`
7. Check off tasks in `todo.md`
8. Pause for review

### Marking Complete

In `prompt_plan.md`:

```markdown
**Status:** ✅ Complete <!-- was: ⬜ Not started -->
```

In `todo.md`:

```markdown
- [x] Implement generateId() <!-- was: - [ ] -->
```

---

## Key Domain Concepts

### U Position

- U1 is at the **bottom** of the rack
- Position refers to the **bottom U** occupied by a device
- A 2U device at position 5 occupies U5 and U6

### Collision Detection

- Devices cannot overlap
- Device must fit within rack height
- Position must be ≥ 1

### Layout Structure

```typescript
interface Layout {
	version: string; // "1.0"
	name: string;
	created: string; // ISO date
	modified: string; // ISO date
	settings: { theme: 'dark' | 'light' };
	deviceLibrary: Device[]; // All available devices
	racks: Rack[]; // Racks with placed devices
}
```

### PlacedDevice vs Device

- `Device` is in the library (template)
- `PlacedDevice` is a reference placed in a rack
- Same device can be placed multiple times

```typescript
interface Device {
	id: string;
	name: string;
	height: number;
	colour: string;
	category: DeviceCategory;
	notes?: string;
}

interface PlacedDevice {
	libraryId: string; // References Device.id
	position: number; // Bottom U
}
```

---

## Don'ts

- ❌ Don't use Svelte 4 stores (`writable`, `derived` from `svelte/store`)
- ❌ Don't use `any` type
- ❌ Don't skip tests
- ❌ Don't make changes outside the current prompt's scope
- ❌ Don't delete tests without explicit permission
- ❌ Don't assume — ask for clarification
- ❌ Don't bundle multiple prompts into one commit
- ❌ Don't use CSS magic numbers (use custom properties)
- ❌ Don't forget to run `svelte-autofixer` before finalizing Svelte code

---

## Do's

- ✅ Always check `spec.md` for requirements
- ✅ Always write tests first (TDD)
- ✅ Always use Svelte 5 runes
- ✅ Always run `svelte-autofixer` on Svelte code
- ✅ Always use `list-sections` before answering Svelte questions
- ✅ Always mark prompts complete after successful commit
- ✅ Always pause for review after each prompt
- ✅ Always use TypeScript strict mode
- ✅ Always use CSS custom properties for theming
- ✅ Always add ARIA labels to icon-only buttons

---

## Quick Reference

### CSS Custom Properties (from spec)

```css
:root {
	--u-height: 22px;
	--rack-width: 220px;
	--toolbar-height: 52px;
	--drawer-width: 300px;
	--font-size-device: 13px;
}

[data-theme='dark'] {
	--colour-bg: #1a1a1a;
	--colour-text: #ffffff;
	--colour-rack-interior: #2d2d2d;
	--colour-rack-rail: #404040;
	--colour-selection: #0066ff;
	--colour-invalid: #ff4444;
}
```

### Category Colours

```typescript
const CATEGORY_COLOURS: Record<DeviceCategory, string> = {
	server: '#4A90D9',
	network: '#7B68EE',
	'patch-panel': '#708090',
	power: '#DC143C',
	storage: '#228B22',
	kvm: '#FF8C00',
	'av-media': '#9932CC',
	cooling: '#00CED1',
	blank: '#2F4F4F',
	other: '#808080'
};
```

### Keyboard Shortcuts

| Key                | Action                  |
| ------------------ | ----------------------- |
| Delete / Backspace | Delete selected item    |
| ↑ / ↓              | Move selected device 1U |
| ← / →              | Reorder selected rack   |
| Escape             | Deselect, close drawers |
| D                  | Toggle device palette   |
| Ctrl/Cmd + S       | Save layout             |
| Ctrl/Cmd + O       | Load layout             |
| Ctrl/Cmd + E       | Export dialog           |
| ?                  | Keyboard shortcuts help |

---

## Repository

| Location | URL                                           |
| -------- | --------------------------------------------- |
| Primary  | https://git.falcon-wahoo.ts.net/gvns/rackarr/ |
| Mirror   | https://github.com/ggfevans/rackarr           |

---

_Last Updated: 2025-11-27_
