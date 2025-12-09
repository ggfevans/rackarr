# Rackarr Technical Specification

**Version:** 0.4.9
**Updated:** 2025-12-09
**Status:** Active

---

## 1. Overview

### 1.1 Purpose

Rackarr is a lightweight, FOSS, web-based rack layout designer for homelabbers to plan optimal equipment arrangement before physical mounting.

### 1.2 Core Problem

"I have a rack and a pile of gear — I need to figure out the optimal arrangement before I start mounting."

### 1.3 Target User

Homelabbers planning rack layouts. Desktop browser users (mobile support planned).

### 1.4 Design Principles

- **ADHD-friendly** — Minimal decision points, visual clarity
- **Lightweight** — Static frontend, no backend required
- **Portable** — Layouts saved as self-contained `.rackarr.zip` archives
- **Single-rack** — One rack per project (simplicity over complexity)
- **FOSS** — MIT licensed

### 1.5 Links

| Resource   | URL                                 |
| ---------- | ----------------------------------- |
| Live Demo  | https://ggfevans.github.io/rackarr/ |
| Repository | https://github.com/ggfevans/rackarr |

---

## 2. Technical Stack

| Component   | Technology                                        |
| ----------- | ------------------------------------------------- |
| Framework   | Svelte 5 (runes: `$state`, `$derived`, `$effect`) |
| Language    | TypeScript (strict mode)                          |
| Rendering   | SVG                                               |
| Pan/Zoom    | panzoom                                           |
| Persistence | File download/upload (.rackarr.zip)               |
| Data Format | YAML (js-yaml)                                    |
| Validation  | Zod                                               |
| Styling     | CSS custom properties (design tokens)             |
| Testing     | Vitest + @testing-library/svelte + Playwright     |
| Build       | Vite                                              |

### 2.1 Dependencies

**Production:**

- `js-yaml` ^4.1 — YAML serialization
- `jspdf` ^3.0 — PDF export
- `jszip` ^3.10 — ZIP archive handling
- `panzoom` ^9.4 — Canvas pan/zoom
- `zod` ^4.1 — Schema validation

**Development:**

- `svelte` ^5.43
- `typescript` ^5.9
- `vite` ^7.2
- `vitest` ^3.2
- `playwright` ^1.56

---

## 3. Data Model

### 3.1 Type Definitions

```typescript
// View types
type RackView = 'front' | 'rear';
type DeviceFace = 'front' | 'rear' | 'both';
type DisplayMode = 'label' | 'image';

// Device categories (11 types)
type DeviceCategory =
	| 'server'
	| 'network'
	| 'patch-panel'
	| 'power'
	| 'storage'
	| 'kvm'
	| 'av-media'
	| 'cooling'
	| 'shelf'
	| 'blank'
	| 'other';

// Airflow directions (4 types)
type Airflow =
	| 'passive' // No active cooling
	| 'front-to-rear' // Standard server airflow
	| 'rear-to-front' // Reverse airflow
	| 'side-to-rear'; // Side intake (e.g., network switches)

// Rack form factors
type FormFactor =
	| '4-post-cabinet'
	| '4-post-frame'
	| '2-post-frame'
	| 'wall-cabinet'
	| 'wall-frame'
	| 'wall-frame-vertical'
	| 'wall-cabinet-vertical';

type WeightUnit = 'kg' | 'g' | 'lb' | 'oz';
```

### 3.2 Device (Library Item)

```typescript
interface Device {
	id: string; // UUID
	name: string; // Display name
	height: number; // 0.5-42U (supports half-U)
	colour: string; // Hex (#RRGGBB)
	category: DeviceCategory;
	notes?: string;
	manufacturer?: string;
	model?: string;
	part_number?: string;
	airflow?: Airflow;
	weight?: number;
	weight_unit?: WeightUnit;
	is_full_depth?: boolean; // Default: true
	face?: DeviceFace; // Default placement face
	images?: DeviceImages;
}
```

### 3.3 PlacedDevice (Instance in Rack)

```typescript
interface PlacedDevice {
	libraryId: string; // Reference to Device.id
	position: number; // Bottom U position (1-indexed)
	face: DeviceFace;
	name?: string; // Custom instance name
}
```

### 3.4 Rack

```typescript
interface Rack {
	id: string;
	name: string;
	height: number; // 1-100U (common: 12, 18, 24, 42)
	width: number; // 10 or 19 inches
	position: number; // Order index
	view: RackView; // Runtime only
	devices: PlacedDevice[];
	form_factor?: FormFactor; // Default: '4-post-cabinet'
	desc_units?: boolean; // U1 at top if true
	starting_unit?: number; // Default: 1
}
```

### 3.5 Layout

```typescript
interface Layout {
	version: string; // Schema version (e.g., "0.1.0")
	name: string;
	created: string; // ISO 8601
	modified: string; // ISO 8601
	settings: LayoutSettings;
	deviceLibrary: Device[];
	racks: Rack[]; // Single rack in v0.2+
}

interface LayoutSettings {
	theme: 'dark' | 'light';
	view?: RackView;
	displayMode?: DisplayMode;
	showLabelsOnImages?: boolean;
}
```

### 3.6 Constraints

| Constraint              | Value                |
| ----------------------- | -------------------- |
| Min device height       | 0.5U                 |
| Max device height       | 42U                  |
| Min rack height         | 1U                   |
| Max rack height         | 100U                 |
| Allowed rack widths     | 10", 19"             |
| Max racks per layout    | 1 (single-rack mode) |
| Max image size          | 5MB                  |
| Supported image formats | PNG, JPEG, WebP      |

---

## 4. File Format

### 4.1 Archive Structure

Extension: `.rackarr.zip`

```
my-rack.rackarr.zip
└── my-rack/
    ├── my-rack.yaml           # Layout data
    └── assets/
        └── [device-slug]/
            ├── front.png      # Front image (optional)
            └── rear.png       # Rear image (optional)
```

### 4.2 YAML Schema

```yaml
version: '0.1.0'
name: 'My Homelab Rack'
rack:
  name: 'Primary Rack'
  height: 42
  width: 19
  position: 0
  view: 'front'
  desc_units: false
  form_factor: '4-post-cabinet'
  starting_unit: 1
  devices:
    - device_type: 'dell-r650'
      position: 40
      face: 'front'
      name: 'Web Server 1'
device_types:
  - slug: 'dell-r650'
    u_height: 1
    manufacturer: 'Dell'
    model: 'PowerEdge R650'
    is_full_depth: true
    airflow: 'front-to-rear'
    rackarr:
      colour: '#4A90D9'
      category: 'server'
settings:
  display_mode: 'label'
  show_labels_on_images: false
```

---

## 5. Component Architecture

### 5.1 Core Components

| Component             | Purpose                         |
| --------------------- | ------------------------------- |
| `Canvas.svelte`       | Main viewport with panzoom      |
| `Rack.svelte`         | SVG rack visualization          |
| `RackDevice.svelte`   | Device rendering with selection |
| `RackDualView.svelte` | Front/rear side-by-side view    |

### 5.2 UI Panels

| Component              | Purpose                   |
| ---------------------- | ------------------------- |
| `Toolbar.svelte`       | Top action bar            |
| `Sidebar.svelte`       | Fixed left device library |
| `DevicePalette.svelte` | Device list with search   |
| `EditPanel.svelte`     | Property editor (right)   |
| `HelpPanel.svelte`     | Keyboard shortcuts        |

### 5.3 Forms & Dialogs

| Component              | Purpose                  |
| ---------------------- | ------------------------ |
| `AddDeviceForm.svelte` | Create device in library |
| `NewRackForm.svelte`   | Create/edit rack         |
| `ExportDialog.svelte`  | Export configuration     |
| `ConfirmDialog.svelte` | Confirmation prompts     |
| `ImageUpload.svelte`   | Device image upload      |

### 5.4 Utilities

| Component                 | Purpose                    |
| ------------------------- | -------------------------- |
| `KeyboardHandler.svelte`  | Global shortcut dispatcher |
| `ToastContainer.svelte`   | Notifications              |
| `CategoryIcon.svelte`     | Category icons             |
| `AirflowIndicator.svelte` | Airflow visualization      |

---

## 6. State Management

All state uses Svelte 5 runes (`$state`, `$derived`, `$effect`).

### 6.1 Layout Store

```typescript
// State
layout: Layout
isDirty: boolean
hasStarted: boolean

// Derived
racks: Rack[]
deviceLibrary: Device[]
rackCount: number

// Methods
addRack(), updateRack(), deleteRack()
addDeviceType(), updateDeviceType(), deleteDeviceType()
placeDevice(), moveDevice(), removeDevice()
undo(), redo(), reset()
```

### 6.2 UI Store

```typescript
// State
theme: 'dark' | 'light';
displayMode: 'label' | 'image';
showLabelsOnImages: boolean;
airflowMode: boolean;

// Methods
toggleTheme();
toggleDisplayMode();
toggleAirflowMode();
```

### 6.3 Selection Store

```typescript
// State
selectedId: string | null;          // Unique identifier for selection
selectedType: 'rack' | 'device' | null;
selectedRackId: string | null;      // Which rack contains the selection
selectedDeviceIndex: number | null; // Index of placed device in rack.devices array

// Methods
selectRack(rackId: string): void;
selectDevice(rackId: string, deviceIndex: number): void;  // Select by position index, NOT libraryId
clearSelection(): void;
```

**Important:** Device selection uses `deviceIndex` (position in rack's device array), NOT `libraryId`. Multiple placed devices can share the same `libraryId` (same device type), but each has a unique index. Selection must target a single placed device instance.

### 6.4 History Store

```typescript
// State
undoStack: Command[]
redoStack: Command[]
MAX_HISTORY_DEPTH = 50

// Derived
canUndo, canRedo
undoDescription, redoDescription

// Methods
execute(), undo(), redo(), clear()
```

### 6.5 Canvas Store

```typescript
// State
panzoomInstance: PanzoomObject | null;
currentZoom: number(0.25 - 2.0);

// Methods
(zoomIn(), zoomOut(), fitAll(), resetZoom());
```

---

## 7. Keyboard Shortcuts

| Shortcut                  | Action                         |
| ------------------------- | ------------------------------ |
| `Escape`                  | Clear selection / close panels |
| `Ctrl+Z`                  | Undo                           |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo                           |
| `Delete` / `Backspace`    | Delete selected                |
| `↑` / `↓`                 | Move device in rack            |
| `F`                       | Fit all (reset view)           |
| `I`                       | Toggle display mode            |
| `A`                       | Toggle airflow mode            |
| `Ctrl+S`                  | Save layout                    |
| `Ctrl+O`                  | Load layout                    |
| `Ctrl+E`                  | Export dialog                  |
| `?`                       | Help panel                     |

---

## 8. Export Formats

### 8.1 Image Export

| Format | Features                |
| ------ | ----------------------- |
| PNG    | Transparency support    |
| JPEG   | Smaller file size       |
| SVG    | Vector, scalable        |
| PDF    | Print-ready, multi-page |

### 8.2 Export Options

```typescript
interface ExportOptions {
	format: 'png' | 'jpeg' | 'svg' | 'pdf';
	scope: 'all' | 'selected';
	background: 'dark' | 'light' | 'transparent';
	exportView: 'front' | 'rear' | 'both';
	displayMode: 'label' | 'image';
	airflowMode: boolean;
	includeNames: boolean;
	includeLegend: boolean;
}
```

---

## 9. Design Tokens

### 9.1 Token Layers

1. **Primitives** — Raw values (colors, spacing)
2. **Semantic** — Purpose-based (bg, text, border)
3. **Component** — Component-specific (rack, toolbar)

### 9.2 Key Tokens

```css
/* Spacing */
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;

/* Typography */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;

/* Rack (stays dark in both themes) */
--rack-u-height: 17.78px;
--rack-width: 482.6px;
--rack-rail-width: 30px;

/* Component sizes */
--toolbar-height: 56px;
--sidebar-width: 280px;
--drawer-width: 320px;

/* Airflow colors */
--colour-airflow-intake: var(--blue-400);
--colour-airflow-exhaust: var(--red-400);
--colour-airflow-passive: var(--neutral-400);
--colour-airflow-conflict: var(--amber-500);
```

### 9.3 Theme System

- Default: Dark theme
- Light theme via `[data-theme="light"]` selector
- Rack colors intentionally stay dark in both themes

---

## 10. Category Colors

| Category    | Color      | Hex     |
| ----------- | ---------- | ------- |
| server      | Blue       | #4A90D9 |
| network     | Purple     | #7B68EE |
| patch-panel | Slate      | #708090 |
| power       | Red        | #DC143C |
| storage     | Green      | #228B22 |
| kvm         | Orange     | #FF8C00 |
| av-media    | Purple     | #9932CC |
| cooling     | Teal       | #00CED1 |
| shelf       | Brown      | #8B4513 |
| blank       | Dark Slate | #2F4F4F |
| other       | Gray       | #808080 |

---

## 11. Commands

### 11.1 Development

```bash
npm run dev          # Dev server (localhost:5173)
npm run build        # Production build
npm run preview      # Preview build
```

### 11.2 Testing

```bash
npm run test         # Unit tests (watch)
npm run test:run     # Unit tests (CI)
npm run test:e2e     # E2E tests (Playwright)
```

### 11.3 Quality

```bash
npm run lint         # ESLint
npm run format       # Prettier
npm run check        # Svelte type check
```

---

## 12. Deployment

- **Platform:** GitHub Pages
- **Trigger:** Push to `main` branch
- **Workflow:** GitHub Actions
- **Manual:** `git push github main`

---

## 13. Version History

| Version | Changes                                  |
| ------- | ---------------------------------------- |
| 0.4.9   | Airflow visualization, selection bug fix |
| 0.4.8   | Design token audit, CSS cleanup          |
| 0.4.0   | Breaking: removed legacy format support  |
| 0.3.x   | Undo/redo, YAML archive, device images   |
| 0.2.x   | Single-rack mode, fixed sidebar          |
| 0.1.x   | Initial release                          |

---

## 14. Airflow Visualization (v0.4.9)

Visual overlay for device airflow direction, helping identify thermal conflicts.

### 14.1 Airflow Types

| Type            | Description                         | Visual                      |
| --------------- | ----------------------------------- | --------------------------- |
| `passive`       | No active cooling (panels, shelves) | Gray hollow circle          |
| `front-to-rear` | Standard server airflow             | Blue stripe front, red rear |
| `rear-to-front` | Reverse airflow (some network gear) | Red stripe front, blue rear |
| `side-to-rear`  | Side intake (switches)              | Blue stripe front, red rear |

### 14.2 Visual Design

- **Edge stripe** — 4px colored stripe on device edge (left=front view, right=rear view)
- **Arrow indicator** — Small animated chevron next to stripe showing direction
- **Colors** — Blue (#60a5fa) = intake, Red (#f87171) = exhaust, Gray (#9ca3af) = passive
- **Conflict border** — Orange (#f59e0b) border on devices with airflow conflicts

### 14.3 Conflict Detection

Conflicts detected when exhaust of one device feeds intake of adjacent device:

- Front-to-rear device above rear-to-front device
- Rear-to-front device above front-to-rear device

### 14.4 UI Integration

- **Toggle** — `A` key or toolbar button toggles airflow visualization
- **Export** — Airflow indicators included in image/PDF exports when enabled
- **EditPanel** — Dropdown to change device airflow type
- **AddDeviceForm** — Dropdown to set airflow on new devices

---

## 15. Out of Scope

Features that will NOT be implemented:

- Multiple racks per project
- Backend/database
- User accounts
- Native mobile apps
- Internet Explorer support

---

_This specification is the technical source of truth for Rackarr._
