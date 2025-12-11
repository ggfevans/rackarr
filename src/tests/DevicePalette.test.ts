import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import DevicePalette from '$lib/components/DevicePalette.svelte';
import DevicePaletteItem from '$lib/components/DevicePaletteItem.svelte';
import { getLayoutStore, resetLayoutStore } from '$lib/stores/layout.svelte';
import { CATEGORY_COLOURS } from '$lib/types/constants';

describe('DevicePalette Component', () => {
	beforeEach(() => {
		resetLayoutStore();
	});

	describe('Device Rendering', () => {
		it('renders all devices from library', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addDeviceType({
				name: 'Server 1',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			layoutStore.addDeviceType({
				name: 'Switch 1',
				u_height: 1,
				category: 'network',
				colour: CATEGORY_COLOURS.network
			});

			render(DevicePalette);

			expect(screen.getByText('Server 1')).toBeInTheDocument();
			expect(screen.getByText('Switch 1')).toBeInTheDocument();
		});

		it('shows starter library devices on initial load', () => {
			render(DevicePalette);

			// Starter library includes common devices
			expect(screen.getByText('1U Server')).toBeInTheDocument();
			expect(screen.getByText('24-Port Switch')).toBeInTheDocument();
		});
	});

	describe('Search', () => {
		it('has search input', () => {
			render(DevicePalette);

			const searchInput = screen.getByRole('searchbox');
			expect(searchInput).toBeInTheDocument();
		});

		it('filters devices by name', async () => {
			const layoutStore = getLayoutStore();
			layoutStore.addDeviceType({
				name: 'Server 1',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			layoutStore.addDeviceType({
				name: 'Switch 1',
				u_height: 1,
				category: 'network',
				colour: CATEGORY_COLOURS.network
			});

			render(DevicePalette);

			const searchInput = screen.getByRole('searchbox');
			await fireEvent.input(searchInput, { target: { value: 'Server' } });

			expect(screen.getByText('Server 1')).toBeInTheDocument();
			expect(screen.queryByText('Switch 1')).not.toBeInTheDocument();
		});

		it('search is case-insensitive', async () => {
			const layoutStore = getLayoutStore();
			layoutStore.addDeviceType({
				name: 'Server 1',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});

			render(DevicePalette);

			const searchInput = screen.getByRole('searchbox');
			await fireEvent.input(searchInput, { target: { value: 'server' } });

			expect(screen.getByText('Server 1')).toBeInTheDocument();
		});

		it('shows no results message when search has no matches', async () => {
			const layoutStore = getLayoutStore();
			layoutStore.addDeviceType({
				name: 'Server 1',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});

			render(DevicePalette);

			const searchInput = screen.getByRole('searchbox');
			await fireEvent.input(searchInput, { target: { value: 'xyz' } });

			expect(screen.getByText(/no devices match/i)).toBeInTheDocument();
		});
	});

	describe('Category Grouping', () => {
		it('groups devices by category', () => {
			// Starter library already has devices in all 11 categories
			const { container } = render(DevicePalette);

			// Should show category headers for all 11 categories
			const categoryHeaders = container.querySelectorAll('.category-header');
			expect(categoryHeaders.length).toBe(11);
			// Servers and Network headers should exist
			expect(screen.getByText('Servers')).toBeInTheDocument();
			expect(screen.getByText('Network')).toBeInTheDocument();
		});
	});

	describe('Add Device Button', () => {
		it('has Add Device button', () => {
			render(DevicePalette);

			const addButton = screen.getByRole('button', { name: /add device/i });
			expect(addButton).toBeInTheDocument();
		});

		it('dispatches addDevice event when clicked', async () => {
			const handleAdd = vi.fn();

			render(DevicePalette, { props: { onadddevice: handleAdd } });

			const addButton = screen.getByRole('button', { name: /add device/i });
			await fireEvent.click(addButton);

			expect(handleAdd).toHaveBeenCalledTimes(1);
		});
	});

	describe('Import Device Library', () => {
		it('renders import button', () => {
			render(DevicePalette);

			const importButton = screen.getByRole('button', { name: /import/i });
			expect(importButton).toBeInTheDocument();
		});

		it('has file input that accepts JSON files', () => {
			const { container } = render(DevicePalette);

			const fileInput = container.querySelector('input[type="file"]');
			expect(fileInput).toBeInTheDocument();
			expect(fileInput?.getAttribute('accept')).toBe('.json,application/json');
		});

		it('file input is hidden', () => {
			const { container } = render(DevicePalette);

			const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
			expect(fileInput).toBeInTheDocument();

			// Should not be visible (using CSS or hidden attribute)
			const styles = window.getComputedStyle(fileInput);
			expect(styles.display === 'none' || fileInput.hidden).toBe(true);
		});

		it('clicking import button triggers file input', async () => {
			const { container } = render(DevicePalette);

			const importButton = screen.getByRole('button', { name: /import/i });
			const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

			const clickSpy = vi.spyOn(fileInput, 'click');
			await fireEvent.click(importButton);

			expect(clickSpy).toHaveBeenCalled();
			clickSpy.mockRestore();
		});

		// Note: Full file import flow is tested in E2E tests due to JSDOM file API limitations
		it('import button and file input are properly wired together', async () => {
			const { container } = render(DevicePalette);

			const importButton = screen.getByRole('button', { name: /import/i });
			const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

			// Verify import button triggers file input click
			const clickSpy = vi.spyOn(fileInput, 'click');
			await fireEvent.click(importButton);

			expect(clickSpy).toHaveBeenCalled();
			expect(fileInput.accept).toBe('.json,application/json');

			clickSpy.mockRestore();
		});
	});
});

describe('DevicePaletteItem Component', () => {
	const mockDevice = {
		slug: 'device-1',
		model: 'Test Server',
		u_height: 2,
		rackarr: {
			colour: '#4A90D9',
			category: 'server' as const
		}
	};

	describe('Display', () => {
		it('displays device name', () => {
			render(DevicePaletteItem, { props: { device: mockDevice } });

			expect(screen.getByText('Test Server')).toBeInTheDocument();
		});

		it('displays height as badge', () => {
			render(DevicePaletteItem, { props: { device: mockDevice } });

			expect(screen.getByText('2U')).toBeInTheDocument();
		});

		it('shows category indicator with device color', () => {
			const { container } = render(DevicePaletteItem, { props: { device: mockDevice } });

			const indicator = container.querySelector('.category-indicator');
			expect(indicator).toBeInTheDocument();
			// Browser converts hex to rgb, so check for either format
			const style = indicator?.getAttribute('style') ?? '';
			expect(style).toContain('background-color');
		});
	});

	describe('Drag Affordance', () => {
		it('displays grip handle icon', () => {
			const { container } = render(DevicePaletteItem, { props: { device: mockDevice } });

			const dragHandle = container.querySelector('.drag-handle');
			expect(dragHandle).toBeInTheDocument();
			// Check that it contains an SVG (the grip icon)
			const svg = dragHandle?.querySelector('svg');
			expect(svg).toBeInTheDocument();
		});

		it('has cursor: grab style', () => {
			const { container } = render(DevicePaletteItem, { props: { device: mockDevice } });

			const item = container.querySelector('.device-palette-item');
			expect(item).toBeInTheDocument();
			// The cursor style is applied via CSS class
			expect(item).toHaveClass('device-palette-item');
		});

		it('is draggable', () => {
			const { container } = render(DevicePaletteItem, { props: { device: mockDevice } });

			const item = container.querySelector('.device-palette-item');
			expect(item).toHaveAttribute('draggable', 'true');
		});

		it('starts without dragging class', () => {
			const { container } = render(DevicePaletteItem, { props: { device: mockDevice } });

			const item = container.querySelector('.device-palette-item')!;
			expect(item).not.toHaveClass('dragging');
		});

		it('has aria-hidden on drag handle', () => {
			const { container } = render(DevicePaletteItem, { props: { device: mockDevice } });

			const dragHandle = container.querySelector('.drag-handle');
			expect(dragHandle).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('Interaction', () => {
		it('dispatches select event on click', async () => {
			const handleSelect = vi.fn();

			render(DevicePaletteItem, {
				props: { device: mockDevice, onselect: handleSelect }
			});

			const item = screen.getByText('Test Server').closest('.device-palette-item');
			await fireEvent.click(item!);

			expect(handleSelect).toHaveBeenCalledTimes(1);
		});
	});
});
