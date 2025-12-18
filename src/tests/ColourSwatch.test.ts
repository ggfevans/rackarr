/**
 * ColourSwatch Component Tests
 * Tests for color preview swatch rendering
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ColourSwatch from '$lib/components/ColourSwatch.svelte';

describe('ColourSwatch', () => {
	describe('Rendering', () => {
		it('renders without crashing', () => {
			render(ColourSwatch, { props: { colour: '#ff0000' } });
			expect(document.querySelector('.colour-swatch')).toBeTruthy();
		});

		it('renders as a span element', () => {
			render(ColourSwatch, { props: { colour: '#00ff00' } });
			const swatch = document.querySelector('.colour-swatch');
			expect(swatch?.tagName).toBe('SPAN');
		});
	});

	describe('Colour Prop', () => {
		it('applies colour as background-color', () => {
			render(ColourSwatch, { props: { colour: '#ff5500' } });
			const swatch = document.querySelector('.colour-swatch') as HTMLElement;
			// happy-dom keeps hex, jsdom converts to rgb
			expect(['#ff5500', 'rgb(255, 85, 0)']).toContain(swatch?.style.backgroundColor);
		});

		it('supports hex colour format', () => {
			render(ColourSwatch, { props: { colour: '#123456' } });
			const swatch = document.querySelector('.colour-swatch') as HTMLElement;
			// happy-dom keeps hex, jsdom converts to rgb
			expect(['#123456', 'rgb(18, 52, 86)']).toContain(swatch?.style.backgroundColor);
		});

		it('supports rgb colour format', () => {
			render(ColourSwatch, { props: { colour: 'rgb(100, 150, 200)' } });
			const swatch = document.querySelector('.colour-swatch') as HTMLElement;
			expect(swatch?.style.backgroundColor).toBe('rgb(100, 150, 200)');
		});

		it('supports named colours', () => {
			render(ColourSwatch, { props: { colour: 'red' } });
			const swatch = document.querySelector('.colour-swatch') as HTMLElement;
			expect(swatch?.style.backgroundColor).toBe('red');
		});
	});

	describe('Size Prop', () => {
		it('uses default size of 16px when not specified', () => {
			render(ColourSwatch, { props: { colour: '#ffffff' } });
			const swatch = document.querySelector('.colour-swatch') as HTMLElement;
			expect(swatch?.style.width).toBe('16px');
			expect(swatch?.style.height).toBe('16px');
		});

		it('applies custom size correctly', () => {
			render(ColourSwatch, { props: { colour: '#000000', size: 24 } });
			const swatch = document.querySelector('.colour-swatch') as HTMLElement;
			expect(swatch?.style.width).toBe('24px');
			expect(swatch?.style.height).toBe('24px');
		});

		it('applies small size correctly', () => {
			render(ColourSwatch, { props: { colour: '#aabbcc', size: 8 } });
			const swatch = document.querySelector('.colour-swatch') as HTMLElement;
			expect(swatch?.style.width).toBe('8px');
			expect(swatch?.style.height).toBe('8px');
		});

		it('applies large size correctly', () => {
			render(ColourSwatch, { props: { colour: '#ddeeff', size: 48 } });
			const swatch = document.querySelector('.colour-swatch') as HTMLElement;
			expect(swatch?.style.width).toBe('48px');
			expect(swatch?.style.height).toBe('48px');
		});
	});

	describe('Accessibility', () => {
		it('has role="presentation" for decorative purpose', () => {
			render(ColourSwatch, { props: { colour: '#ff0000' } });
			const swatch = document.querySelector('.colour-swatch');
			expect(swatch?.getAttribute('role')).toBe('presentation');
		});

		it('has aria-hidden="true" to hide from screen readers', () => {
			render(ColourSwatch, { props: { colour: '#00ff00' } });
			const swatch = document.querySelector('.colour-swatch');
			expect(swatch?.getAttribute('aria-hidden')).toBe('true');
		});
	});

	describe('Styling', () => {
		it('has inline-block display class', () => {
			render(ColourSwatch, { props: { colour: '#0000ff' } });
			const swatch = document.querySelector('.colour-swatch');
			expect(swatch?.classList.contains('colour-swatch')).toBe(true);
		});
	});
});
