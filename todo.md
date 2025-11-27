---
created: 2025-11-27
updated: 2025-11-27
status: active
version: '0.1.0'
---

# Rackarr v0.1 — Implementation Checklist

Progress tracker for prompt_plan.md execution.

---

## Phase 0: Project Bootstrap

### Prompt 0.1 — Project Scaffolding and Tooling

- [ ] Initialize Svelte 5 + Vite project with TypeScript
- [ ] Install testing dependencies (vitest, @testing-library/svelte, jsdom, playwright)
- [ ] Install linting dependencies (eslint, prettier, eslint-plugin-svelte)
- [ ] Install pre-commit hooks (husky, lint-staged)
- [ ] Configure vitest.config.ts for Svelte component testing
- [ ] Configure pre-commit hooks (lint, format, test)
- [ ] Configure TypeScript strict mode
- [ ] Create directory structure (components, stores, types, utils, data)
- [ ] Add CSS custom properties to app.css
- [ ] Write smoke test verifying setup
- [ ] Create CLAUDE.md with project conventions
- [ ] Verify: dev server, tests, build, pre-commit hooks all work
- [ ] **Commit:** `chore: project scaffolding with Svelte 5, Vite, and testing infrastructure`

### Prompt 0.2 — TypeScript Types Foundation

- [ ] Create DeviceCategory type (10 categories)
- [ ] Create Device interface
- [ ] Create PlacedDevice interface
- [ ] Create Rack interface
- [ ] Create LayoutSettings interface
- [ ] Create Layout interface (matches JSON schema)
- [ ] Create constants.ts (CATEGORY_COLOURS, limits, version)
- [ ] Write type validation tests
- [ ] **Commit:** `feat(types): add core TypeScript type definitions`

---

## Phase 1: Core Business Logic

### Prompt 1.1 — Device Utilities

- [ ] Write tests for generateId()
- [ ] Write tests for getDefaultColour()
- [ ] Write tests for createDevice()
- [ ] Write tests for validateDevice()
- [ ] Implement generateId() using crypto.randomUUID()
- [ ] Implement getDefaultColour()
- [ ] Implement createDevice()
- [ ] Implement validateDevice()
- [ ] All tests pass
- [ ] **Commit:** `feat(device): add device utility functions with validation`

### Prompt 1.2 — Rack Utilities

- [ ] Write tests for createRack()
- [ ] Write tests for validateRack()
- [ ] Write tests for getOccupiedUs()
- [ ] Write tests for isUAvailable()
- [ ] Implement createRack()
- [ ] Implement validateRack()
- [ ] Implement getOccupiedUs()
- [ ] Implement isUAvailable()
- [ ] All tests pass
- [ ] **Commit:** `feat(rack): add rack utility functions with validation`

### Prompt 1.3 — Collision Detection System

- [ ] Write tests for getDeviceURange()
- [ ] Write tests for doRangesOverlap()
- [ ] Write tests for canPlaceDevice()
- [ ] Write tests for findCollisions()
- [ ] Write tests for findValidDropPositions()
- [ ] Write tests for snapToNearestValidPosition()
- [ ] Implement all collision detection functions
- [ ] All tests pass
- [ ] **Commit:** `feat(collision): add collision detection system`

### Prompt 1.4 — Layout Persistence Logic

- [ ] Write tests for createLayout()
- [ ] Write tests for serializeLayout()
- [ ] Write tests for deserializeLayout()
- [ ] Write tests for validateLayoutStructure()
- [ ] Write round-trip test (serialize → deserialize)
- [ ] Implement createLayout()
- [ ] Implement serializeLayout()
- [ ] Implement deserializeLayout()
- [ ] Implement validateLayoutStructure() type guard
- [ ] All tests pass
- [ ] **Commit:** `feat(serialization): add layout JSON persistence and validation`

---

## Phase 2: State Management

### Prompt 2.1 — Layout Store (Svelte 5 Runes)

- [ ] Create layout.svelte.ts with $state for layout and isDirty
- [ ] Create $derived for racks, deviceLibrary, rackCount, canAddRack
- [ ] Implement createNewLayout()
- [ ] Implement loadLayout() and resetLayout()
- [ ] Implement rack actions (add, update, delete, reorder)
- [ ] Implement device library actions (add, update, delete)
- [ ] Implement placement actions (place, move, moveToRack, remove)
- [ ] Implement dirty tracking (markDirty, markClean)
- [ ] Write tests for all store actions
- [ ] All tests pass
- [ ] **Commit:** `feat(store): add layout store with Svelte 5 runes`

### Prompt 2.2 — Selection Store

- [ ] Create selection.svelte.ts with $state
- [ ] Create $derived for hasSelection, isRackSelected, isDeviceSelected
- [ ] Implement selectRack()
- [ ] Implement selectDevice()
- [ ] Implement clearSelection()
- [ ] Write tests for selection state changes
- [ ] All tests pass
- [ ] **Commit:** `feat(store): add selection store`

### Prompt 2.3 — UI Store (Theme, Zoom, Drawers)

- [ ] Create ui.svelte.ts with theme state and actions
- [ ] Create theme utilities (load, save, apply to document)
- [ ] Create zoom state with min/max/step constraints
- [ ] Create drawer state (left, right) with toggle actions
- [ ] Add $effect for theme persistence and document update
- [ ] Write tests for theme, zoom, and drawer state
- [ ] All tests pass
- [ ] **Commit:** `feat(store): add UI store for theme, zoom, and drawers`

### Prompt 2.4 — Session Persistence

- [ ] Create session.ts utilities (save, load, clear, hasSession)
- [ ] Create debounce utility
- [ ] Update layout store with session auto-save ($effect, debounced)
- [ ] Add restoreFromSession() action
- [ ] Write tests for session storage operations
- [ ] Write tests for debounce utility
- [ ] All tests pass
- [ ] **Commit:** `feat(persistence): add sessionStorage auto-save`

---

## Phase 3: Core Components

### Prompt 3.1 — Rack SVG Component

- [ ] Create Rack.svelte with props (rack, deviceLibrary, selected, zoom)
- [ ] Render SVG with correct dimensions
- [ ] Render background rectangle
- [ ] Render left rail with U numbers (U1 at bottom)
- [ ] Render grid lines and rack nut points
- [ ] Render rack name below
- [ ] Render selection outline when selected
- [ ] Apply zoom transform
- [ ] Handle click and keyboard events
- [ ] Add accessibility attributes
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(components): add Rack SVG visualization component`

### Prompt 3.2 — Device SVG Component

- [ ] Create RackDevice.svelte with props
- [ ] Calculate correct Y position (U1 at bottom)
- [ ] Render rectangle with device colour
- [ ] Render device name (centered, truncated)
- [ ] Render selection outline when selected
- [ ] Handle click events (stop propagation)
- [ ] Add accessibility attributes
- [ ] Create CategoryIcon.svelte (simple geometric icons)
- [ ] Update Rack.svelte to render RackDevice components
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(components): add RackDevice SVG component`

### Prompt 3.3 — Canvas Component

- [ ] Create Canvas.svelte (reads from stores)
- [ ] Render racks in horizontal row, sorted by position
- [ ] Bottom-align racks (flex-end)
- [ ] Enable horizontal scroll
- [ ] Handle click on empty space (clear selection)
- [ ] Create EmptyState.svelte
- [ ] Show EmptyState when no racks
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(components): add Canvas with multi-rack layout`

### Prompt 3.4 — Device Palette (Left Drawer)

- [ ] Create DevicePalette.svelte with search state
- [ ] Implement search filtering (case-insensitive)
- [ ] Implement category grouping
- [ ] Create DevicePaletteItem.svelte
- [ ] Display device name, height badge, colour swatch
- [ ] Add "Add Device" button
- [ ] Create deviceFilters.ts utilities
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(components): add Device Palette with search and grouping`

---

## Phase 4: Drag-and-Drop

### Prompt 4.1 — DnD: Palette to Rack

- [ ] Install svelte-dnd-action
- [ ] Create dragdrop.ts utilities (calculateDropPosition, getDropFeedback)
- [ ] Make DevicePaletteItem draggable
- [ ] Update Rack.svelte to accept drops
- [ ] Show drop preview at target position
- [ ] Highlight valid/invalid drop zones
- [ ] Call placeDevice on valid drop
- [ ] Write integration tests
- [ ] All tests pass
- [ ] **Commit:** `feat(dnd): add drag-and-drop from palette to rack`

### Prompt 4.2 — DnD: Move Within Rack

- [ ] Make RackDevice draggable
- [ ] Show placeholder during drag
- [ ] Handle internal rack moves (exclude source from collision)
- [ ] Show drop preview at new position
- [ ] Call moveDevice on valid drop
- [ ] Add keyboard movement (ArrowUp/ArrowDown)
- [ ] Block movement at boundaries and collisions
- [ ] Write integration tests
- [ ] All tests pass
- [ ] **Commit:** `feat(dnd): add device movement within rack`

### Prompt 4.3 — DnD: Move Between Racks

- [ ] Detect cross-rack drag source
- [ ] Full collision checking against target rack
- [ ] Validate device height fits target rack
- [ ] Show drop preview with validation feedback
- [ ] Call moveDeviceToRack on valid drop
- [ ] Handle edge cases (same rack, too tall, blocked)
- [ ] Write integration tests
- [ ] All tests pass
- [ ] **Commit:** `feat(dnd): add device movement between racks`

---

## Phase 5: Application Shell

### Prompt 5.1 — Toolbar Component

- [ ] Create Toolbar.svelte with correct layout
- [ ] Add logo and app name
- [ ] Add action buttons (New Rack, Palette, Save, Load, Export, Delete)
- [ ] Add zoom controls with level display
- [ ] Add theme toggle
- [ ] Add help button
- [ ] Create ToolbarButton.svelte (reusable)
- [ ] Create icon components
- [ ] Wire disabled states (Delete, Zoom limits)
- [ ] Add ARIA labels
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(components): add Toolbar with all action buttons`

### Prompt 5.2 — Drawer Component

- [ ] Create Drawer.svelte with side prop
- [ ] Implement slide animation
- [ ] Create DrawerHeader.svelte with close button
- [ ] Style for both themes
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(components): add Drawer component`

### Prompt 5.3 — Edit Panel (Right Drawer)

- [ ] Create EditPanel.svelte
- [ ] Subscribe to selection and layout stores
- [ ] Add $effect for auto-show/hide on selection change
- [ ] Implement rack editing fields
- [ ] Implement device display fields
- [ ] Add height restriction message when devices present
- [ ] Add Delete/Remove buttons
- [ ] Create ColourSwatch.svelte
- [ ] Wire form changes to store actions
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(components): add Edit Panel with auto-show`

### Prompt 5.4 — App Layout Integration

- [ ] Update App.svelte with full layout structure
- [ ] Wire Toolbar events to store actions
- [ ] Coordinate drawer visibility
- [ ] Add beforeunload handler for unsaved changes
- [ ] Initialize stores on mount
- [ ] Write integration tests
- [ ] All tests pass
- [ ] **Commit:** `feat(app): integrate all components into main layout`

---

## Phase 6: Forms and Dialogs

### Prompt 6.1 — Dialog Component

- [ ] Create Dialog.svelte with backdrop
- [ ] Implement focus trap
- [ ] Handle Escape key
- [ ] Handle backdrop click
- [ ] Add accessibility attributes (role, aria-modal, etc.)
- [ ] Manage focus on open/close
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(components): add Dialog modal component`

### Prompt 6.2 — New Rack Form

- [ ] Create NewRackForm.svelte
- [ ] Add name input field
- [ ] Add height selection (presets + custom)
- [ ] Implement validation
- [ ] Handle submit and cancel
- [ ] Wire into App (Toolbar button opens form)
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(forms): add New Rack creation form`

### Prompt 6.3 — Add Device Form

- [ ] Create AddDeviceForm.svelte
- [ ] Add all form fields (name, height, category, colour, notes)
- [ ] Create ColourPicker.svelte
- [ ] Implement dynamic colour default based on category
- [ ] Implement validation
- [ ] Wire into DevicePalette
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(forms): add Add Device form`

### Prompt 6.4 — Confirmation Dialog

- [ ] Create ConfirmDialog.svelte
- [ ] Support destructive and non-destructive modes
- [ ] Handle confirm and cancel
- [ ] Handle Enter and Escape keys
- [ ] Integrate for rack deletion
- [ ] Integrate for device library deletion
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(dialogs): add confirmation dialog`

---

## Phase 7: Save/Load and Starter Library

### Prompt 7.1 — Starter Device Library

- [ ] Create starterLibrary.ts
- [ ] Add all 23 starter devices from spec
- [ ] Use deterministic IDs
- [ ] Apply correct category colours
- [ ] Update createLayout to include starter library
- [ ] Write tests for starter library
- [ ] All tests pass
- [ ] **Commit:** `feat(data): add starter device library`

### Prompt 7.2 — File Save/Load

- [ ] Create file.ts utilities
- [ ] Implement downloadLayout()
- [ ] Implement openFilePicker()
- [ ] Implement readLayoutFile()
- [ ] Wire Save button to downloadLayout
- [ ] Wire Load button to file picker flow
- [ ] Handle errors with toast (next prompt)
- [ ] Mark clean on successful load
- [ ] Write tests for file operations
- [ ] All tests pass
- [ ] **Commit:** `feat(file): add save and load layout files`

---

## Phase 8: Feedback and Polish

### Prompt 8.1 — Toast Notifications

- [ ] Create toast.svelte.ts store
- [ ] Implement showToast(), dismissToast(), clearAllToasts()
- [ ] Add auto-dismiss $effect
- [ ] Create ToastContainer.svelte
- [ ] Create Toast.svelte with type-based styling
- [ ] Add ToastContainer to App.svelte
- [ ] Integrate toasts for errors and success messages
- [ ] Write tests for toast system
- [ ] All tests pass
- [ ] **Commit:** `feat(feedback): add toast notification system`

### Prompt 8.2 — Keyboard Shortcuts

- [ ] Create keyboard.ts utilities
- [ ] Create KeyboardHandler.svelte
- [ ] Implement all shortcuts from spec Section 8
- [ ] Handle modifier keys (Ctrl/Cmd)
- [ ] Ignore when input focused
- [ ] Add KeyboardHandler to App.svelte
- [ ] Write tests for all shortcuts
- [ ] All tests pass
- [ ] **Commit:** `feat(keyboard): add all keyboard shortcuts`

### Prompt 8.3 — Rack Reordering (Drag + Keyboard)

- [ ] Add drag handle to rack header
- [ ] Implement rack drag-and-drop in Canvas
- [ ] Show drop indicators between racks
- [ ] Implement ArrowLeft/ArrowRight rack reordering
- [ ] Update reorderRacks in layout store
- [ ] Write tests for rack reordering
- [ ] All tests pass
- [ ] **Commit:** `feat(canvas): add rack reordering via drag and keyboard`

---

## Phase 9: Export

### Prompt 9.1 — Export Dialog

- [ ] Create ExportDialog.svelte
- [ ] Add format dropdown (PNG, JPEG, SVG, PDF)
- [ ] Add scope dropdown (All/Selected)
- [ ] Add checkboxes (rack names, legend)
- [ ] Add background dropdown (Dark/Light/Transparent)
- [ ] Disable Transparent for non-SVG
- [ ] Disable Selected when no selection
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(export): add export dialog with options`

### Prompt 9.2 — Export Implementation

- [ ] Create export.ts utilities
- [ ] Implement generateExportSVG()
- [ ] Implement exportAsSVG()
- [ ] Implement exportAsPNG()
- [ ] Implement exportAsJPEG()
- [ ] Implement exportAsPDF() (install jspdf)
- [ ] Create ExportLegend.svelte
- [ ] Wire ExportDialog into App
- [ ] Write tests for export functions
- [ ] All tests pass
- [ ] **Commit:** `feat(export): implement PNG, JPEG, SVG, PDF export`

---

## Phase 10: Help and Accessibility

### Prompt 10.1 — Help Panel

- [ ] Create HelpPanel.svelte
- [ ] Add app name and version
- [ ] Add description
- [ ] Create ShortcutsTable.svelte
- [ ] Add repository links
- [ ] Add license info
- [ ] Wire to Toolbar Help button and ? key
- [ ] Create version.ts
- [ ] Write component tests
- [ ] All tests pass
- [ ] **Commit:** `feat(help): add Help/About panel`

### Prompt 10.2 — Accessibility Audit

- [ ] Audit semantic HTML (replace div onclick with button)
- [ ] Add proper heading hierarchy
- [ ] Add landmark regions
- [ ] Verify visible focus indicators
- [ ] Add missing ARIA labels
- [ ] Add aria-expanded on toggles
- [ ] Add aria-selected on selected items
- [ ] Add aria-live on toast container
- [ ] Verify keyboard navigation
- [ ] Run colour contrast check
- [ ] Write accessibility tests
- [ ] All tests pass
- [ ] **Commit:** `feat(a11y): accessibility improvements`

### Prompt 10.3 — Category Icons

- [ ] Create IconServer.svelte
- [ ] Create IconNetwork.svelte
- [ ] Create IconPatchPanel.svelte
- [ ] Create IconPower.svelte
- [ ] Create IconStorage.svelte
- [ ] Create IconKvm.svelte
- [ ] Create IconAvMedia.svelte
- [ ] Create IconCooling.svelte
- [ ] Create IconBlank.svelte
- [ ] Create IconOther.svelte
- [ ] Update CategoryIcon.svelte with dynamic import
- [ ] Update RackDevice with category icon
- [ ] Update DevicePaletteItem with category icon
- [ ] Write tests for icons
- [ ] All tests pass
- [ ] **Commit:** `feat(icons): add category icons for devices`

---

## Phase 11: E2E and Final Integration

### Prompt 11.1 — Welcome State and Application Flow

- [ ] Create WelcomeScreen.svelte
- [ ] Add logo, welcome message, action buttons
- [ ] Update App.svelte for initial load flow
- [ ] Handle zero racks state (show welcome or auto-open form)
- [ ] Write tests for welcome screen
- [ ] All tests pass
- [ ] **Commit:** `feat(welcome): add initial load and welcome state`

### Prompt 11.2 — E2E Tests

- [ ] Configure Playwright
- [ ] Write basic-workflow.spec.ts (create rack, add device, move, delete)
- [ ] Write persistence.spec.ts (save, load, session, unsaved warning)
- [ ] Write multi-rack.spec.ts (multiple racks, cross-rack move, reorder)
- [ ] Write export.spec.ts (dialog, PNG, SVG, legend)
- [ ] Write keyboard.spec.ts (all shortcuts)
- [ ] Add npm script: test:e2e
- [ ] All E2E tests pass
- [ ] **Commit:** `test(e2e): comprehensive E2E test suite`

### Prompt 11.3 — Final Integration and Polish

- [ ] Visual polish (spacing, animations)
- [ ] Handle edge cases (long names, max height rack, 6 racks)
- [ ] Error handling review
- [ ] Performance check (6 racks, smooth DnD)
- [ ] Run full test suite (unit + E2E)
- [ ] Code cleanup (remove console.log, TODOs)
- [ ] No TypeScript errors
- [ ] No linting warnings
- [ ] **Commit:** `chore: final polish and integration`

---

## Phase 12: Deployment

### Prompt 12.1 — Docker Configuration

- [ ] Create Dockerfile (multi-stage build)
- [ ] Create nginx.conf (SPA fallback, gzip, caching)
- [ ] Create docker-compose.yml
- [ ] Create .dockerignore
- [ ] Test: docker build -t rackarr .
- [ ] Test: docker run -p 8080:80 rackarr
- [ ] Verify app works at localhost:8080
- [ ] **Commit:** `chore(docker): add Docker deployment configuration`

### Prompt 12.2 — Documentation and README

- [ ] Create README.md with all sections
- [ ] Create CHANGELOG.md with v0.1.0 notes
- [ ] Create LICENSE (MIT)
- [ ] Create CONTRIBUTING.md
- [ ] Verify package.json metadata
- [ ] **Commit:** `docs: add README, CHANGELOG, LICENSE, CONTRIBUTING`

### Prompt 12.3 — Final Review and Release

- [ ] Run all unit tests: npm run test
- [ ] Run all E2E tests: npm run test:e2e
- [ ] Build verification: npm run build
- [ ] Preview verification: npm run preview
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Docker verification
- [ ] Success criteria checklist (spec Section 20):
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
- [ ] Final code cleanup
- [ ] Create git tag: v0.1.0
- [ ] Push to primary (Forgejo)
- [ ] Push to mirror (GitHub)
- [ ] **Commit:** `chore: v0.1.0 release`

---

## Summary

| Phase                 | Tasks   | Complete |
| --------------------- | ------- | -------- |
| 0. Bootstrap          | 25      | ⬜       |
| 1. Business Logic     | 40      | ⬜       |
| 2. State Management   | 40      | ⬜       |
| 3. Core Components    | 48      | ⬜       |
| 4. Drag-and-Drop      | 27      | ⬜       |
| 5. App Shell          | 40      | ⬜       |
| 6. Forms & Dialogs    | 36      | ⬜       |
| 7. Save/Load          | 18      | ⬜       |
| 8. Feedback & Polish  | 27      | ⬜       |
| 9. Export             | 18      | ⬜       |
| 10. Help & A11y       | 30      | ⬜       |
| 11. E2E & Integration | 21      | ⬜       |
| 12. Deployment        | 25      | ⬜       |
| **TOTAL**             | **395** | **0%**   |

---

## Quick Commands

```bash
# Development
npm run dev          # Start dev server
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run build        # Production build
npm run preview      # Preview build

# Docker
docker build -t rackarr .
docker run -p 8080:80 rackarr
docker-compose up

# Git
git add -A && git commit  # Pre-commit hooks run automatically
git tag v0.1.0
git push origin main
git push github main
```

---

_Checklist generated from prompt_plan.md_
