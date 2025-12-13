<!--
  Export Dialog Component
  Allows user to configure export options for rack layouts
-->
<script lang="ts">
	import type {
		Rack,
		ExportFormat,
		ExportBackground,
		ExportOptions,
		ExportView,
		DeviceType,
		DisplayMode
	} from '$lib/types';
	import type { ImageStoreMap } from '$lib/types/images';
	import Dialog from './Dialog.svelte';
	import { generateExportSVG } from '$lib/utils/export';

	interface Props {
		open: boolean;
		racks: Rack[];
		deviceTypes: DeviceType[];
		images?: ImageStoreMap;
		displayMode?: DisplayMode;
		selectedRackId: string | null;
		onexport?: (event: CustomEvent<ExportOptions>) => void;
		oncancel?: () => void;
	}

	let {
		open,
		racks,
		deviceTypes,
		images,
		displayMode = 'label',
		selectedRackId: _selectedRackId,
		onexport,
		oncancel
	}: Props = $props();

	// Form state
	let format = $state<ExportFormat>('png');
	let includeLegend = $state(false);
	let showAirflow = $state(false);
	let background = $state<ExportBackground>('dark');
	let exportView = $state<ExportView>('both');
	let transparent = $state(false);

	// Computed: Is CSV format (data export - no image options)
	const isCSV = $derived(format === 'csv');

	// Computed: Can select transparent background (PNG and SVG only)
	const canSelectTransparent = $derived(format === 'svg' || format === 'png');

	// Computed: Can export (has racks)
	const canExport = $derived(racks.length > 0);

	// Reset transparent when switching to format that doesn't support it
	$effect(() => {
		if (!canSelectTransparent && transparent) {
			transparent = false;
		}
	});

	// Preview SVG state
	let previewSvgString = $state<string | null>(null);
	let previewDimensions = $state<{ width: number; height: number } | null>(null);

	// Generate preview when options change (for non-CSV formats)
	$effect(() => {
		if (!open || isCSV || racks.length === 0) {
			previewSvgString = null;
			previewDimensions = null;
			return;
		}

		// Build preview options
		const effectiveBackground = transparent ? 'transparent' : background;
		const previewOptions: ExportOptions = {
			format: 'svg', // Always generate as SVG for preview
			scope: 'all',
			includeNames: true,
			includeLegend,
			background: effectiveBackground,
			exportView,
			displayMode,
			airflowMode: showAirflow
		};

		try {
			const svg = generateExportSVG(racks, deviceTypes, previewOptions, images);
			const width = parseInt(svg.getAttribute('width') || '0', 10);
			const height = parseInt(svg.getAttribute('height') || '0', 10);

			previewDimensions = { width, height };
			previewSvgString = svg.outerHTML;
		} catch {
			previewSvgString = null;
			previewDimensions = null;
		}
	});

	function handleExport() {
		// Use transparent background if checkbox is checked, otherwise use selected background
		const effectiveBackground = transparent ? 'transparent' : background;

		const options: ExportOptions = {
			format,
			scope: 'all',
			includeNames: true,
			includeLegend,
			background: effectiveBackground,
			exportView,
			airflowMode: showAirflow
		};
		onexport?.(new CustomEvent('export', { detail: options }));
	}

	function handleCancel() {
		oncancel?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		}
	}

	// Add/remove event listener based on open state
	$effect(() => {
		if (open) {
			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	});
</script>

<Dialog {open} title="Export" width="380px" onclose={handleCancel}>
	<div class="export-form">
		<div class="form-group">
			<label for="export-format">Format</label>
			<select id="export-format" bind:value={format}>
				<option value="png">PNG</option>
				<option value="jpeg">JPEG</option>
				<option value="svg">SVG</option>
				<option value="pdf">PDF</option>
				<option value="csv">CSV (Spreadsheet)</option>
			</select>
		</div>

		{#if isCSV}
			<p class="csv-info">
				Exports rack contents as a spreadsheet with device positions, names, models, and categories.
			</p>
		{:else}
			<div class="form-group">
				<label for="export-view">View</label>
				<select id="export-view" bind:value={exportView}>
					<option value="both">Front & Rear (Side-by-Side)</option>
					<option value="front">Front Only</option>
					<option value="rear">Rear Only</option>
				</select>
			</div>

			<div class="form-group checkbox-group">
				<label>
					<input type="checkbox" bind:checked={includeLegend} />
					Include legend
				</label>
			</div>

			<div class="form-group checkbox-group">
				<label>
					<input type="checkbox" bind:checked={showAirflow} />
					Show airflow indicators
				</label>
			</div>

			<div class="form-group">
				<label for="export-background">Background</label>
				<select id="export-background" bind:value={background} disabled={transparent}>
					<option value="dark">Dark</option>
					<option value="light">Light</option>
				</select>
			</div>

			{#if canSelectTransparent}
				<div class="form-group checkbox-group">
					<label>
						<input type="checkbox" bind:checked={transparent} />
						Transparent background
					</label>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Preview area -->
	{#if !isCSV}
		<div class="preview-section">
			<span class="preview-label">Preview</span>
			{#if racks.length === 0}
				<div class="preview-placeholder">No rack to preview</div>
			{:else if previewSvgString && previewDimensions}
				<div
					class="preview-container"
					class:transparent-bg={transparent}
					style="aspect-ratio: {previewDimensions.width} / {previewDimensions.height};"
				>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: SVG generated by our own generateExportSVG function -->
					{@html previewSvgString}
				</div>
			{/if}
		</div>
	{/if}

	<div class="dialog-actions">
		<button type="button" class="btn-secondary" onclick={handleCancel}>Cancel</button>
		<button type="button" class="btn-primary" onclick={handleExport} disabled={!canExport}>
			Export
		</button>
	</div>
</Dialog>

<style>
	.export-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-2) 0;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1-5);
	}

	.form-group label {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--colour-text);
	}

	.form-group select {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--colour-border);
		border-radius: var(--radius-sm);
		background: var(--input-bg);
		color: var(--colour-text);
		font-size: var(--font-size-base);
		cursor: pointer;
	}

	.form-group select:focus {
		outline: 2px solid var(--colour-selection);
		outline-offset: 1px;
	}

	.form-group select option:disabled {
		color: var(--colour-text-muted);
	}

	.csv-info {
		color: var(--colour-text-muted);
		font-size: var(--font-size-sm);
		line-height: 1.5;
		margin: 0;
		padding: var(--space-2) 0;
	}

	.preview-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.preview-label {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--colour-text-muted);
	}

	.preview-container {
		max-width: 200px;
		max-height: 300px;
		border: 1px solid var(--colour-border);
		border-radius: var(--radius-sm);
		overflow: hidden;
		background: var(--colour-surface);
	}

	.preview-container.transparent-bg {
		/* Checkerboard pattern for transparent background preview */
		background-image:
			linear-gradient(45deg, #808080 25%, transparent 25%),
			linear-gradient(-45deg, #808080 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #808080 75%),
			linear-gradient(-45deg, transparent 75%, #808080 75%);
		background-size: 10px 10px;
		background-position:
			0 0,
			0 5px,
			5px -5px,
			-5px 0;
	}

	.preview-container :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	.preview-placeholder {
		max-width: 200px;
		height: 100px;
		border: 1px dashed var(--colour-border);
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--colour-text-muted);
		font-size: var(--font-size-sm);
	}

	.checkbox-group {
		flex-direction: row;
		align-items: center;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
		font-weight: var(--font-weight-normal);
	}

	.checkbox-group input[type='checkbox'] {
		width: var(--space-4);
		height: var(--space-4);
		accent-color: var(--colour-selection);
		cursor: pointer;
	}

	.form-group select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		margin-top: var(--space-6);
		padding-top: var(--space-4);
		border-top: 1px solid var(--colour-border);
	}

	.btn-secondary,
	.btn-primary {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) ease,
			opacity var(--duration-fast) ease;
	}

	.btn-secondary {
		background: transparent;
		border: 1px solid var(--colour-border);
		color: var(--colour-text);
	}

	.btn-secondary:hover {
		background: var(--colour-surface-hover);
	}

	.btn-primary {
		background: var(--colour-selection);
		border: none;
		color: var(--neutral-50);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--colour-selection-hover);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
