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

- [x] DeviceV02 mention - remove the "V02" in all instances, it is unnecessary
- [] export improvements:
  - [] export bundled zip does not need the "include source layout", this is always going to be added in the bundled view
  - [] export bundled zip should include all devices and their images
  - [] export bundled zip should include all images and their metadata
  - [] export bundled zip should include all possible formats of rack image export (PNG, JPEG, SVG, PDF)
  - [] the rack image should have a 10px margin around it to ensure proper spacing and alignment
  - [] the rack image should be centered within the exported zip file
  - [] the rack image should have a consistent aspect ratio across all formats
  - [] specific for SVG and PNG export, there should be a "Transparent background" tickbox that defaults to off and when enabled will export with transparent background

- [] Rack name - move rack name down to be 8px from top of rack

- [] Device Images: Upload front/rear images with label/image display toggle
- - [] device images are specific to each placed device and are shown when the image view is toggled on
- - [] device images are shown both in canvas view and export view with image view on
  - [] device images are included in the full export and successfully import

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
