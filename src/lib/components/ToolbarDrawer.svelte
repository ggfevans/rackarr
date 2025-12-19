<!--
  ToolbarDrawer Component
  Left drawer menu for toolbar actions at narrow viewports
-->
<script lang="ts">
	import {
		IconPlus,
		IconSave,
		IconLoad,
		IconExport,
		IconShare,
		IconTrash,
		IconFitAll,
		IconHelp,
		IconLabel,
		IconImage,
		IconUndo,
		IconRedo
	} from './icons';
	import type { DisplayMode } from '$lib/types';

	interface Props {
		open?: boolean;
		displayMode?: DisplayMode;
		canUndo?: boolean;
		canRedo?: boolean;
		hasSelection?: boolean;
		hasRacks?: boolean;
		undoDescription?: string;
		redoDescription?: string;
		onclose?: () => void;
		onnewrack?: () => void;
		onsave?: () => void;
		onload?: () => void;
		onexport?: () => void;
		onshare?: () => void;
		ondelete?: () => void;
		onfitall?: () => void;
		ontoggledisplaymode?: () => void;
		onhelp?: () => void;
		onundo?: () => void;
		onredo?: () => void;
	}

	let {
		open = false,
		displayMode = 'label',
		canUndo = false,
		canRedo = false,
		hasSelection = false,
		hasRacks = false,
		undoDescription = 'Undo',
		redoDescription = 'Redo',
		onclose,
		onnewrack,
		onsave,
		onload,
		onexport,
		onshare,
		ondelete,
		onfitall,
		ontoggledisplaymode,
		onhelp,
		onundo,
		onredo
	}: Props = $props();

	let firstFocusableRef: HTMLButtonElement | null = $state(null);

	const displayModeLabel = $derived(displayMode === 'label' ? 'Label Mode' : 'Image Mode');

	function handleAction(action: (() => void) | undefined) {
		if (action) {
			action();
		}
		onclose?.();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onclose?.();
		}
	}

	function handleBackdropClick() {
		onclose?.();
	}

	// Focus first item when drawer opens
	$effect(() => {
		if (open && firstFocusableRef) {
			// Small delay to ensure drawer is visible
			requestAnimationFrame(() => {
				firstFocusableRef?.focus();
			});
		}
	});
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

<!-- Backdrop -->
{#if open}
	<button
		class="drawer-backdrop"
		class:visible={open}
		onclick={handleBackdropClick}
		aria-label="Close menu"
		tabindex="-1"
	></button>
{/if}

<!-- Drawer -->
<div
	class="toolbar-drawer"
	class:open
	role="dialog"
	aria-modal="true"
	aria-label="Navigation menu"
	aria-hidden={!open}
>
	<nav class="drawer-nav">
		<!-- File Group -->
		<section class="drawer-group">
			<h3 class="drawer-group-title">File</h3>
			<button
				bind:this={firstFocusableRef}
				class="drawer-item"
				aria-label="New Rack"
				onclick={() => handleAction(onnewrack)}
			>
				<IconPlus size={18} />
				<span>New Rack</span>
				<kbd class="drawer-shortcut">N</kbd>
			</button>
			<button class="drawer-item" aria-label="Load Layout" onclick={() => handleAction(onload)}>
				<IconLoad size={18} />
				<span>Load Layout</span>
				<kbd class="drawer-shortcut">Ctrl+O</kbd>
			</button>
			<button class="drawer-item" aria-label="Save" onclick={() => handleAction(onsave)}>
				<IconSave size={18} />
				<span>Save</span>
				<kbd class="drawer-shortcut">Ctrl+S</kbd>
			</button>
			<button class="drawer-item" aria-label="Export" onclick={() => handleAction(onexport)}>
				<IconExport size={18} />
				<span>Export</span>
				<kbd class="drawer-shortcut">Ctrl+E</kbd>
			</button>
			<button
				class="drawer-item"
				aria-label="Share"
				onclick={() => handleAction(onshare)}
				disabled={!hasRacks}
			>
				<IconShare size={18} />
				<span>Share</span>
			</button>
		</section>

		<!-- Edit Group -->
		<section class="drawer-group">
			<h3 class="drawer-group-title">Edit</h3>
			<button
				class="drawer-item"
				aria-label={undoDescription}
				onclick={() => handleAction(onundo)}
				disabled={!canUndo}
			>
				<IconUndo size={18} />
				<span>{undoDescription}</span>
				<kbd class="drawer-shortcut">Ctrl+Z</kbd>
			</button>
			<button
				class="drawer-item"
				aria-label={redoDescription}
				onclick={() => handleAction(onredo)}
				disabled={!canRedo}
			>
				<IconRedo size={18} />
				<span>{redoDescription}</span>
				<kbd class="drawer-shortcut">Ctrl+Shift+Z</kbd>
			</button>
			<button
				class="drawer-item"
				aria-label="Delete"
				onclick={() => handleAction(ondelete)}
				disabled={!hasSelection}
			>
				<IconTrash size={18} />
				<span>Delete</span>
				<kbd class="drawer-shortcut">Del</kbd>
			</button>
		</section>

		<!-- View Group -->
		<section class="drawer-group">
			<h3 class="drawer-group-title">View</h3>
			<button
				class="drawer-item"
				aria-label={displayModeLabel}
				onclick={() => handleAction(ontoggledisplaymode)}
			>
				{#if displayMode === 'label'}
					<IconLabel size={18} />
				{:else}
					<IconImage size={18} />
				{/if}
				<span>{displayModeLabel}</span>
				<kbd class="drawer-shortcut">I</kbd>
			</button>
			<button class="drawer-item" aria-label="Reset View" onclick={() => handleAction(onfitall)}>
				<IconFitAll size={18} />
				<span>Reset View</span>
				<kbd class="drawer-shortcut">F</kbd>
			</button>
			<button class="drawer-item" aria-label="About" onclick={() => handleAction(onhelp)}>
				<IconHelp size={18} />
				<span>About</span>
				<kbd class="drawer-shortcut">?</kbd>
			</button>
		</section>
	</nav>
</div>

<style>
	.toolbar-drawer {
		position: fixed;
		top: var(--toolbar-height);
		right: 0;
		width: var(--drawer-width);
		max-width: 85vw;
		height: calc(100vh - var(--toolbar-height));
		background: var(--colour-surface);
		border-left: 1px solid var(--colour-border);
		transform: translateX(100%);
		transition: transform var(--duration-normal) var(--ease-out);
		z-index: var(--z-drawer);
		overflow-y: auto;
		box-shadow: var(--shadow-lg);
	}

	.toolbar-drawer.open {
		transform: translateX(0);
	}

	.drawer-backdrop {
		position: fixed;
		inset: 0;
		top: var(--toolbar-height);
		background: rgba(0, 0, 0, 0.5);
		opacity: 0;
		visibility: hidden;
		transition:
			opacity var(--duration-normal) var(--ease-out),
			visibility var(--duration-normal);
		z-index: var(--z-drawer-backdrop);
		border: none;
		cursor: default;
	}

	.drawer-backdrop.visible {
		opacity: 1;
		visibility: visible;
	}

	.drawer-nav {
		display: flex;
		flex-direction: column;
	}

	.drawer-group {
		padding: var(--space-4);
		border-bottom: 1px solid var(--colour-border);
	}

	.drawer-group:last-child {
		border-bottom: none;
	}

	.drawer-group-title {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--colour-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 var(--space-2) 0;
		padding: 0 var(--space-2);
	}

	.drawer-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-3) var(--space-2);
		border: none;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--colour-text);
		font-size: var(--font-size-base);
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-out);
		text-align: left;
	}

	.drawer-item:hover:not(:disabled) {
		background: var(--colour-surface-hover);
	}

	.drawer-item:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--colour-focus-ring);
	}

	.drawer-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.drawer-item span {
		flex: 1;
	}

	.drawer-shortcut {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		color: var(--colour-text-muted);
		background: var(--colour-surface-raised);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}
</style>
