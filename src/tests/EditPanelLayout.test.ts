import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import EditPanel from '$lib/components/EditPanel.svelte';
import { resetLayoutStore, getLayoutStore } from '$lib/stores/layout.svelte';
import { resetSelectionStore, getSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';

describe('EditPanel Visual Hierarchy', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
	});

	describe('Contextual Title', () => {
		it('drawer has Edit title when rack is selected', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Main Server Rack', 42);
			selectionStore.selectRack(RACK_ID);

			render(EditPanel);

			// The drawer should have the title "Edit"
			const drawer = screen.getByRole('complementary');
			expect(drawer).toHaveAttribute('aria-label', 'Edit');
		});
	});

	describe('Section Organization', () => {
		it('has form group for rack name editing', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack(RACK_ID);

			const { container } = render(EditPanel);

			// Should have form groups for name and height
			const formGroups = container.querySelectorAll('.form-group');
			expect(formGroups.length).toBeGreaterThanOrEqual(2);
		});

		it('has form inputs for Name and Height', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack(RACK_ID);

			render(EditPanel);

			expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
		});

		it('has information section with stats', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack(RACK_ID);

			const { container } = render(EditPanel);

			// Should have info section
			const infoSection = container.querySelector('.info-section');
			expect(infoSection).toBeInTheDocument();

			// Should show Devices label
			expect(screen.getByText('Devices')).toBeInTheDocument();
		});

		it('has actions section with delete button', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack(RACK_ID);

			const { container } = render(EditPanel);

			// Should have actions section
			const actionsSection = container.querySelector('.actions');
			expect(actionsSection).toBeInTheDocument();

			// Should have delete button
			const deleteButton = screen.getByRole('button', { name: /delete rack/i });
			expect(deleteButton).toBeInTheDocument();
		});
	});

	describe('Height Preset Buttons', () => {
		it('shows preset buttons for common rack heights', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack(RACK_ID);

			const { container } = render(EditPanel);

			// Should have preset buttons container
			const presetButtons = container.querySelector('.height-presets');
			expect(presetButtons).toBeInTheDocument();

			// Should have common height presets
			expect(screen.getByRole('button', { name: /42U/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /24U/i })).toBeInTheDocument();
		});

		it('preset button shows active state when matching height', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack(RACK_ID);

			const { container } = render(EditPanel);

			// The 42U button should have active class
			const activePreset = container.querySelector('.preset-btn.active');
			expect(activePreset).toBeInTheDocument();
			expect(activePreset?.textContent).toBe('42U');
		});

		it('24U preset is active when rack height is 24', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 24);
			selectionStore.selectRack(RACK_ID);

			const { container } = render(EditPanel);

			// The 24U button should have active class
			const activePreset = container.querySelector('.preset-btn.active');
			expect(activePreset).toBeInTheDocument();
			expect(activePreset?.textContent).toBe('24U');
		});

		it('height input is enabled when rack has devices (smart validation)', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 42);
			const device = layoutStore.addDeviceType({
				name: 'Server',
				u_height: 2,
				category: 'server',
				colour: '#4A90D9'
			});
			layoutStore.placeDevice(RACK_ID, device.slug, 1);
			selectionStore.selectRack(RACK_ID);

			render(EditPanel);

			// Height input should be enabled (smart validation allows resizing)
			const heightInput = screen.getByLabelText(/height/i);
			expect(heightInput).not.toBeDisabled();
		});
	});

	describe('Device Editing View', () => {
		it('shows device name when device is selected', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 42);
			const device = layoutStore.addDeviceType({
				name: 'Dell PowerEdge R730',
				u_height: 2,
				category: 'server',
				colour: '#2563eb'
			});
			layoutStore.placeDevice(RACK_ID, device.slug, 10);
			selectionStore.selectDevice(RACK_ID, 0, device.slug);

			render(EditPanel);

			// Should show device name (may appear in multiple places)
			const deviceNames = screen.getAllByText('Dell PowerEdge R730');
			expect(deviceNames.length).toBeGreaterThan(0);
		});

		it('shows device properties in info section', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 42);
			const device = layoutStore.addDeviceType({
				name: 'Dell PowerEdge R730',
				u_height: 2,
				category: 'server',
				colour: '#2563eb'
			});
			layoutStore.placeDevice(RACK_ID, device.slug, 10);
			selectionStore.selectDevice(RACK_ID, 0, device.slug);

			render(EditPanel);

			// Should show device height
			expect(screen.getByText('2U')).toBeInTheDocument();
			// Should show position
			expect(screen.getByText('U10')).toBeInTheDocument();
		});

		it('has remove from rack button for device', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 42);
			const device = layoutStore.addDeviceType({
				name: 'Dell PowerEdge R730',
				u_height: 2,
				category: 'server',
				colour: '#2563eb'
			});
			layoutStore.placeDevice(RACK_ID, device.slug, 10);
			selectionStore.selectDevice(RACK_ID, 0, device.slug);

			render(EditPanel);

			// Should have remove button
			const removeButton = screen.getByRole('button', { name: /remove from rack/i });
			expect(removeButton).toBeInTheDocument();
		});
	});

	describe('Visual Styling', () => {
		it('delete button has danger styling', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack(RACK_ID);

			const { container } = render(EditPanel);

			// Delete button should have danger class
			const deleteButton = container.querySelector('.btn-danger');
			expect(deleteButton).toBeInTheDocument();
		});

		it('info section has appropriate styling class', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const RACK_ID = 'rack-0';

			layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack(RACK_ID);

			const { container } = render(EditPanel);

			// Info section should exist
			const infoSection = container.querySelector('.info-section');
			expect(infoSection).toBeInTheDocument();

			// Info rows should exist
			const infoRows = container.querySelectorAll('.info-row');
			expect(infoRows.length).toBeGreaterThanOrEqual(1);
		});
	});
});
