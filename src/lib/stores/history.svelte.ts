/**
 * History Store for Undo/Redo
 *
 * Manages two stacks: undoStack and redoStack
 * Uses the Command Pattern to execute/undo/redo actions
 */

import type { Command } from './commands/types';

/** Maximum number of commands to keep in history */
export const MAX_HISTORY_DEPTH = 50;

// Module-level state using Svelte 5 runes
let undoStack = $state<Command[]>([]);
let redoStack = $state<Command[]>([]);

// Derived values
const canUndo = $derived(undoStack.length > 0);
const canRedo = $derived(redoStack.length > 0);
const undoDescription = $derived(
	undoStack.length > 0 ? `Undo: ${undoStack[undoStack.length - 1].description}` : null
);
const redoDescription = $derived(
	redoStack.length > 0 ? `Redo: ${redoStack[redoStack.length - 1].description}` : null
);
const historyLength = $derived(undoStack.length);

/**
 * Execute a command and add it to history
 */
function execute(command: Command): void {
	// Execute the command
	command.execute();

	// Add to undo stack
	undoStack = [...undoStack, command];

	// Clear redo stack (new action invalidates redo history)
	redoStack = [];

	// Enforce max depth
	if (undoStack.length > MAX_HISTORY_DEPTH) {
		undoStack = undoStack.slice(-MAX_HISTORY_DEPTH);
	}
}

/**
 * Undo the last command
 * @returns true if undo was performed, false if nothing to undo
 */
function undo(): boolean {
	if (undoStack.length === 0) {
		return false;
	}

	// Pop from undo stack
	const command = undoStack[undoStack.length - 1];
	undoStack = undoStack.slice(0, -1);

	// Undo the command
	command.undo();

	// Push to redo stack
	redoStack = [...redoStack, command];

	return true;
}

/**
 * Redo the last undone command
 * @returns true if redo was performed, false if nothing to redo
 */
function redo(): boolean {
	if (redoStack.length === 0) {
		return false;
	}

	// Pop from redo stack
	const command = redoStack[redoStack.length - 1];
	redoStack = redoStack.slice(0, -1);

	// Re-execute the command
	command.execute();

	// Push back to undo stack
	undoStack = [...undoStack, command];

	return true;
}

/**
 * Clear all history
 */
function clear(): void {
	undoStack = [];
	redoStack = [];
}

/**
 * Reset the history store (primarily for testing)
 */
export function resetHistoryStore(): void {
	undoStack = [];
	redoStack = [];
}

/**
 * Get access to the history store
 */
export function getHistoryStore() {
	return {
		// Reactive state (getters for derived values)
		get canUndo() {
			return canUndo;
		},
		get canRedo() {
			return canRedo;
		},
		get undoDescription() {
			return undoDescription;
		},
		get redoDescription() {
			return redoDescription;
		},
		get historyLength() {
			return historyLength;
		},

		// Actions
		execute,
		undo,
		redo,
		clear
	};
}
