# CLAUDE.md — Rackarr

**Project:** Rackarr — Rack Layout Designer for Homelabbers
**Version:** 0.3.0

---

## v0.3.0 Features

- 11 device categories (+ shelf category)
- Save/load as ZIP archive (`.rackarr.zip`) with embedded images
- Device images (front/rear) stored in archive
- Label/image display mode toggle (keyboard: `I`)
- Fixed device library sidebar (always visible)
- 10" and 19" rack width options
- Bundled export with metadata (ZIP containing image + metadata.json)
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

| Key      | Action                  |
| -------- | ----------------------- |
| `Ctrl+S` | Save layout             |
| `Ctrl+O` | Load layout             |
| `Ctrl+E` | Export                  |
| `I`      | Toggle display mode     |
| `F`      | Fit all                 |
| `Delete` | Delete selection        |
| `?`      | Show help               |
| `Escape` | Clear selection / close |
| `↑↓`     | Move device in rack     |

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
