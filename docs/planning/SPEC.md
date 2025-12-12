# Rackarr Technical Specification

**Version:** 0.6.0-draft
**Updated:** 2025-12-12
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

// Rack form factors (NetBox-compatible)
type FormFactor = '2-post' | '4-post' | '4-post-cabinet' | 'wall-mount' | 'open-frame';

// Weight units (NetBox-compatible)
type WeightUnit = 'kg' | 'lb';
```

### 3.2 DeviceType (Library Item)

```typescript
interface DeviceType {
	slug: string; // Unique identifier (e.g., 'dell-r650')
	u_height: number; // 0.5-42U (supports half-U)
	manufacturer?: string;
	model?: string; // Display name
	part_number?: string;
	is_full_depth?: boolean; // Default: true
	airflow?: Airflow;
	weight?: number;
	weight_unit?: WeightUnit;
	comments?: string;
	// Power device properties (category: 'power')
	outlet_count?: number; // Number of outlets (e.g., 8, 12, 16)
	va_rating?: number; // VA capacity (e.g., 1500, 3000)
	rackarr: {
		colour: string; // Hex (#RRGGBB)
		category: DeviceCategory;
		tags?: string[];
	};
}
```

### 3.3 PlacedDevice (Instance in Rack)

```typescript
interface PlacedDevice {
	id: string; // UUID for stable reference (survives reordering)
	device_type: string; // Reference to DeviceType.slug
	position: number; // Bottom U position (1-indexed)
	face: DeviceFace;
	name?: string; // Custom instance name
}
```

**Note:** The `id` field is a UUID generated on device placement using `crypto.randomUUID()`. It provides a stable identifier for placement-level image overrides that survives device reordering.

### 3.4 Rack

```typescript
interface Rack {
	name: string;
	height: number; // 1-100U (common: 12, 18, 24, 42)
	width: 10 | 19; // 10 or 19 inches
	position: number; // Order index
	devices: PlacedDevice[];
	form_factor: FormFactor; // Default: '4-post-cabinet'
	desc_units: boolean; // U1 at top if true (default: false)
	starting_unit: number; // Default: 1
}
```

**Note:** In single-rack mode, the store adds a synthetic `id: 'rack-0'` to the rack for runtime identification.

### 3.5 Layout

```typescript
interface Layout {
	version: string; // Schema version (e.g., "0.1.0")
	name: string;
	created: string; // ISO 8601
	modified: string; // ISO 8601
	settings: LayoutSettings;
	device_types: DeviceType[]; // Device type library
	rack: Rack; // Single rack
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

### 3.7 Collision Detection

Two devices collide if **both** conditions are true:

1. Their U ranges overlap (`position` to `position + u_height - 1`)
2. Their faces collide (based on depth rules below)

**Face Collision Rules:**

| Face A | Face B | Either Full-Depth? | Collision? |
| ------ | ------ | ------------------ | ---------- |
| front  | front  | any                | YES        |
| rear   | rear   | any                | YES        |
| both   | any    | any                | YES        |
| front  | rear   | YES                | YES        |
| front  | rear   | NO (both half)     | NO         |

**Defaults:**

- `is_full_depth` defaults to `true` when not specified
- Half-depth devices (blanks, shelves, patch panels, cable management) are explicitly marked `is_full_depth: false`

**Half-Depth Devices in Starter Library:**

| Category         | Devices                                  |
| ---------------- | ---------------------------------------- |
| Blank            | 0.5U Blank, 1U Blank, 2U Blank           |
| Shelf            | 1U Shelf, 2U Shelf                       |
| Patch Panel      | 24-Port Patch Panel, 48-Port Patch Panel |
| Cable Management | 1U Brush Panel, 1U Cable Management      |

This allows placing a rear half-depth device at the same U position as a front half-depth device (useful for blanks and cable management).

---

## 4. File Format

### 4.1 Archive Structure

Extension: `.rackarr.zip`

```
my-rack.rackarr.zip
└── my-rack/
    ├── my-rack.yaml           # Layout data
    └── assets/
        ├── device-types/      # Device type default images
        │   └── [device-slug]/
        │       ├── front.webp
        │       └── rear.webp
        └── placements/        # Placement override images (optional)
            └── [placement-id]/
                ├── front.webp
                └── rear.webp
```

**Image Storage:**

- `device-types/` — Images uploaded when creating device types (shared by all instances)
- `placements/` — Per-placement image overrides (keyed by PlacedDevice.id)
- Bundled images are not stored in archives (loaded from app assets)

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
    - id: '550e8400-e29b-41d4-a716-446655440000'
      device_type: 'dell-r650'
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

| Component              | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `Toolbar.svelte`       | Top action bar                                   |
| `Sidebar.svelte`       | Fixed left device library                        |
| `DevicePalette.svelte` | Device list with collapsible sections and search |
| `EditPanel.svelte`     | Property editor (right)                          |
| `HelpPanel.svelte`     | Keyboard shortcuts                               |

**DevicePalette Sections:**

- Collapsible sections for Generic, Ubiquiti, Mikrotik (see Section 11.6)
- Global search spans all sections
- Section headers show device counts

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
rack: Rack & { id: string } | null  // Single rack with synthetic id
device_types: DeviceType[]
rackCount: number  // 0 or 1 in single-rack mode

// Methods
addRack(), updateRack()  // deleteRack() N/A (single rack mode)
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
selectDevice(rackId: string, deviceIndex: number, deviceTypeSlug: string): void;
clearSelection(): void;
```

**Important:** Device selection uses `deviceIndex` (position in rack's device array), NOT `device_type`. Multiple placed devices can share the same `device_type` (same device type), but each has a unique index. Selection must target a single placed device instance.

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

### 6.6 Auto-Reset View Behavior

The view automatically resets (calls `fitAll()`) to center the rack when:

| Trigger            | Description                             |
| ------------------ | --------------------------------------- |
| Layout load        | After loading a `.rackarr.zip` file     |
| New rack creation  | After creating a new rack via the form  |
| Rack height change | After resizing rack height in EditPanel |

This ensures the rack is always visible and centered after significant layout changes.

### 6.7 Toolbar Responsive Behavior

The toolbar adapts to viewport width with two distinct modes:

| Mode      | Viewport | Behavior                                    |
| --------- | -------- | ------------------------------------------- |
| Full      | ≥ 1024px | All action buttons visible in toolbar       |
| Hamburger | < 1024px | Buttons hidden, accessed via hamburger menu |

**Hamburger Mode Behavior:**

- The brand area (logo + text) becomes clickable to open the drawer menu
- Visual styling indicates interactivity (button-like border/outline)
- The hamburger icon (☰) appears next to the brand
- No action buttons visible except theme toggle (far right)
- Drawer slides in from right with all action items

**Full Mode Behavior:**

- Brand area is NOT clickable (no drawer interaction)
- All action buttons visible in toolbar
- No hamburger icon visible
- Standard toolbar layout

---

## 7. Keyboard Shortcuts

| Shortcut                  | Action                                              |
| ------------------------- | --------------------------------------------------- |
| `Escape`                  | Clear selection / close panels                      |
| `Ctrl+Z`                  | Undo                                                |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo                                                |
| `Delete` / `Backspace`    | Delete selected                                     |
| `↑` / `↓`                 | Move device in rack (increment = device `u_height`) |
| `F`                       | Fit all (reset view)                                |
| `I`                       | Toggle display mode                                 |
| `A`                       | Toggle airflow mode                                 |
| `Ctrl+S`                  | Save layout                                         |
| `Ctrl+O`                  | Load layout                                         |
| `Ctrl+E`                  | Export dialog                                       |
| `?`                       | Help panel                                          |

---

## 8. Export Formats

### 8.1 Image Export

| Format | Features                |
| ------ | ----------------------- |
| PNG    | Transparency support    |
| JPEG   | Smaller file size       |
| SVG    | Vector, scalable        |
| PDF    | Print-ready, multi-page |

### 8.2 Data Export

| Format | Features                              |
| ------ | ------------------------------------- |
| CSV    | Spreadsheet-compatible inventory list |

**CSV Columns:**

| Column       | Description                     |
| ------------ | ------------------------------- |
| Position     | U position in rack (1-indexed)  |
| Name         | Custom instance name (or empty) |
| Model        | Device type model/display name  |
| Manufacturer | Manufacturer name (or empty)    |
| U_Height     | Device height in rack units     |
| Category     | Device category                 |
| Face         | Mounting face (front/rear/both) |

**Example CSV output:**

```csv
Position,Name,Model,Manufacturer,U_Height,Category,Face
42,Web Server 1,PowerEdge R650,Dell,1,server,front
40,Core Switch,USW-Pro-48-PoE,Ubiquiti,1,network,front
38,,1U Blank,,1,blank,front
```

### 8.3 Export Options

```typescript
interface ExportOptions {
	format: 'png' | 'jpeg' | 'svg' | 'pdf' | 'csv';
	scope: 'all' | 'selected';
	background: 'dark' | 'light' | 'transparent';
	exportView: 'front' | 'rear' | 'both';
	displayMode: 'label' | 'image';
	airflowMode: boolean;
	includeNames: boolean;
	includeLegend: boolean;
}
```

### 8.4 File Naming Convention

Exported files use a consistent naming pattern:

```
{layout-name}-{view}-{YYYY-MM-DD}.{ext}
```

| Component   | Description           | Example                 |
| ----------- | --------------------- | ----------------------- |
| layout-name | Slugified layout name | `my-homelab`            |
| view        | Export view           | `front`, `rear`, `both` |
| YYYY-MM-DD  | Export date           | `2025-12-12`            |
| ext         | File extension        | `png`, `pdf`, `csv`     |

**Examples:**

- `my-homelab-front-2025-12-12.png`
- `my-homelab-both-2025-12-12.pdf`
- `my-homelab-2025-12-12.csv` (CSV has no view)

### 8.5 Export Dialog

The export dialog includes:

| Feature               | Description                                      |
| --------------------- | ------------------------------------------------ |
| Format selector       | Dropdown for PNG/JPEG/SVG/PDF/CSV                |
| Options panel         | Format-specific options (background, view, etc.) |
| **Thumbnail preview** | Small preview of export output before download   |
| Export button         | Triggers download with generated filename        |

### 8.6 Export Quality Requirements

Image exports must meet these quality standards:

| Requirement          | Specification                                                   |
| -------------------- | --------------------------------------------------------------- |
| **Margins**          | Consistent padding around rack (min 20px)                       |
| **Dual-view layout** | Front and rear views side-by-side with equal spacing            |
| **Borders/lines**    | Crisp rack rails and device borders, no anti-aliasing artifacts |
| **Text rendering**   | Sharp labels, correct font sizing, proper alignment             |
| **Canvas match**     | Export output must match on-screen canvas appearance            |

---

## 9. Design Tokens

### 9.1 Token Layers

1. **Primitives** — Raw values (colors, spacing)
2. **Semantic** — Purpose-based (bg, text, border)
3. **Component** — Component-specific (rack, toolbar)

### 9.2 Key Tokens

```css
/* Spacing (4px base) */
--space-0: 0;
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */

/* Typography */
--font-size-2xs: 0.625rem; /* 10px */
--font-size-xs: 0.6875rem; /* 11px */
--font-size-sm: 0.8125rem; /* 13px */
--font-size-base: 0.875rem; /* 14px */
--font-size-md: 1rem; /* 16px */
--font-size-lg: 1.125rem; /* 18px */

/* Rack (stays dark in both themes) */
--rack-u-height: 17.78px;
--rack-width: 482.6px;
--rack-rail-width: 30px;

/* Component sizes */
--toolbar-height: 56px;
--sidebar-width: 280px;
--drawer-width: 320px;

/* Z-Index Layers */
--z-sidebar: 10;
--z-drawer-backdrop: 99;
--z-drawer: 100;
--z-modal: 200;
--z-toast: 300;

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

## 10. Category Colors & Icons

Each device category has an assigned color and icon from [Lucide](https://lucide.dev).

| Category           | Color      | Hex     | Lucide Icon            |
| ------------------ | ---------- | ------- | ---------------------- |
| `server`           | Blue       | #4A90D9 | `server`               |
| `network`          | Purple     | #7B68EE | `network`              |
| `patch-panel`      | Slate      | #708090 | `ethernet-port`        |
| `power`            | Red        | #DC143C | `zap`                  |
| `storage`          | Green      | #228B22 | `hard-drive`           |
| `kvm`              | Orange     | #FF8C00 | `monitor`              |
| `av-media`         | Purple     | #9932CC | `speaker`              |
| `cooling`          | Teal       | #00CED1 | `fan`                  |
| `shelf`            | Brown      | #8B4513 | `align-end-horizontal` |
| `blank`            | Dark Slate | #2F4F4F | `circle-off`           |
| `cable-management` | Steel Blue | #4682B4 | `cable`                |
| `other`            | Gray       | #808080 | `circle-help`          |

---

## 11. Starter Library

### 11.1 Overview

The starter library provides 26 pre-defined generic device types for common homelab equipment. These are automatically populated in new layouts, giving users immediate access to typical rack-mountable gear without needing to create custom device types.

**Design Principles:**

- **Generic naming** — Device types use descriptive names (e.g., "1U Server", "24-Port Switch"), not branded product names
- **Representative images** — Bundled images show recognizable gear (e.g., Dell R630 image for "1U Server") for visual familiarity
- **Category-based coloring** — Each device type inherits its color from its category
- **Extensible** — Users can add custom device types alongside starter library entries

### 11.2 Device Types (26 items)

| Category             | Device Types                                       | Half-Depth? |
| -------------------- | -------------------------------------------------- | ----------- |
| **Server**           | 1U Server, 2U Server, 4U Server                    | No          |
| **Network**          | 24-Port Switch, 48-Port Switch, 1U Router/Firewall | No          |
| **Patch Panel**      | 24-Port Patch Panel, 48-Port Patch Panel           | Yes         |
| **Storage**          | 1U Storage, 2U Storage, 4U Storage                 | No          |
| **Power**            | 1U PDU, 2U UPS, 4U UPS                             | No          |
| **KVM**              | 1U KVM, 1U Console Drawer                          | No          |
| **AV/Media**         | 1U Receiver, 2U Amplifier                          | No          |
| **Cooling**          | 1U Fan Panel                                       | No          |
| **Blank**            | 0.5U Blank, 1U Blank, 2U Blank                     | Yes         |
| **Shelf**            | 1U Shelf, 2U Shelf                                 | Yes         |
| **Cable Management** | 1U Brush Panel, 1U Cable Management                | Yes         |

> **Note:** Half-depth devices (`is_full_depth: false`) can share the same U position with other half-depth devices on the opposite face. See Section 3.7 for collision rules.

### 11.3 Implementation

The starter library is defined in `src/lib/data/starterLibrary.ts`:

```typescript
interface StarterDeviceSpec {
	name: string;
	u_height: number;
	category: DeviceCategory;
	is_full_depth?: boolean; // Default: true; false for half-depth devices
}

const STARTER_DEVICES: StarterDeviceSpec[] = [
	{ name: '1U Server', u_height: 1, category: 'server' },
	{ name: '24-Port Switch', u_height: 1, category: 'network' },
	{ name: '1U Blank', u_height: 1, category: 'blank', is_full_depth: false }
	// ... etc
];

export function getStarterLibrary(): DeviceType[] {
	return STARTER_DEVICES.map((spec) => ({
		slug: slugify(spec.name),
		u_height: spec.u_height,
		model: spec.name,
		is_full_depth: spec.is_full_depth, // undefined = true default
		rackarr: {
			colour: CATEGORY_COLOURS[spec.category],
			category: spec.category
		}
	}));
}
```

### 11.4 Slug Generation

Device slugs are generated from names using the `slugify()` utility:

| Name                | Generated Slug        |
| ------------------- | --------------------- |
| 1U Server           | `1u-server`           |
| 24-Port Switch      | `24-port-switch`      |
| 1U Router/Firewall  | `1u-router-firewall`  |
| 0.5U Blank          | `0-5u-blank`          |
| 1U Cable Management | `1u-cable-management` |

### 11.5 Bundled Images

Active devices (~6 of 26) have pre-bundled WebP images for immediate visual representation in image display mode. Images are sourced from the NetBox Device Type Library (CC0 licensed) and processed to 400px max width.

| Category | Devices with Bundled Images     |
| -------- | ------------------------------- |
| Server   | 1U Server, 2U Server, 4U Server |
| Network  | 48-Port Switch                  |
| Storage  | 2U Storage, 4U Storage          |

Passive/generic items display as category-colored rectangles (no bundled images):

- Blanks, Shelves, Patch Panels, Cable Management, PDU, Fan Panel, 1U KVM, AV/Media

See Section 16 for full Device Image System documentation.

### 11.6 Brand Starter Packs

In addition to the generic starter library, brand-specific device packs provide curated collections of popular manufacturer equipment.

#### 11.6.1 Organization

Brand packs are organized as **collapsible sections** in the device palette:

| Section  | Default State | Contents                |
| -------- | ------------- | ----------------------- |
| Generic  | Expanded      | 26 generic device types |
| Ubiquiti | Collapsed     | 15-20 Ubiquiti devices  |
| Mikrotik | Collapsed     | 15-20 Mikrotik devices  |

**Behavior:**

- Each section header shows device count: "Ubiquiti (18)"
- Click section header to expand/collapse
- Search spans ALL sections (including collapsed)
- Search results auto-expand relevant section
- Multiple sections can be expanded simultaneously

#### 11.6.2 Brand Pack Data Model

Brand pack devices use the standard `DeviceType` interface with:

- `manufacturer` field populated (e.g., "Ubiquiti", "Mikrotik")
- `model` field contains product name (e.g., "USW-Pro-24-PoE")
- `slug` generated from model name (e.g., "usw-pro-24-poe")
- Category and properties assigned per device

#### 11.6.3 Ubiquiti Starter Pack

| Device          | Category  | U-Height | Full Depth | Airflow       |
| --------------- | --------- | -------- | ---------- | ------------- |
| USW-Pro-24      | `network` | 1U       | Yes        | side-to-rear  |
| USW-Pro-48      | `network` | 1U       | Yes        | side-to-rear  |
| USW-Pro-24-PoE  | `network` | 1U       | Yes        | side-to-rear  |
| USW-Pro-48-PoE  | `network` | 1U       | Yes        | side-to-rear  |
| USW-Aggregation | `network` | 1U       | Yes        | side-to-rear  |
| UDM-Pro         | `network` | 1U       | Yes        | front-to-rear |
| UDM-SE          | `network` | 1U       | Yes        | front-to-rear |
| UNVR            | `storage` | 1U       | Yes        | front-to-rear |
| UNVR-Pro        | `storage` | 2U       | Yes        | front-to-rear |
| USP-PDU-Pro     | `power`   | 1U       | No         | passive       |

> **Note:** Additional devices may be added during implementation. Cloud Key Gen2+ excluded (not rack-mountable without kit).

#### 11.6.4 Mikrotik Starter Pack

| Device             | Category  | U-Height | Full Depth | Airflow       |
| ------------------ | --------- | -------- | ---------- | ------------- |
| CRS326-24G-2S+     | `network` | 1U       | Yes        | side-to-rear  |
| CRS328-24P-4S+     | `network` | 1U       | Yes        | side-to-rear  |
| CRS309-1G-8S+      | `network` | 1U       | Yes        | side-to-rear  |
| CCR2004-1G-12S+2XS | `network` | 1U       | Yes        | front-to-rear |
| RB5009UG+S+IN      | `network` | 1U       | Yes        | front-to-rear |

> **Note:** Additional netPower series devices may be added during implementation.

#### 11.6.5 Bundling

Brand packs are **bundled with the application**:

- Device definitions included in app bundle
- Images (best-effort from NetBox library) included as WebP
- No network requests required — fully offline capable
- Fallback to category-colored rectangles for missing images

---

## 12. Commands

### 12.1 Development

```bash
npm run dev          # Dev server (localhost:5173)
npm run build        # Production build
npm run preview      # Preview build
```

### 12.2 Testing

```bash
npm run test         # Unit tests (watch)
npm run test:run     # Unit tests (CI)
npm run test:e2e     # E2E tests (Playwright)
```

### 12.3 Quality

```bash
npm run lint         # ESLint
npm run format       # Prettier
npm run check        # Svelte type check
```

---

## 13. Deployment

- **Platform:** GitHub Pages
- **Trigger:** Push to `main` branch
- **Workflow:** GitHub Actions
- **Manual:** `git push github main`

---

## 14. Version History

| Version | Changes                                                                      |
| ------- | ---------------------------------------------------------------------------- |
| 0.6.0   | Brand starter packs, export UX overhaul, CSV export, power device properties |
| 0.5.0   | Type system consolidation, legacy comments cleanup                           |
| 0.4.9   | Airflow visualization, selection bug fix                                     |
| 0.4.8   | Design token audit, CSS cleanup                                              |
| 0.4.0   | Breaking: removed legacy format support                                      |
| 0.3.x   | Undo/redo, YAML archive, device images                                       |
| 0.2.x   | Single-rack mode, fixed sidebar                                              |
| 0.1.x   | Initial release                                                              |

---

## 15. Airflow Visualization (v0.4.9)

Visual overlay for device airflow direction, helping identify thermal conflicts.

### 15.1 Airflow Types

| Type            | Description                         | Visual                      |
| --------------- | ----------------------------------- | --------------------------- |
| `passive`       | No active cooling (panels, shelves) | Gray hollow circle          |
| `front-to-rear` | Standard server airflow             | Blue stripe front, red rear |
| `rear-to-front` | Reverse airflow (some network gear) | Red stripe front, blue rear |
| `side-to-rear`  | Side intake (switches)              | Blue stripe front, red rear |

### 15.2 Visual Design

- **Edge stripe** — 4px colored stripe on device edge (left=front view, right=rear view)
- **Arrow indicator** — Small animated chevron next to stripe showing direction
- **Colors** — Blue (#60a5fa) = intake, Red (#f87171) = exhaust, Gray (#9ca3af) = passive
- **Conflict border** — Orange (#f59e0b) border on devices with airflow conflicts

### 15.3 Conflict Detection

Conflicts detected when exhaust of one device feeds intake of adjacent device:

- Front-to-rear device above rear-to-front device
- Rear-to-front device above front-to-rear device

### 15.4 UI Integration

- **Toggle** — `A` key or toolbar button toggles airflow visualization
- **Export** — Airflow indicators included in image/PDF exports when enabled
- **EditPanel** — Dropdown to change device airflow type
- **AddDeviceForm** — Dropdown to set airflow on new devices

---

## 16. Device Image System

### 16.1 Overview

Two-level image storage system with device type defaults and placement-level overrides.

### 16.2 Image Sources

| Source                    | Storage Location                | Purpose                   |
| ------------------------- | ------------------------------- | ------------------------- |
| Bundled                   | `src/lib/assets/device-images/` | Starter library defaults  |
| User upload (device type) | In-memory → archive             | Custom device type images |
| User upload (placement)   | In-memory → archive             | Per-placement overrides   |

### 16.3 Image Lookup Priority

When rendering a device, images are resolved in this order:

1. **Placement override** — Custom image for this specific placed device (keyed by `PlacedDevice.id`)
2. **Device type default** — Image uploaded when creating/editing the device type (keyed by `DeviceType.slug`)
3. **Bundled default** — Pre-bundled image for starter library devices (keyed by slug)
4. **No image** — Falls back to category-colored rectangle

### 16.4 Image Processing

User-uploaded images are auto-processed for consistency:

| Processing Step | Details                                             |
| --------------- | --------------------------------------------------- |
| Resize          | Max 400px width (preserves aspect ratio)            |
| Format          | Convert to WebP                                     |
| Purpose         | Keeps archives lean, consistent with bundled images |

Images under 400px width are not resized. Processing happens client-side using canvas API.

### 16.5 Bundled Images

~15 active devices from the starter library have pre-bundled WebP images:

| Category | Devices with Images                                               |
| -------- | ----------------------------------------------------------------- |
| Server   | 1U Server, 2U Server, 4U Server                                   |
| Network  | 8-Port Switch, 24-Port Switch, 48-Port Switch, 1U Router/Firewall |
| Storage  | 1U Storage, 2U Storage, 4U Storage                                |
| Power    | 2U UPS, 4U UPS                                                    |
| KVM      | 1U Console Drawer                                                 |

Passive/generic items remain as category-colored rectangles:

- Blanks (0.5U, 1U, 2U)
- Shelves (1U, 2U)
- Patch panels, Cable management, PDU, Fan Panel, Receiver, Amplifier

### 16.6 Image Store Architecture

```typescript
// Two separate stores for different image levels
const deviceTypeImages = new SvelteMap<string, DeviceImageData>(); // key: slug
const placementImages = new SvelteMap<string, DeviceImageData>(); // key: placement id

// Combined lookup with fallback
function getImageForPlacement(
	slug: string,
	placementId: string,
	face: 'front' | 'rear'
): ImageData | undefined {
	// 1. Check placement override
	const override = placementImages.get(placementId)?.[face];
	if (override) return override;

	// 2. Fall back to device type default
	const typeDefault = deviceTypeImages.get(slug)?.[face];
	if (typeDefault) return typeDefault;

	// 3. Check bundled images (loaded at app init)
	// (already in deviceTypeImages from loadBundledImages())

	return undefined; // Colored rectangle fallback
}
```

### 16.7 EditPanel Image Override UI

When a device is selected, EditPanel shows:

| State                     | UI                                               |
| ------------------------- | ------------------------------------------------ |
| Using device type default | "Using default image" label                      |
| Has placement override    | "Custom image" label + "Reset to default" button |
| No image available        | Image upload prompt                              |

Users can upload a custom image for the specific placement, which overrides the device type default for that instance only.

---

## 17. Out of Scope

Features that will NOT be implemented:

- Multiple racks per project
- Backend/database
- User accounts
- Native mobile apps
- Internet Explorer support

---

_This specification is the technical source of truth for Rackarr._
