import { describe, it, expect } from 'vitest';
import {
	createRack,
	validateRack,
	getOccupiedUs,
	isUAvailable,
	duplicateRack
} from '$lib/utils/rack';
import type { Device, Rack } from '$lib/types';

// Helper to create test devices
function createTestDevice(id: string, height: number): Device {
	return {
		id,
		name: `Test Device ${id}`,
		height,
		colour: '#4A90D9',
		category: 'server'
	};
}

// Helper to create mock racks for testing
function createMockRack(overrides: Partial<Rack> = {}): Rack {
	return {
		id: 'rack-1',
		name: 'Test Rack',
		height: 42,
		width: 19,
		position: 0,
		view: 'front',
		devices: [],
		...overrides
	};
}

describe('Rack Utilities', () => {
	describe('createRack', () => {
		it('generates valid UUID', () => {
			const rack = createRack('Test Rack', 42);
			expect(rack.id).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
			);
		});

		it('sets width to 19', () => {
			const rack = createRack('Test Rack', 42);
			expect(rack.width).toBe(19);
		});

		it('sets position to 0', () => {
			const rack = createRack('Test Rack', 42);
			expect(rack.position).toBe(0);
		});

		it('initializes empty devices array', () => {
			const rack = createRack('Test Rack', 42);
			expect(rack.devices).toEqual([]);
		});

		it('preserves provided name and height', () => {
			const rack = createRack('Main Rack', 24);
			expect(rack.name).toBe('Main Rack');
			expect(rack.height).toBe(24);
		});

		it('creates rack with default front view', () => {
			const rack = createRack('Test', 42);
			expect(rack.view).toBe('front');
		});

		it('creates rack with specified rear view', () => {
			const rack = createRack('Test', 42, 'rear');
			expect(rack.view).toBe('rear');
		});
	});

	describe('validateRack', () => {
		it('returns valid:true for valid rack', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				devices: []
			};

			const result = validateRack(rack);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('rejects height less than 1', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Main Rack',
				height: 0,
				width: 19,
				position: 0,
				devices: []
			};

			const result = validateRack(rack);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Height must be between 1 and 100');
		});

		it('rejects height greater than 100', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Main Rack',
				height: 101,
				width: 19,
				position: 0,
				devices: []
			};

			const result = validateRack(rack);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Height must be between 1 and 100');
		});

		it('rejects empty name', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: '',
				height: 42,
				width: 19,
				position: 0,
				devices: []
			};

			const result = validateRack(rack);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Name is required');
		});

		it('rejects width other than 19', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Main Rack',
				height: 42,
				width: 23,
				position: 0,
				devices: []
			};

			const result = validateRack(rack);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Width must be 19 inches');
		});
	});

	describe('getOccupiedUs', () => {
		it('returns empty Set for empty rack', () => {
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				position: 0,
				devices: []
			};

			const deviceLibrary: Device[] = [];
			const occupied = getOccupiedUs(rack, deviceLibrary);
			expect(occupied.size).toBe(0);
		});

		it('returns correct Us for 1U device at position 5', () => {
			const device = createTestDevice('device-1', 1);
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				position: 0,
				devices: [{ libraryId: 'device-1', position: 5 }]
			};

			const occupied = getOccupiedUs(rack, [device]);
			expect(occupied.size).toBe(1);
			expect(occupied.has(5)).toBe(true);
		});

		it('returns correct Us for 2U device at position 5 (5,6)', () => {
			const device = createTestDevice('device-1', 2);
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				position: 0,
				devices: [{ libraryId: 'device-1', position: 5 }]
			};

			const occupied = getOccupiedUs(rack, [device]);
			expect(occupied.size).toBe(2);
			expect(occupied.has(5)).toBe(true);
			expect(occupied.has(6)).toBe(true);
		});

		it('returns correct Us for 4U device at position 10 (10,11,12,13)', () => {
			const device = createTestDevice('device-1', 4);
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				position: 0,
				devices: [{ libraryId: 'device-1', position: 10 }]
			};

			const occupied = getOccupiedUs(rack, [device]);
			expect(occupied.size).toBe(4);
			expect(occupied.has(10)).toBe(true);
			expect(occupied.has(11)).toBe(true);
			expect(occupied.has(12)).toBe(true);
			expect(occupied.has(13)).toBe(true);
		});

		it('combines multiple devices correctly', () => {
			const device1 = createTestDevice('device-1', 2);
			const device2 = createTestDevice('device-2', 1);
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				position: 0,
				devices: [
					{ libraryId: 'device-1', position: 1 },
					{ libraryId: 'device-2', position: 10 }
				]
			};

			const occupied = getOccupiedUs(rack, [device1, device2]);
			expect(occupied.size).toBe(3);
			expect(occupied.has(1)).toBe(true);
			expect(occupied.has(2)).toBe(true);
			expect(occupied.has(10)).toBe(true);
		});
	});

	describe('isUAvailable', () => {
		it('returns true for empty rack', () => {
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				position: 0,
				devices: []
			};

			expect(isUAvailable(rack, [], 1)).toBe(true);
			expect(isUAvailable(rack, [], 42)).toBe(true);
		});

		it('returns false for occupied U', () => {
			const device = createTestDevice('device-1', 2);
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				position: 0,
				devices: [{ libraryId: 'device-1', position: 5 }]
			};

			expect(isUAvailable(rack, [device], 5)).toBe(false);
			expect(isUAvailable(rack, [device], 6)).toBe(false);
		});

		it('returns true for unoccupied U', () => {
			const device = createTestDevice('device-1', 2);
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				position: 0,
				devices: [{ libraryId: 'device-1', position: 5 }]
			};

			expect(isUAvailable(rack, [device], 1)).toBe(true);
			expect(isUAvailable(rack, [device], 4)).toBe(true);
			expect(isUAvailable(rack, [device], 7)).toBe(true);
		});
	});

	describe('duplicateRack', () => {
		it('creates new rack with different ID', () => {
			const original = createMockRack({ id: 'rack-1' });
			const copy = duplicateRack(original);
			expect(copy.id).not.toBe(original.id);
		});

		it('appends (Copy) to name', () => {
			const original = createMockRack({ name: 'Main Rack' });
			const copy = duplicateRack(original);
			expect(copy.name).toBe('Main Rack (Copy)');
		});

		it('preserves rack properties including view', () => {
			const original = createMockRack({ height: 42, view: 'rear' });
			const copy = duplicateRack(original);
			expect(copy.height).toBe(42);
			expect(copy.view).toBe('rear');
		});

		it('copies all devices preserving positions and faces', () => {
			const original = createMockRack({
				devices: [
					{ libraryId: 'lib-1', position: 1, face: 'front' },
					{ libraryId: 'lib-2', position: 10, face: 'both' }
				]
			});
			const copy = duplicateRack(original);
			expect(copy.devices).toHaveLength(2);
			expect(copy.devices[0].position).toBe(1);
			expect(copy.devices[1].face).toBe('both');
		});

		it('positions copy after original', () => {
			const original = createMockRack({ position: 2 });
			const copy = duplicateRack(original);
			expect(copy.position).toBe(3);
		});
	});
});
