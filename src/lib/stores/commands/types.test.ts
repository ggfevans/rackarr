import { describe, it, expect, vi } from 'vitest';
import type { Command, CommandType, BatchCommand } from './types';

describe('Command Types', () => {
	describe('Command interface', () => {
		it('accepts a valid command object', () => {
			const command: Command = {
				type: 'PLACE_DEVICE',
				description: 'Place test device',
				timestamp: Date.now(),
				execute: vi.fn(),
				undo: vi.fn()
			};

			expect(command.type).toBe('PLACE_DEVICE');
			expect(command.description).toBe('Place test device');
			expect(typeof command.timestamp).toBe('number');
			expect(typeof command.execute).toBe('function');
			expect(typeof command.undo).toBe('function');
		});

		it('execute and undo are callable', () => {
			const executeFn = vi.fn();
			const undoFn = vi.fn();

			const command: Command = {
				type: 'ADD_DEVICE_TYPE',
				description: 'Add device',
				timestamp: Date.now(),
				execute: executeFn,
				undo: undoFn
			};

			command.execute();
			expect(executeFn).toHaveBeenCalledTimes(1);

			command.undo();
			expect(undoFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('CommandType', () => {
		it('accepts all valid command types', () => {
			const validTypes: CommandType[] = [
				'ADD_DEVICE_TYPE',
				'UPDATE_DEVICE_TYPE',
				'DELETE_DEVICE_TYPE',
				'PLACE_DEVICE',
				'MOVE_DEVICE',
				'REMOVE_DEVICE',
				'UPDATE_DEVICE_FACE',
				'UPDATE_RACK',
				'REPLACE_RACK',
				'CLEAR_RACK',
				'BATCH'
			];

			// TypeScript compilation validates these are all valid
			expect(validTypes).toHaveLength(11);
		});
	});

	describe('BatchCommand interface', () => {
		it('accepts a valid batch command', () => {
			const innerCommand: Command = {
				type: 'PLACE_DEVICE',
				description: 'Place device',
				timestamp: Date.now(),
				execute: vi.fn(),
				undo: vi.fn()
			};

			const batchCommand: BatchCommand = {
				type: 'BATCH',
				description: 'Batch operation',
				timestamp: Date.now(),
				commands: [innerCommand],
				execute: vi.fn(),
				undo: vi.fn()
			};

			expect(batchCommand.type).toBe('BATCH');
			expect(batchCommand.commands).toHaveLength(1);
			expect(batchCommand.commands[0]).toBe(innerCommand);
		});

		it('execute runs all inner commands in order', () => {
			const calls: number[] = [];

			const cmd1: Command = {
				type: 'ADD_DEVICE_TYPE',
				description: 'Add 1',
				timestamp: Date.now(),
				execute: () => calls.push(1),
				undo: vi.fn()
			};

			const cmd2: Command = {
				type: 'ADD_DEVICE_TYPE',
				description: 'Add 2',
				timestamp: Date.now(),
				execute: () => calls.push(2),
				undo: vi.fn()
			};

			const batch: BatchCommand = {
				type: 'BATCH',
				description: 'Add devices',
				timestamp: Date.now(),
				commands: [cmd1, cmd2],
				execute() {
					this.commands.forEach((cmd) => cmd.execute());
				},
				undo() {
					[...this.commands].reverse().forEach((cmd) => cmd.undo());
				}
			};

			batch.execute();
			expect(calls).toEqual([1, 2]);
		});

		it('undo runs inner commands in reverse order', () => {
			const calls: number[] = [];

			const cmd1: Command = {
				type: 'ADD_DEVICE_TYPE',
				description: 'Add 1',
				timestamp: Date.now(),
				execute: vi.fn(),
				undo: () => calls.push(1)
			};

			const cmd2: Command = {
				type: 'ADD_DEVICE_TYPE',
				description: 'Add 2',
				timestamp: Date.now(),
				execute: vi.fn(),
				undo: () => calls.push(2)
			};

			const batch: BatchCommand = {
				type: 'BATCH',
				description: 'Add devices',
				timestamp: Date.now(),
				commands: [cmd1, cmd2],
				execute() {
					this.commands.forEach((cmd) => cmd.execute());
				},
				undo() {
					[...this.commands].reverse().forEach((cmd) => cmd.undo());
				}
			};

			batch.undo();
			// Should undo in reverse: cmd2 first, then cmd1
			expect(calls).toEqual([2, 1]);
		});
	});
});
