/**
 * DevicePaletteItem Component Tests
 * Tests for device palette item rendering and interactions
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import DevicePaletteItem from '$lib/components/DevicePaletteItem.svelte';
import type { DeviceType } from '$lib/types';

describe('DevicePaletteItem', () => {
	// Helper to create test device
	function createTestDevice(overrides: Partial<DeviceType> = {}): DeviceType {
		return {
			slug: 'test-server',
			u_height: 2,
			model: 'Test Server',
			rackarr: {
				colour: '#4A90D9',
				category: 'server'
			},
			...overrides
		};
	}

	describe('Rendering', () => {
		it('renders without crashing', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			expect(document.querySelector('.device-palette-item')).toBeTruthy();
		});

		it('displays the device model name', () => {
			render(DevicePaletteItem, {
				props: { device: createTestDevice({ model: 'Dell PowerEdge R740' }) }
			});
			expect(screen.getByText('Dell PowerEdge R740')).toBeTruthy();
		});

		it('displays slug when model is not provided', () => {
			render(DevicePaletteItem, {
				props: { device: createTestDevice({ model: undefined, slug: 'custom-device' }) }
			});
			expect(screen.getByText('custom-device')).toBeTruthy();
		});

		it('displays the device height in U', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice({ u_height: 4 }) } });
			expect(screen.getByText('4U')).toBeTruthy();
		});

		it('displays 0.5U heights correctly', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice({ u_height: 0.5 }) } });
			expect(screen.getByText('0.5U')).toBeTruthy();
		});

		it('renders category icon', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			const iconContainer = document.querySelector('.category-icon-indicator');
			expect(iconContainer).toBeTruthy();
			expect(iconContainer?.querySelector('.category-icon')).toBeTruthy();
		});

		it('applies category colour to icon', () => {
			render(DevicePaletteItem, {
				props: { device: createTestDevice({ rackarr: { colour: '#FF5500', category: 'network' } }) }
			});
			const iconContainer = document.querySelector('.category-icon-indicator') as HTMLElement;
			expect(iconContainer?.style.color).toBe('rgb(255, 85, 0)');
		});

		it('renders drag handle', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			expect(document.querySelector('.drag-handle')).toBeTruthy();
		});
	});

	describe('Accessibility', () => {
		it('has role="listitem"', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			const item = document.querySelector('.device-palette-item');
			expect(item?.getAttribute('role')).toBe('listitem');
		});

		it('is focusable with tabindex="0"', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			const item = document.querySelector('.device-palette-item');
			expect(item?.getAttribute('tabindex')).toBe('0');
		});

		it('has descriptive aria-label', () => {
			render(DevicePaletteItem, {
				props: { device: createTestDevice({ model: 'Dell R740', u_height: 2 }) }
			});
			const item = document.querySelector('.device-palette-item');
			expect(item?.getAttribute('aria-label')).toBe('Dell R740, 2U server');
		});

		it('drag handle has aria-hidden', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			const handle = document.querySelector('.drag-handle');
			expect(handle?.getAttribute('aria-hidden')).toBe('true');
		});
	});

	describe('Selection', () => {
		it('calls onselect when clicked', async () => {
			const handleSelect = vi.fn();
			render(DevicePaletteItem, { props: { device: createTestDevice(), onselect: handleSelect } });

			const item = document.querySelector('.device-palette-item') as HTMLElement;
			await fireEvent.click(item);

			expect(handleSelect).toHaveBeenCalledTimes(1);
		});

		it('passes device in CustomEvent detail', async () => {
			const handleSelect = vi.fn();
			const device = createTestDevice({ slug: 'my-device' });
			render(DevicePaletteItem, { props: { device, onselect: handleSelect } });

			const item = document.querySelector('.device-palette-item') as HTMLElement;
			await fireEvent.click(item);

			expect(handleSelect).toHaveBeenCalled();
			const event = handleSelect.mock.calls[0][0] as CustomEvent;
			expect(event.detail.device.slug).toBe('my-device');
		});

		it('does not throw when clicked without onselect', async () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			const item = document.querySelector('.device-palette-item') as HTMLElement;
			await expect(fireEvent.click(item)).resolves.toBe(true);
		});

		it('shows selected state when librarySelected is true', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice(), librarySelected: true } });
			const item = document.querySelector('.device-palette-item');
			expect(item?.classList.contains('library-selected')).toBe(true);
		});

		it('does not show selected state by default', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			const item = document.querySelector('.device-palette-item');
			expect(item?.classList.contains('library-selected')).toBe(false);
		});
	});

	describe('Keyboard Navigation', () => {
		it('triggers select on Enter key', async () => {
			const handleSelect = vi.fn();
			render(DevicePaletteItem, { props: { device: createTestDevice(), onselect: handleSelect } });

			const item = document.querySelector('.device-palette-item') as HTMLElement;
			await fireEvent.keyDown(item, { key: 'Enter' });

			expect(handleSelect).toHaveBeenCalledTimes(1);
		});

		it('triggers select on Space key', async () => {
			const handleSelect = vi.fn();
			render(DevicePaletteItem, { props: { device: createTestDevice(), onselect: handleSelect } });

			const item = document.querySelector('.device-palette-item') as HTMLElement;
			await fireEvent.keyDown(item, { key: ' ' });

			expect(handleSelect).toHaveBeenCalledTimes(1);
		});

		it('does not trigger select on other keys', async () => {
			const handleSelect = vi.fn();
			render(DevicePaletteItem, { props: { device: createTestDevice(), onselect: handleSelect } });

			const item = document.querySelector('.device-palette-item') as HTMLElement;
			await fireEvent.keyDown(item, { key: 'Tab' });
			await fireEvent.keyDown(item, { key: 'Escape' });
			await fireEvent.keyDown(item, { key: 'a' });

			expect(handleSelect).not.toHaveBeenCalled();
		});
	});

	describe('Drag and Drop', () => {
		it('has draggable="true"', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			const item = document.querySelector('.device-palette-item');
			expect(item?.getAttribute('draggable')).toBe('true');
		});

		it('sets dragging class on dragstart', async () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			const item = document.querySelector('.device-palette-item') as HTMLElement;

			// Create a mock DataTransfer
			const dataTransfer = {
				setData: vi.fn(),
				effectAllowed: ''
			};

			await fireEvent.dragStart(item, { dataTransfer });

			expect(item.classList.contains('dragging')).toBe(true);
		});

		it('removes dragging class on dragend', async () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			const item = document.querySelector('.device-palette-item') as HTMLElement;

			// Start drag
			const dataTransfer = {
				setData: vi.fn(),
				effectAllowed: ''
			};
			await fireEvent.dragStart(item, { dataTransfer });
			expect(item.classList.contains('dragging')).toBe(true);

			// End drag
			await fireEvent.dragEnd(item);
			expect(item.classList.contains('dragging')).toBe(false);
		});

		it('sets drag data in dataTransfer on dragstart', async () => {
			render(DevicePaletteItem, { props: { device: createTestDevice({ slug: 'drag-test' }) } });
			const item = document.querySelector('.device-palette-item') as HTMLElement;

			const setDataMock = vi.fn();
			const dataTransfer = {
				setData: setDataMock,
				effectAllowed: ''
			};

			await fireEvent.dragStart(item, { dataTransfer });

			expect(setDataMock).toHaveBeenCalledWith('application/json', expect.any(String));
			const dragData = JSON.parse(setDataMock.mock.calls[0][1]);
			expect(dragData.type).toBe('palette');
			expect(dragData.device.slug).toBe('drag-test');
		});

		it('sets effectAllowed to "copy"', async () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			const item = document.querySelector('.device-palette-item') as HTMLElement;

			const dataTransfer = {
				setData: vi.fn(),
				effectAllowed: ''
			};

			await fireEvent.dragStart(item, { dataTransfer });

			expect(dataTransfer.effectAllowed).toBe('copy');
		});
	});

	describe('Styling Classes', () => {
		it('has device-palette-item class', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			expect(document.querySelector('.device-palette-item')).toBeTruthy();
		});

		it('has drag-handle class', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			expect(document.querySelector('.drag-handle')).toBeTruthy();
		});

		it('has device-name class', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			expect(document.querySelector('.device-name')).toBeTruthy();
		});

		it('has device-height class', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			expect(document.querySelector('.device-height')).toBeTruthy();
		});

		it('has category-icon-indicator class', () => {
			render(DevicePaletteItem, { props: { device: createTestDevice() } });
			expect(document.querySelector('.category-icon-indicator')).toBeTruthy();
		});
	});

	describe('Device Categories', () => {
		const categories = [
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
		] as const;

		categories.forEach((category) => {
			it(`renders ${category} category correctly`, () => {
				const device = createTestDevice({
					rackarr: { colour: '#123456', category }
				});
				render(DevicePaletteItem, { props: { device } });
				const item = document.querySelector('.device-palette-item');
				expect(item?.getAttribute('aria-label')).toContain(category);
			});
		});
	});
});
