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

## Planned

### v0.4.0 — Code Audit & Legacy Cleanup

**Priority:** Blocking (before any new feature work)
**Breaking Change:** Drops v0.1/v0.2 format support

| Area               | Tasks                                                               |
| ------------------ | ------------------------------------------------------------------- |
| Legacy Removal     | Remove v0.1/v0.2 migration code, drop old `.rackarr` format support |
| Dead Code (Source) | Unused imports, exports, functions, unreachable code paths          |
| Dead Code (Tests)  | Redundant tests, duplicate coverage, obsolete test fixtures         |
| CSS Cleanup        | Unused CSS classes/variables in tokens.css and component styles     |
| Dependencies       | Audit and remove unused npm packages                                |
| Config             | Clean up vite/vitest/eslint/tsconfig if needed                      |
| Documentation      | Remove legacy references from spec-combined.md, CLAUDE.md, ROADMAP  |

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
| 2025-12-05 | Responsive quick-wins implemented               |
| 2025-12-06 | v0.3.4 released (responsive quick-wins)         |
| 2025-12-06 | v0.4.0 code audit planned                       |

---

_This file is the source of truth for Rackarr versioning._
