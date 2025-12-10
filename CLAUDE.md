# CLAUDE.md — Rackarr

**Project:** Rackarr — Rack Layout Designer for Homelabbers
**Version:** 0.5.0

---

## Versioning Policy

We follow [Cargo semver](https://doc.rust-lang.org/cargo/reference/semver.html) conventions:

**Pre-1.0 semantics (current):**

- `0.MINOR.patch` — minor version acts like major (breaking changes allowed)
- `0.minor.PATCH` — bug fixes and small improvements only
- Pre-1.0 means "API unstable, in active development"

**When to bump versions:**

| Change Type        | Version Bump | Example                                                    |
| ------------------ | ------------ | ---------------------------------------------------------- |
| Feature milestone  | `0.X.0`      | New major capability (e.g., multi-rack, new export format) |
| Bug fixes / polish | `0.x.Y`      | Only when releasing to users, not every commit             |
| Breaking changes   | `0.X.0`      | Format changes, removed features                           |

**Workflow:**

- **Don't tag every commit** — accumulate changes on `main`
- **Tag releases** when there's a coherent set of changes worth announcing
- **Use pre-release tags** for development checkpoints: `0.5.0-alpha.1`, `0.5.0-beta.1`
- **Batch related fixes** into single patch releases

**Current milestones:**

- `0.5.x` — Unified type system, NetBox-compatible data model
- `1.0.0` — Production-ready, stable API

---

## Recent Changes

### v0.5.0 (Current)

**v0.5.0** — Type system consolidation

- Unified on storage types only (`DeviceType`, `PlacedDevice` with `device_type`)
- Removed deprecated UI types (`Device`, `UIPlacedDevice` with `libraryId`)
- Removed adapter layer and deprecated store functions
- NetBox-compatible field naming (snake_case: `u_height`, `device_type`, `form_factor`)
- Cleaned up legacy comments throughout codebase
- Updated documentation (SPEC.md, ROADMAP.md)

### v0.4.10

**v0.4.10** — View reset on rack resize, toolbar polish

- Auto-reset view when resizing rack height in EditPanel
- View now centers on rack after height changes (preset buttons or numeric input)
- Toolbar brand click only opens hamburger menu when in hamburger mode (< 1024px)
- Brand area styled as button with border only in hamburger mode

### v0.4.9

**v0.4.9** — Airflow visualization

- Edge stripe + arrow airflow indicators (4 types: passive, front-to-rear, rear-to-front, side-to-rear)
- Conflict detection with orange border highlighting
- Toggle with 'A' key or toolbar button
- Airflow indicators in image/PDF exports
- Fixed multi-device selection bug

### v0.4.x

**v0.4.8** — Toolbar drawer fix, z-index tokens

- Moved toolbar drawer to right side (was overlapping device library)
- Added z-index design tokens (`--z-sidebar`, `--z-drawer`, `--z-modal`, `--z-toast`)

**v0.4.6–v0.4.7** — Load/save fixes

- Reset view to center rack after loading layout
- Fixed u_height schema to allow 0.5U devices

**v0.4.3–v0.4.5** — PDF export, toolbar polish

- PDF export (US Letter, auto orientation)
- Hamburger menu for narrow viewports
- File picker browser compatibility fixes

**v0.4.1–v0.4.2** — Design token audit, responsive toolbar

- Replaced hardcoded CSS with design tokens
- Added responsive hamburger menu

### v0.4.0 (BREAKING)

- Removed v0.1/v0.2 legacy format support — only `.rackarr.zip` (YAML) format
- Code cleanup: removed dead code, unused tokens, redundant dependencies

### v0.3.x Features

- Undo/Redo with Ctrl+Z / Ctrl+Shift+Z
- YAML folder-based `.rackarr.zip` archive format
- 11 device categories, device images (front/rear)
- Label/image display mode toggle
- 10" and 19" rack width options
- Bundled export with metadata
- Single-rack mode, Zod schema validation

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

## Development Philosophy

**Greenfield approach:** Do not use migration or legacy support concepts in this project. Implement features as if they are the first and only implementation.

---

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
