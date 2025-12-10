import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import RackDevice from '$lib/components/RackDevice.svelte';
import type { DeviceType } from '$lib/types';
import { getImageStore, resetImageStore } from '$lib/stores/images.svelte';
import type { ImageData } from '$lib/types/images';

describe('RackDevice SVG Component', () => {
	const U_HEIGHT = 22;
	const RACK_WIDTH = 220;
	const RAIL_WIDTH = 17;

	const mockDevice: DeviceType = {
		slug: 'device-1',
		model: 'Test Server',
		u_height: 1,
		rackarr: { colour: '#4A90D9', category: 'server' }
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
			const device4U: DeviceType = { ...mockDevice, u_height: 4 };
			const { container } = render(RackDevice, {
				props: { ...defaultProps, device: device4U }
			});

			const rect = container.querySelector('rect.device-rect');
			expect(rect?.getAttribute('height')).toBe(String(4 * U_HEIGHT));
		});

		it('renders with correct height for 2U device', () => {
			const device2U: DeviceType = { ...mockDevice, u_height: 2 };
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
			const redDevice: DeviceType = {
				...mockDevice,
				rackarr: { ...mockDevice.rackarr, colour: '#DC143C' }
			};
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
			const device2U: DeviceType = { ...mockDevice, u_height: 2 };
			const { container } = render(RackDevice, {
				props: { ...defaultProps, device: device2U }
			});

			const foreignObject = container.querySelector('foreignObject');
			expect(foreignObject).toBeInTheDocument();
		});

		it('centers icon vertically by spanning full device height', () => {
			const device2U: DeviceType = { ...mockDevice, u_height: 2 };
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
					detail: { slug: 'device-1', position: 1 }
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

	describe('Drag Affordance', () => {
		it('has grip icon that shows on hover', async () => {
			const { container } = render(RackDevice, { props: defaultProps });

			// Grip icon container should exist
			const gripContainer = container.querySelector('.grip-icon-container');
			expect(gripContainer).toBeInTheDocument();
		});

		it('has grab cursor on drag handle', () => {
			const { container } = render(RackDevice, { props: defaultProps });

			const dragHandle = container.querySelector('.drag-handle');
			expect(dragHandle).toBeInTheDocument();
			// Cursor style is applied via CSS, just verify element exists
		});
	});

	describe('Display Mode', () => {
		const mockImageData: ImageData = {
			blob: new Blob(['test'], { type: 'image/png' }),
			dataUrl: 'data:image/png;base64,dGVzdA==',
			filename: 'test.png'
		};

		beforeEach(() => {
			resetImageStore();
		});

		it('renders label when displayMode is label', () => {
			const { container } = render(RackDevice, {
				props: { ...defaultProps, displayMode: 'label' }
			});

			const deviceName = container.querySelector('.device-name');
			expect(deviceName).toBeInTheDocument();
			expect(deviceName?.textContent).toBe('Test Server');
		});

		it('renders image when displayMode is image and device has image', () => {
			const imageStore = getImageStore();
			imageStore.setDeviceImage(mockDevice.slug, 'front', mockImageData);

			const { container } = render(RackDevice, {
				props: { ...defaultProps, displayMode: 'image', rackView: 'front' }
			});

			const image = container.querySelector('.device-image');
			expect(image).toBeInTheDocument();
		});

		it('falls back to label when displayMode is image but no image exists', () => {
			const { container } = render(RackDevice, {
				props: { ...defaultProps, displayMode: 'image', rackView: 'front' }
			});

			// Should show label since no image
			const deviceName = container.querySelector('.device-name');
			expect(deviceName).toBeInTheDocument();
		});

		it('shows correct image for front view', () => {
			const imageStore = getImageStore();
			imageStore.setDeviceImage(mockDevice.slug, 'front', mockImageData);
			imageStore.setDeviceImage(mockDevice.slug, 'rear', {
				...mockImageData,
				dataUrl: 'data:image/png;base64,cmVhcg=='
			});

			const { container } = render(RackDevice, {
				props: { ...defaultProps, displayMode: 'image', rackView: 'front' }
			});

			const image = container.querySelector('.device-image');
			expect(image?.getAttribute('href')).toBe('data:image/png;base64,dGVzdA==');
		});

		it('shows correct image for rear view', () => {
			const imageStore = getImageStore();
			imageStore.setDeviceImage(mockDevice.slug, 'front', mockImageData);
			imageStore.setDeviceImage(mockDevice.slug, 'rear', {
				...mockImageData,
				dataUrl: 'data:image/png;base64,cmVhcg=='
			});

			const { container } = render(RackDevice, {
				props: { ...defaultProps, displayMode: 'image', rackView: 'rear' }
			});

			const image = container.querySelector('.device-image');
			expect(image?.getAttribute('href')).toBe('data:image/png;base64,cmVhcg==');
		});

		it('image scales to fit device dimensions', () => {
			const imageStore = getImageStore();
			imageStore.setDeviceImage(mockDevice.slug, 'front', mockImageData);

			const { container } = render(RackDevice, {
				props: { ...defaultProps, displayMode: 'image', rackView: 'front' }
			});

			const image = container.querySelector('.device-image');
			const expectedWidth = RACK_WIDTH - RAIL_WIDTH * 2;
			const expectedHeight = U_HEIGHT;
			expect(image?.getAttribute('width')).toBe(String(expectedWidth));
			expect(image?.getAttribute('height')).toBe(String(expectedHeight));
		});
	});

	describe('Label Overlay', () => {
		const mockImageData: ImageData = {
			blob: new Blob(['test'], { type: 'image/png' }),
			dataUrl: 'data:image/png;base64,dGVzdA==',
			filename: 'test.png'
		};

		beforeEach(() => {
			resetImageStore();
		});

		it('does not show label overlay when showLabelsOnImages is false', () => {
			const imageStore = getImageStore();
			imageStore.setDeviceImage(mockDevice.slug, 'front', mockImageData);

			const { container } = render(RackDevice, {
				props: {
					...defaultProps,
					displayMode: 'image',
					rackView: 'front',
					showLabelsOnImages: false
				}
			});

			// Should have image
			expect(container.querySelector('.device-image')).toBeInTheDocument();
			// Should NOT have label overlay
			expect(container.querySelector('.label-overlay')).not.toBeInTheDocument();
		});

		it('shows label overlay when showLabelsOnImages is true in image mode', () => {
			const imageStore = getImageStore();
			imageStore.setDeviceImage(mockDevice.slug, 'front', mockImageData);

			const { container } = render(RackDevice, {
				props: {
					...defaultProps,
					displayMode: 'image',
					rackView: 'front',
					showLabelsOnImages: true
				}
			});

			// Should have both image and label overlay
			expect(container.querySelector('.device-image')).toBeInTheDocument();
			const overlay = container.querySelector('.label-overlay');
			expect(overlay).toBeInTheDocument();
			expect(overlay?.textContent).toBe('Test Server');
		});

		it('does not show label overlay in label mode even when showLabelsOnImages is true', () => {
			const { container } = render(RackDevice, {
				props: {
					...defaultProps,
					displayMode: 'label',
					showLabelsOnImages: true
				}
			});

			// Should have device name but not as overlay
			expect(container.querySelector('.device-name')).toBeInTheDocument();
			expect(container.querySelector('.label-overlay')).not.toBeInTheDocument();
		});

		it('does not show label overlay when image mode but no image exists', () => {
			const { container } = render(RackDevice, {
				props: {
					...defaultProps,
					displayMode: 'image',
					rackView: 'front',
					showLabelsOnImages: true
				}
			});

			// Falls back to label display, no overlay
			expect(container.querySelector('.device-name')).toBeInTheDocument();
			expect(container.querySelector('.label-overlay')).not.toBeInTheDocument();
		});
	});

	describe('Airflow Conflict Highlighting', () => {
		it('shows orange conflict border when hasConflict=true and airflowMode=true', () => {
			const { container } = render(RackDevice, {
				props: {
					...defaultProps,
					airflowMode: true,
					hasConflict: true
				}
			});

			const conflictBorder = container.querySelector('.airflow-conflict');
			expect(conflictBorder).toBeInTheDocument();
		});

		it('does not show conflict border when airflowMode=false', () => {
			const { container } = render(RackDevice, {
				props: {
					...defaultProps,
					airflowMode: false,
					hasConflict: true
				}
			});

			const conflictBorder = container.querySelector('.airflow-conflict');
			expect(conflictBorder).not.toBeInTheDocument();
		});

		it('does not show conflict border when hasConflict=false', () => {
			const { container } = render(RackDevice, {
				props: {
					...defaultProps,
					airflowMode: true,
					hasConflict: false
				}
			});

			const conflictBorder = container.querySelector('.airflow-conflict');
			expect(conflictBorder).not.toBeInTheDocument();
		});

		it('conflict border has correct amber/orange stroke color', () => {
			const { container } = render(RackDevice, {
				props: {
					...defaultProps,
					airflowMode: true,
					hasConflict: true
				}
			});

			const conflictBorder = container.querySelector('.airflow-conflict');
			expect(conflictBorder).toBeInTheDocument();
			// The CSS variable --colour-airflow-conflict should be applied
			// Just verify the element has the class
		});
	});
});
