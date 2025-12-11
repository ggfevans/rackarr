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

## Outstanding Issues

> **Process:** For each issue, create a branch, write a spec with test cases, implement using TDD.
> Mark with `[x]` only when complete.

---

### Issue 1: Device Image Rendering Bugs

**Priority:** High (breaks basic functionality)
**Introduced:** v0.5.0 (bundled images feature)

| Sub-issue                        | Description                                                     | Likely Cause                                                                                                                                         |
| -------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1.1 Devices not clickable**    | In image mode, clicking devices with images doesn't select them | The `<image>` SVG element or its container may be intercepting click events. Check `pointer-events` CSS and event propagation in `RackDevice.svelte` |
| **1.2 Images clipped by rack**   | Device images appear cut off, possibly by rack boundaries       | Z-index or SVG stacking issue. The `<image>` element may be rendered behind the rack frame. Check SVG element order and `overflow` settings          |
| **1.3 8-port switch scaling**    | Image scaled too large, network ports look oversized            | Either source image has wrong aspect ratio, or `preserveAspectRatio` setting is incorrect. Check source image dimensions vs device height            |
| **1.4 Redundant label checkbox** | Toolbar shows unnecessary "label" checkbox in image mode        | UI logic error - checkbox should only appear when relevant. Review `Toolbar.svelte` display mode toggle logic                                        |

**Files to investigate:**

- `src/lib/components/RackDevice.svelte` (lines 74-82, 196-207)
- `src/lib/components/Toolbar.svelte`
- `src/lib/assets/device-images/network/8-port-switch.front.webp`

---

### Issue 2: Front/Rear Mounting Logic

**Priority:** Medium (confusing UX but workarounds exist)

| Sub-issue                        | Description                                                                                                                                                 | Expected Behavior                                                                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2.1 0.5U blank placement bug** | 0.5U blank with rear/full-depth mounting can overlap front-mounted devices. Arrow key movement jumps to unexpected slots (different from 1U blank behavior) | All devices should follow consistent placement rules. 0.5U devices should respect mounting constraints and move in 0.5U increments                   |
| **2.2 Front+rear slot sharing**  | Cannot mount a rear device in a slot that has a front-mounted device                                                                                        | Front-mounted devices should leave rear area available. Rear-mounted devices should be placeable behind front-mounted devices in the same U position |

**Context:** The mounting logic treats slots as fully occupied regardless of `form_factor`. A front-only device (`front`) should only block front mounting, leaving rear mountable.

**Files to investigate:**

- `src/lib/stores/layout.svelte.ts` (collision detection)
- `src/lib/utils/rack.ts` (placement validation)
- Device type definitions in `starterLibrary.ts` (form_factor values)

---

### Issue 3: Device Library Polish

**Priority:** Low (cosmetic)

| Sub-issue                  | Description                                 | Fix                                                                                                                                   |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **3.1 KVM capitalization** | Category displays as "Kvm" instead of "KVM" | Update category display formatting to handle acronyms. Either special-case "kvm" → "KVM" or store display names separately from slugs |

**Files to investigate:**

- `src/lib/components/DevicePalette.svelte` (category display)
- `src/lib/types/index.ts` (DeviceCategory type)

---

## Research

Items requiring investigation and architecture design before implementation.

### Device Category Icons

**Status:** Complete
**Created:** 2025-12-11
**Completed:** 2025-12-11

Implemented Lucide icons for all 12 device categories in `CategoryIcon.svelte`.

| Category           | Lucide Icon            |
| ------------------ | ---------------------- |
| `server`           | `server`               |
| `network`          | `network`              |
| `patch-panel`      | `ethernet-port`        |
| `power`            | `zap`                  |
| `storage`          | `hard-drive`           |
| `kvm`              | `monitor`              |
| `av-media`         | `speaker`              |
| `cooling`          | `fan`                  |
| `shelf`            | `align-end-horizontal` |
| `blank`            | `circle-off`           |
| `cable-management` | `cable`                |
| `other`            | `circle-help`          |

See SPEC.md Section 10 for the full mapping.

---

### Starter Library Rationalization

**Status:** Complete
**Created:** 2025-12-11
**Completed:** 2025-12-11

Rationalized the starter library to 26 device types representing common homelab gear.

- [x] **Research** — Audited existing library, researched common homelab gear, defined target list
- [x] **Implementation** — Updated `starterLibrary.ts` with all changes:
  - Added: 8-Port Switch, 24-Port Switch, 48-Port Switch, 1U Storage, 1U Brush Panel, 1U Cable Management
  - Removed: 4U Shelf, 1U Generic, 2U Generic, 0.5U Blanking Fan
  - Renamed: 1U Switch → 1U Router/Firewall, patch panels get port counts (24/48-Port)
- [x] **Tests updated** — Starter library tests reflect new device list
- [x] **Slug generation verified** — Slugs work correctly for all renamed devices

> See `docs/planning/research/starter-library-rationalization.md` for research documentation.

---

### Device Image System

**Status:** In Progress
**Created:** 2025-12-11

Two-level image system with device type defaults and placement-level overrides.

> **Note:** Implementation will be greenfield — no migration layers, version suffixes, or legacy compatibility code.

#### Phase 1: Architecture Design (Complete)

- [x] **Image inheritance model** — Device type → placement override fallback
- [x] **Storage format** — `assets/device-types/` + `assets/placements/`
- [x] **Image processing** — 400px max WebP, auto-process uploads
- [x] **Licensing** — CC0 1.0 for NetBox images

> See `docs/planning/research/device-images.md` for full research.

#### Phase 2: Bundled Starter Library Images (In Progress)

Bundle ~15 active device images (servers, switches, storage, UPS):

- [x] Create directory structure and processing script
- [x] Download representative images from NetBox
- [x] Process to 400px max WebP
- [x] Create bundled image manifest (`src/lib/data/bundledImages.ts`)
- [x] Load bundled images on app initialization

#### Phase 3: Placement Image Overrides (Planned)

Per-placement image overrides with stable IDs:

- [ ] Add `id: string` (UUID) field to PlacedDevice type
- [ ] Generate UUID on device placement
- [ ] Refactor ImageStore for two-level storage
- [ ] Update archive format for device-types/ + placements/
- [ ] Add image override UI to EditPanel
- [ ] Auto-process user uploads (400px + WebP)

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

## Considerations but Not Doing

Features that were considered but explicitly deferred or rejected.

### NetBox On-Demand Fetch (Deferred)

Fetch device images on-demand from the NetBox Device Type Library:

- Search/browse UI for NetBox library
- Fetch from `raw.githubusercontent.com` (CORS-friendly)
- Cache fetched images locally
- Assign fetched images to device types or placements

**Reason for deferral:** The bundled images + user upload approach covers immediate user needs without network dependency. On-demand fetch adds complexity (UI for search/browse, network error handling, caching) that can be evaluated later based on user feedback. May revisit if users frequently request specific device images not in the starter library.

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

| Date       | Change                                                             |
| ---------- | ------------------------------------------------------------------ |
| 2025-11-27 | Initial roadmap created                                            |
| 2025-11-27 | v0.1 development started                                           |
| 2025-11-28 | v0.1 released                                                      |
| 2025-11-28 | v0.2 spec created                                                  |
| 2025-11-29 | Added panzoom library to v0.2 scope                                |
| 2025-11-30 | v0.2.0 released                                                    |
| 2025-12-01 | v0.2.1 released (accessibility & design polish)                    |
| 2025-12-02 | Consolidated spec; single-rack permanent scope                     |
| 2025-12-03 | v0.3.0 released (YAML archive format)                              |
| 2025-12-05 | Responsive quick-wins implemented                                  |
| 2025-12-06 | v0.3.4 released (responsive quick-wins)                            |
| 2025-12-07 | v0.4.0 released (breaking: removed legacy format support)          |
| 2025-12-07 | v0.4.2 released (toolbar responsiveness, hamburger menu)           |
| 2025-12-08 | v0.4.3 released (PDF export)                                       |
| 2025-12-08 | v0.4.4 released (Docker build fix)                                 |
| 2025-12-08 | v0.4.5 released (toolbar polish, file picker fix)                  |
| 2025-12-08 | v0.4.6 released (fix 0.5U device schema validation)                |
| 2025-12-08 | v0.4.7 released (reset view after layout load)                     |
| 2025-12-08 | v0.4.8 released (toolbar drawer fix, z-index tokens)               |
| 2025-12-08 | v0.4.9 spec ready (airflow visualization)                          |
| 2025-12-09 | v0.4.9 released (airflow visualization, selection bug fix)         |
| 2025-12-10 | Type system consolidation: unified on DeviceType/PlacedDevice      |
| 2025-12-11 | Added Research section: Starter Library & Device Image System      |
| 2025-12-11 | Device category icons: selected Lucide icons for all 12 categories |
| 2025-12-11 | Device Image System: spec complete, Phase 4 deferred               |

---

_This file is the source of truth for Rackarr versioning._
