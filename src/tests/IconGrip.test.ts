import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import IconGrip from '$lib/components/icons/IconGrip.svelte';

describe('IconGrip', () => {
	it('renders with default size 16', () => {
		const { container } = render(IconGrip);
		const svg = container.querySelector('svg');
		expect(svg).toBeTruthy();
		expect(svg?.getAttribute('width')).toBe('16');
		expect(svg?.getAttribute('height')).toBe('16');
	});

	it('renders with custom size', () => {
		const { container } = render(IconGrip, { props: { size: 24 } });
		const svg = container.querySelector('svg');
		expect(svg?.getAttribute('width')).toBe('24');
		expect(svg?.getAttribute('height')).toBe('24');
	});

	it('has aria-hidden attribute', () => {
		const { container } = render(IconGrip);
		const svg = container.querySelector('svg');
		expect(svg?.getAttribute('aria-hidden')).toBe('true');
	});

	it('contains 6 circles', () => {
		const { container } = render(IconGrip);
		const circles = container.querySelectorAll('circle');
		expect(circles).toHaveLength(6);
	});

	it('uses currentColor for fill', () => {
		const { container } = render(IconGrip);
		const circles = container.querySelectorAll('circle');
		circles.forEach((circle) => {
			expect(circle.getAttribute('fill')).toBe('currentColor');
		});
	});
});
