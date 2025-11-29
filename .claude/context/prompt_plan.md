---
created: 2025-11-27
updated: 2025-11-28T23:27
status: ready
version: 0.1.0
---

# Rackarr — Prompt Plan (v0.1)

**Generated:** 2025-11-27  
**Spec Version:** 0.1.0  
**Methodology:** Harper Reed LLM Codegen (TDD)  
**Framework:** Svelte 5 with Runes

---

## Overview

This plan breaks down the Rackarr v0.1 MVP into 29 incremental, test-driven prompts organised into 12 phases. Each prompt builds on the previous with explicit dependencies — no orphaned code.

**Key Principles:**

- Svelte 5 runes (`$state`, `$derived`, `$effect`) throughout
- Tests written first with explicit test case names
- Pre-commit hooks enforce quality gates
- Small prompts for drag-and-drop (3 separate prompts)
- Dedicated prompts for error handling and E2E testing

---

## Phase 0: Project Bootstrap

### Prompt 0.1 — Project Scaffolding and Tooling

**Status:** ✅ Complete
**Dependencies:** None

```text
Create a new Svelte 5 project for Rackarr using Vite. Set up the following:

1. Initialize with: npm create vite@latest . -- --template svelte-ts

2. Install dependencies:
   - vitest, @testing-library/svelte, jsdom (testing)
   - playwright (E2E testing)
   - eslint, prettier, eslint-plugin-svelte (linting)
   - husky, lint-staged (pre-commit hooks)

3. Configure vitest.config.ts:
   - jsdom environment
   - Svelte component testing support
   - Coverage reporting

4. Set up pre-commit hooks using husky:
   - Run eslint --fix on staged files
   - Run prettier --write on staged files
   - Run vitest run --passWithNoTests
   - Block commit if any check fails

5. Configure TypeScript strict mode in tsconfig.json

6. Create directory structure:
   src/
     lib/
       components/     # Svelte components
       stores/         # Svelte 5 rune-based stores (.svelte.ts)
       types/          # TypeScript types
       utils/          # Pure utility functions
       data/           # Static data (starter library)
     app.css           # Global styles + CSS custom properties
     App.svelte        # Root component
     main.ts           # Entry point

7. Add CSS custom properties from spec Section 18.3 to app.css:
   - --u-height: 22px
   - --rack-width: 220px
   - --toolbar-height: 52px
   - --drawer-width: 300px
   - --font-size-device: 13px
   - Theme colours (dark as default)

8. Create smoke test (src/tests/setup.test.ts):
   - Test: "vitest is configured correctly" → expect(true).toBe(true)
   - Test: "can import Svelte component" → import App, expect no errors

9. Verify:
   - npm run dev starts the app
   - npm run test passes
   - npm run build succeeds
   - git commit triggers pre-commit hooks

10. Create CLAUDE.md with project conventions:
    - Svelte 5 with runes ($state, $derived, $effect)
    - Vitest + Testing Library for tests
    - TDD: write tests before implementation
    - CSS custom properties for theming
    - SVG for rack visualization
    - Prefer explicit over implicit
    - One logical change per commit

Commit: "chore: project scaffolding with Svelte 5, Vite, and testing infrastructure"
```

---

### Prompt 0.2 — TypeScript Types Foundation

**Status:** ✅ Complete
**Dependencies:** 0.1

```text
Create the core TypeScript type definitions based on the spec's data model.

1. Create src/lib/types/index.ts with:

   DeviceCategory type:
   - 'server' | 'network' | 'patch-panel' | 'power' | 'storage' | 'kvm' | 'av-media' | 'cooling' | 'blank' | 'other'

   Device interface:
   - id: string (UUID)
   - name: string
   - height: number (1-42U)
   - colour: string (hex)
   - category: DeviceCategory
   - notes?: string

   PlacedDevice interface:
   - libraryId: string (references Device.id)
   - position: number (bottom U, 1-indexed)

   Rack interface:
   - id: string (UUID)
   - name: string
   - height: number (1-100U)
   - width: number (fixed 19 for v0.1)
   - position: number (order in row, 0-indexed)
   - devices: PlacedDevice[]

   LayoutSettings interface:
   - theme: 'dark' | 'light'

   Layout interface (matches JSON schema from spec Section 10):
   - version: string
   - name: string
   - created: string (ISO date)
   - modified: string (ISO date)
   - settings: LayoutSettings
   - deviceLibrary: Device[]
   - racks: Rack[]

2. Create src/lib/types/constants.ts with:
   - CATEGORY_COLOURS: Record<DeviceCategory, string> from spec Section 18.2
   - ALL_CATEGORIES: DeviceCategory[] for iteration
   - COMMON_RACK_HEIGHTS: number[] = [12, 18, 24, 42]
   - MIN_RACK_HEIGHT = 1, MAX_RACK_HEIGHT = 100
   - MIN_DEVICE_HEIGHT = 1, MAX_DEVICE_HEIGHT = 42
   - CURRENT_VERSION = "1.0"

3. Write tests in src/tests/types.test.ts:
   - Test: "Device interface accepts valid device object"
   - Test: "Rack interface accepts valid rack object"
   - Test: "Layout interface accepts valid layout object"
   - Test: "PlacedDevice references library device correctly"
   - Test: "CATEGORY_COLOURS has entry for every DeviceCategory"
   - Test: "ALL_CATEGORIES contains all 10 categories"

Commit: "feat(types): add core TypeScript type definitions"
```

---

## Phase 1: Core Business Logic

### Prompt 1.1 — Device Utilities

**Status:** ✅ Complete
**Dependencies:** 0.2

```text
Create utility functions for device operations with full test coverage. TDD approach — write tests first.

1. Create src/tests/device.test.ts with tests:

   generateId():
   - Test: "generateId returns valid UUID v4 format"
   - Test: "generateId returns unique values on successive calls"

   getDefaultColour(category):
   - Test: "getDefaultColour returns #4A90D9 for server"
   - Test: "getDefaultColour returns #7B68EE for network"
   - Test: "getDefaultColour returns correct colour for each category"

   createDevice(params):
   - Test: "createDevice generates UUID when id not provided"
   - Test: "createDevice applies default colour from category"
   - Test: "createDevice preserves provided colour over default"
   - Test: "createDevice sets notes to undefined when not provided"

   validateDevice(device):
   - Test: "validateDevice returns valid:true for valid device"
   - Test: "validateDevice rejects height less than 1"
   - Test: "validateDevice rejects height greater than 42"
   - Test: "validateDevice rejects empty name"
   - Test: "validateDevice rejects invalid hex colour format"
   - Test: "validateDevice returns specific error messages"

2. Implement src/lib/utils/device.ts:

   generateId(): string
   - Uses crypto.randomUUID()

   getDefaultColour(category: DeviceCategory): string
   - Returns CATEGORY_COLOURS[category]

   createDevice(params: { name: string; height: number; category: DeviceCategory; id?: string; colour?: string; notes?: string }): Device
   - Generates ID if not provided
   - Applies default colour if not provided
   - Returns complete Device object

   validateDevice(device: Device): { valid: boolean; errors: string[] }
   - Height must be 1-42
   - Name must be non-empty string
   - Colour must match /^#[0-9A-Fa-f]{6}$/

3. Ensure all tests pass before committing

Commit: "feat(device): add device utility functions with validation"
```

---

### Prompt 1.2 — Rack Utilities

**Status:** ✅ Complete
**Dependencies:** 1.1

```text
Create utility functions for rack operations with full test coverage. TDD approach.

1. Create src/tests/rack.test.ts with tests:

   createRack(name, height):
   - Test: "createRack generates valid UUID"
   - Test: "createRack sets width to 19"
   - Test: "createRack sets position to 0"
   - Test: "createRack initializes empty devices array"
   - Test: "createRack preserves provided name and height"

   validateRack(rack):
   - Test: "validateRack returns valid:true for valid rack"
   - Test: "validateRack rejects height less than 1"
   - Test: "validateRack rejects height greater than 100"
   - Test: "validateRack rejects empty name"
   - Test: "validateRack rejects width other than 19"

   getOccupiedUs(rack, deviceLibrary):
   - Test: "getOccupiedUs returns empty Set for empty rack"
   - Test: "getOccupiedUs returns correct Us for 1U device at position 5"
   - Test: "getOccupiedUs returns correct Us for 2U device at position 5 (5,6)"
   - Test: "getOccupiedUs returns correct Us for 4U device at position 10 (10,11,12,13)"
   - Test: "getOccupiedUs combines multiple devices correctly"

   isUAvailable(rack, deviceLibrary, uPosition):
   - Test: "isUAvailable returns true for empty rack"
   - Test: "isUAvailable returns false for occupied U"
   - Test: "isUAvailable returns true for unoccupied U"

2. Implement src/lib/utils/rack.ts:

   createRack(name: string, height: number): Rack
   - Generates UUID via generateId()
   - Sets width = 19, position = 0, devices = []

   validateRack(rack: Rack): { valid: boolean; errors: string[] }
   - Height must be 1-100
   - Name must be non-empty
   - Width must be 19

   getOccupiedUs(rack: Rack, deviceLibrary: Device[]): Set<number>
   - For each placed device, add all Us it occupies
   - Device at position P with height H occupies Us P through P+H-1

   isUAvailable(rack: Rack, deviceLibrary: Device[], uPosition: number): boolean
   - Returns !getOccupiedUs(rack, deviceLibrary).has(uPosition)

Commit: "feat(rack): add rack utility functions with validation"
```

---

### Prompt 1.3 — Collision Detection System

**Status:** ✅ Complete
**Dependencies:** 1.2

```text
Create comprehensive collision detection for device placement. TDD approach.

1. Create src/tests/collision.test.ts with tests:

   getDeviceURange(position, height):
   - Test: "getDeviceURange returns {bottom:5, top:5} for 1U device at position 5"
   - Test: "getDeviceURange returns {bottom:5, top:6} for 2U device at position 5"
   - Test: "getDeviceURange returns {bottom:10, top:13} for 4U device at position 10"

   doRangesOverlap(rangeA, rangeB):
   - Test: "doRangesOverlap returns false for {1,2} and {3,4} (adjacent)"
   - Test: "doRangesOverlap returns true for {1,3} and {2,4} (partial overlap)"
   - Test: "doRangesOverlap returns true for {1,4} and {2,3} (containment)"
   - Test: "doRangesOverlap returns true for {2,3} and {1,4} (reverse containment)"
   - Test: "doRangesOverlap returns true for {1,2} and {2,3} (edge touch)"

   canPlaceDevice(rack, deviceLibrary, deviceHeight, targetPosition):
   - Test: "canPlaceDevice returns true for empty rack"
   - Test: "canPlaceDevice returns false when device would exceed rack top"
   - Test: "canPlaceDevice returns false for position less than 1"
   - Test: "canPlaceDevice returns false for collision with existing device"
   - Test: "canPlaceDevice returns true for position adjacent to existing device"

   findCollisions(rack, deviceLibrary, newDeviceHeight, newPosition, excludeIndex?):
   - Test: "findCollisions returns empty array when no collisions"
   - Test: "findCollisions returns colliding devices"
   - Test: "findCollisions excludes device at excludeIndex (for move operations)"

   findValidDropPositions(rack, deviceLibrary, deviceHeight):
   - Test: "findValidDropPositions returns [1..rackHeight-deviceHeight+1] for empty rack"
   - Test: "findValidDropPositions excludes positions that would collide"
   - Test: "findValidDropPositions returns empty array when rack is full"

   snapToNearestValidPosition(rack, deviceLibrary, deviceHeight, targetY, uHeight):
   - Test: "snapToNearestValidPosition returns exact position if valid"
   - Test: "snapToNearestValidPosition returns nearest valid position"
   - Test: "snapToNearestValidPosition returns null when no valid positions"

2. Implement src/lib/utils/collision.ts with all functions

Commit: "feat(collision): add collision detection system"
```

---

### Prompt 1.4 — Layout Persistence Logic

**Status:** ✅ Complete
**Dependencies:** 1.3

```text
Create JSON serialization, deserialization, and validation for layouts. TDD approach.

1. Create src/tests/serialization.test.ts with tests:

   createLayout(name):
   - Test: "createLayout sets version to CURRENT_VERSION"
   - Test: "createLayout sets created and modified to current ISO timestamp"
   - Test: "createLayout initializes with dark theme"
   - Test: "createLayout initializes with empty racks array"
   - Test: "createLayout initializes with empty deviceLibrary"

   serializeLayout(layout):
   - Test: "serializeLayout produces valid JSON string"
   - Test: "serializeLayout updates modified timestamp"
   - Test: "serializeLayout preserves all layout properties"

   deserializeLayout(json):
   - Test: "deserializeLayout parses valid JSON correctly"
   - Test: "deserializeLayout throws for invalid JSON syntax"
   - Test: "deserializeLayout throws for missing required fields"
   - Test: "deserializeLayout throws for invalid version"

   validateLayoutStructure(obj):
   - Test: "validateLayoutStructure returns true for valid layout"
   - Test: "validateLayoutStructure returns false for missing version"
   - Test: "validateLayoutStructure returns false for missing racks"
   - Test: "validateLayoutStructure returns false for invalid device references"
   - Test: "validateLayoutStructure returns false for overlapping devices in rack"

   Round-trip:
   - Test: "serialize then deserialize preserves all data"

2. Implement src/lib/utils/serialization.ts:

   createLayout(name: string): Layout

   serializeLayout(layout: Layout): string

   deserializeLayout(json: string): Layout (throws on error)

   validateLayoutStructure(obj: unknown): obj is Layout (type guard)

Commit: "feat(serialization): add layout JSON persistence and validation"
```

---

## Phase 2: State Management

### Prompt 2.1 — Layout Store (Svelte 5 Runes)

**Status:** ✅ Complete
**Dependencies:** 1.4

```text
Create the main layout store using Svelte 5 runes. This is the central state for the application.

1. Create src/lib/stores/layout.svelte.ts using runes:

   State (using $state):
   - layout: Layout (initialized with createLayout('Untitled'))
   - isDirty: boolean (tracks unsaved changes)

   Derived (using $derived):
   - racks: layout.racks
   - deviceLibrary: layout.deviceLibrary
   - rackCount: layout.racks.length
   - canAddRack: layout.racks.length < 6

   Actions (regular functions that mutate state):
   - createNewLayout(name: string): void
   - loadLayout(layoutData: Layout): void
   - resetLayout(): void

   Rack actions:
   - addRack(name: string, height: number): Rack
   - updateRack(id: string, updates: Partial<Rack>): void
   - deleteRack(id: string): void
   - reorderRacks(fromIndex: number, toIndex: number): void

   Device library actions:
   - addDeviceToLibrary(device: Omit<Device, 'id'>): Device
   - updateDeviceInLibrary(id: string, updates: Partial<Device>): void
   - deleteDeviceFromLibrary(id: string): void

   Placement actions:
   - placeDevice(rackId: string, libraryId: string, position: number): boolean
   - moveDevice(rackId: string, deviceIndex: number, newPosition: number): boolean
   - moveDeviceToRack(fromRackId: string, deviceIndex: number, toRackId: string, newPosition: number): boolean
   - removeDeviceFromRack(rackId: string, deviceIndex: number): void

   Dirty tracking:
   - markDirty(): void
   - markClean(): void

   Export function to access store:
   - export function getLayoutStore() { return { layout, isDirty, racks, deviceLibrary, ... } }

2. Write tests in src/tests/layout-store.test.ts:
   - Test: "createNewLayout initializes empty layout with given name"
   - Test: "addRack creates rack with correct properties"
   - Test: "addRack returns false when 6 racks exist"
   - Test: "updateRack modifies rack properties"
   - Test: "deleteRack removes rack from layout"
   - Test: "reorderRacks swaps rack positions correctly"
   - Test: "addDeviceToLibrary generates ID and adds device"
   - Test: "placeDevice adds device to rack at position"
   - Test: "placeDevice returns false for invalid position (collision)"
   - Test: "placeDevice returns false for invalid position (exceeds rack)"
   - Test: "moveDevice updates device position within rack"
   - Test: "moveDeviceToRack transfers device between racks"
   - Test: "removeDeviceFromRack removes device from rack"
   - Test: "all mutating actions set isDirty to true"
   - Test: "markClean sets isDirty to false"

Commit: "feat(store): add layout store with Svelte 5 runes"
```

---

### Prompt 2.2 — Selection Store

**Status:** ✅ Complete
**Dependencies:** 2.1

```text
Create selection state management using Svelte 5 runes.

1. Create src/lib/stores/selection.svelte.ts:

   State (using $state):
   - selectedId: string | null
   - selectedType: 'rack' | 'device' | null
   - selectedRackId: string | null (for device selection, which rack contains it)
   - selectedDeviceIndex: number | null (index in rack.devices array)

   Derived (using $derived):
   - hasSelection: selectedId !== null
   - isRackSelected: selectedType === 'rack'
   - isDeviceSelected: selectedType === 'device'

   Actions:
   - selectRack(rackId: string): void
   - selectDevice(rackId: string, deviceIndex: number, deviceLibraryId: string): void
   - clearSelection(): void

   Export function:
   - export function getSelectionStore() { return { ... } }

2. Write tests in src/tests/selection-store.test.ts:
   - Test: "initial state has no selection"
   - Test: "selectRack sets selectedId and selectedType to 'rack'"
   - Test: "selectDevice sets selectedId, selectedType, selectedRackId, selectedDeviceIndex"
   - Test: "clearSelection resets all selection state"
   - Test: "selectRack clears previous device selection"
   - Test: "selectDevice clears previous rack selection"
   - Test: "hasSelection returns true when rack selected"
   - Test: "hasSelection returns true when device selected"
   - Test: "hasSelection returns false when nothing selected"

Commit: "feat(store): add selection store"
```

---

### Prompt 2.3 — UI Store (Theme, Zoom, Drawers)

**Status:** ✅ Complete
**Dependencies:** 0.1

```text
Create UI state management for theme, zoom, and drawer visibility.

1. Create src/lib/stores/ui.svelte.ts:

   Theme state:
   - theme: 'dark' | 'light' ($state, initialized from localStorage or 'dark')

   Theme actions:
   - toggleTheme(): void
   - setTheme(theme: 'dark' | 'light'): void

   Theme effects ($effect):
   - On theme change, save to localStorage
   - On theme change, update document.documentElement.dataset.theme

   Zoom state:
   - zoom: number ($state, default 100)
   - ZOOM_MIN = 50, ZOOM_MAX = 200, ZOOM_STEP = 25

   Zoom derived:
   - canZoomIn: zoom < ZOOM_MAX
   - canZoomOut: zoom > ZOOM_MIN
   - zoomScale: zoom / 100

   Zoom actions:
   - zoomIn(): void (increment by ZOOM_STEP)
   - zoomOut(): void (decrement by ZOOM_STEP)
   - setZoom(value: number): void
   - resetZoom(): void (set to 100)

   Drawer state:
   - leftDrawerOpen: boolean ($state, default false)
   - rightDrawerOpen: boolean ($state, default false)

   Drawer actions:
   - toggleLeftDrawer(): void
   - toggleRightDrawer(): void
   - openLeftDrawer(): void
   - closeLeftDrawer(): void
   - openRightDrawer(): void
   - closeRightDrawer(): void

2. Create src/lib/utils/theme.ts:
   - loadThemeFromStorage(): 'dark' | 'light'
   - saveThemeToStorage(theme: 'dark' | 'light'): void
   - applyThemeToDocument(theme: 'dark' | 'light'): void

3. Write tests in src/tests/ui-store.test.ts:
   - Test: "initial theme is dark when localStorage empty"
   - Test: "initial theme loads from localStorage"
   - Test: "toggleTheme switches between dark and light"
   - Test: "setTheme applies specified theme"
   - Test: "theme change persists to localStorage"
   - Test: "initial zoom is 100"
   - Test: "zoomIn increases zoom by ZOOM_STEP"
   - Test: "zoomOut decreases zoom by ZOOM_STEP"
   - Test: "zoom cannot exceed ZOOM_MAX"
   - Test: "zoom cannot go below ZOOM_MIN"
   - Test: "toggleLeftDrawer toggles leftDrawerOpen"
   - Test: "toggleRightDrawer toggles rightDrawerOpen"

Commit: "feat(store): add UI store for theme, zoom, and drawers"
```

---

### Prompt 2.4 — Session Persistence

**Status:** ✅ Complete
**Dependencies:** 2.1

```text
Add sessionStorage persistence for work-in-progress protection.

1. Create src/lib/utils/session.ts:

   STORAGE_KEY = 'rackarr_session'

   saveToSession(layout: Layout): void
   - Serializes layout to sessionStorage

   loadFromSession(): Layout | null
   - Returns null if no saved session
   - Returns null if JSON invalid
   - Returns Layout if valid

   clearSession(): void
   - Removes from sessionStorage

   hasSession(): boolean
   - Returns true if session exists and is valid JSON

2. Create src/lib/utils/debounce.ts:
   debounce<T extends (...args: any[]) => any>(fn: T, ms: number): T
   - Standard debounce implementation

3. Update layout store to integrate persistence:
   - Add $effect that saves to session on layout change (debounced 500ms)
   - Add restoreFromSession(): boolean action
   - DO NOT auto-restore (per spec — user must choose)

4. Write tests in src/tests/session.test.ts:
   - Test: "saveToSession stores valid JSON in sessionStorage"
   - Test: "loadFromSession retrieves stored layout"
   - Test: "loadFromSession returns null for empty storage"
   - Test: "loadFromSession returns null for invalid JSON"
   - Test: "clearSession removes data from sessionStorage"
   - Test: "hasSession returns true when valid session exists"
   - Test: "hasSession returns false when no session"
   - Test: "debounce delays execution"
   - Test: "debounce only calls once for rapid invocations"

Commit: "feat(persistence): add sessionStorage auto-save"
```

---

## Phase 3: Core Components

### Prompt 3.1 — Rack SVG Component

**Status:** ✅ Complete
**Dependencies:** 2.1, 2.3

```text
Create the SVG Rack component for visualization. No drag-drop yet — just rendering.

1. Create src/lib/components/Rack.svelte:

   Props:
   - rack: Rack
   - deviceLibrary: Device[]
   - selected: boolean
   - zoom: number (percentage, 50-200)

   Internal calculations:
   - totalHeight = rack.height * uHeight
   - Apply zoom via CSS transform: scale(zoom / 100)

   SVG rendering:
   - Outer <svg> with viewBox based on dimensions
   - Background rectangle (--colour-rack-interior)
   - Left rail with U numbers (U1 at bottom, counting up)
   - Grid lines dividing each U (horizontal lines)
   - Vertical rails showing 3 rack nut points per U
   - Rack name text below the rack
   - Selection outline (when selected=true)

   Events:
   - on:click → dispatch('select', { rackId: rack.id })
   - on:keydown (Enter/Space when focused) → dispatch('select')

   Accessibility:
   - tabindex="0" for keyboard focus
   - role="img" with aria-label

2. Write tests in src/tests/Rack.test.ts:
   - Test: "Rack renders correct number of U labels"
   - Test: "Rack renders U1 at the bottom position"
   - Test: "Rack renders U{height} at the top position"
   - Test: "Rack displays rack name below the rack"
   - Test: "Rack shows selection outline when selected=true"
   - Test: "Rack hides selection outline when selected=false"
   - Test: "Rack dispatches select event on click"
   - Test: "Rack applies zoom transform correctly"
   - Test: "Rack has correct aria-label"

Commit: "feat(components): add Rack SVG visualization component"
```

---

### Prompt 3.2 — Device SVG Component

**Status:** ✅ Complete
**Dependencies:** 3.1

```text
Create the Device SVG component rendered within a rack.

1. Create src/lib/components/RackDevice.svelte:

   Props:
   - device: Device (from library)
   - position: number (bottom U, 1-indexed)
   - rackHeight: number (total Us in rack)
   - selected: boolean
   - uHeight: number (from CSS custom property)
   - rackWidth: number (from CSS custom property)

   Position calculation (SVG y-coordinate, origin at top):
   - y = (rackHeight - position - device.height + 1) * uHeight
   - height = device.height * uHeight
   - width = rackWidth - (rail margins)

   SVG rendering (as <g> group to nest in Rack):
   - Rectangle with device.colour as fill
   - Device name text (centered horizontally and vertically)
   - Text truncation with ellipsis if too long
   - Selection outline (2px, --colour-selection) when selected

   Events:
   - on:click → dispatch('select', { libraryId: device.id, position })
   - stopPropagation to prevent rack selection

   Accessibility:
   - role="button" with aria-label

2. Create src/lib/components/CategoryIcon.svelte:
   Props: category: DeviceCategory, size: number (default 16)
   - Simple SVG icons for each category
   - Geometric shapes are acceptable for v0.1
   - Export icon as <svg> element

3. Update Rack.svelte:
   - Import and render RackDevice for each device in rack.devices
   - Look up device details from deviceLibrary by libraryId
   - Pass selection state based on selectionStore

4. Write tests in src/tests/RackDevice.test.ts:
   - Test: "RackDevice renders at correct Y position for U1"
   - Test: "RackDevice renders at correct Y position for middle U"
   - Test: "RackDevice renders with correct height for 1U device"
   - Test: "RackDevice renders with correct height for 4U device"
   - Test: "RackDevice displays device name"
   - Test: "RackDevice uses device.colour for fill"
   - Test: "RackDevice shows selection outline when selected=true"
   - Test: "RackDevice dispatches select event on click"
   - Test: "RackDevice click does not bubble to rack"

Commit: "feat(components): add RackDevice SVG component"
```

---

### Prompt 3.3 — Canvas Component

**Status:** ✅ Complete
**Dependencies:** 3.2

```text
Create the Canvas component that displays multiple racks.

1. Create src/lib/components/Canvas.svelte:

   Props: none (reads from stores)

   Store subscriptions:
   - racks from layoutStore (sorted by position)
   - deviceLibrary from layoutStore
   - selectedId, selectedType from selectionStore
   - zoom from uiStore

   Layout:
   - Horizontal flexbox with gap between racks
   - align-items: flex-end (bottom-align racks of different heights)
   - overflow-x: auto (horizontal scroll when needed)
   - padding for visual spacing

   Rendering:
   - Render <Rack> for each rack in order
   - Pass appropriate props including selection state
   - Show EmptyState when racks.length === 0

   Events:
   - on:click (on canvas background) → clearSelection()

2. Create src/lib/components/EmptyState.svelte:
   - Centered message: "No racks yet"
   - "Create your first rack" subtitle
   - Button: "New Rack" → dispatches 'newRack' event
   - Styled for both dark and light themes

3. Write tests in src/tests/Canvas.test.ts:
   - Test: "Canvas renders correct number of racks"
   - Test: "Canvas renders racks in position order"
   - Test: "Canvas bottom-aligns racks of different heights"
   - Test: "Canvas clicking empty space clears selection"
   - Test: "Canvas shows EmptyState when no racks"
   - Test: "Canvas applies zoom to rack containers"
   - Test: "Canvas scrolls horizontally when racks exceed width"

Commit: "feat(components): add Canvas with multi-rack layout"
```

---

### Prompt 3.4 — Device Palette (Left Drawer)

**Status:** ✅ Complete
**Dependencies:** 3.2, 1.1

```text
Create the Device Palette component for browsing and selecting devices.

1. Create src/lib/components/DevicePalette.svelte:

   Props: none (reads from stores)

   State:
   - searchQuery: string ($state)

   Store subscriptions:
   - deviceLibrary from layoutStore

   Computed:
   - filteredDevices: search filter applied
   - groupedDevices: grouped by category

   Layout:
   - Search input at top
   - Collapsible category sections
   - Device cards within each section
   - "Add Device" button at bottom

   Events:
   - dispatch('addDevice') when add button clicked

2. Create src/lib/components/DevicePaletteItem.svelte:

   Props:
   - device: Device

   Rendering:
   - Device name
   - Height badge (e.g., "2U")
   - Colour swatch (small square with device.colour)
   - Category icon (small)

   Will become drag source in next prompts

3. Create src/lib/utils/deviceFilters.ts:
   - searchDevices(devices: Device[], query: string): Device[]
   - groupDevicesByCategory(devices: Device[]): Map<DeviceCategory, Device[]>

4. Write tests in src/tests/DevicePalette.test.ts:
   - Test: "DevicePalette renders all devices from library"
   - Test: "DevicePalette search filters devices by name"
   - Test: "DevicePalette search is case-insensitive"
   - Test: "DevicePalette groups devices by category"
   - Test: "DevicePalette shows empty state when no devices match search"
   - Test: "DevicePaletteItem displays device name"
   - Test: "DevicePaletteItem displays height as badge"
   - Test: "DevicePaletteItem shows colour swatch"

Commit: "feat(components): add Device Palette with search and grouping"
```

---

## Phase 4: Drag-and-Drop

### Prompt 4.1 — DnD: Palette to Rack

**Status:** ✅ Complete
**Dependencies:** 3.4, 1.3

```text
Implement drag-and-drop from device palette onto rack. First DnD interaction.

1. Install svelte-dnd-action:
   npm install svelte-dnd-action

2. Create src/lib/utils/dragdrop.ts:

   DragData interface:
   - type: 'palette' | 'rack-device'
   - device: Device
   - sourceRackId?: string (for rack-device)
   - sourceIndex?: number (for rack-device)

   calculateDropPosition(mouseY: number, rackElement: Element, rackHeight: number, uHeight: number): number
   - Converts mouse Y to target U position
   - Accounts for SVG coordinate system (y=0 at top)

   getDropFeedback(rack: Rack, deviceLibrary: Device[], deviceHeight: number, targetU: number): 'valid' | 'invalid' | 'blocked'
   - 'valid': can place here
   - 'invalid': position out of bounds
   - 'blocked': collision with existing device

3. Update DevicePaletteItem.svelte:
   - Make draggable (draggable="true")
   - on:dragstart → set drag data with type='palette'
   - Visual feedback: opacity change during drag

4. Update Rack.svelte:
   - Accept drops (on:dragover, on:drop)
   - on:dragover: calculate target position, show drop preview
   - Render drop preview indicator (ghost rectangle at target position)
   - Highlight valid positions (green/blue outline)
   - Highlight invalid positions (red outline)
   - on:drop: if valid, call placeDevice action

5. Write tests in src/tests/dnd-palette.test.ts:
   - Test: "calculateDropPosition returns correct U for mouse near bottom"
   - Test: "calculateDropPosition returns correct U for mouse near top"
   - Test: "calculateDropPosition snaps to nearest U boundary"
   - Test: "getDropFeedback returns 'valid' for empty position"
   - Test: "getDropFeedback returns 'blocked' for collision"
   - Test: "getDropFeedback returns 'invalid' for position exceeding rack"
   - Test: "dragging device from palette shows drag image"
   - Test: "dropping on valid position calls placeDevice"
   - Test: "dropping on invalid position does nothing"

Commit: "feat(dnd): add drag-and-drop from palette to rack"
```

---

### Prompt 4.2 — DnD: Move Within Rack

**Status:** ✅ Complete
**Dependencies:** 4.1

```text
Implement drag-and-drop to move devices within a rack.

1. Update RackDevice.svelte:
   - Make draggable (draggable="true")
   - on:dragstart → set drag data with type='rack-device', sourceRackId, sourceIndex
   - Visual feedback: reduce opacity during drag, show placeholder

2. Update Rack.svelte to handle internal moves:
   - Detect when drag source is same rack
   - Exclude source device from collision checks during drag
   - Show drop preview at new position
   - on:drop for internal move → call moveDevice action

3. Add keyboard movement:
   - When device selected, ArrowUp moves device up 1U
   - When device selected, ArrowDown moves device down 1U
   - Block movement at rack boundaries
   - Block movement into collisions
   - Handle in parent component or keyboard handler

4. Write tests in src/tests/dnd-within-rack.test.ts:
   - Test: "dragging device within rack shows preview at target"
   - Test: "dropping device at valid position moves it"
   - Test: "dropping device at collision position is rejected"
   - Test: "dropping device back at original position is no-op"
   - Test: "ArrowUp moves selected device up 1U"
   - Test: "ArrowDown moves selected device down 1U"
   - Test: "ArrowUp at top of rack is blocked"
   - Test: "ArrowDown at bottom of rack is blocked"
   - Test: "Arrow movement blocked by collision"

Commit: "feat(dnd): add device movement within rack"
```

---

### Prompt 4.3 — DnD: Move Between Racks

**Status:** ✅ Complete
**Dependencies:** 4.2

```text
Implement drag-and-drop to move devices between different racks.

1. Update Rack.svelte to handle cross-rack moves:
   - Detect when drag source is different rack
   - Full collision checking against target rack devices
   - Validate device height fits in target rack
   - Show drop preview with full validation feedback
   - on:drop for cross-rack move → call moveDeviceToRack action

2. Update layout store moveDeviceToRack:
   - Atomic operation: remove from source, add to target
   - Proper error handling if target position invalid
   - Return boolean success indicator

3. Handle edge cases:
   - Device too tall for target rack
   - Target position blocked
   - Source and target are same rack (delegate to within-rack logic)

4. Write tests in src/tests/dnd-between-racks.test.ts:
   - Test: "dragging device to different rack shows preview"
   - Test: "dropping device on valid position in other rack moves it"
   - Test: "source rack no longer contains device after cross-rack move"
   - Test: "target rack contains device after cross-rack move"
   - Test: "device retains all properties after cross-rack move"
   - Test: "dropping on invalid position in other rack is rejected"
   - Test: "dropping device too tall for target rack is rejected"
   - Test: "collision in target rack blocks drop"

Commit: "feat(dnd): add device movement between racks"
```

---

## Phase 5: Application Shell

### Prompt 5.1 — Toolbar Component

**Status:** ✅ Complete
**Dependencies:** 2.3, 2.2

```text
Create the main toolbar with all action buttons.

1. Create src/lib/components/Toolbar.svelte:

   Layout:
   - Fixed height (--toolbar-height: 52px)
   - Flexbox: logo left, actions center-right
   - Background colour from theme

   Left section:
   - App logo (simple SVG or text)
   - "Rackarr" text (clickable → opens Help)

   Center section:
   - New Rack button
   - Device Palette toggle button
   - Separator
   - Save button
   - Load button
   - Export button
   - Separator
   - Delete button (disabled when no selection)

   Right section:
   - Zoom out button (disabled at min)
   - Zoom level display (e.g., "100%")
   - Zoom in button (disabled at max)
   - Theme toggle (sun/moon icon)
   - Help button (?)

   Events dispatched:
   - 'newRack', 'togglePalette', 'save', 'load', 'export', 'delete'
   - 'zoomIn', 'zoomOut', 'toggleTheme', 'help'

2. Create src/lib/components/ToolbarButton.svelte:
   Props: icon (component), label (string), disabled (boolean), active (boolean)
   - Renders button with icon
   - aria-label for accessibility
   - Disabled styling
   - Active state for toggles

3. Create simple icon components in src/lib/components/icons/:
   - IconPlus, IconPalette, IconSave, IconLoad, IconExport, IconTrash
   - IconZoomIn, IconZoomOut, IconSun, IconMoon, IconHelp

4. Write tests in src/tests/Toolbar.test.ts:
   - Test: "Toolbar renders all action buttons"
   - Test: "Delete button disabled when hasSelection is false"
   - Test: "Delete button enabled when hasSelection is true"
   - Test: "Palette toggle shows active state when drawer open"
   - Test: "Theme toggle shows sun icon in dark mode"
   - Test: "Theme toggle shows moon icon in light mode"
   - Test: "Zoom in disabled at ZOOM_MAX"
   - Test: "Zoom out disabled at ZOOM_MIN"
   - Test: "Click events dispatch correct event names"
   - Test: "All buttons have aria-labels"

Commit: "feat(components): add Toolbar with all action buttons"
```

---

### Prompt 5.2 — Drawer Component

**Status:** ✅ Complete
**Dependencies:** 5.1

```text
Create reusable drawer component for left (palette) and right (edit panel) drawers.

1. Create src/lib/components/Drawer.svelte:

   Props:
   - side: 'left' | 'right'
   - open: boolean
   - width: string (default: 'var(--drawer-width)')

   Features:
   - Slides in/out from specified side
   - CSS transition for smooth animation (200-300ms)
   - Takes full height below toolbar
   - Slot for content
   - Optional: click outside to close (prop)

   Styling:
   - Position: fixed or absolute based on layout
   - z-index above canvas, below modals
   - Background from theme
   - Box shadow for depth

2. Create src/lib/components/DrawerHeader.svelte:
   Props: title: string
   - Header bar for drawer with title
   - Close button (X icon)
   - Dispatches 'close' event

3. Write tests in src/tests/Drawer.test.ts:
   - Test: "Drawer renders slot content when open"
   - Test: "Drawer hidden when open=false"
   - Test: "Drawer slides from left when side='left'"
   - Test: "Drawer slides from right when side='right'"
   - Test: "Drawer applies correct width"
   - Test: "DrawerHeader shows title"
   - Test: "DrawerHeader close button dispatches close event"

Commit: "feat(components): add Drawer component"
```

---

### Prompt 5.3 — Edit Panel (Right Drawer)

**Status:** ✅ Complete
**Dependencies:** 5.2, 2.2

```text
Create the Edit Panel for modifying selected items.

1. Create src/lib/components/EditPanel.svelte:

   Store subscriptions:
   - selectionStore (selectedType, selectedId, etc.)
   - layoutStore (to get rack/device details)

   Auto-show behavior:
   - $effect: when hasSelection becomes true, open right drawer
   - $effect: when hasSelection becomes false, close right drawer

   Rack editing (when selectedType === 'rack'):
   - Name field (text input, editable)
   - Height field (editable only if rack.devices.length === 0)
   - Height dropdown (12U, 18U, 24U, 42U) + custom
   - Message: "Remove all devices to resize" if devices present
   - Position display (read-only)
   - Device count display (read-only)
   - Delete button (red/warning style)

   Device editing (when selectedType === 'device'):
   - Device name (read-only, from library)
   - Position (read-only)
   - Height (read-only)
   - Category (read-only)
   - Colour swatch (read-only)
   - Notes (read-only)
   - "Remove from rack" button

   Form handling:
   - Update rack name on blur or Enter
   - Update rack height on change (with validation)
   - Delete/remove with confirmation (next prompt)

2. Create src/lib/components/ColourSwatch.svelte:
   Props: colour: string, size: number
   - Small square showing the colour
   - Border for visibility on similar backgrounds

3. Write tests in src/tests/EditPanel.test.ts:
   - Test: "EditPanel shows rack fields when rack selected"
   - Test: "EditPanel shows device fields when device selected"
   - Test: "EditPanel hidden when nothing selected"
   - Test: "Rack name field is editable"
   - Test: "Rack height editable when no devices"
   - Test: "Rack height shows message when devices present"
   - Test: "Name change updates layout store"
   - Test: "Delete button present for rack"
   - Test: "Remove button present for device"

Commit: "feat(components): add Edit Panel with auto-show"
```

---

### Prompt 5.4 — App Layout Integration

**Status:** ✅ Complete
**Dependencies:** 5.3, 4.3, 3.4

```text
Wire together all components into the main App layout.

1. Update src/App.svelte:

   Layout structure:
   - Toolbar (fixed top)
   - Main area (flex: 1)
     - Drawer left (Device Palette)
     - Canvas (flex: 1, fills remaining space)
     - Drawer right (Edit Panel)

   Store initialization:
   - Initialize all stores
   - Set up theme on mount
   - Set up session restore prompt (if session exists)

   Event handling:
   - Wire Toolbar events to store actions
   - Wire keyboard shortcuts (next phase)

   Drawer coordination:
   - Palette drawer controlled by leftDrawerOpen
   - Edit panel drawer controlled by rightDrawerOpen
   - Edit panel auto-opens on selection (via EditPanel $effect)

2. Add beforeunload handler:
   - When isDirty is true, show browser confirmation
   - "You have unsaved changes. Leave anyway?"

3. Create src/lib/components/AppLayout.svelte (optional wrapper):
   - If App.svelte gets too complex, extract layout structure

4. Write tests in src/tests/App.test.ts:
   - Test: "App renders toolbar"
   - Test: "App renders canvas"
   - Test: "Palette drawer toggles with toolbar button"
   - Test: "Edit panel opens when item selected"
   - Test: "Edit panel closes when selection cleared"
   - Test: "Theme toggle changes theme"
   - Test: "Zoom controls update zoom level"

Commit: "feat(app): integrate all components into main layout"
```

---

## Phase 6: Forms and Dialogs

### Prompt 6.1 — Dialog Component

**Status:** ✅ Complete
**Dependencies:** 5.2

```text
Create reusable dialog/modal component.

1. Create src/lib/components/Dialog.svelte:

   Props:
   - open: boolean
   - title: string
   - width: string (default: '400px')

   Features:
   - Backdrop overlay (semi-transparent black)
   - Centered modal box
   - Header with title and close button
   - Slot for content
   - Focus trap (tab cycles within dialog)
   - Escape key closes
   - Click backdrop closes (optional prop)

   Accessibility:
   - role="dialog"
   - aria-modal="true"
   - aria-labelledby for title
   - Focus first focusable element on open
   - Return focus to trigger on close

   Events:
   - dispatch('close')

2. Write tests in src/tests/Dialog.test.ts:
   - Test: "Dialog renders when open=true"
   - Test: "Dialog hidden when open=false"
   - Test: "Dialog shows title"
   - Test: "Dialog renders slot content"
   - Test: "Escape key dispatches close event"
   - Test: "Backdrop click dispatches close event"
   - Test: "Close button dispatches close event"
   - Test: "Dialog has correct ARIA attributes"

Commit: "feat(components): add Dialog modal component"
```

---

### Prompt 6.2 — New Rack Form

**Status:** ✅ Complete
**Dependencies:** 6.1

```text
Create the new rack creation form.

1. Create src/lib/components/NewRackForm.svelte:

   Props:
   - open: boolean

   Form fields:
   - Name (text input, required)
   - Height selection:
     - Radio/button group: 12U, 18U, 24U, 42U
     - "Custom" option reveals number input (1-100)

   Validation:
   - Name required (show error if empty on submit)
   - Height must be 1-100 (show error if invalid)

   Actions:
   - "Create" button (primary, submits form)
   - "Cancel" button (secondary, closes dialog)
   - Enter key submits when valid

   Events:
   - dispatch('create', { name, height })
   - dispatch('cancel')

2. Wire into App:
   - Toolbar "New Rack" button opens form
   - On create, call addRack action
   - On create/cancel, close form

3. Write tests in src/tests/NewRackForm.test.ts:
   - Test: "Form renders when open=true"
   - Test: "Form hidden when open=false"
   - Test: "Preset height buttons select correct value"
   - Test: "Custom option shows number input"
   - Test: "Validation shows error for empty name"
   - Test: "Validation shows error for height < 1"
   - Test: "Validation shows error for height > 100"
   - Test: "Submit dispatches create event with correct data"
   - Test: "Cancel dispatches cancel event"
   - Test: "Enter key submits form"
   - Test: "Escape key cancels form"

Commit: "feat(forms): add New Rack creation form"
```

---

### Prompt 6.3 — Add Device Form

**Status:** ✅ Complete
**Dependencies:** 6.1

```text
Create the add device to library form.

1. Create src/lib/components/AddDeviceForm.svelte:

   Props:
   - open: boolean

   Form fields:
   - Name (text input, required)
   - Height (number input, 1-42, required)
   - Category (dropdown with all categories, required)
   - Colour (colour picker, defaults to category colour)
   - Notes (textarea, optional)

   Dynamic behavior:
   - When category changes, update colour to category default
   - If user has manually changed colour, don't override

   Validation:
   - Name required
   - Height 1-42
   - Colour valid hex

   Events:
   - dispatch('add', { name, height, category, colour, notes })
   - dispatch('cancel')

2. Create src/lib/components/ColourPicker.svelte:
   Props: value: string, onChange: (colour: string) => void
   - Native <input type="color">
   - Hex value display
   - Preset swatches (category colours)

3. Wire into DevicePalette:
   - "Add Device" button opens form
   - On add, call addDeviceToLibrary action
   - New device appears in palette

4. Write tests in src/tests/AddDeviceForm.test.ts:
   - Test: "Form renders all fields"
   - Test: "Category dropdown has all 10 categories"
   - Test: "Colour defaults to category colour"
   - Test: "Colour updates when category changes"
   - Test: "Manual colour change preserved on category change" (optional behavior)
   - Test: "Validation rejects empty name"
   - Test: "Validation rejects height < 1"
   - Test: "Validation rejects height > 42"
   - Test: "Submit adds device to library"
   - Test: "New device appears in palette"

Commit: "feat(forms): add Add Device form"
```

---

### Prompt 6.4 — Confirmation Dialog

**Status:** ✅ Complete
**Dependencies:** 6.1

```text
Create reusable confirmation dialog for destructive actions.

1. Create src/lib/components/ConfirmDialog.svelte:

   Props:
   - open: boolean
   - title: string
   - message: string
   - confirmLabel: string (default: "Delete")
   - cancelLabel: string (default: "Cancel")
   - destructive: boolean (default: true)

   Styling:
   - Destructive: confirm button red/warning colour
   - Non-destructive: confirm button primary colour
   - Cancel button always secondary

   Events:
   - dispatch('confirm')
   - dispatch('cancel')

   Keyboard:
   - Enter confirms
   - Escape cancels

2. Integrate confirmation for:
   - Delete rack (always, but especially if contains devices)
   - Message: "Delete rack '{name}'? This will remove all {n} devices."
   - Delete device from library (if used in any rack)
   - Message: "Remove '{name}' from library? It is placed in {n} rack(s)."

3. Write tests in src/tests/ConfirmDialog.test.ts:
   - Test: "Dialog shows title and message"
   - Test: "Confirm button has correct label"
   - Test: "Destructive mode shows red confirm button"
   - Test: "Confirm click dispatches confirm event"
   - Test: "Cancel click dispatches cancel event"
   - Test: "Escape key dispatches cancel event"
   - Test: "Enter key dispatches confirm event"

Commit: "feat(dialogs): add confirmation dialog"
```

---

## Phase 7: Save/Load and Starter Library

### Prompt 7.1 — Starter Device Library

**Status:** ✅ Complete
**Dependencies:** 1.1

```text
Create the starter device library with common devices.

1. Create src/lib/data/starterLibrary.ts:

   Export getStarterLibrary(): Device[]

   Create devices from spec Section 6.3:
   - server: "1U Server", "2U Server", "4U Server"
   - network: "1U Switch", "1U Router", "1U Firewall"
   - patch-panel: "1U Patch Panel", "2U Patch Panel"
   - power: "1U PDU", "2U UPS", "4U UPS"
   - storage: "2U Storage", "4U Storage"
   - kvm: "1U KVM", "1U Console Drawer"
   - av-media: "1U Receiver", "2U Amplifier"
   - cooling: "1U Fan Panel"
   - blank: "1U Blank", "2U Blank"
   - other: "1U Generic", "2U Generic"

   Each device:
   - Deterministic ID: "starter-{category}-{height}u" (e.g., "starter-server-1u")
   - Appropriate category colour
   - Empty notes

2. Update createLayout in serialization.ts:
   - Initialize deviceLibrary with getStarterLibrary()
   - Starter devices behave like user-created devices
   - Saved in layout JSON

3. Write tests in src/tests/starterLibrary.test.ts:
   - Test: "getStarterLibrary returns 23 devices" (count from spec)
   - Test: "All categories have at least one starter device"
   - Test: "All devices have valid properties"
   - Test: "Device IDs are unique"
   - Test: "Devices have correct category colours"
   - Test: "New layout includes starter library"

Commit: "feat(data): add starter device library"
```

---

### Prompt 7.2 — File Save/Load

**Status:** ✅ Complete
**Dependencies:** 1.4, 5.4

```text
Implement file download and upload functionality.

1. Create src/lib/utils/file.ts:

   downloadLayout(layout: Layout, filename?: string): void
   - Serialize layout to JSON
   - Create Blob with application/json type
   - Create temporary <a> with download attribute
   - Trigger click and cleanup
   - Default filename: "{layout.name}.rackarr.json"

   openFilePicker(): Promise<File | null>
   - Create temporary <input type="file" accept=".json">
   - Trigger click
   - Return selected file or null if cancelled

   readLayoutFile(file: File): Promise<Layout>
   - Read file as text
   - Parse JSON
   - Validate structure
   - Return Layout or throw descriptive error

2. Wire into App:
   - Toolbar Save button → downloadLayout(get current layout)
   - Toolbar Load button → openFilePicker, then readLayoutFile, then loadLayout
   - Handle errors with toast notification (next prompt)
   - On successful load, mark as clean (not dirty)

3. Handle Ctrl/Cmd+S and Ctrl/Cmd+O shortcuts (wire in keyboard handler)

4. Write tests in src/tests/file.test.ts:
   - Test: "downloadLayout creates blob with correct content"
   - Test: "downloadLayout uses layout name in filename"
   - Test: "readLayoutFile parses valid JSON file"
   - Test: "readLayoutFile throws for invalid JSON"
   - Test: "readLayoutFile throws for invalid layout structure"
   - Test: "readLayoutFile throws with descriptive error message"

Commit: "feat(file): add save and load layout files"
```

---

## Phase 8: Feedback and Polish

### Prompt 8.1 — Toast Notifications

**Status:** ✅ Complete
**Dependencies:** 5.4

```text
Create toast notification system for user feedback.

1. Create src/lib/stores/toast.svelte.ts:

   Toast interface:
   - id: string
   - type: 'success' | 'error' | 'warning' | 'info'
   - message: string
   - duration: number (ms, 0 = permanent)

   State:
   - toasts: Toast[] ($state)

   Actions:
   - showToast(message: string, type: Toast['type'], duration?: number): string (returns id)
   - dismissToast(id: string): void
   - clearAllToasts(): void

   Auto-dismiss:
   - $effect for each toast with duration > 0
   - Remove after duration expires

2. Create src/lib/components/ToastContainer.svelte:
   - Fixed position (bottom-right or top-right)
   - Renders all toasts from store
   - Stacks multiple toasts

3. Create src/lib/components/Toast.svelte:
   Props: toast: Toast
   - Icon based on type (checkmark, X, warning, info)
   - Message text
   - Dismiss button (X)
   - Colour coding per type
   - Slide-in animation

4. Add ToastContainer to App.svelte

5. Integrate toasts for:
   - File load error: "Failed to load file: {error message}"
   - File load success: "Layout loaded successfully"
   - File save: "Layout saved" (brief)
   - Validation error: "Cannot resize rack with devices"

6. Write tests in src/tests/toast.test.ts:
   - Test: "showToast adds toast to store"
   - Test: "dismissToast removes toast from store"
   - Test: "Toast auto-dismisses after duration"
   - Test: "Toast with duration=0 does not auto-dismiss"
   - Test: "ToastContainer renders all toasts"
   - Test: "Toast shows correct icon for type"

Commit: "feat(feedback): add toast notification system"
```

---

### Prompt 8.2 — Keyboard Shortcuts

**Status:** ✅ Complete
**Dependencies:** 8.1, 4.2

```text
Implement all keyboard shortcuts from spec Section 8.

1. Create src/lib/utils/keyboard.ts:

   ShortcutHandler type:
   - key: string (e.g., 'Delete', 'ArrowUp')
   - ctrl?: boolean
   - meta?: boolean (for Mac Cmd)
   - shift?: boolean
   - action: () => void

   shouldIgnoreKeyboard(event: KeyboardEvent): boolean
   - Returns true if focus is in input/textarea
   - Returns true if in contenteditable

   matchesShortcut(event: KeyboardEvent, shortcut: ShortcutHandler): boolean
   - Checks key and modifiers

2. Create src/lib/components/KeyboardHandler.svelte:

   Listen to window keydown events
   Define shortcuts from spec:
   - Delete / Backspace → delete selected item
   - ArrowUp → move selected device up 1U
   - ArrowDown → move selected device down 1U
   - ArrowLeft → reorder selected rack left
   - ArrowRight → reorder selected rack right
   - Escape → deselect, close drawers
   - D → toggle device palette
   - Ctrl/Cmd+S → save layout
   - Ctrl/Cmd+O → load layout
   - Ctrl/Cmd+E → open export dialog
   - ? → show keyboard shortcuts help

   Prevent default for handled shortcuts
   Check shouldIgnoreKeyboard before handling

3. Add KeyboardHandler to App.svelte

4. Write tests in src/tests/keyboard.test.ts:
   - Test: "Delete key removes selected device"
   - Test: "Delete key removes selected rack (with confirmation)"
   - Test: "ArrowUp moves device up 1U"
   - Test: "ArrowDown moves device down 1U"
   - Test: "ArrowLeft reorders rack left"
   - Test: "ArrowRight reorders rack right"
   - Test: "Escape clears selection"
   - Test: "Escape closes open drawers"
   - Test: "D toggles palette drawer"
   - Test: "Ctrl+S triggers save"
   - Test: "Keyboard ignored when input focused"
   - Test: "? opens shortcuts help"

Commit: "feat(keyboard): add all keyboard shortcuts"
```

---

### Prompt 8.3 — Rack Reordering (Drag + Keyboard)

**Status:** ✅ Complete
**Dependencies:** 8.2, 4.3

```text
Implement rack reordering via drag-and-drop and keyboard.

1. Update Canvas.svelte for rack drag reordering:

   Make rack containers draggable by header area:
   - Drag handle on rack frame/header (not interior)
   - on:dragstart → set data indicating rack reorder
   - Differentiate from device drag

   Drop indicators:
   - Show vertical line between racks for drop position
   - Highlight valid drop positions

   on:drop → calculate new position, call reorderRacks

2. Update Rack.svelte:
   - Add distinct drag handle area at top
   - Different cursor for rack drag vs device drag

3. Keyboard reordering (already in keyboard handler):
   - ArrowLeft: move selected rack one position left
   - ArrowRight: move selected rack one position right
   - At edges (first/last position), no-op

4. Update layout store reorderRacks:
   - Takes array of rack IDs in new order
   - OR takes fromIndex/toIndex and swaps

5. Write tests in src/tests/rack-reorder.test.ts:
   - Test: "Dragging rack header shows drop indicator"
   - Test: "Dropping rack reorders correctly"
   - Test: "ArrowLeft moves first rack nowhere (no-op)"
   - Test: "ArrowLeft moves second rack to first position"
   - Test: "ArrowRight moves last rack nowhere (no-op)"
   - Test: "ArrowRight moves first rack to second position"
   - Test: "All devices move with their rack"

Commit: "feat(canvas): add rack reordering via drag and keyboard"
```

---

## Phase 9: Export

### Prompt 9.1 — Export Dialog

**Status:** ✅ Complete
**Dependencies:** 6.1

```text
Create the export dialog with format and option selection.

1. Create src/lib/components/ExportDialog.svelte:

   Props:
   - open: boolean
   - racks: Rack[]
   - selectedRackId: string | null

   Form fields (from spec Section 11.2):
   - Format: dropdown (PNG, JPEG, SVG, PDF)
   - Scope: dropdown
     - "All racks"
     - "Selected rack" (disabled if none selected)
   - Include rack names: checkbox (default: true)
   - Include legend: checkbox (default: false)
   - Background: dropdown
     - "Dark" / "Light"
     - "Transparent" (only enabled for SVG)

   Preview (optional for v0.1):
   - Small thumbnail preview if feasible

   Actions:
   - "Export" button → dispatch('export', options)
   - "Cancel" button → dispatch('cancel')

2. Export options interface:
   - format: 'png' | 'jpeg' | 'svg' | 'pdf'
   - scope: 'all' | 'selected'
   - includeNames: boolean
   - includeLegend: boolean
   - background: 'dark' | 'light' | 'transparent'

3. Write tests in src/tests/ExportDialog.test.ts:
   - Test: "Dialog shows all format options"
   - Test: "Selected rack scope disabled when none selected"
   - Test: "Transparent background only enabled for SVG"
   - Test: "Export button dispatches event with options"
   - Test: "Cancel button dispatches cancel event"
   - Test: "Dialog closes on export"

Commit: "feat(export): add export dialog with options"
```

---

### Prompt 9.2 — Export Implementation

**Status:** ✅ Complete
**Dependencies:** 9.1, 3.2

```text
Implement export functionality for all formats.

1. Create src/lib/utils/export.ts:

   ExportOptions interface (from dialog)

   generateExportSVG(racks: Rack[], deviceLibrary: Device[], options: ExportOptions): SVGElement
   - Clone rack SVGs (or regenerate with export styling)
   - Apply background colour
   - Add rack names if enabled
   - Add legend if enabled
   - Return complete SVG element

   exportAsSVG(svg: SVGElement): string
   - Serialize SVG to string
   - Add XML declaration

   exportAsPNG(svg: SVGElement, scale?: number): Promise<Blob>
   - Draw SVG to canvas
   - Convert canvas to PNG blob

   exportAsJPEG(svg: SVGElement, scale?: number, quality?: number): Promise<Blob>
   - Draw SVG to canvas
   - Convert canvas to JPEG blob

   exportAsPDF(svg: SVGElement): Promise<Blob>
   - Use jspdf or similar library
   - Embed SVG/image in PDF
   - Return blob

   downloadBlob(blob: Blob, filename: string): void
   - Create download link and trigger

2. Create src/lib/components/ExportLegend.svelte:
   - List of devices with name and colour swatch
   - Only unique devices (by libraryId)
   - Ordered by category

3. Wire ExportDialog into App:
   - Toolbar Export button opens dialog
   - Ctrl+E opens dialog
   - On export, generate and download

4. Install jspdf if needed:
   npm install jspdf

5. Write tests in src/tests/export.test.ts:
   - Test: "generateExportSVG creates valid SVG"
   - Test: "generateExportSVG includes rack names when enabled"
   - Test: "generateExportSVG includes legend when enabled"
   - Test: "generateExportSVG applies background colour"
   - Test: "exportAsPNG creates valid PNG blob"
   - Test: "exportAsJPEG creates valid JPEG blob"
   - Test: "exportAsSVG returns valid SVG string"
   - Test: "Scope 'selected' only includes selected rack"

Commit: "feat(export): implement PNG, JPEG, SVG, PDF export"
```

---

## Phase 10: Help and Accessibility

### Prompt 10.1 — Help Panel

**Status:** ✅ Complete
**Dependencies:** 6.1

```text
Create the Help/About panel.

1. Create src/lib/components/HelpPanel.svelte:

   Sections:
   - Header: "Rackarr" + version (v0.1.0)
   - Description: Brief app description
   - Keyboard shortcuts: Table from spec Section 8
   - Links:
     - GitHub repository (primary: Forgejo URL)
     - GitHub mirror
   - License: "MIT License"
   - Credits (if any)

   Features:
   - Opens as dialog/modal
   - Escape to close
   - Links open in new tab (target="_blank")
   - Styled for dark/light themes

2. Create src/lib/components/ShortcutsTable.svelte:
   - Two-column table: Key | Action
   - All shortcuts from spec Section 8
   - Styled consistently

3. Wire into App:
   - Toolbar Help button opens panel
   - ? key opens panel
   - Clicking logo/brand opens panel

4. Create src/lib/version.ts:
   - Export VERSION = '0.1.0'

5. Write tests in src/tests/HelpPanel.test.ts:
   - Test: "HelpPanel shows app name and version"
   - Test: "HelpPanel shows keyboard shortcuts table"
   - Test: "HelpPanel shows repository links"
   - Test: "HelpPanel shows license"
   - Test: "Links have target=_blank"
   - Test: "Escape closes panel"

Commit: "feat(help): add Help/About panel"
```

---

### Prompt 10.2 — Accessibility Audit

**Status:** ✅ Complete
**Dependencies:** 10.1

```text
Audit and improve accessibility compliance per spec Section 13.

1. Semantic HTML audit:
   - Replace any <div onclick> with <button>
   - Ensure proper heading hierarchy (h1, h2, h3)
   - Add landmark regions (<main>, <nav>, <aside>)
   - Ensure lists use <ul>/<ol>/<li>

2. Focus management:
   - Visible focus indicators on ALL interactive elements
   - Consistent focus ring style (2px outline, --colour-selection)
   - Tab order is logical (left-to-right, top-to-bottom)
   - Focus returns to trigger after dialog closes

3. ARIA attributes:
   - aria-label on all icon-only buttons
   - aria-expanded on toggle buttons (palette, theme)
   - aria-selected on selected items
   - role="dialog" and aria-modal on dialogs
   - aria-live="polite" for toast container

4. Keyboard navigation verification:
   - All UI reachable via keyboard
   - No keyboard traps
   - Escape closes modals/drawers

5. Colour contrast check:
   - Test with WebAIM contrast checker
   - Text: minimum 4.5:1 ratio
   - UI components: minimum 3:1 ratio
   - Adjust colours if needed

6. Write accessibility tests in src/tests/accessibility.test.ts:
   - Test: "All buttons have accessible names"
   - Test: "All images/icons have alt text or aria-label"
   - Test: "Focus indicators visible on keyboard navigation"
   - Test: "Tab order follows logical flow"
   - Test: "Dialogs trap focus correctly"
   - Test: "Toasts announced to screen readers"

Commit: "feat(a11y): accessibility improvements"
```

---

### Prompt 10.3 — Category Icons

**Status:** ✅ Complete
**Dependencies:** 3.2

```text
Create proper SVG icons for all device categories.

1. Create src/lib/components/icons/categories/:
   - IconServer.svelte (rectangle with horizontal lines)
   - IconNetwork.svelte (grid/switch shape)
   - IconPatchPanel.svelte (row of ports)
   - IconPower.svelte (lightning bolt or plug)
   - IconStorage.svelte (stacked disks)
   - IconKvm.svelte (monitor with keyboard)
   - IconAvMedia.svelte (speaker or AV symbol)
   - IconCooling.svelte (fan blades)
   - IconBlank.svelte (empty rectangle)
   - IconOther.svelte (question mark or generic)

   Each icon:
   - Props: size: number (default 16)
   - Simple, recognizable shapes
   - Single colour (currentColor for flexibility)
   - viewBox normalized

2. Update CategoryIcon.svelte:
   - Dynamic import based on category
   - Pass size prop through
   - Fallback to IconOther for unknown

3. Update RackDevice.svelte:
   - Add category icon in corner (top-left or top-right)
   - Icon colour contrasts with device colour
   - Small size (12-14px)

4. Update DevicePaletteItem.svelte:
   - Category icon next to device name
   - Consistent sizing

5. Write tests in src/tests/CategoryIcons.test.ts:
   - Test: "CategoryIcon renders correct icon for each category"
   - Test: "Icons render at specified size"
   - Test: "Icons have accessible role='img'"
   - Test: "Unknown category shows fallback icon"

Commit: "feat(icons): add category icons for devices"
```

---

## Phase 11: E2E and Final Integration

### Prompt 11.1 — Welcome State and Application Flow

**Status:** ✅ Complete
**Dependencies:** 6.2, 7.2

```text
Implement the initial load flow and welcome state.

1. Create src/lib/components/WelcomeScreen.svelte:

   Display when no racks exist:
   - App logo and name
   - Welcome message
   - Two primary actions:
     - "New Rack" button (large, primary)
     - "Load Layout" button (secondary)
   - Brief description of app purpose

   Styled for both themes

2. Update App.svelte for initial load flow:

   On mount:
   - Load theme from localStorage
   - Check for session storage
   - If session exists: show restore prompt? (or just load - per spec, no restore prompt)
   - If no session: show welcome screen

   After first rack created:
   - Hide welcome screen
   - Show canvas with rack

3. Zero racks state handling:
   - When last rack deleted, auto-open new rack form
   - OR show welcome screen again

4. Write tests in src/tests/WelcomeScreen.test.ts:
   - Test: "Welcome screen shows on initial load with no racks"
   - Test: "New Rack button opens form"
   - Test: "Load button opens file picker"
   - Test: "Welcome screen hidden after rack created"
   - Test: "Welcome screen shows after all racks deleted"

Commit: "feat(welcome): add initial load and welcome state"
```

---

### Prompt 11.2 — E2E Tests

**Status:** ✅ Complete
**Dependencies:** 11.1, 9.2

```text
Write comprehensive E2E tests using Playwright.

1. Create tests/e2e/basic-workflow.spec.ts:
   - Test: Create new rack (18U, named "Main Rack")
   - Test: Verify rack appears on canvas
   - Test: Drag device from palette to rack
   - Test: Verify device appears in rack at correct position
   - Test: Move device within rack (drag)
   - Test: Delete device from rack
   - Test: Delete rack

2. Create tests/e2e/persistence.spec.ts:
   - Test: Save layout downloads JSON file
   - Test: File contains correct layout structure
   - Test: Load layout from file
   - Test: Loaded layout displays correctly
   - Test: Session storage preserves work on refresh
   - Test: Unsaved changes warning on close

3. Create tests/e2e/multi-rack.spec.ts:
   - Test: Create 3 racks of different heights
   - Test: Racks align at bottom
   - Test: Move device between racks
   - Test: Reorder racks via drag
   - Test: Reorder racks via keyboard
   - Test: Maximum 6 racks enforced

4. Create tests/e2e/export.spec.ts:
   - Test: Export dialog opens
   - Test: Export PNG downloads file
   - Test: Export SVG downloads file
   - Test: Export with legend includes device list
   - Test: Export selected rack only

5. Create tests/e2e/keyboard.spec.ts:
   - Test: Delete key removes selected item
   - Test: Arrow keys move device
   - Test: Escape clears selection and closes drawers
   - Test: D toggles palette
   - Test: Ctrl+S saves
   - Test: ? opens help

6. Configure Playwright in playwright.config.ts

7. Add npm script: "test:e2e": "playwright test"

Commit: "test(e2e): comprehensive E2E test suite"
```

---

### Prompt 11.3 — Final Integration and Polish

**Status:** ✅ Complete
**Dependencies:** 11.2

```text
Final polish pass and integration verification.

1. Visual polish:
   - Consistent spacing throughout
   - Smooth animations (drawer slide, toast appear)
   - Loading states where needed
   - Empty states styled nicely

2. Edge cases:
   - Very long device names (truncation)
   - Very long rack names (truncation)
   - Maximum height rack (100U) renders correctly
   - 6 racks with horizontal scroll works
   - Rapid clicking doesn't break state

3. Error handling:
   - All errors show user-friendly messages
   - No unhandled exceptions
   - Console is clean (no errors/warnings)

4. Performance check:
   - 6 racks with multiple devices each
   - Drag and drop remains smooth
   - No memory leaks

5. Run full test suite:
   - npm run test (unit + component)
   - npm run test:e2e (Playwright)
   - All tests pass

6. Code cleanup:
   - Remove console.log statements
   - Remove TODO comments (or document)
   - No TypeScript errors
   - No linting warnings

Commit: "chore: final polish and integration"
```

---

## Phase 12: Deployment

### Prompt 12.1 — Docker Configuration

**Status:** ✅ Complete
**Dependencies:** 11.3

```text
Create Docker deployment configuration.

1. Create Dockerfile:

   # Build stage
   FROM node:20-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   # Production stage
   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]

2. Create nginx.conf:
   - Serve static files from /usr/share/nginx/html
   - SPA fallback (all routes to index.html)
   - Gzip compression
   - Cache headers for static assets

3. Create docker-compose.yml:
   version: '3.8'
   services:
     rackarr:
       build: .
       ports:
         - "8080:80"
       restart: unless-stopped

4. Create .dockerignore:
   node_modules
   .git
   *.md
   tests
   .husky
   coverage

5. Test locally:
   docker build -t rackarr .
   docker run -p 8080:80 rackarr
   Verify app works at http://localhost:8080

Commit: "chore(docker): add Docker deployment configuration"
```

---

### Prompt 12.2 — Documentation and README

**Status:** ✅ Complete
**Dependencies:** 12.1

```text
Create project documentation.

1. Create README.md:
   - Project title and description
   - Features list (from spec)
   - Screenshot placeholder
   - Quick start:
     - Development: npm install, npm run dev
     - Docker: docker-compose up
   - Keyboard shortcuts reference
   - Tech stack
   - Contributing guidelines
   - License (MIT)
   - Repository links (primary + mirror)

2. Create CHANGELOG.md:
   - v0.1.0 (date)
   - Initial release features list

3. Create LICENSE:
   - MIT license text
   - Copyright year and author

4. Create CONTRIBUTING.md:
   - Development setup
   - Code style (enforced by linting)
   - Testing requirements
   - PR process
   - Issue templates

5. Verify package.json:
   - name: "rackarr"
   - version: "0.1.0"
   - description accurate
   - repository URLs
   - license: "MIT"

Commit: "docs: add README, CHANGELOG, LICENSE, CONTRIBUTING"
```

---

### Prompt 12.3 — Final Review and Release

**Status:** ✅ Complete
**Dependencies:** 12.2

```text
Final checks before v0.1 release.

1. Run all tests:
   npm run test (all pass)
   npm run test:e2e (all pass)

2. Build verification:
   npm run build (succeeds)
   npm run preview (works correctly)
   Test in Chrome, Firefox, Safari, Edge

3. Success criteria checklist (spec Section 20):
   [ ] User can create a rack with custom height
   [ ] User can add devices from palette via drag-and-drop
   [ ] Devices snap to U positions, collisions blocked
   [ ] User can reposition devices within and across racks
   [ ] Multiple racks supported (up to 6)
   [ ] Layout saves to JSON and loads correctly
   [ ] Export produces PNG/JPEG/SVG/PDF
   [ ] Dark/light theme works
   [ ] All keyboard shortcuts functional
   [ ] Runs as static files in Docker container

4. Docker verification:
   docker build -t rackarr .
   docker run -p 8080:80 rackarr
   Full functionality test at http://localhost:8080

5. Final cleanup:
   - No console.log statements
   - No TODO comments remaining
   - All TypeScript strict mode passes
   - All linting passes

6. Create release:
   git tag v0.1.0
   git push origin v0.1.0
   Push to primary (Forgejo): git push origin main
   Push to mirror (GitHub): git push github main

Commit: "chore: v0.1.0 release"
```

---

## Progress Tracker

| Phase                 | Prompts            | Status |
| --------------------- | ------------------ | ------ |
| 0. Bootstrap          | 0.1, 0.2           | ✅     |
| 1. Business Logic     | 1.1, 1.2, 1.3, 1.4 | ✅     |
| 2. State Management   | 2.1, 2.2, 2.3, 2.4 | ✅     |
| 3. Core Components    | 3.1, 3.2, 3.3, 3.4 | ✅     |
| 4. Drag-and-Drop      | 4.1, 4.2, 4.3      | ✅     |
| 5. App Shell          | 5.1, 5.2, 5.3, 5.4 | ✅     |
| 6. Forms & Dialogs    | 6.1, 6.2, 6.3, 6.4 | ✅     |
| 7. Save/Load          | 7.1, 7.2           | ✅     |
| 8. Feedback & Polish  | 8.1, 8.2, 8.3      | ✅     |
| 9. Export             | 9.1, 9.2           | ✅     |
| 10. Help & A11y       | 10.1, 10.2, 10.3   | ⬜     |
| 11. E2E & Integration | 11.1, 11.2, 11.3   | ⬜     |
| 12. Deployment        | 12.1, 12.2, 12.3   | ⬜     |

**Total Prompts:** 29  
**Estimated Time:** 5-7 hours with Claude Code

---

## Dependency Graph

```
0.1 ──┬── 0.2 ──┬── 1.1 ── 1.2 ── 1.3 ── 1.4 ──┬── 2.1 ──┬── 2.2
      │         │                               │         │
      │         └── 2.3                         │         └── 5.3
      │                                         │
      └── 7.1                                   └── 2.4

2.1 + 2.3 ── 3.1 ── 3.2 ──┬── 3.3 ──┬── 4.1 ── 4.2 ── 4.3
                          │         │
                          │         └── 3.4 ── 4.1
                          │
                          └── 10.3

5.1 ── 5.2 ──┬── 5.3 ── 5.4
             │
             └── 6.1 ──┬── 6.2
                       │
                       ├── 6.3
                       │
                       ├── 6.4
                       │
                       ├── 9.1 ── 9.2
                       │
                       └── 10.1

5.4 + 1.4 ── 7.2

5.4 ── 8.1 ── 8.2 ── 8.3

10.1 ── 10.2

6.2 + 7.2 ── 11.1 ── 11.2 ── 11.3 ── 12.1 ── 12.2 ── 12.3
```

---

## Execution Notes

### Before Starting

1. Ensure Node.js 20+ installed
2. Have spec.md open for reference
3. Create CLAUDE.md in first prompt

### During Execution

1. Write tests FIRST (TDD)
2. Run tests after each change
3. Commit after each successful prompt
4. Mark prompts complete in this file
5. Pause for review at phase boundaries

### If Stuck

1. Re-read the prompt and spec
2. Check test failures for clues
3. Ask Claude to explain its approach
4. Consider splitting prompt into smaller steps
5. Run `npm run test -- --reporter=verbose` for detailed output

### Quality Gates (Pre-commit)

- ESLint must pass
- Prettier formatting applied
- All tests must pass
- No TypeScript errors

---

_Generated following Harper Reed LLM Codegen Methodology_
_Merged from two independent planning passes for optimal coverage_
