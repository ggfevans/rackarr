import { describe, it, expect } from 'vitest';
import type {
	Device,
	PlacedDevice,
	Rack,
	Layout,
	LayoutSettings,
	DeviceCategory,
	RackView,
	DeviceFace,
	Airflow,
	WeightUnit,
	DeviceImages,
	FormFactor,
	DisplayMode
} from '$lib/types';
import {
	CATEGORY_COLOURS,
	ALL_CATEGORIES,
	CURRENT_VERSION,
	DEFAULT_RACK_VIEW,
	DEFAULT_DEVICE_FACE,
	MIN_DEVICE_HEIGHT
} from '$lib/types/constants';

describe('Types', () => {
	describe('Device interface', () => {
		it('accepts valid device object', () => {
			const device: Device = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: '1U Server',
				height: 1,
				colour: '#4A90D9',
				category: 'server'
			};

			expect(device.id).toBe('123e4567-e89b-12d3-a456-426614174000');
			expect(device.name).toBe('1U Server');
			expect(device.height).toBe(1);
			expect(device.colour).toBe('#4A90D9');
			expect(device.category).toBe('server');
		});

		it('accepts device with optional notes', () => {
			const device: Device = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: '2U Server',
				height: 2,
				colour: '#4A90D9',
				category: 'server',
				notes: 'Primary application server'
			};

			expect(device.notes).toBe('Primary application server');
		});

		it('accepts device with all optional fields', () => {
			const device: Device = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Dell R740',
				height: 2,
				colour: '#4A90D9',
				category: 'server',
				notes: 'Primary database server',
				manufacturer: 'Dell',
				model: 'PowerEdge R740',
				part_number: 'R740-SKU-001',
				airflow: 'front-to-rear',
				weight: 25.5,
				weight_unit: 'kg',
				is_full_depth: true,
				face: 'both',
				images: {
					front: 'images/dell-r740-front.png',
					rear: 'images/dell-r740-rear.png'
				}
			};

			expect(device.manufacturer).toBe('Dell');
			expect(device.model).toBe('PowerEdge R740');
			expect(device.part_number).toBe('R740-SKU-001');
			expect(device.airflow).toBe('front-to-rear');
			expect(device.weight).toBe(25.5);
			expect(device.weight_unit).toBe('kg');
			expect(device.is_full_depth).toBe(true);
			expect(device.face).toBe('both');
			expect(device.images?.front).toBe('images/dell-r740-front.png');
			expect(device.images?.rear).toBe('images/dell-r740-rear.png');
		});

		it('works without optional fields (backwards compatible)', () => {
			const device: Device = {
				id: 'simple-device',
				name: '1U Switch',
				height: 1,
				colour: '#7B68EE',
				category: 'network'
			};

			expect(device.manufacturer).toBeUndefined();
			expect(device.model).toBeUndefined();
			expect(device.airflow).toBeUndefined();
			expect(device.weight).toBeUndefined();
			expect(device.images).toBeUndefined();
		});
	});

	describe('Airflow type', () => {
		it('accepts all valid airflow values', () => {
			const airflowValues: Airflow[] = [
				'front-to-rear',
				'rear-to-front',
				'left-to-right',
				'right-to-left',
				'side-to-rear',
				'rear-to-side',
				'bottom-to-top',
				'top-to-bottom',
				'passive',
				'mixed'
			];

			expect(airflowValues).toHaveLength(10);
			airflowValues.forEach((value) => {
				expect(typeof value).toBe('string');
			});
		});
	});

	describe('WeightUnit type', () => {
		it('accepts all valid weight unit values', () => {
			const weightUnits: WeightUnit[] = ['kg', 'g', 'lb', 'oz'];

			expect(weightUnits).toHaveLength(4);
			expect(weightUnits).toContain('kg');
			expect(weightUnits).toContain('g');
			expect(weightUnits).toContain('lb');
			expect(weightUnits).toContain('oz');
		});
	});

	describe('DeviceImages interface', () => {
		it('accepts front and rear image paths', () => {
			const images: DeviceImages = {
				front: 'images/device-front.png',
				rear: 'images/device-rear.png'
			};

			expect(images.front).toBe('images/device-front.png');
			expect(images.rear).toBe('images/device-rear.png');
		});

		it('allows optional front and rear', () => {
			const frontOnly: DeviceImages = { front: 'front.png' };
			const rearOnly: DeviceImages = { rear: 'rear.png' };
			const empty: DeviceImages = {};

			expect(frontOnly.front).toBe('front.png');
			expect(frontOnly.rear).toBeUndefined();
			expect(rearOnly.rear).toBe('rear.png');
			expect(rearOnly.front).toBeUndefined();
			expect(empty.front).toBeUndefined();
			expect(empty.rear).toBeUndefined();
		});
	});

	describe('PlacedDevice interface', () => {
		it('references library device correctly', () => {
			const placedDevice: PlacedDevice = {
				libraryId: '123e4567-e89b-12d3-a456-426614174000',
				position: 5,
				face: 'front'
			};

			expect(placedDevice.libraryId).toBe('123e4567-e89b-12d3-a456-426614174000');
			expect(placedDevice.position).toBe(5);
			expect(placedDevice.face).toBe('front');
		});

		it('accepts all valid face values', () => {
			const frontDevice: PlacedDevice = {
				libraryId: 'dev-1',
				position: 1,
				face: 'front'
			};
			const rearDevice: PlacedDevice = {
				libraryId: 'dev-2',
				position: 2,
				face: 'rear'
			};
			const bothDevice: PlacedDevice = {
				libraryId: 'dev-3',
				position: 3,
				face: 'both'
			};

			expect(frontDevice.face).toBe('front');
			expect(rearDevice.face).toBe('rear');
			expect(bothDevice.face).toBe('both');
		});
	});

	describe('Rack interface', () => {
		it('accepts valid rack object with view', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: []
			};

			expect(rack.id).toBe('123e4567-e89b-12d3-a456-426614174001');
			expect(rack.name).toBe('Main Rack');
			expect(rack.height).toBe(42);
			expect(rack.width).toBe(19);
			expect(rack.position).toBe(0);
			expect(rack.view).toBe('front');
			expect(rack.devices).toEqual([]);
		});

		it('accepts rack with rear view', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Rear Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'rear',
				devices: []
			};

			expect(rack.view).toBe('rear');
		});

		it('accepts rack with placed devices', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: [
					{ libraryId: 'device-1', position: 1, face: 'front' },
					{ libraryId: 'device-2', position: 5, face: 'both' }
				]
			};

			expect(rack.devices).toHaveLength(2);
			expect(rack.devices[0]?.libraryId).toBe('device-1');
			expect(rack.devices[0]?.position).toBe(1);
			expect(rack.devices[0]?.face).toBe('front');
		});

		it('accepts rack with all configuration fields', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Configured Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: [],
				form_factor: '4-post-cabinet',
				desc_units: false,
				starting_unit: 1
			};

			expect(rack.form_factor).toBe('4-post-cabinet');
			expect(rack.desc_units).toBe(false);
			expect(rack.starting_unit).toBe(1);
		});

		it('accepts rack with descending units', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Descending Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: [],
				desc_units: true,
				starting_unit: 5
			};

			expect(rack.desc_units).toBe(true);
			expect(rack.starting_unit).toBe(5);
		});

		it('works without optional configuration fields (backwards compatible)', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Simple Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: []
			};

			expect(rack.form_factor).toBeUndefined();
			expect(rack.desc_units).toBeUndefined();
			expect(rack.starting_unit).toBeUndefined();
		});
	});

	describe('FormFactor type', () => {
		it('accepts all valid form factor values', () => {
			const formFactors: FormFactor[] = [
				'4-post-cabinet',
				'4-post-frame',
				'2-post-frame',
				'wall-cabinet',
				'wall-frame',
				'wall-frame-vertical',
				'wall-cabinet-vertical'
			];

			expect(formFactors).toHaveLength(7);
			formFactors.forEach((value) => {
				expect(typeof value).toBe('string');
			});
		});
	});

	describe('RackView type', () => {
		it('accepts front view', () => {
			const view: RackView = 'front';
			expect(view).toBe('front');
		});

		it('accepts rear view', () => {
			const view: RackView = 'rear';
			expect(view).toBe('rear');
		});
	});

	describe('DeviceFace type', () => {
		it('accepts front, rear, and both', () => {
			const faces: DeviceFace[] = ['front', 'rear', 'both'];
			expect(faces).toHaveLength(3);
			expect(faces).toContain('front');
			expect(faces).toContain('rear');
			expect(faces).toContain('both');
		});
	});

	describe('Layout interface', () => {
		it('accepts valid layout object', () => {
			const layout: Layout = {
				version: '1.0',
				name: 'My Homelab',
				created: '2025-01-15T10:30:00Z',
				modified: '2025-01-15T14:45:00Z',
				settings: {
					theme: 'dark'
				},
				deviceLibrary: [],
				racks: []
			};

			expect(layout.version).toBe('1.0');
			expect(layout.name).toBe('My Homelab');
			expect(layout.settings.theme).toBe('dark');
			expect(layout.deviceLibrary).toEqual([]);
			expect(layout.racks).toEqual([]);
		});

		it('accepts layout with devices and racks', () => {
			const device: Device = {
				id: 'device-1',
				name: '1U Server',
				height: 1,
				colour: '#4A90D9',
				category: 'server'
			};

			const rack: Rack = {
				id: 'rack-1',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: [{ libraryId: 'device-1', position: 1, face: 'front' }]
			};

			const layout: Layout = {
				version: '1.0',
				name: 'My Homelab',
				created: '2025-01-15T10:30:00Z',
				modified: '2025-01-15T14:45:00Z',
				settings: { theme: 'light' },
				deviceLibrary: [device],
				racks: [rack]
			};

			expect(layout.deviceLibrary).toHaveLength(1);
			expect(layout.racks).toHaveLength(1);
			expect(layout.settings.theme).toBe('light');
		});

		it('accepts layout with all settings fields', () => {
			const layout: Layout = {
				version: '1.0',
				name: 'My Homelab',
				created: '2025-01-15T10:30:00Z',
				modified: '2025-01-15T14:45:00Z',
				settings: {
					theme: 'dark',
					view: 'front',
					displayMode: 'label',
					showLabelsOnImages: false
				},
				deviceLibrary: [],
				racks: []
			};

			expect(layout.settings.view).toBe('front');
			expect(layout.settings.displayMode).toBe('label');
			expect(layout.settings.showLabelsOnImages).toBe(false);
		});
	});

	describe('LayoutSettings interface', () => {
		it('works with just theme (backwards compatible)', () => {
			const settings: LayoutSettings = {
				theme: 'dark'
			};

			expect(settings.theme).toBe('dark');
			expect(settings.view).toBeUndefined();
			expect(settings.displayMode).toBeUndefined();
			expect(settings.showLabelsOnImages).toBeUndefined();
		});

		it('accepts all optional fields', () => {
			const settings: LayoutSettings = {
				theme: 'light',
				view: 'rear',
				displayMode: 'image',
				showLabelsOnImages: true
			};

			expect(settings.theme).toBe('light');
			expect(settings.view).toBe('rear');
			expect(settings.displayMode).toBe('image');
			expect(settings.showLabelsOnImages).toBe(true);
		});
	});

	describe('DisplayMode type', () => {
		it('accepts label and image values', () => {
			const modes: DisplayMode[] = ['label', 'image'];

			expect(modes).toHaveLength(2);
			expect(modes).toContain('label');
			expect(modes).toContain('image');
		});
	});
});

describe('Constants', () => {
	describe('CATEGORY_COLOURS', () => {
		it('has entry for every DeviceCategory', () => {
			const categories: DeviceCategory[] = [
				'server',
				'network',
				'patch-panel',
				'power',
				'storage',
				'kvm',
				'av-media',
				'cooling',
				'shelf',
				'blank',
				'other'
			];

			categories.forEach((category) => {
				expect(CATEGORY_COLOURS[category]).toBeDefined();
				expect(CATEGORY_COLOURS[category]).toMatch(/^#[0-9A-Fa-f]{6}$/);
			});
		});

		it('returns correct colour for server category', () => {
			expect(CATEGORY_COLOURS.server).toBe('#4A90D9');
		});

		it('returns correct colour for network category', () => {
			expect(CATEGORY_COLOURS.network).toBe('#7B68EE');
		});

		it('returns correct colour for shelf category', () => {
			expect(CATEGORY_COLOURS.shelf).toBe('#8B4513');
		});
	});

	describe('ALL_CATEGORIES', () => {
		it('contains all 11 categories', () => {
			expect(ALL_CATEGORIES).toHaveLength(11);
		});

		it('includes all expected categories', () => {
			expect(ALL_CATEGORIES).toContain('server');
			expect(ALL_CATEGORIES).toContain('network');
			expect(ALL_CATEGORIES).toContain('patch-panel');
			expect(ALL_CATEGORIES).toContain('power');
			expect(ALL_CATEGORIES).toContain('storage');
			expect(ALL_CATEGORIES).toContain('kvm');
			expect(ALL_CATEGORIES).toContain('av-media');
			expect(ALL_CATEGORIES).toContain('cooling');
			expect(ALL_CATEGORIES).toContain('shelf');
			expect(ALL_CATEGORIES).toContain('blank');
			expect(ALL_CATEGORIES).toContain('other');
		});

		it('has shelf category before blank', () => {
			const shelfIndex = ALL_CATEGORIES.indexOf('shelf');
			const blankIndex = ALL_CATEGORIES.indexOf('blank');
			expect(shelfIndex).toBeLessThan(blankIndex);
		});
	});

	describe('CURRENT_VERSION', () => {
		it('is set to 0.2.0', () => {
			expect(CURRENT_VERSION).toBe('0.2.0');
		});
	});

	describe('DEFAULT_RACK_VIEW', () => {
		it('is front', () => {
			expect(DEFAULT_RACK_VIEW).toBe('front');
		});
	});

	describe('DEFAULT_DEVICE_FACE', () => {
		it('is front', () => {
			expect(DEFAULT_DEVICE_FACE).toBe('front');
		});
	});

	describe('MIN_DEVICE_HEIGHT', () => {
		it('supports half-U devices (0.5)', () => {
			expect(MIN_DEVICE_HEIGHT).toBe(0.5);
		});
	});
});
