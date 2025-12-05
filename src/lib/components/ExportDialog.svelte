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
		ExportMode,
		ExportView,
		BundledExportOptions
	} from '$lib/types';
	import Dialog from './Dialog.svelte';

	interface Props {
		open: boolean;
		racks: Rack[];
		selectedRackId: string | null;
		onexport?: (event: CustomEvent<ExportOptions | BundledExportOptions>) => void;
		oncancel?: () => void;
	}

	let { open, racks, selectedRackId: _selectedRackId, onexport, oncancel }: Props = $props();

	// Form state
	let format = $state<ExportFormat>('png');
	let includeLegend = $state(false);
	let background = $state<ExportBackground>('dark');
	let exportMode = $state<ExportMode>('quick');
	let exportView = $state<ExportView>('both');
	let transparent = $state(false);

	// Computed: Can select transparent background (PNG and SVG only)
	const canSelectTransparent = $derived(format === 'svg' || format === 'png');

	// Computed: Can export (has racks)
	const canExport = $derived(racks.length > 0);

	// Computed: Show bundled options
	const isBundled = $derived(exportMode === 'bundled');

	// Reset transparent when switching to format that doesn't support it
	$effect(() => {
		if (!canSelectTransparent && transparent) {
			transparent = false;
		}
	});

	function handleExport() {
		// Use transparent background if checkbox is checked, otherwise use selected background
		const effectiveBackground = transparent ? 'transparent' : background;

		if (exportMode === 'bundled') {
			const options: BundledExportOptions = {
				format,
				scope: 'all',
				includeNames: true,
				includeLegend,
				background: effectiveBackground,
				exportMode: 'bundled',
				includeSource: true, // Always include source in bundled export
				exportView
			};
			onexport?.(new CustomEvent('export', { detail: options }));
		} else {
			const options: ExportOptions = {
				format,
				scope: 'all',
				includeNames: true,
				includeLegend,
				background: effectiveBackground,
				exportMode: 'quick',
				exportView
			};
			onexport?.(new CustomEvent('export', { detail: options }));
		}
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
			<label for="export-mode">Export Mode</label>
			<select id="export-mode" bind:value={exportMode}>
				<option value="quick">Single Image</option>
				<option value="bundled">Bundled (ZIP with Metadata)</option>
			</select>
		</div>

		{#if !isBundled}
			<div class="form-group">
				<label for="export-format">Format</label>
				<select id="export-format" bind:value={format}>
					<option value="png">PNG</option>
					<option value="jpeg">JPEG</option>
					<option value="svg">SVG</option>
				</select>
			</div>

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
		{:else}
			<p class="bundled-description">
				Exports all formats (PNG, JPEG, SVG) with metadata and source file in a single ZIP archive.
			</p>
		{/if}
	</div>

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
		gap: 16px;
		padding: 8px 0;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-group label {
		font-size: 14px;
		font-weight: 500;
		color: var(--colour-text, #ffffff);
	}

	.form-group select {
		padding: 8px 12px;
		border: 1px solid var(--colour-border, #404040);
		border-radius: 4px;
		background: var(--colour-panel, #2d2d2d);
		color: var(--colour-text, #ffffff);
		font-size: 14px;
		cursor: pointer;
	}

	.form-group select:focus {
		outline: 2px solid var(--colour-selection, #0066ff);
		outline-offset: 1px;
	}

	.form-group select option:disabled {
		color: var(--colour-text-muted, #808080);
	}

	.checkbox-group {
		flex-direction: row;
		align-items: center;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		font-weight: 400;
	}

	.checkbox-group input[type='checkbox'] {
		width: 16px;
		height: 16px;
		accent-color: var(--colour-selection, #0066ff);
		cursor: pointer;
	}

	.bundled-description {
		font-size: 14px;
		color: var(--colour-text-muted, #808080);
		margin: 8px 0 0 0;
		padding: 12px;
		background: var(--colour-surface, #252525);
		border-radius: 4px;
		line-height: 1.5;
	}

	.form-group select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 24px;
		padding-top: 16px;
		border-top: 1px solid var(--colour-border, #404040);
	}

	.btn-secondary,
	.btn-primary {
		padding: 8px 16px;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			opacity 0.15s ease;
	}

	.btn-secondary {
		background: transparent;
		border: 1px solid var(--colour-border, #404040);
		color: var(--colour-text, #ffffff);
	}

	.btn-secondary:hover {
		background: var(--colour-hover, #3d3d3d);
	}

	.btn-primary {
		background: var(--colour-selection, #0066ff);
		border: none;
		color: #ffffff;
	}

	.btn-primary:hover:not(:disabled) {
		background: #0055dd;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
