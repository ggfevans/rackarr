import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';

// Helper to properly change select value with Svelte reactivity
// In happy-dom, we need to properly select the option and dispatch events
async function changeSelectValue(selectElement: HTMLSelectElement, value: string) {
	// Find and select the option
	const options = selectElement.querySelectorAll('option');
	options.forEach((opt) => {
		if (opt.value === value) {
			opt.selected = true;
		} else {
			opt.selected = false;
		}
	});
	selectElement.value = value;

	// Dispatch events in the order Svelte expects
	selectElement.dispatchEvent(new Event('input', { bubbles: true }));
	selectElement.dispatchEvent(new Event('change', { bubbles: true }));
	await tick();
}
import ExportDialog from '$lib/components/ExportDialog.svelte';
import type { Rack, DeviceType } from '$lib/types';
import * as exportUtils from '$lib/utils/export';

describe('ExportDialog', () => {
	const mockDeviceTypes: DeviceType[] = [
		{
			slug: 'test-server',
			model: 'Test Server',
			u_height: 2,
			rackarr: { colour: '#4A90D9', category: 'server' }
		}
	];

	const mockRacks: Rack[] = [
		{
			name: 'Rack 1',
			height: 42,
			width: 19,
			position: 0,
			desc_units: false,
			form_factor: '4-post',
			starting_unit: 1,
			devices: []
		},
		{
			name: 'Rack 2',
			height: 24,
			width: 19,
			position: 1,
			desc_units: false,
			form_factor: '4-post',
			starting_unit: 1,
			devices: []
		}
	];

	describe('Dialog Visibility', () => {
		it('renders when open=true', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, deviceTypes: mockDeviceTypes, selectedRackId: null }
			});

			expect(screen.getByRole('dialog')).toBeInTheDocument();
			// Check for title (heading element)
			expect(screen.getByRole('heading', { name: /export/i })).toBeInTheDocument();
		});

		it('hidden when open=false', () => {
			render(ExportDialog, {
				props: { open: false, racks: mockRacks, deviceTypes: mockDeviceTypes, selectedRackId: null }
			});

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('Format Options', () => {
		it('shows format options including PDF', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, deviceTypes: mockDeviceTypes, selectedRackId: null }
			});

			const formatSelect = screen.getByLabelText(/format/i);
			expect(formatSelect).toBeInTheDocument();

			// Check format options exist (PNG, JPEG, SVG, PDF)
			expect(screen.getByRole('option', { name: /png/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /jpeg/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /svg/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /pdf/i })).toBeInTheDocument();
		});

		it('defaults to PNG format', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, deviceTypes: mockDeviceTypes, selectedRackId: null }
			});

			const formatSelect = screen.getByLabelText(/format/i) as HTMLSelectElement;
			expect(formatSelect.value).toBe('png');
		});

		it('can select PDF format', async () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, deviceTypes: mockDeviceTypes, selectedRackId: null }
			});

			const formatSelect = screen.getByLabelText(/format/i) as HTMLSelectElement;
			await fireEvent.change(formatSelect, { target: { value: 'pdf' } });
			expect(formatSelect.value).toBe('pdf');
		});
	});

	describe('Include Options', () => {
		it('shows include legend checkbox (default unchecked)', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, deviceTypes: mockDeviceTypes, selectedRackId: null }
			});

			const checkbox = screen.getByLabelText(/include legend/i) as HTMLInputElement;
			expect(checkbox).toBeInTheDocument();
			expect(checkbox.checked).toBe(false);
		});
	});

	describe('Background Options', () => {
		it('shows background dropdown with dark, light options', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, deviceTypes: mockDeviceTypes, selectedRackId: null }
			});

			const bgSelect = screen.getByLabelText(/^background$/i);
			expect(bgSelect).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /dark/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /light/i })).toBeInTheDocument();
		});

		// NOTE: happy-dom doesn't properly trigger Svelte select bindings on change events
		// The transparent checkbox visibility based on format is verified in browser E2E tests
		it.skip('transparent checkbox shown for PNG and SVG formats', async () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, deviceTypes: mockDeviceTypes, selectedRackId: null }
			});

			// Default is PNG - transparent checkbox should be visible
			const transparentCheckbox = screen.getByLabelText(/transparent background/i);
			expect(transparentCheckbox).toBeInTheDocument();

			// Change to SVG format - checkbox should still be visible
			const formatSelect = screen.getByLabelText(/format/i) as HTMLSelectElement;
			await changeSelectValue(formatSelect, 'svg');
			expect(screen.getByLabelText(/transparent background/i)).toBeInTheDocument();

			// Change to JPEG format - checkbox should be hidden
			await changeSelectValue(formatSelect, 'jpeg');
			expect(screen.queryByLabelText(/transparent background/i)).not.toBeInTheDocument();

			// Change to PDF format - checkbox should also be hidden (PDF doesn't support transparency)
			await changeSelectValue(formatSelect, 'pdf');
			expect(screen.queryByLabelText(/transparent background/i)).not.toBeInTheDocument();
		});

		it('transparent checkbox defaults to unchecked', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, deviceTypes: mockDeviceTypes, selectedRackId: null }
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
					deviceTypes: mockDeviceTypes,
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
				exportView: 'both'
			});
		});

		// NOTE: happy-dom doesn't properly trigger Svelte select bindings on change events
		// The export with selected options is verified in browser E2E tests
		it.skip('export button includes selected options', async () => {
			const onExport = vi.fn();

			render(ExportDialog, {
				props: {
					open: true,
					racks: mockRacks,
					deviceTypes: mockDeviceTypes,
					selectedRackId: 'rack-1',
					onexport: (e: CustomEvent) => onExport(e.detail)
				}
			});

			// Change format to SVG
			const formatSelect = screen.getByLabelText(/format/i) as HTMLSelectElement;
			await changeSelectValue(formatSelect, 'svg');

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
					deviceTypes: mockDeviceTypes,
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
					deviceTypes: mockDeviceTypes,
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
				props: { open: true, racks: [], deviceTypes: mockDeviceTypes, selectedRackId: null }
			});

			const exportButton = screen.getByRole('button', { name: /^export$/i });
			expect(exportButton).toBeDisabled();
		});

		it('export button enabled when racks exist', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, deviceTypes: mockDeviceTypes, selectedRackId: null }
			});

			const exportButton = screen.getByRole('button', { name: /^export$/i });
			expect(exportButton).not.toBeDisabled();
		});
	});

	describe('Preview error handling', () => {
		it('displays error message when preview generation fails', async () => {
			// Mock generateExportSVG to throw an error
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			vi.spyOn(exportUtils, 'generateExportSVG').mockImplementation(() => {
				throw new Error('SVG generation failed');
			});

			render(ExportDialog, {
				props: { open: true, racks: mockRacks, deviceTypes: mockDeviceTypes, selectedRackId: null }
			});

			// Wait for the error to appear
			await waitFor(() => {
				expect(screen.getByText(/preview generation failed/i)).toBeInTheDocument();
			});

			// Verify error was logged to console
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
			vi.restoreAllMocks();
		});

		it('shows retry hint when preview fails', async () => {
			vi.spyOn(console, 'error').mockImplementation(() => {});
			vi.spyOn(exportUtils, 'generateExportSVG').mockImplementation(() => {
				throw new Error('Test error');
			});

			render(ExportDialog, {
				props: { open: true, racks: mockRacks, deviceTypes: mockDeviceTypes, selectedRackId: null }
			});

			await waitFor(() => {
				expect(screen.getByText(/try changing export options/i)).toBeInTheDocument();
			});

			vi.restoreAllMocks();
		});
	});
});
