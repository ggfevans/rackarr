import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import RackDevice from '$lib/components/RackDevice.svelte';
import type { Device } from '$lib/types';

describe('RackDevice SVG Component', () => {
	const U_HEIGHT = 22;
	const RACK_WIDTH = 220;
	const RAIL_WIDTH = 17;

	const mockDevice: Device = {
		id: 'device-1',
		name: 'Test Server',
		height: 1,
		colour: '#4A90D9',
		category: 'server'
	};

	const defaultProps = {
		device: mockDevice,
		position: 1,
		rackHeight: 12,
		rackId: 'rack-1',
		deviceIndex: 0,
		selected: false,
		uHeight: U_HEIGHT,
		rackWidth: RACK_WIDTH
	};

	describe('Position Calculation', () => {
		it('renders at correct Y position for U1 (bottom)', () => {
			const { container } = render(RackDevice, { props: defaultProps });

			const group = container.querySelector('g');
			expect(group).toBeInTheDocument();

			// Y = (rackHeight - position - device.height + 1) * uHeight
			// Y = (12 - 1 - 1 + 1) * 22 = 11 * 22 = 242
			const transform = group?.getAttribute('transform');
			expect(transform).toContain('translate');
			expect(transform).toContain('242');
		});

		it('renders at correct Y position for middle U', () => {
			const { container } = render(RackDevice, {
				props: { ...defaultProps, position: 6 }
			});

			const group = container.querySelector('g');

			// Y = (12 - 6 - 1 + 1) * 22 = 6 * 22 = 132
			const transform = group?.getAttribute('transform');
			expect(transform).toContain('132');
		});

		it('renders at correct Y position for top U', () => {
			const { container } = render(RackDevice, {
				props: { ...defaultProps, position: 12 }
			});

			const group = container.querySelector('g');

			// Y = (12 - 12 - 1 + 1) * 22 = 0 * 22 = 0
			const transform = group?.getAttribute('transform');
			expect(transform).toContain('translate');
			// Should start at y=0 (or close to top)
		});
	});

	describe('Height Rendering', () => {
		it('renders with correct height for 1U device', () => {
			const { container } = render(RackDevice, { props: defaultProps });

			const rect = container.querySelector('rect.device-rect');
			expect(rect).toBeInTheDocument();
			expect(rect?.getAttribute('height')).toBe(String(U_HEIGHT));
		});

		it('renders with correct height for 4U device', () => {
			const device4U: Device = { ...mockDevice, height: 4 };
			const { container } = render(RackDevice, {
				props: { ...defaultProps, device: device4U }
			});

			const rect = container.querySelector('rect.device-rect');
			expect(rect?.getAttribute('height')).toBe(String(4 * U_HEIGHT));
		});

		it('renders with correct height for 2U device', () => {
			const device2U: Device = { ...mockDevice, height: 2 };
			const { container } = render(RackDevice, {
				props: { ...defaultProps, device: device2U }
			});

			const rect = container.querySelector('rect.device-rect');
			expect(rect?.getAttribute('height')).toBe(String(2 * U_HEIGHT));
		});
	});

	describe('Device Display', () => {
		it('displays device name', () => {
			render(RackDevice, { props: defaultProps });

			expect(screen.getByText('Test Server')).toBeInTheDocument();
		});

		it('uses device.colour for fill', () => {
			const { container } = render(RackDevice, { props: defaultProps });

			const rect = container.querySelector('rect.device-rect');
			expect(rect?.getAttribute('fill')).toBe('#4A90D9');
		});

		it('applies different colours for different devices', () => {
			const redDevice: Device = { ...mockDevice, colour: '#DC143C' };
			const { container } = render(RackDevice, {
				props: { ...defaultProps, device: redDevice }
			});

			const rect = container.querySelector('rect.device-rect');
			expect(rect?.getAttribute('fill')).toBe('#DC143C');
		});

		it('displays category icon for devices', () => {
			const { container } = render(RackDevice, { props: defaultProps });

			// Category icon is rendered via foreignObject with class category-icon-wrapper
			const foreignObject = container.querySelector('foreignObject.category-icon-wrapper');
			expect(foreignObject).toBeInTheDocument();

			// Icon container should have the icon
			const iconContainer = foreignObject?.querySelector('.icon-container');
			expect(iconContainer).toBeInTheDocument();

			// The CategoryIcon SVG should be present
			const iconSvg = iconContainer?.querySelector('svg.category-icon');
			expect(iconSvg).toBeInTheDocument();
		});

		it('displays category icon for multi-U devices', () => {
			const device2U: Device = { ...mockDevice, height: 2 };
			const { container } = render(RackDevice, {
				props: { ...defaultProps, device: device2U }
			});

			const foreignObject = container.querySelector('foreignObject');
			expect(foreignObject).toBeInTheDocument();
		});

		it('centers icon vertically by spanning full device height', () => {
			const device2U: Device = { ...mockDevice, height: 2 };
			const { container } = render(RackDevice, {
				props: { ...defaultProps, device: device2U }
			});

			// Get the category icon wrapper (not the drag handle overlay)
			const foreignObject = container.querySelector('foreignObject.category-icon-wrapper');
			expect(foreignObject).toBeInTheDocument();

			// Foreign object should span full device height (2U * 22px = 44px)
			const expectedHeight = 2 * U_HEIGHT;
			expect(foreignObject?.getAttribute('height')).toBe(String(expectedHeight));

			// Y position should be 0 (starts at top of device)
			expect(foreignObject?.getAttribute('y')).toBe('0');

			// Icon container should have flexbox class (CSS applied)
			const iconContainer = foreignObject?.querySelector('.icon-container');
			expect(iconContainer).toBeInTheDocument();
		});
	});

	describe('Selection', () => {
		it('shows selection outline when selected=true', () => {
			const { container } = render(RackDevice, {
				props: { ...defaultProps, selected: true }
			});

			const selectionOutline = container.querySelector('.device-selection');
			expect(selectionOutline).toBeInTheDocument();
		});

		it('hides selection outline when selected=false', () => {
			const { container } = render(RackDevice, {
				props: { ...defaultProps, selected: false }
			});

			const selectionOutline = container.querySelector('.device-selection');
			expect(selectionOutline).not.toBeInTheDocument();
		});
	});

	describe('Events', () => {
		it('dispatches select event on click', async () => {
			const handleSelect = vi.fn();

			const { container } = render(RackDevice, {
				props: { ...defaultProps, onselect: handleSelect }
			});

			// Click the drag-handle (the interactive element inside foreignObject)
			const dragHandle = container.querySelector('.drag-handle');
			expect(dragHandle).toBeInTheDocument();

			await fireEvent.click(dragHandle!);

			expect(handleSelect).toHaveBeenCalledTimes(1);
			expect(handleSelect).toHaveBeenCalledWith(
				expect.objectContaining({
					detail: { libraryId: 'device-1', position: 1 }
				})
			);
		});

		it('click event stops propagation', async () => {
			const handleSelect = vi.fn();
			const handleParentClick = vi.fn();

			const { container } = render(RackDevice, {
				props: { ...defaultProps, onselect: handleSelect }
			});

			// Click the drag-handle
			const dragHandle = container.querySelector('.drag-handle');
			container.addEventListener('click', handleParentClick);

			await fireEvent.click(dragHandle!);

			// Parent should not receive click due to stopPropagation
			expect(handleSelect).toHaveBeenCalledTimes(1);
		});
	});

	describe('Accessibility', () => {
		it('has role="button"', () => {
			const { container } = render(RackDevice, { props: defaultProps });

			// Accessibility attributes are on the drag-handle inside foreignObject
			const dragHandle = container.querySelector('.drag-handle');
			expect(dragHandle).toHaveAttribute('role', 'button');
		});

		it('has correct aria-label', () => {
			const { container } = render(RackDevice, { props: defaultProps });

			const dragHandle = container.querySelector('.drag-handle');
			expect(dragHandle).toHaveAttribute('aria-label', 'Test Server, 1U server at U1');
		});

		it('has tabindex for keyboard focus', () => {
			const { container } = render(RackDevice, { props: defaultProps });

			const dragHandle = container.querySelector('.drag-handle');
			expect(dragHandle).toHaveAttribute('tabindex', '0');
		});
	});

	describe('Width Calculation', () => {
		it('renders with correct width (rack width minus rails)', () => {
			const { container } = render(RackDevice, { props: defaultProps });

			const rect = container.querySelector('rect.device-rect');
			// Width should be RACK_WIDTH - (2 * RAIL_WIDTH) = 220 - 48 = 172
			const expectedWidth = RACK_WIDTH - RAIL_WIDTH * 2;
			expect(rect?.getAttribute('width')).toBe(String(expectedWidth));
		});
	});
});
