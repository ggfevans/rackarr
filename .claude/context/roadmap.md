---
created: 2025-11-27
updated: 2025-11-28T22:32
status: active
---

# Rackarr — Product Roadmap

Single source of truth for version planning. Each version gets its own spec when work begins.

---

## Version Philosophy

- **Incremental releases** — Each version is usable and complete
- **Scope discipline** — Features stay in their designated version
- **Spec-driven** — No implementation without spec
- **User value** — Each release solves real problems

---

## Released

### v0.1.0 — MVP

**Status:** ✅ Released
**Released:** 2025-11-28
**Spec:** [[spec|spec.md]]
**Prompts:** [[prompt_plan|prompt_plan.md]]
**Checklist:** [[todo|todo.md]]

**Delivered:**

- [x] Single-page rack layout designer
- [x] Create/edit racks (1-100U)
- [x] Device palette with starter library
- [x] Drag-and-drop placement with collision detection
- [x] Multi-rack canvas (up to 6 racks)
- [x] Save/load JSON layouts
- [x] Export PNG/JPEG/SVG/PDF
- [x] Dark/light theme
- [x] Full keyboard navigation
- [x] Docker deployment

---

## In Progress

### v0.2.0 — Multi-View & Polish

**Status:** 🔨 In Development
**Target:** TBD
**Spec:** [[versions/v0.2-spec|v0.2-spec.md]]

**Scope:**

- [ ] Rear rack view toggle
- [ ] Device face assignment (front/rear/both)
- [ ] "Fit All" zoom button
- [ ] Rack duplication
- [ ] Import device library from JSON
- [ ] Device Library toggle (Rackarr icon + text)
- [ ] Rack title above rack (not below)
- [ ] Device icon vertical centering
- [ ] Remove Forgejo link from Help

**UI Refinements:**

- [ ] Device Library replaces Device Palette naming
- [ ] Remove X close button from Device Library drawer
- [ ] Active state for Device Library toggle button

---

## Planned

### v0.3.0 — Mobile & PWA

**Status:** 📋 Planned
**Spec:** [[versions/v0.3-spec|v0.3-spec.md]]

**Scope:**

- [ ] Full mobile phone support (create/edit layouts)
- [ ] Two-tap device placement (tap library → tap rack)
- [ ] Bottom sheet UI for Device Library and Edit Panel
- [ ] Swipe navigation between racks
- [ ] Pinch-to-zoom on canvas
- [ ] Progressive Web App (installable, offline)
- [ ] Service worker for offline capability
- [ ] Touch-friendly targets (48px minimum)

**Primary Targets:**

- iPhone SE, iPhone 14, Pixel 7

---

### v0.3.1 — History & Undo

**Status:** 📋 Planned
**Spec:** `versions/v0.3.1-spec.md` (not yet created)

**Planned Scope:**

- [ ] Undo/redo (command pattern)
- [ ] History stack with configurable depth
- [ ] Keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z)

**Discovery Needed:**

- Undo/redo granularity (per action vs per "transaction"?)
- History stack size limits (mobile vs desktop)?

---

### v0.4.0 — Accessibility

**Status:** 📋 Planned
**Spec:** `versions/v0.4-spec.md` (not yet created)

**Planned Scope:**

- [ ] Screen reader announcements for state changes
- [ ] Focus management improvements
- [ ] Full drag-and-drop accessibility
- [ ] High contrast mode

---

### v1.0.0 — Stable Release

**Status:** 📋 Planned
**Spec:** `versions/v1.0-spec.md` (not yet created)

**Planned Scope:**

- [ ] Documentation site
- [ ] Comprehensive test coverage
- [ ] Performance optimization
- [ ] Public launch

---

## Backlog (Unscheduled)

Features explicitly deferred with no version assigned:

| Feature                     | Notes                                                                   | Requested By |
| --------------------------- | ----------------------------------------------------------------------- | ------------ |
| Custom device categories    | Allow user-defined categories                                           | —            |
| Custom device images        | Upload icons for devices                                                | —            |
| Weight/depth metadata       | Physical specs for devices                                              | —            |
| Cable routing visualization | Show cable paths                                                        | —            |
| 3D visualization            | Three.js rack view                                                      | —            |
| Cloud sync / accounts       | User accounts, cloud storage                                            | —            |
| Collaborative editing       | Real-time multi-user                                                    | —            |
| Tablet-optimised layout     | Enhanced tablet experience                                              | —            |
| Device templates/presets    | Common device configurations                                            | —            |
| Import from CSV/spreadsheet | Bulk device import                                                      | —            |
| NetBox device type import   | Import from community library                                           | —            |
| Export both rack views      | Front + rear in single export                                           | —            |
| Device library export       | Save library to file                                                    | —            |
| 0U vertical PDU support     | Rail-mounted PDUs (left/right rails), NetBox-style                      | Research     |
| Svelvet Drawer pattern      | Component pattern for drag-from-toolbar UX (reference: Svelvet library) | Research     |

---

## Process

### Adding Features to Roadmap

1. Add to **Backlog** with brief description
2. When prioritizing for a version, move to that version's section
3. Before implementation, create `versions/vX.X-spec.md`
4. Generate prompt_plan and todo for that version
5. Implement following Harper Reed methodology

### Version Graduation

```
Backlog → Planned (assigned to version) → In Progress → Released
```

### Scope Changes Mid-Version

If a feature must be cut from current version:

1. Document WHY in this file
2. Move to next version or Backlog
3. Update spec.md "Out of Scope" section
4. Do NOT implement it anyway

---

## Changelog

| Date       | Change                                                     |
| ---------- | ---------------------------------------------------------- |
| 2025-11-27 | Initial roadmap created                                    |
| 2025-11-27 | v0.1 development started                                   |
| 2025-11-28 | v0.1 released                                              |
| 2025-11-28 | v0.2 spec created                                          |
| 2025-11-28 | v0.3 restructured: Mobile & PWA (was History & Export)     |
| 2025-11-28 | v0.3.1 created for Undo/Redo (bumped from v0.3)            |
| 2025-11-29 | Added panzoom library to v0.2 scope (smooth zoom/pan)      |
| 2025-11-29 | Added 0U PDU support and Svelvet Drawer pattern to backlog |
| 2025-11-29 | Added Hammer.js to v0.3 scope (mobile gestures)            |

---

## Related

- [[spec]] — Base specification (v0.1)
- [[versions/v0.2-spec]] — v0.2 specification
- [[versions/v0.3-spec]] — v0.3 specification
- [[prompt_plan]] — Implementation prompts
- [[todo]] — Progress checklist
- [[design-methodology]] — UX guidelines

---

_This file is the source of truth for Rackarr versioning. Update it, not GitHub Projects._
