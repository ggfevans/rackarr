import { describe, it, expect } from 'vitest';
import {
	DeviceSchema,
	AirflowSchema,
	WeightUnitSchema,
	DeviceFaceSchema,
	CategorySchema,
	DeviceImagesSchema
} from '$lib/schemas/device';

describe('Device Schema', () => {
	describe('AirflowSchema', () => {
		it('accepts all valid airflow values', () => {
			const validValues = [
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

			for (const value of validValues) {
				expect(AirflowSchema.safeParse(value).success).toBe(true);
			}
		});

		it('rejects invalid airflow values', () => {
			expect(AirflowSchema.safeParse('invalid').success).toBe(false);
			expect(AirflowSchema.safeParse('').success).toBe(false);
		});
	});

	describe('WeightUnitSchema', () => {
		it('accepts all valid weight unit values', () => {
			const validValues = ['kg', 'g', 'lb', 'oz'];

			for (const value of validValues) {
				expect(WeightUnitSchema.safeParse(value).success).toBe(true);
			}
		});

		it('rejects invalid weight unit values', () => {
			expect(WeightUnitSchema.safeParse('invalid').success).toBe(false);
			expect(WeightUnitSchema.safeParse('kilogram').success).toBe(false);
		});
	});

	describe('DeviceFaceSchema', () => {
		it('accepts all valid face values', () => {
			const validValues = ['front', 'rear', 'both'];

			for (const value of validValues) {
				expect(DeviceFaceSchema.safeParse(value).success).toBe(true);
			}
		});

		it('rejects invalid face values', () => {
			expect(DeviceFaceSchema.safeParse('invalid').success).toBe(false);
			expect(DeviceFaceSchema.safeParse('side').success).toBe(false);
		});
	});

	describe('CategorySchema', () => {
		it('accepts all 11 valid category values', () => {
			const validValues = [
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

			expect(validValues.length).toBe(11);

			for (const value of validValues) {
				expect(CategorySchema.safeParse(value).success).toBe(true);
			}
		});

		it('includes shelf category', () => {
			expect(CategorySchema.safeParse('shelf').success).toBe(true);
		});

		it('rejects invalid category values', () => {
			expect(CategorySchema.safeParse('invalid').success).toBe(false);
			expect(CategorySchema.safeParse('compute').success).toBe(false);
		});
	});

	describe('DeviceImagesSchema', () => {
		it('accepts empty object', () => {
			expect(DeviceImagesSchema.safeParse({}).success).toBe(true);
		});

		it('accepts front image only', () => {
			expect(DeviceImagesSchema.safeParse({ front: '/images/front.png' }).success).toBe(true);
		});

		it('accepts rear image only', () => {
			expect(DeviceImagesSchema.safeParse({ rear: '/images/rear.png' }).success).toBe(true);
		});

		it('accepts both images', () => {
			const result = DeviceImagesSchema.safeParse({
				front: '/images/front.png',
				rear: '/images/rear.png'
			});
			expect(result.success).toBe(true);
		});
	});

	describe('DeviceSchema', () => {
		describe('required fields', () => {
			it('accepts valid device with all required fields', () => {
				const validDevice = {
					slug: 'my-server-1',
					name: 'My Server',
					u_height: 2,
					category: 'server',
					colour: '#4A90D9',
					is_full_depth: true
				};

				const result = DeviceSchema.safeParse(validDevice);
				expect(result.success).toBe(true);
			});

			it('fails without slug', () => {
				const device = {
					name: 'My Server',
					u_height: 2,
					category: 'server',
					colour: '#4A90D9',
					is_full_depth: true
				};

				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});

			it('fails without name', () => {
				const device = {
					slug: 'my-server',
					u_height: 2,
					category: 'server',
					colour: '#4A90D9',
					is_full_depth: true
				};

				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});

			it('fails without u_height', () => {
				const device = {
					slug: 'my-server',
					name: 'My Server',
					category: 'server',
					colour: '#4A90D9',
					is_full_depth: true
				};

				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});

			it('fails without category', () => {
				const device = {
					slug: 'my-server',
					name: 'My Server',
					u_height: 2,
					colour: '#4A90D9',
					is_full_depth: true
				};

				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});

			it('fails without colour', () => {
				const device = {
					slug: 'my-server',
					name: 'My Server',
					u_height: 2,
					category: 'server',
					is_full_depth: true
				};

				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});
		});

		describe('slug validation', () => {
			it('accepts valid slug patterns', () => {
				const validSlugs = ['server-1', 'my_server', 'server123', 'a', '123', 'my-cool_server-2'];

				for (const slug of validSlugs) {
					const device = {
						slug,
						name: 'Test',
						u_height: 1,
						category: 'server',
						colour: '#000000',
						is_full_depth: true
					};
					expect(DeviceSchema.safeParse(device).success).toBe(true);
				}
			});

			it('rejects invalid slug patterns', () => {
				const invalidSlugs = ['My Server', 'server 1', 'Server', 'server!', 'UPPERCASE'];

				for (const slug of invalidSlugs) {
					const device = {
						slug,
						name: 'Test',
						u_height: 1,
						category: 'server',
						colour: '#000000',
						is_full_depth: true
					};
					expect(DeviceSchema.safeParse(device).success).toBe(false);
				}
			});
		});

		describe('u_height validation', () => {
			it('accepts valid u_height values', () => {
				const validHeights = [0.5, 1, 1.5, 2, 10, 42, 100];

				for (const u_height of validHeights) {
					const device = {
						slug: 'test',
						name: 'Test',
						u_height,
						category: 'server',
						colour: '#000000',
						is_full_depth: true
					};
					expect(DeviceSchema.safeParse(device).success).toBe(true);
				}
			});

			it('rejects u_height below minimum (0.5)', () => {
				const device = {
					slug: 'test',
					name: 'Test',
					u_height: 0.4,
					category: 'server',
					colour: '#000000',
					is_full_depth: true
				};
				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});

			it('rejects u_height above maximum (100)', () => {
				const device = {
					slug: 'test',
					name: 'Test',
					u_height: 101,
					category: 'server',
					colour: '#000000',
					is_full_depth: true
				};
				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});

			it('rejects u_height not a multiple of 0.5', () => {
				const device = {
					slug: 'test',
					name: 'Test',
					u_height: 1.3,
					category: 'server',
					colour: '#000000',
					is_full_depth: true
				};
				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});
		});

		describe('colour validation', () => {
			it('accepts valid hex colours', () => {
				const validColours = ['#000000', '#FFFFFF', '#4A90D9', '#abc123', '#AbC123'];

				for (const colour of validColours) {
					const device = {
						slug: 'test',
						name: 'Test',
						u_height: 1,
						category: 'server',
						colour,
						is_full_depth: true
					};
					expect(DeviceSchema.safeParse(device).success).toBe(true);
				}
			});

			it('rejects invalid colour formats', () => {
				const invalidColours = ['000000', '#FFF', 'red', '#GGGGGG', '#12345'];

				for (const colour of invalidColours) {
					const device = {
						slug: 'test',
						name: 'Test',
						u_height: 1,
						category: 'server',
						colour,
						is_full_depth: true
					};
					expect(DeviceSchema.safeParse(device).success).toBe(false);
				}
			});
		});

		describe('optional fields', () => {
			const baseDevice = {
				slug: 'test',
				name: 'Test',
				u_height: 1,
				category: 'server' as const,
				colour: '#000000',
				is_full_depth: true
			};

			it('accepts device without optional fields', () => {
				expect(DeviceSchema.safeParse(baseDevice).success).toBe(true);
			});

			it('accepts device with manufacturer', () => {
				const device = { ...baseDevice, manufacturer: 'Dell' };
				expect(DeviceSchema.safeParse(device).success).toBe(true);
			});

			it('rejects manufacturer over 100 characters', () => {
				const device = { ...baseDevice, manufacturer: 'A'.repeat(101) };
				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});

			it('accepts device with model', () => {
				const device = { ...baseDevice, model: 'PowerEdge R740' };
				expect(DeviceSchema.safeParse(device).success).toBe(true);
			});

			it('rejects model over 100 characters', () => {
				const device = { ...baseDevice, model: 'A'.repeat(101) };
				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});

			it('accepts device with part_number', () => {
				const device = { ...baseDevice, part_number: 'SKU-12345' };
				expect(DeviceSchema.safeParse(device).success).toBe(true);
			});

			it('rejects part_number over 50 characters', () => {
				const device = { ...baseDevice, part_number: 'A'.repeat(51) };
				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});

			it('accepts device with airflow', () => {
				const device = { ...baseDevice, airflow: 'front-to-rear' };
				expect(DeviceSchema.safeParse(device).success).toBe(true);
			});

			it('accepts device with face', () => {
				const device = { ...baseDevice, face: 'front' };
				expect(DeviceSchema.safeParse(device).success).toBe(true);
			});

			it('accepts device with images', () => {
				const device = { ...baseDevice, images: { front: '/img/front.png' } };
				expect(DeviceSchema.safeParse(device).success).toBe(true);
			});

			it('accepts device with notes', () => {
				const device = { ...baseDevice, notes: 'Production database server' };
				expect(DeviceSchema.safeParse(device).success).toBe(true);
			});
		});

		describe('weight/weight_unit relationship', () => {
			const baseDevice = {
				slug: 'test',
				name: 'Test',
				u_height: 1,
				category: 'server' as const,
				colour: '#000000',
				is_full_depth: true
			};

			it('accepts weight with weight_unit', () => {
				const device = { ...baseDevice, weight: 10.5, weight_unit: 'kg' };
				expect(DeviceSchema.safeParse(device).success).toBe(true);
			});

			it('accepts neither weight nor weight_unit', () => {
				expect(DeviceSchema.safeParse(baseDevice).success).toBe(true);
			});

			it('rejects weight without weight_unit', () => {
				const device = { ...baseDevice, weight: 10.5 };
				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});

			it('accepts weight_unit without weight', () => {
				// This is allowed - unit can be specified without weight
				const device = { ...baseDevice, weight_unit: 'kg' };
				expect(DeviceSchema.safeParse(device).success).toBe(true);
			});

			it('validates weight minimum (0)', () => {
				const device = { ...baseDevice, weight: 0, weight_unit: 'kg' };
				expect(DeviceSchema.safeParse(device).success).toBe(true);
			});

			it('rejects negative weight', () => {
				const device = { ...baseDevice, weight: -1, weight_unit: 'kg' };
				expect(DeviceSchema.safeParse(device).success).toBe(false);
			});

			it('validates weight is multiple of 0.01', () => {
				const device = { ...baseDevice, weight: 10.55, weight_unit: 'kg' };
				expect(DeviceSchema.safeParse(device).success).toBe(true);
			});
		});

		describe('defaults', () => {
			it('sets is_full_depth to true by default', () => {
				const device = {
					slug: 'test',
					name: 'Test',
					u_height: 1,
					category: 'server',
					colour: '#000000'
				};
				const result = DeviceSchema.safeParse(device);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.is_full_depth).toBe(true);
				}
			});

			it('sets face to both by default', () => {
				const device = {
					slug: 'test',
					name: 'Test',
					u_height: 1,
					category: 'server',
					colour: '#000000'
				};
				const result = DeviceSchema.safeParse(device);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.face).toBe('both');
				}
			});
		});

		describe('type inference', () => {
			it('infers correct type from schema', () => {
				const device = {
					slug: 'test-server',
					name: 'Test Server',
					u_height: 2,
					category: 'server' as const,
					colour: '#4A90D9',
					is_full_depth: true,
					manufacturer: 'Dell',
					model: 'PowerEdge R740',
					airflow: 'front-to-rear' as const,
					weight: 25.5,
					weight_unit: 'kg' as const
				};

				const result = DeviceSchema.safeParse(device);
				expect(result.success).toBe(true);
				if (result.success) {
					// Type assertions to verify inference
					expect(typeof result.data.slug).toBe('string');
					expect(typeof result.data.name).toBe('string');
					expect(typeof result.data.u_height).toBe('number');
					expect(typeof result.data.category).toBe('string');
					expect(typeof result.data.colour).toBe('string');
					expect(typeof result.data.is_full_depth).toBe('boolean');
				}
			});
		});
	});
});
