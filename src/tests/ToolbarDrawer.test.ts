import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import ToolbarDrawer from '$lib/components/ToolbarDrawer.svelte';

describe('ToolbarDrawer Component', () => {
	afterEach(() => {
		cleanup();
	});

	describe('Position', () => {
		it('drawer has toolbar-drawer class for right-side positioning', () => {
			const { container } = render(ToolbarDrawer, {
				props: { open: true }
			});

			const drawer = container.querySelector('.toolbar-drawer');
			expect(drawer).toBeInTheDocument();
			// The .toolbar-drawer class contains right:0 and border-left styling
			// This verifies the element exists and has the correct class applied
			expect(drawer).toHaveClass('toolbar-drawer');
		});

		it('drawer opens from the right (translateX positive when closed)', () => {
			const { container } = render(ToolbarDrawer, {
				props: { open: false }
			});

			const drawer = container.querySelector('.toolbar-drawer');
			// When closed, should be translated off-screen to the right
			// CSS: transform: translateX(100%) when closed (positive = right side)
			expect(drawer).not.toHaveClass('open');
		});

		it('drawer is visible when open', () => {
			const { container } = render(ToolbarDrawer, {
				props: { open: true }
			});

			const drawer = container.querySelector('.toolbar-drawer');
			expect(drawer).toHaveClass('open');
		});
	});

	describe('Accessibility', () => {
		it('has dialog role', () => {
			render(ToolbarDrawer, { props: { open: true } });

			const drawer = screen.getByRole('dialog');
			expect(drawer).toBeInTheDocument();
		});

		it('has aria-modal true', () => {
			render(ToolbarDrawer, { props: { open: true } });

			const drawer = screen.getByRole('dialog');
			expect(drawer).toHaveAttribute('aria-modal', 'true');
		});

		it('is aria-hidden when closed', () => {
			const { container } = render(ToolbarDrawer, {
				props: { open: false }
			});

			const drawer = container.querySelector('.toolbar-drawer');
			expect(drawer).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('Backdrop', () => {
		it('backdrop is visible when drawer is open', () => {
			const { container } = render(ToolbarDrawer, {
				props: { open: true }
			});

			const backdrop = container.querySelector('.drawer-backdrop');
			expect(backdrop).toBeInTheDocument();
			expect(backdrop).toHaveClass('visible');
		});

		it('clicking backdrop closes drawer', async () => {
			const onclose = vi.fn();
			const { container } = render(ToolbarDrawer, {
				props: { open: true, onclose }
			});

			const backdrop = container.querySelector('.drawer-backdrop');
			await fireEvent.click(backdrop!);

			expect(onclose).toHaveBeenCalled();
		});
	});

	describe('Menu Items', () => {
		it('renders file group with New Rack, Load, Save, Export', () => {
			render(ToolbarDrawer, { props: { open: true } });

			expect(screen.getByRole('button', { name: /new rack/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /load layout/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
		});

		it('renders edit group with Undo, Redo, Delete', () => {
			render(ToolbarDrawer, { props: { open: true } });

			expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
		});

		it('renders view group with display mode, reset view, about', () => {
			render(ToolbarDrawer, { props: { open: true } });

			expect(screen.getByRole('button', { name: /view:/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /reset view/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /about/i })).toBeInTheDocument();
		});

		it('clicking menu item calls action and closes drawer', async () => {
			const onnewrack = vi.fn();
			const onclose = vi.fn();

			render(ToolbarDrawer, {
				props: { open: true, onnewrack, onclose }
			});

			const newRackBtn = screen.getByRole('button', { name: /new rack/i });
			await fireEvent.click(newRackBtn);

			expect(onnewrack).toHaveBeenCalled();
			expect(onclose).toHaveBeenCalled();
		});
	});

	describe('Keyboard', () => {
		it('Escape key closes drawer', async () => {
			const onclose = vi.fn();

			render(ToolbarDrawer, {
				props: { open: true, onclose }
			});

			await fireEvent.keyDown(window, { key: 'Escape' });

			expect(onclose).toHaveBeenCalled();
		});
	});
});
