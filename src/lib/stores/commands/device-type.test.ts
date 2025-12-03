import { describe, it, expect, vi } from 'vitest';
import {
	createAddDeviceTypeCommand,
	createUpdateDeviceTypeCommand,
	createDeleteDeviceTypeCommand,
	type DeviceTypeCommandStore
} from './device-type';
import type { DeviceTypeV02, DeviceV02 } from '$lib/types/v02';

function createMockDeviceType(overrides: Partial<DeviceTypeV02> = {}): DeviceTypeV02 {
	return {
		slug: 'test-device',
		height: 2,
		category: 'server',
		...overrides
	};
}

function createMockDevice(overrides: Partial<DeviceV02> = {}): DeviceV02 {
	return {
		device_type: 'test-device',
		position: 10,
		...overrides
	};
}

function createMockStore(): DeviceTypeCommandStore & {
	addDeviceTypeRaw: ReturnType<typeof vi.fn>;
	removeDeviceTypeRaw: ReturnType<typeof vi.fn>;
	updateDeviceTypeRaw: ReturnType<typeof vi.fn>;
	placeDeviceRaw: ReturnType<typeof vi.fn>;
	removeDeviceAtIndexRaw: ReturnType<typeof vi.fn>;
	getPlacedDevicesForType: ReturnType<typeof vi.fn>;
} {
	return {
		addDeviceTypeRaw: vi.fn(),
		removeDeviceTypeRaw: vi.fn(),
		updateDeviceTypeRaw: vi.fn(),
		placeDeviceRaw: vi.fn().mockReturnValue(0),
		removeDeviceAtIndexRaw: vi.fn(),
		getPlacedDevicesForType: vi.fn().mockReturnValue([])
	};
}

describe('Device Type Commands', () => {
	describe('createAddDeviceTypeCommand', () => {
		it('creates command with correct type and description', () => {
			const store = createMockStore();
			const deviceType = createMockDeviceType({ model: 'PowerEdge R740' });

			const command = createAddDeviceTypeCommand(deviceType, store);

			expect(command.type).toBe('ADD_DEVICE_TYPE');
			expect(command.description).toBe('Add PowerEdge R740');
			expect(typeof command.timestamp).toBe('number');
		});

		it('uses slug when model is not provided', () => {
			const store = createMockStore();
			const deviceType = createMockDeviceType({ slug: 'my-server' });

			const command = createAddDeviceTypeCommand(deviceType, store);

			expect(command.description).toBe('Add my-server');
		});

		it('execute calls addDeviceTypeRaw with device type', () => {
			const store = createMockStore();
			const deviceType = createMockDeviceType();

			const command = createAddDeviceTypeCommand(deviceType, store);
			command.execute();

			expect(store.addDeviceTypeRaw).toHaveBeenCalledTimes(1);
			expect(store.addDeviceTypeRaw).toHaveBeenCalledWith(deviceType);
		});

		it('undo calls removeDeviceTypeRaw with slug', () => {
			const store = createMockStore();
			const deviceType = createMockDeviceType({ slug: 'server-1' });

			const command = createAddDeviceTypeCommand(deviceType, store);
			command.execute();
			command.undo();

			expect(store.removeDeviceTypeRaw).toHaveBeenCalledTimes(1);
			expect(store.removeDeviceTypeRaw).toHaveBeenCalledWith('server-1');
		});
	});

	describe('createUpdateDeviceTypeCommand', () => {
		it('creates command with correct type and description', () => {
			const store = createMockStore();
			const before = { model: 'Old Model' };
			const after = { model: 'New Model' };

			const command = createUpdateDeviceTypeCommand('my-device', before, after, store);

			expect(command.type).toBe('UPDATE_DEVICE_TYPE');
			expect(command.description).toBe('Update my-device');
			expect(typeof command.timestamp).toBe('number');
		});

		it('execute calls updateDeviceTypeRaw with after values', () => {
			const store = createMockStore();
			const before = { model: 'Old Model' };
			const after = { model: 'New Model' };

			const command = createUpdateDeviceTypeCommand('my-device', before, after, store);
			command.execute();

			expect(store.updateDeviceTypeRaw).toHaveBeenCalledTimes(1);
			expect(store.updateDeviceTypeRaw).toHaveBeenCalledWith('my-device', after);
		});

		it('undo calls updateDeviceTypeRaw with before values', () => {
			const store = createMockStore();
			const before = { model: 'Old Model', height: 2 };
			const after = { model: 'New Model', height: 4 };

			const command = createUpdateDeviceTypeCommand('my-device', before, after, store);
			command.execute();
			command.undo();

			expect(store.updateDeviceTypeRaw).toHaveBeenCalledTimes(2);
			expect(store.updateDeviceTypeRaw).toHaveBeenLastCalledWith('my-device', before);
		});
	});

	describe('createDeleteDeviceTypeCommand', () => {
		it('creates command with correct type and description', () => {
			const store = createMockStore();
			const deviceType = createMockDeviceType({ model: 'Dell Server' });

			const command = createDeleteDeviceTypeCommand(deviceType, [], store);

			expect(command.type).toBe('DELETE_DEVICE_TYPE');
			expect(command.description).toBe('Delete Dell Server');
			expect(typeof command.timestamp).toBe('number');
		});

		it('uses slug when model is not provided', () => {
			const store = createMockStore();
			const deviceType = createMockDeviceType({ slug: 'rack-server' });

			const command = createDeleteDeviceTypeCommand(deviceType, [], store);

			expect(command.description).toBe('Delete rack-server');
		});

		it('execute calls removeDeviceTypeRaw', () => {
			const store = createMockStore();
			const deviceType = createMockDeviceType({ slug: 'test-slug' });

			const command = createDeleteDeviceTypeCommand(deviceType, [], store);
			command.execute();

			expect(store.removeDeviceTypeRaw).toHaveBeenCalledTimes(1);
			expect(store.removeDeviceTypeRaw).toHaveBeenCalledWith('test-slug');
		});

		it('undo restores device type', () => {
			const store = createMockStore();
			const deviceType = createMockDeviceType();

			const command = createDeleteDeviceTypeCommand(deviceType, [], store);
			command.execute();
			command.undo();

			expect(store.addDeviceTypeRaw).toHaveBeenCalledTimes(1);
			expect(store.addDeviceTypeRaw).toHaveBeenCalledWith(deviceType);
		});

		it('undo restores placed devices', () => {
			const store = createMockStore();
			const deviceType = createMockDeviceType({ slug: 'server-type' });
			const placedDevices: DeviceV02[] = [
				createMockDevice({ device_type: 'server-type', position: 5 }),
				createMockDevice({ device_type: 'server-type', position: 10 })
			];

			const command = createDeleteDeviceTypeCommand(deviceType, placedDevices, store);
			command.execute();
			command.undo();

			expect(store.placeDeviceRaw).toHaveBeenCalledTimes(2);
			expect(store.placeDeviceRaw).toHaveBeenCalledWith(
				expect.objectContaining({ device_type: 'server-type', position: 5 })
			);
			expect(store.placeDeviceRaw).toHaveBeenCalledWith(
				expect.objectContaining({ device_type: 'server-type', position: 10 })
			);
		});

		it('stores copies of placed devices to avoid mutation', () => {
			const store = createMockStore();
			const deviceType = createMockDeviceType();
			const placedDevices: DeviceV02[] = [createMockDevice({ position: 5 })];

			const command = createDeleteDeviceTypeCommand(deviceType, placedDevices, store);

			// Mutate original array
			placedDevices[0].position = 99;

			command.execute();
			command.undo();

			// Should restore with original position (5), not mutated (99)
			expect(store.placeDeviceRaw).toHaveBeenCalledWith(expect.objectContaining({ position: 5 }));
		});
	});
});
