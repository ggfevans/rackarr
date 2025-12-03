# Undo/Redo Specification

**Status:** Draft
**Date:** 2025-12-03
**Target Version:** v0.4.0

---

## Overview

This specification defines the undo/redo system for Rackarr, enabling users to reverse and replay actions with standard keyboard shortcuts and UI controls.

### Goals

1. **User confidence** — Users can experiment without fear of losing work
2. **Standard UX** — Ctrl+Z / Ctrl+Shift+Z (Cmd on Mac) works as expected
3. **Minimal memory** — Bounded history stack prevents memory bloat
4. **Transparent** — Clear indication of undo/redo availability

### Non-Goals

- Collaborative undo (multi-user)
- Branching history (undo tree)
- Persistent history (survives page reload)
- Selective undo (undo specific action from middle of stack)

---

## 1. Architecture

### 1.1 Command Pattern

Use the **Command Pattern** to encapsulate actions as objects that can be executed, undone, and redone.

```typescript
interface Command {
	/** Unique identifier for the command type */
	type: string;

	/** Human-readable description for UI (e.g., "Add device") */
	description: string;

	/** Timestamp when command was executed */
	timestamp: number;

	/** Execute the command (apply changes) */
	execute(): void;

	/** Reverse the command (undo changes) */
	undo(): void;
}
```

### 1.2 History Stack

Two stacks manage the history:

```
┌─────────────────────────────────────────────────────────┐
│                    History Manager                       │
├─────────────────────────────────────────────────────────┤
│  undoStack: Command[]     │  redoStack: Command[]       │
│  ┌─────┐                  │  ┌─────┐                    │
│  │ C5  │ ← most recent    │  │ C6  │ ← next redo       │
│  │ C4  │                  │  │ C7  │                    │
│  │ C3  │                  │  └─────┘                    │
│  │ C2  │                  │                             │
│  │ C1  │ ← oldest         │                             │
│  └─────┘                  │                             │
└─────────────────────────────────────────────────────────┘
```

**Behavior:**

- **Execute new command:** Push to undoStack, clear redoStack
- **Undo:** Pop from undoStack, call `undo()`, push to redoStack
- **Redo:** Pop from redoStack, call `execute()`, push to undoStack

### 1.3 History Limits

| Setting                 | Value | Rationale                          |
| ----------------------- | ----- | ---------------------------------- |
| Max history depth       | 50    | Balance between utility and memory |
| Command grouping window | 500ms | Group rapid edits (e.g., typing)   |

When undoStack exceeds max depth, oldest commands are dropped (FIFO).

---

## 2. Supported Actions

### 2.1 Undoable Actions

All state-mutating actions should be undoable:

| Action             | Command Type         | Description                         |
| ------------------ | -------------------- | ----------------------------------- |
| Add device type    | `ADD_DEVICE_TYPE`    | Add device to library               |
| Update device type | `UPDATE_DEVICE_TYPE` | Edit device properties              |
| Delete device type | `DELETE_DEVICE_TYPE` | Remove from library                 |
| Place device       | `PLACE_DEVICE`       | Add device to rack                  |
| Move device        | `MOVE_DEVICE`        | Change device position              |
| Remove device      | `REMOVE_DEVICE`      | Remove from rack                    |
| Update device face | `UPDATE_DEVICE_FACE` | Change front/rear/both              |
| Update rack        | `UPDATE_RACK`        | Change rack properties              |
| Replace rack       | `REPLACE_RACK`       | Create new rack (replaces existing) |
| Clear rack         | `CLEAR_RACK`         | Remove all devices from rack        |

### 2.2 Non-Undoable Actions

These actions are NOT added to history:

| Action                   | Rationale                             |
| ------------------------ | ------------------------------------- |
| Change theme             | Preference, not document state        |
| Toggle view (front/rear) | View state, not document state        |
| Toggle display mode      | View state, not document state        |
| Pan/zoom canvas          | View state, not document state        |
| Selection changes        | Ephemeral UI state                    |
| Save/load file           | File operations (load clears history) |

### 2.3 Compound Actions

Some user actions should be treated as a single undoable unit:

| User Action                              | Commands Grouped                            |
| ---------------------------------------- | ------------------------------------------- |
| Delete device type with placed instances | DELETE_DEVICE_TYPE + multiple REMOVE_DEVICE |
| Import device library                    | Multiple ADD_DEVICE_TYPE                    |

Use `beginBatch()` / `endBatch()` to group commands.

---

## 3. Command Implementations

### 3.1 Command Structure

Each command stores the minimal data needed to undo/redo:

```typescript
// Example: PlaceDeviceCommand
interface PlaceDeviceCommand extends Command {
	type: 'PLACE_DEVICE';
	description: string;
	timestamp: number;

	// Data needed for execute/undo
	device: DeviceV02; // The device that was placed
	deviceIndex: number; // Index in rack.devices array (for undo)
}
```

### 3.2 State Snapshots vs. Deltas

**Approach: Delta-based commands** (not full state snapshots)

Rationale:

- Lower memory usage
- Faster execution
- More precise undo (only affects changed state)

Each command stores only what changed:

- `ADD_*`: Store the added item
- `DELETE_*`: Store the deleted item (for restoration)
- `UPDATE_*`: Store before/after values of changed fields only
- `MOVE_*`: Store from/to positions

### 3.3 Command Factory

Factory functions create commands with proper execute/undo closures:

```typescript
function createPlaceDeviceCommand(device: DeviceV02, layoutStore: LayoutStore): Command {
	let deviceIndex: number;

	return {
		type: 'PLACE_DEVICE',
		description: `Place ${device.device_type}`,
		timestamp: Date.now(),

		execute() {
			deviceIndex = layoutStore.placeDeviceRaw(device);
		},

		undo() {
			layoutStore.removeDeviceAtIndexRaw(deviceIndex);
		}
	};
}
```

---

## 4. History Store

### 4.1 Store Interface

```typescript
interface HistoryStore {
	// State (reactive)
	readonly canUndo: boolean;
	readonly canRedo: boolean;
	readonly undoDescription: string | null; // "Undo: Add device"
	readonly redoDescription: string | null; // "Redo: Add device"
	readonly historyLength: number;

	// Actions
	execute(command: Command): void;
	undo(): boolean;
	redo(): boolean;
	clear(): void;

	// Batching
	beginBatch(description: string): void;
	endBatch(): void;

	// Configuration
	setMaxDepth(depth: number): void;
}
```

### 4.2 Integration with Layout Store

The history store wraps layout store mutations:

```typescript
// Before (direct mutation)
layoutStore.placeDevice(device);

// After (through history)
historyStore.execute(createPlaceDeviceCommand(device, layoutStore));
```

**Option A: Wrapper functions**
Create `historyStore.placeDevice()` that wraps the command creation.

**Option B: Store middleware** (recommended)
Intercept layout store calls and automatically create commands.

### 4.3 Raw vs. Recorded Actions

Layout store exposes two versions of each action:

- `placeDevice()` — Creates command, adds to history
- `placeDeviceRaw()` — Direct mutation, no history (used by undo/redo)

---

## 5. User Interface

### 5.1 Keyboard Shortcuts

| Shortcut       | Action     | Notes                |
| -------------- | ---------- | -------------------- |
| `Ctrl+Z`       | Undo       | `Cmd+Z` on Mac       |
| `Ctrl+Shift+Z` | Redo       | `Cmd+Shift+Z` on Mac |
| `Ctrl+Y`       | Redo (alt) | Windows convention   |

### 5.2 Toolbar Buttons

Add undo/redo buttons to the toolbar (left section, after Delete):

```
[New Rack] [Save] [Load] [Export] | [Delete] [Undo] [Redo] | ...
```

**Button States:**

- Enabled: Default icon color, pointer cursor
- Disabled: Muted color (`--colour-text-muted`), not-allowed cursor

**Tooltips:**

- Undo: "Undo: {description}" or "Undo" if no description
- Redo: "Redo: {description}" or "Redo" if no description
- Disabled: "Nothing to undo/redo"

### 5.3 Visual Feedback

On undo/redo:

1. Show toast: "Undone: {description}" / "Redone: {description}"
2. Toast type: `info` (not success/error)
3. Toast duration: 2 seconds (shorter than default)

### 5.4 Help Panel

Add to keyboard shortcuts section:

```
Ctrl+Z     Undo
Ctrl+Shift+Z  Redo
```

---

## 6. Edge Cases

### 6.1 History Clear Triggers

History is cleared when:

- New layout is created
- Layout is loaded from file
- Page is refreshed (history is not persisted)

Show confirmation if clearing history with unsaved changes? **No** — trust isDirty flag.

### 6.2 Device Type Deletion with References

When undoing deletion of a device type that had placed instances:

1. Restore the device type to library
2. Restore all placed instances to their original positions
3. Handle position conflicts (see 6.3)

### 6.3 Position Conflicts

If undo would place a device where another now exists:

- **Option A:** Fail the undo, show error toast
- **Option B:** Bump conflicting device (cascade)
- **Option C:** Place in nearest available position

**Recommendation:** Option A — Fail gracefully with clear message.

### 6.4 Rapid Actions

Multiple rapid actions (e.g., moving device repeatedly) should be grouped:

- Track last command type and timestamp
- If same type within 500ms, merge into single command
- Store initial and final states, not intermediate

### 6.5 Batch Failures

If a batched operation partially fails:

- Roll back all commands in the batch
- Show error for the failed operation
- Batch does not enter history

---

## 7. Testing Strategy

### 7.1 Unit Tests

**History Store:**

- Execute adds to undo stack
- Undo moves to redo stack
- Redo moves back to undo stack
- Clear empties both stacks
- Max depth enforced
- canUndo/canRedo reactive

**Commands:**

- Each command type executes correctly
- Each command type undoes correctly
- Round-trip: execute → undo → redo returns to same state

### 7.2 Integration Tests

- Place device, undo, verify removed
- Delete device type with instances, undo, verify all restored
- Keyboard shortcuts trigger undo/redo
- Toolbar buttons work when enabled
- Toolbar buttons disabled when appropriate

### 7.3 E2E Tests

- Full workflow: add devices, undo multiple times, redo
- Verify UI state matches after undo/redo
- Verify isDirty flag correct after undo/redo

---

## 8. Implementation Order

1. **History store** — Core undo/redo logic
2. **Command types** — All command implementations
3. **Layout store integration** — Wire up raw/recorded actions
4. **Keyboard shortcuts** — Ctrl+Z, Ctrl+Shift+Z
5. **Toolbar UI** — Undo/redo buttons
6. **Toasts** — Feedback messages
7. **Help panel** — Documentation update
8. **Edge cases** — Batching, conflicts, rapid actions

---

## 9. File Structure

```
src/lib/stores/
├── history.svelte.ts       # History store
├── commands/
│   ├── index.ts            # Command types & factory exports
│   ├── types.ts            # Command interface
│   ├── device-type.ts      # ADD/UPDATE/DELETE_DEVICE_TYPE
│   ├── device.ts           # PLACE/MOVE/REMOVE_DEVICE
│   └── rack.ts             # UPDATE/REPLACE/CLEAR_RACK
└── layout.svelte.ts        # Updated with raw actions
```

---

## 10. Success Criteria

- [ ] Ctrl+Z undoes last action
- [ ] Ctrl+Shift+Z redoes last undone action
- [ ] All device/rack mutations are undoable
- [ ] History limited to 50 commands
- [ ] Toolbar shows undo/redo buttons with correct states
- [ ] Toast feedback on undo/redo
- [ ] Help panel documents shortcuts
- [ ] No memory leaks (history properly bounded)
- [ ] All existing tests still pass

---

## Appendix A: Command Type Reference

```typescript
type CommandType =
	| 'ADD_DEVICE_TYPE'
	| 'UPDATE_DEVICE_TYPE'
	| 'DELETE_DEVICE_TYPE'
	| 'PLACE_DEVICE'
	| 'MOVE_DEVICE'
	| 'REMOVE_DEVICE'
	| 'UPDATE_DEVICE_FACE'
	| 'UPDATE_RACK'
	| 'REPLACE_RACK'
	| 'CLEAR_RACK'
	| 'BATCH'; // Container for grouped commands
```

---

## Appendix B: Svelte 5 Considerations

Using Svelte 5 runes for reactive history state:

```typescript
// history.svelte.ts
let undoStack = $state<Command[]>([]);
let redoStack = $state<Command[]>([]);

const canUndo = $derived(undoStack.length > 0);
const canRedo = $derived(redoStack.length > 0);
const undoDescription = $derived(
	undoStack.length > 0 ? `Undo: ${undoStack[undoStack.length - 1].description}` : null
);
```

Commands must not capture reactive state directly — use snapshots.

---

## Changelog

| Date       | Change                |
| ---------- | --------------------- |
| 2025-12-03 | Initial specification |
