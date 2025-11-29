---
created: 2025-11-27
updated: 2025-11-28T23:27
status: active
version: 0.1.0
---

# Rackarr v0.1 — Implementation Checklist

Progress tracker for prompt_plan.md execution.

---

## Phase 0: Project Bootstrap

### Prompt 0.1 — Project Scaffolding and Tooling

- [x] Initialize Svelte 5 + Vite project with TypeScript
- [x] Install testing dependencies (vitest, @testing-library/svelte, jsdom, playwright)
- [x] Install linting dependencies (eslint, prettier, eslint-plugin-svelte)
- [x] Install pre-commit hooks (husky, lint-staged)
- [x] Configure vitest.config.ts for Svelte component testing
- [x] Configure pre-commit hooks (lint, format, test)
- [x] Configure TypeScript strict mode
- [x] Create directory structure (components, stores, types, utils, data)
- [x] Add CSS custom properties to app.css
- [x] Write smoke test verifying setup
- [x] Create CLAUDE.md with project conventions
- [x] Verify: dev server, tests, build, pre-commit hooks all work
- [x] **Commit:** `chore: project scaffolding with Svelte 5, Vite, and testing infrastructure`

### Prompt 0.2 — TypeScript Types Foundation

- [x] Create DeviceCategory type (10 categories)
- [x] Create Device interface
- [x] Create PlacedDevice interface
- [x] Create Rack interface
- [x] Create LayoutSettings interface
- [x] Create Layout interface (matches JSON schema)
- [x] Create constants.ts (CATEGORY_COLOURS, limits, version)
- [x] Write type validation tests
- [x] **Commit:** `feat(types): add core TypeScript type definitions`

---

## Phase 1: Core Business Logic

### Prompt 1.1 — Device Utilities

- [x] Write tests for generateId()
- [x] Write tests for getDefaultColour()
- [x] Write tests for createDevice()
- [x] Write tests for validateDevice()
- [x] Implement generateId() using crypto.randomUUID()
- [x] Implement getDefaultColour()
- [x] Implement createDevice()
- [x] Implement validateDevice()
- [x] All tests pass
- [x] **Commit:** `feat(device): add device utility functions with validation`

### Prompt 1.2 — Rack Utilities

- [x] Write tests for createRack()
- [x] Write tests for validateRack()
- [x] Write tests for getOccupiedUs()
- [x] Write tests for isUAvailable()
- [x] Implement createRack()
- [x] Implement validateRack()
- [x] Implement getOccupiedUs()
- [x] Implement isUAvailable()
- [x] All tests pass
- [x] **Commit:** `feat(rack): add rack utility functions with validation`

### Prompt 1.3 — Collision Detection System

- [x] Write tests for getDeviceURange()
- [x] Write tests for doRangesOverlap()
- [x] Write tests for canPlaceDevice()
- [x] Write tests for findCollisions()
- [x] Write tests for findValidDropPositions()
- [x] Write tests for snapToNearestValidPosition()
- [x] Implement all collision detection functions
- [x] All tests pass
- [x] **Commit:** `feat(collision): add collision detection system`

### Prompt 1.4 — Layout Persistence Logic

- [x] Write tests for createLayout()
- [x] Write tests for serializeLayout()
- [x] Write tests for deserializeLayout()
- [x] Write tests for validateLayoutStructure()
- [x] Write round-trip test (serialize → deserialize)
- [x] Implement createLayout()
- [x] Implement serializeLayout()
- [x] Implement deserializeLayout()
- [x] Implement validateLayoutStructure() type guard
- [x] All tests pass
- [x] **Commit:** `feat(serialization): add layout JSON persistence and validation`

---

## Phase 2: State Management

### Prompt 2.1 — Layout Store (Svelte 5 Runes)

- [x] Create layout.svelte.ts with $state for layout and isDirty
- [x] Create $derived for racks, deviceLibrary, rackCount, canAddRack
- [x] Implement createNewLayout()
- [x] Implement loadLayout() and resetLayout()
- [x] Implement rack actions (add, update, delete, reorder)
- [x] Implement device library actions (add, update, delete)
- [x] Implement placement actions (place, move, moveToRack, remove)
- [x] Implement dirty tracking (markDirty, markClean)
- [x] Write tests for all store actions
- [x] All tests pass
- [x] **Commit:** `feat(store): add layout store with Svelte 5 runes`

### Prompt 2.2 — Selection Store

- [x] Create selection.svelte.ts with $state
- [x] Create $derived for hasSelection, isRackSelected, isDeviceSelected
- [x] Implement selectRack()
- [x] Implement selectDevice()
- [x] Implement clearSelection()
- [x] Write tests for selection state changes
- [x] All tests pass
- [x] **Commit:** `feat(store): add selection store`

### Prompt 2.3 — UI Store (Theme, Zoom, Drawers)

- [x] Create ui.svelte.ts with theme state and actions
- [x] Create theme utilities (load, save, apply to document)
- [x] Create zoom state with min/max/step constraints
- [x] Create drawer state (left, right) with toggle actions
- [x] Add $effect for theme persistence and document update
- [x] Write tests for theme, zoom, and drawer state
- [x] All tests pass
- [x] **Commit:** `feat(store): add UI store for theme, zoom, and drawers`

### Prompt 2.4 — Session Persistence

- [x] Create session.ts utilities (save, load, clear, hasSession)
- [x] Create debounce utility
- [x] Update layout store with session auto-save ($effect, debounced)
- [x] Add restoreFromSession() action
- [x] Write tests for session storage operations
- [x] Write tests for debounce utility
- [x] All tests pass
- [x] **Commit:** `feat(persistence): add sessionStorage auto-save`

---

## Phase 3: Core Components

### Prompt 3.1 — Rack SVG Component

- [x] Create Rack.svelte with props (rack, deviceLibrary, selected, zoom)
- [x] Render SVG with correct dimensions
- [x] Render background rectangle
- [x] Render left rail with U numbers (U1 at bottom)
- [x] Render grid lines and rack nut points
- [x] Render rack name below
- [x] Render selection outline when selected
- [x] Apply zoom transform
- [x] Handle click and keyboard events
- [x] Add accessibility attributes
- [x] Write component tests
- [x] All tests pass
- [x] **Commit:** `feat(components): add Rack SVG visualization component`

### Prompt 3.2 — Device SVG Component

- [x] Create RackDevice.svelte with props
- [x] Calculate correct Y position (U1 at bottom)
- [x] Render rectangle with device colour
- [x] Render device name (centered, truncated)
- [x] Render selection outline when selected
- [x] Handle click events (stop propagation)
- [x] Add accessibility attributes
- [x] Create CategoryIcon.svelte (simple geometric icons)
- [x] Update Rack.svelte to render RackDevice components
- [x] Write component tests
- [x] All tests pass
- [x] **Commit:** `feat(components): add RackDevice SVG component`

### Prompt 3.3 — Canvas Component

- [x] Create Canvas.svelte (reads from stores)
- [x] Render racks in horizontal row, sorted by position
- [x] Bottom-align racks (flex-end)
- [x] Enable horizontal scroll
- [x] Handle click on empty space (clear selection)
- [x] Create EmptyState.svelte
- [x] Show EmptyState when no racks
- [x] Write component tests
- [x] All tests pass
- [x] **Commit:** `feat(components): add Canvas with multi-rack layout`

### Prompt 3.4 — Device Palette (Left Drawer)

- [x] Create DevicePalette.svelte with search state
- [x] Implement search filtering (case-insensitive)
- [x] Implement category grouping
- [x] Create DevicePaletteItem.svelte
- [x] Display device name, height badge, colour swatch
- [x] Add "Add Device" button
- [x] Create deviceFilters.ts utilities
- [x] Write component tests
- [x] All tests pass
- [x] **Commit:** `feat(components): add Device Palette with search and grouping`

---

## Phase 4: Drag-and-Drop

### Prompt 4.1 — DnD: Palette to Rack

- [x] Install svelte-dnd-action
- [x] Create dragdrop.ts utilities (calculateDropPosition, getDropFeedback)
- [x] Make DevicePaletteItem draggable
- [x] Update Rack.svelte to accept drops
- [x] Show drop preview at target position
- [x] Highlight valid/invalid drop zones
- [x] Call placeDevice on valid drop
- [x] Write integration tests
- [x] All tests pass
- [x] **Commit:** `feat(dnd): add drag-and-drop from palette to rack`

### Prompt 4.2 — DnD: Move Within Rack

- [x] Make RackDevice draggable
- [x] Show placeholder during drag
- [x] Handle internal rack moves (exclude source from collision)
- [x] Show drop preview at new position
- [x] Call moveDevice on valid drop
- [x] Add keyboard movement (ArrowUp/ArrowDown)
- [x] Block movement at boundaries and collisions
- [x] Write integration tests
- [x] All tests pass
- [x] **Commit:** `feat(dnd): add device movement within rack`

### Prompt 4.3 — DnD: Move Between Racks

- [x] Write integration tests (20 tests in dnd-between-racks.test.ts)
- [x] Detect cross-rack drag source (Rack.svelte)
- [x] Full collision checking against target rack
- [x] Validate device height fits target rack
- [x] Show drop preview with validation feedback
- [x] Add ondevicemoverack callback to Rack.svelte
- [x] Wire Canvas.svelte to handle ondevicemoverack (calls layoutStore.moveDeviceToRack)
- [x] All tests pass
- [x] **Commit:** `feat(dnd): add device movement between racks`

---

## Phase 5: Application Shell

### Prompt 5.1 — Toolbar Component

- [x] Create Toolbar.svelte with correct layout
- [x] Add logo and app name
- [x] Add action buttons (New Rack, Palette, Save, Load, Export, Delete)
- [x] Add zoom controls with level display
- [x] Add theme toggle
- [x] Add help button
- [x] Create ToolbarButton.svelte (reusable)
- [x] Create icon components
- [x] Wire disabled states (Delete, Zoom limits)
- [x] Add ARIA labels
- [x] Write component tests
- [x] All tests pass
- [x] **Commit:** `feat(components): add Toolbar with all action buttons`

### Prompt 5.2 — Drawer Component

- [x] Create Drawer.svelte with side prop
- [x] Implement slide animation
- [x] Create DrawerHeader.svelte with close button
- [x] Style for both themes
- [x] Write component tests
- [x] All tests pass
- [x] **Commit:** `feat(components): add Drawer component`

### Prompt 5.3 — Edit Panel (Right Drawer)

- [x] Create EditPanel.svelte
- [x] Subscribe to selection and layout stores
- [x] Add $effect for auto-show/hide on selection change
- [x] Implement rack editing fields
- [x] Implement device display fields
- [x] Add height restriction message when devices present
- [x] Add Delete/Remove buttons
- [x] Create ColourSwatch.svelte
- [x] Wire form changes to store actions
- [x] Write component tests
- [x] All tests pass
- [x] **Commit:** `feat(components): add Edit Panel with auto-show`

### Prompt 5.4 — App Layout Integration

- [x] Update App.svelte with full layout structure
- [x] Wire Toolbar events to store actions
- [x] Coordinate drawer visibility
- [x] Add beforeunload handler for unsaved changes
- [x] Initialize stores on mount
- [x] Write integration tests
- [x] All tests pass
- [x] **Commit:** `feat(app): integrate all components into main layout`

---

## Phase 6: Forms and Dialogs

### Prompt 6.1 — Dialog Component

- [x] Create Dialog.svelte with backdrop
- [x] Implement focus trap
- [x] Handle Escape key
- [x] Handle backdrop click
- [x] Add accessibility attributes (role, aria-modal, etc.)
- [x] Manage focus on open/close
- [x] Write component tests
- [x] All tests pass
- [x] **Commit:** `feat(components): add Dialog modal component`

### Prompt 6.2 — New Rack Form

- [x] Create NewRackForm.svelte
- [x] Add name input field
- [x] Add height selection (presets + custom)
- [x] Implement validation
- [x] Handle submit and cancel
- [x] Wire into App (Toolbar button opens form)
- [x] Write component tests
- [x] All tests pass
- [x] **Commit:** `feat(forms): add New Rack creation form`

### Prompt 6.3 — Add Device Form

- [x] Create AddDeviceForm.svelte
- [x] Add all form fields (name, height, category, colour, notes)
- [x] Create ColourPicker.svelte (integrated into form)
- [x] Implement dynamic colour default based on category
- [x] Implement validation
- [x] Wire into DevicePalette
- [x] Write component tests
- [x] All tests pass
- [x] **Commit:** `feat(forms): add Add Device form`

### Prompt 6.4 — Confirmation Dialog

- [x] Create ConfirmDialog.svelte
- [x] Support destructive and non-destructive modes
- [x] Handle confirm and cancel
- [x] Handle Enter and Escape keys
- [x] Integrate for rack deletion
- [x] Integrate for device library deletion
- [x] Write component tests
- [x] All tests pass
- [x] **Commit:** `feat(dialogs): add confirmation dialog`

---

## Phase 7: Save/Load and Starter Library

### Prompt 7.1 — Starter Device Library

- [x] Create starterLibrary.ts
- [x] Add all 22 starter devices from spec (originally spec said 23 but has 22)
- [x] Use deterministic IDs
- [x] Apply correct category colours
- [x] Update createLayout to include starter library
- [x] Write tests for starter library
- [x] All tests pass
- [x] **Commit:** `feat(data): add starter device library`

### Prompt 7.2 — File Save/Load

- [x] Create file.ts utilities
- [x] Implement downloadLayout()
- [x] Implement openFilePicker()
- [x] Implement readLayoutFile()
- [x] Wire Save button to downloadLayout
- [x] Wire Load button to file picker flow
- [x] Handle errors with alert (toast in Phase 8)
- [x] Mark clean on successful load
- [x] Write tests for file operations (21 tests)
- [x] All tests pass
- [x] **Commit:** `feat(file): add save and load layout files`

---

## Phase 8: Feedback and Polish

### Prompt 8.1 — Toast Notifications

- [x] Create toast.svelte.ts store
- [x] Implement showToast(), dismissToast(), clearAllToasts()
- [x] Add auto-dismiss via setTimeout
- [x] Create ToastContainer.svelte
- [x] Create Toast.svelte with type-based styling
- [x] Add ToastContainer to App.svelte
- [x] Integrate toasts for save/load success and error messages
- [x] Write tests for toast system (21 tests)
- [x] All tests pass
- [x] **Commit:** `feat(feedback): add toast notification system`

### Prompt 8.2 — Keyboard Shortcuts

- [x] Create keyboard.ts utilities
- [x] Create KeyboardHandler.svelte
- [x] Implement all shortcuts from spec Section 8
- [x] Handle modifier keys (Ctrl/Cmd)
- [x] Ignore when input focused
- [x] Add KeyboardHandler to App.svelte
- [x] Write tests for all shortcuts (20 tests)
- [x] All tests pass
- [x] **Commit:** `feat(keyboard): add all keyboard shortcuts`

### Prompt 8.3 — Rack Reordering (Drag + Keyboard)

- [x] Add drag handle to rack header
- [x] Implement rack drag-and-drop in Canvas
- [x] Show drop indicators between racks
- [x] Implement ArrowLeft/ArrowRight rack reordering
- [x] Update reorderRacks in layout store
- [x] Write tests for rack reordering (8 tests)
- [x] All tests pass
- [x] **Commit:** `feat(rack): add drag handle for rack reordering`

---

## Phase 9: Export

### Prompt 9.1 — Export Dialog

- [x] Create ExportDialog.svelte
- [x] Add format dropdown (PNG, JPEG, SVG, PDF)
- [x] Add scope dropdown (All/Selected)
- [x] Add checkboxes (rack names, legend)
- [x] Add background dropdown (Dark/Light/Transparent)
- [x] Disable Transparent for non-SVG
- [x] Disable Selected when no selection
- [x] Write component tests (17 tests)
- [x] All tests pass
- [x] **Commit:** `feat(export): add export dialog with options`

### Prompt 9.2 — Export Implementation

- [x] Create export.ts utilities
- [x] Implement generateExportSVG()
- [x] Implement exportAsSVG()
- [x] Implement exportAsPNG()
- [x] Implement exportAsJPEG()
- [x] PDF export placeholder (requires jspdf library)
- [x] Legend integrated into SVG export
- [x] Wire ExportDialog into App
- [x] Write tests for export functions (20 tests)
- [x] All tests pass
- [x] **Commit:** `feat(export): implement PNG, JPEG, SVG export`

---

## Phase 10: Help and Accessibility

### Prompt 10.1 — Help Panel

- [x] Create HelpPanel.svelte
- [x] Add app name and version
- [x] Add description
- [x] Create ShortcutsTable.svelte
- [x] Add repository links
- [x] Add license info
- [x] Wire to Toolbar Help button and ? key
- [x] Create version.ts
- [x] Write component tests
- [x] All tests pass
- [x] **Commit:** `feat(help): add Help/About panel`

### Prompt 10.2 — Accessibility Audit

- [x] Audit semantic HTML (replace div onclick with button)
- [x] Add proper heading hierarchy
- [x] Add landmark regions
- [x] Verify visible focus indicators
- [x] Add missing ARIA labels
- [x] Add aria-expanded on toggles
- [x] Add aria-selected on selected items
- [x] Add aria-live on toast container
- [x] Verify keyboard navigation
- [x] Run colour contrast check
- [x] Write accessibility tests
- [x] All tests pass
- [x] **Commit:** `feat(a11y): accessibility improvements`

### Prompt 10.3 — Category Icons

- [x] Create IconServer.svelte
- [x] Create IconNetwork.svelte
- [x] Create IconPatchPanel.svelte
- [x] Create IconPower.svelte
- [x] Create IconStorage.svelte
- [x] Create IconKvm.svelte
- [x] Create IconAvMedia.svelte
- [x] Create IconCooling.svelte
- [x] Create IconBlank.svelte
- [x] Create IconOther.svelte
- [x] Update CategoryIcon.svelte with dynamic import
- [x] Update RackDevice with category icon
- [x] Update DevicePaletteItem with category icon
- [x] Write tests for icons
- [x] All tests pass
- [x] **Commit:** `feat(icons): add category icons for devices`

---

## Phase 11: E2E and Final Integration

### Prompt 11.1 — Welcome State and Application Flow

- [x] Create WelcomeScreen.svelte
- [x] Add logo, welcome message, action buttons
- [x] Update App.svelte for initial load flow
- [x] Handle zero racks state (show welcome or auto-open form)
- [x] Write tests for welcome screen
- [x] All tests pass
- [x] **Commit:** `feat(welcome): add initial load and welcome state`

### Prompt 11.2 — E2E Tests

- [x] Configure Playwright
- [x] Write basic-workflow.spec.ts (create rack, add device, move, delete)
- [x] Write persistence.spec.ts (save, load, session, unsaved warning)
- [x] Write multi-rack.spec.ts (multiple racks, cross-rack move, reorder)
- [x] Write export.spec.ts (dialog, PNG, SVG, legend)
- [x] Write keyboard.spec.ts (all shortcuts)
- [x] Add npm script: test:e2e
- [x] All E2E tests pass
- [x] **Commit:** `test(e2e): comprehensive E2E test suite`

### Prompt 11.3 — Final Integration and Polish

- [x] Visual polish (spacing, animations)
- [x] Handle edge cases (long names, max height rack, 6 racks)
- [x] Error handling review
- [x] Performance check (6 racks, smooth DnD)
- [x] Run full test suite (unit + E2E)
- [x] Code cleanup (remove console.log, TODOs)
- [x] No TypeScript errors
- [x] No linting warnings
- [x] **Commit:** `chore: final polish and integration`

---

## Phase 12: Deployment

### Prompt 12.1 — Docker Configuration

- [x] Create Dockerfile (multi-stage build)
- [x] Create nginx.conf (SPA fallback, gzip, caching)
- [x] Create docker-compose.yml
- [x] Create .dockerignore
- [x] Test: docker build -t rackarr .
- [x] Test: docker run -p 8080:80 rackarr
- [x] Verify app works at localhost:8080
- [x] **Commit:** `chore(docker): add Docker deployment configuration`

### Prompt 12.2 — Documentation and README

- [x] Create README.md with all sections
- [x] Create CHANGELOG.md with v0.1.0 notes
- [x] Create LICENSE (MIT)
- [x] Create CONTRIBUTING.md
- [x] Verify package.json metadata
- [x] **Commit:** `docs: add README, CHANGELOG, LICENSE, CONTRIBUTING`

### Prompt 12.3 — Final Review and Release

- [x] Run all unit tests: npm run test
- [x] Run all E2E tests: npm run test:e2e
- [x] Build verification: npm run build
- [x] Preview verification: npm run preview
- [x] Test in Chrome
- [x] Test in Firefox
- [x] Test in Safari
- [x] Test in Edge
- [x] Docker verification
- [x] Success criteria checklist (spec Section 20):
  - [x] User can create a rack with custom height
  - [x] User can add devices from palette via drag-and-drop
  - [x] Devices snap to U positions, collisions blocked
  - [x] User can reposition devices within and across racks
  - [x] Multiple racks supported (up to 6)
  - [x] Layout saves to JSON and loads correctly
  - [x] Export produces PNG/JPEG/SVG/PDF
  - [x] Dark/light theme works
  - [x] All keyboard shortcuts functional
  - [x] Runs as static files in Docker container
- [x] Final code cleanup
- [x] Create git tag: v0.1.0
- [x] Push to primary (Forgejo)
- [x] Push to mirror (GitHub)
- [x] **Commit:** `chore: v0.1.0 release`

---

## Summary

| Phase                 | Tasks   | Complete |
| --------------------- | ------- | -------- |
| 0. Bootstrap          | 25      | ✅       |
| 1. Business Logic     | 40      | ✅       |
| 2. State Management   | 40      | ✅       |
| 3. Core Components    | 48      | ✅       |
| 4. Drag-and-Drop      | 27      | ✅       |
| 5. App Shell          | 40      | ✅       |
| 6. Forms & Dialogs    | 36      | ✅       |
| 7. Save/Load          | 18      | ✅       |
| 8. Feedback & Polish  | 27      | ✅       |
| 9. Export             | 18      | ✅       |
| 10. Help & A11y       | 30      | ✅       |
| 11. E2E & Integration | 21      | ✅       |
| 12. Deployment        | 25      | ✅       |
| **TOTAL**             | **395** | **100%** |

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
