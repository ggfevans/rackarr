<!--
  Help Panel Component
  Shows app information, keyboard shortcuts, and links
-->
<script lang="ts">
	import { VERSION } from '$lib/version';
	import Dialog from './Dialog.svelte';

	interface Props {
		open: boolean;
		onclose?: () => void;
	}

	let { open, onclose }: Props = $props();

	// Keyboard shortcuts
	const shortcuts = [
		{ key: 'Escape', action: 'Clear selection / Close dialog' },
		{ key: 'Delete / Backspace', action: 'Delete selected rack or device' },
		{ key: 'Arrow Up', action: 'Move device up 1U' },
		{ key: 'Arrow Down', action: 'Move device down 1U' },
		{ key: 'I', action: 'Toggle display mode (Label/Image)' },
		{ key: 'A', action: 'Toggle airflow visualization' },
		{ key: 'F', action: 'Fit all (zoom to fit)' },
		{ key: 'Ctrl/Cmd + Z', action: 'Undo' },
		{ key: 'Ctrl/Cmd + Shift + Z', action: 'Redo' },
		{ key: 'Ctrl/Cmd + Y', action: 'Redo (alternative)' },
		{ key: 'Ctrl/Cmd + S', action: 'Save layout (.rackarr.zip)' },
		{ key: 'Ctrl/Cmd + O', action: 'Load layout' },
		{ key: 'Ctrl/Cmd + E', action: 'Export image' },
		{ key: '?', action: 'Show help' }
	];

	// Repository links
	const links = [
		{
			name: 'GitHub Repository',
			url: 'https://github.com/ggfevans/rackarr'
		}
	];

	function handleClose() {
		onclose?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}

	$effect(() => {
		if (open) {
			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	});
</script>

<Dialog {open} title="Help" width="500px" onclose={handleClose}>
	<div class="help-content">
		<section class="help-section">
			<div class="app-header">
				<h3 class="app-name">Rackarr</h3>
				<span class="version">v{VERSION}</span>
			</div>
			<p class="description">
				A visual rack layout designer for homelabbers. Plan and document your server rack
				configurations with an intuitive drag-and-drop interface.
			</p>
		</section>

		<section class="help-section">
			<h4>Features</h4>
			<ul class="features-list">
				<li>Drag and drop devices from the library to build your rack</li>
				<li>10" and 19" rack width support</li>
				<li>Device images (front/rear) with Label/Image display toggle</li>
				<li>Airflow visualization with conflict detection</li>
				<li>Export as PNG, JPEG, SVG, or PDF with optional bundled metadata</li>
				<li>Save layouts as .rackarr.zip with embedded images</li>
			</ul>
		</section>

		<section class="help-section">
			<h4>Keyboard Shortcuts</h4>
			<table class="shortcuts-table">
				<thead>
					<tr>
						<th>Key</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{#each shortcuts as { key, action } (key)}
						<tr>
							<td class="key-cell">{key}</td>
							<td>{action}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>

		<section class="help-section">
			<h4>Links</h4>
			<ul class="links-list">
				{#each links as { name, url } (url)}
					<li>
						<a href={url} target="_blank" rel="noopener noreferrer">{name}</a>
					</li>
				{/each}
			</ul>
		</section>

		<section class="help-section">
			<h4>License</h4>
			<p class="license">MIT License</p>
		</section>
	</div>

	<div class="dialog-actions">
		<button type="button" class="btn-primary" onclick={handleClose} aria-label="Close">
			Close
		</button>
	</div>
</Dialog>

<style>
	.help-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.help-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.help-section h4 {
		margin: 0;
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--colour-text);
		border-bottom: 1px solid var(--colour-border);
		padding-bottom: var(--space-2);
	}

	.app-header {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.app-name {
		margin: 0;
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--colour-text);
	}

	.version {
		font-size: var(--font-size-base);
		color: var(--colour-text-muted);
	}

	.description {
		margin: 0;
		font-size: var(--font-size-base);
		color: var(--colour-text-muted);
		line-height: 1.5;
	}

	.shortcuts-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--font-size-sm);
	}

	.shortcuts-table th,
	.shortcuts-table td {
		padding: var(--space-2);
		text-align: left;
		border-bottom: 1px solid var(--colour-border);
	}

	.shortcuts-table th {
		font-weight: 600;
		color: var(--colour-text-muted);
	}

	.shortcuts-table td {
		color: var(--colour-text);
	}

	.key-cell {
		font-family: monospace;
		background: var(--colour-surface);
		border-radius: var(--radius-sm);
		padding: 4px var(--space-2) !important;
		white-space: nowrap;
	}

	.features-list {
		margin: 0;
		padding: 0 0 0 var(--space-5);
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: var(--font-size-sm);
		color: var(--colour-text-muted);
	}

	.links-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.links-list a {
		color: var(--colour-selection);
		text-decoration: none;
		font-size: var(--font-size-base);
	}

	.links-list a:hover {
		text-decoration: underline;
	}

	.license {
		margin: 0;
		font-size: var(--font-size-base);
		color: var(--colour-text-muted);
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: var(--space-5);
		padding-top: var(--space-4);
		border-top: 1px solid var(--colour-border);
	}

	.btn-primary {
		padding: var(--space-2) var(--space-5);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-base);
		font-weight: 500;
		cursor: pointer;
		background: var(--colour-selection);
		border: none;
		color: var(--neutral-50);
		transition: background-color 0.15s ease;
	}

	.btn-primary:hover {
		background: var(--colour-selection-hover);
	}
</style>
