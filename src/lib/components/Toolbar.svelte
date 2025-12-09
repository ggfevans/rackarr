<!--
  Toolbar Component
  Main application toolbar with actions and theme toggle
-->
<script lang="ts">
	import Tooltip from './Tooltip.svelte';
	import ToolbarDrawer from './ToolbarDrawer.svelte';
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
		IconRedo,
		IconMenu,
		IconWind
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
		airflowMode?: boolean;
		onnewrack?: () => void;
		onsave?: () => void;
		onload?: () => void;
		onexport?: () => void;
		ondelete?: () => void;
		onfitall?: () => void;
		ontoggletheme?: () => void;
		ontoggledisplaymode?: () => void;
		ontoggleshowlabelsonimages?: () => void;
		ontoggleairflowmode?: () => void;
		onhelp?: () => void;
	}

	let {
		hasSelection = false,
		hasRacks = false,
		theme = 'dark',
		displayMode = 'label',
		showLabelsOnImages = false,
		airflowMode = false,
		onnewrack,
		onsave,
		onload,
		onexport,
		ondelete,
		onfitall,
		ontoggletheme,
		ontoggledisplaymode,
		ontoggleshowlabelsonimages,
		ontoggleairflowmode,
		onhelp
	}: Props = $props();

	const displayModeLabel = $derived(displayMode === 'label' ? 'Label' : 'Image');

	const layoutStore = getLayoutStore();
	const toastStore = getToastStore();

	// Drawer state for hamburger menu
	let drawerOpen = $state(false);
	let brandRef: HTMLElement | null = $state(null);

	// Track if we're in hamburger mode (< 1024px)
	let isHamburgerMode = $state(false);

	// Set up media query listener on mount
	$effect(() => {
		const mediaQuery = window.matchMedia('(max-width: 1023px)');
		isHamburgerMode = mediaQuery.matches;

		const handleChange = (e: MediaQueryListEvent) => {
			isHamburgerMode = e.matches;
			// Close drawer if switching to full mode
			if (!e.matches) {
				drawerOpen = false;
			}
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	});

	function toggleDrawer() {
		// Only toggle drawer in hamburger mode
		if (isHamburgerMode) {
			drawerOpen = !drawerOpen;
		}
	}

	function closeDrawer() {
		drawerOpen = false;
		// Return focus to brand/hamburger button
		brandRef?.focus();
	}

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
		{#if isHamburgerMode}
			<button
				bind:this={brandRef}
				class="toolbar-brand hamburger-mode"
				type="button"
				aria-expanded={drawerOpen}
				aria-controls="toolbar-drawer"
				aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
				onclick={toggleDrawer}
			>
				<IconLogo size={36} />
				<span class="brand-name">Rackarr</span>
				<span class="hamburger-icon" aria-hidden="true">
					<IconMenu size={20} />
				</span>
			</button>
		{:else}
			<div class="toolbar-brand">
				<IconLogo size={36} />
				<span class="brand-name">Rackarr</span>
			</div>
		{/if}
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

		<Tooltip text="Toggle Airflow View" shortcut="A" position="bottom">
			<button
				class="toolbar-action-btn"
				class:active={airflowMode}
				aria-label="Toggle Airflow View"
				aria-pressed={airflowMode}
				onclick={ontoggleairflowmode}
			>
				<IconWind size={16} />
				<span>Airflow</span>
			</button>
		</Tooltip>

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

		<Tooltip text="Reset View" shortcut="F" position="bottom">
			<button class="toolbar-action-btn" aria-label="Reset View" onclick={onfitall}>
				<IconFitAll size={16} />
				<span>Reset View</span>
			</button>
		</Tooltip>

		<div class="separator" aria-hidden="true"></div>

		<Tooltip text="Help & Shortcuts" shortcut="?" position="bottom">
			<button class="toolbar-action-btn" aria-label="Help" onclick={onhelp}>
				<IconHelp size={16} />
				<span>Help</span>
			</button>
		</Tooltip>
	</div>

	<!-- Right section: Theme toggle (always visible) -->
	<div class="toolbar-section toolbar-right">
		<Tooltip text="Toggle Theme" position="bottom">
			<button
				class="toolbar-action-btn theme-toggle-btn"
				aria-label="Toggle Theme"
				onclick={ontoggletheme}
			>
				{#if theme === 'dark'}
					<IconSun size={16} />
					<span>Light</span>
				{:else}
					<IconMoon size={16} />
					<span>Dark</span>
				{/if}
			</button>
		</Tooltip>
	</div>
</header>

<!-- Toolbar Drawer (hamburger menu) -->
<ToolbarDrawer
	open={drawerOpen}
	{displayMode}
	{airflowMode}
	canUndo={layoutStore.canUndo}
	canRedo={layoutStore.canRedo}
	{hasSelection}
	undoDescription={layoutStore.undoDescription ?? 'Undo'}
	redoDescription={layoutStore.redoDescription ?? 'Redo'}
	onclose={closeDrawer}
	{onnewrack}
	{onsave}
	{onload}
	{onexport}
	{ondelete}
	{onfitall}
	{ontoggledisplaymode}
	{ontoggleairflowmode}
	{onhelp}
	onundo={handleUndo}
	onredo={handleRedo}
/>

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
	}

	.toolbar-center {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-1);
	}

	.toolbar-right {
		flex: 0 0 auto;
	}

	.toolbar-brand {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--colour-text);
		padding: var(--space-2) var(--space-4) var(--space-2) 0;
		cursor: default;
		border-radius: var(--radius-md);
		transition: background-color var(--duration-fast) var(--ease-out);
		/* Reset button styles */
		background: transparent;
		border: none;
		font: inherit;
	}

	/* Hamburger icon hidden by default */
	.hamburger-icon {
		display: none;
		align-items: center;
		justify-content: center;
		color: var(--colour-text-muted);
	}

	.brand-name {
		font-size: 1.265rem; /* ~18px × 1.15 = 20.7px */
		font-weight: var(--font-weight-bold);
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
		white-space: nowrap;
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
		color: var(--colour-text-on-primary);
	}

	.toolbar-action-btn.primary:hover:not(:disabled) {
		background: var(--colour-selection-hover);
		border-color: var(--colour-selection-hover);
	}

	.toolbar-action-btn.active {
		background: var(--colour-surface-active);
		border-color: var(--colour-selection);
		color: var(--colour-selection);
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

	/* Responsive: Medium screens - icon-only buttons */
	@media (max-width: 1000px) {
		.toolbar-action-btn span {
			display: none;
		}

		.toolbar-action-btn {
			padding: var(--space-2);
		}

		.checkbox-toggle .checkbox-label {
			display: none;
		}

		.separator {
			margin: 0 var(--space-1);
		}
	}

	/* Responsive: Hamburger mode - hide center toolbar, show hamburger icon */
	@media (max-width: 1023px) {
		.toolbar-center {
			display: none;
		}

		/* Keep theme toggle icon-only in hamburger mode */
		.theme-toggle-btn span {
			display: none;
		}

		.theme-toggle-btn {
			padding: var(--space-2);
		}
	}

	/* Hamburger mode button styles (applied via JS class) */
	.toolbar-brand.hamburger-mode {
		cursor: pointer;
		padding: var(--space-2);
		border: 1px solid var(--colour-border);
		border-radius: var(--radius-md);
		background: transparent;
	}

	.toolbar-brand.hamburger-mode .hamburger-icon {
		display: flex;
	}

	.toolbar-brand.hamburger-mode:hover {
		background: var(--colour-surface-hover);
		border-color: var(--colour-border-hover, var(--colour-border));
	}

	.toolbar-brand.hamburger-mode:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--colour-focus-ring);
	}

	/* Responsive: Small screens - icon-only branding */
	@media (max-width: 600px) {
		.brand-name {
			display: none;
		}

		.toolbar-brand {
			padding: var(--space-2);
		}
	}
</style>
