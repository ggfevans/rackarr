/**
 * ImageIndicator Component Tests
 * Tests for device image availability indicator
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ImageIndicator from '$lib/components/ImageIndicator.svelte';

describe('ImageIndicator', () => {
	describe('Visibility', () => {
		it('renders nothing when both front and rear are false', () => {
			const { container } = render(ImageIndicator, {
				props: { front: false, rear: false }
			});
			expect(container.querySelector('.image-indicator')).toBeNull();
		});

		it('renders indicator when front is true', () => {
			const { container } = render(ImageIndicator, {
				props: { front: true, rear: false }
			});
			expect(container.querySelector('.image-indicator')).toBeTruthy();
		});

		it('renders indicator when rear is true', () => {
			const { container } = render(ImageIndicator, {
				props: { front: false, rear: true }
			});
			expect(container.querySelector('.image-indicator')).toBeTruthy();
		});

		it('renders indicator when both are true', () => {
			const { container } = render(ImageIndicator, {
				props: { front: true, rear: true }
			});
			expect(container.querySelector('.image-indicator')).toBeTruthy();
		});
	});

	describe('Visual States', () => {
		it('shows front-only state with left half filled', () => {
			const { container } = render(ImageIndicator, {
				props: { front: true, rear: false }
			});
			const svg = container.querySelector('svg');
			expect(svg).toBeTruthy();
			// Left rect should be filled
			const leftRect = svg?.querySelector('.indicator-left');
			expect(leftRect?.getAttribute('fill')).not.toBe('none');
			// Right rect should be empty (stroke only)
			const rightRect = svg?.querySelector('.indicator-right');
			expect(rightRect?.getAttribute('fill')).toBe('none');
		});

		it('shows rear-only state with right half filled', () => {
			const { container } = render(ImageIndicator, {
				props: { front: false, rear: true }
			});
			const svg = container.querySelector('svg');
			expect(svg).toBeTruthy();
			// Left rect should be empty
			const leftRect = svg?.querySelector('.indicator-left');
			expect(leftRect?.getAttribute('fill')).toBe('none');
			// Right rect should be filled
			const rightRect = svg?.querySelector('.indicator-right');
			expect(rightRect?.getAttribute('fill')).not.toBe('none');
		});

		it('shows both state with full fill', () => {
			const { container } = render(ImageIndicator, {
				props: { front: true, rear: true }
			});
			const svg = container.querySelector('svg');
			expect(svg).toBeTruthy();
			// Both rects should be filled
			const leftRect = svg?.querySelector('.indicator-left');
			const rightRect = svg?.querySelector('.indicator-right');
			expect(leftRect?.getAttribute('fill')).not.toBe('none');
			expect(rightRect?.getAttribute('fill')).not.toBe('none');
		});
	});

	describe('Size Prop', () => {
		it('uses default size of 14 when not specified', () => {
			const { container } = render(ImageIndicator, {
				props: { front: true, rear: false }
			});
			const svg = container.querySelector('svg');
			expect(svg?.getAttribute('width')).toBe('14');
			expect(svg?.getAttribute('height')).toBe('14');
		});

		it('applies custom size when specified', () => {
			const { container } = render(ImageIndicator, {
				props: { front: true, rear: false, size: 20 }
			});
			const svg = container.querySelector('svg');
			expect(svg?.getAttribute('width')).toBe('20');
			expect(svg?.getAttribute('height')).toBe('20');
		});
	});

	describe('Accessibility', () => {
		it('has aria-hidden for decorative purposes', () => {
			const { container } = render(ImageIndicator, {
				props: { front: true, rear: true }
			});
			const svg = container.querySelector('svg');
			expect(svg?.getAttribute('aria-hidden')).toBe('true');
		});

		it('has appropriate title for screen readers', () => {
			const { container } = render(ImageIndicator, {
				props: { front: true, rear: true }
			});
			const title = container.querySelector('title');
			expect(title?.textContent).toContain('image');
		});
	});
});
