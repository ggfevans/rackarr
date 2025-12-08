# CLAUDE.md — Rackarr

**Project:** Rackarr — Rack Layout Designer for Homelabbers
**Version:** 0.4.6

---

## v0.4.6 Changes

- **Schema fix**: Fixed u_height validation to allow 0.5U devices (was incorrectly requiring integers)
- The schema now allows heights from 0.5U to 50U in 0.5U increments as per spec

## v0.4.5 Changes

- **Toolbar polish**: Added `white-space: nowrap` to prevent button text wrapping
- **Tagline removed**: Removed tagline from toolbar to prevent overlap issues (description remains in Help panel)
- **File picker fix**: Improved browser compatibility for Load Layout dialog
  - Changed accept types to use MIME types for better cross-browser support
  - Added cancel event handling for file picker dialog
- **GitHub Actions fix**: Updated deploy workflow to use Node 22 and `npm install` for npm version compatibility

## v0.4.4 Changes

- **Docker build fix**: Changed Dockerfile to use `node:22-alpine` and `npm install --ignore-scripts` for npm lockfile compatibility

## v0.4.3 Changes

- **PDF Export**: Implemented PDF export functionality using jspdf
  - US Letter size (8.5x11") with rack centered
  - Auto landscape/portrait based on aspect ratio
  - 0.5" margins with proper scaling
- Added `exportAsPDF` function to export utilities
- PDF option now available in Export dialog

## v0.4.2 Changes

- **Toolbar responsiveness**: Fixed text overlap issues between tagline and toolbar buttons
- **Hamburger menu**: Added collapsible menu at narrow viewports (<1024px)
  - Logo becomes clickable menu trigger with hamburger icon
  - Left drawer slides in with grouped actions (File, Edit, View)
  - Theme toggle remains always visible for quick access
- **Layout fix**: Removed absolute positioning from toolbar center section for proper flexbox spacing
- **Breakpoint adjustments**: Tagline now hides at 1200px (was 900px) to prevent overlap
- **New components**: `IconMenu.svelte`, `ToolbarDrawer.svelte`
- Full keyboard/accessibility support (Escape to close, focus management, ARIA attributes)

## v0.4.1 Changes

- **Design token audit**: replaced hardcoded CSS values with design tokens throughout all components
- Added new tokens: `--space-1-5` (6px), `--font-size-2xs` (10px), `--font-size-2xl` (24px)
- Improved theme consistency and maintainability

## v0.4.0 Changes (BREAKING)

- **Removed v0.1/v0.2 legacy format support** - only `.rackarr.zip` (YAML) format supported
- Code cleanup: removed dead code, unused CSS tokens, redundant dependencies
- All features from v0.3.x preserved

## v0.3.x Features

- **Undo/Redo** with Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y)
- YAML folder-based `.rackarr.zip` archive format
- 11 device categories (+ shelf category)
- Device images (front/rear) embedded in archive
- Label/image display mode toggle (keyboard: `I`)
- Fixed device library sidebar (always visible)
- 10" and 19" rack width options
- Bundled export with metadata (ZIP containing image + metadata.json)
- Single-rack mode (one rack per project)
- Zod schema validation

## Planning Docs

Full planning documentation is in `docs/planning/`:

```
docs/planning/
├── spec-combined.md     → Technical specification (single source of truth)
├── roadmap.md           → Version planning and future features
└── CLAUDE-planning.md   → Full project instructions
```

**Read `docs/planning/spec-combined.md` for complete technical specification.**
**Read `docs/planning/CLAUDE-planning.md` for development instructions including scope guard.**

## Autonomous Mode

When given an overnight execution prompt:

- You have explicit permission to work without pausing between prompts
- Do NOT ask for review or confirmation mid-session
- Do NOT pause to summarise progress until complete
- Continue until: all prompts done, test failure after 2 attempts, or genuine ambiguity requiring human decision
- I will review asynchronously via git commits and session-report.md

**Stopping conditions (ONLY these):**

1. All prompts in current `prompt_plan.md` marked complete
2. Test failure you cannot resolve after 2 attempts
3. Ambiguity that genuinely requires human input (document in `blockers.md`)

If none of those conditions are met, proceed immediately to the next prompt.

---

## Quick Reference

### Tech Stack

- Svelte 5 with runes (`$state`, `$derived`, `$effect`)
- TypeScript strict mode
- Vitest + @testing-library/svelte + Playwright
- CSS custom properties (design tokens in `src/lib/styles/tokens.css`)
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
npm run lint         # ESLint check
```

### Keyboard Shortcuts

| Key            | Action                  |
| -------------- | ----------------------- |
| `Ctrl+Z`       | Undo                    |
| `Ctrl+Shift+Z` | Redo                    |
| `Ctrl+Y`       | Redo (alternative)      |
| `Ctrl+S`       | Save layout             |
| `Ctrl+O`       | Load layout             |
| `Ctrl+E`       | Export                  |
| `I`            | Toggle display mode     |
| `F`            | Fit all                 |
| `Delete`       | Delete selection        |
| `?`            | Show help               |
| `Escape`       | Clear selection / close |
| `↑↓`           | Move device in rack     |

---

## Repository

| Location  | URL                                              |
| --------- | ------------------------------------------------ |
| Live Demo | https://ggfevans.github.io/rackarr/              |
| Primary   | https://git.falcon-wahoe.ts.net/ggfevans/rackarr |
| Mirror    | https://github.com/ggfevans/rackarr              |

## Deployment

GitHub Pages deployment is automated via GitHub Actions on push to `main`.

**Manual deploy:** Push to GitHub mirror triggers deployment:

```bash
git push github main
```

**Analytics:** GoatCounter at `rackarr.goatcounter.com` (privacy-focused, no cookies)
