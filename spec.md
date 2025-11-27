---
created: 2025-11-27T01:57
updated: 2025-11-27T02:06
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
| Framework     | Svelte                                                              |
| Rendering     | SVG                                                                 |
| Drag-and-drop | svelte-dnd-action (or similar)                                      |
| Persistence   | sessionStorage (work-in-progress), file download/upload (save/load) |
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

Minimal and snappy. No decorative animations.

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

| Property | Required | Type   | Constraints              |
| -------- | -------- | ------ | ------------------------ |
| id       | Yes      | string | Auto-generated UUID      |
| name     | Yes      | string | User-defined             |
| height   | Yes      | number | 1-100U                   |
| width    | Yes      | number | 19 (fixed for v0.1)      |
| position | Yes      | number | Order in row (0-indexed) |

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

| Property | Required | Type   | Notes                        |
| -------- | -------- | ------ | ---------------------------- |
| id       | Yes      | string | Auto-generated UUID          |
| name     | Yes      | string | User-defined                 |
| height   | Yes      | number | 1-42U                        |
| colour   | Yes      | string | Hex colour, sensible default |
| category | Yes      | enum   | See category list            |
| notes    | No       | string | Free text                    |

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

Pre-populated generic devices (saved into layout JSON like user-created devices):

| Category    | Starter Devices                   |
| ----------- | --------------------------------- |
| server      | 1U Server, 2U Server, 4U Server   |
| network     | 1U Switch, 1U Router, 1U Firewall |
| patch-panel | 1U Patch Panel, 2U Patch Panel    |
| power       | 1U PDU, 2U UPS, 4U UPS            |
| storage     | 2U Storage, 4U Storage            |
| kvm         | 1U KVM, 1U Console Drawer         |
| av-media    | 1U Receiver, 2U Amplifier         |
| cooling     | 1U Fan Panel                      |
| blank       | 1U Blank, 2U Blank                |
| other       | 1U Generic, 2U Generic            |

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

---

## 8. Keyboard Shortcuts

| Key                | Action                      |
| ------------------ | --------------------------- |
| Delete / Backspace | Delete selected item        |
| ↑ / ↓              | Move selected device 1U     |
| ← / →              | Reorder selected rack       |
| Escape             | Deselect, close drawers     |
| D                  | Toggle device palette       |
| Ctrl/Cmd + S       | Save layout                 |
| Ctrl/Cmd + O       | Load layout                 |
| Ctrl/Cmd + E       | Export dialog               |
| ?                  | Keyboard shortcut reference |

---

## 9. Persistence

### 9.1 Session Auto-Save

- Work-in-progress saved to sessionStorage
- Survives page refresh
- Clears on tab/window close
- No restore prompt on startup

### 9.2 Manual Save/Load

- **Save:** Downloads JSON file to user's computer
- **Load:** File picker to upload JSON file
- Invalid/corrupted JSON shows error, stays on current layout

### 9.3 Unsaved Changes Warning

Browser `beforeunload` prompt when closing tab with unsaved changes.

### 9.4 Local Storage

Used only for theme preference (dark/light).

---

## 10. JSON Schema

```json
{
	"version": "1.0",
	"name": "Layout Name",
	"created": "2025-11-27T10:30:00Z",
	"modified": "2025-11-27T12:45:00Z",
	"settings": {
		"theme": "dark"
	},
	"deviceLibrary": [
		{
			"id": "dev-uuid-001",
			"name": "Device Name",
			"height": 2,
			"colour": "#4A90D9",
			"category": "network",
			"notes": "Optional notes"
		}
	],
	"racks": [
		{
			"id": "rack-uuid-001",
			"name": "Rack Name",
			"height": 18,
			"width": 19,
			"position": 0,
			"devices": [
				{
					"libraryId": "dev-uuid-001",
					"position": 10
				}
			]
		}
	]
}
```

### 10.1 Schema Notes

- `version`: For future format migrations
- `deviceLibrary`: All devices used in layout (including starter devices)
- `devices[].position`: Bottom U occupied by device
- `racks[].position`: Order in horizontal row (0-indexed)
- Same device definition can be placed multiple times across racks

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

| Scenario                  | Behaviour                             |
| ------------------------- | ------------------------------------- |
| Invalid JSON on load      | Error message, stay on current layout |
| Unsaved changes on close  | Browser "are you sure?" prompt        |
| Device too tall for space | Block drop, visual feedback           |
| Resize populated rack     | Block, gentle error message           |
| Collision on drop         | Block drop, highlight invalid zone    |

---

## 13. Accessibility (v0.1)

### 13.1 Implemented

- Semantic HTML (`<button>`, not `<div onclick>`)
- Visible focus indicators
- Keyboard navigation (full shortcut set)
- ARIA labels on icon-only buttons
- Sufficient colour contrast (test with WebAIM)

### 13.2 Roadmap

- Screen reader announcements for state changes
- Skip links / focus management for drawers
- Full screen reader drag-and-drop support

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

```css
:root {
	--u-height: 22px;
	--rack-width: 220px;
	--toolbar-height: 52px;
	--drawer-width: 300px;
	--font-size-device: 13px;
	--colour-bg-dark: #1a1a1a;
	--colour-bg-light: #ffffff;
	--colour-rack-interior: #2d2d2d;
	--colour-rack-rail: #404040;
	--colour-selection: #0066ff;
	--colour-invalid: #ff4444;
}
```

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
5. Save/load JSON round-trip
6. Export generates valid output
7. Keyboard navigation full flow

---

## 20. Success Criteria

v0.1 is complete when:

- [ ] User can create a rack with custom height
- [ ] User can add devices from palette via drag-and-drop
- [ ] Devices snap to U positions, collisions blocked
- [ ] User can reposition devices within and across racks
- [ ] Multiple racks supported (up to 6)
- [ ] Layout saves to JSON and loads correctly
- [ ] Export produces PNG/JPEG/SVG/PDF
- [ ] Dark/light theme works
- [ ] All keyboard shortcuts functional
- [ ] Runs as static files in Docker container

---

_Specification complete. Ready for prompt_plan.md generation._
