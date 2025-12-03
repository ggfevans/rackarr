/**
 * v0.2 Zod Schema Tests
 * TDD: Tests written first, implementation follows
 */

import { describe, it, expect } from 'vitest';
import {
	SlugSchemaV02,
	DeviceCategorySchemaV02,
	FormFactorSchemaV02,
	AirflowSchemaV02,
	DeviceFaceSchemaV02,
	WeightUnitSchemaV02,
	RackarrExtensionsSchemaV02,
	DeviceTypeSchemaV02,
	DeviceSchemaV02,
	RackSchemaV02,
	LayoutSettingsSchemaV02,
	LayoutSchemaV02,
	validateSlugUniqueness
} from '$lib/schemas/v02';

describe('v0.2 Zod Schemas', () => {
	describe('SlugSchemaV02', () => {
		it('accepts valid slug', () => {
			expect(SlugSchemaV02.safeParse('valid-slug').success).toBe(true);
		});

		it('accepts slug with numbers', () => {
			expect(SlugSchemaV02.safeParse('synology-ds920-plus').success).toBe(true);
		});

		it('accepts simple slug', () => {
			expect(SlugSchemaV02.safeParse('simple').success).toBe(true);
		});

		it('accepts numbers only', () => {
			expect(SlugSchemaV02.safeParse('123').success).toBe(true);
		});

		it('rejects empty string', () => {
			const result = SlugSchemaV02.safeParse('');
			expect(result.success).toBe(false);
		});

		it('rejects uppercase', () => {
			const result = SlugSchemaV02.safeParse('Invalid-Slug');
			expect(result.success).toBe(false);
		});

		it('rejects spaces', () => {
			const result = SlugSchemaV02.safeParse('invalid slug');
			expect(result.success).toBe(false);
		});

		it('rejects leading hyphen', () => {
			const result = SlugSchemaV02.safeParse('-invalid');
			expect(result.success).toBe(false);
		});

		it('rejects trailing hyphen', () => {
			const result = SlugSchemaV02.safeParse('invalid-');
			expect(result.success).toBe(false);
		});

		it('rejects consecutive hyphens', () => {
			const result = SlugSchemaV02.safeParse('invalid--slug');
			expect(result.success).toBe(false);
		});

		it('rejects underscores', () => {
			const result = SlugSchemaV02.safeParse('invalid_slug');
			expect(result.success).toBe(false);
		});

		it('rejects slugs over 100 characters', () => {
			const longSlug = 'a'.repeat(101);
			const result = SlugSchemaV02.safeParse(longSlug);
			expect(result.success).toBe(false);
		});
	});

	describe('DeviceCategorySchemaV02', () => {
		const validCategories = [
			'server',
			'storage',
			'networking',
			'power',
			'cooling',
			'kvm',
			'audio-video',
			'security',
			'cable-management',
			'accessories',
			'other',
			'shelf'
		];

		it.each(validCategories)('accepts category: %s', (category) => {
			expect(DeviceCategorySchemaV02.safeParse(category).success).toBe(true);
		});

		it('rejects invalid category', () => {
			expect(DeviceCategorySchemaV02.safeParse('invalid').success).toBe(false);
		});
	});

	describe('FormFactorSchemaV02', () => {
		const validFormFactors = ['2-post', '4-post', '4-post-cabinet', 'wall-mount', 'open-frame'];

		it.each(validFormFactors)('accepts form factor: %s', (formFactor) => {
			expect(FormFactorSchemaV02.safeParse(formFactor).success).toBe(true);
		});

		it('rejects invalid form factor', () => {
			expect(FormFactorSchemaV02.safeParse('invalid').success).toBe(false);
		});
	});

	describe('AirflowSchemaV02', () => {
		const validAirflows = [
			'front-to-rear',
			'rear-to-front',
			'left-to-right',
			'right-to-left',
			'side-to-rear',
			'passive'
		];

		it.each(validAirflows)('accepts airflow: %s', (airflow) => {
			expect(AirflowSchemaV02.safeParse(airflow).success).toBe(true);
		});

		it('rejects invalid airflow', () => {
			expect(AirflowSchemaV02.safeParse('invalid').success).toBe(false);
		});
	});

	describe('DeviceFaceSchemaV02', () => {
		it('accepts front', () => {
			expect(DeviceFaceSchemaV02.safeParse('front').success).toBe(true);
		});

		it('accepts rear', () => {
			expect(DeviceFaceSchemaV02.safeParse('rear').success).toBe(true);
		});

		it('accepts both', () => {
			expect(DeviceFaceSchemaV02.safeParse('both').success).toBe(true);
		});

		it('rejects invalid face', () => {
			expect(DeviceFaceSchemaV02.safeParse('side').success).toBe(false);
		});
	});

	describe('WeightUnitSchemaV02', () => {
		it('accepts kg', () => {
			expect(WeightUnitSchemaV02.safeParse('kg').success).toBe(true);
		});

		it('accepts lb', () => {
			expect(WeightUnitSchemaV02.safeParse('lb').success).toBe(true);
		});

		it('rejects invalid unit', () => {
			expect(WeightUnitSchemaV02.safeParse('oz').success).toBe(false);
		});
	});

	describe('RackarrExtensionsSchemaV02', () => {
		it('accepts valid extensions', () => {
			const result = RackarrExtensionsSchemaV02.safeParse({
				colour: '#10b981',
				category: 'storage'
			});
			expect(result.success).toBe(true);
		});

		it('accepts extensions with tags', () => {
			const result = RackarrExtensionsSchemaV02.safeParse({
				colour: '#10b981',
				category: 'storage',
				tags: ['nas', 'synology']
			});
			expect(result.success).toBe(true);
		});

		it('rejects invalid hex colour', () => {
			const result = RackarrExtensionsSchemaV02.safeParse({
				colour: 'not-a-colour',
				category: 'storage'
			});
			expect(result.success).toBe(false);
		});

		it('rejects 3-character hex colour', () => {
			const result = RackarrExtensionsSchemaV02.safeParse({
				colour: '#abc',
				category: 'storage'
			});
			expect(result.success).toBe(false);
		});

		it('rejects invalid category', () => {
			const result = RackarrExtensionsSchemaV02.safeParse({
				colour: '#10b981',
				category: 'invalid'
			});
			expect(result.success).toBe(false);
		});
	});

	describe('DeviceTypeSchemaV02', () => {
		it('accepts valid device type with required fields', () => {
			const result = DeviceTypeSchemaV02.safeParse({
				slug: 'synology-ds920-plus',
				u_height: 2,
				rackarr: {
					colour: '#10b981',
					category: 'storage'
				}
			});
			expect(result.success).toBe(true);
		});

		it('accepts device type with all optional fields', () => {
			const result = DeviceTypeSchemaV02.safeParse({
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
					tags: ['compute', 'dell']
				}
			});
			expect(result.success).toBe(true);
		});

		it('rejects missing slug', () => {
			const result = DeviceTypeSchemaV02.safeParse({
				u_height: 2,
				rackarr: {
					colour: '#10b981',
					category: 'storage'
				}
			});
			expect(result.success).toBe(false);
		});

		it('rejects invalid slug format', () => {
			const result = DeviceTypeSchemaV02.safeParse({
				slug: 'Invalid Slug!',
				u_height: 2,
				rackarr: {
					colour: '#10b981',
					category: 'storage'
				}
			});
			expect(result.success).toBe(false);
		});

		it('rejects missing u_height', () => {
			const result = DeviceTypeSchemaV02.safeParse({
				slug: 'test-device',
				rackarr: {
					colour: '#10b981',
					category: 'storage'
				}
			});
			expect(result.success).toBe(false);
		});

		it('rejects u_height less than 1', () => {
			const result = DeviceTypeSchemaV02.safeParse({
				slug: 'test-device',
				u_height: 0,
				rackarr: {
					colour: '#10b981',
					category: 'storage'
				}
			});
			expect(result.success).toBe(false);
		});

		it('rejects u_height greater than 50', () => {
			const result = DeviceTypeSchemaV02.safeParse({
				slug: 'test-device',
				u_height: 51,
				rackarr: {
					colour: '#10b981',
					category: 'storage'
				}
			});
			expect(result.success).toBe(false);
		});

		it('rejects missing rackarr extensions', () => {
			const result = DeviceTypeSchemaV02.safeParse({
				slug: 'test-device',
				u_height: 2
			});
			expect(result.success).toBe(false);
		});
	});

	describe('DeviceSchemaV02', () => {
		it('accepts valid device', () => {
			const result = DeviceSchemaV02.safeParse({
				device_type: 'synology-ds920-plus',
				position: 10,
				face: 'front'
			});
			expect(result.success).toBe(true);
		});

		it('accepts device with optional name', () => {
			const result = DeviceSchemaV02.safeParse({
				device_type: 'synology-ds920-plus',
				name: 'Primary NAS',
				position: 10,
				face: 'front'
			});
			expect(result.success).toBe(true);
		});

		it('rejects missing device_type', () => {
			const result = DeviceSchemaV02.safeParse({
				position: 10,
				face: 'front'
			});
			expect(result.success).toBe(false);
		});

		it('rejects position less than 1', () => {
			const result = DeviceSchemaV02.safeParse({
				device_type: 'test',
				position: 0,
				face: 'front'
			});
			expect(result.success).toBe(false);
		});

		it('rejects invalid face', () => {
			const result = DeviceSchemaV02.safeParse({
				device_type: 'test',
				position: 10,
				face: 'invalid'
			});
			expect(result.success).toBe(false);
		});

		it('rejects name over 100 characters', () => {
			const result = DeviceSchemaV02.safeParse({
				device_type: 'test',
				name: 'a'.repeat(101),
				position: 10,
				face: 'front'
			});
			expect(result.success).toBe(false);
		});
	});

	describe('RackSchemaV02', () => {
		it('accepts valid rack', () => {
			const result = RackSchemaV02.safeParse({
				name: 'Homelab Rack',
				height: 42,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: []
			});
			expect(result.success).toBe(true);
		});

		it('accepts rack with devices', () => {
			const result = RackSchemaV02.safeParse({
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
			});
			expect(result.success).toBe(true);
		});

		it('accepts 10-inch rack width', () => {
			const result = RackSchemaV02.safeParse({
				name: 'Network Rack',
				height: 12,
				width: 10,
				desc_units: false,
				form_factor: 'wall-mount',
				starting_unit: 1,
				position: 0,
				devices: []
			});
			expect(result.success).toBe(true);
		});

		it('rejects missing name', () => {
			const result = RackSchemaV02.safeParse({
				height: 42,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: []
			});
			expect(result.success).toBe(false);
		});

		it('rejects invalid width', () => {
			const result = RackSchemaV02.safeParse({
				name: 'Test Rack',
				height: 42,
				width: 15,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: []
			});
			expect(result.success).toBe(false);
		});

		it('rejects height less than 1', () => {
			const result = RackSchemaV02.safeParse({
				name: 'Test Rack',
				height: 0,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: []
			});
			expect(result.success).toBe(false);
		});

		it('rejects height greater than 50', () => {
			const result = RackSchemaV02.safeParse({
				name: 'Test Rack',
				height: 51,
				width: 19,
				desc_units: false,
				form_factor: '4-post-cabinet',
				starting_unit: 1,
				position: 0,
				devices: []
			});
			expect(result.success).toBe(false);
		});
	});

	describe('LayoutSettingsSchemaV02', () => {
		it('accepts valid settings with label mode', () => {
			const result = LayoutSettingsSchemaV02.safeParse({
				display_mode: 'label',
				show_labels_on_images: false
			});
			expect(result.success).toBe(true);
		});

		it('accepts valid settings with image mode', () => {
			const result = LayoutSettingsSchemaV02.safeParse({
				display_mode: 'image',
				show_labels_on_images: true
			});
			expect(result.success).toBe(true);
		});

		it('rejects invalid display mode', () => {
			const result = LayoutSettingsSchemaV02.safeParse({
				display_mode: 'invalid',
				show_labels_on_images: true
			});
			expect(result.success).toBe(false);
		});
	});

	describe('LayoutSchemaV02', () => {
		it('accepts valid layout', () => {
			const result = LayoutSchemaV02.safeParse({
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
			});
			expect(result.success).toBe(true);
		});

		it('accepts layout with device types and devices', () => {
			const result = LayoutSchemaV02.safeParse({
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
			});
			expect(result.success).toBe(true);
		});

		it('rejects missing version', () => {
			const result = LayoutSchemaV02.safeParse({
				name: 'Test Layout',
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
			});
			expect(result.success).toBe(false);
		});

		it('rejects missing rack', () => {
			const result = LayoutSchemaV02.safeParse({
				version: '0.2.0',
				name: 'Test Layout',
				device_types: [],
				settings: {
					display_mode: 'label',
					show_labels_on_images: true
				}
			});
			expect(result.success).toBe(false);
		});

		it('rejects empty name', () => {
			const result = LayoutSchemaV02.safeParse({
				version: '0.2.0',
				name: '',
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
			});
			expect(result.success).toBe(false);
		});

		it('accepts layout with unique slugs', () => {
			const result = LayoutSchemaV02.safeParse({
				version: '0.2.0',
				name: 'Test Layout',
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
				device_types: [
					{
						slug: 'device-1',
						u_height: 1,
						rackarr: { colour: '#000000', category: 'server' }
					},
					{
						slug: 'device-2',
						u_height: 2,
						rackarr: { colour: '#111111', category: 'storage' }
					}
				],
				settings: {
					display_mode: 'label',
					show_labels_on_images: true
				}
			});
			expect(result.success).toBe(true);
		});

		it('rejects layout with duplicate slugs', () => {
			const result = LayoutSchemaV02.safeParse({
				version: '0.2.0',
				name: 'Test Layout',
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
				device_types: [
					{
						slug: 'duplicate-slug',
						u_height: 1,
						rackarr: { colour: '#000000', category: 'server' }
					},
					{
						slug: 'duplicate-slug',
						u_height: 2,
						rackarr: { colour: '#111111', category: 'storage' }
					}
				],
				settings: {
					display_mode: 'label',
					show_labels_on_images: true
				}
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain('Duplicate device type slugs');
			}
		});

		it('rejects layout with multiple duplicate slugs', () => {
			const result = LayoutSchemaV02.safeParse({
				version: '0.2.0',
				name: 'Test Layout',
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
				device_types: [
					{
						slug: 'slug-a',
						u_height: 1,
						rackarr: { colour: '#000000', category: 'server' }
					},
					{
						slug: 'slug-a',
						u_height: 2,
						rackarr: { colour: '#111111', category: 'storage' }
					},
					{
						slug: 'slug-b',
						u_height: 1,
						rackarr: { colour: '#222222', category: 'networking' }
					},
					{
						slug: 'slug-b',
						u_height: 2,
						rackarr: { colour: '#333333', category: 'power' }
					}
				],
				settings: {
					display_mode: 'label',
					show_labels_on_images: true
				}
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				const errorMsg = result.error.issues[0].message;
				expect(errorMsg).toContain('slug-a');
				expect(errorMsg).toContain('slug-b');
			}
		});
	});

	describe('validateSlugUniqueness', () => {
		it('returns empty array for empty input', () => {
			const result = validateSlugUniqueness([]);
			expect(result).toEqual([]);
		});

		it('returns empty array when all slugs are unique', () => {
			const result = validateSlugUniqueness([
				{ slug: 'device-1' },
				{ slug: 'device-2' },
				{ slug: 'device-3' }
			]);
			expect(result).toEqual([]);
		});

		it('returns duplicate slug when one exists', () => {
			const result = validateSlugUniqueness([
				{ slug: 'device-1' },
				{ slug: 'device-1' },
				{ slug: 'device-2' }
			]);
			expect(result).toEqual(['device-1']);
		});

		it('returns multiple duplicates when they exist', () => {
			const result = validateSlugUniqueness([
				{ slug: 'device-a' },
				{ slug: 'device-a' },
				{ slug: 'device-b' },
				{ slug: 'device-b' },
				{ slug: 'device-c' }
			]);
			expect(result).toHaveLength(2);
			expect(result).toContain('device-a');
			expect(result).toContain('device-b');
		});

		it('returns slug once even if it appears three times', () => {
			const result = validateSlugUniqueness([
				{ slug: 'device-1' },
				{ slug: 'device-1' },
				{ slug: 'device-1' }
			]);
			expect(result).toEqual(['device-1']);
		});

		it('handles single device type', () => {
			const result = validateSlugUniqueness([{ slug: 'single-device' }]);
			expect(result).toEqual([]);
		});
	});
});
