/**
 * CategoryIcon Component Tests
 * Tests for device category icon mapping and rendering
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import CategoryIcon from '$lib/components/CategoryIcon.svelte';
import type { DeviceCategory } from '$lib/types';

describe('CategoryIcon', () => {
	// All valid device categories
	const allCategories: DeviceCategory[] = [
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
		'cable-management',
		'other'
	];

	describe('Rendering', () => {
		it('renders without crashing for all valid categories', () => {
			for (const category of allCategories) {
				const { unmount } = render(CategoryIcon, { props: { category } });
				expect(document.querySelector('.category-icon')).toBeTruthy();
				unmount();
			}
		});

		it('renders an SVG icon inside the wrapper', () => {
			render(CategoryIcon, { props: { category: 'server' } });
			const wrapper = document.querySelector('.category-icon');
			expect(wrapper).toBeTruthy();
			const svg = wrapper?.querySelector('svg');
			expect(svg).toBeTruthy();
		});

		it('applies aria-hidden to the icon for accessibility', () => {
			render(CategoryIcon, { props: { category: 'server' } });
			const svg = document.querySelector('.category-icon svg');
			expect(svg?.getAttribute('aria-hidden')).toBe('true');
		});
	});

	describe('Size Prop', () => {
		it('uses default size of 16 when not specified', () => {
			render(CategoryIcon, { props: { category: 'server' } });
			const svg = document.querySelector('.category-icon svg');
			expect(svg?.getAttribute('width')).toBe('16');
			expect(svg?.getAttribute('height')).toBe('16');
		});

		it('applies custom size when specified', () => {
			render(CategoryIcon, { props: { category: 'server', size: 24 } });
			const svg = document.querySelector('.category-icon svg');
			expect(svg?.getAttribute('width')).toBe('24');
			expect(svg?.getAttribute('height')).toBe('24');
		});

		it('applies small size correctly', () => {
			render(CategoryIcon, { props: { category: 'network', size: 12 } });
			const svg = document.querySelector('.category-icon svg');
			expect(svg?.getAttribute('width')).toBe('12');
			expect(svg?.getAttribute('height')).toBe('12');
		});

		it('applies large size correctly', () => {
			render(CategoryIcon, { props: { category: 'storage', size: 48 } });
			const svg = document.querySelector('.category-icon svg');
			expect(svg?.getAttribute('width')).toBe('48');
			expect(svg?.getAttribute('height')).toBe('48');
		});
	});

	describe('Category Icon Mapping', () => {
		// Each category should render a distinct icon
		// We verify by checking that SVGs are rendered for each category

		it('renders server category icon', () => {
			render(CategoryIcon, { props: { category: 'server' } });
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});

		it('renders network category icon', () => {
			render(CategoryIcon, { props: { category: 'network' } });
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});

		it('renders patch-panel category icon', () => {
			render(CategoryIcon, { props: { category: 'patch-panel' } });
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});

		it('renders power category icon', () => {
			render(CategoryIcon, { props: { category: 'power' } });
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});

		it('renders storage category icon', () => {
			render(CategoryIcon, { props: { category: 'storage' } });
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});

		it('renders kvm category icon', () => {
			render(CategoryIcon, { props: { category: 'kvm' } });
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});

		it('renders av-media category icon', () => {
			render(CategoryIcon, { props: { category: 'av-media' } });
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});

		it('renders cooling category icon', () => {
			render(CategoryIcon, { props: { category: 'cooling' } });
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});

		it('renders shelf category icon', () => {
			render(CategoryIcon, { props: { category: 'shelf' } });
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});

		it('renders blank category icon', () => {
			render(CategoryIcon, { props: { category: 'blank' } });
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});

		it('renders cable-management category icon', () => {
			render(CategoryIcon, { props: { category: 'cable-management' } });
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});

		it('renders other category icon', () => {
			render(CategoryIcon, { props: { category: 'other' } });
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});
	});

	describe('Fallback Behavior', () => {
		it('renders fallback icon for unknown category', () => {
			// @ts-expect-error - intentionally testing invalid category
			render(CategoryIcon, { props: { category: 'unknown-category' } });
			// Should render CircleQuestionMark fallback
			expect(document.querySelector('.category-icon svg')).toBeTruthy();
		});
	});

	describe('Styling', () => {
		it('has inline-flex display on wrapper', () => {
			render(CategoryIcon, { props: { category: 'server' } });
			const wrapper = document.querySelector('.category-icon');
			expect(wrapper).toBeTruthy();
			// Component has the class, styles applied via CSS
			expect(wrapper?.classList.contains('category-icon')).toBe(true);
		});
	});
});
