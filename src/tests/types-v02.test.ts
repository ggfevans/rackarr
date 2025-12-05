/**
 * v0.2 Type Definitions Tests
 * Verifies that v0.2 types compile and work correctly
 */

import { describe, it, expect } from 'vitest';
import type {
	DeviceType,
	PlacedDevice,
	Rack,
	Layout,
	LayoutSettings,
	Airflow,
	DeviceFace,
	CreateDeviceTypeData,
	CreateRackData
} from '$lib/types/v02';

describe('v0.2 Type Definitions', () => {
	describe('DeviceType', () => {
		it('accepts valid device type with required fields', () => {
			const deviceType: DeviceType = {
				slug: 'synology-ds920-plus',
				u_height: 2,
				rackarr: {
					colour: '#10b981',
					category: 'storage'
				}
			};

			expect(deviceType.slug).toBe('synology-ds920-plus');
			expect(deviceType.u_height).toBe(2);
			expect(deviceType.rackarr.colour).toBe('#10b981');
			expect(deviceType.rackarr.category).toBe('storage');
		});

		it('accepts device type with all optional fields', () => {
			const deviceType: DeviceType = {
				slug: 'dell-poweredge-r740',
				u_height: 2,
				manufacturer: 'Dell',
				model: 'PowerEdge R740',
				is_full_depth: true,
				weight: 25.5,
				weight_unit: 'kg',
				airflow: 'front-to-rear',
				comments: 'Primary compute server',
				rackarr: {
					colour: '#3b82f6',
					category: 'server',
					tags: ['compute', 'dell', 'production']
				}
			};

			expect(deviceType.manufacturer).toBe('Dell');
			expect(deviceType.model).toBe('PowerEdge R740');
			expect(deviceType.is_full_depth).toBe(true);
			expect(deviceType.weight).toBe(25.5);
			expect(deviceType.weight_unit).toBe('kg');
			expect(deviceType.airflow).toBe('front-to-rear');
			expect(deviceType.comments).toBe('Primary compute server');
			expect(deviceType.rackarr.tags).toEqual(['compute', 'dell', 'production']);
		});
	});

	describe('PlacedDevice', () => {
		it('accepts valid device with required fields', () => {
			const device: PlacedDevice = {
				device_type: 'synology-ds920-plus',
				position: 10,
				face: 'front'
			};

			expect(device.device_type).toBe('synology-ds920-plus');
			expect(device.position).toBe(10);
			expect(device.face).toBe('front');
		});

		it('accepts device with optional name', () => {
			const device: PlacedDevice = {
				device_type: 'synology-ds920-plus',
				name: 'Primary NAS',
				position: 10,
				face: 'front'
			};

			expect(device.name).toBe('Primary NAS');
		});

		it('accepts all face values', () => {
			const faces: DeviceFace[] = ['front', 'rear', 'both'];

			faces.forEach((face) => {
				const device: PlacedDevice = {
					device_type: 'test',
					position: 1,
					face
				};
				expect(device.face).toBe(face);
			});
		});
	});

	describe('Rack', () => {
		it('accepts valid rack with required fields', () => {
			const rack: Rack = {
				name: 'Homelab Rack',
				height: 42,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: []
			};

			expect(rack.name).toBe('Homelab Rack');
			expect(rack.height).toBe(42);
			expect(rack.width).toBe(19);
			expect(rack.desc_units).toBe(false);
			expect(rack.form_factor).toBe('4-post-cabinet');
			expect(rack.starting_unit).toBe(1);
			expect(rack.position).toBe(0);
			expect(rack.devices).toEqual([]);
		});

		it('accepts rack with devices', () => {
			const rack: Rack = {
				name: 'Test Rack',
				height: 42,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: [
					{ device_type: 'device-1', position: 1, face: 'front' },
					{ device_type: 'device-2', name: 'Named Device', position: 5, face: 'rear' }
				]
			};

			expect(rack.devices).toHaveLength(2);
			expect(rack.devices[0].device_type).toBe('device-1');
			expect(rack.devices[1].name).toBe('Named Device');
		});

		it('accepts 10-inch rack width', () => {
			const rack: Rack = {
				name: 'Network Rack',
				height: 12,
				width: 10,
				desc_units: false,
				form_factor: 'wall-mount',
				starting_unit: 1,
				position: 0,
				devices: []
			};

			expect(rack.width).toBe(10);
		});

		it('accepts optional view property', () => {
			const rack: Rack = {
				name: 'Test Rack',
				height: 42,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: [],
				view: 'rear'
			};

			expect(rack.view).toBe('rear');
		});
	});

	describe('Layout', () => {
		it('accepts valid layout', () => {
			const layout: Layout = {
				version: '0.2.0',
				name: 'My Homelab',
				rack: {
					name: 'Main Rack',
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
				}
			};

			expect(layout.version).toBe('0.2.0');
			expect(layout.name).toBe('My Homelab');
			expect(layout.rack.name).toBe('Main Rack');
			expect(layout.device_types).toEqual([]);
			expect(layout.settings.display_mode).toBe('label');
		});

		it('accepts layout with device types and devices', () => {
			const layout: Layout = {
				version: '0.2.0',
				name: 'Complete Layout',
				rack: {
					name: 'Homelab Rack',
					height: 42,
					width: 19,
					desc_units: false,
					form_factor: '4-post-cabinet',
					starting_unit: 1,
					position: 0,
					devices: [{ device_type: 'synology-ds920-plus', position: 10, face: 'front' }]
				},
				device_types: [
					{
						slug: 'synology-ds920-plus',
						u_height: 2,
						manufacturer: 'Synology',
						model: 'DS920+',
						rackarr: {
							colour: '#10b981',
							category: 'storage'
						}
					}
				],
				settings: {
					display_mode: 'image',
					show_labels_on_images: false
				}
			};

			expect(layout.device_types).toHaveLength(1);
			expect(layout.rack.devices).toHaveLength(1);
			expect(layout.rack.devices[0].device_type).toBe(layout.device_types[0].slug);
		});
	});

	describe('LayoutSettings', () => {
		it('accepts both display modes', () => {
			const labelSettings: LayoutSettings = {
				display_mode: 'label',
				show_labels_on_images: false
			};

			const imageSettings: LayoutSettings = {
				display_mode: 'image',
				show_labels_on_images: true
			};

			expect(labelSettings.display_mode).toBe('label');
			expect(imageSettings.display_mode).toBe('image');
		});
	});

	describe('Airflow', () => {
		it('includes all NetBox-compatible airflow options', () => {
			const airflowOptions: Airflow[] = [
				'front-to-rear',
				'rear-to-front',
				'left-to-right',
				'right-to-left',
				'side-to-rear',
				'passive'
			];

			expect(airflowOptions).toHaveLength(6);
		});
	});

	describe('WeightUnit', () => {
		it('includes both weight units', () => {
			const kgDevice: DeviceType = {
				slug: 'test-kg',
				u_height: 1,
				weight: 5.5,
				weight_unit: 'kg',
				rackarr: { colour: '#000', category: 'other' }
			};

			const lbDevice: DeviceType = {
				slug: 'test-lb',
				u_height: 1,
				weight: 12.1,
				weight_unit: 'lb',
				rackarr: { colour: '#000', category: 'other' }
			};

			expect(kgDevice.weight_unit).toBe('kg');
			expect(lbDevice.weight_unit).toBe('lb');
		});
	});

	describe('CreateDeviceTypeData', () => {
		it('accepts input data for creating device type', () => {
			const data: CreateDeviceTypeData = {
				name: 'Test Server',
				u_height: 2,
				category: 'server',
				colour: '#3b82f6'
			};

			expect(data.name).toBe('Test Server');
			expect(data.u_height).toBe(2);
		});
	});

	describe('CreateRackData', () => {
		it('accepts input data for creating rack', () => {
			const data: CreateRackData = {
				name: 'New Rack',
				height: 42
			};

			expect(data.name).toBe('New Rack');
			expect(data.height).toBe(42);
		});

		it('accepts all optional fields', () => {
			const data: CreateRackData = {
				name: 'Full Rack',
				height: 42,
				width: 19,
				form_factor: '4-post-cabinet',
				desc_units: true,
				starting_unit: 1
			};

			expect(data.width).toBe(19);
			expect(data.form_factor).toBe('4-post-cabinet');
		});
	});
});
