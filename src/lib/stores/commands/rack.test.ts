import { describe, it, expect, vi } from 'vitest';
import {
	createUpdateRackCommand,
	createReplaceRackCommand,
	createClearRackCommand,
	type RackCommandStore,
	type RackSettings
} from './rack';
import type { Rack, PlacedDevice } from '$lib/types/v02';

function createMockRack(overrides: Partial<Rack> = {}): Rack {
	return {
		name: 'Main Rack',
		height: 42,
		width: 19,
		desc_units: false,
		form_factor: 'full-depth',
		starting_unit: 1,
		position: 0,
		devices: [],
		...overrides
	};
}

function createMockDevice(overrides: Partial<PlacedDevice> = {}): PlacedDevice {
	return {
		device_type: 'test-device',
		position: 10,
		...overrides
	};
}

function createMockStore(rack: Rack = createMockRack()): RackCommandStore & {
	updateRackRaw: ReturnType<typeof vi.fn>;
	replaceRackRaw: ReturnType<typeof vi.fn>;
	clearRackDevicesRaw: ReturnType<typeof vi.fn>;
	restoreRackDevicesRaw: ReturnType<typeof vi.fn>;
	getRack: ReturnType<typeof vi.fn>;
} {
	return {
		updateRackRaw: vi.fn(),
		replaceRackRaw: vi.fn(),
		clearRackDevicesRaw: vi.fn().mockReturnValue([]),
		restoreRackDevicesRaw: vi.fn(),
		getRack: vi.fn().mockReturnValue(rack)
	};
}

describe('Rack Commands', () => {
	describe('createUpdateRackCommand', () => {
		it('creates command with correct type and description', () => {
			const store = createMockStore();
			const before = { name: 'Old Name' };
			const after = { name: 'New Name' };

			const command = createUpdateRackCommand(before, after, store);

			expect(command.type).toBe('UPDATE_RACK');
			expect(command.description).toBe('Update rack settings');
			expect(typeof command.timestamp).toBe('number');
		});

		it('execute calls updateRackRaw with after values', () => {
			const store = createMockStore();
			const before = { height: 42 };
			const after = { height: 48 };

			const command = createUpdateRackCommand(before, after, store);
			command.execute();

			expect(store.updateRackRaw).toHaveBeenCalledTimes(1);
			expect(store.updateRackRaw).toHaveBeenCalledWith(after);
		});

		it('undo calls updateRackRaw with before values', () => {
			const store = createMockStore();
			const before: Partial<RackSettings> = { height: 42, width: 19 };
			const after: Partial<RackSettings> = { height: 48, width: 10 };

			const command = createUpdateRackCommand(before, after, store);
			command.execute();
			command.undo();

			expect(store.updateRackRaw).toHaveBeenCalledTimes(2);
			expect(store.updateRackRaw).toHaveBeenLastCalledWith(before);
		});
	});

	describe('createReplaceRackCommand', () => {
		it('creates command with correct type and description', () => {
			const store = createMockStore();
			const oldRack = createMockRack({ name: 'Old' });
			const newRack = createMockRack({ name: 'New' });

			const command = createReplaceRackCommand(oldRack, newRack, store);

			expect(command.type).toBe('REPLACE_RACK');
			expect(command.description).toBe('Replace rack');
			expect(typeof command.timestamp).toBe('number');
		});

		it('execute calls replaceRackRaw with new rack', () => {
			const store = createMockStore();
			const oldRack = createMockRack({ name: 'Old' });
			const newRack = createMockRack({ name: 'New', height: 48 });

			const command = createReplaceRackCommand(oldRack, newRack, store);
			command.execute();

			expect(store.replaceRackRaw).toHaveBeenCalledTimes(1);
			expect(store.replaceRackRaw).toHaveBeenCalledWith(
				expect.objectContaining({ name: 'New', height: 48 })
			);
		});

		it('undo calls replaceRackRaw with old rack', () => {
			const store = createMockStore();
			const oldRack = createMockRack({ name: 'Old', height: 42 });
			const newRack = createMockRack({ name: 'New', height: 48 });

			const command = createReplaceRackCommand(oldRack, newRack, store);
			command.execute();
			command.undo();

			expect(store.replaceRackRaw).toHaveBeenCalledTimes(2);
			expect(store.replaceRackRaw).toHaveBeenLastCalledWith(
				expect.objectContaining({ name: 'Old', height: 42 })
			);
		});

		it('deep copies racks to avoid mutation issues', () => {
			const store = createMockStore();
			const oldRack = createMockRack({
				devices: [createMockDevice({ position: 5 })]
			});
			const newRack = createMockRack({
				devices: [createMockDevice({ position: 10 })]
			});

			const command = createReplaceRackCommand(oldRack, newRack, store);

			// Mutate originals
			oldRack.devices[0].position = 99;
			newRack.devices[0].position = 88;

			command.execute();

			// Should use original values
			expect(store.replaceRackRaw).toHaveBeenCalledWith(
				expect.objectContaining({
					devices: expect.arrayContaining([expect.objectContaining({ position: 10 })])
				})
			);

			command.undo();

			expect(store.replaceRackRaw).toHaveBeenLastCalledWith(
				expect.objectContaining({
					devices: expect.arrayContaining([expect.objectContaining({ position: 5 })])
				})
			);
		});
	});

	describe('createClearRackCommand', () => {
		it('creates command with correct type and description for single device', () => {
			const store = createMockStore();
			const devices = [createMockDevice()];

			const command = createClearRackCommand(devices, store);

			expect(command.type).toBe('CLEAR_RACK');
			expect(command.description).toBe('Clear rack (1 device)');
		});

		it('creates command with correct description for multiple devices', () => {
			const store = createMockStore();
			const devices = [createMockDevice(), createMockDevice(), createMockDevice()];

			const command = createClearRackCommand(devices, store);

			expect(command.description).toBe('Clear rack (3 devices)');
		});

		it('creates command with correct description for empty rack', () => {
			const store = createMockStore();
			const devices: PlacedDevice[] = [];

			const command = createClearRackCommand(devices, store);

			expect(command.description).toBe('Clear rack (0 devices)');
		});

		it('execute calls clearRackDevicesRaw', () => {
			const store = createMockStore();
			const devices = [createMockDevice()];

			const command = createClearRackCommand(devices, store);
			command.execute();

			expect(store.clearRackDevicesRaw).toHaveBeenCalledTimes(1);
		});

		it('undo calls restoreRackDevicesRaw with device copies', () => {
			const store = createMockStore();
			const devices = [
				createMockDevice({ position: 5, device_type: 'device-a' }),
				createMockDevice({ position: 10, device_type: 'device-b' })
			];

			const command = createClearRackCommand(devices, store);
			command.execute();
			command.undo();

			expect(store.restoreRackDevicesRaw).toHaveBeenCalledTimes(1);
			expect(store.restoreRackDevicesRaw).toHaveBeenCalledWith([
				expect.objectContaining({ position: 5, device_type: 'device-a' }),
				expect.objectContaining({ position: 10, device_type: 'device-b' })
			]);
		});

		it('stores copies of devices to avoid mutation issues', () => {
			const store = createMockStore();
			const devices = [createMockDevice({ position: 5 })];

			const command = createClearRackCommand(devices, store);

			// Mutate original
			devices[0].position = 99;

			command.execute();
			command.undo();

			// Should restore with original position
			expect(store.restoreRackDevicesRaw).toHaveBeenCalledWith([
				expect.objectContaining({ position: 5 })
			]);
		});
	});
});
