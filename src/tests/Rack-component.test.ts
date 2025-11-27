import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Rack from '$lib/components/Rack.svelte';
import type { Rack as RackType, Device } from '$lib/types';

describe('Rack SVG Component', () => {
	const mockRack: RackType = {
		id: 'rack-1',
		name: 'Test Rack',
		height: 12,
		width: 19,
		position: 0,
		devices: []
	};

	const mockDeviceLibrary: Device[] = [];

	describe('U Labels', () => {
		it('renders correct number of U labels', () => {
			render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 100
				}
			});

			// Should have 12 U labels for a 12U rack
			for (let u = 1; u <= 12; u++) {
				expect(screen.getByText(String(u))).toBeInTheDocument();
			}
		});

		it('renders U1 at the bottom position', () => {
			render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 100
				}
			});

			const u1Label = screen.getByText('1');
			const u12Label = screen.getByText('12');

			// U1 should be lower on screen (higher y value in SVG) than U12
			const u1Y = parseFloat(u1Label.getAttribute('y') ?? '0');
			const u12Y = parseFloat(u12Label.getAttribute('y') ?? '0');

			expect(u1Y).toBeGreaterThan(u12Y);
		});

		it('renders U{height} at the top position', () => {
			const tallRack: RackType = { ...mockRack, height: 42 };

			render(Rack, {
				props: {
					rack: tallRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 100
				}
			});

			const u42Label = screen.getByText('42');
			const u1Label = screen.getByText('1');

			// U42 should be higher on screen (lower y value in SVG) than U1
			const u42Y = parseFloat(u42Label.getAttribute('y') ?? '0');
			const u1Y = parseFloat(u1Label.getAttribute('y') ?? '0');

			expect(u42Y).toBeLessThan(u1Y);
		});
	});

	describe('Rack Name', () => {
		it('displays rack name below the rack', () => {
			render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 100
				}
			});

			expect(screen.getByText('Test Rack')).toBeInTheDocument();
		});
	});

	describe('Selection', () => {
		it('shows selection outline when selected=true', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: true,
					zoom: 100
				}
			});

			const selectionOutline = container.querySelector('.rack-selection');
			expect(selectionOutline).toBeInTheDocument();
		});

		it('hides selection outline when selected=false', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 100
				}
			});

			const selectionOutline = container.querySelector('.rack-selection');
			expect(selectionOutline).not.toBeInTheDocument();
		});
	});

	describe('Events', () => {
		it('dispatches select event on click', async () => {
			const handleSelect = vi.fn();

			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 100,
					onselect: handleSelect
				}
			});

			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();

			await fireEvent.click(svg!);

			expect(handleSelect).toHaveBeenCalledTimes(1);
			expect(handleSelect).toHaveBeenCalledWith(
				expect.objectContaining({
					detail: { rackId: 'rack-1' }
				})
			);
		});

		it('dispatches select event on Enter key', async () => {
			const handleSelect = vi.fn();

			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 100,
					onselect: handleSelect
				}
			});

			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();

			await fireEvent.keyDown(svg!, { key: 'Enter' });

			expect(handleSelect).toHaveBeenCalledTimes(1);
		});

		it('dispatches select event on Space key', async () => {
			const handleSelect = vi.fn();

			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 100,
					onselect: handleSelect
				}
			});

			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();

			await fireEvent.keyDown(svg!, { key: ' ' });

			expect(handleSelect).toHaveBeenCalledTimes(1);
		});
	});

	describe('Zoom', () => {
		it('applies zoom transform correctly', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 150
				}
			});

			const rackContainer = container.querySelector('.rack-container');
			expect(rackContainer).toBeInTheDocument();

			const style = rackContainer?.getAttribute('style');
			expect(style).toContain('transform');
			expect(style).toContain('scale(1.5)');
		});

		it('applies 50% zoom correctly', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 50
				}
			});

			const rackContainer = container.querySelector('.rack-container');
			const style = rackContainer?.getAttribute('style');
			expect(style).toContain('scale(0.5)');
		});
	});

	describe('Accessibility', () => {
		it('has correct aria-label', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 100
				}
			});

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('aria-label', 'Test Rack, 12U rack');
		});

		it('has tabindex for keyboard focus', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 100
				}
			});

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('tabindex', '0');
		});

		it('has role="img"', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false,
					zoom: 100
				}
			});

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('role', 'img');
		});
	});
});
