<!--
  Toolbar Component
  Main application toolbar with actions and theme toggle
-->
<script lang="ts">
	import Tooltip from './Tooltip.svelte';
	import {
		IconPlus,
		IconSave,
		IconLoad,
		IconExport,
		IconTrash,
		IconFitAll,
		IconSun,
		IconMoon,
		IconHelp,
		IconLabel,
		IconImage,
		IconLogo,
		IconUndo,
		IconRedo
	} from './icons';
	import type { DisplayMode } from '$lib/types';
	import { getLayoutStore } from '$lib/stores/layout.svelte';
	import { getToastStore } from '$lib/stores/toast.svelte';

	interface Props {
		hasSelection?: boolean;
		hasRacks?: boolean;
		theme?: 'dark' | 'light';
		displayMode?: DisplayMode;
		showLabelsOnImages?: boolean;
		onnewrack?: () => void;
		onsave?: () => void;
		onload?: () => void;
		onexport?: () => void;
		ondelete?: () => void;
		onfitall?: () => void;
		ontoggletheme?: () => void;
		ontoggledisplaymode?: () => void;
		ontoggleshowlabelsonimages?: () => void;
		onhelp?: () => void;
	}

	let {
		hasSelection = false,
		hasRacks = false,
		theme = 'dark',
		displayMode = 'label',
		showLabelsOnImages = false,
		onnewrack,
		onsave,
		onload,
		onexport,
		ondelete,
		onfitall,
		ontoggletheme,
		ontoggledisplaymode,
		ontoggleshowlabelsonimages,
		onhelp
	}: Props = $props();

	const displayModeLabel = $derived(displayMode === 'label' ? 'Label' : 'Image');

	const layoutStore = getLayoutStore();
	const toastStore = getToastStore();

	function handleUndo() {
		if (!layoutStore.canUndo) return;
		const desc = layoutStore.undoDescription?.replace('Undo: ', '') ?? 'action';
		layoutStore.undo();
		toastStore.showToast(`Undid: ${desc}`, 'info');
	}

	function handleRedo() {
		if (!layoutStore.canRedo) return;
		const desc = layoutStore.redoDescription?.replace('Redo: ', '') ?? 'action';
		layoutStore.redo();
		toastStore.showToast(`Redid: ${desc}`, 'info');
	}
</script>

<header class="toolbar">
	<!-- Left section: Branding -->
	<div class="toolbar-section toolbar-left">
		<div class="toolbar-brand">
			<IconLogo size={36} />
			<span class="brand-name">Rackarr</span>
			<span class="brand-tagline">Rack Layout Designer for Homelabbers</span>
		</div>
	</div>

	<!-- Center section: Main actions -->
	<div class="toolbar-section toolbar-center">
		<Tooltip text="New Rack" shortcut="N" position="bottom">
			<button
				class="toolbar-action-btn"
				class:primary={!hasRacks}
				aria-label="New Rack"
				onclick={onnewrack}
			>
				<IconPlus size={16} />
				<span>New Rack</span>
			</button>
		</Tooltip>

		<Tooltip text="Load Layout" shortcut="Ctrl+O" position="bottom">
			<button class="toolbar-action-btn" aria-label="Load Layout" onclick={onload}>
				<IconLoad size={16} />
				<span>Load Layout</span>
			</button>
		</Tooltip>

		<div class="separator" aria-hidden="true"></div>

		<Tooltip text="Save Layout" shortcut="Ctrl+S" position="bottom">
			<button class="toolbar-action-btn" aria-label="Save" onclick={onsave}>
				<IconSave size={16} />
				<span>Save</span>
			</button>
		</Tooltip>

		<Tooltip text="Export Image" shortcut="Ctrl+E" position="bottom">
			<button class="toolbar-action-btn" aria-label="Export" onclick={onexport}>
				<IconExport size={16} />
				<span>Export</span>
			</button>
		</Tooltip>

		<div class="separator" aria-hidden="true"></div>

		<Tooltip text="Display Mode: {displayModeLabel}" shortcut="I" position="bottom">
			<button
				class="toolbar-action-btn"
				aria-label="Display Mode: {displayModeLabel}"
				onclick={ontoggledisplaymode}
			>
				{#if displayMode === 'label'}
					<IconLabel size={16} />
				{:else}
					<IconImage size={16} />
				{/if}
				<span>{displayModeLabel}</span>
			</button>
		</Tooltip>

		{#if displayMode === 'image'}
			<Tooltip text="Show Labels on Images" position="bottom">
				<label class="checkbox-toggle">
					<input
						type="checkbox"
						checked={showLabelsOnImages}
						onchange={ontoggleshowlabelsonimages}
						aria-label="Show labels on images"
					/>
					<span class="checkbox-label">Labels</span>
				</label>
			</Tooltip>
		{/if}

		<div class="separator" aria-hidden="true"></div>

		<Tooltip text={layoutStore.undoDescription ?? 'Undo'} shortcut="Ctrl+Z" position="bottom">
			<button
				class="toolbar-action-btn"
				aria-label={layoutStore.undoDescription ?? 'Undo'}
				disabled={!layoutStore.canUndo}
				onclick={handleUndo}
			>
				<IconUndo size={16} />
				<span>Undo</span>
			</button>
		</Tooltip>

		<Tooltip text={layoutStore.redoDescription ?? 'Redo'} shortcut="Ctrl+Shift+Z" position="bottom">
			<button
				class="toolbar-action-btn"
				aria-label={layoutStore.redoDescription ?? 'Redo'}
				disabled={!layoutStore.canRedo}
				onclick={handleRedo}
			>
				<IconRedo size={16} />
				<span>Redo</span>
			</button>
		</Tooltip>

		<div class="separator" aria-hidden="true"></div>

		<Tooltip text="Delete Selected" shortcut="Del" position="bottom">
			<button
				class="toolbar-action-btn"
				aria-label="Delete"
				disabled={!hasSelection}
				onclick={ondelete}
			>
				<IconTrash size={16} />
				<span>Delete</span>
			</button>
		</Tooltip>

		<Tooltip text="Fit All Racks" shortcut="F" position="bottom">
			<button class="toolbar-action-btn" aria-label="Fit All" onclick={onfitall}>
				<IconFitAll size={16} />
				<span>Fit All</span>
			</button>
		</Tooltip>

		<div class="separator" aria-hidden="true"></div>

		<Tooltip text="Toggle Theme" position="bottom">
			<button class="toolbar-action-btn" aria-label="Toggle Theme" onclick={ontoggletheme}>
				{#if theme === 'dark'}
					<IconSun size={16} />
					<span>Light</span>
				{:else}
					<IconMoon size={16} />
					<span>Dark</span>
				{/if}
			</button>
		</Tooltip>

		<Tooltip text="Help & Shortcuts" shortcut="?" position="bottom">
			<button class="toolbar-action-btn" aria-label="Help" onclick={onhelp}>
				<IconHelp size={16} />
				<span>Help</span>
			</button>
		</Tooltip>
	</div>

	<!-- Right section: Spacer for balance -->
	<div class="toolbar-section toolbar-right"></div>
</header>

<style>
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--toolbar-height);
		padding: 0 var(--space-4);
		background: var(--colour-toolbar-bg, var(--toolbar-bg));
		border-bottom: 1px solid var(--colour-toolbar-border, var(--toolbar-border));
		flex-shrink: 0;
		position: relative;
	}

	.toolbar-section {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.toolbar-left {
		flex: 0 0 auto;
		z-index: 1;
	}

	.toolbar-center {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: var(--space-1);
		z-index: 2; /* Above toolbar-left to ensure buttons are clickable */
	}

	.toolbar-right {
		flex: 0 0 auto;
		z-index: 1;
	}

	.toolbar-brand {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--colour-text);
		padding: var(--space-2) var(--space-4);
	}

	.brand-name {
		font-size: 1.265rem; /* ~18px × 1.15 = 20.7px */
		font-weight: var(--font-weight-bold);
	}

	.brand-tagline {
		font-size: 0.8rem;
		font-weight: var(--font-weight-normal);
		color: var(--colour-text-muted);
		margin-left: var(--space-2);
		pointer-events: none; /* Prevent intercepting clicks on toolbar buttons */
	}

	.toolbar-action-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--colour-border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--colour-text);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			opacity var(--duration-fast) var(--ease-out);
	}

	.toolbar-action-btn:hover:not(:disabled) {
		background-color: var(--colour-surface-hover);
	}

	.toolbar-action-btn:focus-visible {
		outline: none;
		box-shadow:
			0 0 0 2px var(--colour-bg),
			0 0 0 4px var(--colour-focus-ring);
	}

	.toolbar-action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toolbar-action-btn.primary {
		background: var(--colour-selection);
		border-color: var(--colour-selection);
		color: var(--colour-text-on-primary, #ffffff);
	}

	.toolbar-action-btn.primary:hover:not(:disabled) {
		background: var(--colour-selection-hover);
		border-color: var(--colour-selection-hover);
	}

	.separator {
		width: 1px;
		height: var(--space-6);
		background: var(--colour-border);
		margin: 0 var(--space-2);
	}

	.checkbox-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		color: var(--colour-text-muted);
		font-size: var(--font-size-sm);
	}

	.checkbox-toggle:hover {
		background: var(--colour-bg-hover);
		color: var(--colour-text);
	}

	.checkbox-toggle input[type='checkbox'] {
		width: 14px;
		height: 14px;
		accent-color: var(--colour-selection);
		cursor: pointer;
	}

	.checkbox-label {
		user-select: none;
	}
</style>
