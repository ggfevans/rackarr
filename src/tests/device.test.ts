import { describe, it, expect } from 'vitest';
import { generateId, getDefaultColour } from '$lib/utils/device';
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
				'shelf',
				'blank',
				'other'
			];

			categories.forEach((category) => {
				const colour = getDefaultColour(category);
				expect(colour).toBe(CATEGORY_COLOURS[category]);
			});
		});
	});
});
