---
created: 2025-11-27T01:57
updated: 2025-11-28T23:27
---

# Rackarr — Technical Specification

**Version:** 0.1.0 (MVP)  
**Date:** 2025-11-27  
**Status:** Ready for implementation

---

## 1. Overview

### 1.1 Purpose

Rackarr is a lightweight, FOSS, web-based rack layout designer for homelabbers to plan optimal equipment arrangement before physical mounting.

### 1.2 Core Problem

"I have an 18U rack and a pile of gear — I need to figure out the optimal arrangement before I start mounting."

### 1.3 Target User

Homelabbers planning rack layouts. Desktop browser users only.

### 1.4 Key Design Principles

- **ADHD-friendly:** Minimal decision points, visual clarity
- **Lightweight:** Static frontend, no backend required
- **Portable:** Layouts saved as self-contained YAML files (`.rackarr.yaml`)
- **Interoperable:** NetBox-compatible device definitions for library import
- **FOSS:** MIT licensed

---

## 2. Technical Architecture

### 2.1 Stack

| Component     | Technology                                                          |
| ------------- | ------------------------------------------------------------------- |
| Framework     | Svelte 5 (runes)                                                    |
| Rendering     | SVG                                                                 |
| Drag-and-drop | svelte-dnd-action (or similar)                                      |
| Persistence   | sessionStorage (work-in-progress), file download/upload (save/load) |
| Data Format   | YAML (js-yaml ~30KB)                                                |
| Validation    | Zod (~12KB) — schema validation + TypeScript type inference         |
| Styling       | CSS custom properties for theming                                   |
| Build         | Vite                                                                |
| Deployment    | Static files (nginx, Docker)                                        |

### 2.2 Browser Support

Modern evergreen browsers only: Chrome, Firefox, Safari, Edge.  
No mobile/tablet support. No IE support.

### 2.3 Deployment

Static files served via nginx or Docker container (`nginx:alpine`).  
No backend, no database.

### 2.4 Repository

| Location    | URL                                             | Purpose                                           |
| ----------- | ----------------------------------------------- | ------------------------------------------------- |
| **Primary** | `https://git.falcon-wahoo.ts.net/gvns/rackarr/` | Forgejo (local infrastructure) — all commits here |
| **Mirror**  | `https://github.com/ggfevans/rackarr`           | GitHub — pushed from primary                      |

---

## 3. User Interface

### 3.1 Layout Structure

Single-page application with:

- **Top toolbar:** Primary actions and controls (48-56px height)
- **Canvas (center):** Rack visualization area, dominant element
- **Left drawer:** Device palette (280-320px width, toggleable)
- **Right drawer:** Edit panel (280-320px width, auto-shows on selection)

### 3.2 Toolbar Contents

| Button/Control        | Action                         |
| --------------------- | ------------------------------ |
| App logo + "Rackarr"  | Branding (links to Help/About) |
| **New Rack**          | Opens new rack form            |
| **Device Palette**    | Toggles left drawer            |
| **Save**              | Download layout as JSON        |
| **Load**              | Upload JSON layout file        |
| **Export**            | Opens export dialog            |
| **Delete**            | Deletes selected item          |
| **Zoom +/-**          | Zoom controls                  |
| **Dark/Light toggle** | Switch theme                   |
| **Help**              | Opens Help/About panel         |

### 3.3 Theme

- Dark mode (default)
- Light mode (primarily for export with white/transparent background)
- Stored in localStorage

### 3.4 Visual Style

Minimal, flat design. No skeuomorphism.

### 3.5 Animations

Minimal and snappy. No decorative animations. All animations serve functional purposes (confirming actions, indicating state changes).

#### 3.5.1 Animation Durations

| Context                 | Duration  | Easing      |
| ----------------------- | --------- | ----------- |
| Hover state transitions | 50-100ms  | ease-out    |
| Drop settle animation   | 100-150ms | ease-out    |
| Drawer open/close       | 150-200ms | ease-out    |
| Theme transition        | 200ms     | ease-in-out |
| Selection highlight     | immediate | —           |

#### 3.5.2 Reduced Motion

Respect user preference for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
	}
}
```

When reduced motion is preferred, state changes should still be visually indicated but without animation (e.g., instant colour change rather than fade).

---

## 4. Rack Visualization

### 4.1 Rack Appearance

- Numbered U positions on left rail (U1 at bottom, counting up)
- Grid lines dividing each U
- Light grey shading inside rack area
- Vertical rails showing 3 rack nut points per U
- Rack name displayed below rack

### 4.2 Rack Dimensions (CSS custom properties, tuneable)

| Element     | Default   | Notes                           |
| ----------- | --------- | ------------------------------- |
| U height    | 20-24px   | 42U = ~840-1008px               |
| Rack width  | 200-240px | Proportional to real dimensions |
| Device text | 12-14px   | Readable at default zoom        |

### 4.3 View

- Front view only for v0.1
- Rear view toggle on roadmap

### 4.4 Multi-Rack Canvas

- Multiple racks displayed in a horizontal row
- Bottom-aligned (racks of different heights align at U1)
- Maximum 6 racks
- Horizontal scroll when racks exceed viewport
- Racks can be reordered via drag-and-drop

### 4.5 Zoom

- Fixed native scale with zoom controls (+/-)
- Range: 50%–200%
- No auto-fit (roadmap: "Fit All" button)

---

## 5. Rack Configuration

### 5.1 Rack Properties

| Property      | Required | Type    | Constraints              | Notes                        |
| ------------- | -------- | ------- | ------------------------ | ---------------------------- |
| id            | Yes      | string  | Auto-generated UUID      |                              |
| name          | Yes      | string  | User-defined             |                              |
| height        | Yes      | number  | 1-100U                   |                              |
| width         | Yes      | number  | 10, 19, 21, 23 inches    | 19 default for v0.1          |
| position      | Yes      | number  | Order in row (0-indexed) |                              |
| form_factor   | Yes      | enum    | See 5.1.1                | Default: `4-post-cabinet`    |
| desc_units    | Yes      | boolean |                          | Default: `false` (ascending) |
| starting_unit | Yes      | number  | Min 1                    | Default: `1`                 |

#### 5.1.1 Form Factor Options

| Value                   | Description               |
| ----------------------- | ------------------------- |
| `4-post-cabinet`        | Enclosed 4-post (default) |
| `4-post-frame`          | Open 4-post frame         |
| `2-post-frame`          | Telco/2-post frame        |
| `wall-cabinet`          | Wall-mounted enclosed     |
| `wall-frame`            | Wall-mounted open frame   |
| `wall-frame-vertical`   | Vertical wall mount       |
| `wall-cabinet-vertical` | Vertical wall cabinet     |

> **v0.1 Note:** UI defaults to `4-post-cabinet` and `width: 19`. Form factor and width selection UI deferred to v0.2. Schema supports all values for future-proofing and NetBox rack type imports.

### 5.2 Creating a Rack

- Dropdown with common sizes: 12U, 18U, 24U, 42U
- Custom input field for 1-100U
- Name field (required)

### 5.3 Rack Deletion

- Requires rack to be selected
- Confirmation dialog if rack contains devices
- If last rack deleted, new rack form auto-opens

### 5.4 Rack Resizing

- Only permitted when rack is empty
- Gentle error message if attempted on populated rack

---

## 6. Device System

### 6.1 Device Properties

Rackarr supports two device definition patterns: **library-style** (NetBox-compatible) and **quick custom**.

#### 6.1.1 Core Properties

| Property | Required | Type   | Constraints               | Notes |
| -------- | -------- | ------ | ------------------------- | ----- |
| slug     | Yes      | string | Pattern: `^[-a-z0-9_]+--- |

created: 2025-11-27T01:57
updated: 2025-11-28T11:34

---

# Rackarr — Technical Specification

**Version:** 0.1.0 (MVP)  
**Date:** 2025-11-27  
**Status:** Ready for implementation

---

## 1. Overview

### 1.1 Purpose

Rackarr is a lightweight, FOSS, web-based rack layout designer for homelabbers to plan optimal equipment arrangement before physical mounting.

### 1.2 Core Problem

"I have an 18U rack and a pile of gear — I need to figure out the optimal arrangement before I start mounting."

### 1.3 Target User

Homelabbers planning rack layouts. Desktop browser users only.

### 1.4 Key Design Principles

- **ADHD-friendly:** Minimal decision points, visual clarity
- **Lightweight:** Static frontend, no backend required
- **Portable:** Layouts saved as self-contained JSON files
- **FOSS:** MIT licensed

---

## 2. Technical Architecture

### 2.1 Stack

| Component     | Technology                                                          |
| ------------- | ------------------------------------------------------------------- |
| Framework     | Svelte 5 (runes)                                                    |
| Rendering     | SVG                                                                 |
| Drag-and-drop | svelte-dnd-action (or similar)                                      |
| Persistence   | sessionStorage (work-in-progress), file download/upload (save/load) |
| Data Format   | YAML (js-yaml ~30KB)                                                |
| Validation    | Zod (~12KB) — schema validation + TypeScript type inference         |
| Styling       | CSS custom properties for theming                                   |
| Build         | Vite                                                                |
| Deployment    | Static files (nginx, Docker)                                        |

### 2.2 Browser Support

Modern evergreen browsers only: Chrome, Firefox, Safari, Edge.  
No mobile/tablet support. No IE support.

### 2.3 Deployment

Static files served via nginx or Docker container (`nginx:alpine`).  
No backend, no database.

### 2.4 Repository

| Location    | URL                                             | Purpose                                           |
| ----------- | ----------------------------------------------- | ------------------------------------------------- |
| **Primary** | `https://git.falcon-wahoo.ts.net/gvns/rackarr/` | Forgejo (local infrastructure) — all commits here |
| **Mirror**  | `https://github.com/ggfevans/rackarr`           | GitHub — pushed from primary                      |

---

## 3. User Interface

### 3.1 Layout Structure

Single-page application with:

- **Top toolbar:** Primary actions and controls (48-56px height)
- **Canvas (center):** Rack visualization area, dominant element
- **Left drawer:** Device palette (280-320px width, toggleable)
- **Right drawer:** Edit panel (280-320px width, auto-shows on selection)

### 3.2 Toolbar Contents

| Button/Control        | Action                         |
| --------------------- | ------------------------------ |
| App logo + "Rackarr"  | Branding (links to Help/About) |
| **New Rack**          | Opens new rack form            |
| **Device Palette**    | Toggles left drawer            |
| **Save**              | Download layout as JSON        |
| **Load**              | Upload JSON layout file        |
| **Export**            | Opens export dialog            |
| **Delete**            | Deletes selected item          |
| **Zoom +/-**          | Zoom controls                  |
| **Dark/Light toggle** | Switch theme                   |
| **Help**              | Opens Help/About panel         |

### 3.3 Theme

- Dark mode (default)
- Light mode (primarily for export with white/transparent background)
- Stored in localStorage

### 3.4 Visual Style

Minimal, flat design. No skeuomorphism.

### 3.5 Animations

Minimal and snappy. No decorative animations. All animations serve functional purposes (confirming actions, indicating state changes).

#### 3.5.1 Animation Durations

| Context                 | Duration  | Easing      |
| ----------------------- | --------- | ----------- |
| Hover state transitions | 50-100ms  | ease-out    |
| Drop settle animation   | 100-150ms | ease-out    |
| Drawer open/close       | 150-200ms | ease-out    |
| Theme transition        | 200ms     | ease-in-out |
| Selection highlight     | immediate | —           |

#### 3.5.2 Reduced Motion

Respect user preference for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
	}
}
```

When reduced motion is preferred, state changes should still be visually indicated but without animation (e.g., instant colour change rather than fade).

---

## 4. Rack Visualization

### 4.1 Rack Appearance

- Numbered U positions on left rail (U1 at bottom, counting up)
- Grid lines dividing each U
- Light grey shading inside rack area
- Vertical rails showing 3 rack nut points per U
- Rack name displayed below rack

### 4.2 Rack Dimensions (CSS custom properties, tuneable)

| Element     | Default   | Notes                           |
| ----------- | --------- | ------------------------------- |
| U height    | 20-24px   | 42U = ~840-1008px               |
| Rack width  | 200-240px | Proportional to real dimensions |
| Device text | 12-14px   | Readable at default zoom        |

### 4.3 View

- Front view only for v0.1
- Rear view toggle on roadmap

### 4.4 Multi-Rack Canvas

- Multiple racks displayed in a horizontal row
- Bottom-aligned (racks of different heights align at U1)
- Maximum 6 racks
- Horizontal scroll when racks exceed viewport
- Racks can be reordered via drag-and-drop

### 4.5 Zoom

- Fixed native scale with zoom controls (+/-)
- Range: 50%–200%
- No auto-fit (roadmap: "Fit All" button)

---

## 5. Rack Configuration

### 5.1 Rack Properties

| Property      | Required | Type    | Constraints              | Notes                        |
| ------------- | -------- | ------- | ------------------------ | ---------------------------- |
| id            | Yes      | string  | Auto-generated UUID      |                              |
| name          | Yes      | string  | User-defined             |                              |
| height        | Yes      | number  | 1-100U                   |                              |
| width         | Yes      | number  | 10, 19, 21, 23 inches    | 19 default for v0.1          |
| position      | Yes      | number  | Order in row (0-indexed) |                              |
| form_factor   | Yes      | enum    | See 5.1.1                | Default: `4-post-cabinet`    |
| desc_units    | Yes      | boolean |                          | Default: `false` (ascending) |
| starting_unit | Yes      | number  | Min 1                    | Default: `1`                 |

#### 5.1.1 Form Factor Options

| Value                   | Description               |
| ----------------------- | ------------------------- |
| `4-post-cabinet`        | Enclosed 4-post (default) |
| `4-post-frame`          | Open 4-post frame         |
| `2-post-frame`          | Telco/2-post frame        |
| `wall-cabinet`          | Wall-mounted enclosed     |
| `wall-frame`            | Wall-mounted open frame   |
| `wall-frame-vertical`   | Vertical wall mount       |
| `wall-cabinet-vertical` | Vertical wall cabinet     |

> **v0.1 Note:** UI defaults to `4-post-cabinet` and `width: 19`. Form factor and width selection UI deferred to v0.2. Schema supports all values for future-proofing and NetBox rack type imports.

### 5.2 Creating a Rack

- Dropdown with common sizes: 12U, 18U, 24U, 42U
- Custom input field for 1-100U
- Name field (required)

### 5.3 Rack Deletion

- Requires rack to be selected
- Confirmation dialog if rack contains devices
- If last rack deleted, new rack form auto-opens

### 5.4 Rack Resizing

- Only permitted when rack is empty
- Gentle error message if attempted on populated rack

---

       | Unique identifier                  |

| u_height | Yes | number | 0.5-100, multiples of 0.5 | Supports half-U devices |
| is_full_depth | Yes | boolean | | Default: `true` |
| category | Yes | enum | See 6.2 | Rackarr-specific |
| colour | Yes | string | Hex colour `#RRGGBB` | Display colour, derived from slug |

#### 6.1.2 Identification (One Pattern Required)

**Pattern A: NetBox Library Style**
| Property | Required | Type | Constraints | Notes |
| ------------ | -------- | ------ | --------------------- | ------------------------ |
| manufacturer | Yes* | string | Max 100 chars | From NetBox library |
| model | Yes* | string | Max 100 chars | From NetBox library |

**Pattern B: Quick Custom Style**
| Property | Required | Type | Constraints | Notes |
| -------- | -------- | ------ | ------------- | ------------------ |
| name | Yes\* | string | User-defined | Simple custom name |

> \*One pattern required. If `name` is provided without `manufacturer`/`model`, `slug` is auto-generated from name. If both patterns provided, display prefers `manufacturer` + `model`.

#### 6.1.3 Optional Properties

| Property    | Type    | Constraints              | Notes                       |
| ----------- | ------- | ------------------------ | --------------------------- |
| part_number | string  | Max 50 chars             | SKU/alternative ID          |
| airflow     | enum    | See 6.1.4                | v0.2 visualization          |
| weight      | number  | Min 0, multiples of 0.01 | Requires weight_unit        |
| weight_unit | enum    | `kg`, `g`, `lb`, `oz`    | Required if weight provided |
| notes       | string  | Free text                | User notes                  |
| front_image | boolean |                          | Future: has front image     |
| rear_image  | boolean |                          | Future: has rear image      |

#### 6.1.4 Airflow Options

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

> **v0.1 Note:** Airflow stored in schema but not visualized until v0.2.

### 6.2 Device Categories

Fixed list with built-in SVG icons:

| Category    | Icon represents  |
| ----------- | ---------------- |
| server      | Rack server      |
| network     | Switch/router    |
| patch-panel | Patch panel      |
| power       | PDU/UPS          |
| storage     | Disk shelf       |
| kvm         | KVM/console      |
| av-media    | AV equipment     |
| cooling     | Fans/ventilation |
| blank       | Blanking panel   |
| other       | Generic device   |

### 6.3 Starter Device Library

Pre-populated generic devices using the quick custom pattern:

| Category    | Starter Devices                   |
| ----------- | --------------------------------- |
| server      | 1U Server, 2U Server, 4U Server   |
| network     | 1U Switch, 1U Router, 1U Firewall |
| patch-panel | 1U Patch Panel, 2U Patch Panel    |
| power       | 1U PDU, 2U UPS, 4U UPS            |
| storage     | 2U Storage, 4U Storage            |
| kvm         | 1U KVM, 1U Console Drawer         |
| av-media    | 1U Receiver, 2U Amplifier         |
| cooling     | 1U Fan Panel, 0.5U Blanking Fan   |
| blank       | 0.5U Blank, 1U Blank, 2U Blank    |
| other       | 1U Generic, 2U Generic            |

> **Note:** Starter devices are saved into the project's `deviceLibrary` like user-created devices. Includes 0.5U options for half-U support.

### 6.4 Device Palette (Left Drawer)

- Search field at top
- Devices grouped by category
- "Add Device" button opens form with:
  - Name (required)
  - Height in U (required)
  - Category (required, dropdown)
  - Colour (required, colour picker with default)
  - Notes (optional, textarea)

---

## 7. Interaction Model

### 7.1 Placing Devices

1. Open device palette (toolbar button or `D` key)
2. Drag device from palette onto rack
3. Device snaps to U positions
4. Bottom-anchored: dropped U is lowest U occupied

### 7.2 Moving Devices

- Drag device within rack to new position
- Arrow keys (Up/Down) move device 1U
- Drag device from one rack to another rack
- Snaps to valid U positions

### 7.3 Collision Handling

- **Block approach:** Cannot drop on occupied U positions
- Invalid drop zones highlight (red/grey)
- Cursor changes to "no-drop"
- Device taller than remaining space: same blocking behaviour

### 7.4 Selection

- **Single-select only**
- Click device → device selected (visible outline)
- Click empty rack space → rack selected (visible outline)
- Click canvas (outside racks) → deselect all
- Escape key → deselect all, close drawers

### 7.5 Edit Panel (Right Drawer)

- Auto-opens when item selected
- Auto-closes on deselect
- Shows editable properties for selected device or rack

### 7.6 Deleting Items

- Select item, then Delete/Backspace key
- Or select item, then click Delete button in toolbar
- Rack deletion requires confirmation if not empty

### 7.7 Rack Reordering

- Drag rack by header/frame area
- Snaps to positions in the row
- All devices move with rack
- Arrow keys (Left/Right) when rack selected

### 7.8 Drag-and-Drop Interaction States

Every draggable element (device in palette, device in rack, rack) must support these visual states:

| State                   | Trigger                                    | Visual Treatment                                                                             |
| ----------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| **Resting**             | Default                                    | Normal appearance, no effects                                                                |
| **Hover**               | Cursor enters element                      | Subtle brightness increase (+5-10%), `cursor: grab`                                          |
| **Grabbed**             | Mouse down / Space key                     | Elevation shadow, slight scale (1.02), `cursor: grabbing`                                    |
| **Dragging**            | Mouse move while grabbed                   | Element follows cursor; semi-transparent "ghost" (30-50% opacity) remains at origin position |
| **Over valid target**   | Dragged element over valid drop zone       | Target U slot(s) highlight with `--colour-valid`; ghost outline shows landing position       |
| **Over invalid target** | Dragged element over occupied/invalid zone | Target highlights with `--colour-invalid`; `cursor: no-drop`                                 |
| **Dropped**             | Mouse up / Space key on valid target       | 100-150ms settle animation to final position; ghost disappears                               |
| **Cancelled**           | Escape key / drop on invalid               | Element returns to origin with settle animation                                              |

#### 7.8.1 Ghost Element Behaviour

- Ghost remains at the **origin position** during drag
- Ghost opacity: 30-50% (tuneable via `--device-ghost-opacity`)
- Ghost indicates "this is where the item came from"
- On drop: ghost fades out as element settles into new position
- On cancel: dragged element animates back to ghost position, ghost fades

#### 7.8.2 Drop Zone Preview

While dragging a device over a rack:

- Show outline/highlight of the **exact U slots** the device will occupy
- Use `--colour-valid` for available slots
- Use `--colour-invalid` for occupied/blocked slots
- Preview updates in real-time as cursor moves

### 7.9 Device Movement Logic

When moving a device (drag or keyboard):

#### 7.9.1 Vertical Movement (within rack)

- Device moves to the **next available U position** that can accommodate its height
- If an adjacent device blocks the path, the moving device **leapfrogs** over it to the next valid position
- Movement stops at rack boundaries (U1 at bottom, max U at top)

**Example:** 2U device at U5, 1U device at U7:

- Moving up: 2U device jumps from U5 → U8 (leapfrogs over the 1U device)
- Moving down: 2U device moves U5 → U3 → U1 (if space available)

#### 7.9.2 Lateral Movement (between racks)

- `Shift + ←/→` moves selected device to adjacent rack
- Device placed at the **same U position** if available
- If same position is occupied, device placed at **nearest available position**
- If no valid position exists in target rack, move is blocked with visual feedback

---

## 8. Keyboard Shortcuts

### 8.1 Navigation Model (Roving Tabindex)

Keyboard navigation uses the **roving tabindex** pattern for efficient navigation:

1. **Tab** moves focus between major UI regions: Toolbar → Canvas → Left Drawer → Right Drawer
2. **Within the canvas**, Tab moves focus to the first/next rack
3. **Within a rack**, Arrow keys navigate between devices (roving focus)
4. **Enter/Space** selects the focused item
5. **Escape** deselects and returns focus to the rack level

This reduces tab stops while maintaining full keyboard accessibility.

### 8.2 Shortcut Reference

| Key                | Context         | Action                                     |
| ------------------ | --------------- | ------------------------------------------ |
| Tab                | Global          | Move to next UI region/rack                |
| Shift + Tab        | Global          | Move to previous UI region/rack            |
| ↑ / ↓              | Device selected | Move device to next available U (leapfrog) |
| Shift + ← / →      | Device selected | Move device to adjacent rack               |
| ← / →              | Rack selected   | Reorder rack position                      |
| ↑ / ↓              | Within rack     | Navigate to adjacent device                |
| Enter / Space      | Focused item    | Select item / Grab for keyboard drag       |
| Space              | While grabbed   | Drop item at current position              |
| Delete / Backspace | Item selected   | Delete selected item                       |
| Escape             | Global          | Deselect, close drawers, cancel drag       |
| D                  | Global          | Toggle device palette                      |
| Ctrl/Cmd + S       | Global          | Save layout                                |
| Ctrl/Cmd + O       | Global          | Load layout                                |
| Ctrl/Cmd + E       | Global          | Export dialog                              |
| ?                  | Global          | Keyboard shortcut reference                |

### 8.3 Keyboard Drag-and-Drop

Full drag-and-drop functionality is available via keyboard:

1. Navigate to device using Tab/Arrow keys
2. Press **Space** to grab (enters grabbed state)
3. Use **↑/↓** to move within rack, **Shift + ←/→** to move between racks
4. Press **Space** to drop at current position
5. Press **Escape** to cancel and return to origin

---

## 9. Persistence

### 9.1 Session Auto-Save

- Work-in-progress saved to sessionStorage
- Survives page refresh
- Clears on tab/window close
- No restore prompt on startup

### 9.2 Manual Save/Load

- **Save:** Downloads `.rackarr.yaml` file to user's computer
- **Load:** File picker to upload YAML file
- Invalid/corrupted YAML shows validation errors, stays on current layout

### 9.3 Unsaved Changes Warning

Browser `beforeunload` prompt when closing tab with unsaved changes.

### 9.4 Local Storage

Used only for theme preference (dark/light).

---

## 10. Data Format & Schema

### 10.1 File Format

Rackarr uses YAML for all data persistence:

| File Type         | Extension       | Purpose                        |
| ----------------- | --------------- | ------------------------------ |
| Project file      | `.rackarr.yaml` | Complete rack layout           |
| Equipment library | `.yaml`         | NetBox-compatible device types |

### 10.2 Project File Structure

```yaml
version: '0.1.0'
name: My Homelab Rack
created: 2025-11-27T10:30:00Z
modified: 2025-11-27T12:45:00Z

settings:
  theme: dark

# Device definitions (library)
deviceLibrary:
  - slug: synology-ds920-plus
    manufacturer: Synology
    model: DS920+
    u_height: 2
    is_full_depth: true
    category: storage
    colour: '#228B22'
    airflow: front-to-rear
    notes: '4-bay NAS'

  - slug: my-custom-server
    name: Custom Build Server
    u_height: 4
    is_full_depth: true
    category: server
    colour: '#4A90D9'

# Rack definitions
racks:
  - id: rack-uuid-001
    name: Main Rack
    height: 18
    width: 19
    position: 0
    form_factor: 4-post-cabinet
    desc_units: false
    starting_unit: 1

    # Placed devices reference library by slug
    devices:
      - slug: synology-ds920-plus
        position: 1 # Bottom U occupied

      - slug: my-custom-server
        position: 10
```

### 10.3 Schema Notes

- `version`: Semantic version for format migrations
- `deviceLibrary`: All device definitions (both imported and custom)
- `devices[].slug`: References `deviceLibrary[].slug`
- `devices[].position`: Bottom U occupied by device (1-indexed)
- `racks[].position`: Order in horizontal row (0-indexed)
- Same device definition can be placed multiple times across racks

### 10.4 Validation Strategy

Rackarr uses Zod for schema validation with two modes:

#### 10.4.1 Strict Mode (Project Files)

Project files (`.rackarr.yaml`) are validated strictly on save and load:

```typescript
// All required fields must be present
// Unknown fields cause validation failure
// Type coercion applied (strings → numbers where appropriate)

const result = ProjectSchema.safeParse(data);
if (!result.success) {
	// Detailed, user-friendly error messages
	showValidationErrors(result.error.format());
}
```

#### 10.4.2 Loose Mode (NetBox Imports)

NetBox device type imports use loose parsing:

```typescript
// Only extract fields we care about
// Ignore unknown fields (interfaces, ports, etc.)
// Apply defaults for missing optional fields

const result = NetBoxDeviceSchema.partial().passthrough().safeParse(data);
```

### 10.5 Zod Schema Definitions

```typescript
// src/lib/schemas/device.ts
import { z } from 'zod';

// Airflow enum (matches NetBox)
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

// Weight unit enum
const WeightUnitSchema = z.enum(['kg', 'g', 'lb', 'oz']);

// Category enum (Rackarr-specific)
const CategorySchema = z.enum([
	'server',
	'network',
	'patch-panel',
	'power',
	'storage',
	'kvm',
	'av-media',
	'cooling',
	'blank',
	'other'
]);

// Device definition
export const DeviceSchema = z
	.object({
		// Identification (one pattern required)
		slug: z.string().regex(/^[-a-z0-9_]+$/),
		name: z.string().optional(),
		manufacturer: z.string().max(100).optional(),
		model: z.string().max(100).optional(),
		part_number: z.string().max(50).optional(),

		// Physical properties
		u_height: z.number().min(0.5).max(100).multipleOf(0.5),
		is_full_depth: z.boolean().default(true),

		// Thermal (v0.2 visualization)
		airflow: AirflowSchema.optional(),

		// Weight (v0.4 feature)
		weight: z.number().min(0).multipleOf(0.01).optional(),
		weight_unit: WeightUnitSchema.optional(),

		// Rackarr-specific
		category: CategorySchema,
		colour: z.string().regex(/^#[a-fA-F0-9]{6}$/),
		notes: z.string().optional(),

		// Future: images
		front_image: z.boolean().optional(),
		rear_image: z.boolean().optional()
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
	position: z.number().int().min(1)
});

export const RackSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	height: z.number().int().min(1).max(100),
	width: z.number().int(), // 10, 19, 21, 23
	position: z.number().int().min(0),
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
		theme: z.enum(['dark', 'light']).default('dark')
	}),
	deviceLibrary: z.array(DeviceSchema).default([]),
	racks: z.array(RackSchema).default([])
});

export type Project = z.infer<typeof ProjectSchema>;
```

### 10.6 NetBox Import Schema

For importing from `netbox-community/devicetype-library`:

```typescript
// Loose schema — extracts what we need, ignores the rest
export const NetBoxDeviceImportSchema = z
	.object({
		manufacturer: z.string(),
		model: z.string(),
		slug: z.string(),
		u_height: z.number(),
		is_full_depth: z.boolean().default(true),
		part_number: z.string().optional(),
		airflow: AirflowSchema.optional(),
		weight: z.number().optional(),
		weight_unit: WeightUnitSchema.optional(),
		front_image: z.boolean().optional(),
		rear_image: z.boolean().optional(),
		comments: z.string().optional()
	})
	.passthrough(); // Allow unknown fields

// Transform to Rackarr device
function importNetBoxDevice(yaml: unknown): Device {
	const parsed = NetBoxDeviceImportSchema.parse(yaml);
	return {
		...parsed,
		category: 'other', // User recategorizes
		colour: categoryColours['other'],
		notes: parsed.comments
	};
}
```

---

## 11. Export

### 11.1 Supported Formats

- PNG
- JPEG
- SVG
- PDF

### 11.2 Export Dialog Options

| Option             | Type     | Default                               |
| ------------------ | -------- | ------------------------------------- |
| Format             | dropdown | PNG                                   |
| Scope              | dropdown | All racks / Selected rack             |
| Include rack names | checkbox | Yes                                   |
| Include legend/key | checkbox | No                                    |
| Background         | dropdown | Dark / Light / Transparent (SVG only) |

### 11.3 Export Notes

- Device notes are NOT included in visual exports (JSON only)
- Rack names appear below racks (same as canvas)
- Legend shows device name + colour swatch

---

## 12. Error Handling

| Scenario                  | Behaviour                                       |
| ------------------------- | ----------------------------------------------- |
| Invalid YAML on load      | Validation errors shown, stay on current layout |
| Unsaved changes on close  | Browser "are you sure?" prompt                  |
| Device too tall for space | Block drop, visual feedback                     |
| Resize populated rack     | Block, gentle error message                     |
| Collision on drop         | Block drop, highlight invalid zone              |
| NetBox import failure     | Show which fields failed, offer partial import  |

---

## 13. Accessibility (v0.1)

### 13.1 Implemented

- Semantic HTML (`<button>`, not `<div onclick>`)
- Visible focus indicators
- Keyboard navigation (full shortcut set, roving tabindex)
- ARIA labels on icon-only buttons
- ARIA roles on interactive SVG elements
- Sufficient colour contrast (test with WebAIM)
- Reduced motion support (`prefers-reduced-motion`)

### 13.2 ARIA Roles for SVG Components

All interactive SVG elements require appropriate ARIA attributes:

#### 13.2.1 Rack Container

```html
<svg role="group" aria-label="Rack: [Rack Name], [N] units" aria-describedby="rack-[id]-desc">
	<desc id="rack-[id]-desc">[N]-unit rack containing [X] devices, [Y] units occupied</desc>
	<!-- rack contents -->
</svg>
```

#### 13.2.2 Device (Draggable)

```html
<g
	role="button"
	tabindex="0"
	aria-label="[Device Name], [N]U, at position U[X]"
	aria-grabbed="false"
	aria-describedby="device-controls-hint"
>
	<!-- device visual -->
</g>

<!-- Hidden hint for screen readers -->
<div id="device-controls-hint" hidden>
	Press Space to grab and move. Use arrow keys to reposition.
</div>
```

When grabbed:

```html
<g aria-grabbed="true" aria-dropeffect="move"></g>
```

#### 13.2.3 Empty U Slot (Drop Zone)

```html
<rect role="listitem" aria-label="Unit [N], empty" aria-dropeffect="move" />
```

#### 13.2.4 Device Palette Item

```html
<div role="option" tabindex="0" aria-label="[Device Name], [N]U, [Category]" draggable="true">
	<!-- palette item visual -->
</div>
```

### 13.3 Focus Indicators

Focus indicators must meet WCAG 2.4.7 (Focus Visible):

- Minimum 2px outline or equivalent visual indicator
- Contrast ratio of at least 3:1 against adjacent colours
- Must not rely solely on colour change
- Use `--colour-focus` (defaults to `--colour-selection`)

```css
:focus-visible {
	outline: 2px solid var(--colour-focus);
	outline-offset: 2px;
}
```

### 13.4 Colour Contrast Requirements

| Element Type                    | Minimum Contrast Ratio |
| ------------------------------- | ---------------------- |
| Normal text (<18px)             | 4.5:1                  |
| Large text (≥18px or 14px bold) | 3:1                    |
| UI components & graphics        | 3:1                    |
| Focus indicators                | 3:1                    |

Test with: WebAIM Contrast Checker, axe DevTools

### 13.5 Roadmap

- Screen reader announcements for state changes (ARIA live regions)
- Skip links / focus management for drawers
- Full screen reader drag-and-drop support with live feedback

---

## 14. Application Flow

### 14.1 Initial Load

1. App loads with welcome/landing state
2. Options: "New Rack" / "Load Layout"
3. Theme loaded from localStorage (default: dark)

### 14.2 New Rack Flow

1. User clicks "New Rack"
2. Form: height (dropdown + custom), name, width (fixed 19")
3. Submit creates rack on canvas
4. Device palette available for population

### 14.3 Load Layout Flow

1. User clicks "Load"
2. File picker opens
3. JSON parsed and validated
4. Layout rendered on canvas
5. Error: message shown, previous state preserved

### 14.4 Zero Racks State

- If last rack deleted, new rack form auto-opens
- Canvas shows empty state with "New Rack" prompt

---

## 15. Branding

### 15.1 Visual Identity

- Name: "Rackarr"
- Logo/icon: TBD during prototyping
- Displayed in toolbar header

### 15.2 Naming Context

The name follows the homelab *arr convention (Sonarr, Radarr, Lidarr) as a community nod. Dark theme default aligns with *arr app aesthetics.

### 15.3 Help/About Contents

- App name and version
- Brief description
- Keyboard shortcuts reference
- GitHub repository link
- License (MIT)
- Credits/attribution

---

## 16. Out of Scope (v0.1)

Explicitly deferred to roadmap:

- Rear rack view
- Undo/redo
- Custom device categories
- Custom device images
- Mobile/tablet support
- Weight/depth metadata
- Cable routing
- 3D visualization
- Cloud sync / accounts
- Collaborative editing
- "Fit All" zoom button
- Enhanced screen reader support
- Full drag-and-drop accessibility

---

## 17. Roadmap (Post v0.1)

### v0.2.0 — Multi-Rack Enhancements

- Rear rack view toggle
- "Fit All" zoom button
- Rack duplication

### v0.3.0 — Export & Polish

- Undo/redo
- Enhanced export options
- Import device library from JSON

### v0.4.0 — Accessibility

- Screen reader announcements
- Focus management improvements

### v1.0.0 — Stable Release

- Documentation
- Polish and bug fixes
- Public launch

---

## 18. Technical Notes

### 18.1 UUID Generation

Use `crypto.randomUUID()` for device and rack IDs.

### 18.2 Colour Defaults

Assign default colours per category:

```javascript
const categoryColours = {
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

### 18.3 CSS Custom Properties

CSS custom properties are organised in three layers for maintainability and scalability.

#### Layer 1: Primitives

Raw values that define the design palette. **Never used directly in components** — always referenced through semantic tokens.

```css
:root {
	/* Spacing scale */
	--space-1: 4px;
	--space-2: 8px;
	--space-3: 12px;
	--space-4: 16px;
	--space-6: 24px;
	--space-8: 32px;

	/* Colour palette */
	--grey-900: #1a1a1a;
	--grey-800: #2d2d2d;
	--grey-700: #404040;
	--grey-600: #525252;
	--grey-400: #a3a3a3;
	--grey-200: #e5e5e5;
	--grey-100: #f5f5f5;
	--white: #ffffff;

	--blue-600: #0052cc;
	--blue-500: #0066ff;
	--blue-400: #3385ff;

	--green-600: #1a9950;
	--green-500: #22cc66;

	--red-600: #cc3333;
	--red-500: #ff4444;

	/* Typography scale */
	--font-size-xs: 11px;
	--font-size-sm: 12px;
	--font-size-md: 14px;
	--font-size-lg: 16px;

	/* Animation */
	--duration-fast: 100ms;
	--duration-normal: 150ms;
	--duration-slow: 200ms;
	--easing-default: ease-out;
	--easing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

#### Layer 2: Semantic Tokens

Purpose-driven tokens that reference primitives. These define the **meaning** of colours and values.

```css
:root {
	/* Theme colours (dark mode default) */
	--colour-bg: var(--grey-900);
	--colour-surface: var(--grey-800);
	--colour-surface-raised: var(--grey-700);
	--colour-border: var(--grey-600);
	--colour-text: var(--grey-100);
	--colour-text-muted: var(--grey-400);

	/* Interactive colours */
	--colour-selection: var(--blue-500);
	--colour-selection-hover: var(--blue-400);
	--colour-focus: var(--blue-500);
	--colour-valid: var(--green-500);
	--colour-invalid: var(--red-500);

	/* Shadows */
	--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
	--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
	--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
	--shadow-elevation: var(--shadow-md); /* Used for drag states */
}

/* Light theme overrides */
[data-theme='light'] {
	--colour-bg: var(--white);
	--colour-surface: var(--grey-100);
	--colour-surface-raised: var(--grey-200);
	--colour-border: var(--grey-400);
	--colour-text: var(--grey-900);
	--colour-text-muted: var(--grey-600);

	--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
	--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
	--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.2);
}
```

#### Layer 3: Component Tokens

Scoped to specific components. Reference semantic tokens where possible.

```css
:root {
	/* Rack */
	--rack-u-height: 22px;
	--rack-width: 220px;
	--rack-bg: var(--colour-surface);
	--rack-rail-colour: var(--colour-border);
	--rack-grid-colour: var(--grey-700);
	--rack-label-size: var(--font-size-sm);

	/* Device */
	--device-font-size: var(--font-size-sm);
	--device-padding: var(--space-2);
	--device-border-radius: 2px;
	--device-ghost-opacity: 0.4;
	--device-hover-brightness: 1.1;
	--device-grabbed-scale: 1.02;

	/* Toolbar */
	--toolbar-height: 52px;
	--toolbar-bg: var(--colour-surface);
	--toolbar-border: var(--colour-border);

	/* Drawer */
	--drawer-width: 300px;
	--drawer-bg: var(--colour-surface);

	/* Drop zone */
	--dropzone-valid-bg: rgba(34, 204, 102, 0.2);
	--dropzone-invalid-bg: rgba(255, 68, 68, 0.2);
}
```

#### Usage Guidelines

1. **Components reference Layer 3** (component tokens) or **Layer 2** (semantic tokens)
2. **Never reference Layer 1** (primitives) directly in component styles
3. **New colours** should be added to Layer 1, then exposed through Layer 2
4. **Theme switching** only overrides Layer 2 semantic tokens

### 18.4 Snap Calculation

```javascript
function snapToU(yPosition, uHeight) {
	return Math.round(yPosition / uHeight) * uHeight;
}
```

---

## 19. Testing Strategy

### 19.1 Approach

Test-driven development (TDD) following Harper Reed methodology.

### 19.2 Test Categories

| Category    | Examples                                                       |
| ----------- | -------------------------------------------------------------- |
| Unit        | Device placement validation, collision detection, JSON parsing |
| Component   | Rack renders correct U count, device displays properties       |
| Integration | Drag device from palette to rack, save/load cycle              |
| E2E         | Full workflow: create rack, add devices, export                |

### 19.3 Critical Paths to Test

1. Rack CRUD (create, read, update, delete)
2. Device CRUD
3. Drag-and-drop placement with collision
4. Multi-rack device movement
5. Save/load YAML round-trip
6. Zod schema validation (strict and loose modes)
7. NetBox device type import
8. Export generates valid output
9. Keyboard navigation full flow

---

## 20. Success Criteria

v0.1 is complete when:

- [ ] User can create a rack with custom height
- [ ] User can add devices from palette via drag-and-drop
- [ ] Devices snap to U positions, collisions blocked
- [ ] User can reposition devices within and across racks
- [ ] Multiple racks supported (up to 6)
- [ ] Half-U devices supported (0.5U increments)
- [ ] Layout saves to YAML and loads correctly
- [ ] Zod validation provides clear error messages
- [ ] Export produces PNG/JPEG/SVG/PDF
- [ ] Dark/light theme works
- [ ] All keyboard shortcuts functional
- [ ] Runs as static files in Docker container

---

_Specification complete. Ready for prompt_plan.md generation._
