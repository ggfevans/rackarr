import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ConfirmReplaceDialog from '$lib/components/ConfirmReplaceDialog.svelte';
import { resetLayoutStore, getLayoutStore } from '$lib/stores/layout.svelte';

describe('ConfirmReplaceDialog', () => {
	beforeEach(() => {
		resetLayoutStore();
	});

	it('does not render when open is false', () => {
		render(ConfirmReplaceDialog, {
			props: { open: false, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('renders dialog with title when open', () => {
		const store = getLayoutStore();
		store.addRack('Test Rack', 42);

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});

		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('Replace Current Rack?')).toBeInTheDocument();
	});

	it('displays rack name in message', () => {
		const store = getLayoutStore();
		store.addRack('My Homelab', 42);

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});

		expect(screen.getByText(/My Homelab/)).toBeInTheDocument();
	});

	it('displays device count with correct pluralization (1 device)', () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);
		const RACK_ID = 'rack-0';
		const device = store.addDeviceType({
			name: 'Server',
			u_height: 2,
			category: 'server',
			colour: '#4A90D9'
		});
		store.placeDevice(RACK_ID, device.slug, 1);

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});

		expect(screen.getByText(/1 device placed/)).toBeInTheDocument();
	});

	it('displays device count with correct pluralization (3 devices)', () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);
		const RACK_ID = 'rack-0';
		for (let i = 0; i < 3; i++) {
			const device = store.addDeviceType({
				name: `Device ${i}`,
				u_height: 1,
				category: 'server',
				colour: '#4A90D9'
			});
			store.placeDevice(RACK_ID, device.slug, i + 1);
		}

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});

		expect(screen.getByText(/3 devices placed/)).toBeInTheDocument();
	});

	it('handles zero devices', () => {
		const store = getLayoutStore();
		store.addRack('Empty Rack', 42);

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});

		expect(screen.getByText(/0 devices placed/)).toBeInTheDocument();
	});

	it('uses "Untitled Rack" for empty rack name', () => {
		const store = getLayoutStore();
		store.addRack('', 42);

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});

		expect(screen.getByText(/Untitled Rack/)).toBeInTheDocument();
	});

	it('calls onSaveFirst when Save First button clicked', async () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);
		const onSaveFirst = vi.fn();

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst, onReplace: vi.fn(), onCancel: vi.fn() }
		});

		await fireEvent.click(screen.getByText('Save First'));
		expect(onSaveFirst).toHaveBeenCalledOnce();
	});

	it('calls onReplace when Replace button clicked', async () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);
		const onReplace = vi.fn();

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace, onCancel: vi.fn() }
		});

		await fireEvent.click(screen.getByText('Replace'));
		expect(onReplace).toHaveBeenCalledOnce();
	});

	it('calls onCancel when Cancel button clicked', async () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);
		const onCancel = vi.fn();

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel }
		});

		await fireEvent.click(screen.getByText('Cancel'));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it('renders three buttons with correct labels', () => {
		const store = getLayoutStore();
		store.addRack('Rack', 42);

		render(ConfirmReplaceDialog, {
			props: { open: true, onSaveFirst: vi.fn(), onReplace: vi.fn(), onCancel: vi.fn() }
		});

		expect(screen.getByText('Save First')).toBeInTheDocument();
		expect(screen.getByText('Replace')).toBeInTheDocument();
		expect(screen.getByText('Cancel')).toBeInTheDocument();
	});
});
