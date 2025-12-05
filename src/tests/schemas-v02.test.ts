/**
 * v0.2 Zod Schema Tests
 * TDD: Tests written first, implementation follows
 */

import { describe, it, expect } from 'vitest';
import {
	SlugSchema,
	DeviceCategorySchema,
	FormFactorSchema,
	AirflowSchema,
	DeviceFaceSchema,
	WeightUnitSchema,
	RackarrExtensionsSchema,
	DeviceTypeSchema,
	PlacedDeviceSchema,
	RackSchema,
	LayoutSettingsSchema,
	LayoutSchema,
	validateSlugUniqueness
} from '$lib/schemas/v02';

describe('v0.2 Zod Schemas', () => {
	describe('SlugSchema', () => {
		it('accepts valid slug', () => {
			expect(SlugSchema.safeParse('valid-slug').success).toBe(true);
		});

		it('accepts slug with numbers', () => {
			expect(SlugSchema.safeParse('synology-ds920-plus').success).toBe(true);
		});

		it('accepts simple slug', () => {
			expect(SlugSchema.safeParse('simple').success).toBe(true);
		});

		it('accepts numbers only', () => {
			expect(SlugSchema.safeParse('123').success).toBe(true);
		});

		it('rejects empty string', () => {
			const result = SlugSchema.safeParse('');
			expect(result.success).toBe(false);
		});

		it('rejects uppercase', () => {
			const result = SlugSchema.safeParse('Invalid-Slug');
			expect(result.success).toBe(false);
		});

		it('rejects spaces', () => {
			const result = SlugSchema.safeParse('invalid slug');
			expect(result.success).toBe(false);
		});

		it('rejects leading hyphen', () => {
			const result = SlugSchema.safeParse('-invalid');
			expect(result.success).toBe(false);
		});

		it('rejects trailing hyphen', () => {
			const result = SlugSchema.safeParse('invalid-');
			expect(result.success).toBe(false);
		});

		it('rejects consecutive hyphens', () => {
			const result = SlugSchema.safeParse('invalid--slug');
			expect(result.success).toBe(false);
		});

		it('rejects underscores', () => {
			const result = SlugSchema.safeParse('invalid_slug');
			expect(result.success).toBe(false);
		});

		it('rejects slugs over 100 characters', () => {
			const longSlug = 'a'.repeat(101);
			const result = SlugSchema.safeParse(longSlug);
			expect(result.success).toBe(false);
		});
	});

	describe('DeviceCategorySchema', () => {
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
			expect(DeviceCategorySchema.safeParse(category).success).toBe(true);
		});

		it('rejects invalid category', () => {
			expect(DeviceCategorySchema.safeParse('invalid').success).toBe(false);
		});
	});

	describe('FormFactorSchema', () => {
		const validFormFactors = ['2-post', '4-post', '4-post-cabinet', 'wall-mount', 'open-frame'];

		it.each(validFormFactors)('accepts form factor: %s', (formFactor) => {
			expect(FormFactorSchema.safeParse(formFactor).success).toBe(true);
		});

		it('rejects invalid form factor', () => {
			expect(FormFactorSchema.safeParse('invalid').success).toBe(false);
		});
	});

	describe('AirflowSchema', () => {
		const validAirflows = [
			'front-to-rear',
			'rear-to-front',
			'left-to-right',
			'right-to-left',
			'side-to-rear',
			'passive'
		];

		it.each(validAirflows)('accepts airflow: %s', (airflow) => {
			expect(AirflowSchema.safeParse(airflow).success).toBe(true);
		});

		it('rejects invalid airflow', () => {
			expect(AirflowSchema.safeParse('invalid').success).toBe(false);
		});
	});

	describe('DeviceFaceSchema', () => {
		it('accepts front', () => {
			expect(DeviceFaceSchema.safeParse('front').success).toBe(true);
		});

		it('accepts rear', () => {
			expect(DeviceFaceSchema.safeParse('rear').success).toBe(true);
		});

		it('accepts both', () => {
			expect(DeviceFaceSchema.safeParse('both').success).toBe(true);
		});

		it('rejects invalid face', () => {
			expect(DeviceFaceSchema.safeParse('side').success).toBe(false);
		});
	});

	describe('WeightUnitSchema', () => {
		it('accepts kg', () => {
			expect(WeightUnitSchema.safeParse('kg').success).toBe(true);
		});

		it('accepts lb', () => {
			expect(WeightUnitSchema.safeParse('lb').success).toBe(true);
		});

		it('rejects invalid unit', () => {
			expect(WeightUnitSchema.safeParse('oz').success).toBe(false);
		});
	});

	describe('RackarrExtensionsSchema', () => {
		it('accepts valid extensions', () => {
			const result = RackarrExtensionsSchema.safeParse({
				colour: '#10b981',
				category: 'storage'
			});
			expect(result.success).toBe(true);
		});

		it('accepts extensions with tags', () => {
			const result = RackarrExtensionsSchema.safeParse({
				colour: '#10b981',
				category: 'storage',
				tags: ['nas', 'synology']
			});
			expect(result.success).toBe(true);
		});

		it('rejects invalid hex colour', () => {
			const result = RackarrExtensionsSchema.safeParse({
				colour: 'not-a-colour',
				category: 'storage'
			});
			expect(result.success).toBe(false);
		});

		it('rejects 3-character hex colour', () => {
			const result = RackarrExtensionsSchema.safeParse({
				colour: '#abc',
				category: 'storage'
			});
			expect(result.success).toBe(false);
		});

		it('rejects invalid category', () => {
			const result = RackarrExtensionsSchema.safeParse({
				colour: '#10b981',
				category: 'invalid'
			});
			expect(result.success).toBe(false);
		});
	});

	describe('DeviceTypeSchema', () => {
		it('accepts valid device type with required fields', () => {
			const result = DeviceTypeSchema.safeParse({
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
			const result = DeviceTypeSchema.safeParse({
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
			const result = DeviceTypeSchema.safeParse({
				u_height: 2,
				rackarr: {
					colour: '#10b981',
					category: 'storage'
				}
			});
			expect(result.success).toBe(false);
		});

		it('rejects invalid slug format', () => {
			const result = DeviceTypeSchema.safeParse({
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
			const result = DeviceTypeSchema.safeParse({
				slug: 'test-device',
				rackarr: {
					colour: '#10b981',
					category: 'storage'
				}
			});
			expect(result.success).toBe(false);
		});

		it('rejects u_height less than 1', () => {
			const result = DeviceTypeSchema.safeParse({
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
			const result = DeviceTypeSchema.safeParse({
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
			const result = DeviceTypeSchema.safeParse({
				slug: 'test-device',
				u_height: 2
			});
			expect(result.success).toBe(false);
		});
	});

	describe('PlacedDeviceSchema', () => {
		it('accepts valid device', () => {
			const result = PlacedDeviceSchema.safeParse({
				device_type: 'synology-ds920-plus',
				position: 10,
				face: 'front'
			});
			expect(result.success).toBe(true);
		});

		it('accepts device with optional name', () => {
			const result = PlacedDeviceSchema.safeParse({
				device_type: 'synology-ds920-plus',
				name: 'Primary NAS',
				position: 10,
				face: 'front'
			});
			expect(result.success).toBe(true);
		});

		it('rejects missing device_type', () => {
			const result = PlacedDeviceSchema.safeParse({
				position: 10,
				face: 'front'
			});
			expect(result.success).toBe(false);
		});

		it('rejects position less than 1', () => {
			const result = PlacedDeviceSchema.safeParse({
				device_type: 'test',
				position: 0,
				face: 'front'
			});
			expect(result.success).toBe(false);
		});

		it('rejects invalid face', () => {
			const result = PlacedDeviceSchema.safeParse({
				device_type: 'test',
				position: 10,
				face: 'invalid'
			});
			expect(result.success).toBe(false);
		});

		it('rejects name over 100 characters', () => {
			const result = PlacedDeviceSchema.safeParse({
				device_type: 'test',
				name: 'a'.repeat(101),
				position: 10,
				face: 'front'
			});
			expect(result.success).toBe(false);
		});
	});

	describe('RackSchema', () => {
		it('accepts valid rack', () => {
			const result = RackSchema.safeParse({
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
			const result = RackSchema.safeParse({
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
			const result = RackSchema.safeParse({
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
			const result = RackSchema.safeParse({
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
			const result = RackSchema.safeParse({
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
			const result = RackSchema.safeParse({
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
			const result = RackSchema.safeParse({
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

	describe('LayoutSettingsSchema', () => {
		it('accepts valid settings with label mode', () => {
			const result = LayoutSettingsSchema.safeParse({
				display_mode: 'label',
				show_labels_on_images: false
			});
			expect(result.success).toBe(true);
		});

		it('accepts valid settings with image mode', () => {
			const result = LayoutSettingsSchema.safeParse({
				display_mode: 'image',
				show_labels_on_images: true
			});
			expect(result.success).toBe(true);
		});

		it('rejects invalid display mode', () => {
			const result = LayoutSettingsSchema.safeParse({
				display_mode: 'invalid',
				show_labels_on_images: true
			});
			expect(result.success).toBe(false);
		});
	});

	describe('LayoutSchema', () => {
		it('accepts valid layout', () => {
			const result = LayoutSchema.safeParse({
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
			const result = LayoutSchema.safeParse({
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
			const result = LayoutSchema.safeParse({
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
			const result = LayoutSchema.safeParse({
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
			const result = LayoutSchema.safeParse({
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
			const result = LayoutSchema.safeParse({
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
			const result = LayoutSchema.safeParse({
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
			const result = LayoutSchema.safeParse({
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
