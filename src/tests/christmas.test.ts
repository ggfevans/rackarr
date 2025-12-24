/**
 * Christmas Easter Egg Tests
 * Tests for the December 25th Santa hat easter egg
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { isChristmas } from '$lib/utils/christmas';
import SantaHat from '$lib/components/SantaHat.svelte';

describe('isChristmas', () => {
	it('returns true on December 25', () => {
		const christmasDay = new Date(2024, 11, 25); // December 25, 2024
		expect(isChristmas(christmasDay)).toBe(true);
	});

	it('returns true when ?christmas=true URL param is set', () => {
		// Save original location
		const originalLocation = window.location;

		// Mock window.location.search
		Object.defineProperty(window, 'location', {
			value: { search: '?christmas=true' },
			writable: true
		});

		// Should return true even on a non-Christmas date
		expect(isChristmas(new Date(2024, 6, 4))).toBe(true);

		// Restore original location
		Object.defineProperty(window, 'location', {
			value: originalLocation,
			writable: true
		});
	});

	it('returns true on December 25 regardless of year', () => {
		expect(isChristmas(new Date(2023, 11, 25))).toBe(true);
		expect(isChristmas(new Date(2025, 11, 25))).toBe(true);
		expect(isChristmas(new Date(2030, 11, 25))).toBe(true);
	});

	it('returns false on December 24 (Christmas Eve)', () => {
		const christmasEve = new Date(2024, 11, 24);
		expect(isChristmas(christmasEve)).toBe(false);
	});

	it('returns false on December 26 (Boxing Day)', () => {
		const boxingDay = new Date(2024, 11, 26);
		expect(isChristmas(boxingDay)).toBe(false);
	});

	it('returns false on other dates', () => {
		expect(isChristmas(new Date(2024, 0, 1))).toBe(false); // Jan 1
		expect(isChristmas(new Date(2024, 6, 4))).toBe(false); // July 4
		expect(isChristmas(new Date(2024, 9, 31))).toBe(false); // Halloween
	});

	it('returns false on December 25 in other months with same day number', () => {
		// Month 0 = January, so day 25 in January should be false
		expect(isChristmas(new Date(2024, 0, 25))).toBe(false);
		expect(isChristmas(new Date(2024, 5, 25))).toBe(false);
	});
});

describe('SantaHat', () => {
	it('renders an SVG element', () => {
		const { container } = render(SantaHat);
		const svg = container.querySelector('svg');
		expect(svg).toBeTruthy();
		expect(svg).toHaveClass('santa-hat');
	});

	it('renders with default size of 24', () => {
		const { container } = render(SantaHat);
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('width', '24');
		expect(svg).toHaveAttribute('height', '24');
	});

	it('renders with custom size', () => {
		const { container } = render(SantaHat, { props: { size: 48 } });
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('width', '48');
		expect(svg).toHaveAttribute('height', '48');
	});

	it('contains hat body path (red)', () => {
		const { container } = render(SantaHat);
		const hatBody = container.querySelector('path[fill="#FF5555"]');
		expect(hatBody).toBeTruthy();
	});

	it('contains white trim rectangle', () => {
		const { container } = render(SantaHat);
		const trim = container.querySelector('rect[fill="#FFFFFF"]');
		expect(trim).toBeTruthy();
	});

	it('contains white pom-pom circle', () => {
		const { container } = render(SantaHat);
		const pompom = container.querySelector('circle[fill="#FFFFFF"]');
		expect(pompom).toBeTruthy();
	});

	it('is rotated for jaunty appearance', () => {
		const { container } = render(SantaHat);
		const svg = container.querySelector('svg');
		expect(svg?.getAttribute('style')).toContain('rotate(19deg)');
	});

	it('is aria-hidden for accessibility', () => {
		const { container } = render(SantaHat);
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('aria-hidden', 'true');
	});
});
