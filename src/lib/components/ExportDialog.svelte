<!--
  Export Dialog Component
  Allows user to configure export options for rack layouts
-->
<script lang="ts">
	import type { Rack, ExportFormat, ExportBackground, ExportOptions, ExportView } from '$lib/types';
	import Dialog from './Dialog.svelte';

	interface Props {
		open: boolean;
		racks: Rack[];
		selectedRackId: string | null;
		onexport?: (event: CustomEvent<ExportOptions>) => void;
		oncancel?: () => void;
	}

	let { open, racks, selectedRackId: _selectedRackId, onexport, oncancel }: Props = $props();

	// Form state
	let format = $state<ExportFormat>('png');
	let includeLegend = $state(false);
	let background = $state<ExportBackground>('dark');
	let exportView = $state<ExportView>('both');
	let transparent = $state(false);

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

	function handleExport() {
		// Use transparent background if checkbox is checked, otherwise use selected background
		const effectiveBackground = transparent ? 'transparent' : background;

		const options: ExportOptions = {
			format,
			scope: 'all',
			includeNames: true,
			includeLegend,
			background: effectiveBackground,
			exportView
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
