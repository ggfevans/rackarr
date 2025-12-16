import { describe, test, expect } from 'vitest';
import { CATEGORY_COLOURS } from '$lib/types/constants';
import { getContrastRatio, RACK_BG } from '$lib/utils/contrast';

describe('CATEGORY_COLOURS', () => {
	describe('Active Categories - Muted Dracula (WCAG AA)', () => {
		test('server should use muted cyan', () => {
			expect(CATEGORY_COLOURS.server).toBe('#4A7A8A');
		});

		test('network should use muted purple', () => {
			expect(CATEGORY_COLOURS.network).toBe('#7B6BA8');
		});

		test('storage should use muted green', () => {
			expect(CATEGORY_COLOURS.storage).toBe('#3D7A4A');
		});

		test('power should use muted red', () => {
			expect(CATEGORY_COLOURS.power).toBe('#A84A4A');
		});

		test('kvm should use muted orange', () => {
			expect(CATEGORY_COLOURS.kvm).toBe('#A87A4A');
		});

		test('av-media should use muted pink', () => {
			expect(CATEGORY_COLOURS['av-media']).toBe('#A85A7A');
		});

		test('cooling should use muted yellow', () => {
			expect(CATEGORY_COLOURS.cooling).toBe('#8A8A4A');
		});
	});

	describe('Passive Categories - Dracula Neutrals', () => {
		test('shelf should use Dracula comment', () => {
			expect(CATEGORY_COLOURS.shelf).toBe('#6272A4');
		});

		test('blank should use Dracula selection', () => {
			expect(CATEGORY_COLOURS.blank).toBe('#44475A');
		});

		test('cable-management should use Dracula comment', () => {
			expect(CATEGORY_COLOURS['cable-management']).toBe('#6272A4');
		});

		test('patch-panel should use Dracula comment', () => {
			expect(CATEGORY_COLOURS['patch-panel']).toBe('#6272A4');
		});

		test('other should use Dracula comment', () => {
			expect(CATEGORY_COLOURS.other).toBe('#6272A4');
		});
	});

	describe('All categories defined', () => {
		test('should have exactly 12 categories', () => {
			expect(Object.keys(CATEGORY_COLOURS)).toHaveLength(12);
		});

		test('all category values should be valid hex colors', () => {
			const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
			Object.values(CATEGORY_COLOURS).forEach((color) => {
				expect(color).toMatch(hexColorRegex);
			});
		});
	});
});

describe('Category Colours Contrast on Rack', () => {
	// Rack background stays dark (neutral-900: #18181b) in both themes
	// Muted colours prioritize text readability (4.5:1 with white text)
	// over high visibility on dark backgrounds (3:1+ is acceptable)

	describe('Active Categories - muted but visible', () => {
		// BRAND.md v0.6.0: Muted palette trades background contrast for text readability
		// 3:1+ is acceptable for UI components per WCAG
		test('server (muted cyan) has acceptable contrast on rack', () => {
			const ratio = getContrastRatio(CATEGORY_COLOURS.server, RACK_BG);
			expect(ratio).toBeGreaterThanOrEqual(3);
		});

		test('network (muted purple) has acceptable contrast on rack', () => {
			const ratio = getContrastRatio(CATEGORY_COLOURS.network, RACK_BG);
			expect(ratio).toBeGreaterThanOrEqual(3);
		});

		test('storage (muted green) has acceptable contrast on rack', () => {
			const ratio = getContrastRatio(CATEGORY_COLOURS.storage, RACK_BG);
			expect(ratio).toBeGreaterThanOrEqual(3);
		});

		test('power (muted red) has acceptable contrast on rack', () => {
			const ratio = getContrastRatio(CATEGORY_COLOURS.power, RACK_BG);
			expect(ratio).toBeGreaterThanOrEqual(3);
		});

		test('kvm (muted orange) has acceptable contrast on rack', () => {
			const ratio = getContrastRatio(CATEGORY_COLOURS.kvm, RACK_BG);
			expect(ratio).toBeGreaterThanOrEqual(3);
		});

		test('av-media (muted pink) has acceptable contrast on rack', () => {
			const ratio = getContrastRatio(CATEGORY_COLOURS['av-media'], RACK_BG);
			expect(ratio).toBeGreaterThanOrEqual(3);
		});

		test('cooling (muted yellow) has acceptable contrast on rack', () => {
			const ratio = getContrastRatio(CATEGORY_COLOURS.cooling, RACK_BG);
			expect(ratio).toBeGreaterThanOrEqual(3);
		});
	});

	describe('Passive Categories - acceptable visibility', () => {
		test('shelf (comment) has acceptable contrast on rack', () => {
			const ratio = getContrastRatio(CATEGORY_COLOURS.shelf, RACK_BG);
			// Comment color is muted but still visible (3:1+)
			expect(ratio).toBeGreaterThanOrEqual(3);
		});

		test('blank (selection) has minimum contrast on rack', () => {
			const ratio = getContrastRatio(CATEGORY_COLOURS.blank, RACK_BG);
			// Blank intentionally subdued - fades into background but still visible
			expect(ratio).toBeGreaterThanOrEqual(1.5);
		});

		test('cable-management has acceptable contrast on rack', () => {
			const ratio = getContrastRatio(CATEGORY_COLOURS['cable-management'], RACK_BG);
			expect(ratio).toBeGreaterThanOrEqual(3);
		});

		test('patch-panel has acceptable contrast on rack', () => {
			const ratio = getContrastRatio(CATEGORY_COLOURS['patch-panel'], RACK_BG);
			expect(ratio).toBeGreaterThanOrEqual(3);
		});

		test('other has acceptable contrast on rack', () => {
			const ratio = getContrastRatio(CATEGORY_COLOURS.other, RACK_BG);
			expect(ratio).toBeGreaterThanOrEqual(3);
		});
	});
});
