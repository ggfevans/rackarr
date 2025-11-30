import { describe, it, expect, beforeEach } from 'vitest';
import { getLayoutStore, resetLayoutStore } from '$lib/stores/layout.svelte';
import { CURRENT_VERSION } from '$lib/types/constants';
import type { Device } from '$lib/types';

describe('Layout Store', () => {
	beforeEach(() => {
		// Reset the store before each test
		resetLayoutStore();
	});

	describe('initial state', () => {
		it('initializes with a default layout', () => {
			const store = getLayoutStore();
			expect(store.layout.name).toBe('Untitled');
			expect(store.layout.version).toBe(CURRENT_VERSION);
			expect(store.layout.racks).toEqual([]);
			// Now includes starter library (22 devices)
			expect(store.layout.deviceLibrary.length).toBe(22);
		});

		it('initializes isDirty as false', () => {
			const store = getLayoutStore();
			expect(store.isDirty).toBe(false);
		});

		it('initializes rackCount as 0', () => {
			const store = getLayoutStore();
			expect(store.rackCount).toBe(0);
		});

		it('initializes canAddRack as true', () => {
			const store = getLayoutStore();
			expect(store.canAddRack).toBe(true);
		});
	});

	describe('createNewLayout', () => {
		it('creates a new layout with the given name', () => {
			const store = getLayoutStore();
			store.createNewLayout('My Lab');
			expect(store.layout.name).toBe('My Lab');
		});

		it('resets racks to empty array', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			store.createNewLayout('New Layout');
			expect(store.racks).toEqual([]);
		});

		it('resets deviceLibrary to starter library', () => {
			const store = getLayoutStore();
			store.addDeviceToLibrary({ name: 'Test', height: 1, category: 'server', colour: '#4A90D9' });
			store.createNewLayout('New Layout');
			// Starter library has 22 devices
			expect(store.deviceLibrary.length).toBe(22);
		});

		it('sets isDirty to false', () => {
			const store = getLayoutStore();
			store.addRack('Test', 42);
			expect(store.isDirty).toBe(true);
			store.createNewLayout('New Layout');
			expect(store.isDirty).toBe(false);
		});
	});

	describe('loadLayout', () => {
		it('replaces the current layout with the provided one', () => {
			const store = getLayoutStore();
			const newLayout = {
				version: '1.0',
				name: 'Loaded Layout',
				created: '2025-01-01T00:00:00.000Z',
				modified: '2025-01-01T00:00:00.000Z',
				settings: { theme: 'light' as const },
				deviceLibrary: [],
				racks: []
			};
			store.loadLayout(newLayout);
			expect(store.layout.name).toBe('Loaded Layout');
			expect(store.layout.settings.theme).toBe('light');
		});

		it('sets isDirty to false', () => {
			const store = getLayoutStore();
			store.addRack('Test', 42);
			expect(store.isDirty).toBe(true);
			store.loadLayout({
				version: '1.0',
				name: 'Loaded',
				created: '2025-01-01T00:00:00.000Z',
				modified: '2025-01-01T00:00:00.000Z',
				settings: { theme: 'dark' },
				deviceLibrary: [],
				racks: []
			});
			expect(store.isDirty).toBe(false);
		});

		it('migrates v0.1 layout by adding view property to racks', () => {
			const store = getLayoutStore();
			const v01Layout = {
				version: '0.1.0',
				name: 'Old Layout',
				created: '2025-01-01T00:00:00.000Z',
				modified: '2025-01-01T00:00:00.000Z',
				settings: { theme: 'dark' as const },
				deviceLibrary: [],
				racks: [
					{
						id: 'rack-1',
						name: 'Test Rack',
						height: 42,
						width: 19,
						position: 0,
						devices: []
					}
				]
			} as unknown as Layout;
			store.loadLayout(v01Layout);
			expect(store.racks[0].view).toBe('front');
		});

		it('migrates v0.1 layout by adding face property to placed devices', () => {
			const store = getLayoutStore();
			const v01Layout = {
				version: '0.1.0',
				name: 'Old Layout',
				created: '2025-01-01T00:00:00.000Z',
				modified: '2025-01-01T00:00:00.000Z',
				settings: { theme: 'dark' as const },
				deviceLibrary: [],
				racks: [
					{
						id: 'rack-1',
						name: 'Test Rack',
						height: 42,
						width: 19,
						position: 0,
						devices: [{ libraryId: 'device-1', position: 5 }]
					}
				]
			} as unknown as Layout;
			store.loadLayout(v01Layout);
			expect(store.racks[0].devices[0].face).toBe('front');
		});

		it('updates version to current version after migration', () => {
			const store = getLayoutStore();
			const v01Layout = {
				version: '0.1.0',
				name: 'Old Layout',
				created: '2025-01-01T00:00:00.000Z',
				modified: '2025-01-01T00:00:00.000Z',
				settings: { theme: 'dark' as const },
				deviceLibrary: [],
				racks: []
			} as unknown as Layout;
			store.loadLayout(v01Layout);
			expect(store.layout.version).toBe(CURRENT_VERSION);
		});
	});

	describe('addRack', () => {
		it('creates rack with correct properties', () => {
			const store = getLayoutStore();
			const rack = store.addRack('Main Rack', 42);
			expect(rack).not.toBeNull();
			expect(rack!.name).toBe('Main Rack');
			expect(rack!.height).toBe(42);
			expect(rack!.width).toBe(19);
			expect(rack!.devices).toEqual([]);
			expect(rack!.id).toMatch(/^[0-9a-f-]{36}$/);
		});

		it('adds rack to racks array', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			expect(store.racks).toHaveLength(1);
			expect(store.rackCount).toBe(1);
		});

		it('sets position to next available', () => {
			const store = getLayoutStore();
			store.addRack('First', 42);
			const second = store.addRack('Second', 24);
			expect(second!.position).toBe(1);
		});

		it('returns null when 6 racks exist', () => {
			const store = getLayoutStore();
			for (let i = 0; i < 6; i++) {
				store.addRack(`Rack ${i}`, 42);
			}
			expect(store.canAddRack).toBe(false);
			const result = store.addRack('Seventh', 42);
			expect(result).toBeNull();
			expect(store.rackCount).toBe(6);
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			expect(store.isDirty).toBe(false);
			store.addRack('Test', 42);
			expect(store.isDirty).toBe(true);
		});
	});

	describe('updateRack', () => {
		it('modifies rack properties', () => {
			const store = getLayoutStore();
			const rack = store.addRack('Original', 42);
			store.updateRack(rack!.id, { name: 'Updated', height: 24 });
			expect(store.racks[0]!.name).toBe('Updated');
			expect(store.racks[0]!.height).toBe(24);
		});

		it('does not affect other rack properties', () => {
			const store = getLayoutStore();
			const rack = store.addRack('Original', 42);
			store.updateRack(rack!.id, { name: 'Updated' });
			expect(store.racks[0]!.height).toBe(42);
			expect(store.racks[0]!.width).toBe(19);
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			const rack = store.addRack('Test', 42);
			store.markClean();
			store.updateRack(rack!.id, { name: 'Updated' });
			expect(store.isDirty).toBe(true);
		});
	});

	describe('deleteRack', () => {
		it('removes rack from layout', () => {
			const store = getLayoutStore();
			const rack = store.addRack('To Delete', 42);
			expect(store.rackCount).toBe(1);
			store.deleteRack(rack!.id);
			expect(store.rackCount).toBe(0);
		});

		it('updates positions of remaining racks', () => {
			const store = getLayoutStore();
			const first = store.addRack('First', 42);
			store.addRack('Second', 24);
			store.addRack('Third', 18);
			store.deleteRack(first!.id);
			expect(store.racks[0]!.position).toBe(0);
			expect(store.racks[1]!.position).toBe(1);
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			const rack = store.addRack('Test', 42);
			store.markClean();
			store.deleteRack(rack!.id);
			expect(store.isDirty).toBe(true);
		});
	});

	describe('reorderRacks', () => {
		it('swaps rack positions correctly', () => {
			const store = getLayoutStore();
			const first = store.addRack('First', 42);
			const second = store.addRack('Second', 24);
			const third = store.addRack('Third', 18);

			store.reorderRacks(0, 2);

			// Find racks by original ID
			const firstRack = store.racks.find((r) => r.id === first!.id);
			const secondRack = store.racks.find((r) => r.id === second!.id);
			const thirdRack = store.racks.find((r) => r.id === third!.id);

			expect(firstRack!.position).toBe(2);
			expect(secondRack!.position).toBe(1);
			expect(thirdRack!.position).toBe(0);
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			store.addRack('First', 42);
			store.addRack('Second', 24);
			store.markClean();
			store.reorderRacks(0, 1);
			expect(store.isDirty).toBe(true);
		});
	});

	describe('addDeviceToLibrary', () => {
		it('generates ID and adds device', () => {
			const store = getLayoutStore();
			const initialCount = store.deviceLibrary.length; // 22 from starter library
			const device = store.addDeviceToLibrary({
				name: 'Test Server',
				height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			expect(device.id).toMatch(/^[0-9a-f-]{36}$/);
			expect(store.deviceLibrary).toHaveLength(initialCount + 1);
			// New device is added at the end
			const addedDevice = store.deviceLibrary.find((d) => d.id === device.id);
			expect(addedDevice?.name).toBe('Test Server');
		});

		it('preserves all provided properties', () => {
			const store = getLayoutStore();
			const device = store.addDeviceToLibrary({
				name: 'Test Server',
				height: 2,
				category: 'server',
				colour: '#FF0000',
				notes: 'Test notes'
			});
			expect(device.colour).toBe('#FF0000');
			expect(device.notes).toBe('Test notes');
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			store.addDeviceToLibrary({
				name: 'Test',
				height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			expect(store.isDirty).toBe(true);
		});
	});

	describe('updateDeviceInLibrary', () => {
		it('modifies device properties', () => {
			const store = getLayoutStore();
			const device = store.addDeviceToLibrary({
				name: 'Original',
				height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.updateDeviceInLibrary(device.id, { name: 'Updated', height: 2 });
			const updatedDevice = store.deviceLibrary.find((d) => d.id === device.id);
			expect(updatedDevice?.name).toBe('Updated');
			expect(updatedDevice?.height).toBe(2);
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			const device = store.addDeviceToLibrary({
				name: 'Test',
				height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.markClean();
			store.updateDeviceInLibrary(device.id, { name: 'Updated' });
			expect(store.isDirty).toBe(true);
		});
	});

	describe('deleteDeviceFromLibrary', () => {
		it('removes device from library', () => {
			const store = getLayoutStore();
			const initialCount = store.deviceLibrary.length; // 22 from starter library
			const device = store.addDeviceToLibrary({
				name: 'To Delete',
				height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			expect(store.deviceLibrary).toHaveLength(initialCount + 1);
			store.deleteDeviceFromLibrary(device.id);
			expect(store.deviceLibrary).toHaveLength(initialCount);
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			const device = store.addDeviceToLibrary({
				name: 'Test',
				height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.markClean();
			store.deleteDeviceFromLibrary(device.id);
			expect(store.isDirty).toBe(true);
		});
	});

	describe('placeDevice', () => {
		let store: ReturnType<typeof getLayoutStore>;
		let device: Device;
		let rackId: string;

		beforeEach(() => {
			store = getLayoutStore();
			device = store.addDeviceToLibrary({
				name: 'Test Server',
				height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			const rack = store.addRack('Test Rack', 42);
			rackId = rack!.id;
			store.markClean();
		});

		it('adds device to rack at position', () => {
			const result = store.placeDevice(rackId, device.id, 5);
			expect(result).toBe(true);
			expect(store.racks[0]!.devices).toHaveLength(1);
			expect(store.racks[0]!.devices[0]!.libraryId).toBe(device.id);
			expect(store.racks[0]!.devices[0]!.position).toBe(5);
		});

		it('places device with default front face', () => {
			const result = store.placeDevice(rackId, device.id, 5);
			expect(result).toBe(true);
			expect(store.racks[0]!.devices[0]!.face).toBe('front');
		});

		it('places device with specified rear face', () => {
			const result = store.placeDevice(rackId, device.id, 5, 'rear');
			expect(result).toBe(true);
			expect(store.racks[0]!.devices[0]!.face).toBe('rear');
		});

		it('places device with specified both face', () => {
			const result = store.placeDevice(rackId, device.id, 5, 'both');
			expect(result).toBe(true);
			expect(store.racks[0]!.devices[0]!.face).toBe('both');
		});

		it('returns false for invalid position (collision)', () => {
			store.placeDevice(rackId, device.id, 5);

			const device2 = store.addDeviceToLibrary({
				name: 'Another Server',
				height: 2,
				category: 'server',
				colour: '#4A90D9'
			});

			// device at 5 occupies 5,6. Position 6 would collide.
			const result = store.placeDevice(rackId, device2.id, 6);
			expect(result).toBe(false);
			expect(store.racks[0]!.devices).toHaveLength(1);
		});

		it('returns false for invalid position (exceeds rack)', () => {
			// 2U device at position 42 would occupy 42,43 but rack only has 42
			const result = store.placeDevice(rackId, device.id, 42);
			expect(result).toBe(false);
		});

		it('returns false for position less than 1', () => {
			const result = store.placeDevice(rackId, device.id, 0);
			expect(result).toBe(false);
		});

		it('sets isDirty to true on success', () => {
			expect(store.isDirty).toBe(false);
			store.placeDevice(rackId, device.id, 5);
			expect(store.isDirty).toBe(true);
		});
	});

	describe('moveDevice', () => {
		let store: ReturnType<typeof getLayoutStore>;
		let device: Device;
		let rackId: string;

		beforeEach(() => {
			store = getLayoutStore();
			device = store.addDeviceToLibrary({
				name: 'Test Server',
				height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			const rack = store.addRack('Test Rack', 42);
			rackId = rack!.id;
			store.placeDevice(rackId, device.id, 5);
			store.markClean();
		});

		it('updates device position within rack', () => {
			const result = store.moveDevice(rackId, 0, 10);
			expect(result).toBe(true);
			expect(store.racks[0]!.devices[0]!.position).toBe(10);
		});

		it('returns false for collision', () => {
			const device2 = store.addDeviceToLibrary({
				name: 'Another',
				height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice(rackId, device2.id, 10);

			// Try to move first device to 10 (would collide with second device)
			const result = store.moveDevice(rackId, 0, 10);
			expect(result).toBe(false);
			expect(store.racks[0]!.devices[0]!.position).toBe(5);
		});

		it('sets isDirty to true on success', () => {
			expect(store.isDirty).toBe(false);
			store.moveDevice(rackId, 0, 10);
			expect(store.isDirty).toBe(true);
		});
	});

	describe('moveDeviceToRack', () => {
		let store: ReturnType<typeof getLayoutStore>;
		let device: Device;
		let sourceRackId: string;
		let targetRackId: string;

		beforeEach(() => {
			store = getLayoutStore();
			device = store.addDeviceToLibrary({
				name: 'Test Server',
				height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			const sourceRack = store.addRack('Source Rack', 42);
			const targetRack = store.addRack('Target Rack', 42);
			sourceRackId = sourceRack!.id;
			targetRackId = targetRack!.id;
			store.placeDevice(sourceRackId, device.id, 5);
			store.markClean();
		});

		it('transfers device between racks', () => {
			const result = store.moveDeviceToRack(sourceRackId, 0, targetRackId, 10);
			expect(result).toBe(true);

			// Source rack should be empty
			const sourceRack = store.racks.find((r) => r.id === sourceRackId);
			expect(sourceRack!.devices).toHaveLength(0);

			// Target rack should have the device
			const targetRack = store.racks.find((r) => r.id === targetRackId);
			expect(targetRack!.devices).toHaveLength(1);
			expect(targetRack!.devices[0]!.libraryId).toBe(device.id);
			expect(targetRack!.devices[0]!.position).toBe(10);
		});

		it('preserves face property when moving between racks', () => {
			// The device should have been placed with default front face
			const sourceRack = store.racks.find((r) => r.id === sourceRackId);
			expect(sourceRack!.devices[0]!.face).toBe('front');

			const result = store.moveDeviceToRack(sourceRackId, 0, targetRackId, 10);
			expect(result).toBe(true);

			// Target rack should preserve the face
			const targetRack = store.racks.find((r) => r.id === targetRackId);
			expect(targetRack!.devices[0]!.face).toBe('front');
		});

		it('returns false for collision in target rack', () => {
			const device2 = store.addDeviceToLibrary({
				name: 'Blocking Device',
				height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice(targetRackId, device2.id, 10);

			const result = store.moveDeviceToRack(sourceRackId, 0, targetRackId, 10);
			expect(result).toBe(false);

			// Device should still be in source rack
			const sourceRack = store.racks.find((r) => r.id === sourceRackId);
			expect(sourceRack!.devices).toHaveLength(1);
		});

		it('sets isDirty to true on success', () => {
			expect(store.isDirty).toBe(false);
			store.moveDeviceToRack(sourceRackId, 0, targetRackId, 10);
			expect(store.isDirty).toBe(true);
		});
	});

	describe('removeDeviceFromRack', () => {
		it('removes device from rack', () => {
			const store = getLayoutStore();
			const device = store.addDeviceToLibrary({
				name: 'Test',
				height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			const rack = store.addRack('Test Rack', 42);
			store.placeDevice(rack!.id, device.id, 5);

			expect(store.racks[0]!.devices).toHaveLength(1);
			store.removeDeviceFromRack(rack!.id, 0);
			expect(store.racks[0]!.devices).toHaveLength(0);
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			const device = store.addDeviceToLibrary({
				name: 'Test',
				height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			const rack = store.addRack('Test Rack', 42);
			store.placeDevice(rack!.id, device.id, 5);
			store.markClean();

			store.removeDeviceFromRack(rack!.id, 0);
			expect(store.isDirty).toBe(true);
		});
	});

	describe('dirty tracking', () => {
		it('markDirty sets isDirty to true', () => {
			const store = getLayoutStore();
			expect(store.isDirty).toBe(false);
			store.markDirty();
			expect(store.isDirty).toBe(true);
		});

		it('markClean sets isDirty to false', () => {
			const store = getLayoutStore();
			store.markDirty();
			expect(store.isDirty).toBe(true);
			store.markClean();
			expect(store.isDirty).toBe(false);
		});
	});

	describe('duplicateRack', () => {
		it('duplicates rack and adds to layout', () => {
			const store = getLayoutStore();
			const rack = store.addRack('Test Rack', 42);
			expect(store.racks).toHaveLength(1);

			store.duplicateRack(rack!.id);
			expect(store.racks).toHaveLength(2);
		});

		it('returns error when 6 racks exist', () => {
			const store = getLayoutStore();
			// Create 6 racks (maximum allowed)
			for (let i = 0; i < 6; i++) {
				store.addRack(`Rack ${i}`, 42);
			}
			expect(store.racks).toHaveLength(6);

			// Try to duplicate when at max
			const result = store.duplicateRack(store.racks[0]!.id);
			expect(result.error).toBe('Maximum of 6 racks allowed');
			expect(store.racks).toHaveLength(6);
		});
	});

	describe('resetLayout', () => {
		it('resets to initial state', () => {
			const store = getLayoutStore();
			store.addRack('Test', 42);
			store.addDeviceToLibrary({
				name: 'Test',
				height: 1,
				category: 'server',
				colour: '#4A90D9'
			});

			resetLayoutStore();
			const freshStore = getLayoutStore();

			expect(freshStore.layout.name).toBe('Untitled');
			expect(freshStore.racks).toEqual([]);
			// Starter library has 22 devices
			expect(freshStore.deviceLibrary.length).toBe(22);
			expect(freshStore.isDirty).toBe(false);
		});
	});
});
