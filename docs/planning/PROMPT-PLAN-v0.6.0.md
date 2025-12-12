# PROMPT-PLAN.md — Rackarr v0.6.0 Implementation

**Created:** 2025-12-12
**Target Version:** 0.6.0
**Scope:** R-01 through R-05 (Brand Packs, Export UX, CSV Export, Power Properties)

---

## Overview

This document contains step-by-step prompts for implementing v0.6.0 features. Each prompt is designed for a code-generation LLM following TDD methodology.

**Phases:**

1. Schema & Data Model Updates (R-05)
2. UI Component Foundation (Collapsible Sections)
3. DevicePalette Refactor
4. Brand Starter Packs (R-01, R-02)
5. Export Improvements (R-03, R-04)

**Dependencies Flow:**

```
Phase 1 (Schema)
    ↓
Phase 2 (Collapsible Component)
    ↓
Phase 3 (DevicePalette Refactor)
    ↓
Phase 4 (Brand Packs Data + Images)
    ↓
Phase 5 (Export UX + CSV)
```

---

## Phase 1: Schema & Data Model Updates

### Prompt 1.1: Add Power Device Properties to Schema

```text
Context: Rackarr is a Svelte 5 rack layout designer. We need to add optional power-specific properties to the DeviceType interface for UPS and PDU devices.

Task: Add `outlet_count` and `va_rating` optional fields to the DeviceType schema.

Requirements:
1. Update the DeviceType interface in `src/lib/types/layout.ts` to add:
   - `outlet_count?: number` — Number of outlets (e.g., 8, 12, 16)
   - `va_rating?: number` — VA capacity (e.g., 1500, 3000)

2. Update the Zod schema in `src/lib/schemas/layout.ts` to validate these new optional fields:
   - Both should be positive integers
   - Both are optional

3. Write tests FIRST in `src/lib/schemas/layout.test.ts`:
   - Test that DeviceType without power fields validates
   - Test that DeviceType with valid outlet_count validates
   - Test that DeviceType with valid va_rating validates
   - Test that DeviceType with both fields validates
   - Test that negative values are rejected
   - Test that non-integer values are rejected

TDD approach: Write failing tests first, then implement to make them pass.

Files to modify:
- src/lib/types/layout.ts
- src/lib/schemas/layout.ts
- src/lib/schemas/layout.test.ts (create if needed)
```

### Prompt 1.2: Update Starter Library Power Devices

```text
Context: We've added outlet_count and va_rating fields to DeviceType. Now update the existing power devices in the starter library to include these properties.

Task: Add power properties to PDU and UPS devices in the starter library.

Requirements:
1. Update `src/lib/data/starterLibrary.ts` to add power properties:
   - 1U PDU: outlet_count: 8 (typical basic PDU)
   - 2U UPS: outlet_count: 6, va_rating: 1500
   - 4U UPS: outlet_count: 8, va_rating: 3000

2. Update the StarterDeviceSpec interface to support optional power fields

3. Update getStarterLibrary() to pass through power properties

4. Write tests FIRST:
   - Test that 1U PDU has outlet_count of 8
   - Test that 2U UPS has outlet_count and va_rating
   - Test that 4U UPS has outlet_count and va_rating
   - Test that non-power devices don't have these fields

Files to modify:
- src/lib/data/starterLibrary.ts
- src/lib/data/starterLibrary.test.ts
```

### Prompt 1.3: Display Power Properties in EditPanel

```text
Context: DeviceType now has outlet_count and va_rating fields. We need to display these in the EditPanel when a power device is selected.

Task: Show power properties in EditPanel for devices with category 'power'.

Requirements:
1. In `src/lib/components/EditPanel.svelte`, add a conditional section that displays:
   - "Outlets: {outlet_count}" when outlet_count exists
   - "VA Rating: {va_rating}" when va_rating exists
   - Only show this section when device category is 'power'

2. Display as read-only info (not editable for placed devices, since these come from device type)

3. Style consistently with existing EditPanel sections

4. Write tests FIRST:
   - Test that power section doesn't appear for non-power devices
   - Test that power section appears for power devices
   - Test that outlet_count displays correctly
   - Test that va_rating displays correctly
   - Test that missing values show gracefully (no "undefined")

Files to modify:
- src/lib/components/EditPanel.svelte
- src/lib/components/EditPanel.test.ts
```

---

## Phase 2: UI Component Foundation

### Prompt 2.1: Create CollapsibleSection Component

````text
Context: Rackarr uses Svelte 5 with runes. We need a reusable collapsible section component for the device palette to organize devices by brand.

Task: Create a CollapsibleSection component.

Requirements:
1. Create `src/lib/components/CollapsibleSection.svelte` with:
   - Props: title (string), count (number), defaultExpanded (boolean, default false)
   - Svelte 5 runes for state ($state for expanded)
   - Click header to toggle expanded/collapsed
   - Slot for section content
   - Chevron icon that rotates on expand/collapse
   - Smooth height animation (CSS transition)

2. Accessibility:
   - Button role on header
   - aria-expanded attribute
   - aria-controls pointing to content id
   - Keyboard accessible (Enter/Space to toggle)

3. Styling:
   - Use existing design tokens from tokens.css
   - Header shows: chevron + title + count badge "(N)"
   - Consistent with sidebar styling

4. Write tests FIRST in `src/lib/components/CollapsibleSection.test.ts`:
   - Test renders title and count
   - Test starts collapsed when defaultExpanded=false
   - Test starts expanded when defaultExpanded=true
   - Test clicking header toggles state
   - Test aria-expanded updates correctly
   - Test content is hidden when collapsed
   - Test content is visible when expanded

Example usage:
```svelte
<CollapsibleSection title="Ubiquiti" count={18} defaultExpanded={false}>
  {#each ubiquitiDevices as device}
    <DeviceCard {device} />
  {/each}
</CollapsibleSection>
````

Files to create:

- src/lib/components/CollapsibleSection.svelte
- src/lib/components/CollapsibleSection.test.ts

````

### Prompt 2.2: Add CollapsibleSection Styling Polish

```text
Context: CollapsibleSection component exists but needs polish for visual consistency with the app.

Task: Refine CollapsibleSection styling and animations.

Requirements:
1. Update CollapsibleSection.svelte styles:
   - Header: sticky within scroll container, subtle background on hover
   - Chevron: 12px size, smooth 200ms rotation, use existing icon pattern
   - Count badge: muted color, smaller font size (--font-size-xs)
   - Content area: no padding (content handles its own padding)
   - Border-bottom on header for visual separation

2. Add CSS custom properties for theming:
   - --collapsible-header-bg
   - --collapsible-header-hover-bg
   - Support both light and dark themes

3. Animation refinement:
   - Use max-height transition for smooth expand/collapse
   - Avoid layout shift during animation

4. Write/update tests:
   - Test chevron rotates on expand
   - Test hover state applies

Files to modify:
- src/lib/components/CollapsibleSection.svelte
- src/lib/styles/tokens.css (if new tokens needed)
````

---

## Phase 3: DevicePalette Refactor

### Prompt 3.1: Refactor DevicePalette for Sections

```text
Context: DevicePalette currently shows a flat list of devices. We need to refactor it to use CollapsibleSection components, starting with just the "Generic" section.

Task: Refactor DevicePalette to use CollapsibleSection for the generic library.

Requirements:
1. In `src/lib/components/DevicePalette.svelte`:
   - Wrap existing device list in CollapsibleSection
   - Title: "Generic", count: number of generic devices
   - defaultExpanded: true (generic is expanded by default)
   - Keep existing search functionality working

2. Search behavior:
   - Search should still filter devices within the section
   - Section should auto-expand if it contains search results
   - Show "No results" message if search finds nothing

3. Preserve existing functionality:
   - Device cards still draggable
   - Click to add device still works
   - Category filtering still works (if exists)

4. Write tests FIRST:
   - Test Generic section renders with correct count
   - Test Generic section is expanded by default
   - Test devices are filterable by search
   - Test search with no results shows message
   - Test section auto-expands when search matches

Files to modify:
- src/lib/components/DevicePalette.svelte
- src/lib/components/DevicePalette.test.ts
```

### Prompt 3.2: Add Section Infrastructure for Brand Packs

````text
Context: DevicePalette now uses CollapsibleSection for Generic devices. We need to prepare the infrastructure for brand pack sections.

Task: Add data structure and rendering for multiple sections in DevicePalette.

Requirements:
1. Create a section data structure:
   ```typescript
   interface DeviceSection {
     id: string;           // 'generic' | 'ubiquiti' | 'mikrotik'
     title: string;
     devices: DeviceType[];
     defaultExpanded: boolean;
   }
````

2. Refactor DevicePalette to:
   - Accept/derive sections array
   - Render CollapsibleSection for each section
   - Generic section: defaultExpanded=true
   - Brand sections: defaultExpanded=false

3. Update search to work across all sections:
   - Filter devices in each section
   - Auto-expand sections with matching results
   - Collapse sections with no matches (optional: or show with 0 count)

4. For now, only Generic section has devices (brand packs added in Phase 4)

5. Write tests:
   - Test multiple sections render
   - Test each section has correct expanded state
   - Test search filters across all sections
   - Test sections with matches auto-expand

Files to modify:

- src/lib/components/DevicePalette.svelte
- src/lib/components/DevicePalette.test.ts

````

---

## Phase 4: Brand Starter Packs

### Prompt 4.1: Create Ubiquiti Brand Pack Data

```text
Context: Rackarr supports brand-specific device packs. We need to create the Ubiquiti starter pack data.

Task: Create the Ubiquiti device pack data file.

Requirements:
1. Create `src/lib/data/brandPacks/ubiquiti.ts` with:
   - Export array of DeviceType objects for Ubiquiti devices
   - Each device must have: slug, u_height, manufacturer: "Ubiquiti", model, is_full_depth, airflow, rackarr (colour, category)

2. Include these devices (from SPEC.md Section 11.6.3):
   | Device | Category | U-Height | Full Depth | Airflow |
   |--------|----------|----------|------------|---------|
   | USW-Pro-24 | network | 1 | true | side-to-rear |
   | USW-Pro-48 | network | 1 | true | side-to-rear |
   | USW-Pro-24-PoE | network | 1 | true | side-to-rear |
   | USW-Pro-48-PoE | network | 1 | true | side-to-rear |
   | USW-Aggregation | network | 1 | true | side-to-rear |
   | UDM-Pro | network | 1 | true | front-to-rear |
   | UDM-SE | network | 1 | true | front-to-rear |
   | UNVR | storage | 1 | true | front-to-rear |
   | UNVR-Pro | storage | 2 | true | front-to-rear |
   | USP-PDU-Pro | power | 1 | false | passive |

3. Use category colors from CATEGORY_COLOURS constant

4. Slugs should be lowercase model names (e.g., 'usw-pro-24')

5. Write tests FIRST in `src/lib/data/brandPacks/ubiquiti.test.ts`:
   - Test correct number of devices exported
   - Test all devices have manufacturer: "Ubiquiti"
   - Test each device has valid slug, u_height, category
   - Test specific device properties (spot check UDM-Pro, USP-PDU-Pro)

Files to create:
- src/lib/data/brandPacks/ubiquiti.ts
- src/lib/data/brandPacks/ubiquiti.test.ts
````

### Prompt 4.2: Create Mikrotik Brand Pack Data

```text
Context: Following the same pattern as Ubiquiti, create the Mikrotik device pack.

Task: Create the Mikrotik device pack data file.

Requirements:
1. Create `src/lib/data/brandPacks/mikrotik.ts` with Mikrotik devices

2. Include these devices (from SPEC.md Section 11.6.4):
   | Device | Category | U-Height | Full Depth | Airflow |
   |--------|----------|----------|------------|---------|
   | CRS326-24G-2S+ | network | 1 | true | side-to-rear |
   | CRS328-24P-4S+ | network | 1 | true | side-to-rear |
   | CRS309-1G-8S+ | network | 1 | true | side-to-rear |
   | CCR2004-1G-12S+2XS | network | 1 | true | front-to-rear |
   | RB5009UG+S+IN | network | 1 | true | front-to-rear |

3. All devices have manufacturer: "Mikrotik"

4. Write tests FIRST in `src/lib/data/brandPacks/mikrotik.test.ts`:
   - Test correct number of devices
   - Test all devices have manufacturer: "Mikrotik"
   - Test each device has valid properties
   - Test slug generation handles special characters ('+' in model names)

Files to create:
- src/lib/data/brandPacks/mikrotik.ts
- src/lib/data/brandPacks/mikrotik.test.ts
```

### Prompt 4.3: Create Brand Pack Index and Integration

```text
Context: Ubiquiti and Mikrotik data files exist. Now create an index to export them and integrate with DevicePalette.

Task: Create brand pack index and wire up to DevicePalette.

Requirements:
1. Create `src/lib/data/brandPacks/index.ts`:
   - Export ubiquitiDevices from './ubiquiti'
   - Export mikrotikDevices from './mikrotik'
   - Export a combined getBrandPacks() function that returns section data

2. Update DevicePalette to import and use brand packs:
   - Import from brandPacks index
   - Create sections: Generic (from starterLibrary), Ubiquiti, Mikrotik
   - Pass sections to rendering logic

3. Sections should appear in order: Generic, Ubiquiti, Mikrotik

4. Write tests:
   - Test getBrandPacks returns all three sections
   - Test sections have correct titles and device counts
   - Test DevicePalette renders all three sections

Files to create:
- src/lib/data/brandPacks/index.ts

Files to modify:
- src/lib/components/DevicePalette.svelte
- src/lib/components/DevicePalette.test.ts
```

### Prompt 4.4: Source and Add Ubiquiti Images

```text
Context: Ubiquiti devices are defined but need images. Source images from NetBox device-type library.

Task: Add front images for Ubiquiti devices.

Requirements:
1. Download front images from NetBox device-type library for available Ubiquiti devices
   - Check: https://github.com/netbox-community/devicetype-library/tree/master/device-types/Ubiquiti

2. Process images:
   - Resize to max 400px width
   - Convert to WebP format
   - Save to `src/lib/assets/device-images/ubiquiti/`

3. Create image manifest or update image loading:
   - Map device slugs to image paths
   - Ensure bundled image system picks them up

4. For devices without available images, they will fall back to category-colored rectangles (no action needed)

5. Test that images load correctly in image display mode

Note: This prompt may require manual image sourcing. Focus on devices with readily available images first. Document which devices have images vs fallback.

Files to create/modify:
- src/lib/assets/device-images/ubiquiti/*.webp
- src/lib/data/brandPacks/ubiquiti.ts (if image mapping needed)
```

### Prompt 4.5: Source and Add Mikrotik Images

```text
Context: Same as Ubiquiti - add images for Mikrotik devices.

Task: Add front images for Mikrotik devices.

Requirements:
1. Download front images from NetBox device-type library for available Mikrotik devices
   - Check: https://github.com/netbox-community/devicetype-library/tree/master/device-types/MikroTik

2. Process images (same as Ubiquiti):
   - Resize to max 400px width
   - Convert to WebP format
   - Save to `src/lib/assets/device-images/mikrotik/`

3. Update image loading to include Mikrotik images

4. Document which devices have images

Files to create/modify:
- src/lib/assets/device-images/mikrotik/*.webp
- src/lib/data/brandPacks/mikrotik.ts (if image mapping needed)
```

---

## Phase 5: Export Improvements

### Prompt 5.1: Implement Export File Naming Convention

````text
Context: Currently exports use generic filenames like "export.png". We need meaningful filenames.

Task: Implement the file naming convention: {layout-name}-{view}-{YYYY-MM-DD}.{ext}

Requirements:
1. Create utility function in `src/lib/utils/export.ts`:
   ```typescript
   function generateExportFilename(
     layoutName: string,
     view: 'front' | 'rear' | 'both' | null,
     format: string
   ): string
````

2. Slugify layout name (lowercase, hyphens, no special chars)

3. Include view for image exports, omit for CSV

4. Format date as YYYY-MM-DD

5. Examples:
   - "My Homelab" + front + png → "my-homelab-front-2025-12-12.png"
   - "Server Rack #1" + both + pdf → "server-rack-1-both-2025-12-12.pdf"
   - "My Rack" + null + csv → "my-rack-2025-12-12.csv"

6. Write tests FIRST:
   - Test basic filename generation
   - Test slugification of layout name
   - Test date formatting
   - Test CSV (no view)
   - Test special characters removed

7. Integrate with ExportDialog to use generated filenames

Files to create/modify:

- src/lib/utils/export.ts
- src/lib/utils/export.test.ts
- src/lib/components/ExportDialog.svelte

````

### Prompt 5.2: Implement CSV Export

```text
Context: Rackarr needs to export rack contents as CSV for spreadsheet users.

Task: Implement CSV export functionality.

Requirements:
1. Create CSV export function in `src/lib/utils/export.ts`:
   ```typescript
   function exportToCSV(rack: Rack, deviceTypes: DeviceType[]): string
````

2. CSV columns (in order):
   - Position (U position)
   - Name (custom instance name, empty string if none)
   - Model (device type model)
   - Manufacturer (device type manufacturer, empty string if none)
   - U_Height (device height)
   - Category (device category)
   - Face (front/rear/both)

3. Sort by position descending (top of rack first)

4. Proper CSV escaping (quotes around fields with commas)

5. Write tests FIRST:
   - Test CSV header row
   - Test device rows in correct order
   - Test empty fields handled
   - Test special characters escaped
   - Test multiple devices

6. Add CSV to format options in ExportDialog

7. Trigger download with generated filename

Files to modify:

- src/lib/utils/export.ts
- src/lib/utils/export.test.ts
- src/lib/components/ExportDialog.svelte

````

### Prompt 5.3: Add Export Thumbnail Preview

```text
Context: Users want to see a preview before exporting. Add a thumbnail preview to the export dialog.

Task: Add thumbnail preview to ExportDialog.

Requirements:
1. In ExportDialog, add a preview area that shows:
   - Small-scale rendering of what will be exported
   - Updates when export options change (view, display mode, etc.)
   - Max size ~200px wide, maintain aspect ratio

2. Implementation approach:
   - Reuse existing rack rendering logic
   - Scale down for preview
   - Render to a small canvas or inline SVG

3. Preview should respect current export options:
   - Front/rear/both view
   - Label/image display mode
   - Background color
   - Airflow mode (if enabled)

4. Performance consideration:
   - Debounce preview updates when options change rapidly
   - Show loading state briefly if needed

5. Write tests:
   - Test preview renders
   - Test preview updates when view changes
   - Test preview reflects display mode

Files to modify:
- src/lib/components/ExportDialog.svelte
- src/lib/components/ExportDialog.test.ts
````

### Prompt 5.4: Fix Export Margins

```text
Context: Exported images have inconsistent margins around the rack. Need consistent padding.

Task: Fix export margins to have consistent padding.

Requirements:
1. Identify where export rendering happens (likely in export utility or ExportDialog)

2. Add consistent padding around rack in exports:
   - Minimum 20px padding on all sides
   - Padding should scale proportionally with rack size
   - Consistent between PNG, JPEG, SVG, PDF

3. For "both" view exports:
   - Equal padding around the combined front+rear layout
   - Consistent gap between front and rear views

4. Update export canvas/SVG dimensions to account for padding

5. Write tests:
   - Test single view export has correct dimensions with padding
   - Test both view export has correct dimensions
   - Test padding is consistent across formats

Files to modify:
- src/lib/utils/export.ts (or wherever export rendering happens)
- Related test files
```

### Prompt 5.5: Fix Dual-View Export Layout

```text
Context: When exporting "both" views, the front and rear arrangement needs improvement.

Task: Improve dual-view export layout.

Requirements:
1. When exportView is "both":
   - Front view on left, rear view on right
   - Equal spacing between views (40px gap)
   - Views vertically centered and aligned
   - Labels "Front" and "Rear" above each view (optional, if includeNames is true)

2. Calculate correct canvas dimensions:
   - Width: rack_width * 2 + gap + padding * 2
   - Height: rack_height + padding * 2 + label_height (if labels)

3. Ensure both views render at same scale

4. Write tests:
   - Test dual view renders both front and rear
   - Test views are horizontally arranged
   - Test correct total dimensions
   - Test labels appear when enabled

Files to modify:
- src/lib/utils/export.ts
- Related test files
```

### Prompt 5.6: Fix Export Border and Text Rendering

```text
Context: Exported images have issues with borders looking wrong and text being unclear.

Task: Fix border and text rendering in exports.

Requirements:
1. Borders/lines:
   - Ensure rack rail borders are crisp (no sub-pixel rendering)
   - Device borders should match on-screen appearance
   - Use integer coordinates for sharp lines
   - Check stroke-width and stroke colors match canvas

2. Text rendering:
   - Ensure fonts are embedded in SVG exports
   - Text should be sharp, not blurry
   - Font sizes should match on-screen display
   - Labels should be properly positioned within devices

3. General:
   - Export output should visually match canvas appearance
   - Test across PNG, SVG, PDF formats

4. Debugging approach:
   - Compare canvas rendering vs export rendering
   - Check for CSS properties not being applied to export
   - Verify SVG viewBox and dimensions

5. Write visual regression tests if possible, or manual verification checklist

Files to modify:
- Export-related files
- SVG rendering components if needed
```

### Prompt 5.7: Wire Up Export Dialog Changes

```text
Context: All export improvements are implemented. Final integration and polish.

Task: Ensure all export improvements work together in ExportDialog.

Requirements:
1. ExportDialog should now have:
   - Format selector including CSV option
   - Options panel (existing)
   - Thumbnail preview area
   - Export button that uses generated filename

2. CSV-specific behavior:
   - When CSV selected, hide irrelevant options (background, display mode, etc.)
   - Show only relevant options for data export

3. Preview behavior:
   - Show preview for image formats
   - Show "CSV preview not available" or similar for CSV

4. Filename preview:
   - Show generated filename before export
   - Update in real-time as options change

5. Run full integration test:
   - Test each format exports correctly
   - Test filename is correct
   - Test preview updates
   - Test CSV has correct content

Files to modify:
- src/lib/components/ExportDialog.svelte
- src/lib/components/ExportDialog.test.ts
```

---

## Completion Checklist

After all prompts are completed, verify:

- [ ] Power properties (outlet_count, va_rating) work in schema and display
- [ ] CollapsibleSection component works with accessibility
- [ ] DevicePalette shows Generic, Ubiquiti, Mikrotik sections
- [ ] Search works across all sections
- [ ] Ubiquiti devices appear with correct properties
- [ ] Mikrotik devices appear with correct properties
- [ ] Brand device images load (where available)
- [ ] Export uses correct filename convention
- [ ] CSV export works with correct columns
- [ ] Export preview shows in dialog
- [ ] Export margins are consistent
- [ ] Dual-view export layout is correct
- [ ] Export borders and text are crisp
- [ ] All tests pass
- [ ] Build succeeds

---

## Notes for Implementation

### Pre-commit Hooks

The project has pre-commit hooks that run automatically on every commit:

```bash
# .husky/pre-commit
npx lint-staged          # ESLint + Prettier on staged files
npm run test:run         # ALL unit tests must pass
```

**This means:**

- Every commit will run the full test suite
- Commits will be rejected if any test fails
- Lint and formatting errors will block commits

### TDD Workflow with Pre-commit Hooks

1. **Write failing test** — Create test for new functionality
2. **Run tests manually** — `npm run test:run` to verify test fails
3. **Implement** — Write code to make test pass
4. **Run tests manually** — `npm run test:run` to verify ALL tests pass
5. **Lint check** — `npm run lint` and `npm run check`
6. **Commit** — Pre-commit hook re-verifies (safety net, not primary check)

**Important:** Don't rely on pre-commit hooks to catch issues. Run tests manually first to get faster feedback and avoid commit failures.

### Implementation Guidelines

1. **TDD is mandatory** — Write tests before implementation for each prompt
2. **Small commits** — Commit after each prompt completion
3. **Run tests frequently** — `npm run test:run` after each change
4. **Check build** — `npm run build` before marking prompt complete
5. **Visual verification** — Some export changes need manual visual check
6. **Lint early** — Run `npm run lint` before attempting to commit

### Quick Verification Commands

```bash
npm run test:run         # All unit tests
npm run lint             # ESLint
npm run check            # Svelte type checking
npm run build            # Production build
npm run test:e2e         # E2E tests (run after major changes)
```

---

_This plan implements ROADMAP items R-01 through R-05 for Rackarr v0.6.0_
