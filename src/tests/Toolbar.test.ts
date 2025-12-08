import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Toolbar from '$lib/components/Toolbar.svelte';
import ToolbarButton from '$lib/components/ToolbarButton.svelte';
import { resetLayoutStore, getLayoutStore } from '$lib/stores/layout.svelte';
import { resetSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';
import { resetCanvasStore } from '$lib/stores/canvas.svelte';
import { resetHistoryStore } from '$lib/stores/history.svelte';

describe('Toolbar Component', () => {
	beforeEach(() => {
		resetHistoryStore();
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
		resetCanvasStore();
	});

	describe('Layout', () => {
		it('renders all action buttons', () => {
			render(Toolbar);

			// All toolbar action buttons with text labels
			expect(screen.getByRole('button', { name: /new rack/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /load layout/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /reset view/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
		});
	});

	describe('Delete button state', () => {
		it('delete button disabled when hasSelection is false', () => {
			render(Toolbar);
			const deleteBtn = screen.getByRole('button', { name: /delete/i });
			expect(deleteBtn).toBeDisabled();
		});

		it('delete button enabled when hasSelection is true', () => {
			render(Toolbar, { props: { hasSelection: true } });
			const deleteBtn = screen.getByRole('button', { name: /delete/i });
			expect(deleteBtn).not.toBeDisabled();
		});
	});

	describe('Device Library (removed)', () => {
		it('does not have a Device Library toggle button (sidebar is always visible)', () => {
			render(Toolbar);
			// Device Library button was removed - sidebar is now always visible
			const libraryBtn = screen.queryByRole('button', { name: /device library/i });
			expect(libraryBtn).not.toBeInTheDocument();
		});
	});

	describe('Theme toggle', () => {
		it('theme toggle shows Light text in dark mode', () => {
			render(Toolbar, { props: { theme: 'dark' } });
			// In dark mode, button shows "Light" to switch to light
			const themeBtn = screen.getByRole('button', { name: /toggle theme/i });
			expect(themeBtn).toBeInTheDocument();
			expect(themeBtn.textContent).toContain('Light');
		});

		it('theme toggle shows Dark text in light mode', () => {
			render(Toolbar, { props: { theme: 'light' } });
			// In light mode, button shows "Dark" to switch to dark
			const themeBtn = screen.getByRole('button', { name: /toggle theme/i });
			expect(themeBtn).toBeInTheDocument();
			expect(themeBtn.textContent).toContain('Dark');
		});
	});

	describe('Reset View button', () => {
		it('renders reset view button', () => {
			render(Toolbar);
			expect(screen.getByRole('button', { name: /reset view/i })).toBeInTheDocument();
		});

		it('calls onfitall on click', async () => {
			const onFitAll = vi.fn();
			render(Toolbar, { props: { onfitall: onFitAll } });

			await fireEvent.click(screen.getByRole('button', { name: /reset view/i }));
			expect(onFitAll).toHaveBeenCalledTimes(1);
		});
	});

	describe('Click events', () => {
		it('dispatches newRack event when New Rack clicked', async () => {
			const onNewRack = vi.fn();
			render(Toolbar, { props: { onnewrack: onNewRack } });

			await fireEvent.click(screen.getByRole('button', { name: /new rack/i }));
			expect(onNewRack).toHaveBeenCalledTimes(1);
		});

		it('dispatches save event when Save clicked', async () => {
			const onSave = vi.fn();
			render(Toolbar, { props: { onsave: onSave } });

			await fireEvent.click(screen.getByRole('button', { name: /save/i }));
			expect(onSave).toHaveBeenCalledTimes(1);
		});

		it('dispatches load event when Load clicked', async () => {
			const onLoad = vi.fn();
			render(Toolbar, { props: { onload: onLoad } });

			await fireEvent.click(screen.getByRole('button', { name: /load/i }));
			expect(onLoad).toHaveBeenCalledTimes(1);
		});

		it('dispatches export event when Export clicked', async () => {
			const onExport = vi.fn();
			render(Toolbar, { props: { onexport: onExport } });

			await fireEvent.click(screen.getByRole('button', { name: /export/i }));
			expect(onExport).toHaveBeenCalledTimes(1);
		});

		it('dispatches delete event when Delete clicked (when enabled)', async () => {
			const onDelete = vi.fn();
			render(Toolbar, { props: { hasSelection: true, ondelete: onDelete } });

			await fireEvent.click(screen.getByRole('button', { name: /delete/i }));
			expect(onDelete).toHaveBeenCalledTimes(1);
		});

		it('dispatches toggleTheme event when Theme clicked', async () => {
			const onToggleTheme = vi.fn();
			render(Toolbar, { props: { ontoggletheme: onToggleTheme } });

			await fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));
			expect(onToggleTheme).toHaveBeenCalledTimes(1);
		});

		it('dispatches help event when Help clicked', async () => {
			const onHelp = vi.fn();
			render(Toolbar, { props: { onhelp: onHelp } });

			await fireEvent.click(screen.getByRole('button', { name: /help/i }));
			expect(onHelp).toHaveBeenCalledTimes(1);
		});
	});

	describe('Display Mode Toggle', () => {
		it('has display mode toggle button', () => {
			render(Toolbar);
			expect(screen.getByRole('button', { name: /label|image/i })).toBeInTheDocument();
		});

		it('shows Label text when displayMode is label', () => {
			render(Toolbar, { props: { displayMode: 'label' } });
			expect(screen.getByRole('button', { name: /label/i })).toBeInTheDocument();
		});

		it('shows Image text when displayMode is image', () => {
			render(Toolbar, { props: { displayMode: 'image' } });
			expect(screen.getByRole('button', { name: /image/i })).toBeInTheDocument();
		});

		it('dispatches toggleDisplayMode event when clicked', async () => {
			const onToggleDisplayMode = vi.fn();
			render(Toolbar, { props: { ontoggledisplaymode: onToggleDisplayMode } });

			await fireEvent.click(screen.getByRole('button', { name: /label/i }));
			expect(onToggleDisplayMode).toHaveBeenCalledTimes(1);
		});
	});

	describe('Airflow Mode Toggle', () => {
		it('has airflow toggle button', () => {
			render(Toolbar);
			expect(screen.getByRole('button', { name: /airflow/i })).toBeInTheDocument();
		});

		it('shows inactive state when airflowMode is false', () => {
			render(Toolbar, { props: { airflowMode: false } });
			const btn = screen.getByRole('button', { name: /airflow/i });
			expect(btn).not.toHaveAttribute('aria-pressed', 'true');
		});

		it('shows active state when airflowMode is true', () => {
			render(Toolbar, { props: { airflowMode: true } });
			const btn = screen.getByRole('button', { name: /airflow/i });
			expect(btn).toHaveAttribute('aria-pressed', 'true');
		});

		it('dispatches toggleAirflowMode event when clicked', async () => {
			const onToggleAirflowMode = vi.fn();
			render(Toolbar, { props: { ontoggleairflowmode: onToggleAirflowMode } });

			await fireEvent.click(screen.getByRole('button', { name: /airflow/i }));
			expect(onToggleAirflowMode).toHaveBeenCalledTimes(1);
		});
	});

	describe('New Rack CTA state', () => {
		it('New Rack button is primary (blue) when no racks', () => {
			const { container } = render(Toolbar, { props: { hasRacks: false } });
			const newRackBtn = container.querySelector('.toolbar-action-btn.primary');
			expect(newRackBtn).toBeInTheDocument();
			expect(newRackBtn?.textContent).toContain('New Rack');
		});

		it('New Rack button is not primary when racks exist', () => {
			render(Toolbar, { props: { hasRacks: true } });
			const newRackBtn = screen.getByRole('button', { name: /new rack/i });
			expect(newRackBtn).not.toHaveClass('primary');
		});
	});

	describe('Undo/Redo button states', () => {
		it('renders undo and redo buttons', () => {
			render(Toolbar);
			expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument();
		});

		it('undo button is disabled initially (no history)', () => {
			render(Toolbar);
			const undoBtn = screen.getByRole('button', { name: /undo/i });
			expect(undoBtn).toBeDisabled();
		});

		it('redo button is disabled initially (no future)', () => {
			render(Toolbar);
			const redoBtn = screen.getByRole('button', { name: /redo/i });
			expect(redoBtn).toBeDisabled();
		});

		it('undo button becomes enabled after placing a device', () => {
			const layoutStore = getLayoutStore();
			// Add a device type first
			layoutStore.addDeviceType({
				name: 'Test Server',
				category: 'server',
				u_height: 2,
				colour: '#3b82f6'
			});

			render(Toolbar);

			// Place a device - this should record to history
			layoutStore.placeDevice('rack-1', 'test-server', 1, 'front');

			// Re-render to get updated state
			const { unmount } = render(Toolbar);
			const undoBtn = screen.getAllByRole('button', { name: /undo/i })[1]; // Second render
			expect(undoBtn).not.toBeDisabled();
			unmount();
		});

		it('redo button becomes enabled after undo', () => {
			const layoutStore = getLayoutStore();
			// Add a device type and place a device
			layoutStore.addDeviceType({
				name: 'Test Server',
				category: 'server',
				u_height: 2,
				colour: '#3b82f6'
			});
			layoutStore.placeDevice('rack-1', 'test-server', 1, 'front');

			// Perform undo
			layoutStore.undo();

			render(Toolbar);
			const redoBtn = screen.getByRole('button', { name: /redo/i });
			expect(redoBtn).not.toBeDisabled();
		});

		it('undo button is disabled after undoing all actions', () => {
			const layoutStore = getLayoutStore();
			// Add a device type and place a device
			layoutStore.addDeviceType({
				name: 'Test Server',
				category: 'server',
				u_height: 2,
				colour: '#3b82f6'
			});
			layoutStore.placeDevice('rack-1', 'test-server', 1, 'front');

			// Undo both actions (place device and add device type)
			layoutStore.undo(); // Undo place device
			layoutStore.undo(); // Undo add device type

			render(Toolbar);
			const undoBtn = screen.getByRole('button', { name: /undo/i });
			expect(undoBtn).toBeDisabled();
		});

		it('redo button is disabled after redoing all actions', () => {
			const layoutStore = getLayoutStore();
			// Add a device type and place a device
			layoutStore.addDeviceType({
				name: 'Test Server',
				category: 'server',
				u_height: 2,
				colour: '#3b82f6'
			});
			layoutStore.placeDevice('rack-1', 'test-server', 1, 'front');

			// Undo
			layoutStore.undo();
			// Redo
			layoutStore.redo();

			render(Toolbar);
			const redoBtn = screen.getByRole('button', { name: /redo/i });
			expect(redoBtn).toBeDisabled();
		});
	});
});

describe('ToolbarButton Component', () => {
	it('renders with label as aria-label', () => {
		render(ToolbarButton, { props: { label: 'Test Button' } });
		const button = screen.getByRole('button', { name: 'Test Button' });
		expect(button).toBeInTheDocument();
	});

	it('renders disabled when disabled prop is true', () => {
		render(ToolbarButton, { props: { label: 'Test', disabled: true } });
		const button = screen.getByRole('button');
		expect(button).toBeDisabled();
	});

	it('shows active state styling when active prop is true', () => {
		render(ToolbarButton, { props: { label: 'Test', active: true } });
		const button = screen.getByRole('button');
		expect(button).toHaveClass('active');
	});

	it('sets aria-pressed when active prop is provided', () => {
		render(ToolbarButton, { props: { label: 'Test', active: true } });
		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('aria-pressed', 'true');
	});

	it('dispatches click event when clicked', async () => {
		const onClick = vi.fn();
		render(ToolbarButton, { props: { label: 'Test', onclick: onClick } });

		await fireEvent.click(screen.getByRole('button'));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('does not dispatch click when disabled', async () => {
		const onClick = vi.fn();
		render(ToolbarButton, { props: { label: 'Test', disabled: true, onclick: onClick } });

		await fireEvent.click(screen.getByRole('button'));
		expect(onClick).not.toHaveBeenCalled();
	});
});
