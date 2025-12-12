# PROMPT-PLAN.md — Issue 2: Front/Rear Mounting Logic

**Created:** 2025-12-12
**Scope:** Issue 2.1 (0.5U movement) + Issue 2.2 (front+rear slot sharing)
**User Decision:** Half-depth is opt-in (`is_full_depth=true` by default)

---

## Overview

This prompt plan fixes the front/rear mounting logic bugs:

- **2.1:** Arrow key movement increments by ±1 instead of ±device.u_height
- **2.2:** Cannot mount rear device when front device exists at same U position

**Root Cause:** The layout store has duplicate inline collision logic that bypasses the correct face-aware utilities in `collision.ts`.

---

## Files to Modify

| File                                        | Changes                                          |
| ------------------------------------------- | ------------------------------------------------ |
| `src/lib/utils/collision.ts`                | Add depth parameters to `doFacesCollide()`       |
| `src/lib/stores/layout.svelte.ts`           | Replace inline collision with `canPlaceDevice()` |
| `src/lib/components/KeyboardHandler.svelte` | Fix movement increment, use `canPlaceDevice()`   |
| `src/lib/data/starterLibrary.ts`            | Add `is_full_depth: false` to half-depth devices |
| `src/tests/collision.test.ts`               | Add depth-aware collision tests                  |
| `docs/planning/SPEC.md`                     | Document collision rules                         |
| `docs/planning/ROADMAP.md`                  | Mark issues complete                             |

---

## Prompts

Execute these prompts sequentially. Each builds on the previous.

---

### Prompt 1: Add depth-aware collision tests (TDD)

```text
We're fixing Issue 2 (Front/Rear Mounting Logic) in Rackarr. Start with TDD by writing tests first.

**Context:**
- `src/lib/utils/collision.ts` has `doFacesCollide(faceA, faceB)` that checks if faces collide
- It currently ignores `is_full_depth` property, which means:
  - Two half-depth devices on opposite faces should NOT collide
  - A full-depth device should collide with ANY device at the same U position

**Task:** Add tests to `src/tests/collision.test.ts` for depth-aware collision.

**Test cases to add:**

1. `doFacesCollide()` with depth parameters:
   - front + front (any depth) → true
   - rear + rear (any depth) → true
   - front(half) + rear(half) → false (NEW BEHAVIOR)
   - front(full) + rear(any) → true
   - front(any) + rear(full) → true
   - both + any → true

2. `canPlaceDevice()` with depth awareness:
   - Place half-depth rear device when half-depth front device exists at same U → should succeed
   - Place half-depth rear device when full-depth front device exists at same U → should fail

Run the tests with `npm run test:run -- collision`. They should FAIL because the implementation doesn't exist yet.
```

---

### Prompt 2: Implement depth-aware collision logic

````text
Now implement the depth-aware collision logic to make the tests from Prompt 1 pass.

**File:** `src/lib/utils/collision.ts`

**Changes:**

1. Update `doFacesCollide()` signature to accept optional depth parameters:
   ```typescript
   export function doFacesCollide(
     faceA: DeviceFace,
     faceB: DeviceFace,
     isFullDepthA: boolean = true,
     isFullDepthB: boolean = true
   ): boolean
````

2. Update logic:
   - If either face is 'both' → return true
   - If same face → return true
   - If opposite faces AND either is full-depth → return true
   - If opposite faces AND both are half-depth → return false

3. Update `canPlaceDevice()` to:
   - Look up the `is_full_depth` property for both the new device and existing devices
   - Pass depth info to `doFacesCollide()`
   - Note: `canPlaceDevice` receives `deviceHeight` but not the full DeviceType. Add a new optional parameter `isFullDepth: boolean = true` to pass this info.

4. Update `findCollisions()` similarly if needed.

Run `npm run test:run -- collision` to verify all tests pass.

````

---

### Prompt 3: Add layout store placement tests (TDD)

```text
Add tests to verify that the layout store's placement functions respect face and depth.

**File:** `src/tests/layout-store.test.ts` (create if doesn't exist, or add to existing)

**Test cases:**

1. `placeDeviceRecorded()` face awareness:
   - Place front device at U5
   - Place rear device at U5 with half-depth device type → should succeed
   - Verify both devices exist at position 5

2. `placeDeviceRecorded()` full-depth blocking:
   - Place full-depth front device at U5
   - Place rear device at U5 → should fail

3. `moveDeviceRecorded()` face awareness:
   - Place front device at U5, rear device at U3
   - Move rear device to U5 → should succeed (they don't collide)

These tests will FAIL because layout.svelte.ts uses inline collision logic that ignores face.

Run `npm run test:run -- layout` to confirm failures.
````

---

### Prompt 4: Fix layout store collision logic

````text
Fix the layout store to use the collision utilities instead of inline logic.

**File:** `src/lib/stores/layout.svelte.ts`

**Changes:**

1. Add import at top:
   ```typescript
   import { canPlaceDevice } from '$lib/utils/collision';
````

2. In `placeDeviceRecorded()` (around line 829-842):
   - Remove the entire for-loop that does inline collision checking
   - Replace with:

   ```typescript
   const isFullDepth = deviceType.is_full_depth !== false;
   if (
   	!canPlaceDevice(
   		layout.rack,
   		layout.device_types,
   		deviceType.u_height,
   		position,
   		undefined,
   		face,
   		isFullDepth
   	)
   ) {
   	return false;
   }
   ```

3. In `moveDeviceRecorded()` (around line 877-893):
   - Remove the for-loop collision check
   - Replace with:
   ```typescript
   const isFullDepth = deviceType.is_full_depth !== false;
   if (
   	!canPlaceDevice(
   		layout.rack,
   		layout.device_types,
   		deviceType.u_height,
   		newPosition,
   		deviceIndex,
   		device.face,
   		isFullDepth
   	)
   ) {
   	return false;
   }
   ```

Note: You'll need to update the `canPlaceDevice()` signature in collision.ts to accept the `isFullDepth` parameter for the NEW device being placed.

Run `npm run test:run` to verify all tests pass.

````

---

### Prompt 5: Add 0.5U movement tests (TDD)

```text
Add tests for arrow key movement with 0.5U devices.

**File:** `src/tests/keyboard-handler.test.ts` (create or add to existing component tests)

Since KeyboardHandler is a Svelte component, we may need integration tests or to test the movement logic separately.

**Alternative approach:** Add tests to `src/tests/layout-store.test.ts` for the movement increment behavior:

1. Test 0.5U device movement:
   - Place 0.5U device at position 1
   - Call moveDeviceRecorded with newPosition 1.5 → should succeed
   - Verify device.position === 1.5

2. Test movement respects face:
   - Place front device at U5
   - Place rear device at U3
   - Move rear device to U5 → should succeed

For KeyboardHandler specifically, consider E2E tests in Playwright:
- Place 0.5U device
- Press arrow up
- Verify device moved to 1.5, not 2

Run tests to see which fail (the logic is currently hardcoded to ±1 increments).
````

---

### Prompt 6: Fix KeyboardHandler movement logic

````text
Fix the arrow key movement in KeyboardHandler to use device height as increment and respect face.

**File:** `src/lib/components/KeyboardHandler.svelte`

**Changes:**

1. Add import at top:
   ```typescript
   import { canPlaceDevice } from '$lib/utils/collision';
````

2. In `moveSelectedDevice()` function (around line 242):

   Change:

   ```typescript
   let newPosition = placedDevice.position + direction;
   ```

   To:

   ```typescript
   const moveIncrement = device.u_height;
   let newPosition = placedDevice.position + direction * moveIncrement;
   ```

3. Replace the inline collision check (lines 247-259) with canPlaceDevice:

   ```typescript
   const isFullDepth = device.is_full_depth !== false;
   const isValid = canPlaceDevice(
   	rack,
   	layoutStore.device_types,
   	device.u_height,
   	newPosition,
   	selectionStore.selectedDeviceIndex!,
   	placedDevice.face,
   	isFullDepth
   );

   if (isValid) {
   	layoutStore.moveDevice(
   		selectionStore.selectedRackId!,
   		selectionStore.selectedDeviceIndex!,
   		newPosition
   	);
   	return;
   }
   ```

4. Update the leapfrog while-loop increment (line 272):
   ```typescript
   newPosition += direction * moveIncrement;
   ```

Run `npm run test:run` and `npm run test:e2e` to verify.

````

---

### Prompt 7: Update starter library with depth properties

```text
Add `is_full_depth` property to starter library devices.

**File:** `src/lib/data/starterLibrary.ts`

**Changes:**

1. Update `StarterDeviceSpec` interface:
   ```typescript
   interface StarterDeviceSpec {
     name: string;
     u_height: number;
     category: DeviceCategory;
     is_full_depth?: boolean;  // Add this
   }
````

2. Add `is_full_depth: false` to these devices (they don't occupy full rack depth):
   - Blank panels: '0.5U Blank', '1U Blank', '2U Blank'
   - Shelves: '1U Shelf', '2U Shelf'
   - Cable management: '1U Brush Panel', '1U Cable Management'
   - Patch panels: '24-Port Patch Panel', '48-Port Patch Panel'

3. Update `getStarterLibrary()` to include `is_full_depth` in output:
   ```typescript
   export function getStarterLibrary(): DeviceType[] {
   	return STARTER_DEVICES.map((spec) => ({
   		slug: slugify(spec.name),
   		u_height: spec.u_height,
   		model: spec.name,
   		is_full_depth: spec.is_full_depth, // Add this (undefined = true default)
   		rackarr: {
   			colour: CATEGORY_COLOURS[spec.category],
   			category: spec.category
   		}
   	}));
   }
   ```

Run `npm run test:run` to verify starter library tests still pass.

````

---

### Prompt 8: Update ROADMAP.md and run final tests

```text
Update the ROADMAP.md to mark completed issues and run final verification.

**File:** `docs/planning/ROADMAP.md`

**Changes:**

1. Mark Issue 1 as complete (all sub-issues fixed):
   - Add `[x]` markers or move to a "Resolved" section

2. Mark Issue 3.1 as complete (KVM capitalization fixed)

3. Mark Issue 2 as complete (after this implementation)

**Verification:**

Run the full test suite:
```bash
npm run test:run
npm run test:e2e
npm run lint
npm run check
````

**Manual verification checklist:**

1. Start dev server: `npm run dev`
2. Create a new layout
3. Place a 1U Blank (half-depth) at U10 on front
4. Switch to rear view
5. Place a 1U Blank at U10 on rear → should succeed
6. Place a 0.5U Blank at U5
7. Select it and press arrow up → should move to U5.5, not U6
8. Verify no console errors

````

---

### Prompt 9: Integration cleanup and edge case handling

```text
Final cleanup and edge case verification.

**Tasks:**

1. Verify schema allows 0.5 increments for position:
   - Check `src/lib/schemas/layout.ts` for position validation
   - Ensure positions like 1.5, 2.5 are valid

2. Check undo/redo still works:
   - Place device, undo, redo
   - Move device with arrow keys, undo, redo
   - Verify face is preserved through undo/redo

3. Check drag-and-drop still works:
   - `src/lib/utils/dragdrop.ts` already uses `canPlaceDevice()`
   - Verify it passes depth info correctly

4. Run the build:
   ```bash
   npm run build
````

5. If any issues found, fix them and re-run tests.

The implementation is complete when:

- All unit tests pass
- All E2E tests pass
- Lint and type check pass
- Build succeeds
- Manual verification passes

````

---

### Prompt 10: Update SPEC.md documentation

```text
Update the technical specification to document the new collision and movement behavior.

**File:** `docs/planning/SPEC.md`

**Changes:**

1. In **Section 3.6 Constraints**, add a new row:
   | Arrow key movement | Increment equals device u_height |

2. Add a new **Section 3.7 Collision Detection** (or add to existing section):

   ```markdown
   ### 3.7 Collision Detection

   Two devices collide if BOTH conditions are true:
   1. Their U ranges overlap (position to position + u_height - 1)
   2. Their faces collide

   **Face Collision Rules:**

   | Face A | Face B | Either Full-Depth? | Collision? |
   |--------|--------|-------------------|------------|
   | front  | front  | any               | YES        |
   | rear   | rear   | any               | YES        |
   | both   | any    | any               | YES        |
   | front  | rear   | YES               | YES        |
   | front  | rear   | NO (both half)    | NO         |

   **Defaults:**
   - `is_full_depth` defaults to `true` when not specified
   - Half-depth devices (blanks, shelves, patch panels, cable management) are explicitly marked `is_full_depth: false`
````

3. In **Section 11.2 Device Types**, add a note:

   > Devices marked with `is_full_depth: false`: Blanks, Shelves, Patch Panels, Cable Management

4. Verify the version number is updated if making a release.

Commit message: "docs(spec): add collision detection and movement rules"

```

---

## Collision Logic Reference

| Device A Face | Device A Depth | Device B Face | Device B Depth | Collide? |
|---------------|----------------|---------------|----------------|----------|
| front | full | front | any | YES |
| front | full | rear | any | YES |
| front | half | front | any | YES |
| front | half | rear | full | YES |
| front | half | rear | half | **NO** |
| rear | full | rear | any | YES |
| both | any | any | any | YES |

---

_This plan was generated on 2025-12-12._
```
