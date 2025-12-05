import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ExportDialog from '$lib/components/ExportDialog.svelte';
import type { Rack } from '$lib/types';

describe('ExportDialog', () => {
	const mockRacks: Rack[] = [
		{
			id: 'rack-1',
			name: 'Rack 1',
			height: 42,
			width: 19,
			position: 0,
			view: 'front',
			devices: []
		},
		{
			id: 'rack-2',
			name: 'Rack 2',
			height: 24,
			width: 19,
			position: 1,
			view: 'front',
			devices: []
		}
	];

	describe('Dialog Visibility', () => {
		it('renders when open=true', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			expect(screen.getByRole('dialog')).toBeInTheDocument();
			// Check for title (heading element)
			expect(screen.getByRole('heading', { name: /export/i })).toBeInTheDocument();
		});

		it('hidden when open=false', () => {
			render(ExportDialog, {
				props: { open: false, racks: mockRacks, selectedRackId: null }
			});

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('Format Options', () => {
		it('shows format options in Single Image mode', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const formatSelect = screen.getByLabelText(/format/i);
			expect(formatSelect).toBeInTheDocument();

			// Check format options exist (PNG, JPEG, SVG - no PDF in Single Image mode)
			expect(screen.getByRole('option', { name: /png/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /jpeg/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /svg/i })).toBeInTheDocument();
		});

		it('defaults to PNG format', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const formatSelect = screen.getByLabelText(/format/i) as HTMLSelectElement;
			expect(formatSelect.value).toBe('png');
		});
	});

	describe('Include Options', () => {
		it('shows include legend checkbox (default unchecked)', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const checkbox = screen.getByLabelText(/include legend/i) as HTMLInputElement;
			expect(checkbox).toBeInTheDocument();
			expect(checkbox.checked).toBe(false);
		});
	});

	describe('Background Options', () => {
		it('shows background dropdown with dark, light options', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const bgSelect = screen.getByLabelText(/^background$/i);
			expect(bgSelect).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /dark/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /light/i })).toBeInTheDocument();
		});

		it('transparent checkbox shown for PNG and SVG formats', async () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			// Default is PNG - transparent checkbox should be visible
			const transparentCheckbox = screen.getByLabelText(/transparent background/i);
			expect(transparentCheckbox).toBeInTheDocument();

			// Change to SVG format - checkbox should still be visible
			const formatSelect = screen.getByLabelText(/format/i);
			await fireEvent.change(formatSelect, { target: { value: 'svg' } });
			expect(screen.getByLabelText(/transparent background/i)).toBeInTheDocument();

			// Change to JPEG format - checkbox should be hidden
			await fireEvent.change(formatSelect, { target: { value: 'jpeg' } });
			expect(screen.queryByLabelText(/transparent background/i)).not.toBeInTheDocument();
		});

		it('transparent checkbox defaults to unchecked', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const transparentCheckbox = screen.getByLabelText(
				/transparent background/i
			) as HTMLInputElement;
			expect(transparentCheckbox.checked).toBe(false);
		});
	});

	describe('Export Action', () => {
		it('export button dispatches event with options', async () => {
			const onExport = vi.fn();

			render(ExportDialog, {
				props: {
					open: true,
					racks: mockRacks,
					selectedRackId: null,
					onexport: (e: CustomEvent) => onExport(e.detail)
				}
			});

			const exportButton = screen.getByRole('button', { name: /^export$/i });
			await fireEvent.click(exportButton);

			expect(onExport).toHaveBeenCalledTimes(1);
			expect(onExport).toHaveBeenCalledWith({
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportMode: 'quick',
				exportView: 'both'
			});
		});

		it('export button includes selected options', async () => {
			const onExport = vi.fn();

			render(ExportDialog, {
				props: {
					open: true,
					racks: mockRacks,
					selectedRackId: 'rack-1',
					onexport: (e: CustomEvent) => onExport(e.detail)
				}
			});

			// Change format to SVG
			const formatSelect = screen.getByLabelText(/format/i);
			await fireEvent.change(formatSelect, { target: { value: 'svg' } });

			// Toggle legend on
			const legendCheckbox = screen.getByLabelText(/include legend/i);
			await fireEvent.click(legendCheckbox);

			// Enable transparent background using the checkbox
			const transparentCheckbox = screen.getByLabelText(/transparent background/i);
			await fireEvent.click(transparentCheckbox);

			const exportButton = screen.getByRole('button', { name: /^export$/i });
			await fireEvent.click(exportButton);

			expect(onExport).toHaveBeenCalledWith({
				format: 'svg',
				scope: 'all',
				includeNames: true,
				includeLegend: true,
				background: 'transparent',
				exportMode: 'quick',
				exportView: 'both'
			});
		});
	});

	describe('Cancel Action', () => {
		it('cancel button dispatches cancel event', async () => {
			const onCancel = vi.fn();

			render(ExportDialog, {
				props: {
					open: true,
					racks: mockRacks,
					selectedRackId: null,
					oncancel: onCancel
				}
			});

			const cancelButton = screen.getByRole('button', { name: /cancel/i });
			await fireEvent.click(cancelButton);

			expect(onCancel).toHaveBeenCalledTimes(1);
		});

		it('escape key dispatches cancel event', async () => {
			const onCancel = vi.fn();

			render(ExportDialog, {
				props: {
					open: true,
					racks: mockRacks,
					selectedRackId: null,
					oncancel: onCancel
				}
			});

			await fireEvent.keyDown(window, { key: 'Escape' });

			expect(onCancel).toHaveBeenCalledTimes(1);
		});
	});

	describe('Export disabled state', () => {
		it('export button disabled when no racks', () => {
			render(ExportDialog, {
				props: { open: true, racks: [], selectedRackId: null }
			});

			const exportButton = screen.getByRole('button', { name: /^export$/i });
			expect(exportButton).toBeDisabled();
		});

		it('export button enabled when racks exist', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const exportButton = screen.getByRole('button', { name: /^export$/i });
			expect(exportButton).not.toBeDisabled();
		});
	});
});
