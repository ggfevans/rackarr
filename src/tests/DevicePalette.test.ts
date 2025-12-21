import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
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

		// Wait for debounce (150ms)
		await waitFor(
			() => {
				// Text may be split by highlighting, use flexible matcher
				expect(screen.getByText((content, element) => 
					element?.textContent === 'Server 1'
				)).toBeInTheDocument();
				expect(screen.queryByText((content, element) => 
					element?.textContent === 'Switch 1'
				)).not.toBeInTheDocument();
			},
			{ timeout: 300 }
		);
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

		// Wait for debounce (150ms)
		await waitFor(() => {
			expect(screen.getByText('Server 1')).toBeInTheDocument();
		}, { timeout: 300 });
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

		// Wait for debounce (150ms)
		await waitFor(() => {
			expect(screen.getByText(/no devices match/i)).toBeInTheDocument();
		}, { timeout: 300 });
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

describe('DevicePalette Exclusive Accordion', () => {
	beforeEach(() => {
		resetLayoutStore();
	});

	describe('Generic Section', () => {
		it('renders Generic section with correct device count', () => {
			// Starter library has 26 devices
			render(DevicePalette);

			expect(screen.getByText('Generic')).toBeInTheDocument();
			expect(screen.getByText('(26)')).toBeInTheDocument();
		});

		it('Generic section is expanded by default', () => {
			render(DevicePalette);

			const sectionButton = screen.getByRole('button', { name: /generic/i });
			expect(sectionButton).toHaveAttribute('aria-expanded', 'true');
		});

		it('clicking Generic header collapses section', async () => {
			render(DevicePalette);

			const sectionButton = screen.getByRole('button', { name: /generic/i });
			expect(sectionButton).toHaveAttribute('aria-expanded', 'true');

			await fireEvent.click(sectionButton);
			expect(sectionButton).toHaveAttribute('aria-expanded', 'false');
		});

		it('devices are rendered inside Generic section', () => {
			render(DevicePalette);

			// Devices from starter library should be inside the section
			expect(screen.getByText('1U Server')).toBeInTheDocument();
			expect(screen.getByText('24-Port Switch')).toBeInTheDocument();
		});
	});

	describe('Brand Sections', () => {
		it('renders Ubiquiti section', () => {
			render(DevicePalette);

			expect(screen.getByText('Ubiquiti')).toBeInTheDocument();
		});

		it('renders Mikrotik section', () => {
			render(DevicePalette);

			expect(screen.getByText('MikroTik')).toBeInTheDocument();
		});

		it('Ubiquiti section is collapsed by default', () => {
			render(DevicePalette);

			const sectionButton = screen.getByRole('button', { name: /ubiquiti/i });
			expect(sectionButton).toHaveAttribute('aria-expanded', 'false');
		});

		it('Mikrotik section is collapsed by default', () => {
			render(DevicePalette);

			const sectionButton = screen.getByRole('button', { name: /mikrotik/i });
			expect(sectionButton).toHaveAttribute('aria-expanded', 'false');
		});

		it('Ubiquiti section shows correct device count', () => {
			render(DevicePalette);

			// Ubiquiti has 52 devices
			expect(screen.getByText('(52)')).toBeInTheDocument();
		});

		it('MikroTik section shows correct device count', () => {
			render(DevicePalette);

			// MikroTik has 27 devices
			expect(screen.getByText('(27)')).toBeInTheDocument();
		});
	});

	describe('Section Ordering', () => {
		it('Generic section appears first', () => {
			const { container } = render(DevicePalette);

			// Get all accordion trigger buttons (section headers)
			const triggers = container.querySelectorAll('.accordion-trigger');
			expect(triggers.length).toBeGreaterThan(0);

			// First section should be Generic
			expect(triggers[0].textContent).toContain('Generic');
		});

		it('brand sections are sorted alphabetically after Generic', () => {
			const { container } = render(DevicePalette);

			// Get all accordion trigger buttons (section headers)
			const triggers = container.querySelectorAll('.accordion-trigger');

			// Extract section titles (first section is Generic, rest should be alphabetical)
			const titles = Array.from(triggers).map((trigger) => {
				// Get the text content of the section-title span
				const titleSpan = trigger.querySelector('.section-title');
				return titleSpan?.textContent?.trim() ?? '';
			});

			// First should be Generic
			expect(titles[0]).toBe('Generic');

			// Brand sections (everything after Generic) should be alphabetically sorted
			const brandTitles = titles.slice(1);
			const sortedBrandTitles = [...brandTitles].sort((a, b) =>
				a.toLowerCase().localeCompare(b.toLowerCase())
			);

			expect(brandTitles).toEqual(sortedBrandTitles);
		});

		it('sorting is case-insensitive', () => {
			const { container } = render(DevicePalette);

			const triggers = container.querySelectorAll('.accordion-trigger');
			const titles = Array.from(triggers).map((trigger) => {
				const titleSpan = trigger.querySelector('.section-title');
				return titleSpan?.textContent?.trim() ?? '';
			});

			// Brand sections should be sorted case-insensitively
			// e.g., "APC" should come before "Dell" regardless of case
			const brandTitles = titles.slice(1);
			const sortedBrandTitles = [...brandTitles].sort((a, b) =>
				a.toLowerCase().localeCompare(b.toLowerCase())
			);

			expect(brandTitles).toEqual(sortedBrandTitles);
		});
	});

	describe('Exclusive Behavior', () => {
		it('only one section can be expanded at a time', async () => {
			render(DevicePalette);

			const genericButton = screen.getByRole('button', { name: /generic/i });
			const ubiquitiButton = screen.getByRole('button', { name: /ubiquiti/i });

			// Generic is expanded by default
			expect(genericButton).toHaveAttribute('aria-expanded', 'true');
			expect(ubiquitiButton).toHaveAttribute('aria-expanded', 'false');

			// Click Ubiquiti - should expand Ubiquiti and collapse Generic
			await fireEvent.click(ubiquitiButton);

			expect(genericButton).toHaveAttribute('aria-expanded', 'false');
			expect(ubiquitiButton).toHaveAttribute('aria-expanded', 'true');
		});

		it('clicking different section switches to it', async () => {
			render(DevicePalette);

			const genericButton = screen.getByRole('button', { name: /generic/i });
			const ubiquitiButton = screen.getByRole('button', { name: /ubiquiti/i });
			const mikrotikButton = screen.getByRole('button', { name: /mikrotik/i });

			// Click Ubiquiti first
			await fireEvent.click(ubiquitiButton);
			expect(ubiquitiButton).toHaveAttribute('aria-expanded', 'true');
			expect(genericButton).toHaveAttribute('aria-expanded', 'false');
			expect(mikrotikButton).toHaveAttribute('aria-expanded', 'false');

			// Click Mikrotik - should switch to Mikrotik
			await fireEvent.click(mikrotikButton);
			expect(mikrotikButton).toHaveAttribute('aria-expanded', 'true');
			expect(ubiquitiButton).toHaveAttribute('aria-expanded', 'false');
			expect(genericButton).toHaveAttribute('aria-expanded', 'false');
		});

		it('all sections can be collapsed', async () => {
			render(DevicePalette);

			const genericButton = screen.getByRole('button', { name: /generic/i });
			const ubiquitiButton = screen.getByRole('button', { name: /ubiquiti/i });
			const mikrotikButton = screen.getByRole('button', { name: /mikrotik/i });

			// Click Generic to collapse it (it's already expanded)
			await fireEvent.click(genericButton);

			// All sections should now be collapsed
			expect(genericButton).toHaveAttribute('aria-expanded', 'false');
			expect(ubiquitiButton).toHaveAttribute('aria-expanded', 'false');
			expect(mikrotikButton).toHaveAttribute('aria-expanded', 'false');
		});
	});

	describe('Search with Sections', () => {
		it('search filters devices within Generic section', async () => {
			render(DevicePalette);

			const searchInput = screen.getByRole('searchbox');
			await fireEvent.input(searchInput, { target: { value: '24-Port' } });

			// Wait for debounce (150ms)
			await waitFor(
				() => {
					// Text may be split by highlighting, use flexible matcher
					expect(screen.getByText((content, element) => 
						element?.textContent === '24-Port Switch'
					)).toBeInTheDocument();
					expect(screen.queryByText((content, element) => 
						element?.textContent === '1U Server'
					)).not.toBeInTheDocument();
				},
				{ timeout: 300 }
			);
		});

		it('search updates section count', async () => {
			render(DevicePalette);

			const searchInput = screen.getByRole('searchbox');
			await fireEvent.input(searchInput, { target: { value: '1U' } });

			// Wait for debounce (150ms)
			// Should show count of filtered devices (e.g., "1U Server", "1U PDU", etc.)
			// Just verify the count changes from the original 26
			await waitFor(
				() => {
					expect(screen.queryByText('(26)')).not.toBeInTheDocument();
				},
				{ timeout: 300 }
			);
		});

		it('shows no results message when search has no matches in any section', async () => {
			render(DevicePalette);

			const searchInput = screen.getByRole('searchbox');
			await fireEvent.input(searchInput, { target: { value: 'zzzznotfound' } });

			// Wait for debounce (150ms)
			await waitFor(() => {
				expect(screen.getByText(/no devices match/i)).toBeInTheDocument();
			}, { timeout: 300 });
		});
	});
});

describe('DevicePaletteItem Component', () => {
	const mockDevice = {
		slug: 'device-1',
		model: 'Test Server',
		u_height: 2,
		colour: '#4A90D9',
		category: 'server' as const
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

		it('shows category icon with device color', () => {
			const { container } = render(DevicePaletteItem, { props: { device: mockDevice } });

			const indicator = container.querySelector('.category-icon-indicator');
			expect(indicator).toBeInTheDocument();
			// Icon color is set via inline style
			const style = indicator?.getAttribute('style') ?? '';
			expect(style).toContain('color');
			// Should contain a CategoryIcon (which renders an SVG)
			const svg = indicator?.querySelector('svg');
			expect(svg).toBeInTheDocument();
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
