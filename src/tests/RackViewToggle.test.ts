import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import RackViewToggle from '$lib/components/RackViewToggle.svelte';
import type { RackView } from '$lib/types';

describe('RackViewToggle', () => {
	it('renders front and rear buttons', () => {
		const { getByRole } = render(RackViewToggle, {
			props: { view: 'front' as RackView, onchange: vi.fn() }
		});
		expect(getByRole('button', { name: 'Front' })).toBeTruthy();
		expect(getByRole('button', { name: 'Rear' })).toBeTruthy();
	});

	it('marks current view as pressed', () => {
		const { getByRole } = render(RackViewToggle, {
			props: { view: 'front' as RackView, onchange: vi.fn() }
		});
		expect(getByRole('button', { name: 'Front' })).toHaveAttribute('aria-pressed', 'true');
		expect(getByRole('button', { name: 'Rear' })).toHaveAttribute('aria-pressed', 'false');
	});

	it('marks rear view as pressed when selected', () => {
		const { getByRole } = render(RackViewToggle, {
			props: { view: 'rear' as RackView, onchange: vi.fn() }
		});
		expect(getByRole('button', { name: 'Front' })).toHaveAttribute('aria-pressed', 'false');
		expect(getByRole('button', { name: 'Rear' })).toHaveAttribute('aria-pressed', 'true');
	});

	it('calls onchange when other view clicked', async () => {
		const onchange = vi.fn();
		const { getByRole } = render(RackViewToggle, {
			props: { view: 'front' as RackView, onchange }
		});
		await fireEvent.click(getByRole('button', { name: 'Rear' }));
		expect(onchange).toHaveBeenCalledWith('rear');
	});

	it('calls onchange with front when front clicked from rear', async () => {
		const onchange = vi.fn();
		const { getByRole } = render(RackViewToggle, {
			props: { view: 'rear' as RackView, onchange }
		});
		await fireEvent.click(getByRole('button', { name: 'Front' }));
		expect(onchange).toHaveBeenCalledWith('front');
	});

	it('does not call onchange when current view clicked', async () => {
		const onchange = vi.fn();
		const { getByRole } = render(RackViewToggle, {
			props: { view: 'front' as RackView, onchange }
		});
		await fireEvent.click(getByRole('button', { name: 'Front' }));
		expect(onchange).not.toHaveBeenCalled();
	});

	it('has role group with accessible name', () => {
		const { getByRole } = render(RackViewToggle, {
			props: { view: 'front' as RackView, onchange: vi.fn() }
		});
		expect(getByRole('group', { name: /rack view/i })).toBeTruthy();
	});
});
