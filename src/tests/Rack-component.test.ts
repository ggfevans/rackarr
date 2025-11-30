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
		view: 'front',
		devices: []
	};

	const mockDeviceLibrary: Device[] = [];

	describe('U Labels', () => {
		it('renders correct number of U labels', () => {
			render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false
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
					selected: false
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
					selected: false
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
		it('displays rack name', () => {
			render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false
				}
			});

			expect(screen.getByText('Test Rack')).toBeInTheDocument();
		});

		it('positions title above rack body', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false
				}
			});

			const title = container.querySelector('.rack-name');
			const rackInterior = container.querySelector('.rack-interior');
			const titleY = parseFloat(title?.getAttribute('y') ?? '0');
			const interiorY = parseFloat(rackInterior?.getAttribute('y') ?? '0');
			expect(titleY).toBeLessThan(interiorY);
		});

		it('centers title horizontally', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false
				}
			});

			const title = container.querySelector('.rack-name');
			expect(title?.getAttribute('text-anchor')).toBe('middle');
		});
	});

	describe('Selection', () => {
		it('shows selection outline when selected=true', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: true
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
					selected: false
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
					onselect: handleSelect
				}
			});

			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();

			await fireEvent.keyDown(svg!, { key: ' ' });

			expect(handleSelect).toHaveBeenCalledTimes(1);
		});
	});

	describe('Accessibility', () => {
		it('has correct aria-label', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false
				}
			});

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('aria-label', 'Test Rack, 12U rack');
		});

		it('container has tabindex for keyboard focus', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false
				}
			});

			const rackContainer = container.querySelector('.rack-container');
			expect(rackContainer).toHaveAttribute('tabindex', '0');
		});

		it('SVG has role="img" for accessible description', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: mockDeviceLibrary,
					selected: false
				}
			});

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('role', 'img');
		});
	});

	describe('Rack View Toggle', () => {
		it('renders view toggle', () => {
			const { getByRole } = render(Rack, {
				props: {
					rack: { ...mockRack, view: 'front' },
					deviceLibrary: mockDeviceLibrary,
					selected: false
				}
			});
			expect(getByRole('group', { name: /rack view/i })).toBeTruthy();
		});

		it('shows front-face devices in front view', () => {
			const device: Device = {
				id: 'dev-1',
				name: 'Test Device',
				height: 2,
				colour: '#4A90D9',
				category: 'server'
			};

			const rack: RackType = {
				...mockRack,
				view: 'front',
				devices: [
					{ libraryId: 'dev-1', position: 1, face: 'front' },
					{ libraryId: 'dev-2', position: 5, face: 'rear' }
				]
			};

			const { container } = render(Rack, {
				props: {
					rack,
					deviceLibrary: [device],
					selected: false
				}
			});

			// Only front-face device should be visible
			const devices = container.querySelectorAll('[data-device-id]');
			expect(devices).toHaveLength(1);
		});

		it('shows rear-face devices in rear view', () => {
			const device: Device = {
				id: 'dev-2',
				name: 'Rear Device',
				height: 1,
				colour: '#7B68EE',
				category: 'network'
			};

			const rack: RackType = {
				...mockRack,
				view: 'rear',
				devices: [
					{ libraryId: 'dev-1', position: 1, face: 'front' },
					{ libraryId: 'dev-2', position: 5, face: 'rear' }
				]
			};

			const { container } = render(Rack, {
				props: {
					rack,
					deviceLibrary: [device],
					selected: false
				}
			});

			// Only rear-face device should be visible
			const devices = container.querySelectorAll('[data-device-id]');
			expect(devices).toHaveLength(1);
		});

		it('shows both-face devices in either view', () => {
			const device: Device = {
				id: 'dev-1',
				name: 'Full Depth Device',
				height: 4,
				colour: '#50C878',
				category: 'storage'
			};

			const rackFront: RackType = {
				...mockRack,
				view: 'front',
				devices: [{ libraryId: 'dev-1', position: 1, face: 'both' }]
			};

			const { container: containerFront } = render(Rack, {
				props: {
					rack: rackFront,
					deviceLibrary: [device],
					selected: false
				}
			});

			expect(containerFront.querySelectorAll('[data-device-id]')).toHaveLength(1);

			const rackRear: RackType = {
				...mockRack,
				view: 'rear',
				devices: [{ libraryId: 'dev-1', position: 1, face: 'both' }]
			};

			const { container: containerRear } = render(Rack, {
				props: {
					rack: rackRear,
					deviceLibrary: [device],
					selected: false
				}
			});

			expect(containerRear.querySelectorAll('[data-device-id]')).toHaveLength(1);
		});
	});
});
