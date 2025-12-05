# Rackarr — Technical Specification

**Status:** Active
**Last Updated:** 2025-12-02

---

## 1. Overview

### 1.1 Purpose

Rackarr is a lightweight, FOSS, web-based rack layout designer for homelabbers to plan optimal equipment arrangement before physical mounting.

### 1.2 Core Problem

"I have an 18U rack and a pile of gear — I need to figure out the optimal arrangement before I start mounting."

### 1.3 Target User

Homelabbers planning rack layouts. Desktop browser users (mobile support on roadmap).

### 1.4 Key Design Principles

- **ADHD-friendly:** Minimal decision points, visual clarity
- **Lightweight:** Static frontend, no backend required
- **Portable:** Layouts saved as self-contained `.rackarr.zip` archives
- **FOSS:** MIT licensed

---

# Part I: Core

Platform-agnostic specifications that apply to all implementations.

---

## 2. Technical Architecture

### 2.1 Stack

| Component     | Technology                                    |
| ------------- | --------------------------------------------- |
| Framework     | Svelte 5 (runes)                              |
| Language      | TypeScript (strict mode)                      |
| Rendering     | SVG                                           |
| Drag-and-drop | svelte-dnd-action                             |
| Persistence   | File download/upload, sessionStorage (WIP)    |
| Data Format   | YAML (js-yaml) within .rackarr.zip archive    |
| Validation    | Zod                                           |
| Styling       | CSS custom properties (design tokens)         |
| Typography    | Geist Sans + Geist Mono (self-hosted)         |
| Build         | Vite                                          |
| Testing       | Vitest + @testing-library/svelte + Playwright |
| Deployment    | Static files (nginx, Docker)                  |

### 2.2 Typography

**Font Family:** Geist (by Vercel)

| Variant        | Usage                                      | Fallback Stack            |
| -------------- | ------------------------------------------ | ------------------------- |
| **Geist Sans** | UI text, labels, buttons, device names     | `system-ui, sans-serif`   |
| **Geist Mono** | U numbers, technical values, code snippets | `ui-monospace, monospace` |

**Self-hosted** in `/static/fonts/` for offline capability (~100KB total).

**Font weights:**

- 400 (Regular) — body text, labels
- 500 (Medium) — emphasis, buttons
- 600 (Semibold) — headings, important labels

**CSS Custom Properties:**

```css
:root {
	--font-family: 'Geist Sans', system-ui, sans-serif;
	--font-mono: 'Geist Mono', ui-monospace, monospace;
}
```

### 2.3 Browser Support

Modern evergreen browsers only: Chrome, Firefox, Safari, Edge.
No mobile support in current scope. No IE support.

### 2.4 Deployment

Static files served via nginx or Docker container (`nginx:alpine`).
No backend, no database.

### 2.5 Repository

| Location    | URL                                                |
| ----------- | -------------------------------------------------- |
| **Primary** | `https://git.falcon-wahoe.ts.net/ggfevans/rackarr` |
| **Mirror**  | `https://github.com/ggfevans/rackarr`              |

---

## 3. Data Model

The data model is the foundation of Rackarr. All persistence, import/export, and UI rendering derive from these schemas.

### 3.1 Project Structure

A Rackarr project is saved as a `.rackarr.zip` archive containing:

```
my-layout.rackarr.zip
├── layout.yaml          # Project data
└── images/              # Device images (if any)
    ├── device-slug-front.png
    └── device-slug-rear.png
```

### 3.2 Layout Schema

```yaml
version: '1.0'
name: My Homelab Rack
created: 2025-12-02T10:30:00Z
modified: 2025-12-02T12:45:00Z

settings:
  theme: dark
  view: front # front | rear
  displayMode: label # label | image
  showLabelsOnImages: false

deviceLibrary:
  -  # Device definitions (see 3.3)

rack:
  # Single rack definition (see 3.4)
```

### 3.3 Device Schema

Unified device model with required and optional fields.

#### 3.3.1 Required Fields

| Property        | Type    | Constraints               | Notes                          |
| --------------- | ------- | ------------------------- | ------------------------------ |
| `slug`          | string  | Pattern: `^[-a-z0-9_]+$`  | Unique identifier, auto-gen OK |
| `name`          | string  | Min 1 char                | Display name                   |
| `u_height`      | number  | 0.5–100, multiples of 0.5 | Supports half-U devices        |
| `category`      | enum    | See 3.3.3                 | Fixed list                     |
| `colour`        | string  | Hex `#RRGGBB`             | Default based on category      |
| `is_full_depth` | boolean |                           | Default: `true`                |

#### 3.3.2 Optional Fields

| Property       | Type   | Constraints              | Notes                       |
| -------------- | ------ | ------------------------ | --------------------------- |
| `manufacturer` | string | Max 100 chars            | For NetBox imports          |
| `model`        | string | Max 100 chars            | For NetBox imports          |
| `part_number`  | string | Max 50 chars             | SKU/alternative ID          |
| `airflow`      | enum   | See 3.3.4                | Thermal metadata            |
| `weight`       | number | Min 0, multiples of 0.01 | Requires `weight_unit`      |
| `weight_unit`  | enum   | `kg`, `g`, `lb`, `oz`    | Required if weight provided |
| `face`         | enum   | `front`, `rear`, `both`  | Default: `both`             |
| `images`       | object | See 3.3.5                | Front/rear device images    |
| `notes`        | string | Free text                | User notes                  |

#### 3.3.3 Device Categories

Fixed list of 11 categories with built-in SVG icons:

| Category      | Icon Represents  | Default Colour |
| ------------- | ---------------- | -------------- |
| `server`      | Rack server      | `#4A90D9`      |
| `network`     | Switch/router    | `#7B68EE`      |
| `patch-panel` | Patch panel      | `#708090`      |
| `power`       | PDU/UPS          | `#DC143C`      |
| `storage`     | Disk shelf       | `#228B22`      |
| `kvm`         | KVM/console      | `#FF8C00`      |
| `av-media`    | AV equipment     | `#9932CC`      |
| `cooling`     | Fans/ventilation | `#00CED1`      |
| `shelf`       | Rack shelf       | `#8B4513`      |
| `blank`       | Blanking panel   | `#2F4F4F`      |
| `other`       | Generic device   | `#808080`      |

#### 3.3.4 Airflow Options

| Value           | Description             |
| --------------- | ----------------------- |
| `front-to-rear` | Standard server airflow |
| `rear-to-front` | Reverse airflow         |
| `left-to-right` | Side intake             |
| `right-to-left` | Side intake (opposite)  |
| `side-to-rear`  | Side to rear exhaust    |
| `rear-to-side`  | Rear to side exhaust    |
| `bottom-to-top` | Bottom intake           |
| `top-to-bottom` | Top intake              |
| `passive`       | No active cooling       |
| `mixed`         | Multiple/variable       |

#### 3.3.5 Device Images

```yaml
images:
  front: ./images/device-slug-front.png
  rear: ./images/device-slug-rear.png
```

- **Formats:** PNG, JPEG, WebP
- **Auto-resize:** On upload, images are resized to fit device dimensions (U height × rack width)
- **Storage:** Images stored in `images/` folder within `.rackarr.zip`
- **Display:** When rack is in image view mode, shows appropriate image based on front/rear view
- **Fallback:** If no image for current view, falls back to label display

### 3.4 Rack Schema

Single rack per project.

#### 3.4.1 Required Fields

| Property | Type   | Constraints | Notes            |
| -------- | ------ | ----------- | ---------------- |
| `id`     | string | UUID        | Auto-generated   |
| `name`   | string | Min 1 char  | User-defined     |
| `height` | number | 1–100       | Rack height in U |

#### 3.4.2 Optional Fields (with defaults)

| Property        | Type    | Default          | Options            |
| --------------- | ------- | ---------------- | ------------------ |
| `width`         | number  | `19`             | `10`, `19`         |
| `form_factor`   | enum    | `4-post-cabinet` | See 3.4.3          |
| `desc_units`    | boolean | `false`          | If true, U1 at top |
| `starting_unit` | number  | `1`              | Min 1              |

#### 3.4.3 Form Factor Options

| Value                   | Description               |
| ----------------------- | ------------------------- |
| `4-post-cabinet`        | Enclosed 4-post (default) |
| `4-post-frame`          | Open 4-post frame         |
| `2-post-frame`          | Telco/2-post frame        |
| `wall-cabinet`          | Wall-mounted enclosed     |
| `wall-frame`            | Wall-mounted open frame   |
| `wall-frame-vertical`   | Vertical wall mount       |
| `wall-cabinet-vertical` | Vertical wall cabinet     |

#### 3.4.4 Placed Devices

Each device placement in a rack references a device type and specifies position and optional overrides.

| Property   | Type   | Required | Default          | Notes                                  |
| ---------- | ------ | -------- | ---------------- | -------------------------------------- |
| `slug`     | string | Yes      | -                | References device type by slug         |
| `position` | number | Yes      | -                | Bottom U position (1-indexed)          |
| `face`     | enum   | No       | Device's default | `front`, `rear`, or `both`             |
| `name`     | string | No       | Device type name | Custom display name for this placement |

```yaml
rack:
  id: rack-uuid-001
  name: Main Rack
  height: 18
  devices:
    - slug: synology-ds920-plus
      position: 1 # Bottom U occupied (1-indexed)
      face: front # Override device default
      name: 'Primary NAS' # Custom display name (optional)
```

### 3.5 Starter Device Library

Pre-populated generic devices included with every new project:

| Category      | Starter Devices                   |
| ------------- | --------------------------------- |
| `server`      | 1U Server, 2U Server, 4U Server   |
| `network`     | 1U Switch, 1U Router, 1U Firewall |
| `patch-panel` | 1U Patch Panel, 2U Patch Panel    |
| `power`       | 1U PDU, 2U UPS, 4U UPS            |
| `storage`     | 2U Storage, 4U Storage            |
| `kvm`         | 1U KVM, 1U Console Drawer         |
| `av-media`    | 1U Receiver, 2U Amplifier         |
| `cooling`     | 1U Fan Panel, 0.5U Blanking Fan   |
| `shelf`       | 1U Shelf, 2U Shelf, 4U Shelf      |
| `blank`       | 0.5U Blank, 1U Blank, 2U Blank    |
| `other`       | 1U Generic, 2U Generic            |

### 3.6 Zod Schema Definitions

```typescript
// src/lib/schemas/device.ts
import { z } from 'zod';

const AirflowSchema = z.enum([
	'front-to-rear',
	'rear-to-front',
	'left-to-right',
	'right-to-left',
	'side-to-rear',
	'rear-to-side',
	'bottom-to-top',
	'top-to-bottom',
	'passive',
	'mixed'
]);

const WeightUnitSchema = z.enum(['kg', 'g', 'lb', 'oz']);

const DeviceFaceSchema = z.enum(['front', 'rear', 'both']);

const CategorySchema = z.enum([
	'server',
	'network',
	'patch-panel',
	'power',
	'storage',
	'kvm',
	'av-media',
	'cooling',
	'shelf',
	'blank',
	'other'
]);

const DeviceImagesSchema = z.object({
	front: z.string().optional(),
	rear: z.string().optional()
});

export const DeviceSchema = z
	.object({
		// Required
		slug: z.string().regex(/^[-a-z0-9_]+$/),
		name: z.string().min(1),
		u_height: z.number().min(0.5).max(100).multipleOf(0.5),
		category: CategorySchema,
		colour: z.string().regex(/^#[a-fA-F0-9]{6}$/),
		is_full_depth: z.boolean().default(true),

		// Optional
		manufacturer: z.string().max(100).optional(),
		model: z.string().max(100).optional(),
		part_number: z.string().max(50).optional(),
		airflow: AirflowSchema.optional(),
		weight: z.number().min(0).multipleOf(0.01).optional(),
		weight_unit: WeightUnitSchema.optional(),
		face: DeviceFaceSchema.default('both'),
		images: DeviceImagesSchema.optional(),
		notes: z.string().optional()
	})
	.refine((data) => data.weight === undefined || data.weight_unit !== undefined, {
		message: 'weight_unit required when weight is specified'
	});

export type Device = z.infer<typeof DeviceSchema>;
```

```typescript
// src/lib/schemas/rack.ts
import { z } from 'zod';

const FormFactorSchema = z.enum([
	'4-post-cabinet',
	'4-post-frame',
	'2-post-frame',
	'wall-cabinet',
	'wall-frame',
	'wall-frame-vertical',
	'wall-cabinet-vertical'
]);

const PlacedDeviceSchema = z.object({
	slug: z.string(),
	position: z.number().int().min(1),
	face: z.enum(['front', 'rear', 'both']).optional()
});

export const RackSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	height: z.number().int().min(1).max(100),
	width: z.number().int().default(19),
	form_factor: FormFactorSchema.default('4-post-cabinet'),
	desc_units: z.boolean().default(false),
	starting_unit: z.number().int().min(1).default(1),
	devices: z.array(PlacedDeviceSchema).default([])
});

export type Rack = z.infer<typeof RackSchema>;
```

```typescript
// src/lib/schemas/project.ts
import { z } from 'zod';
import { DeviceSchema } from './device';
import { RackSchema } from './rack';

export const ProjectSchema = z.object({
	version: z.string(),
	name: z.string().min(1),
	created: z.string().datetime(),
	modified: z.string().datetime(),
	settings: z.object({
		theme: z.enum(['dark', 'light']).default('dark'),
		view: z.enum(['front', 'rear']).default('front'),
		displayMode: z.enum(['label', 'image']).default('label'),
		showLabelsOnImages: z.boolean().default(false)
	}),
	deviceLibrary: z.array(DeviceSchema).default([]),
	rack: RackSchema
});

export type Project = z.infer<typeof ProjectSchema>;
```

---

## 4. Persistence

### 4.1 File Format

Rackarr uses `.rackarr.zip` archives for all save/load operations.

| Component     | Location in Archive | Format |
| ------------- | ------------------- | ------ | ----- | ------ |
| Project data  | `layout.yaml`       | YAML   |
| Device images | `images/\*.png      | jpg    | webp` | Binary |

### 4.2 Save Operation

1. Serialize project state to YAML
2. Collect all device images from session storage
3. Create zip archive using JSZip:
   - Add `layout.yaml`
   - Add `images/` folder with all device images
4. Trigger browser download of `.rackarr.zip`

### 4.3 Load Operation

1. User selects `.rackarr.zip` via file picker
2. Extract archive contents
3. Parse and validate `layout.yaml` against ProjectSchema
4. Load images from `images/` folder into session storage
5. Render project on canvas
6. On validation error: show detailed message, preserve current state

### 4.4 Session Auto-Save

- Work-in-progress saved to sessionStorage
- Survives page refresh
- Clears on tab/window close
- Images stored in IndexedDB (larger capacity)

### 4.5 Unsaved Changes

Browser `beforeunload` prompt when closing tab with unsaved changes.

### 4.6 Local Storage

Used only for theme preference (dark/light).

---

## 5. Export

### 5.1 Supported Formats

- PNG (raster, default)
- JPEG (raster, smaller file size)
- SVG (vector, scalable)
- PDF (vector, print-ready)

### 5.2 Export Options

| Option             | Type     | Default                               |
| ------------------ | -------- | ------------------------------------- |
| Format             | dropdown | PNG                                   |
| Include rack name  | checkbox | Yes                                   |
| Include legend/key | checkbox | No                                    |
| Background         | dropdown | Dark / Light / Transparent (SVG only) |
| View               | dropdown | Front / Rear                          |
| Display mode       | dropdown | Label / Image                         |

### 5.3 Export Modes

**Quick Export:**

- Single image file (PNG/JPEG/SVG/PDF)
- Direct download

**Bundled Export:**

- Zip archive containing:
  - Exported image
  - Metadata manifest (JSON)
  - Source layout file (optional)

### 5.4 Export Notes

- Device notes are NOT included in visual exports (data file only)
- Rack name appears below rack (same as canvas)
- Legend shows device name + colour swatch

---

## 6. Theming

### 6.1 Theme Options

- **Dark mode** (default)
- **Light mode**

### 6.2 System Preference

On first visit, respect `prefers-color-scheme` media query. User choice stored in localStorage overrides system preference thereafter.

### 6.3 Theme Application

Themes implemented via CSS custom properties. Theme class applied to document root:

```css
:root {
	/* dark theme values */
}
[data-theme='light'] {
	/* light theme overrides */
}
```

### 6.4 Export Considerations

Light mode useful for exports with white/transparent backgrounds.

---

## 7. Accessibility

### 7.1 Standards

WCAG 2.1 AA compliance.

### 7.2 Requirements

- Semantic HTML (`<button>`, not `<div onclick>`)
- Visible focus indicators (2px outline minimum)
- Keyboard navigation (full functionality without mouse)
- ARIA labels on icon-only buttons
- ARIA roles on interactive SVG elements
- Sufficient colour contrast (4.5:1 text, 3:1 UI components)
- Reduced motion support (`prefers-reduced-motion`)

### 7.3 Focus Indicators

```css
:focus-visible {
	outline: 2px solid var(--colour-focus);
	outline-offset: 2px;
}
```

### 7.4 Reduced Motion

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

### 7.5 ARIA for SVG Components

#### Rack Container

```html
<svg role="group" aria-label="Rack: [Name], [N] units">
	<desc>[N]-unit rack containing [X] devices</desc>
</svg>
```

#### Device (Interactive)

```html
<g
	role="button"
	tabindex="0"
	aria-label="[Device Name], [N]U, at position U[X]"
	aria-grabbed="false"
>
</g>
```

---

## 8. Error Handling

| Scenario                   | Behaviour                                       |
| -------------------------- | ----------------------------------------------- |
| Invalid archive on load    | Validation errors shown, stay on current layout |
| Corrupted image in archive | Skip image, load rest of project, warn user     |
| Unsaved changes on close   | Browser "are you sure?" prompt                  |
| Device too tall for space  | Block drop, visual feedback                     |
| Collision on drop          | Block drop, highlight invalid zone              |
| Image upload too large     | Reject with size limit message                  |
| Unsupported image format   | Reject with format message                      |

---

# Part II: Desktop

Desktop-specific UI and interaction specifications.

---

## 9. User Interface

### 9.1 Layout Structure

Single-page application with fixed layout:

```
┌─────────────────────────────────────────────────────────┐
│  Toolbar (52px)                                         │
├──────────────┬──────────────────────────┬───────────────┤
│              │                          │               │
│   Device     │                          │    Edit       │
│   Library    │        Canvas            │    Panel      │
│   (300px)    │                          │   (300px)     │
│   [fixed]    │                          │  [auto-show]  │
│              │                          │               │
└──────────────┴──────────────────────────┴───────────────┘
```

- **Toolbar:** Primary actions and controls (52px height)
- **Device Library:** Fixed left sidebar (300px width, always visible)
- **Canvas:** Rack visualization area (fills remaining space)
- **Edit Panel:** Right panel (300px width, auto-shows on selection)

### 9.2 Toolbar Contents

| Control                  | Action                  |
| ------------------------ | ----------------------- |
| App logo + "Rackarr"     | Links to Help/About     |
| **Save**                 | Download `.rackarr.zip` |
| **Load**                 | Upload `.rackarr.zip`   |
| **Export**               | Opens export dialog     |
| **View: Front/Rear**     | Toggle rack view        |
| **Display: Label/Image** | Toggle display mode     |
| **Zoom +/-**             | Zoom controls           |
| **Fit**                  | Fit rack to view        |
| **Dark/Light toggle**    | Switch theme            |
| **Help**                 | Opens Help panel        |

### 9.3 Device Library (Left Sidebar)

Fixed, always-visible sidebar containing:

- Search field at top
- Devices grouped by category (collapsible)
- "Add Device" button opens creation form:
  - Name (required)
  - Height in U (required, 0.5–100)
  - Category (required, dropdown)
  - Colour (colour picker with category default)
  - Front/rear images (optional, file upload)
  - Notes (optional, textarea)

### 9.4 Edit Panel (Right Sidebar)

Auto-shows when device or rack is selected. Auto-hides on deselect.

**Device selected:**

- Device name (editable)
- Position (U number, spinner)
- Face (front/rear/both, radio)
- View/replace images
- Delete device button

**Rack selected (click empty space in rack):**

- Rack name (editable)
- Height (editable if rack empty)
- Width (10"/19")
- Form factor (dropdown)
- Starting unit
- Descending units (checkbox)
- Delete rack button (confirmation required)

### 9.5 View Modes

**Front/Rear View:**

- Toggle between front and rear rack perspectives
- Devices with `face: front` only visible in front view
- Devices with `face: rear` only visible in rear view
- Devices with `face: both` visible in both views

**Label/Image Display:**

- **Label mode:** Shows category icon and device name
- **Image mode:** Shows device image (front or rear based on view)
- **Label overlay option:** In image mode, optionally show name label over image
- Falls back to label display if device has no image for current view

---

## 10. Rack Visualization

### 10.1 Rack Appearance

- Numbered U positions on rail (U1 at bottom by default, configurable)
- Grid lines dividing each U
- Every 5th U number highlighted for readability
- Light grey shading inside rack area
- Vertical rails indicating mounting points
- Rack name displayed below rack

### 10.2 Rack Dimensions (CSS custom properties)

| Element     | Default | Notes                    |
| ----------- | ------- | ------------------------ |
| U height    | 22px    | 42U = ~924px             |
| Rack width  | 220px   | 19" rack proportional    |
| Device text | 12px    | Readable at default zoom |

### 10.3 Zoom

- Zoom controls (+/-) in toolbar
- Range: 50%–200%
- "Fit" button scales rack to fit viewport
- Keyboard shortcut: `F` for fit

---

## 11. Interaction Model

### 11.1 Placing Devices

1. Drag device from library onto rack
2. Device snaps to U positions
3. Bottom-anchored: dropped U is lowest U occupied
4. Drop preview shows exact slots device will occupy

### 11.2 Moving Devices

- Drag device within rack to new position
- Arrow keys (↑/↓) move device 1U
- Devices leapfrog over obstacles when moved via keyboard
- Snaps to valid U positions only

### 11.3 Collision Handling

- **Block approach:** Cannot drop on occupied U positions
- Invalid drop zones highlight red
- Cursor changes to "no-drop"
- Device taller than remaining space: blocked

### 11.4 Selection

- **Single-select only**
- Click device → device selected (visible outline)
- Click empty rack space → rack selected (visible outline)
- Click canvas (outside rack) → deselect all
- Escape key → deselect all

### 11.5 Deleting Items

- Select item, then Delete/Backspace key
- Or use Delete button in edit panel
- Rack deletion requires confirmation

### 11.6 Drag-and-Drop Visual States

| State           | Visual Treatment                                      |
| --------------- | ----------------------------------------------------- |
| Resting         | Normal appearance                                     |
| Hover           | Subtle brightness increase, `cursor: grab`            |
| Grabbed         | Elevation shadow, slight scale (1.02)                 |
| Dragging        | Element follows cursor; ghost at origin (40% opacity) |
| Over valid drop | Target slots highlight green                          |
| Over invalid    | Target highlights red, `cursor: no-drop`              |
| Dropped         | 100-150ms settle animation                            |
| Cancelled       | Returns to origin with settle animation               |

---

## 12. Keyboard Shortcuts

### 12.1 Navigation

Keyboard navigation uses roving tabindex pattern:

1. **Tab** moves focus between UI regions: Toolbar → Device Library → Canvas → Edit Panel
2. **Arrow keys** navigate within regions
3. **Enter/Space** selects focused item
4. **Escape** deselects

### 12.2 Shortcut Reference

| Key                | Action                      |
| ------------------ | --------------------------- |
| `F`                | Fit rack to view            |
| `V`                | Toggle front/rear view      |
| `I`                | Toggle label/image display  |
| `↑` / `↓`          | Move selected device 1U     |
| `Delete/Backspace` | Delete selected item        |
| `Escape`           | Deselect                    |
| `Ctrl/Cmd + S`     | Save layout                 |
| `Ctrl/Cmd + O`     | Load layout                 |
| `Ctrl/Cmd + E`     | Export dialog               |
| `?`                | Keyboard shortcut reference |

---

## 13. Animations

### 13.1 Principles

Minimal and snappy. No decorative animations. All animations serve functional purposes.

### 13.2 Durations

| Context                 | Duration  | Easing      |
| ----------------------- | --------- | ----------- |
| Hover state transitions | 50-100ms  | ease-out    |
| Drop settle animation   | 100-150ms | ease-out    |
| Panel open/close        | 150-200ms | ease-out    |
| Theme transition        | 200ms     | ease-in-out |
| Selection highlight     | immediate | —           |

---

## 14. Application Flow

### 14.1 Initial Load

1. App loads with empty rack state
2. New rack form auto-opens
3. Theme loaded from localStorage (or system preference)

### 14.2 New Project Flow

1. User sets rack height (dropdown: 12U, 18U, 24U, 42U, or custom 1-100)
2. User sets rack name
3. Optionally configure width, form factor
4. Submit creates rack on canvas
5. Device library ready for use

### 14.3 Load Project Flow

1. User clicks "Load"
2. File picker opens (accepts `.rackarr.zip`)
3. Archive extracted and validated
4. Project rendered on canvas
5. Error: message shown, previous state preserved

---

# Part III: Out of Scope

The following are explicitly not part of this specification:

- Multiple racks (single rack only)
- Custom device categories (fixed list of 11)
- Mobile/tablet support (see roadmap)
- Cloud sync / accounts
- Collaborative editing
- 3D visualization

See `roadmap.md` for future feature planning.

---

# Part IV: Success Criteria

Implementation is complete when:

## Core

- [ ] Single rack with configurable height (1–100U)
- [ ] Rack width options (10", 19")
- [ ] Rack form factor options
- [ ] Unified device model with optional manufacturer/model/images
- [ ] Device images (front/rear) with auto-resize on upload
- [ ] Save/load as `.rackarr.zip` with embedded images
- [ ] Export as PNG/JPEG/SVG/PDF (single file or bundled)
- [ ] 11 fixed device categories including shelf
- [ ] Starter device library with common devices
- [ ] Zod schema validation with clear error messages

## Desktop

- [ ] Fixed device library sidebar (always visible)
- [ ] Auto-show edit panel on selection
- [ ] Drag-and-drop device placement with collision detection
- [ ] Front/rear rack view toggle
- [ ] Label/image display mode toggle
- [ ] User-controlled label overlay in image mode
- [ ] Full keyboard navigation
- [ ] All keyboard shortcuts functional
- [ ] Dark/light theme with system preference respect
- [ ] WCAG AA accessibility compliance
- [ ] Runs as static files in Docker container

---

_Specification complete. See `roadmap.md` for future features._
