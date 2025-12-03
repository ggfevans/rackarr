# Undo/Redo Implementation Prompt Plan

This document contains a series of prompts for implementing the undo/redo system in a test-driven manner. Each prompt builds on the previous ones.

---

## Overview

### Implementation Phases

1. **Foundation** (Prompts 1-2): Command types, history store
2. **Commands** (Prompts 3-5): Device type, device, rack commands
3. **Integration** (Prompts 6-7): Layout store wiring
4. **UI** (Prompts 8-10): Keyboard shortcuts, toolbar, feedback
5. **Polish** (Prompts 11-12): Edge cases, E2E tests

### Prerequisites

- Read `docs/planning/undo-redo-spec.md` for full specification
- Current tests should be passing before starting

---

## Phase 1: Foundation

### Prompt 1: Create Command Types and Interfaces

```text
Create the command type system for undo/redo.

Reference: `docs/planning/undo-redo-spec.md` Section 1.1, Appendix A

Create `src/lib/stores/commands/types.ts` with:

1. Command interface:
   - type: string (command type identifier)
   - description: string (human-readable for UI)
   - timestamp: number
   - execute(): void
   - undo(): void

2. CommandType union type with all command types:
   - ADD_DEVICE_TYPE, UPDATE_DEVICE_TYPE, DELETE_DEVICE_TYPE
   - PLACE_DEVICE, MOVE_DEVICE, REMOVE_DEVICE, UPDATE_DEVICE_FACE
   - UPDATE_RACK, REPLACE_RACK, CLEAR_RACK
   - BATCH

3. BatchCommand interface extending Command:
   - commands: Command[] (grouped commands)

Write tests FIRST in `src/lib/stores/commands/types.test.ts`:

Test Command interface:
- Command with all required fields compiles
- execute and undo are callable

Test CommandType:
- All expected types are valid
- Invalid string is not a CommandType

Run tests, verify they pass (type tests).
```

---

### Prompt 2: Create History Store

```text
Create the history store that manages undo/redo stacks.

Reference: `docs/planning/undo-redo-spec.md` Sections 1.2, 1.3, 4

Create `src/lib/stores/history.svelte.ts` with:

1. State (using $state):
   - undoStack: Command[]
   - redoStack: Command[]

2. Derived values (using $derived):
   - canUndo: boolean
   - canRedo: boolean
   - undoDescription: string | null ("Undo: {description}")
   - redoDescription: string | null
   - historyLength: number (undoStack length)

3. Actions:
   - execute(command: Command): void
     - Calls command.execute()
     - Pushes to undoStack
     - Clears redoStack
     - Enforces maxDepth (drop oldest)

   - undo(): boolean
     - Returns false if canUndo is false
     - Pops from undoStack
     - Calls command.undo()
     - Pushes to redoStack
     - Returns true

   - redo(): boolean
     - Returns false if canRedo is false
     - Pops from redoStack
     - Calls command.execute()
     - Pushes to undoStack
     - Returns true

   - clear(): void
     - Empties both stacks

4. Configuration:
   - MAX_HISTORY_DEPTH = 50 (constant)

5. Export getHistoryStore() function (same pattern as layout store)

Write tests FIRST in `src/lib/stores/history.test.ts`:

Test execute:
- Adds command to undoStack
- Clears redoStack
- Calls command.execute()
- Enforces max depth (51st command drops oldest)

Test undo:
- Returns false when stack empty
- Pops from undoStack, pushes to redoStack
- Calls command.undo()
- Updates canUndo/canRedo

Test redo:
- Returns false when stack empty
- Pops from redoStack, pushes to undoStack
- Calls command.execute()
- Updates canUndo/canRedo

Test clear:
- Empties both stacks
- canUndo and canRedo become false

Test derived values:
- undoDescription shows last command description
- redoDescription shows next redo description

Run tests, implement to pass.
```

---

## Phase 2: Commands

### Prompt 3: Create Device Type Commands

```text
Create commands for device type operations.

Reference: `docs/planning/undo-redo-spec.md` Sections 2.1, 3

Create `src/lib/stores/commands/device-type.ts` with factory functions:

1. createAddDeviceTypeCommand(deviceType: DeviceTypeV02, layoutStore): Command
   - execute: adds device type to layout
   - undo: removes device type from layout
   - description: "Add {name}"

2. createUpdateDeviceTypeCommand(slug: string, before: Partial<DeviceTypeV02>, after: Partial<DeviceTypeV02>, layoutStore): Command
   - execute: applies 'after' updates
   - undo: applies 'before' values
   - description: "Update {slug}"

3. createDeleteDeviceTypeCommand(deviceType: DeviceTypeV02, placedDevices: DeviceV02[], layoutStore): Command
   - execute: removes device type AND all placed instances
   - undo: restores device type AND all placed instances
   - description: "Delete {name}"

Write tests FIRST in `src/lib/stores/commands/device-type.test.ts`:

Test createAddDeviceTypeCommand:
- execute adds device type to layout
- undo removes device type from layout
- Round-trip leaves layout unchanged

Test createUpdateDeviceTypeCommand:
- execute applies new values
- undo restores old values
- Only specified fields are changed

Test createDeleteDeviceTypeCommand:
- execute removes device type
- execute removes all placed instances
- undo restores device type
- undo restores all placed instances in correct positions

Run tests, implement to pass.
```

---

### Prompt 4: Create Device Commands

```text
Create commands for device placement operations.

Reference: `docs/planning/undo-redo-spec.md` Sections 2.1, 3

Create `src/lib/stores/commands/device.ts` with factory functions:

1. createPlaceDeviceCommand(device: DeviceV02, layoutStore): Command
   - execute: places device in rack, stores index
   - undo: removes device at stored index
   - description: "Place {device_type}"

2. createMoveDeviceCommand(deviceIndex: number, fromPosition: number, toPosition: number, layoutStore): Command
   - execute: moves device to toPosition
   - undo: moves device to fromPosition
   - description: "Move device"

3. createRemoveDeviceCommand(device: DeviceV02, deviceIndex: number, layoutStore): Command
   - execute: removes device at index
   - undo: places device back at original position
   - description: "Remove {device_type}"

4. createUpdateDeviceFaceCommand(deviceIndex: number, fromFace: DeviceFaceV02, toFace: DeviceFaceV02, layoutStore): Command
   - execute: sets face to toFace
   - undo: sets face to fromFace
   - description: "Change device face"

Write tests FIRST in `src/lib/stores/commands/device.test.ts`:

Test createPlaceDeviceCommand:
- execute places device in rack
- undo removes device from rack
- Round-trip leaves rack unchanged

Test createMoveDeviceCommand:
- execute moves device to new position
- undo moves device back
- Other devices not affected

Test createRemoveDeviceCommand:
- execute removes device
- undo restores device at original position

Test createUpdateDeviceFaceCommand:
- execute changes face
- undo restores original face

Run tests, implement to pass.
```

---

### Prompt 5: Create Rack Commands

```text
Create commands for rack operations.

Reference: `docs/planning/undo-redo-spec.md` Sections 2.1, 3

Create `src/lib/stores/commands/rack.ts` with factory functions:

1. createUpdateRackCommand(before: Partial<RackV02>, after: Partial<RackV02>, layoutStore): Command
   - execute: applies 'after' updates
   - undo: applies 'before' values
   - description: "Update rack"

2. createReplaceRackCommand(oldRack: RackV02, newRack: RackV02, layoutStore): Command
   - execute: replaces rack with newRack
   - undo: restores oldRack
   - description: "Replace rack"

3. createClearRackCommand(devices: DeviceV02[], layoutStore): Command
   - execute: removes all devices from rack
   - undo: restores all devices
   - description: "Clear rack"

Write tests FIRST in `src/lib/stores/commands/rack.test.ts`:

Test createUpdateRackCommand:
- execute applies new values
- undo restores old values
- Only specified fields changed

Test createReplaceRackCommand:
- execute replaces entire rack
- undo restores previous rack with all devices

Test createClearRackCommand:
- execute removes all devices
- undo restores all devices in original positions

Create `src/lib/stores/commands/index.ts`:
- Export all command factories
- Export Command and CommandType types

Run tests, implement to pass.
```

---

## Phase 3: Integration

### Prompt 6: Add Raw Actions to Layout Store

```text
Add "raw" versions of layout store actions that bypass history.

Reference: `docs/planning/undo-redo-spec.md` Section 4.3

Modify `src/lib/stores/layout.svelte.ts`:

1. Rename existing mutation functions to *Raw suffix:
   - addDeviceType → addDeviceTypeRaw
   - updateDeviceType → updateDeviceTypeRaw
   - deleteDeviceType → deleteDeviceTypeRaw
   - placeDevice → placeDeviceRaw
   - moveDevice → moveDeviceRaw
   - removeDeviceFromRack → removeDeviceFromRackRaw
   - updateDeviceFace → updateDeviceFaceRaw
   - updateRack → updateRackRaw
   - clearRackDevices (new) → clearRackDevicesRaw

2. Add helper functions needed by commands:
   - removeDeviceAtIndex(index: number): void
   - getDeviceAt(index: number): DeviceV02 | undefined
   - getRackSnapshot(): RackV02 (deep copy)
   - getDeviceTypeBySlug(slug: string): DeviceTypeV02 | undefined

3. Export raw functions (for use by commands)

Update existing tests to use raw function names where appropriate.
Ensure all existing tests still pass.

Do NOT add history integration yet - just restructure.
```

---

### Prompt 7: Wire Up History to Layout Store

```text
Connect history store to layout store for recorded actions.

Reference: `docs/planning/undo-redo-spec.md` Section 4.2

Modify `src/lib/stores/layout.svelte.ts`:

1. Import history store and command factories

2. Create recorded action functions that:
   - Create appropriate command
   - Execute via history store
   - Return same result as raw version

   Functions to create:
   - addDeviceType(data) - wraps addDeviceTypeRaw
   - updateDeviceType(slug, updates) - wraps updateDeviceTypeRaw
   - deleteDeviceType(slug) - wraps deleteDeviceTypeRaw
   - placeDevice(device) - wraps placeDeviceRaw
   - moveDevice(rackId, index, position) - wraps moveDeviceRaw
   - removeDeviceFromRack(rackId, index) - wraps removeDeviceFromRackRaw
   - updateDeviceFace(rackId, index, face) - wraps updateDeviceFaceRaw
   - updateRack(id, updates) - wraps updateRackRaw
   - clearRack(id) - clears all devices

3. Add to store export:
   - canUndo, canRedo (from history store)
   - undoDescription, redoDescription
   - undo(), redo() (delegate to history store)

4. Clear history when:
   - loadLayout() is called
   - createNewLayout() is called

Write integration tests in `src/lib/stores/layout-history.test.ts`:

- addDeviceType, undo removes it, redo adds it back
- placeDevice, undo removes it, redo places it back
- deleteDeviceType with placed devices, undo restores all
- Multiple actions, multiple undos work correctly
- Load layout clears history

Run all tests, ensure existing tests still pass.
```

---

## Phase 4: UI

### Prompt 8: Add Keyboard Shortcuts

```text
Add keyboard shortcuts for undo/redo.

Reference: `docs/planning/undo-redo-spec.md` Section 5.1

Modify `src/App.svelte`:

1. Add to existing keyboard handler:
   - Ctrl+Z (Cmd+Z on Mac): Call layoutStore.undo()
   - Ctrl+Shift+Z (Cmd+Shift+Z on Mac): Call layoutStore.redo()
   - Ctrl+Y: Call layoutStore.redo() (Windows alternative)

2. Only trigger when:
   - No dialog is open
   - No input/textarea is focused

3. Prevent default browser behavior for these shortcuts

Update `src/lib/components/HelpPanel.svelte`:

Add to keyboard shortcuts list:
- "Ctrl+Z" / "Undo"
- "Ctrl+Shift+Z" / "Redo"

Write tests:

In existing keyboard tests (e2e/keyboard.spec.ts):
- Ctrl+Z triggers undo when action available
- Ctrl+Shift+Z triggers redo when action available
- Shortcuts don't trigger when input focused
- Shortcuts don't trigger when dialog open

In HelpPanel.test.ts:
- Undo shortcut appears in help panel
- Redo shortcut appears in help panel

Run tests, implement to pass.
```

---

### Prompt 9: Add Toolbar Buttons

````text
Add undo/redo buttons to the toolbar.

Reference: `docs/planning/undo-redo-spec.md` Section 5.2

Modify `src/lib/components/Toolbar.svelte`:

1. Add props:
   - canUndo: boolean
   - canRedo: boolean
   - undoDescription: string | null
   - redoDescription: string | null
   - onundo: () => void
   - onredo: () => void

2. Add buttons after Delete button:
   ```svelte
   <Tooltip text={undoDescription ?? 'Nothing to undo'} shortcut="Ctrl+Z">
     <button
       class="toolbar-action-btn"
       aria-label="Undo"
       disabled={!canUndo}
       onclick={onundo}
     >
       <IconUndo size={16} />
       <span>Undo</span>
     </button>
   </Tooltip>

   <Tooltip text={redoDescription ?? 'Nothing to redo'} shortcut="Ctrl+Shift+Z">
     <button
       class="toolbar-action-btn"
       aria-label="Redo"
       disabled={!canRedo}
       onclick={onredo}
     >
       <IconRedo size={16} />
       <span>Redo</span>
     </button>
   </Tooltip>
````

3. Create icons (or use existing library):
   - IconUndo: Counter-clockwise arrow
   - IconRedo: Clockwise arrow

4. Style disabled state:
   - opacity: 0.5
   - cursor: not-allowed

Modify `src/App.svelte`:

- Pass canUndo, canRedo, undoDescription, redoDescription to Toolbar
- Pass onundo, onredo handlers

Write tests in `src/lib/components/Toolbar.test.ts`:

- Undo button visible
- Redo button visible
- Undo button disabled when canUndo=false
- Redo button disabled when canRedo=false
- Undo button click calls onundo
- Redo button click calls onredo
- Tooltip shows description when available

Run tests, implement to pass.

````

---

### Prompt 10: Add Toast Feedback

```text
Add toast notifications for undo/redo actions.

Reference: `docs/planning/undo-redo-spec.md` Section 5.3

Modify `src/App.svelte`:

1. Update undo handler:
   ```typescript
   function handleUndo() {
     const description = layoutStore.undoDescription;
     if (layoutStore.undo()) {
       toastStore.showToast(
         description?.replace('Undo: ', 'Undone: ') ?? 'Undone',
         'info',
         2000  // shorter duration
       );
     }
   }
````

2. Update redo handler:

   ```typescript
   function handleRedo() {
   	const description = layoutStore.redoDescription;
   	if (layoutStore.redo()) {
   		toastStore.showToast(description?.replace('Redo: ', 'Redone: ') ?? 'Redone', 'info', 2000);
   	}
   }
   ```

3. Update toast store if needed to support custom duration.

Write E2E test:

- Perform action, undo, verify toast appears with correct text
- Perform undo, redo, verify toast appears

Run tests, implement to pass.

````

---

## Phase 5: Polish

### Prompt 11: Handle Edge Cases

```text
Handle edge cases for undo/redo.

Reference: `docs/planning/undo-redo-spec.md` Section 6

1. Batching support in history store:

Add to `src/lib/stores/history.svelte.ts`:

```typescript
let batchInProgress = $state(false);
let batchCommands = $state<Command[]>([]);
let batchDescription = $state<string>('');

function beginBatch(description: string): void {
  batchInProgress = true;
  batchCommands = [];
  batchDescription = description;
}

function endBatch(): void {
  if (batchCommands.length > 0) {
    const batch: BatchCommand = {
      type: 'BATCH',
      description: batchDescription,
      timestamp: Date.now(),
      commands: [...batchCommands],
      execute() {
        this.commands.forEach(cmd => cmd.execute());
      },
      undo() {
        // Undo in reverse order
        [...this.commands].reverse().forEach(cmd => cmd.undo());
      }
    };
    // Add batch as single entry
    undoStack = [...undoStack, batch];
    redoStack = [];
  }
  batchInProgress = false;
  batchCommands = [];
}

// Modify execute() to handle batching:
function execute(command: Command): void {
  command.execute();
  if (batchInProgress) {
    batchCommands = [...batchCommands, command];
  } else {
    undoStack = [...undoStack, command];
    redoStack = [];
    // Enforce max depth
    if (undoStack.length > MAX_HISTORY_DEPTH) {
      undoStack = undoStack.slice(-MAX_HISTORY_DEPTH);
    }
  }
}
````

2. Use batching for deleteDeviceType:

In layout store, wrap delete with batch when device has placed instances.

3. Position conflict handling:

In device placement undo, check for conflicts:

```typescript
undo() {
  // Check if position is now occupied
  const conflict = layoutStore.isPositionOccupied(device.position, device.u_height);
  if (conflict) {
    throw new Error(`Cannot undo: position ${device.position} is now occupied`);
  }
  layoutStore.placeDeviceRaw(device);
}
```

Write tests:

- Batch: multiple commands undo as one
- Batch: multiple commands redo as one
- Batch: empty batch does nothing
- Delete device type with instances uses batch
- Position conflict throws clear error

Run tests, implement to pass.

````

---

### Prompt 12: E2E Tests and Final Verification

```text
Create comprehensive E2E tests for undo/redo.

Create/update `e2e/undo-redo.spec.ts`:

Test: Basic undo/redo flow
1. Add device type to library
2. Press Ctrl+Z
3. Verify device type removed
4. Press Ctrl+Shift+Z
5. Verify device type restored

Test: Place device undo/redo
1. Place device in rack
2. Undo
3. Verify device removed from rack
4. Redo
5. Verify device back in rack

Test: Multiple undos
1. Add device type A
2. Add device type B
3. Place A
4. Place B
5. Undo 4 times
6. Verify empty state
7. Redo 4 times
8. Verify all restored

Test: Toolbar buttons
1. Verify undo button disabled initially
2. Add device
3. Verify undo button enabled
4. Click undo button
5. Verify redo button enabled
6. Click redo button
7. Verify state restored

Test: Toast feedback
1. Add device
2. Undo via Ctrl+Z
3. Verify toast shows "Undone: Add {name}"

Test: History cleared on load
1. Add device
2. Verify undo available
3. Create new layout
4. Verify undo not available

Run full test suite:
```bash
npm run check
npm run test:run
npm run build
npm run test:e2e
````

All tests should pass.

```

---

## Prompt Execution Checklist

| # | Prompt | Status | Tests Pass |
|---|--------|--------|------------|
| 1 | Create command types | ⬜ | ⬜ |
| 2 | Create history store | ⬜ | ⬜ |
| 3 | Device type commands | ⬜ | ⬜ |
| 4 | Device commands | ⬜ | ⬜ |
| 5 | Rack commands | ⬜ | ⬜ |
| 6 | Add raw actions | ⬜ | ⬜ |
| 7 | Wire up history | ⬜ | ⬜ |
| 8 | Keyboard shortcuts | ⬜ | ⬜ |
| 9 | Toolbar buttons | ⬜ | ⬜ |
| 10 | Toast feedback | ⬜ | ⬜ |
| 11 | Edge cases | ⬜ | ⬜ |
| 12 | E2E tests | ⬜ | ⬜ |

---

## Recovery Procedures

### If tests fail after a prompt:

1. Check if command execute/undo are symmetric
2. Verify state snapshots are deep copies
3. Check for missing raw function calls
4. Ensure history store is properly reset between tests

### If undo doesn't work correctly:

1. Log command execute/undo calls
2. Verify correct data captured at command creation time
3. Check for reference vs value issues (need deep copies)

### If E2E tests fail:

1. Check keyboard event handling
2. Verify button states update reactively
3. Check for race conditions in rapid undo/redo
```
