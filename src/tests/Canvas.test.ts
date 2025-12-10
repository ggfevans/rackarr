import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Canvas from '$lib/components/Canvas.svelte';
import { getLayoutStore, resetLayoutStore } from '$lib/stores/layout.svelte';
import { getSelectionStore, resetSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';
import { resetCanvasStore, getCanvasStore } from '$lib/stores/canvas.svelte';

describe('Canvas Component', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
		resetCanvasStore();
		// Most tests assume user has already started (rack visible)
		getLayoutStore().markStarted();
	});

	// WelcomeScreen is shown when user hasn't started yet
	describe('WelcomeScreen (fresh start)', () => {
		it('shows WelcomeScreen when hasStarted is false', () => {
			// Reset to clear markStarted from beforeEach
			resetLayoutStore();
			const layoutStore = getLayoutStore();
			expect(layoutStore.hasStarted).toBe(false);

			const { container } = render(Canvas);

			// WelcomeScreen should be visible
			expect(container.querySelector('.welcome-screen')).toBeInTheDocument();
			// Rack should not be visible
			expect(container.querySelector('.rack-container')).not.toBeInTheDocument();
		});
	});

	// After user has started, rack is shown
	describe('Initial State (v0.2)', () => {
		it('shows rack after user has started (v0.2 always has a rack)', () => {
			const { container } = render(Canvas);

			// v0.2: rack is always present after user starts
			const rackContainer = container.querySelector('.rack-container');
			expect(rackContainer).toBeInTheDocument();
			// WelcomeScreen should not be visible
			expect(container.querySelector('.welcome-screen')).not.toBeInTheDocument();
		});

		it('default rack has 42U height', () => {
			const layoutStore = getLayoutStore();

			render(Canvas);

			// Default rack is 42U
			expect(layoutStore.rack.height).toBe(42);
		});
	});

	// Note: Multi-rack rendering tests updated for single-rack mode (v0.1.1)
	describe('Rack Rendering', () => {
		it('renders single rack in dual-view (front and rear)', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 42);

			const { container } = render(Canvas);

			// v0.4: Should have two rack containers (front and rear views)
			const rackContainers = container.querySelectorAll('.rack-container');
			expect(rackContainers.length).toBe(2);

			// Should be wrapped in a dual-view container
			expect(container.querySelector('.rack-dual-view')).toBeInTheDocument();
		});

		it('renders rack with correct name', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('My Server Rack', 42);

			render(Canvas);

			expect(screen.getByText('My Server Rack')).toBeInTheDocument();
		});

		// Note: v0.2 always has a rack, so WelcomeScreen check is moved to 'Initial State' describe block
	});

	// Note: Layout tests updated for single-rack mode (v0.1.1)
	describe('Layout', () => {
		it('renders canvas container', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 42);

			const { container } = render(Canvas);

			const canvas = container.querySelector('.canvas');
			expect(canvas).toBeInTheDocument();
			expect(canvas?.classList.contains('canvas')).toBe(true);
		});

		it('has canvas element when rack exists', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 42);

			const { container } = render(Canvas);

			const canvas = container.querySelector('.canvas');
			expect(canvas).toBeInTheDocument();
		});
	});

	describe('Selection', () => {
		it('clicking empty space clears selection', async () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);
			const RACK_ID = 'rack-0';

			const selectionStore = getSelectionStore();
			selectionStore.selectRack(RACK_ID);

			expect(selectionStore.hasSelection).toBe(true);

			const { container } = render(Canvas);

			// Click on the canvas background (not on a rack)
			const canvas = container.querySelector('.canvas');
			await fireEvent.click(canvas!);

			// Selection should be cleared
			expect(selectionStore.hasSelection).toBe(false);
		});

		it('passes selected state to dual-view container', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);
			const RACK_ID = 'rack-0';

			const selectionStore = getSelectionStore();
			selectionStore.selectRack(RACK_ID);

			const { container } = render(Canvas);

			// v0.4: Selection is on the dual-view container, not individual rack-containers
			const selectedDualView = container.querySelector('.rack-dual-view[aria-selected="true"]');
			expect(selectedDualView).toBeInTheDocument();
		});
	});

	describe('Zoom (panzoom)', () => {
		it('has panzoom container when racks exist', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const { container } = render(Canvas);

			const panzoomContainer = container.querySelector('.panzoom-container');
			expect(panzoomContainer).toBeInTheDocument();
		});

		it('initializes canvas store with panzoom instance', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			render(Canvas);

			const canvasStore = getCanvasStore();
			// Panzoom should be initialized after mount
			expect(canvasStore.hasPanzoom).toBe(true);
		});
	});

	describe('Events', () => {
		it('dispatches rackselect event when rack is clicked', async () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const handleRackSelect = vi.fn();

			const { container } = render(Canvas, { props: { onrackselect: handleRackSelect } });

			// v0.4: Click on the front view specifically (first SVG)
			const frontView = container.querySelector('.rack-front svg');
			await fireEvent.click(frontView!);

			expect(handleRackSelect).toHaveBeenCalledTimes(1);
		});
	});
});

describe('Canvas with RackDualView (v0.4)', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
		resetCanvasStore();
		getLayoutStore().markStarted();
	});

	describe('Dual-view rendering', () => {
		it('renders RackDualView instead of single Rack', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const { container } = render(Canvas);

			// Should render the dual-view container
			expect(container.querySelector('.rack-dual-view')).toBeInTheDocument();
		});

		it('shows both FRONT and REAR views', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const { container } = render(Canvas);

			// Both view labels should be present
			const viewLabels = container.querySelectorAll('.rack-view-label');
			expect(viewLabels.length).toBe(2);
			expect(viewLabels[0]?.textContent).toBe('FRONT');
			expect(viewLabels[1]?.textContent).toBe('REAR');
		});

		it('renders two Rack components side-by-side', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const { container } = render(Canvas);

			// Should have both front and rear containers
			expect(container.querySelector('.rack-front')).toBeInTheDocument();
			expect(container.querySelector('.rack-rear')).toBeInTheDocument();
		});

		it('shows rack name once above both views', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('My Server Rack', 12);

			const { container } = render(Canvas);

			// Rack name should appear in the dual-view header, not in individual racks
			const dualViewName = container.querySelector('.rack-dual-view-name');
			expect(dualViewName).toBeInTheDocument();
			expect(dualViewName?.textContent).toBe('My Server Rack');
		});
	});

	describe('Selection with dual-view', () => {
		it('clicking front view selects the rack', async () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const handleRackSelect = vi.fn();

			const { container } = render(Canvas, { props: { onrackselect: handleRackSelect } });

			// Click on the SVG inside the front view
			const frontViewSvg = container.querySelector('.rack-front svg');
			await fireEvent.click(frontViewSvg!);

			expect(handleRackSelect).toHaveBeenCalled();
		});

		it('clicking rear view selects the rack', async () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const handleRackSelect = vi.fn();

			const { container } = render(Canvas, { props: { onrackselect: handleRackSelect } });

			// Click on the SVG inside the rear view
			const rearViewSvg = container.querySelector('.rack-rear svg');
			await fireEvent.click(rearViewSvg!);

			expect(handleRackSelect).toHaveBeenCalled();
		});

		it('selection outline appears on dual-view container', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);
			const RACK_ID = 'rack-0';

			const selectionStore = getSelectionStore();
			selectionStore.selectRack(RACK_ID);

			const { container } = render(Canvas);

			// The dual-view container should have selected state
			const dualView = container.querySelector('.rack-dual-view');
			expect(dualView).toHaveAttribute('aria-selected', 'true');
		});
	});

	describe('Device visibility in dual-view', () => {
		it('front-face device appears only in front view', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);
			const RACK_ID = 'rack-0';
			// Add a device type to the library
			const deviceType = layoutStore.addDeviceType({
				name: 'Front Device',
				u_height: 1,
				category: 'server',
				colour: '#888888',
				is_full_depth: false
			});
			// Place the device with face='front'
			layoutStore.placeDevice(RACK_ID, deviceType.slug, 1, 'front');

			const { container } = render(Canvas);

			// Front view should have the device
			const frontView = container.querySelector('.rack-front');
			expect(frontView?.querySelector('.rack-device')).toBeInTheDocument();

			// Rear view should NOT have the device (half-depth front device)
			const rearView = container.querySelector('.rack-rear');
			expect(rearView?.querySelector('.rack-device')).not.toBeInTheDocument();
		});

		it('rear-face device appears only in rear view', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);
			const RACK_ID = 'rack-0';
			const deviceType = layoutStore.addDeviceType({
				name: 'Rear Device',
				u_height: 1,
				category: 'server',
				colour: '#888888',
				is_full_depth: false
			});
			layoutStore.placeDevice(RACK_ID, deviceType.slug, 1, 'rear');

			const { container } = render(Canvas);

			// Front view should NOT have the device
			const frontView = container.querySelector('.rack-front');
			expect(frontView?.querySelector('.rack-device')).not.toBeInTheDocument();

			// Rear view should have the device
			const rearView = container.querySelector('.rack-rear');
			expect(rearView?.querySelector('.rack-device')).toBeInTheDocument();
		});

		it('both-face device appears in both views', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);
			const RACK_ID = 'rack-0';
			const deviceType = layoutStore.addDeviceType({
				name: 'Full Depth Device',
				u_height: 1,
				category: 'server',
				colour: '#888888',
				is_full_depth: true
			});
			layoutStore.placeDevice(RACK_ID, deviceType.slug, 1, 'both');

			const { container } = render(Canvas);

			// Both views should have the device
			const frontView = container.querySelector('.rack-front');
			expect(frontView?.querySelector('.rack-device')).toBeInTheDocument();

			const rearView = container.querySelector('.rack-rear');
			expect(rearView?.querySelector('.rack-device')).toBeInTheDocument();
		});
	});
});

describe('Canvas Layout with Fixed Sidebar (v0.1.0)', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
		resetCanvasStore();
		getLayoutStore().markStarted();
	});

	describe('Canvas positioning', () => {
		it('canvas has proper structure for sidebar offset', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const { container } = render(Canvas);

			// Canvas should exist and have correct class
			const canvas = container.querySelector('.canvas');
			expect(canvas).toBeInTheDocument();
			expect(canvas).toHaveClass('canvas');
		});

		it('canvas fills available space', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const { container } = render(Canvas);

			// Canvas should have flex: 1 style via CSS
			const canvas = container.querySelector('.canvas');
			expect(canvas).toBeInTheDocument();
			// Verify the class exists (CSS sets flex: 1)
			expect(canvas).toHaveClass('canvas');
		});
	});
});
