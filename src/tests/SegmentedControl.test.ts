import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import SegmentedControl from '$lib/components/SegmentedControl.svelte';

const testOptions = [
	{ value: 'brand', label: 'Brand' },
	{ value: 'category', label: 'Category' },
	{ value: 'flat', label: 'A-Z' }
];

describe('SegmentedControl Component', () => {
	describe('Rendering', () => {
		it('renders all options as buttons', () => {
			render(SegmentedControl, {
				props: { options: testOptions, value: 'brand' }
			});

			expect(screen.getByRole('button', { name: 'Brand' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Category' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'A-Z' })).toBeInTheDocument();
		});

		it('renders the correct number of buttons', () => {
			render(SegmentedControl, {
				props: { options: testOptions, value: 'brand' }
			});

			const buttons = screen.getAllByRole('button');
			expect(buttons).toHaveLength(3);
		});

		it('applies segmented-control class to container', () => {
			const { container } = render(SegmentedControl, {
				props: { options: testOptions, value: 'brand' }
			});

			expect(container.querySelector('.segmented-control')).toBeInTheDocument();
		});
	});

	describe('Selection State', () => {
		it('marks current value as selected', () => {
			const { container } = render(SegmentedControl, {
				props: { options: testOptions, value: 'category' }
			});

			const buttons = container.querySelectorAll('button');
			expect(buttons[0]).not.toHaveClass('selected');
			expect(buttons[1]).toHaveClass('selected');
			expect(buttons[2]).not.toHaveClass('selected');
		});

		it('updates selected state when value changes', async () => {
			const { container, rerender } = render(SegmentedControl, {
				props: { options: testOptions, value: 'brand' }
			});

			let buttons = container.querySelectorAll('button');
			expect(buttons[0]).toHaveClass('selected');
			expect(buttons[1]).not.toHaveClass('selected');

			await rerender({ options: testOptions, value: 'category' });

			buttons = container.querySelectorAll('button');
			expect(buttons[0]).not.toHaveClass('selected');
			expect(buttons[1]).toHaveClass('selected');
		});
	});

	describe('Interaction', () => {
		it('calls onchange when a different option is clicked', async () => {
			const handleChange = vi.fn();

			render(SegmentedControl, {
				props: { options: testOptions, value: 'brand', onchange: handleChange }
			});

			const categoryButton = screen.getByRole('button', { name: 'Category' });
			await fireEvent.click(categoryButton);

			expect(handleChange).toHaveBeenCalledTimes(1);
			expect(handleChange).toHaveBeenCalledWith('category');
		});

		it('calls onchange when clicking the already selected option', async () => {
			const handleChange = vi.fn();

			render(SegmentedControl, {
				props: { options: testOptions, value: 'brand', onchange: handleChange }
			});

			const brandButton = screen.getByRole('button', { name: 'Brand' });
			await fireEvent.click(brandButton);

			// Should still call onchange even for same value (consistency)
			expect(handleChange).toHaveBeenCalledTimes(1);
			expect(handleChange).toHaveBeenCalledWith('brand');
		});

		it('works without onchange callback', async () => {
			render(SegmentedControl, {
				props: { options: testOptions, value: 'brand' }
			});

			const categoryButton = screen.getByRole('button', { name: 'Category' });
			// Should not throw
			await expect(fireEvent.click(categoryButton)).resolves.toBe(true);
		});
	});

	describe('Accessibility', () => {
		it('has role="group" on container', () => {
			render(SegmentedControl, {
				props: { options: testOptions, value: 'brand' }
			});

			expect(screen.getByRole('group')).toBeInTheDocument();
		});

		it('uses aria-label when provided', () => {
			render(SegmentedControl, {
				props: { options: testOptions, value: 'brand', ariaLabel: 'Grouping mode' }
			});

			expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Grouping mode');
		});

		it('sets aria-pressed on selected button', () => {
			render(SegmentedControl, {
				props: { options: testOptions, value: 'category' }
			});

			const brandButton = screen.getByRole('button', { name: 'Brand' });
			const categoryButton = screen.getByRole('button', { name: 'Category' });
			const flatButton = screen.getByRole('button', { name: 'A-Z' });

			expect(brandButton).toHaveAttribute('aria-pressed', 'false');
			expect(categoryButton).toHaveAttribute('aria-pressed', 'true');
			expect(flatButton).toHaveAttribute('aria-pressed', 'false');
		});

		it('all buttons are focusable', () => {
			const { container } = render(SegmentedControl, {
				props: { options: testOptions, value: 'brand' }
			});

			const buttons = container.querySelectorAll('button');
			buttons.forEach((button) => {
				expect(button).not.toHaveAttribute('tabindex', '-1');
			});
		});
	});

	describe('Edge Cases', () => {
		it('handles two options', () => {
			const twoOptions = [
				{ value: 'on', label: 'On' },
				{ value: 'off', label: 'Off' }
			];

			render(SegmentedControl, {
				props: { options: twoOptions, value: 'on' }
			});

			expect(screen.getAllByRole('button')).toHaveLength(2);
		});

		it('handles options with special characters in labels', () => {
			const specialOptions = [
				{ value: 'az', label: 'A-Z' },
				{ value: 'za', label: 'Z-A' }
			];

			render(SegmentedControl, {
				props: { options: specialOptions, value: 'az' }
			});

			expect(screen.getByRole('button', { name: 'A-Z' })).toBeInTheDocument();
		});
	});
});
