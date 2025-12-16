# Rackarr Brand & Design System

**Version:** 0.6.0
**Last Updated:** 2025-12-15
**Source:** Derived from `01-PROJECTS/rackarr/brand-guide.md` with accessibility improvements

---

## Design Philosophy

**Geismar-style geometric minimalism** — strip to pure geometry, timeless, works at any size. No tricks, no hidden meanings, just honest form.

The visual identity is rooted in the **Dracula colour scheme** but adapted for data visualisation needs. Dracula accents are reserved for small UI elements; muted variants are used for large fills.

---

## Conventions

**Spelling:** Use British/Canadian English throughout:

- `colour` not `color`
- `grey` not `gray`
- `centre` not `center`
- `organisation` not `organization`
- `visualisation` not `visualization`

CSS custom properties use `--colour-*` prefix for consistency with the codebase.

---

## Colour System Overview

Rackarr uses a **three-tier colour hierarchy**:

| Tier                | Purpose              | Saturation  | Example Use                            |
| ------------------- | -------------------- | ----------- | -------------------------------------- |
| **Dracula Accents** | Small UI highlights  | High (neon) | Focus rings, icons, links, button text |
| **Muted Variants**  | Large area fills     | Medium      | Device backgrounds, charts, data viz   |
| **Neutral/Comment** | Backgrounds, passive | Low         | Surfaces, borders, muted text          |

**Rule:** Never use Dracula accents (`#8BE9FD`, `#50FA7B`, etc.) as backgrounds for text. They're designed for syntax highlighting, not fills.

---

## Core Palette: Dracula (Dark Theme)

### Backgrounds

| Token                 | Hex       | Usage                                 |
| --------------------- | --------- | ------------------------------------- |
| `--colour-bg-darkest` | `#191A21` | Canvas, deepest background            |
| `--colour-bg-darker`  | `#21222C` | Page background, sidebars             |
| `--colour-bg`         | `#282A36` | Card/panel background                 |
| `--colour-bg-light`   | `#343746` | Elevated surfaces                     |
| `--colour-bg-lighter` | `#424450` | Hover states                          |
| `--colour-selection`  | `#44475A` | Selection highlight (background only) |

### Text

| Token                    | Hex       | Contrast | Usage                            |
| ------------------------ | --------- | -------- | -------------------------------- |
| `--colour-text`          | `#F8F8F2` | 11.6:1   | Primary text                     |
| `--colour-text-muted`    | `#9A9A9A` | 5.1:1    | Secondary text (WCAG AA)         |
| `--colour-text-disabled` | `#6272A4` | 3.3:1    | Disabled only (exempt from WCAG) |

**Note:** Original Dracula comment (`#6272A4`) fails WCAG AA at 3.3:1. Use `#9A9A9A` for muted text that must be readable.

### Accent Colours (Small UI Only)

| Token             | Hex       | Usage                                          |
| ----------------- | --------- | ---------------------------------------------- |
| `--colour-cyan`   | `#8BE9FD` | Links, info icons, primary CTAs                |
| `--colour-purple` | `#BD93F9` | Network devices (data only)                    |
| `--colour-pink`   | `#FF79C6` | **Selection, focus rings, interactive states** |
| `--colour-green`  | `#50FA7B` | Success icons, valid states                    |
| `--colour-orange` | `#FFB86C` | Warning icons                                  |
| `--colour-red`    | `#FF5555` | Error icons, destructive actions               |
| `--colour-yellow` | `#F1FA8C` | Caution highlights                             |

### Semantic Tokens

```css
:root {
	/* Interactive (changed: selection now uses pink) */
	--colour-selection: var(--colour-pink);
	--colour-focus-ring: var(--colour-pink);
	--colour-link: var(--colour-cyan);
	--colour-link-hover: var(--colour-pink);

	/* Feedback */
	--colour-success: var(--colour-green);
	--colour-warning: var(--colour-orange);
	--colour-error: var(--colour-red);
	--colour-info: var(--colour-cyan);
}
```

---

## Device Visualization Palette (Muted Dracula)

For device backgrounds and data visualization, use these muted variants. They maintain Dracula hue identity but are darkened/desaturated for:

- WCAG AA contrast with white text (4.5:1 minimum)
- Reduced visual fatigue at scale
- Professional appearance

### Active Device Categories

| Category   | Muted Colour | Original  | Contrast | Rationale                              |
| ---------- | ------------ | --------- | -------- | -------------------------------------- |
| `server`   | `#4A7A8A`    | `#8BE9FD` | 4.8:1    | Core infrastructure — teal/cyan family |
| `network`  | `#7B6BA8`    | `#BD93F9` | 4.6:1    | Primary accent — purple family         |
| `storage`  | `#3D7A4A`    | `#50FA7B` | 5.2:1    | Data/growth — green family             |
| `power`    | `#A84A4A`    | `#FF5555` | 5.1:1    | Critical/energy — red family           |
| `kvm`      | `#A87A4A`    | `#FFB86C` | 4.5:1    | Control/interactive — orange family    |
| `av-media` | `#A85A7A`    | `#FF79C6` | 4.7:1    | Media/entertainment — pink family      |
| `cooling`  | `#8A8A4A`    | `#F1FA8C` | 4.6:1    | Environmental — yellow/olive family    |

### Passive Device Categories

| Category           | Colour    | Contrast | Rationale                       |
| ------------------ | --------- | -------- | ------------------------------- |
| `shelf`            | `#6272A4` | 5.7:1    | Utility — fades into background |
| `blank`            | `#44475A` | 8.2:1    | Empty space — nearly invisible  |
| `cable-management` | `#6272A4` | 5.7:1    | Utility                         |
| `patch-panel`      | `#6272A4` | 5.7:1    | Passive infrastructure          |
| `other`            | `#6272A4` | 5.7:1    | Generic fallback                |

### Implementation

```typescript
// src/lib/types/constants.ts
export const CATEGORY_COLOURS: Record<DeviceCategory, string> = {
	// Active — Muted Dracula
	server: '#4A7A8A',
	network: '#7B6BA8',
	storage: '#3D7A4A',
	power: '#A84A4A',
	kvm: '#A87A4A',
	'av-media': '#A85A7A',
	cooling: '#8A8A4A',

	// Passive — Comment/Selection tones
	shelf: '#6272A4',
	blank: '#44475A',
	'cable-management': '#6272A4',
	'patch-panel': '#6272A4',
	other: '#6272A4'
} as const;
```

### HSL Derivation Method

To create muted variants from Dracula accents:

1. Extract HSL: `#8BE9FD` → `hsl(187, 95%, 77%)`
2. Reduce saturation to 25-35%
3. Reduce lightness to 38-45%
4. Verify contrast ≥ 4.5:1 against `#FAFAFA`
5. Result: `hsl(187, 30%, 42%)` → `#4A7A8A`

---

## Core Palette: Alucard (Light Theme)

### Backgrounds

| Token                 | Hex       | Usage                   |
| --------------------- | --------- | ----------------------- |
| `--colour-bg-darkest` | `#BCBAB3` | Deepest (inverted)      |
| `--colour-bg-darker`  | `#CECCC0` | Page background         |
| `--colour-bg`         | `#FFFBEB` | Card/panel — warm cream |
| `--colour-bg-light`   | `#DEDCCF` | Elevated surfaces       |
| `--colour-bg-lighter` | `#ECE9DF` | Hover states            |
| `--colour-floating`   | `#EFEDDC` | Floating elements       |
| `--colour-selection`  | `#CFCFDE` | Selection background    |

### Text

| Token                    | Hex       | Contrast | Usage                    |
| ------------------------ | --------- | -------- | ------------------------ |
| `--colour-text`          | `#1F1F1F` | 18.5:1   | Primary text             |
| `--colour-text-muted`    | `#5C5647` | 6.8:1    | Secondary text (WCAG AA) |
| `--colour-text-disabled` | `#6C664B` | 5.0:1    | Disabled/hint text       |

### Accent Colours (Alucard variants)

| Token             | Hex       | Usage            |
| ----------------- | --------- | ---------------- |
| `--colour-cyan`   | `#036A96` | Links, info      |
| `--colour-purple` | `#644AC9` | Network devices  |
| `--colour-pink`   | `#A3144D` | Selection, focus |
| `--colour-green`  | `#14710A` | Success          |
| `--colour-orange` | `#A34D14` | Warnings         |
| `--colour-red`    | `#CB3A2A` | Errors           |
| `--colour-yellow` | `#846E15` | Caution          |

### Device Colours (Light Theme)

| Category   | Light Colour | Contrast |
| ---------- | ------------ | -------- |
| `server`   | `#5A8A9A`    | 4.6:1    |
| `network`  | `#8B7BB8`    | 4.5:1    |
| `storage`  | `#4D8A5A`    | 4.8:1    |
| `power`    | `#B85A5A`    | 4.7:1    |
| `kvm`      | `#B88A5A`    | 4.5:1    |
| `av-media` | `#B86A8A`    | 4.6:1    |
| `cooling`  | `#9A9A5A`    | 4.5:1    |

---

## Colour Usage Rules (Strict Hierarchy)

### When to Use Each Tier

| Element                 | Colour Tier             | Examples                     |
| ----------------------- | ----------------------- | ---------------------------- |
| Focus rings, outlines   | Dracula Accent (Pink)   | Button focus, input focus    |
| Icons (16-24px)         | Dracula Accent          | Category icons, action icons |
| Links, interactive text | Dracula Accent (Cyan)   | Hyperlinks, clickable text   |
| Button backgrounds      | Dracula Accent (subtle) | Primary buttons only         |
| Device fills            | **Muted Variant**       | RackDevice backgrounds       |
| Chart areas             | **Muted Variant**       | Data visualization           |
| Toast/badge backgrounds | Muted or Functional     | Feedback states              |
| Page backgrounds        | Neutral                 | Sidebar, canvas, panels      |
| Borders                 | Neutral (Selection)     | Card borders, dividers       |
| Disabled states         | Comment                 | Disabled buttons, inputs     |

### Decision Tree

```
Is the coloured area > 100px²?
├── YES → Use Muted Variant or Neutral
│         (Device fills, chart areas, backgrounds)
└── NO  → Is it interactive?
          ├── YES → Use Dracula Accent
          │         (Focus rings, icons, links)
          └── NO  → Use Neutral/Comment
                    (Decorative, disabled)
```

### Examples

| Scenario                 | Correct                 | Incorrect                          |
| ------------------------ | ----------------------- | ---------------------------------- |
| Server device (2U block) | `#4A7A8A` (muted)       | `#8BE9FD` (too bright)             |
| Category icon (16px)     | `#8BE9FD` (accent)      | `#4A7A8A` (too dull)               |
| Selected device outline  | `#FF79C6` (pink)        | `#BD93F9` (conflicts with network) |
| Success toast            | `#3D7A4A` (muted green) | `#50FA7B` (too bright)             |
| Link text                | `#8BE9FD` (cyan)        | `#4A7A8A` (not prominent enough)   |

---

## Typography

### Font Stack

```css
:root {
	--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
	--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Type Scale

| Token              | Size | Usage                   |
| ------------------ | ---- | ----------------------- |
| `--font-size-2xs`  | 10px | Rack U labels           |
| `--font-size-xs`   | 11px | Device labels, captions |
| `--font-size-sm`   | 13px | Secondary text, buttons |
| `--font-size-base` | 14px | Body text               |
| `--font-size-md`   | 16px | Section headers         |
| `--font-size-lg`   | 18px | Page headers            |
| `--font-size-xl`   | 20px | Dialog titles           |
| `--font-size-2xl`  | 24px | Hero text               |

### Font Weights

| Weight   | Value | Usage                |
| -------- | ----- | -------------------- |
| Normal   | 400   | Body text            |
| Medium   | 500   | UI labels, buttons   |
| Semibold | 600   | Headers              |
| Bold     | 700   | Brand name, emphasis |

---

## Spacing System

### Base Unit: 4px

| Token       | Value | Usage                         |
| ----------- | ----- | ----------------------------- |
| `--space-1` | 4px   | Tight gaps, icon padding      |
| `--space-2` | 8px   | Button padding, input padding |
| `--space-3` | 12px  | Card padding                  |
| `--space-4` | 16px  | Section gaps                  |
| `--space-5` | 20px  | Large gaps                    |
| `--space-6` | 24px  | Section margins               |
| `--space-8` | 32px  | Page margins                  |

---

## Border & Radius

### Border Radius

| Token           | Value  | Usage                             |
| --------------- | ------ | --------------------------------- |
| `--radius-none` | 0      | Logo mark (Geismar sharp)         |
| `--radius-sm`   | 4px    | Device rectangles, small elements |
| `--radius-md`   | 6px    | Buttons, inputs, cards            |
| `--radius-lg`   | 8px    | Dialogs, panels                   |
| `--radius-full` | 9999px | Pills, avatars                    |

**Note:** Consider `--radius-sm` (4px) for most UI to align with Geismar's sharp aesthetic.

---

## Shadows & Glow

### Glow Effects (Dark Theme)

```css
:root {
	--glow-pink-sm: 0 0 12px rgba(255, 121, 198, 0.3);
	--glow-pink-md: 0 0 20px rgba(255, 121, 198, 0.3);
	--glow-cyan-sm: 0 0 12px rgba(139, 233, 253, 0.3);
	--glow-green-sm: 0 0 12px rgba(80, 250, 123, 0.3);
}
```

### Focus Ring

```css
:root {
	--focus-ring: 0 0 0 2px var(--colour-bg), 0 0 0 4px var(--colour-pink), var(--glow-pink-sm);
}
```

---

## Z-Index Layers

| Token                 | Value | Usage                       |
| --------------------- | ----- | --------------------------- |
| `--z-sidebar`         | 10    | Fixed sidebars              |
| `--z-drawer-backdrop` | 99    | Drawer overlay              |
| `--z-drawer`          | 100   | Slide-out drawers           |
| `--z-modal`           | 200   | Dialog overlays             |
| `--z-toast`           | 300   | Toast notifications         |
| `--z-tooltip`         | 400   | Tooltips (above everything) |

---

## Animation

### Timing

| Token               | Value | Usage                        |
| ------------------- | ----- | ---------------------------- |
| `--duration-fast`   | 100ms | Hover states, colour changes |
| `--duration-normal` | 200ms | Transitions, drawer slides   |
| `--duration-slow`   | 300ms | Dialog animations            |

### Easing

| Token           | Value                                     | Usage               |
| --------------- | ----------------------------------------- | ------------------- |
| `--ease-out`    | `cubic-bezier(0, 0, 0.2, 1)`              | Exit animations     |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)`            | General transitions |
| `--ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Playful bounces     |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		transition-duration: 0.01ms !important;
	}
}
```

---

## Logo Mark

### Specifications

| Property       | Value                      |
| -------------- | -------------------------- |
| ViewBox        | `0 0 32 32`                |
| Frame          | Sharp corners (radius: 0)  |
| Colour (dark)  | `#BD93F9` (purple)         |
| Colour (light) | `#644AC9` (alucard purple) |
| Minimum size   | 16x16px                    |
| Clear space    | 25% of width               |

### Files

| File                        | Usage              |
| --------------------------- | ------------------ |
| `/static/favicon.svg`       | Dark mode favicon  |
| `/static/favicon-light.svg` | Light mode favicon |

---

## Voice & Tone

- **Direct:** Say what it does, no marketing fluff
- **Technical:** Assume competence, use proper terminology
- **Helpful:** Guide without hand-holding
- **Dry wit:** Understated, never try-hard

---

## Changelog

### v0.6.0 (2025-12-15)

- Added muted device colour palette for WCAG AA compliance
- Changed selection/focus from purple to pink (resolves network conflict)
- Added strict colour usage hierarchy
- Improved muted text contrast (`#9A9A9A` instead of `#6272A4`)
- Added z-index layer tokens
- Added colour decision tree

---

_Based on official Dracula Theme specification: https://draculatheme.com/spec_
