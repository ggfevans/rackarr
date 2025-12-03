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
				<li>Export as PNG, JPEG, or SVG with optional bundled metadata</li>
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
		gap: 20px;
	}

	.help-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.help-section h4 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--colour-text, #ffffff);
		border-bottom: 1px solid var(--colour-border, #404040);
		padding-bottom: 8px;
	}

	.app-header {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}

	.app-name {
		margin: 0;
		font-size: 24px;
		font-weight: 700;
		color: var(--colour-text, #ffffff);
	}

	.version {
		font-size: 14px;
		color: var(--colour-text-muted, #808080);
	}

	.description {
		margin: 0;
		font-size: 14px;
		color: var(--colour-text-muted);
		line-height: 1.5;
	}

	.shortcuts-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}

	.shortcuts-table th,
	.shortcuts-table td {
		padding: 8px;
		text-align: left;
		border-bottom: 1px solid var(--colour-border, #404040);
	}

	.shortcuts-table th {
		font-weight: 600;
		color: var(--colour-text-muted);
	}

	.shortcuts-table td {
		color: var(--colour-text, #ffffff);
	}

	.key-cell {
		font-family: monospace;
		background: var(--colour-panel, #2d2d2d);
		border-radius: 3px;
		padding: 4px 8px !important;
		white-space: nowrap;
	}

	.features-list {
		margin: 0;
		padding: 0 0 0 20px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 13px;
		color: var(--colour-text-muted);
	}

	.links-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.links-list a {
		color: var(--colour-selection, #0066ff);
		text-decoration: none;
		font-size: 14px;
	}

	.links-list a:hover {
		text-decoration: underline;
	}

	.license {
		margin: 0;
		font-size: 14px;
		color: var(--colour-text-muted);
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 20px;
		padding-top: 16px;
		border-top: 1px solid var(--colour-border, #404040);
	}

	.btn-primary {
		padding: 8px 20px;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		background: var(--colour-selection, #0066ff);
		border: none;
		color: #ffffff;
		transition: background-color 0.15s ease;
	}

	.btn-primary:hover {
		background: #0055dd;
	}
</style>
