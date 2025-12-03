import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHistoryStore, resetHistoryStore, MAX_HISTORY_DEPTH } from './history.svelte';
import type { Command } from './commands/types';

function createMockCommand(description: string): Command {
	return {
		type: 'PLACE_DEVICE',
		description,
		timestamp: Date.now(),
		execute: vi.fn(),
		undo: vi.fn()
	};
}

describe('History Store', () => {
	beforeEach(() => {
		resetHistoryStore();
	});

	describe('execute', () => {
		it('adds command to undoStack', () => {
			const store = getHistoryStore();
			const command = createMockCommand('Test command');

			store.execute(command);

			expect(store.canUndo).toBe(true);
			expect(store.historyLength).toBe(1);
		});

		it('clears redoStack when executing new command', () => {
			const store = getHistoryStore();
			const cmd1 = createMockCommand('Command 1');
			const cmd2 = createMockCommand('Command 2');
			const cmd3 = createMockCommand('Command 3');

			store.execute(cmd1);
			store.execute(cmd2);
			store.undo(); // cmd2 is now in redoStack

			expect(store.canRedo).toBe(true);

			store.execute(cmd3); // Should clear redoStack

			expect(store.canRedo).toBe(false);
		});

		it('calls command.execute()', () => {
			const store = getHistoryStore();
			const command = createMockCommand('Test');

			store.execute(command);

			expect(command.execute).toHaveBeenCalledTimes(1);
		});

		it('enforces max depth - drops oldest when exceeded', () => {
			const store = getHistoryStore();

			// Add MAX_HISTORY_DEPTH + 1 commands
			for (let i = 0; i <= MAX_HISTORY_DEPTH; i++) {
				store.execute(createMockCommand(`Command ${i}`));
			}

			// Should only have MAX_HISTORY_DEPTH commands
			expect(store.historyLength).toBe(MAX_HISTORY_DEPTH);

			// The first command should be "Command 1" (Command 0 was dropped)
			expect(store.undoDescription).toBe('Undo: Command 50');
		});
	});

	describe('undo', () => {
		it('returns false when undoStack is empty', () => {
			const store = getHistoryStore();

			const result = store.undo();

			expect(result).toBe(false);
		});

		it('pops from undoStack and pushes to redoStack', () => {
			const store = getHistoryStore();
			const command = createMockCommand('Test');

			store.execute(command);
			expect(store.canUndo).toBe(true);
			expect(store.canRedo).toBe(false);

			const result = store.undo();

			expect(result).toBe(true);
			expect(store.canUndo).toBe(false);
			expect(store.canRedo).toBe(true);
		});

		it('calls command.undo()', () => {
			const store = getHistoryStore();
			const command = createMockCommand('Test');

			store.execute(command);
			store.undo();

			expect(command.undo).toHaveBeenCalledTimes(1);
		});

		it('updates canUndo/canRedo correctly', () => {
			const store = getHistoryStore();
			const cmd1 = createMockCommand('Command 1');
			const cmd2 = createMockCommand('Command 2');

			expect(store.canUndo).toBe(false);
			expect(store.canRedo).toBe(false);

			store.execute(cmd1);
			expect(store.canUndo).toBe(true);
			expect(store.canRedo).toBe(false);

			store.execute(cmd2);
			expect(store.canUndo).toBe(true);
			expect(store.canRedo).toBe(false);

			store.undo();
			expect(store.canUndo).toBe(true); // cmd1 still there
			expect(store.canRedo).toBe(true); // cmd2 in redo

			store.undo();
			expect(store.canUndo).toBe(false); // empty
			expect(store.canRedo).toBe(true); // both in redo
		});
	});

	describe('redo', () => {
		it('returns false when redoStack is empty', () => {
			const store = getHistoryStore();

			const result = store.redo();

			expect(result).toBe(false);
		});

		it('pops from redoStack and pushes to undoStack', () => {
			const store = getHistoryStore();
			const command = createMockCommand('Test');

			store.execute(command);
			store.undo();

			expect(store.canRedo).toBe(true);
			expect(store.canUndo).toBe(false);

			const result = store.redo();

			expect(result).toBe(true);
			expect(store.canRedo).toBe(false);
			expect(store.canUndo).toBe(true);
		});

		it('calls command.execute() on redo', () => {
			const store = getHistoryStore();
			const command = createMockCommand('Test');

			store.execute(command);
			store.undo();
			store.redo();

			// execute called twice: once on initial execute, once on redo
			expect(command.execute).toHaveBeenCalledTimes(2);
		});

		it('updates canUndo/canRedo correctly', () => {
			const store = getHistoryStore();
			const cmd1 = createMockCommand('Command 1');
			const cmd2 = createMockCommand('Command 2');

			store.execute(cmd1);
			store.execute(cmd2);
			store.undo();
			store.undo();

			expect(store.canUndo).toBe(false);
			expect(store.canRedo).toBe(true);

			store.redo();
			expect(store.canUndo).toBe(true);
			expect(store.canRedo).toBe(true);

			store.redo();
			expect(store.canUndo).toBe(true);
			expect(store.canRedo).toBe(false);
		});
	});

	describe('clear', () => {
		it('empties both stacks', () => {
			const store = getHistoryStore();
			const cmd1 = createMockCommand('Command 1');
			const cmd2 = createMockCommand('Command 2');

			store.execute(cmd1);
			store.execute(cmd2);
			store.undo();

			expect(store.canUndo).toBe(true);
			expect(store.canRedo).toBe(true);

			store.clear();

			expect(store.canUndo).toBe(false);
			expect(store.canRedo).toBe(false);
			expect(store.historyLength).toBe(0);
		});
	});

	describe('derived values', () => {
		it('undoDescription shows last command description', () => {
			const store = getHistoryStore();

			expect(store.undoDescription).toBeNull();

			store.execute(createMockCommand('Add device'));
			expect(store.undoDescription).toBe('Undo: Add device');

			store.execute(createMockCommand('Move device'));
			expect(store.undoDescription).toBe('Undo: Move device');
		});

		it('redoDescription shows next redo description', () => {
			const store = getHistoryStore();

			expect(store.redoDescription).toBeNull();

			store.execute(createMockCommand('Add device'));
			store.execute(createMockCommand('Move device'));

			expect(store.redoDescription).toBeNull();

			store.undo();
			expect(store.redoDescription).toBe('Redo: Move device');

			store.undo();
			expect(store.redoDescription).toBe('Redo: Add device');
		});

		it('historyLength returns undoStack length', () => {
			const store = getHistoryStore();

			expect(store.historyLength).toBe(0);

			store.execute(createMockCommand('Command 1'));
			expect(store.historyLength).toBe(1);

			store.execute(createMockCommand('Command 2'));
			expect(store.historyLength).toBe(2);

			store.undo();
			expect(store.historyLength).toBe(1);
		});
	});
});
