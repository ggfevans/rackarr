/**
 * v0.2 Layout Store Helpers Tests
 * Tests for helper functions that work with v0.2 types
 */

import { describe, it, expect } from 'vitest';
import {
	createDeviceType,
	createDevice,
	findDeviceType,
	getDeviceDisplayName,
	addDeviceTypeToLayout,
	removeDeviceTypeFromLayout,
	placeDeviceInRack,
	removeDeviceFromRack
} from '$lib/stores/layout-helpers-v02';
import type { DeviceType, PlacedDevice, Layout } from '$lib/types/v02';
import { isValidSlug } from '$lib/utils/slug';

describe('createDeviceType', () => {
	it('generates valid slug from name', () => {
		const dt = createDeviceType({
			name: 'Test Server',
			u_height: 2,
			category: 'server',
			colour: '#3b82f6'
		});
		expect(isValidSlug(dt.slug)).toBe(true);
		expect(dt.slug).toBe('test-server');
	});

	it('sets all required fields', () => {
		const dt = createDeviceType({
			name: 'My Device',
			u_height: 4,
			category: 'storage',
			colour: '#10b981'
		});
		expect(dt.u_height).toBe(4);
		expect(dt.rackarr.colour).toBe('#10b981');
		expect(dt.rackarr.category).toBe('storage');
	});

	it('includes rackarr extensions', () => {
		const dt = createDeviceType({
			name: 'Tagged Device',
			u_height: 1,
			category: 'network',
			colour: '#000000',
			tags: ['production', 'core']
		});
		expect(dt.rackarr.tags).toEqual(['production', 'core']);
	});

	it('includes optional manufacturer and model', () => {
		const dt = createDeviceType({
			name: 'Dell Server',
			u_height: 2,
			category: 'server',
			colour: '#3b82f6',
			manufacturer: 'Dell',
			model: 'PowerEdge R740'
		});
		expect(dt.manufacturer).toBe('Dell');
		expect(dt.model).toBe('PowerEdge R740');
	});

	it('includes optional airflow', () => {
		const dt = createDeviceType({
			name: 'Server',
			u_height: 2,
			category: 'server',
			colour: '#000000',
			airflow: 'front-to-rear'
		});
		expect(dt.airflow).toBe('front-to-rear');
	});

	it('includes optional weight', () => {
		const dt = createDeviceType({
			name: 'Heavy Server',
			u_height: 4,
			category: 'server',
			colour: '#000000',
			weight: 25.5,
			weight_unit: 'kg'
		});
		expect(dt.weight).toBe(25.5);
		expect(dt.weight_unit).toBe('kg');
	});

	it('includes optional comments', () => {
		const dt = createDeviceType({
			name: 'Important Server',
			u_height: 2,
			category: 'server',
			colour: '#000000',
			comments: 'Primary production server'
		});
		expect(dt.comments).toBe('Primary production server');
	});

	it('includes optional is_full_depth', () => {
		const dt = createDeviceType({
			name: 'Short Device',
			u_height: 1,
			category: 'network',
			colour: '#000000',
			is_full_depth: false
		});
		expect(dt.is_full_depth).toBe(false);
	});

	it('uses manufacturer and model for slug when available', () => {
		const dt = createDeviceType({
			name: 'Ignored Name',
			u_height: 2,
			category: 'server',
			colour: '#000000',
			manufacturer: 'Dell',
			model: 'R740'
		});
		expect(dt.slug).toBe('dell-r740');
	});
});

describe('createDevice', () => {
	it('creates device with correct device_type reference', () => {
		const device = createDevice('my-server', 10, 'front');
		expect(device.device_type).toBe('my-server');
		expect(device.position).toBe(10);
		expect(device.face).toBe('front');
	});

	it('handles optional name correctly when provided', () => {
		const device = createDevice('my-server', 5, 'rear', 'Production DB');
		expect(device.name).toBe('Production DB');
	});

	it('handles optional name correctly when not provided', () => {
		const device = createDevice('my-server', 5, 'rear');
		expect(device.name).toBeUndefined();
	});

	it('creates device with both face option', () => {
		const device = createDevice('my-server', 1, 'both');
		expect(device.face).toBe('both');
	});
});

describe('findDeviceType', () => {
	const deviceTypes: DeviceType[] = [
		{
			slug: 'server-one',
			u_height: 2,
			rackarr: { colour: '#3b82f6', category: 'server' }
		},
		{
			slug: 'switch-core',
			u_height: 1,
			rackarr: { colour: '#10b981', category: 'network' }
		},
		{
			slug: 'nas-storage',
			u_height: 4,
			manufacturer: 'Synology',
			model: 'RS1221+',
			rackarr: { colour: '#f59e0b', category: 'storage' }
		}
	];

	it('finds existing device type by slug', () => {
		const found = findDeviceType(deviceTypes, 'switch-core');
		expect(found).toBeDefined();
		expect(found?.slug).toBe('switch-core');
		expect(found?.rackarr.category).toBe('network');
	});

	it('returns undefined for non-existent slug', () => {
		const found = findDeviceType(deviceTypes, 'non-existent');
		expect(found).toBeUndefined();
	});

	it('returns undefined for empty array', () => {
		const found = findDeviceType([], 'any-slug');
		expect(found).toBeUndefined();
	});

	it('finds device type with additional properties', () => {
		const found = findDeviceType(deviceTypes, 'nas-storage');
		expect(found?.manufacturer).toBe('Synology');
		expect(found?.model).toBe('RS1221+');
	});
});

describe('getDeviceDisplayName', () => {
	const deviceTypes: DeviceType[] = [
		{
			slug: 'server-basic',
			u_height: 2,
			rackarr: { colour: '#3b82f6', category: 'server' }
		},
		{
			slug: 'server-with-model',
			u_height: 2,
			model: 'PowerEdge R740',
			rackarr: { colour: '#3b82f6', category: 'server' }
		},
		{
			slug: 'nas-synology',
			u_height: 2,
			manufacturer: 'Synology',
			model: 'RS1221+',
			rackarr: { colour: '#f59e0b', category: 'storage' }
		}
	];

	it('returns device name if set', () => {
		const device: PlacedDevice = {
			device_type: 'server-basic',
			name: 'Primary Database',
			position: 10,
			face: 'front'
		};
		expect(getDeviceDisplayName(device, deviceTypes)).toBe('Primary Database');
	});

	it('returns model if name not set', () => {
		const device: PlacedDevice = {
			device_type: 'server-with-model',
			position: 10,
			face: 'front'
		};
		expect(getDeviceDisplayName(device, deviceTypes)).toBe('PowerEdge R740');
	});

	it('returns slug as fallback when no name or model', () => {
		const device: PlacedDevice = {
			device_type: 'server-basic',
			position: 10,
			face: 'front'
		};
		expect(getDeviceDisplayName(device, deviceTypes)).toBe('server-basic');
	});

	it('prefers device name over model', () => {
		const device: PlacedDevice = {
			device_type: 'nas-synology',
			name: 'Backup NAS',
			position: 5,
			face: 'rear'
		};
		expect(getDeviceDisplayName(device, deviceTypes)).toBe('Backup NAS');
	});

	it('returns slug when device type not found', () => {
		const device: PlacedDevice = {
			device_type: 'non-existent',
			position: 10,
			face: 'front'
		};
		expect(getDeviceDisplayName(device, deviceTypes)).toBe('non-existent');
	});

	it('handles empty device types array', () => {
		const device: PlacedDevice = {
			device_type: 'any-device',
			position: 10,
			face: 'front'
		};
		expect(getDeviceDisplayName(device, [])).toBe('any-device');
	});
});

// Helper to create a minimal test layout
function createTestLayout(overrides: Partial<Layout> = {}): Layout {
	return {
		version: '0.2.0',
		name: 'Test Layout',
		rack: {
			name: 'Test Rack',
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
			show_labels_on_images: true
		},
		...overrides
	};
}

describe('addDeviceTypeToLayout', () => {
	it('adds device type to empty layout', () => {
		const layout = createTestLayout();
		const deviceType: DeviceType = {
			slug: 'new-server',
			u_height: 2,
			rackarr: { colour: '#3b82f6', category: 'server' }
		};

		const result = addDeviceTypeToLayout(layout, deviceType);

		expect(result.device_types).toHaveLength(1);
		expect(result.device_types[0].slug).toBe('new-server');
	});

	it('adds to existing device_types', () => {
		const layout = createTestLayout({
			device_types: [
				{
					slug: 'existing-device',
					u_height: 1,
					rackarr: { colour: '#000000', category: 'network' }
				}
			]
		});
		const deviceType: DeviceType = {
			slug: 'new-device',
			u_height: 4,
			rackarr: { colour: '#ffffff', category: 'storage' }
		};

		const result = addDeviceTypeToLayout(layout, deviceType);

		expect(result.device_types).toHaveLength(2);
		expect(result.device_types[1].slug).toBe('new-device');
	});

	it('throws on duplicate slug', () => {
		const layout = createTestLayout({
			device_types: [
				{
					slug: 'my-server',
					u_height: 2,
					rackarr: { colour: '#000000', category: 'server' }
				}
			]
		});
		const deviceType: DeviceType = {
			slug: 'my-server',
			u_height: 4,
			rackarr: { colour: '#ffffff', category: 'storage' }
		};

		expect(() => addDeviceTypeToLayout(layout, deviceType)).toThrow(/duplicate/i);
	});

	it('original layout unchanged (immutable)', () => {
		const layout = createTestLayout();
		const deviceType: DeviceType = {
			slug: 'new-server',
			u_height: 2,
			rackarr: { colour: '#3b82f6', category: 'server' }
		};

		const result = addDeviceTypeToLayout(layout, deviceType);

		expect(result).not.toBe(layout);
		expect(result.device_types).not.toBe(layout.device_types);
		expect(layout.device_types).toHaveLength(0);
	});
});

describe('removeDeviceTypeFromLayout', () => {
	it('removes device type by slug', () => {
		const layout = createTestLayout({
			device_types: [
				{
					slug: 'to-remove',
					u_height: 2,
					rackarr: { colour: '#000000', category: 'server' }
				},
				{
					slug: 'to-keep',
					u_height: 1,
					rackarr: { colour: '#ffffff', category: 'network' }
				}
			]
		});

		const result = removeDeviceTypeFromLayout(layout, 'to-remove');

		expect(result.device_types).toHaveLength(1);
		expect(result.device_types[0].slug).toBe('to-keep');
	});

	it('removes placed devices referencing the device type', () => {
		const layout = createTestLayout({
			device_types: [
				{
					slug: 'server-type',
					u_height: 2,
					rackarr: { colour: '#000000', category: 'server' }
				},
				{
					slug: 'other-type',
					u_height: 1,
					rackarr: { colour: '#ffffff', category: 'network' }
				}
			],
			rack: {
				name: 'Test Rack',
				height: 42,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: [
					{ device_type: 'server-type', position: 1, face: 'front' },
					{ device_type: 'other-type', position: 10, face: 'front' },
					{ device_type: 'server-type', position: 20, face: 'rear' }
				]
			}
		});

		const result = removeDeviceTypeFromLayout(layout, 'server-type');

		expect(result.device_types).toHaveLength(1);
		expect(result.rack.devices).toHaveLength(1);
		expect(result.rack.devices[0].device_type).toBe('other-type');
	});

	it('no-op if slug does not exist', () => {
		const layout = createTestLayout({
			device_types: [
				{
					slug: 'existing',
					u_height: 2,
					rackarr: { colour: '#000000', category: 'server' }
				}
			]
		});

		const result = removeDeviceTypeFromLayout(layout, 'non-existent');

		expect(result.device_types).toHaveLength(1);
	});
});

describe('placeDeviceInRack', () => {
	it('adds device to rack.devices', () => {
		const layout = createTestLayout({
			device_types: [
				{
					slug: 'my-server',
					u_height: 2,
					rackarr: { colour: '#000000', category: 'server' }
				}
			]
		});
		const device: PlacedDevice = {
			device_type: 'my-server',
			position: 10,
			face: 'front'
		};

		const result = placeDeviceInRack(layout, device);

		expect(result.rack.devices).toHaveLength(1);
		expect(result.rack.devices[0].device_type).toBe('my-server');
		expect(result.rack.devices[0].position).toBe(10);
	});

	it('throws if device_type does not exist in device_types', () => {
		const layout = createTestLayout();
		const device: PlacedDevice = {
			device_type: 'non-existent',
			position: 10,
			face: 'front'
		};

		expect(() => placeDeviceInRack(layout, device)).toThrow(/device.*type/i);
	});

	it('adds multiple devices', () => {
		const layout = createTestLayout({
			device_types: [
				{
					slug: 'server',
					u_height: 2,
					rackarr: { colour: '#000000', category: 'server' }
				}
			]
		});
		const device1: PlacedDevice = { device_type: 'server', position: 1, face: 'front' };
		const device2: PlacedDevice = { device_type: 'server', position: 5, face: 'rear' };

		let result = placeDeviceInRack(layout, device1);
		result = placeDeviceInRack(result, device2);

		expect(result.rack.devices).toHaveLength(2);
	});

	it('is immutable', () => {
		const layout = createTestLayout({
			device_types: [
				{
					slug: 'server',
					u_height: 2,
					rackarr: { colour: '#000000', category: 'server' }
				}
			]
		});
		const device: PlacedDevice = {
			device_type: 'server',
			position: 10,
			face: 'front'
		};

		const result = placeDeviceInRack(layout, device);

		expect(result).not.toBe(layout);
		expect(result.rack).not.toBe(layout.rack);
		expect(result.rack.devices).not.toBe(layout.rack.devices);
		expect(layout.rack.devices).toHaveLength(0);
	});
});

describe('removeDeviceFromRack', () => {
	it('removes device at index', () => {
		const layout = createTestLayout({
			device_types: [
				{
					slug: 'server',
					u_height: 2,
					rackarr: { colour: '#000000', category: 'server' }
				}
			],
			rack: {
				name: 'Test Rack',
				height: 42,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: [
					{ device_type: 'server', position: 1, face: 'front' },
					{ device_type: 'server', position: 5, face: 'rear' },
					{ device_type: 'server', position: 10, face: 'both' }
				]
			}
		});

		const result = removeDeviceFromRack(layout, 1);

		expect(result.rack.devices).toHaveLength(2);
		expect(result.rack.devices[0].position).toBe(1);
		expect(result.rack.devices[1].position).toBe(10);
	});

	it('handles out-of-bounds gracefully', () => {
		const layout = createTestLayout({
			rack: {
				name: 'Test Rack',
				height: 42,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: [{ device_type: 'server', position: 1, face: 'front' }]
			}
		});

		// Should not throw, just return unchanged
		const result = removeDeviceFromRack(layout, 10);
		expect(result.rack.devices).toHaveLength(1);
	});

	it('handles negative index gracefully', () => {
		const layout = createTestLayout({
			rack: {
				name: 'Test Rack',
				height: 42,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: [{ device_type: 'server', position: 1, face: 'front' }]
			}
		});

		const result = removeDeviceFromRack(layout, -1);
		expect(result.rack.devices).toHaveLength(1);
	});

	it('is immutable', () => {
		const layout = createTestLayout({
			rack: {
				name: 'Test Rack',
				height: 42,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: [
					{ device_type: 'server', position: 1, face: 'front' },
					{ device_type: 'server', position: 5, face: 'rear' }
				]
			}
		});

		const result = removeDeviceFromRack(layout, 0);

		expect(result).not.toBe(layout);
		expect(result.rack).not.toBe(layout.rack);
		expect(result.rack.devices).not.toBe(layout.rack.devices);
		expect(layout.rack.devices).toHaveLength(2);
	});
});
