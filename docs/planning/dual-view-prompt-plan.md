# Dual-View Rack Display — Prompt Plan

**Spec:** `dual-view-spec.md`
**Target Version:** v0.4.0
**Approach:** TDD (Tests First)

---

## Phase 1: Dual-View Container

### Prompt 1: RackDualView Component Tests

Write unit tests for a new `RackDualView.svelte` component that:

1. Renders a container with class `rack-dual-view`
2. Contains two rack views (classes `rack-front` and `rack-rear`)
3. Displays the rack name once, centered above both views
4. Shows "FRONT" label above the front view
5. Shows "REAR" label above the rear view
6. Both views have the same height (rack.height \* U_HEIGHT)
7. Selection state applies to the whole container (aria-selected)
8. Dispatches `select` event when either view is clicked

Create tests in `src/tests/RackDualView.test.ts`.

**Do not implement the component yet.**

---

### Prompt 2: RackDualView Component Implementation

Implement `RackDualView.svelte` to pass all tests from Prompt 1:

1. Create new file `src/lib/components/RackDualView.svelte`
2. Accept props: `rack`, `deviceLibrary`, `selected`, `selectedDeviceId`, `displayMode`, `showLabelsOnImages`
3. Render two `Rack` components side-by-side
4. Add `faceFilter` prop to each Rack (we'll implement this in Prompt 4)
5. Display shared rack name above both views
6. Add "FRONT" and "REAR" labels
7. Handle click events to dispatch selection

Run tests after implementation.

---

### Prompt 3: Rack Face Filter Tests

Write unit tests for `Rack.svelte` with a new `faceFilter` prop:

1. When `faceFilter='front'`, only shows devices with `face='front'` or `face='both'`
2. When `faceFilter='rear'`, only shows devices with `face='rear'` or `face='both'`
3. When `faceFilter` is undefined, shows all devices (backwards compat)
4. Add test for `viewLabel` prop rendering ("FRONT" or "REAR")
5. Test that rear view mirrors U labels to the right side

Add tests to existing `src/tests/Rack-component.test.ts`.

**Do not implement yet.**

---

### Prompt 4: Rack Face Filter Implementation

Modify `Rack.svelte` to:

1. Add optional `faceFilter` prop: `'front' | 'rear' | undefined`
2. Filter `visibleDevices` by face when `faceFilter` is set
3. Add optional `viewLabel` prop for label above rack
4. Mirror U labels to right rail when `faceFilter='rear'`
5. Remove `RackViewToggle` from the component
6. Keep internal `rack.view` for backwards compatibility with export

Run tests after implementation.

---

### Prompt 5: Canvas Integration Tests

Write integration tests for `Canvas.svelte` using `RackDualView`:

1. Canvas renders `RackDualView` instead of `Rack`
2. Both front and rear views are visible
3. Rack selection works through either view
4. Device selection works in either view
5. Remove/update any tests that depend on `RackViewToggle`

Update `src/tests/Canvas.test.ts`.

**Do not implement yet.**

---

### Prompt 6: Canvas Integration Implementation

Modify `Canvas.svelte` to:

1. Import and use `RackDualView` instead of `Rack`
2. Remove `handleRackViewChange` handler
3. Pass all required props to `RackDualView`
4. Update selection handling for dual-view
5. Remove any view toggle related code

Run tests after implementation.

---

## Phase 2: Blocked Slot Indicators

### Prompt 7: Blocked Slots Utility Tests

Write unit tests for a new `getBlockedSlots()` utility function:

1. Returns empty array when rack has no devices
2. Returns empty array when all devices are on same face as view
3. Returns blocked range for full-depth front device when checking rear view
4. Returns blocked range for full-depth rear device when checking front view
5. Does NOT return blocked range for half-depth devices
6. Returns blocked range for `face='both'` devices on either view
7. Handles multiple devices with overlapping/adjacent ranges
8. Correctly calculates U ranges (bottom and top positions)

Create tests in `src/tests/blocked-slots.test.ts`.

**Do not implement yet.**

---

### Prompt 8: Blocked Slots Utility Implementation

Create `src/lib/utils/blocked-slots.ts`:

1. Export `getBlockedSlots(rack, view, deviceLibrary)` function
2. Returns array of `URange` objects (`{ bottom: number, top: number }`)
3. Filter devices that block the specified view
4. Calculate blocked ranges based on device position and height
5. Consider `is_full_depth` property (default true if undefined)

Run tests after implementation.

---

### Prompt 9: Blocked Slots Rendering Tests

Write tests for blocked slot rendering in `Rack.svelte`:

1. Blocked slots are rendered as rect elements with class `blocked-slot`
2. Blocked slot rects have correct position (Y coordinate)
3. Blocked slot rects have correct height (U range \* U_HEIGHT)
4. Blocked slots are rendered BEFORE devices (lower z-index)
5. Blocked slots have appropriate opacity
6. No blocked slots rendered when `faceFilter` is undefined

Add tests to `src/tests/Rack-component.test.ts`.

**Do not implement yet.**

---

### Prompt 10: Blocked Slots Rendering Implementation

Modify `Rack.svelte` to:

1. Import `getBlockedSlots` utility
2. Calculate blocked slots based on `faceFilter`
3. Render blocked slot overlay rects before device rects
4. Apply design token `--colour-rack-blocked`
5. Position correctly using same coordinate system as devices

Run tests after implementation.

---

### Prompt 11: Design Tokens for Blocked Slots

Add design tokens to `src/lib/styles/tokens.css`:

1. `--colour-rack-blocked` for dark theme (subtle gray)
2. `--colour-rack-blocked` override for light theme
3. Consider optional diagonal stripe pattern

Run visual test (manual) after implementation.

---

### Prompt 12: Drop Preview on Blocked Slots Tests

Write tests for drop preview behavior on blocked slots:

1. Drop preview shows error state when over blocked slot
2. Drop is rejected on blocked slot
3. Clear feedback message for blocked drop

Add tests to `src/tests/dragdrop.test.ts` or create new file.

**Do not implement yet.**

---

### Prompt 13: Drop Preview on Blocked Slots Implementation

Modify drop handling in `Rack.svelte`:

1. Check if drop position overlaps with blocked slots
2. Show error feedback for blocked drops
3. Reject the drop with appropriate message
4. Integrate with existing collision detection

Run tests after implementation.

---

## Phase 3: Polish

### Prompt 14: Export Support for Both Views

Update export functionality:

1. Add `exportView` option to ExportOptions ('front' | 'rear' | 'both')
2. Modify `generateExportSVG` to handle 'both' option
3. When 'both', render front and rear side-by-side in export SVG
4. Update export dialog UI to show view selection
5. Write tests for export with both views

---

### Prompt 15: Cleanup and Documentation

Final cleanup tasks:

1. Remove `RackViewToggle.svelte` if no longer needed anywhere
2. Remove view toggle related code from stores
3. Update Help panel keyboard shortcuts section
4. Update any remaining tests that reference view toggle
5. Run full test suite and fix any failures

---

### Prompt 16: E2E Tests

Write Playwright E2E tests:

1. Verify dual-view renders correctly on page load
2. Test drag-drop to front view → device has face='front'
3. Test drag-drop to rear view → device has face='rear'
4. Test blocked slot visual appears for full-depth devices
5. Test export with both views

---

## Completion Checklist

After all prompts are complete, verify:

- [ ] `npm run test:run` — All unit tests pass
- [ ] `npm run test:e2e` — All E2E tests pass
- [ ] `npm run check` — No new TypeScript errors
- [ ] `npm run lint` — No lint errors
- [ ] Manual test: UI looks correct in browser
- [ ] Manual test: Export with both views works
- [ ] Manual test: Blocked slots visible and clear

---

## Prompt Execution Notes

- Execute prompts sequentially
- Run tests after each implementation prompt
- Commit after each successful prompt
- If tests fail after 2 attempts, document in blockers.md
- Do not skip prompts or combine them

---

## Changelog

| Date       | Change              |
| ---------- | ------------------- |
| 2025-12-04 | Initial prompt plan |
