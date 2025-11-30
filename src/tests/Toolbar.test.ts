import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Toolbar from '$lib/components/Toolbar.svelte';
import ToolbarButton from '$lib/components/ToolbarButton.svelte';
import { resetLayoutStore } from '$lib/stores/layout.svelte';
import { resetSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';
import { resetCanvasStore, getCanvasStore, ZOOM_MIN, ZOOM_MAX } from '$lib/stores/canvas.svelte';

// Helper to create mock panzoom instance at a specific zoom level
function createMockPanzoom(initialScale = 1) {
	let transform = { x: 0, y: 0, scale: initialScale };
	const listeners: Record<string, Array<() => void>> = {};

	return {
		getTransform: () => ({ ...transform }),
		zoomAbs: vi.fn((x: number, y: number, scale: number) => {
			transform = { x, y, scale };
			listeners['zoom']?.forEach((cb) => cb());
		}),
		smoothZoomAbs: vi.fn(),
		moveTo: vi.fn(),
		on: vi.fn((event: string, callback: () => void) => {
			if (!listeners[event]) listeners[event] = [];
			listeners[event].push(callback);
		}),
		dispose: vi.fn()
	} as unknown as ReturnType<typeof import('panzoom').default>;
}

describe('Toolbar Component', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
		resetCanvasStore();
	});

	describe('Layout', () => {
		it('renders all action buttons', () => {
			render(Toolbar);

			// Left section
			expect(screen.getByText('Rackarr')).toBeInTheDocument();

			// Center section buttons
			expect(screen.getByRole('button', { name: /new rack/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /device palette/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();

			// Right section
			expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
		});

		it('shows zoom level display', () => {
			render(Toolbar);
			expect(screen.getByText('100%')).toBeInTheDocument();
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

	describe('Palette toggle', () => {
		it('palette toggle shows expanded state when drawer open', () => {
			render(Toolbar, { props: { paletteOpen: true } });
			const paletteBtn = screen.getByRole('button', { name: /device palette/i });
			expect(paletteBtn).toHaveAttribute('aria-expanded', 'true');
		});

		it('palette toggle shows collapsed state when drawer closed', () => {
			render(Toolbar, { props: { paletteOpen: false } });
			const paletteBtn = screen.getByRole('button', { name: /device palette/i });
			expect(paletteBtn).toHaveAttribute('aria-expanded', 'false');
		});
	});

	describe('Theme toggle', () => {
		it('theme toggle shows sun icon in dark mode', () => {
			render(Toolbar, { props: { theme: 'dark' } });
			const themeBtn = screen.getByRole('button', { name: /toggle theme/i });
			// In dark mode, we show sun to switch to light
			expect(themeBtn.querySelector('[data-icon="sun"]')).toBeInTheDocument();
		});

		it('theme toggle shows moon icon in light mode', () => {
			render(Toolbar, { props: { theme: 'light' } });
			const themeBtn = screen.getByRole('button', { name: /toggle theme/i });
			// In light mode, we show moon to switch to dark
			expect(themeBtn.querySelector('[data-icon="moon"]')).toBeInTheDocument();
		});
	});

	describe('Fit All button', () => {
		it('renders fit all button', () => {
			render(Toolbar);
			expect(screen.getByRole('button', { name: /fit all/i })).toBeInTheDocument();
		});

		it('calls onfitall on click', async () => {
			const onFitAll = vi.fn();
			render(Toolbar, { props: { onfitall: onFitAll } });

			await fireEvent.click(screen.getByRole('button', { name: /fit all/i }));
			expect(onFitAll).toHaveBeenCalledTimes(1);
		});
	});

	describe('Zoom controls', () => {
		it('zoom in disabled at ZOOM_MAX', () => {
			const store = getCanvasStore();
			store.setPanzoomInstance(createMockPanzoom(ZOOM_MAX));

			render(Toolbar);
			const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
			expect(zoomInBtn).toBeDisabled();
		});

		it('zoom out disabled at ZOOM_MIN', () => {
			const store = getCanvasStore();
			store.setPanzoomInstance(createMockPanzoom(ZOOM_MIN));

			render(Toolbar);
			const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });
			expect(zoomOutBtn).toBeDisabled();
		});

		it('zoom controls enabled at default zoom (100%)', () => {
			const store = getCanvasStore();
			store.setPanzoomInstance(createMockPanzoom(1));

			render(Toolbar);
			const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
			const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });
			expect(zoomInBtn).not.toBeDisabled();
			expect(zoomOutBtn).not.toBeDisabled();
		});

		it('displays current zoom level', () => {
			const store = getCanvasStore();
			store.setPanzoomInstance(createMockPanzoom(1.5));

			render(Toolbar);
			expect(screen.getByText('150%')).toBeInTheDocument();
		});
	});

	describe('Click events', () => {
		it('dispatches newRack event when New Rack clicked', async () => {
			const onNewRack = vi.fn();
			render(Toolbar, { props: { onnewrack: onNewRack } });

			await fireEvent.click(screen.getByRole('button', { name: /new rack/i }));
			expect(onNewRack).toHaveBeenCalledTimes(1);
		});

		it('dispatches togglePalette event when Palette clicked', async () => {
			const onTogglePalette = vi.fn();
			render(Toolbar, { props: { ontogglepalette: onTogglePalette } });

			await fireEvent.click(screen.getByRole('button', { name: /device palette/i }));
			expect(onTogglePalette).toHaveBeenCalledTimes(1);
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

		it('dispatches zoomIn event when Zoom In clicked', async () => {
			const onZoomIn = vi.fn();
			render(Toolbar, { props: { onzoomin: onZoomIn } });

			await fireEvent.click(screen.getByRole('button', { name: /zoom in/i }));
			expect(onZoomIn).toHaveBeenCalledTimes(1);
		});

		it('dispatches zoomOut event when Zoom Out clicked', async () => {
			const onZoomOut = vi.fn();
			render(Toolbar, { props: { onzoomout: onZoomOut } });

			await fireEvent.click(screen.getByRole('button', { name: /zoom out/i }));
			expect(onZoomOut).toHaveBeenCalledTimes(1);
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

			await fireEvent.click(screen.getByRole('button', { name: 'Help' }));
			expect(onHelp).toHaveBeenCalledTimes(1);
		});
	});

	describe('Accessibility', () => {
		it('all buttons have aria-labels', () => {
			render(Toolbar);

			const buttons = screen.getAllByRole('button');
			buttons.forEach((button) => {
				expect(button).toHaveAttribute('aria-label');
			});
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
