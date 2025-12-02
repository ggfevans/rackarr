import { describe, it, expect } from 'vitest';
import { generateId, getDefaultColour, createDevice, validateDevice } from '$lib/utils/device';
import { CATEGORY_COLOURS } from '$lib/types/constants';
import type { DeviceCategory } from '$lib/types';

describe('Device Utilities', () => {
	describe('generateId', () => {
		it('returns valid UUID v4 format', () => {
			const id = generateId();
			// UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
			expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
		});

		it('returns unique values on successive calls', () => {
			const ids = new Set<string>();
			for (let i = 0; i < 100; i++) {
				ids.add(generateId());
			}
			expect(ids.size).toBe(100);
		});
	});

	describe('getDefaultColour', () => {
		it('returns #4A90D9 for server', () => {
			expect(getDefaultColour('server')).toBe('#4A90D9');
		});

		it('returns #7B68EE for network', () => {
			expect(getDefaultColour('network')).toBe('#7B68EE');
		});

		it('returns correct colour for each category', () => {
			const categories: DeviceCategory[] = [
				'server',
				'network',
				'patch-panel',
				'power',
				'storage',
				'kvm',
				'av-media',
				'cooling',
				'blank',
				'other'
			];

			categories.forEach((category) => {
				const colour = getDefaultColour(category);
				expect(colour).toBe(CATEGORY_COLOURS[category]);
			});
		});
	});

	describe('createDevice', () => {
		it('generates UUID when id not provided', () => {
			const device = createDevice({
				name: 'Test Server',
				height: 1,
				category: 'server'
			});

			expect(device.id).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
			);
		});

		it('applies default colour from category', () => {
			const device = createDevice({
				name: 'Test Server',
				height: 1,
				category: 'server'
			});

			expect(device.colour).toBe('#4A90D9');
		});

		it('preserves provided colour over default', () => {
			const customColour = '#FF0000';
			const device = createDevice({
				name: 'Test Server',
				height: 1,
				category: 'server',
				colour: customColour
			});

			expect(device.colour).toBe(customColour);
		});

		it('sets notes to undefined when not provided', () => {
			const device = createDevice({
				name: 'Test Server',
				height: 1,
				category: 'server'
			});

			expect(device.notes).toBeUndefined();
		});

		it('preserves provided notes', () => {
			const device = createDevice({
				name: 'Test Server',
				height: 1,
				category: 'server',
				notes: 'Primary server'
			});

			expect(device.notes).toBe('Primary server');
		});

		it('preserves provided id', () => {
			const customId = 'custom-id-123';
			const device = createDevice({
				name: 'Test Server',
				height: 1,
				category: 'server',
				id: customId
			});

			expect(device.id).toBe(customId);
		});
	});

	describe('validateDevice', () => {
		it('returns valid:true for valid device', () => {
			const result = validateDevice({
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Test Server',
				height: 1,
				colour: '#4A90D9',
				category: 'server'
			});

			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('rejects height less than 1', () => {
			const result = validateDevice({
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Test Server',
				height: 0,
				colour: '#4A90D9',
				category: 'server'
			});

			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Height must be between 0.5 and 42');
		});

		it('rejects height greater than 42', () => {
			const result = validateDevice({
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Test Server',
				height: 43,
				colour: '#4A90D9',
				category: 'server'
			});

			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Height must be between 0.5 and 42');
		});

		it('rejects empty name', () => {
			const result = validateDevice({
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: '',
				height: 1,
				colour: '#4A90D9',
				category: 'server'
			});

			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Name is required');
		});

		it('rejects whitespace-only name', () => {
			const result = validateDevice({
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: '   ',
				height: 1,
				colour: '#4A90D9',
				category: 'server'
			});

			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Name is required');
		});

		it('rejects invalid hex colour format', () => {
			const result = validateDevice({
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Test Server',
				height: 1,
				colour: 'red',
				category: 'server'
			});

			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Colour must be a valid hex colour (e.g., #4A90D9)');
		});

		it('rejects short hex colour', () => {
			const result = validateDevice({
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Test Server',
				height: 1,
				colour: '#FFF',
				category: 'server'
			});

			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Colour must be a valid hex colour (e.g., #4A90D9)');
		});

		it('returns specific error messages', () => {
			const result = validateDevice({
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: '',
				height: 0,
				colour: 'invalid',
				category: 'server'
			});

			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThanOrEqual(3);
			expect(result.errors).toContain('Name is required');
			expect(result.errors).toContain('Height must be between 0.5 and 42');
			expect(result.errors).toContain('Colour must be a valid hex colour (e.g., #4A90D9)');
		});

		it('accepts valid heights at boundaries', () => {
			const result1 = validateDevice({
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Test',
				height: 1,
				colour: '#4A90D9',
				category: 'server'
			});
			expect(result1.valid).toBe(true);

			const result42 = validateDevice({
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Test',
				height: 42,
				colour: '#4A90D9',
				category: 'server'
			});
			expect(result42.valid).toBe(true);
		});
	});
});
