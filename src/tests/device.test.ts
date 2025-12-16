import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateId, getDefaultColour } from '$lib/utils/device';
import { CATEGORY_COLOURS } from '$lib/types/constants';
import type { DeviceCategory } from '$lib/types';

describe('Device Utilities', () => {
	describe('generateId', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

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

		it('uses fallback when crypto.randomUUID is not available', () => {
			// Mock crypto.randomUUID to be undefined (simulating older browsers)
			const originalRandomUUID = crypto.randomUUID;
			Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });

			try {
				const id = generateId();
				// Should still return valid UUID v4 format from fallback
				expect(id).toMatch(
					/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
				);
			} finally {
				// Restore original function
				Object.defineProperty(crypto, 'randomUUID', {
					value: originalRandomUUID,
					configurable: true
				});
			}
		});

		it('fallback generates unique values', () => {
			const originalRandomUUID = crypto.randomUUID;
			Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });

			try {
				const ids = new Set<string>();
				for (let i = 0; i < 100; i++) {
					ids.add(generateId());
				}
				expect(ids.size).toBe(100);
			} finally {
				Object.defineProperty(crypto, 'randomUUID', {
					value: originalRandomUUID,
					configurable: true
				});
			}
		});
	});

	describe('getDefaultColour', () => {
		it('returns muted cyan for server', () => {
			expect(getDefaultColour('server')).toBe('#4A7A8A');
		});

		it('returns muted purple for network', () => {
			expect(getDefaultColour('network')).toBe('#7B6BA8');
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
