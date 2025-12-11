---
created: 2025-11-27
updated: 2025-12-02
status: active
---

# Rackarr — Product Roadmap

Single source of truth for version planning.

---

## Version Philosophy

- **Incremental releases** — Each version is usable and complete
- **Scope discipline** — Features stay in their designated version
- **Spec-driven** — No implementation without spec
- **User value** — Each release solves real problems
- **Single rack focus** — One rack per project, no multi-rack complexity
- **Minimalism** — Keep it simple and focused
- **Consistency** — Design and behaviour should be consistent across the app
- **Accessibility** — Ensure usability for all users, including those with disabilities

---

## Outstanding issues (to be addressed before any additional featurework)

# Guidance:

For each of these, we should create a new branch. Then we will write a spec and subsequent prompt plan and todo list in detail to ensure clarity and completeness. We will then, using that output, create test cases to meet the spec and then source code to satisfy the tests.

# Issue list

Work through each top level heading one by one, mark with x only once complete.

- [x] edit panel is transparent - when panning canvas to a place where the rack is behind the panel, it is for some reason visible through the edit panel. expectation is the panel should be opaque and same as device library
  - [x] remove X button from edit panel to close - only way to close is to click outside panel

- [x] move Rackarr title and icon and tagline in toolbar left by 10px
  - [x] move tagline down by 2px to be in alignment with title

- [x] change Fit All button to Reset View (and update tooltip)

- [x] current layout is not tolerant of small screens or responsive context
  - [x] responsive quick-wins implemented (icon-only toolbar, narrow sidebar, overflow handling)
  - See `docs/planning/responsive-quick-wins-spec.md` for details

- [x] Toolbar UI Issues - Responsiveness Problems (v0.4.2)
  - [x] **Text Overlap in Header**: Fixed by hiding tagline at 1200px breakpoint
  - [x] **No Responsive Behavior**: Added hamburger menu at <1024px with left drawer
  - [x] **Inconsistent Spacing**: Fixed by removing absolute positioning, using flexbox
  - See `docs/planning/spec-toolbar.md` for implementation details

- [x] Toolbar UI Issues - Button Text Wrapping (v0.4.5)
  - [x] Multi-word buttons (New Rack, Load Layout, Reset View) wrap to multiple lines
  - [x] Buttons should widen instead of wrapping text - add `white-space: nowrap`
  - [x] Tagline removed from toolbar entirely (moved to Help panel description)

- [x] Version number in Help/About stuck on 0.3.4 (v0.4.5)
  - [x] Verified version is correctly injected from package.json at build time
  - [x] Issue was stale cached build artifacts

- [x] Load Layout functionality broken (v0.4.5)
  - [x] Fixed file picker accept types for better browser compatibility
  - [x] Added cancel event handling for file picker dialog
  - [x] Fixed GitHub Actions workflow npm version compatibility

- [x] Legacy code comments audit (v0.4.10)
  - [x] Removed deprecated UI types (`Device`, `UIPlacedDevice`) - now using storage types only (`DeviceType`, `PlacedDevice`)
  - [x] Removed deprecated store functions (`addDeviceToLibrary`, `updateDeviceInLibrary`, `deleteDeviceFromLibrary`)
  - [x] Cleaned up "legacy compatibility" comments throughout codebase
  - [x] Unified on `device_type` (not `libraryId`) for placed device references

- [x] Device selection highlights all instances of same device type (v0.4.9)
  - [x] When selecting a device on canvas, all devices of that type show blue outline
  - [x] Selection behaviour is correct (only one device selected), but visual is confusing
  - [x] Should only highlight the specific placed device, not all instances of the device type
  - [x] Fixed: Selection now uses deviceIndex instead of libraryId for placed device instances

---

## Research

Items requiring investigation and architecture design before implementation.

### Starter Library Rationalization

**Status:** Research Complete, Implementation Ready
**Created:** 2025-12-11

The current starter library has 26 generic device types ("1U Server", "2U NAS", etc.) that need rationalization to better represent common homelab gear categories.

#### Research (Complete)

- [x] **Audit current starter library** — Documented existing 26 device types and categories
- [x] **Research common homelab gear** — r/homelab, ServeTheHome forums, homelab blogs (2024-2025)
- [x] **Define target library** — Approved 26-item library with add/remove/rename changes
- [x] **Document final list** — See `docs/planning/research/starter-library-rationalization.md`

#### Implementation

- [ ] **Update `starterLibrary.ts`** — Apply approved changes:
  - Add: 8-Port Switch, 24-Port Switch, 48-Port Switch, 1U Storage, 1U Brush Panel, 1U Cable Management
  - Remove: 4U Shelf, 1U Generic, 2U Generic, 0.5U Blanking Fan
  - Rename: 1U Switch → 1U Router/Firewall, patch panels get port counts (24/48-Port)
  - Merge: 1U Router + 1U Firewall → 1U Router/Firewall
- [ ] **Update tests** — Ensure starter library tests reflect new device list
- [ ] **Verify slug generation** — Confirm slugs work correctly for renamed devices

> **Prerequisite for:** Device Image System implementation

---

### Device Image System

**Status:** Research Complete, Implementation Ready
**Created:** 2025-12-11

The current image system has limitations:

- Images only addable when creating new device types (no editing after)
- No default images for starter library devices
- Single-level storage (device type only, no per-placement overrides)

> **Note:** Implementation will be greenfield — no migration layers, version suffixes, or legacy compatibility code.

#### Phase 1: Architecture Design (Complete)

Research and document the two-level image storage system:

- [x] **Image inheritance model** — Device type images as defaults, placement-level overrides
  - Two separate stores: `deviceTypeImages` and `placementImages`
  - **Decision:** Add stable `id` field to PlacedDevice (survives reordering)
  - Key scheme: placement images keyed by `{slug}:{id}`
  - Fallback logic: placement image → device type image → colored rectangle

- [x] **Storage format decisions**
  - Device type images remain in separate store (not embedded in DeviceType)
  - Archive structure: `assets/device-types/{slug}/` and `assets/placements/{slug}/{id}/`

- [x] **Image processing decisions**
  - Bundled images: 400px max width, WebP format
  - Originals stored in `assets-source/device-images/` (git-tracked, not bundled)
  - Optimized stored in `src/lib/assets/device-images/` (Vite-bundled)
  - User uploads: auto-resize to 400px max + WebP conversion

- [x] **Licensing** — CC0 1.0 (public domain), no attribution required

> See `docs/planning/research/device-images.md` for full research documentation.

#### Phase 2: Starter Library Default Images

Bundle representative images for the 26 starter library device types:

- [ ] **Download representative images from NetBox** — Front images for each device type
  - Use representative gear images (e.g., Dell R630 image for "1U Server")
  - See mapping table in `starter-library-rationalization.md`
- [ ] **Process images** — Resize to 400px max width, convert to WebP
- [ ] **Store originals** — `assets-source/device-images/{manufacturer}/{model}.front.png`
- [ ] **Store optimized** — `src/lib/assets/device-images/{category}/{slug}.front.webp`
- [ ] **Wire up to starter library** — Import images in `starterLibrary.ts`, set as defaults
- [ ] **Add npm script** — `npm run process-images` to regenerate optimized from originals

#### Phase 3: Placement Image Overrides

Implementation of per-placement image overrides:

- [ ] Add stable `id` field to PlacedDevice type
- [ ] Refactor `ImageStore` to separate device type / placement stores
- [ ] Add image upload UI to `EditPanel` for selected placed devices
- [ ] Add "Using default" / "Custom image" indicator in EditPanel
- [ ] Add "Reset to default" action for placement overrides
- [ ] Update archive save/load for two-level image structure
- [ ] Update `RackDevice` rendering to check placement → device type → fallback

#### Phase 4: NetBox On-Demand Fetch (Future)

Optional future enhancement for fetching images on-demand:

- [ ] Implement search/browse UI for NetBox device library
- [ ] Fetch from `raw.githubusercontent.com` (CORS-friendly)
- [ ] Cache fetched images locally
- [ ] Allow user to assign fetched image to device type or placement

---

## Released

### v0.4.9 — Airflow Visualization

**Status:** Complete
**Released:** 2025-12-09

Visual overlay for device airflow direction with conflict detection:

| Feature            | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| Simplified types   | 4 types: passive, front-to-rear, rear-to-front, side-to-rear |
| Toggle             | Toolbar button + `A` keyboard shortcut                       |
| Edge stripe design | 4px colored stripe on device edge (blue=intake, red=exhaust) |
| Animated arrows    | Small chevron with marching animation                        |
| Conflict detection | Orange border on devices with airflow conflicts              |
| Export support     | Airflow indicators included in image/PDF exports             |
| Selection bug fix  | Fixed multi-device selection highlighting issue              |

---

### v0.4.0 — Code Audit & Legacy Cleanup

**Status:** Complete
**Breaking Change:** Dropped v0.1/v0.2 format support

| Area               | Status   |
| ------------------ | -------- |
| Legacy Removal     | Complete |
| Dead Code (Source) | Complete |
| Dead Code (Tests)  | Complete |
| CSS Cleanup        | Complete |
| Dependencies       | Complete |
| Config             | Clean    |
| Documentation      | Complete |

**Spec:** `docs/planning/v0.4.0-code-audit-spec.md`

---

## Medium-Term Responsive (before v1.0)

The following responsive improvements are planned for implementation before v1.0:

### Tab-Based Mobile Layout (<768px)

For phone screens, switch to a tab-based interface:

- Bottom tab bar: `Library | Canvas | Edit`
- Only one view visible at a time
- Device library becomes full-screen overlay
- Edit panel becomes full-screen overlay
- Canvas takes full width when active

### Bottom Sheet Patterns

Mobile-friendly UI patterns:

- Bottom sheet for device library (swipe up to reveal)
- Bottom sheet for edit panel
- Two-tap device placement: tap device → tap rack slot
- Gesture-based interactions

### Min-Width Warning

For unsupported narrow viewports:

- Display warning banner at <500px viewport
- Suggest rotating to landscape or using larger device
- Graceful degradation rather than broken layout

---

## Future Roadmap

Priority order for future development:

### 1. Mobile & PWA

- Full mobile phone support (create/edit layouts)
- Two-tap device placement (tap library → tap rack)
- Bottom sheet UI for device library and edit panel
- Pinch-to-zoom with native touch events
- Progressive Web App (installable, offline)
- Service worker for offline capability
- Touch-friendly targets (48px minimum)

**Primary Targets:** iPhone SE, iPhone 14, Pixel 7

---

### ~~2. Undo/Redo~~ ✅ Complete (v0.3.1)

- ~~Undo/redo system (command pattern)~~
- ~~History stack with configurable depth~~
- ~~Keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z)~~

---

### ~~3. Airflow Visualization~~ ✅ Complete (v0.4.9)

- ~~Visual indicators for device airflow direction~~
- ~~Hot/cold aisle awareness~~
- ~~Conflict detection (opposing airflow)~~

---

### 4. Cable Routing

- Visual cable path representation
- Port/connection definitions on devices
- Cable type metadata

---

### 5. Weight/Load Calculations

- Device weight metadata
- Per-U load calculations
- Rack weight capacity warnings

---

### 6. Basic Power Consumption

- Basic device power requirements (# of plugs on PDU, device powered y/n)

### 7. Basic Network connectivity requirements

- Basic device network requirements (# of ports on patch panel, device networked y/n)

---

## Backlog (Unscheduled)

Features explicitly deferred with no priority assigned:

| Feature                     | Notes                                       |
| --------------------------- | ------------------------------------------- |
| Device category icons       | Lucide icons for each category (lucide.dev) |
| Custom device categories    | Allow user-defined categories               |
| 3D visualization            | Three.js rack view                          |
| Cloud sync / accounts       | User accounts, cloud storage                |
| Collaborative editing       | Real-time multi-user                        |
| Tablet-optimised layout     | Enhanced tablet experience                  |
| Device templates/presets    | Common device configurations                |
| Import from CSV/spreadsheet | Bulk device import                          |
| NetBox device type import   | Import from community library               |
| Export both rack views      | Front + rear in single export               |
| Device library export       | Save library to file                        |
| 0U vertical PDU support     | Rail-mounted PDUs (left/right rails)        |
| Screen reader improvements  | Live region announcements for state changes |
| Rack Power management       | - Device power draw metadata                |

                              - Total rack power calculation
                              - PDU capacity planning                        |

for future planning:

---

## Out of Scope

Features that will **not** be implemented:

- Multiple racks per project
- Backend/database
- User accounts (without cloud sync feature)
- Internet Explorer support
- Native mobile apps

---

## Process

### Adding Features to Roadmap

1. Add to **Backlog** with brief description
2. When prioritizing, assign a priority number in Future Roadmap
3. Before implementation, update spec-combined.md
4. Implement following TDD methodology

### Version Graduation

```
Backlog → Future Roadmap → Planned (current) → Released
```

---

## Changelog

| Date       | Change                                                        |
| ---------- | ------------------------------------------------------------- |
| 2025-11-27 | Initial roadmap created                                       |
| 2025-11-27 | v0.1 development started                                      |
| 2025-11-28 | v0.1 released                                                 |
| 2025-11-28 | v0.2 spec created                                             |
| 2025-11-29 | Added panzoom library to v0.2 scope                           |
| 2025-11-30 | v0.2.0 released                                               |
| 2025-12-01 | v0.2.1 released (accessibility & design polish)               |
| 2025-12-02 | Consolidated spec; single-rack permanent scope                |
| 2025-12-03 | v0.3.0 released (YAML archive format)                         |
| 2025-12-05 | Responsive quick-wins implemented                             |
| 2025-12-06 | v0.3.4 released (responsive quick-wins)                       |
| 2025-12-07 | v0.4.0 released (breaking: removed legacy format support)     |
| 2025-12-07 | v0.4.2 released (toolbar responsiveness, hamburger menu)      |
| 2025-12-08 | v0.4.3 released (PDF export)                                  |
| 2025-12-08 | v0.4.4 released (Docker build fix)                            |
| 2025-12-08 | v0.4.5 released (toolbar polish, file picker fix)             |
| 2025-12-08 | v0.4.6 released (fix 0.5U device schema validation)           |
| 2025-12-08 | v0.4.7 released (reset view after layout load)                |
| 2025-12-08 | v0.4.8 released (toolbar drawer fix, z-index tokens)          |
| 2025-12-08 | v0.4.9 spec ready (airflow visualization)                     |
| 2025-12-09 | v0.4.9 released (airflow visualization, selection bug fix)    |
| 2025-12-10 | Type system consolidation: unified on DeviceType/PlacedDevice |
| 2025-12-11 | Added Research section: Starter Library & Device Image System |

---

_This file is the source of truth for Rackarr versioning._
