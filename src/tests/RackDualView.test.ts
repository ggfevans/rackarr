import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import RackDualView from '$lib/components/RackDualView.svelte';
import type { Rack, Device } from '$lib/types';
import { resetLayoutStore, getLayoutStore } from '$lib/stores/layout.svelte';
import { resetSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';
import { resetCanvasStore } from '$lib/stores/canvas.svelte';

// Helper to create test rack
function createTestRack(overrides: Partial<Rack> = {}): Rack {
	return {
		id: 'rack-1',
		name: 'Test Rack',
		height: 12,
		width: 19,
		position: 0,
		view: 'front',
		devices: [],
		...overrides
	};
}

// Helper to create test device library
function createTestDeviceLibrary(): Device[] {
	return [
		{
			id: 'device-1',
			name: 'Server',
			height: 2,
			colour: '#4A90D9',
			category: 'server',
			is_full_depth: true
		},
		{
			id: 'device-2',
			name: 'Half-depth Switch',
			height: 1,
			colour: '#7B68EE',
			category: 'network',
			is_full_depth: false
		}
	];
}

describe('RackDualView Component', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
		resetCanvasStore();
		getLayoutStore().markStarted();
	});

	describe('Container Structure', () => {
		it('renders a container with class rack-dual-view', () => {
			const rack = createTestRack();
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			const dualView = container.querySelector('.rack-dual-view');
			expect(dualView).toBeInTheDocument();
		});

		it('contains two rack views with classes rack-front and rack-rear', () => {
			const rack = createTestRack();
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			const frontView = container.querySelector('.rack-front');
			const rearView = container.querySelector('.rack-rear');
			expect(frontView).toBeInTheDocument();
			expect(rearView).toBeInTheDocument();
		});
	});

	describe('Rack Name', () => {
		it('displays the rack name once, centered above both views', () => {
			const rack = createTestRack({ name: 'My Server Rack' });
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			// Should have exactly one visible rack name in the dual-view container
			// (The individual Rack components' names are hidden via CSS)
			const dualViewName = container.querySelector('.rack-dual-view-name');
			expect(dualViewName).toBeInTheDocument();
			expect(dualViewName?.textContent).toBe('My Server Rack');
		});

		it('rack name has correct class for styling', () => {
			const rack = createTestRack({ name: 'Test Rack' });
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			const rackName = container.querySelector('.rack-dual-view-name');
			expect(rackName).toBeInTheDocument();
			expect(rackName?.textContent).toBe('Test Rack');
		});
	});

	describe('View Labels', () => {
		it('shows FRONT label above the front view', () => {
			const rack = createTestRack();
			render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			expect(screen.getByText('FRONT')).toBeInTheDocument();
		});

		it('shows REAR label above the rear view', () => {
			const rack = createTestRack();
			render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			expect(screen.getByText('REAR')).toBeInTheDocument();
		});

		it('labels have correct class for styling', () => {
			const rack = createTestRack();
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			const labels = container.querySelectorAll('.rack-view-label');
			expect(labels).toHaveLength(2);
		});
	});

	describe('Selection State', () => {
		it('applies aria-selected=true to container when selected', () => {
			const rack = createTestRack();
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: true
				}
			});

			const dualView = container.querySelector('.rack-dual-view');
			expect(dualView?.getAttribute('aria-selected')).toBe('true');
		});

		it('applies aria-selected=false to container when not selected', () => {
			const rack = createTestRack();
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			const dualView = container.querySelector('.rack-dual-view');
			expect(dualView?.getAttribute('aria-selected')).toBe('false');
		});

		it('has selected class when selected=true', () => {
			const rack = createTestRack();
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: true
				}
			});

			const dualView = container.querySelector('.rack-dual-view');
			expect(dualView).toHaveClass('selected');
		});
	});

	describe('Events', () => {
		it('dispatches select event when front view is clicked', async () => {
			const rack = createTestRack();
			const handleSelect = vi.fn();

			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false,
					onselect: handleSelect
				}
			});

			const frontView = container.querySelector('.rack-front');
			await fireEvent.click(frontView!);

			expect(handleSelect).toHaveBeenCalledTimes(1);
			expect(handleSelect.mock.calls[0][0].detail.rackId).toBe('rack-1');
		});

		it('dispatches select event when rear view is clicked', async () => {
			const rack = createTestRack();
			const handleSelect = vi.fn();

			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false,
					onselect: handleSelect
				}
			});

			const rearView = container.querySelector('.rack-rear');
			await fireEvent.click(rearView!);

			expect(handleSelect).toHaveBeenCalledTimes(1);
			expect(handleSelect.mock.calls[0][0].detail.rackId).toBe('rack-1');
		});
	});

	describe('Device Display', () => {
		it('shows front-face devices only in front view', () => {
			const rack = createTestRack({
				devices: [{ libraryId: 'device-1', position: 1, face: 'front' }]
			});
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			const frontView = container.querySelector('.rack-front');
			const rearView = container.querySelector('.rack-rear');

			// Device should be in front view
			const frontDevices = frontView?.querySelectorAll('.rack-device');
			const rearDevices = rearView?.querySelectorAll('.rack-device');

			expect(frontDevices?.length).toBe(1);
			expect(rearDevices?.length).toBe(0);
		});

		it('shows rear-face devices only in rear view', () => {
			const rack = createTestRack({
				devices: [{ libraryId: 'device-2', position: 1, face: 'rear' }]
			});
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			const frontView = container.querySelector('.rack-front');
			const rearView = container.querySelector('.rack-rear');

			const frontDevices = frontView?.querySelectorAll('.rack-device');
			const rearDevices = rearView?.querySelectorAll('.rack-device');

			expect(frontDevices?.length).toBe(0);
			expect(rearDevices?.length).toBe(1);
		});

		it('shows both-face devices in both views', () => {
			const rack = createTestRack({
				devices: [{ libraryId: 'device-1', position: 1, face: 'both' }]
			});
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			const frontView = container.querySelector('.rack-front');
			const rearView = container.querySelector('.rack-rear');

			const frontDevices = frontView?.querySelectorAll('.rack-device');
			const rearDevices = rearView?.querySelectorAll('.rack-device');

			expect(frontDevices?.length).toBe(1);
			expect(rearDevices?.length).toBe(1);
		});
	});

	describe('Accessibility', () => {
		it('has appropriate aria-label on container', () => {
			const rack = createTestRack({ name: 'Server Rack' });
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			const dualView = container.querySelector('.rack-dual-view');
			expect(dualView?.getAttribute('aria-label')).toContain('Server Rack');
		});

		it('has tabindex for keyboard focus', () => {
			const rack = createTestRack();
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			const dualView = container.querySelector('.rack-dual-view');
			expect(dualView?.getAttribute('tabindex')).toBe('0');
		});

		it('dispatches select on Enter key', async () => {
			const rack = createTestRack();
			const handleSelect = vi.fn();

			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false,
					onselect: handleSelect
				}
			});

			const dualView = container.querySelector('.rack-dual-view');
			await fireEvent.keyDown(dualView!, { key: 'Enter' });

			expect(handleSelect).toHaveBeenCalledTimes(1);
		});

		it('dispatches select on Space key', async () => {
			const rack = createTestRack();
			const handleSelect = vi.fn();

			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false,
					onselect: handleSelect
				}
			});

			const dualView = container.querySelector('.rack-dual-view');
			await fireEvent.keyDown(dualView!, { key: ' ' });

			expect(handleSelect).toHaveBeenCalledTimes(1);
		});
	});

	describe('Layout', () => {
		it('both views have the same visual height', () => {
			const rack = createTestRack({ height: 12 });
			const { container } = render(RackDualView, {
				props: {
					rack,
					deviceLibrary: createTestDeviceLibrary(),
					selected: false
				}
			});

			const frontView = container.querySelector('.rack-front svg');
			const rearView = container.querySelector('.rack-rear svg');

			// Both SVGs should have same viewBox height
			const frontViewBox = frontView?.getAttribute('viewBox');
			const rearViewBox = rearView?.getAttribute('viewBox');

			expect(frontViewBox).toBe(rearViewBox);
		});
	});
});
