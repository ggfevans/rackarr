import { describe, it, expect, beforeEach } from 'vitest';
import { getLayoutStore, resetLayoutStore } from '$lib/stores/layout.svelte';
import type { Layout } from '$lib/types';
import type { Layout } from '$lib/types/v02';

describe('Layout Store (v0.2)', () => {
	beforeEach(() => {
		// Reset the store before each test
		resetLayoutStore();
	});

	describe('initial state', () => {
		it('initializes with a v0.2 layout', () => {
			const store = getLayoutStore();
			expect(store.layout.name).toBe('Racky McRackface');
			expect(store.layout.version).toBe('0.2.0');
			// v0.2 has a single rack, not an array
			expect(store.layout.rack).toBeDefined();
			expect(store.layout.rack.devices).toEqual([]);
			// Starter library has 27 device types
			expect(store.layout.device_types.length).toBe(27);
		});

		it('initializes isDirty as false', () => {
			const store = getLayoutStore();
			expect(store.isDirty).toBe(false);
		});

		it('initializes hasRack as true', () => {
			const store = getLayoutStore();
			expect(store.hasRack).toBe(true);
		});

		it('compatibility: rackCount is 0 before user starts, 1 after', () => {
			const store = getLayoutStore();
			// Before user starts, rackCount is 0 (WelcomeScreen shown)
			expect(store.rackCount).toBe(0);
			expect(store.hasStarted).toBe(false);
			// After user starts, rackCount is 1
			store.markStarted();
			expect(store.rackCount).toBe(1);
			expect(store.hasStarted).toBe(true);
		});

		it('compatibility: canAddRack is false', () => {
			const store = getLayoutStore();
			expect(store.canAddRack).toBe(false);
		});

		it('compatibility: racks returns single rack in array', () => {
			const store = getLayoutStore();
			expect(store.racks).toHaveLength(1);
			expect(store.racks[0].name).toBe('Racky McRackface');
		});
	});

	describe('createNewLayout', () => {
		it('creates a new layout with the given name', () => {
			const store = getLayoutStore();
			store.createNewLayout('My Lab');
			expect(store.layout.name).toBe('My Lab');
		});

		it('initializes with default rack', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			store.createNewLayout('New Layout');
			// v0.2 always has a rack, but devices should be empty
			expect(store.layout.rack.devices).toEqual([]);
		});

		it('resets device_types to starter library', () => {
			const store = getLayoutStore();
			store.addDeviceType({
				name: 'Test',
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.createNewLayout('New Layout');
			// Starter library has 27 device types
			expect(store.device_types.length).toBe(27);
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
		it('loads a v0.2 layout directly', () => {
			const store = getLayoutStore();
			const v02Layout: Layout = {
				version: '0.2.0',
				name: 'Test Layout',
				rack: {
					name: 'Test Rack',
					height: 24,
					width: 19,
					desc_units: false,
					form_factor: '4-post-cabinet',
					starting_unit: 1,
					position: 0,
					devices: []
				},
				device_types: [],
				settings: {
					display_mode: 'label',
					show_labels_on_images: false
				}
			};
			store.loadLayout(v02Layout);
			expect(store.layout.name).toBe('Test Layout');
			expect(store.layout.rack.height).toBe(24);
		});

		it('sets isDirty to false', () => {
			const store = getLayoutStore();
			store.markDirty();
			expect(store.isDirty).toBe(true);
			store.loadLayout({
				version: '0.2.0',
				name: 'Test',
				rack: {
					name: 'Test',
					height: 42,
					width: 19,
					desc_units: false,
					form_factor: '4-post-cabinet',
					starting_unit: 1,
					position: 0,
					devices: []
				},
				device_types: [],
				settings: {
					display_mode: 'label',
					show_labels_on_images: false
				}
			});
			expect(store.isDirty).toBe(false);
		});
	});

	describe('loadLegacyLayout', () => {
		it('migrates legacy layout to v0.2', () => {
			const store = getLayoutStore();
			const legacyLayout = {
				version: '0.2.0',
				name: 'Loaded Layout',
				created: '2025-01-01T00:00:00.000Z',
				modified: '2025-01-01T00:00:00.000Z',
				settings: { theme: 'light' as const },
				deviceLibrary: [],
				racks: []
			};
			store.loadLegacyLayout(legacyLayout);
			expect(store.layout.name).toBe('Loaded Layout');
			expect(store.layout.version).toBe('0.2.0');
		});

		it('sets isDirty to false', () => {
			const store = getLayoutStore();
			store.addRack('Test', 42);
			expect(store.isDirty).toBe(true);
			store.loadLegacyLayout({
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

		it('migrates v0.1 layout by adding view property', () => {
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
			store.loadLegacyLayout(v01Layout);
			expect(store.layout.rack.view).toBe('front');
		});

		it('migrates v0.1 layout by adding face property to placed devices', () => {
			const store = getLayoutStore();
			const v01Layout = {
				version: '0.1.0',
				name: 'Old Layout',
				created: '2025-01-01T00:00:00.000Z',
				modified: '2025-01-01T00:00:00.000Z',
				settings: { theme: 'dark' as const },
				deviceLibrary: [
					{
						id: 'device-1',
						name: 'Test Server',
						height: 2,
						category: 'server',
						colour: '#4A90D9'
					}
				],
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
			store.loadLegacyLayout(v01Layout);
			expect(store.layout.rack.devices[0]?.face).toBe('front');
		});

		it('loads only first rack from multi-rack file', () => {
			const store = getLayoutStore();
			const multiRackLayout = {
				version: '0.2.0',
				name: 'Multi-Rack Layout',
				created: new Date().toISOString(),
				modified: new Date().toISOString(),
				settings: { theme: 'dark' as const },
				deviceLibrary: [],
				racks: [
					{
						id: 'rack-1',
						name: 'First Rack',
						height: 42,
						width: 19,
						position: 0,
						view: 'front' as const,
						devices: []
					},
					{
						id: 'rack-2',
						name: 'Second Rack',
						height: 24,
						width: 19,
						position: 1,
						view: 'front' as const,
						devices: []
					}
				]
			};

			store.loadLegacyLayout(multiRackLayout);

			// v0.2 has single rack
			expect(store.layout.rack.name).toBe('First Rack');
		});

		it('returns original rack count from multi-rack file', () => {
			const store = getLayoutStore();
			const multiRackLayout = {
				version: '0.2.0',
				name: 'Test',
				created: new Date().toISOString(),
				modified: new Date().toISOString(),
				settings: { theme: 'dark' as const },
				deviceLibrary: [],
				racks: [
					{
						id: 'rack-1',
						name: 'Rack 1',
						height: 42,
						width: 19,
						position: 0,
						view: 'front' as const,
						devices: []
					},
					{
						id: 'rack-2',
						name: 'Rack 2',
						height: 24,
						width: 19,
						position: 1,
						view: 'front' as const,
						devices: []
					}
				]
			};

			const originalCount = store.loadLegacyLayout(multiRackLayout);

			expect(originalCount).toBe(2);
		});

		it('preserves full device library from multi-rack file', () => {
			const store = getLayoutStore();
			const multiRackLayout = {
				version: '0.2.0',
				name: 'Test',
				created: new Date().toISOString(),
				modified: new Date().toISOString(),
				settings: { theme: 'dark' as const },
				deviceLibrary: [
					{
						id: 'dev-1',
						name: 'Server',
						height: 2,
						category: 'server' as const,
						colour: '#4A90D9'
					},
					{
						id: 'dev-2',
						name: 'Switch',
						height: 1,
						category: 'network' as const,
						colour: '#50C878'
					}
				],
				racks: [
					{
						id: 'rack-1',
						name: 'Rack 1',
						height: 42,
						width: 19,
						position: 0,
						view: 'front' as const,
						devices: []
					}
				]
			};

			store.loadLegacyLayout(multiRackLayout);

			// All device types preserved (migrated from deviceLibrary)
			expect(store.device_types).toHaveLength(2);
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
			// v0.2 uses synthetic id for compatibility
			expect(rack!.id).toBe('rack-0');
		});

		it('updates the rack in layout', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			expect(store.layout.rack.name).toBe('Test Rack');
			expect(store.layout.rack.height).toBe(42);
		});

		it('always succeeds in v0.2 (replaces existing rack)', () => {
			const store = getLayoutStore();
			store.addRack('First Rack', 42);
			const result = store.addRack('Second', 24);
			// In v0.2, addRack replaces the rack
			expect(result).not.toBeNull();
			expect(store.layout.rack.name).toBe('Second');
			expect(store.layout.rack.height).toBe(24);
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
			store.addRack('Original', 42);
			store.updateRack('rack-0', { name: 'Updated', height: 24 });
			expect(store.layout.rack.name).toBe('Updated');
			expect(store.layout.rack.height).toBe(24);
		});

		it('does not affect other rack properties', () => {
			const store = getLayoutStore();
			store.addRack('Original', 42);
			store.updateRack('rack-0', { name: 'Updated' });
			expect(store.layout.rack.height).toBe(42);
			expect(store.layout.rack.width).toBe(19);
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			store.addRack('Test', 42);
			store.markClean();
			store.updateRack('rack-0', { name: 'Updated' });
			expect(store.isDirty).toBe(true);
		});
	});

	describe('deleteRack', () => {
		it('clears devices from rack in v0.2', () => {
			const store = getLayoutStore();
			store.addRack('To Delete', 42);
			const device = store.addDeviceType({
				name: 'Test',
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', device.slug, 5);
			expect(store.layout.rack.devices).toHaveLength(1);
			store.deleteRack('rack-0');
			expect(store.layout.rack.devices).toHaveLength(0);
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			store.addRack('Test', 42);
			store.markClean();
			store.deleteRack('rack-0');
			expect(store.isDirty).toBe(true);
		});
	});

	describe('reorderRacks', () => {
		it('is a no-op in v0.2 (single rack)', () => {
			const store = getLayoutStore();
			store.addRack('Only Rack', 42);
			store.markClean();
			store.reorderRacks(0, 1); // No-op - only one rack
			// isDirty should not change since no actual reorder happened
			expect(store.isDirty).toBe(false);
		});
	});

	describe('addDeviceType', () => {
		it('generates slug and adds device type', () => {
			const store = getLayoutStore();
			const initialCount = store.device_types.length;
			const deviceType = store.addDeviceType({
				name: 'Test Server',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			expect(deviceType.slug).toBe('test-server');
			expect(store.device_types).toHaveLength(initialCount + 1);
			const addedType = store.device_types.find((dt) => dt.slug === deviceType.slug);
			expect(addedType?.u_height).toBe(2);
		});

		it('preserves all provided properties', () => {
			const store = getLayoutStore();
			const deviceType = store.addDeviceType({
				name: 'Test Server',
				u_height: 2,
				category: 'server',
				colour: '#FF0000',
				comments: 'Test notes'
			});
			expect(deviceType.rackarr.colour).toBe('#FF0000');
			expect(deviceType.comments).toBe('Test notes');
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			store.addDeviceType({
				name: 'Test',
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			expect(store.isDirty).toBe(true);
		});
	});

	describe('addDeviceToLibrary (legacy compatibility)', () => {
		it('generates slug and adds device', () => {
			const store = getLayoutStore();
			const initialCount = store.deviceLibrary.length;
			const device = store.addDeviceToLibrary({
				name: 'Test Server',
				height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			// ID is now a slug
			expect(device.id).toBe('test-server');
			expect(store.deviceLibrary).toHaveLength(initialCount + 1);
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
	});

	describe('updateDeviceType', () => {
		it('modifies device type properties', () => {
			const store = getLayoutStore();
			const deviceType = store.addDeviceType({
				name: 'Original',
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.updateDeviceType(deviceType.slug, { u_height: 2 });
			const updated = store.device_types.find((dt) => dt.slug === deviceType.slug);
			expect(updated?.u_height).toBe(2);
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.markClean();
			store.updateDeviceType(deviceType.slug, { u_height: 2 });
			expect(store.isDirty).toBe(true);
		});
	});

	describe('deleteDeviceType', () => {
		it('removes device type from library', () => {
			const store = getLayoutStore();
			const initialCount = store.device_types.length;
			const deviceType = store.addDeviceType({
				name: 'To Delete',
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			expect(store.device_types).toHaveLength(initialCount + 1);
			store.deleteDeviceType(deviceType.slug);
			expect(store.device_types).toHaveLength(initialCount);
		});

		it('also removes placed devices referencing the type', () => {
			const store = getLayoutStore();
			store.addRack('Test', 42);
			const deviceType = store.addDeviceType({
				name: 'To Delete',
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);
			expect(store.layout.rack.devices).toHaveLength(1);
			store.deleteDeviceType(deviceType.slug);
			expect(store.layout.rack.devices).toHaveLength(0);
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.markClean();
			store.deleteDeviceType(deviceType.slug);
			expect(store.isDirty).toBe(true);
		});
	});

	describe('placeDevice', () => {
		beforeEach(() => {
			resetLayoutStore();
		});

		it('adds device to rack at position', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test Server',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.markClean();

			const result = store.placeDevice('rack-0', deviceType.slug, 5);
			expect(result).toBe(true);
			expect(store.layout.rack.devices).toHaveLength(1);
			expect(store.layout.rack.devices[0]!.device_type).toBe(deviceType.slug);
			expect(store.layout.rack.devices[0]!.position).toBe(5);
		});

		it('places device with default front face', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);
			expect(store.layout.rack.devices[0]!.face).toBe('front');
		});

		it('places device with specified rear face', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5, 'rear');
			expect(store.layout.rack.devices[0]!.face).toBe('rear');
		});

		it('places device with specified both face', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5, 'both');
			expect(store.layout.rack.devices[0]!.face).toBe('both');
		});

		it('returns false for invalid position (collision)', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);

			const deviceType2 = store.addDeviceType({
				name: 'Another',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});

			// device at 5 occupies 5,6. Position 6 would collide.
			const result = store.placeDevice('rack-0', deviceType2.slug, 6);
			expect(result).toBe(false);
			expect(store.layout.rack.devices).toHaveLength(1);
		});

		it('returns false for invalid position (exceeds rack)', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			// 2U device at position 42 would occupy 42,43 but rack only has 42
			const result = store.placeDevice('rack-0', deviceType.slug, 42);
			expect(result).toBe(false);
		});

		it('returns false for position less than 1', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			const result = store.placeDevice('rack-0', deviceType.slug, 0);
			expect(result).toBe(false);
		});

		it('sets isDirty to true on success', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.markClean();
			expect(store.isDirty).toBe(false);
			store.placeDevice('rack-0', deviceType.slug, 5);
			expect(store.isDirty).toBe(true);
		});
	});

	describe('moveDevice', () => {
		beforeEach(() => {
			resetLayoutStore();
		});

		it('updates device position within rack', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);
			store.markClean();

			const result = store.moveDevice('rack-0', 0, 10);
			expect(result).toBe(true);
			expect(store.layout.rack.devices[0]!.position).toBe(10);
		});

		it('returns false for collision', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);

			const deviceType2 = store.addDeviceType({
				name: 'Another',
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType2.slug, 10);

			// Try to move first device to 10 (would collide with second device)
			const result = store.moveDevice('rack-0', 0, 10);
			expect(result).toBe(false);
			expect(store.layout.rack.devices[0]!.position).toBe(5);
		});

		it('sets isDirty to true on success', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);
			store.markClean();
			expect(store.isDirty).toBe(false);
			store.moveDevice('rack-0', 0, 10);
			expect(store.isDirty).toBe(true);
		});
	});

	describe('moveDeviceToRack', () => {
		it('delegates to moveDevice for same-rack moves', () => {
			const store = getLayoutStore();
			store.addRack('Only Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);
			store.markClean();

			// Same rack move should work (delegates to moveDevice)
			const result = store.moveDeviceToRack('rack-0', 0, 'rack-0', 10);
			expect(result).toBe(true);
			expect(store.layout.rack.devices[0]!.position).toBe(10);
		});
	});

	describe('removeDeviceFromRack', () => {
		it('removes device from rack', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);

			expect(store.layout.rack.devices).toHaveLength(1);
			store.removeDeviceFromRack('rack-0', 0);
			expect(store.layout.rack.devices).toHaveLength(0);
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Test',
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);
			store.markClean();

			store.removeDeviceFromRack('rack-0', 0);
			expect(store.isDirty).toBe(true);
		});
	});

	describe('updateDeviceName', () => {
		it('updates placed device name', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Generic Server',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);

			// Device should not have a custom name initially
			expect(store.layout.rack.devices[0]!.name).toBeUndefined();

			// Set a custom name
			store.updateDeviceName('rack-0', 0, 'Primary DB Server');
			expect(store.layout.rack.devices[0]!.name).toBe('Primary DB Server');
		});

		it('clears custom name when set to undefined', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Generic Server',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);

			// Set a custom name first
			store.updateDeviceName('rack-0', 0, 'Primary DB Server');
			expect(store.layout.rack.devices[0]!.name).toBe('Primary DB Server');

			// Clear the custom name
			store.updateDeviceName('rack-0', 0, undefined);
			expect(store.layout.rack.devices[0]!.name).toBeUndefined();
		});

		it('clears custom name when set to empty string', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Generic Server',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);

			store.updateDeviceName('rack-0', 0, 'Primary DB Server');
			store.updateDeviceName('rack-0', 0, '');
			expect(store.layout.rack.devices[0]!.name).toBeUndefined();
		});

		it('sets isDirty to true', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Generic Server',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);
			store.markClean();

			store.updateDeviceName('rack-0', 0, 'Primary DB Server');
			expect(store.isDirty).toBe(true);
		});

		it('supports undo/redo for name changes', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Generic Server',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);

			// Set a custom name
			store.updateDeviceName('rack-0', 0, 'Primary DB Server');
			expect(store.layout.rack.devices[0]!.name).toBe('Primary DB Server');

			// Undo should restore undefined
			store.undo();
			expect(store.layout.rack.devices[0]!.name).toBeUndefined();

			// Redo should restore the name
			store.redo();
			expect(store.layout.rack.devices[0]!.name).toBe('Primary DB Server');
		});

		it('preserves name through multiple updates with undo', () => {
			const store = getLayoutStore();
			store.addRack('Test Rack', 42);
			const deviceType = store.addDeviceType({
				name: 'Generic Server',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice('rack-0', deviceType.slug, 5);

			store.updateDeviceName('rack-0', 0, 'First Name');
			store.updateDeviceName('rack-0', 0, 'Second Name');
			store.updateDeviceName('rack-0', 0, 'Third Name');

			expect(store.layout.rack.devices[0]!.name).toBe('Third Name');

			store.undo();
			expect(store.layout.rack.devices[0]!.name).toBe('Second Name');

			store.undo();
			expect(store.layout.rack.devices[0]!.name).toBe('First Name');

			store.undo();
			expect(store.layout.rack.devices[0]!.name).toBeUndefined();
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
		it('returns error in v0.2 (single rack mode)', () => {
			const store = getLayoutStore();
			store.addRack('First Rack', 42);
			const result = store.duplicateRack('rack-0');
			expect(result.error).toBe('Maximum of 1 rack allowed');
		});
	});

	describe('resetLayout', () => {
		it('resets to initial state', () => {
			const store = getLayoutStore();
			store.addRack('Test', 42);
			store.addDeviceType({
				name: 'Test',
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});

			resetLayoutStore();
			const freshStore = getLayoutStore();

			expect(freshStore.layout.name).toBe('Racky McRackface');
			expect(freshStore.layout.rack.devices).toEqual([]);
			// Starter library has 27 device types
			expect(freshStore.device_types.length).toBe(27);
			expect(freshStore.isDirty).toBe(false);
		});
	});

	describe('settings', () => {
		it('updateDisplayMode updates display_mode', () => {
			const store = getLayoutStore();
			expect(store.layout.settings.display_mode).toBe('label');
			store.updateDisplayMode('image');
			expect(store.layout.settings.display_mode).toBe('image');
			expect(store.isDirty).toBe(true);
		});

		it('updateShowLabelsOnImages updates show_labels_on_images', () => {
			const store = getLayoutStore();
			expect(store.layout.settings.show_labels_on_images).toBe(false);
			store.updateShowLabelsOnImages(true);
			expect(store.layout.settings.show_labels_on_images).toBe(true);
			expect(store.isDirty).toBe(true);
		});
	});
});
