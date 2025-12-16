import { describe, it, expect } from 'vitest';
import type {
	DeviceType,
	PlacedDevice,
	Rack,
	Layout,
	LayoutSettings,
	DeviceCategory,
	RackView,
	DeviceFace,
	Airflow,
	WeightUnit,
	FormFactor,
	DisplayMode,
	RackarrDeviceTypeExtensions
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
	describe('DeviceType interface', () => {
		it('accepts valid device type object', () => {
			const deviceType: DeviceType = {
				slug: '1u-server',
				u_height: 1,
				rackarr: {
					colour: '#4A90D9',
					category: 'server'
				}
			};

			expect(deviceType.slug).toBe('1u-server');
			expect(deviceType.u_height).toBe(1);
			expect(deviceType.rackarr.colour).toBe('#4A90D9');
			expect(deviceType.rackarr.category).toBe('server');
		});

		it('accepts device type with optional comments', () => {
			const deviceType: DeviceType = {
				slug: '2u-server',
				u_height: 2,
				comments: 'Primary application server',
				rackarr: {
					colour: '#4A90D9',
					category: 'server'
				}
			};

			expect(deviceType.comments).toBe('Primary application server');
		});

		it('accepts device type with all optional fields', () => {
			const deviceType: DeviceType = {
				slug: 'dell-r740',
				u_height: 2,
				manufacturer: 'Dell',
				model: 'PowerEdge R740',
				is_full_depth: true,
				weight: 25.5,
				weight_unit: 'kg',
				airflow: 'front-to-rear',
				comments: 'Primary database server',
				rackarr: {
					colour: '#4A90D9',
					category: 'server',
					tags: ['production', 'database']
				}
			};

			expect(deviceType.manufacturer).toBe('Dell');
			expect(deviceType.model).toBe('PowerEdge R740');
			expect(deviceType.is_full_depth).toBe(true);
			expect(deviceType.weight).toBe(25.5);
			expect(deviceType.weight_unit).toBe('kg');
			expect(deviceType.airflow).toBe('front-to-rear');
			expect(deviceType.rackarr.tags).toEqual(['production', 'database']);
		});

		it('works without optional fields', () => {
			const deviceType: DeviceType = {
				slug: '1u-switch',
				u_height: 1,
				rackarr: {
					colour: '#7B68EE',
					category: 'network'
				}
			};

			expect(deviceType.manufacturer).toBeUndefined();
			expect(deviceType.model).toBeUndefined();
			expect(deviceType.airflow).toBeUndefined();
			expect(deviceType.weight).toBeUndefined();
		});
	});

	describe('RackarrDeviceTypeExtensions interface', () => {
		it('requires colour and category', () => {
			const extensions: RackarrDeviceTypeExtensions = {
				colour: '#4A90D9',
				category: 'server'
			};

			expect(extensions.colour).toBe('#4A90D9');
			expect(extensions.category).toBe('server');
		});

		it('accepts optional tags', () => {
			const extensions: RackarrDeviceTypeExtensions = {
				colour: '#4A90D9',
				category: 'server',
				tags: ['primary', 'production']
			};

			expect(extensions.tags).toEqual(['primary', 'production']);
		});
	});

	describe('Airflow type', () => {
		it('accepts all valid airflow values (4 types)', () => {
			const airflowValues: Airflow[] = [
				'passive',
				'front-to-rear',
				'rear-to-front',
				'side-to-rear'
			];

			expect(airflowValues).toHaveLength(4);
			airflowValues.forEach((value) => {
				expect(typeof value).toBe('string');
			});
		});
	});

	describe('WeightUnit type', () => {
		it('accepts all valid weight unit values', () => {
			const weightUnits: WeightUnit[] = ['kg', 'lb'];

			expect(weightUnits).toHaveLength(2);
			expect(weightUnits).toContain('kg');
			expect(weightUnits).toContain('lb');
		});
	});

	describe('PlacedDevice interface', () => {
		it('references device type by slug correctly', () => {
			const placedDevice: PlacedDevice = {
				device_type: 'dell-r740',
				position: 5,
				face: 'front'
			};

			expect(placedDevice.device_type).toBe('dell-r740');
			expect(placedDevice.position).toBe(5);
			expect(placedDevice.face).toBe('front');
		});

		it('accepts optional custom name', () => {
			const placedDevice: PlacedDevice = {
				device_type: 'dell-r740',
				position: 5,
				face: 'front',
				name: 'Web Server 1'
			};

			expect(placedDevice.name).toBe('Web Server 1');
		});

		it('accepts all valid face values', () => {
			const frontDevice: PlacedDevice = {
				device_type: 'dev-1',
				position: 1,
				face: 'front'
			};
			const rearDevice: PlacedDevice = {
				device_type: 'dev-2',
				position: 2,
				face: 'rear'
			};
			const bothDevice: PlacedDevice = {
				device_type: 'dev-3',
				position: 3,
				face: 'both'
			};

			expect(frontDevice.face).toBe('front');
			expect(rearDevice.face).toBe('rear');
			expect(bothDevice.face).toBe('both');
		});
	});

	describe('Rack interface', () => {
		it('accepts valid rack object', () => {
			const rack: Rack = {
				name: 'Main Rack',
				height: 42,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: []
			};

			expect(rack.name).toBe('Main Rack');
			expect(rack.height).toBe(42);
			expect(rack.width).toBe(19);
			expect(rack.desc_units).toBe(false);
			expect(rack.form_factor).toBe('4-post-cabinet');
			expect(rack.starting_unit).toBe(1);
			expect(rack.position).toBe(0);
			expect(rack.devices).toEqual([]);
		});

		it('accepts rack with runtime view', () => {
			const rack: Rack = {
				name: 'Rear Rack',
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

		it('accepts rack with placed devices', () => {
			const rack: Rack = {
				name: 'Main Rack',
				height: 42,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: [
					{ device_type: 'device-1', position: 1, face: 'front' },
					{ device_type: 'device-2', position: 5, face: 'both' }
				]
			};

			expect(rack.devices).toHaveLength(2);
			expect(rack.devices[0]?.device_type).toBe('device-1');
			expect(rack.devices[0]?.position).toBe(1);
			expect(rack.devices[0]?.face).toBe('front');
		});

		it('accepts rack with descending units', () => {
			const rack: Rack = {
				name: 'Descending Rack',
				height: 42,
				width: 19,
				desc_units: true,
				form_factor: '4-post-cabinet',
				starting_unit: 5,
				position: 0,
				devices: []
			};

			expect(rack.desc_units).toBe(true);
			expect(rack.starting_unit).toBe(5);
		});

		it('accepts 10-inch rack width', () => {
			const rack: Rack = {
				name: 'Narrow Rack',
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
	});

	describe('FormFactor type', () => {
		it('accepts all valid form factor values', () => {
			const formFactors: FormFactor[] = [
				'2-post',
				'4-post',
				'4-post-cabinet',
				'wall-mount',
				'open-frame'
			];

			expect(formFactors).toHaveLength(5);
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
					show_labels_on_images: false
				}
			};

			expect(layout.version).toBe('0.2.0');
			expect(layout.name).toBe('My Homelab');
			expect(layout.device_types).toEqual([]);
			expect(layout.rack.name).toBe('Main Rack');
		});

		it('accepts layout with device types and placed devices', () => {
			const deviceType: DeviceType = {
				slug: '1u-server',
				u_height: 1,
				model: '1U Server',
				rackarr: {
					colour: '#4A90D9',
					category: 'server'
				}
			};

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
					devices: [{ device_type: '1u-server', position: 1, face: 'front' }]
				},
				device_types: [deviceType],
				settings: {
					display_mode: 'image',
					show_labels_on_images: true
				}
			};

			expect(layout.device_types).toHaveLength(1);
			expect(layout.rack.devices).toHaveLength(1);
			expect(layout.settings.display_mode).toBe('image');
		});
	});

	describe('LayoutSettings interface', () => {
		it('requires display_mode and show_labels_on_images', () => {
			const settings: LayoutSettings = {
				display_mode: 'label',
				show_labels_on_images: false
			};

			expect(settings.display_mode).toBe('label');
			expect(settings.show_labels_on_images).toBe(false);
		});

		it('accepts all display mode values', () => {
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
				'cable-management',
				'other'
			];

			categories.forEach((category) => {
				expect(CATEGORY_COLOURS[category]).toBeDefined();
				expect(CATEGORY_COLOURS[category]).toMatch(/^#[0-9A-Fa-f]{6}$/);
			});
		});

		it('returns correct colour for cable-management category (Dracula comment)', () => {
			expect(CATEGORY_COLOURS['cable-management']).toBe('#6272A4');
		});

		it('returns correct colour for server category (muted cyan)', () => {
			expect(CATEGORY_COLOURS.server).toBe('#4A7A8A');
		});

		it('returns correct colour for network category (muted purple)', () => {
			expect(CATEGORY_COLOURS.network).toBe('#7B6BA8');
		});

		it('returns correct colour for shelf category (Dracula comment)', () => {
			expect(CATEGORY_COLOURS.shelf).toBe('#6272A4');
		});
	});

	describe('ALL_CATEGORIES', () => {
		it('contains all 12 categories', () => {
			expect(ALL_CATEGORIES).toHaveLength(12);
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
			expect(ALL_CATEGORIES).toContain('cable-management');
			expect(ALL_CATEGORIES).toContain('other');
		});

		it('has shelf category before blank', () => {
			const shelfIndex = ALL_CATEGORIES.indexOf('shelf');
			const blankIndex = ALL_CATEGORIES.indexOf('blank');
			expect(shelfIndex).toBeLessThan(blankIndex);
		});

		it('has cable-management category before other', () => {
			const cableMgmtIndex = ALL_CATEGORIES.indexOf('cable-management');
			const otherIndex = ALL_CATEGORIES.indexOf('other');
			expect(cableMgmtIndex).toBeLessThan(otherIndex);
		});
	});

	describe('CURRENT_VERSION', () => {
		it('is set to 0.1.0', () => {
			expect(CURRENT_VERSION).toBe('0.1.0');
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

describe('Image Types', () => {
	describe('ImageData interface', () => {
		it('accepts valid ImageData structure', () => {
			// Create a mock ImageData
			const mockBlob = new Blob(['test'], { type: 'image/png' });
			const imageData: import('$lib/types/images').ImageData = {
				blob: mockBlob,
				dataUrl: 'data:image/png;base64,dGVzdA==',
				filename: 'test-device-front.png'
			};

			expect(imageData.blob).toBeInstanceOf(Blob);
			expect(imageData.dataUrl).toContain('data:image/png');
			expect(imageData.filename).toBe('test-device-front.png');
		});
	});

	describe('Image Format Types', () => {
		it('SUPPORTED_IMAGE_FORMATS includes png, jpeg, and webp', async () => {
			const { SUPPORTED_IMAGE_FORMATS } = await import('$lib/types/constants');

			expect(SUPPORTED_IMAGE_FORMATS).toContain('image/png');
			expect(SUPPORTED_IMAGE_FORMATS).toContain('image/jpeg');
			expect(SUPPORTED_IMAGE_FORMATS).toContain('image/webp');
			expect(SUPPORTED_IMAGE_FORMATS.length).toBe(3);
		});

		it('MAX_IMAGE_SIZE_MB is 5', async () => {
			const { MAX_IMAGE_SIZE_MB } = await import('$lib/types/constants');
			expect(MAX_IMAGE_SIZE_MB).toBe(5);
		});

		it('MAX_IMAGE_SIZE_BYTES is 5MB', async () => {
			const { MAX_IMAGE_SIZE_BYTES } = await import('$lib/types/constants');
			expect(MAX_IMAGE_SIZE_BYTES).toBe(5 * 1024 * 1024);
		});
	});

	describe('ImageUploadResult interface', () => {
		it('accepts successful result with data', async () => {
			const mockBlob = new Blob(['test'], { type: 'image/png' });
			const result: import('$lib/types/images').ImageUploadResult = {
				success: true,
				data: {
					blob: mockBlob,
					dataUrl: 'data:image/png;base64,dGVzdA==',
					filename: 'test-front.png'
				}
			};

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
			expect(result.error).toBeUndefined();
		});

		it('accepts failed result with error', async () => {
			const result: import('$lib/types/images').ImageUploadResult = {
				success: false,
				error: 'File too large'
			};

			expect(result.success).toBe(false);
			expect(result.error).toBe('File too large');
			expect(result.data).toBeUndefined();
		});
	});

	describe('SupportedImageFormat type', () => {
		it('type guards work for supported formats', async () => {
			const { SUPPORTED_IMAGE_FORMATS } = await import('$lib/types/constants');

			// Test that these are the only supported formats
			const formats = ['image/png', 'image/jpeg', 'image/webp'];
			formats.forEach((format) => {
				expect(SUPPORTED_IMAGE_FORMATS).toContain(format);
			});

			// Test that other formats are not included
			expect(SUPPORTED_IMAGE_FORMATS).not.toContain('image/gif');
			expect(SUPPORTED_IMAGE_FORMATS).not.toContain('image/bmp');
		});
	});
});
