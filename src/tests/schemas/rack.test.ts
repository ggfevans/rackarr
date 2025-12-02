import { describe, it, expect } from 'vitest';
import { RackSchema, FormFactorSchema, PlacedDeviceSchema } from '$lib/schemas/rack';

describe('Rack Schema', () => {
	describe('FormFactorSchema', () => {
		it('accepts all valid form factor values', () => {
			const validValues = [
				'4-post-cabinet',
				'4-post-frame',
				'2-post-frame',
				'wall-cabinet',
				'wall-frame',
				'wall-frame-vertical',
				'wall-cabinet-vertical'
			];

			expect(validValues.length).toBe(7);

			for (const value of validValues) {
				expect(FormFactorSchema.safeParse(value).success).toBe(true);
			}
		});

		it('rejects invalid form factor values', () => {
			expect(FormFactorSchema.safeParse('invalid').success).toBe(false);
			expect(FormFactorSchema.safeParse('cabinet').success).toBe(false);
			expect(FormFactorSchema.safeParse('').success).toBe(false);
		});
	});

	describe('PlacedDeviceSchema', () => {
		it('accepts valid placed device with required fields', () => {
			const valid = {
				slug: 'server-1',
				position: 5
			};
			expect(PlacedDeviceSchema.safeParse(valid).success).toBe(true);
		});

		it('accepts placed device with optional face', () => {
			const valid = {
				slug: 'server-1',
				position: 5,
				face: 'front'
			};
			expect(PlacedDeviceSchema.safeParse(valid).success).toBe(true);
		});

		it('accepts all face values', () => {
			for (const face of ['front', 'rear', 'both']) {
				const valid = { slug: 'device', position: 1, face };
				expect(PlacedDeviceSchema.safeParse(valid).success).toBe(true);
			}
		});

		it('rejects placed device without slug', () => {
			const invalid = { position: 5 };
			expect(PlacedDeviceSchema.safeParse(invalid).success).toBe(false);
		});

		it('rejects placed device without position', () => {
			const invalid = { slug: 'server-1' };
			expect(PlacedDeviceSchema.safeParse(invalid).success).toBe(false);
		});

		it('rejects position less than 1', () => {
			const invalid = { slug: 'server-1', position: 0 };
			expect(PlacedDeviceSchema.safeParse(invalid).success).toBe(false);
		});

		it('rejects non-integer position', () => {
			const invalid = { slug: 'server-1', position: 5.5 };
			expect(PlacedDeviceSchema.safeParse(invalid).success).toBe(false);
		});

		it('rejects invalid face value', () => {
			const invalid = { slug: 'server-1', position: 5, face: 'side' };
			expect(PlacedDeviceSchema.safeParse(invalid).success).toBe(false);
		});
	});

	describe('RackSchema', () => {
		describe('required fields', () => {
			const validRack = {
				id: '550e8400-e29b-41d4-a716-446655440000',
				name: 'Main Rack',
				height: 42
			};

			it('accepts valid rack with required fields', () => {
				const result = RackSchema.safeParse(validRack);
				expect(result.success).toBe(true);
			});

			it('fails without id', () => {
				const { id: _id, ...invalid } = validRack;
				expect(RackSchema.safeParse(invalid).success).toBe(false);
			});

			it('fails without name', () => {
				const { name: _name, ...invalid } = validRack;
				expect(RackSchema.safeParse(invalid).success).toBe(false);
			});

			it('fails without height', () => {
				const { height: _height, ...invalid } = validRack;
				expect(RackSchema.safeParse(invalid).success).toBe(false);
			});
		});

		describe('id validation', () => {
			it('accepts valid UUID', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('accepts another valid UUID', () => {
				const rack = {
					id: '123e4567-e89b-12d3-a456-426614174000',
					name: 'Rack',
					height: 42
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('rejects non-UUID string', () => {
				const rack = {
					id: 'not-a-uuid',
					name: 'Rack',
					height: 42
				};
				expect(RackSchema.safeParse(rack).success).toBe(false);
			});

			it('rejects empty string', () => {
				const rack = {
					id: '',
					name: 'Rack',
					height: 42
				};
				expect(RackSchema.safeParse(rack).success).toBe(false);
			});
		});

		describe('name validation', () => {
			it('accepts valid name', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Main Server Rack',
					height: 42
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('rejects empty name', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: '',
					height: 42
				};
				expect(RackSchema.safeParse(rack).success).toBe(false);
			});
		});

		describe('height validation', () => {
			it('accepts minimum height (1)', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 1
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('accepts maximum height (100)', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 100
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('accepts common height (42)', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('rejects height below minimum (0)', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 0
				};
				expect(RackSchema.safeParse(rack).success).toBe(false);
			});

			it('rejects height above maximum (101)', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 101
				};
				expect(RackSchema.safeParse(rack).success).toBe(false);
			});

			it('rejects non-integer height', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42.5
				};
				expect(RackSchema.safeParse(rack).success).toBe(false);
			});
		});

		describe('width validation', () => {
			it('accepts width 19 (standard)', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					width: 19
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('accepts width 10 (telco)', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					width: 10
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('defaults width to 19', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42
				};
				const result = RackSchema.safeParse(rack);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.width).toBe(19);
				}
			});
		});

		describe('form_factor validation', () => {
			it('accepts valid form_factor', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					form_factor: '2-post-frame'
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('defaults form_factor to 4-post-cabinet', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42
				};
				const result = RackSchema.safeParse(rack);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.form_factor).toBe('4-post-cabinet');
				}
			});

			it('rejects invalid form_factor', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					form_factor: 'invalid'
				};
				expect(RackSchema.safeParse(rack).success).toBe(false);
			});
		});

		describe('desc_units validation', () => {
			it('accepts desc_units true', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					desc_units: true
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('accepts desc_units false', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					desc_units: false
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('defaults desc_units to false', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42
				};
				const result = RackSchema.safeParse(rack);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.desc_units).toBe(false);
				}
			});
		});

		describe('starting_unit validation', () => {
			it('accepts starting_unit of 1', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					starting_unit: 1
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('accepts starting_unit greater than 1', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					starting_unit: 10
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('defaults starting_unit to 1', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42
				};
				const result = RackSchema.safeParse(rack);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.starting_unit).toBe(1);
				}
			});

			it('rejects starting_unit less than 1', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					starting_unit: 0
				};
				expect(RackSchema.safeParse(rack).success).toBe(false);
			});

			it('rejects non-integer starting_unit', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					starting_unit: 1.5
				};
				expect(RackSchema.safeParse(rack).success).toBe(false);
			});
		});

		describe('devices array validation', () => {
			it('accepts empty devices array', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					devices: []
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('defaults devices to empty array', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42
				};
				const result = RackSchema.safeParse(rack);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.devices).toEqual([]);
				}
			});

			it('accepts rack with devices', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					devices: [
						{ slug: 'server-1', position: 1 },
						{ slug: 'switch-1', position: 40, face: 'front' }
					]
				};
				expect(RackSchema.safeParse(rack).success).toBe(true);
			});

			it('rejects rack with invalid device', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Rack',
					height: 42,
					devices: [{ slug: 'server-1' }] // missing position
				};
				expect(RackSchema.safeParse(rack).success).toBe(false);
			});
		});

		describe('full rack with all fields', () => {
			it('accepts rack with all fields specified', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Production Rack A1',
					height: 42,
					width: 19,
					form_factor: '4-post-cabinet' as const,
					desc_units: false,
					starting_unit: 1,
					devices: [
						{ slug: 'dell-r740', position: 1, face: 'front' },
						{ slug: 'cisco-switch', position: 40 }
					]
				};
				const result = RackSchema.safeParse(rack);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.id).toBe('550e8400-e29b-41d4-a716-446655440000');
					expect(result.data.name).toBe('Production Rack A1');
					expect(result.data.height).toBe(42);
					expect(result.data.width).toBe(19);
					expect(result.data.form_factor).toBe('4-post-cabinet');
					expect(result.data.desc_units).toBe(false);
					expect(result.data.starting_unit).toBe(1);
					expect(result.data.devices.length).toBe(2);
				}
			});
		});

		describe('type inference', () => {
			it('infers correct type from schema', () => {
				const rack = {
					id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Test Rack',
					height: 42
				};

				const result = RackSchema.safeParse(rack);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(typeof result.data.id).toBe('string');
					expect(typeof result.data.name).toBe('string');
					expect(typeof result.data.height).toBe('number');
					expect(typeof result.data.width).toBe('number');
					expect(typeof result.data.form_factor).toBe('string');
					expect(typeof result.data.desc_units).toBe('boolean');
					expect(typeof result.data.starting_unit).toBe('number');
					expect(Array.isArray(result.data.devices)).toBe(true);
				}
			});
		});
	});
});
