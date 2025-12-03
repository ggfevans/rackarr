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

---

## Released

### v0.1.0 — MVP

**Status:** Released
**Released:** 2025-11-28

**Delivered:**

- [x] Single-page rack layout designer
- [x] Create/edit racks (1-100U)
- [x] Device palette with starter library
- [x] Drag-and-drop placement with collision detection
- [x] Save/load JSON layouts
- [x] Export PNG/JPEG/SVG/PDF
- [x] Dark/light theme
- [x] Full keyboard navigation
- [x] Docker deployment

---

### v0.2.0 — Multi-View & Polish

**Status:** Released
**Released:** 2025-11-30

**Delivered:**

- [x] Front/rear rack view toggle
- [x] Device face assignment (front/rear/both)
- [x] "Fit All" zoom button (F shortcut)
- [x] Import device library from JSON
- [x] Panzoom library integration
- [x] Layout migration (v0.1 → v0.2)

---

### v0.2.1 — Design Polish

**Status:** Released
**Released:** 2025-12-01

**Delivered:**

- [x] WCAG AA accessibility compliance (ARIA audit)
- [x] Color contrast verification utilities
- [x] Animation keyframes system
- [x] Reduced motion support (CSS + JS)
- [x] 5th U number highlighting
- [x] Design tokens consolidation
- [x] 1059 tests passing

---

### v0.3.0 — Archive Format & Polish

**Status:** Released
**Released:** 2025-12-03

**Delivered:**

- [x] `.rackarr.zip` YAML folder-based archive format
- [x] Legacy format migration (v0.1/v0.2 → v0.3)
- [x] Device images (front/rear) embedded in archive
- [x] Label/image display mode toggle (I key)
- [x] Shelf category with starter devices (1U, 2U, 4U)
- [x] Fixed device library sidebar (always visible)
- [x] 10" rack width option
- [x] Bundled export option (image + metadata.json)
- [x] Single-rack mode enforced

---

## Planned

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

### 2. Undo/Redo

- Undo/redo system (command pattern)
- History stack with configurable depth
- Keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z)

---

### 3. Airflow Visualization

- Visual indicators for device airflow direction
- Hot/cold aisle awareness
- Conflict detection (opposing airflow)

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

| Date       | Change                                          |
| ---------- | ----------------------------------------------- |
| 2025-11-27 | Initial roadmap created                         |
| 2025-11-27 | v0.1 development started                        |
| 2025-11-28 | v0.1 released                                   |
| 2025-11-28 | v0.2 spec created                               |
| 2025-11-29 | Added panzoom library to v0.2 scope             |
| 2025-11-30 | v0.2.0 released                                 |
| 2025-12-01 | v0.2.1 released (accessibility & design polish) |
| 2025-12-02 | Consolidated spec; single-rack permanent scope  |
| 2025-12-03 | v0.3.0 released (YAML archive format)           |

---

_This file is the source of truth for Rackarr versioning._
