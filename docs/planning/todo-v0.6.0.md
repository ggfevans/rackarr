# Rackarr v0.6.0 Implementation Checklist

**Created:** 2025-12-12
**Target Version:** 0.6.0
**Reference:** `PROMPT-PLAN-v0.6.0.md`

---

## Pre-Implementation

- [ ] Read through SPEC.md Section 11.6 (Brand Starter Packs)
- [ ] Read through SPEC.md Section 8 (Export Formats)
- [ ] Ensure all existing tests pass (`npm run test:run`)
- [ ] Ensure lint passes (`npm run lint`)
- [ ] Ensure type check passes (`npm run check`)
- [ ] Ensure build succeeds (`npm run build`)
- [ ] Create feature branch: `git checkout -b feature/v0.6.0-brand-packs-export`

---

## Pre-commit Hooks Reference

The project has pre-commit hooks that run on every commit:

```bash
# .husky/pre-commit runs:
npx lint-staged          # ESLint + Prettier on staged files
npm run test:run         # ALL unit tests must pass
```

**TDD Workflow:**

1. Write failing test
2. Run `npm run test:run` — verify test fails
3. Implement
4. Run `npm run test:run` — verify ALL tests pass
5. Run `npm run lint` — verify no lint errors
6. Commit — hooks re-verify as safety net

**Important:** Run tests manually before committing. Don't rely on hooks for feedback.

---

## Phase 1: Schema & Data Model Updates (R-05)

### Prompt 1.1: Add Power Device Properties to Schema

- [ ] **Write tests first** in `src/lib/schemas/layout.test.ts`:
  - [ ] Test DeviceType without power fields validates
  - [ ] Test DeviceType with valid `outlet_count` validates
  - [ ] Test DeviceType with valid `va_rating` validates
  - [ ] Test DeviceType with both fields validates
  - [ ] Test negative values are rejected
  - [ ] Test non-integer values are rejected
- [ ] Run tests — confirm they FAIL
- [ ] Update `src/lib/types/layout.ts`:
  - [ ] Add `outlet_count?: number` to DeviceType
  - [ ] Add `va_rating?: number` to DeviceType
- [ ] Update `src/lib/schemas/layout.ts`:
  - [ ] Add `outlet_count` validation (optional positive integer)
  - [ ] Add `va_rating` validation (optional positive integer)
- [ ] Run tests — confirm they PASS
- [ ] Commit: `feat(schema): add outlet_count and va_rating to DeviceType`

### Prompt 1.2: Update Starter Library Power Devices

- [ ] **Write tests first** in `src/lib/data/starterLibrary.test.ts`:
  - [ ] Test 1U PDU has `outlet_count: 8`
  - [ ] Test 2U UPS has `outlet_count: 6` and `va_rating: 1500`
  - [ ] Test 4U UPS has `outlet_count: 8` and `va_rating: 3000`
  - [ ] Test non-power devices don't have power fields
- [ ] Run tests — confirm they FAIL
- [ ] Update `src/lib/data/starterLibrary.ts`:
  - [ ] Update `StarterDeviceSpec` interface to include optional power fields
  - [ ] Add power properties to 1U PDU
  - [ ] Add power properties to 2U UPS
  - [ ] Add power properties to 4U UPS
  - [ ] Update `getStarterLibrary()` to pass through power properties
- [ ] Run tests — confirm they PASS
- [ ] Commit: `feat(starter-library): add power properties to PDU and UPS devices`

### Prompt 1.3: Display Power Properties in EditPanel

- [ ] **Write tests first** in `src/lib/components/EditPanel.test.ts`:
  - [ ] Test power section doesn't appear for non-power devices
  - [ ] Test power section appears for power category devices
  - [ ] Test `outlet_count` displays correctly
  - [ ] Test `va_rating` displays correctly
  - [ ] Test missing values don't show "undefined"
- [ ] Run tests — confirm they FAIL
- [ ] Update `src/lib/components/EditPanel.svelte`:
  - [ ] Add conditional section for power devices
  - [ ] Display "Outlets: {outlet_count}" when present
  - [ ] Display "VA Rating: {va_rating}" when present
  - [ ] Style consistently with existing sections
- [ ] Run tests — confirm they PASS
- [ ] Manual verification: select a PDU/UPS and check EditPanel
- [ ] Commit: `feat(edit-panel): display power properties for UPS/PDU devices`

### Phase 1 Checkpoint

- [ ] All Phase 1 tests pass
- [ ] Build succeeds
- [ ] Lint passes (`npm run lint`)
- [ ] Type check passes (`npm run check`)

---

## Phase 2: UI Component Foundation

### Prompt 2.1: Create CollapsibleSection Component

- [ ] **Write tests first** in `src/lib/components/CollapsibleSection.test.ts`:
  - [ ] Test renders title and count
  - [ ] Test starts collapsed when `defaultExpanded=false`
  - [ ] Test starts expanded when `defaultExpanded=true`
  - [ ] Test clicking header toggles state
  - [ ] Test `aria-expanded` updates correctly
  - [ ] Test content is hidden when collapsed
  - [ ] Test content is visible when expanded
- [ ] Run tests — confirm they FAIL
- [ ] Create `src/lib/components/CollapsibleSection.svelte`:
  - [ ] Props: `title`, `count`, `defaultExpanded`
  - [ ] Use `$state` for expanded state
  - [ ] Click header to toggle
  - [ ] Slot for content
  - [ ] Chevron icon with rotation
  - [ ] CSS transition for expand/collapse
- [ ] Add accessibility:
  - [ ] Button role on header
  - [ ] `aria-expanded` attribute
  - [ ] `aria-controls` pointing to content id
  - [ ] Keyboard support (Enter/Space)
- [ ] Run tests — confirm they PASS
- [ ] Commit: `feat(ui): create CollapsibleSection component`

### Prompt 2.2: Add CollapsibleSection Styling Polish

- [ ] Update `src/lib/components/CollapsibleSection.svelte` styles:
  - [ ] Header sticky within scroll container
  - [ ] Subtle background on hover
  - [ ] Chevron 12px, 200ms rotation
  - [ ] Count badge with muted color, `--font-size-xs`
  - [ ] Border-bottom on header
- [ ] Add theme support:
  - [ ] `--collapsible-header-bg` token
  - [ ] `--collapsible-header-hover-bg` token
  - [ ] Test in both light and dark themes
- [ ] Smooth animation:
  - [ ] max-height transition
  - [ ] No layout shift
- [ ] Update/add tests for styling behavior
- [ ] Manual verification: check visual appearance
- [ ] Commit: `style(collapsible): polish styling and animations`

### Phase 2 Checkpoint

- [ ] CollapsibleSection component complete
- [ ] All tests pass
- [ ] Accessible (keyboard navigable)
- [ ] Looks good in both themes

---

## Phase 3: DevicePalette Refactor

### Prompt 3.1: Refactor DevicePalette for Sections

- [ ] **Write tests first** in `src/lib/components/DevicePalette.test.ts`:
  - [ ] Test Generic section renders with correct count
  - [ ] Test Generic section is expanded by default
  - [ ] Test devices are filterable by search
  - [ ] Test search with no results shows message
  - [ ] Test section auto-expands when search matches
- [ ] Run tests — confirm relevant ones FAIL
- [ ] Update `src/lib/components/DevicePalette.svelte`:
  - [ ] Import CollapsibleSection
  - [ ] Wrap device list in CollapsibleSection
  - [ ] Title: "Generic", count: device count
  - [ ] `defaultExpanded: true`
- [ ] Verify existing functionality:
  - [ ] Search still works
  - [ ] Drag and drop still works
  - [ ] Click to add still works
- [ ] Run tests — confirm they PASS
- [ ] Commit: `refactor(device-palette): use CollapsibleSection for generic library`

### Prompt 3.2: Add Section Infrastructure for Brand Packs

- [ ] Define `DeviceSection` interface:
  ```typescript
  interface DeviceSection {
  	id: string;
  	title: string;
  	devices: DeviceType[];
  	defaultExpanded: boolean;
  }
  ```
- [ ] **Write tests**:
  - [ ] Test multiple sections render
  - [ ] Test each section has correct expanded state
  - [ ] Test search filters across all sections
  - [ ] Test sections with matches auto-expand
- [ ] Update `src/lib/components/DevicePalette.svelte`:
  - [ ] Refactor to accept/derive sections array
  - [ ] Render CollapsibleSection for each section
  - [ ] Generic: `defaultExpanded=true`
  - [ ] Others: `defaultExpanded=false`
- [ ] Update search logic:
  - [ ] Filter devices in each section
  - [ ] Auto-expand sections with matches
- [ ] Run tests — confirm they PASS
- [ ] Commit: `refactor(device-palette): add multi-section infrastructure`

### Phase 3 Checkpoint

- [ ] DevicePalette uses collapsible sections
- [ ] Search works across sections
- [ ] All tests pass
- [ ] Ready for brand pack data

---

## Phase 4: Brand Starter Packs (R-01, R-02)

### Prompt 4.1: Create Ubiquiti Brand Pack Data

- [ ] Create directory: `src/lib/data/brandPacks/`
- [ ] **Write tests first** in `src/lib/data/brandPacks/ubiquiti.test.ts`:
  - [ ] Test correct number of devices (10)
  - [ ] Test all devices have `manufacturer: "Ubiquiti"`
  - [ ] Test each device has valid slug, u_height, category
  - [ ] Test UDM-Pro has correct properties
  - [ ] Test USP-PDU-Pro has `is_full_depth: false`
- [ ] Run tests — confirm they FAIL
- [ ] Create `src/lib/data/brandPacks/ubiquiti.ts`:
  - [ ] USW-Pro-24 (network, 1U, side-to-rear)
  - [ ] USW-Pro-48 (network, 1U, side-to-rear)
  - [ ] USW-Pro-24-PoE (network, 1U, side-to-rear)
  - [ ] USW-Pro-48-PoE (network, 1U, side-to-rear)
  - [ ] USW-Aggregation (network, 1U, side-to-rear)
  - [ ] UDM-Pro (network, 1U, front-to-rear)
  - [ ] UDM-SE (network, 1U, front-to-rear)
  - [ ] UNVR (storage, 1U, front-to-rear)
  - [ ] UNVR-Pro (storage, 2U, front-to-rear)
  - [ ] USP-PDU-Pro (power, 1U, half-depth, passive)
- [ ] Run tests — confirm they PASS
- [ ] Commit: `feat(brand-packs): add Ubiquiti starter pack data`

### Prompt 4.2: Create Mikrotik Brand Pack Data

- [ ] **Write tests first** in `src/lib/data/brandPacks/mikrotik.test.ts`:
  - [ ] Test correct number of devices (5)
  - [ ] Test all devices have `manufacturer: "Mikrotik"`
  - [ ] Test each device has valid properties
  - [ ] Test slug handles special characters ('+')
- [ ] Run tests — confirm they FAIL
- [ ] Create `src/lib/data/brandPacks/mikrotik.ts`:
  - [ ] CRS326-24G-2S+ (network, 1U, side-to-rear)
  - [ ] CRS328-24P-4S+ (network, 1U, side-to-rear)
  - [ ] CRS309-1G-8S+ (network, 1U, side-to-rear)
  - [ ] CCR2004-1G-12S+2XS (network, 1U, front-to-rear)
  - [ ] RB5009UG+S+IN (network, 1U, front-to-rear)
- [ ] Run tests — confirm they PASS
- [ ] Commit: `feat(brand-packs): add Mikrotik starter pack data`

### Prompt 4.3: Create Brand Pack Index and Integration

- [ ] Create `src/lib/data/brandPacks/index.ts`:
  - [ ] Export `ubiquitiDevices`
  - [ ] Export `mikrotikDevices`
  - [ ] Export `getBrandPacks()` function
- [ ] **Write tests**:
  - [ ] Test `getBrandPacks()` returns 3 sections
  - [ ] Test sections have correct titles
  - [ ] Test sections have correct device counts
- [ ] Update `src/lib/components/DevicePalette.svelte`:
  - [ ] Import from brandPacks index
  - [ ] Create sections: Generic, Ubiquiti, Mikrotik
  - [ ] Wire up to rendering
- [ ] Update `src/lib/components/DevicePalette.test.ts`:
  - [ ] Test all three sections render
- [ ] Run tests — confirm they PASS
- [ ] Manual verification: check sidebar shows all sections
- [ ] Commit: `feat(brand-packs): integrate brand packs with DevicePalette`

### Prompt 4.4: Source and Add Ubiquiti Images

- [ ] Check NetBox library for available images:
  - [ ] https://github.com/netbox-community/devicetype-library/tree/master/device-types/Ubiquiti
- [ ] Download available front images
- [ ] Process images:
  - [ ] Resize to max 400px width
  - [ ] Convert to WebP
- [ ] Save to `src/lib/assets/device-images/ubiquiti/`:
  - [ ] Document which devices have images
  - [ ] Document which fall back to colored rectangles
- [ ] Update image loading to include Ubiquiti images
- [ ] Test in image display mode
- [ ] Commit: `feat(brand-packs): add Ubiquiti device images`

### Prompt 4.5: Source and Add Mikrotik Images

- [ ] Check NetBox library for available images:
  - [ ] https://github.com/netbox-community/devicetype-library/tree/master/device-types/MikroTik
- [ ] Download available front images
- [ ] Process images (same as Ubiquiti)
- [ ] Save to `src/lib/assets/device-images/mikrotik/`
- [ ] Update image loading
- [ ] Test in image display mode
- [ ] Commit: `feat(brand-packs): add Mikrotik device images`

### Phase 4 Checkpoint

- [ ] Ubiquiti section shows in sidebar with 10 devices
- [ ] Mikrotik section shows in sidebar with 5 devices
- [ ] Search finds brand devices
- [ ] Clicking brand device adds to rack
- [ ] Images display (where available)
- [ ] All tests pass

---

## Phase 5: Export Improvements (R-03, R-04)

### Prompt 5.1: Implement Export File Naming Convention

- [ ] **Write tests first** in `src/lib/utils/export.test.ts`:
  - [ ] Test basic filename generation
  - [ ] Test slugification of layout name
  - [ ] Test date formatting (YYYY-MM-DD)
  - [ ] Test CSV has no view in filename
  - [ ] Test special characters removed
- [ ] Run tests — confirm they FAIL
- [ ] Create/update `src/lib/utils/export.ts`:
  - [ ] Implement `generateExportFilename()` function
  - [ ] Slugify layout name
  - [ ] Format: `{layout-name}-{view}-{YYYY-MM-DD}.{ext}`
- [ ] Run tests — confirm they PASS
- [ ] Integrate with `ExportDialog.svelte`
- [ ] Manual verification: export and check filename
- [ ] Commit: `feat(export): implement file naming convention`

### Prompt 5.2: Implement CSV Export

- [ ] **Write tests first** in `src/lib/utils/export.test.ts`:
  - [ ] Test CSV header row
  - [ ] Test device rows in correct order (position descending)
  - [ ] Test empty fields handled correctly
  - [ ] Test special characters escaped
  - [ ] Test multiple devices
- [ ] Run tests — confirm they FAIL
- [ ] Implement `exportToCSV()` in `src/lib/utils/export.ts`:
  - [ ] Columns: Position, Name, Model, Manufacturer, U_Height, Category, Face
  - [ ] Sort by position descending
  - [ ] Proper CSV escaping
- [ ] Add CSV to `ExportDialog.svelte`:
  - [ ] Add to format selector
  - [ ] Trigger download
- [ ] Run tests — confirm they PASS
- [ ] Manual verification: export CSV and open in spreadsheet
- [ ] Commit: `feat(export): add CSV export format`

### Prompt 5.3: Add Export Thumbnail Preview

- [ ] **Write tests** in `src/lib/components/ExportDialog.test.ts`:
  - [ ] Test preview renders
  - [ ] Test preview updates when view changes
  - [ ] Test preview reflects display mode
- [ ] Update `src/lib/components/ExportDialog.svelte`:
  - [ ] Add preview area (~200px max width)
  - [ ] Render small-scale rack preview
  - [ ] Update on option changes
- [ ] Performance:
  - [ ] Debounce preview updates
- [ ] Run tests — confirm they PASS
- [ ] Manual verification: check preview looks correct
- [ ] Commit: `feat(export): add thumbnail preview to export dialog`

### Prompt 5.4: Fix Export Margins

- [ ] Identify export rendering code location
- [ ] **Write tests**:
  - [ ] Test single view has correct dimensions with 20px padding
  - [ ] Test both view has correct dimensions
  - [ ] Test padding consistent across formats
- [ ] Implement margin fixes:
  - [ ] Minimum 20px padding all sides
  - [ ] Scale proportionally with rack size
  - [ ] Consistent PNG, JPEG, SVG, PDF
- [ ] Run tests — confirm they PASS
- [ ] Manual verification: export and check margins
- [ ] Commit: `fix(export): consistent margins around rack`

### Prompt 5.5: Fix Dual-View Export Layout

- [ ] **Write tests**:
  - [ ] Test dual view renders both front and rear
  - [ ] Test views are horizontally arranged
  - [ ] Test correct total dimensions
  - [ ] Test labels appear when enabled
- [ ] Implement dual-view improvements:
  - [ ] Front on left, rear on right
  - [ ] 40px gap between views
  - [ ] Views vertically centered
  - [ ] Optional "Front"/"Rear" labels
- [ ] Calculate correct dimensions:
  - [ ] Width: rack_width _ 2 + gap + padding _ 2
  - [ ] Height: rack_height + padding \* 2 + label_height
- [ ] Run tests — confirm they PASS
- [ ] Manual verification: export "both" view
- [ ] Commit: `fix(export): improve dual-view layout`

### Prompt 5.6: Fix Export Border and Text Rendering

- [ ] Identify rendering issues:
  - [ ] Compare canvas vs export
  - [ ] Check CSS properties applied
- [ ] Fix borders/lines:
  - [ ] Integer coordinates for sharp lines
  - [ ] Correct stroke-width
  - [ ] Match canvas colors
- [ ] Fix text:
  - [ ] Embed fonts in SVG
  - [ ] Sharp text rendering
  - [ ] Correct font sizes
  - [ ] Proper label positioning
- [ ] Test across formats (PNG, SVG, PDF)
- [ ] Manual verification checklist:
  - [ ] Rails look crisp
  - [ ] Device borders match canvas
  - [ ] Text is readable
  - [ ] Colors are correct
- [ ] Commit: `fix(export): improve border and text rendering`

### Prompt 5.7: Wire Up Export Dialog Changes

- [ ] Final integration in `ExportDialog.svelte`:
  - [ ] Format selector includes CSV
  - [ ] Preview shows for image formats
  - [ ] "Preview not available" for CSV
  - [ ] Generated filename shown
  - [ ] Filename updates as options change
- [ ] CSV-specific UX:
  - [ ] Hide irrelevant options when CSV selected
- [ ] **Write integration tests**:
  - [ ] Test each format exports correctly
  - [ ] Test filename is correct
  - [ ] Test preview updates
  - [ ] Test CSV content correct
- [ ] Run tests — confirm they PASS
- [ ] Full manual test of export flow
- [ ] Commit: `feat(export): complete export dialog integration`

### Phase 5 Checkpoint

- [ ] File naming works for all formats
- [ ] CSV export produces valid spreadsheet
- [ ] Preview shows in export dialog
- [ ] Margins are consistent
- [ ] Dual-view layout is correct
- [ ] Borders and text are crisp
- [ ] All tests pass

---

## Final Verification

### Automated Tests

- [ ] All unit tests pass: `npm run test:run`
- [ ] All E2E tests pass: `npm run test:e2e`
- [ ] Lint passes: `npm run lint`
- [ ] Type check passes: `npm run check`
- [ ] Build succeeds: `npm run build`

### Manual Testing Checklist

#### Power Properties (R-05)

- [ ] Select PDU — EditPanel shows "Outlets: 8"
- [ ] Select 2U UPS — EditPanel shows "Outlets: 6" and "VA Rating: 1500"
- [ ] Select non-power device — no power section shown

#### Brand Packs (R-01, R-02)

- [ ] Sidebar shows 3 collapsible sections
- [ ] Generic section expanded by default
- [ ] Ubiquiti/Mikrotik sections collapsed by default
- [ ] Clicking section header expands/collapses
- [ ] Count badge shows correct numbers
- [ ] Search "USW" — Ubiquiti section auto-expands
- [ ] Search "CRS" — Mikrotik section auto-expands
- [ ] Add Ubiquiti device to rack — works correctly
- [ ] Add Mikrotik device to rack — works correctly
- [ ] Switch to image mode — brand images display

#### Export (R-03, R-04)

- [ ] Open export dialog — preview shows
- [ ] Change view option — preview updates
- [ ] Export PNG — filename is `{layout}-{view}-{date}.png`
- [ ] Export PDF — filename correct
- [ ] Export SVG — filename correct
- [ ] Export CSV — filename is `{layout}-{date}.csv`
- [ ] Open CSV in spreadsheet — columns correct
- [ ] Check PNG margins — consistent padding
- [ ] Export "both" view — front+rear side by side
- [ ] Check borders — crisp, no artifacts
- [ ] Check text — readable, correct font

### Browser Testing

- [ ] Chrome — all features work
- [ ] Firefox — all features work
- [ ] Safari — all features work (if available)

---

## Release Preparation

- [ ] Update version in `package.json` to `0.6.0`
- [ ] Update SPEC.md version from `0.6.0-draft` to `0.6.0`
- [ ] Update ROADMAP.md:
  - [ ] Mark R-01 complete
  - [ ] Mark R-02 complete
  - [ ] Mark R-03 complete
  - [ ] Mark R-04 complete
  - [ ] Mark R-05 complete
  - [ ] Add changelog entry
- [ ] Update CLAUDE.md with v0.6.0 changes
- [ ] Squash/clean up commits if needed
- [ ] Merge to main
- [ ] Tag release: `git tag v0.6.0`
- [ ] Push to GitHub: `git push github main --tags`
- [ ] Verify deployment on GitHub Pages

---

## Notes

- **Image sourcing may be incomplete** — document which devices have images vs fallback
- **Export quality issues may need iteration** — visual verification required
- **Keep commits atomic** — one feature/fix per commit

---

_Last updated: 2025-12-12_
