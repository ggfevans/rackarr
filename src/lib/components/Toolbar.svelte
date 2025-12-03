<!--
  Toolbar Component
  Main application toolbar with actions, zoom controls, and theme toggle
-->
<script lang="ts">
	import ToolbarButton from './ToolbarButton.svelte';
	import Tooltip from './Tooltip.svelte';
	import {
		IconPlus,
		IconSave,
		IconLoad,
		IconExport,
		IconTrash,
		IconZoomIn,
		IconZoomOut,
		IconFitAll,
		IconSun,
		IconMoon,
		IconHelp,
		IconLabel,
		IconImage,
		IconLogo
	} from './icons';
	import { getCanvasStore } from '$lib/stores/canvas.svelte';
	import type { DisplayMode } from '$lib/types';

	interface Props {
		hasSelection?: boolean;
		theme?: 'dark' | 'light';
		displayMode?: DisplayMode;
		showLabelsOnImages?: boolean;
		onnewrack?: () => void;
		onsave?: () => void;
		onload?: () => void;
		onexport?: () => void;
		ondelete?: () => void;
		onzoomin?: () => void;
		onzoomout?: () => void;
		onfitall?: () => void;
		ontoggletheme?: () => void;
		ontoggledisplaymode?: () => void;
		ontoggleshowlabelsonimages?: () => void;
		onhelp?: () => void;
	}

	let {
		hasSelection = false,
		theme = 'dark',
		displayMode = 'label',
		showLabelsOnImages = false,
		onnewrack,
		onsave,
		onload,
		onexport,
		ondelete,
		onzoomin,
		onzoomout,
		onfitall,
		ontoggletheme,
		ontoggledisplaymode,
		ontoggleshowlabelsonimages,
		onhelp
	}: Props = $props();

	const displayModeLabel = $derived(displayMode === 'label' ? 'Label' : 'Image');

	const canvasStore = getCanvasStore();
</script>

<header class="toolbar">
	<!-- Left section: Branding -->
	<div class="toolbar-section toolbar-left">
		<div class="toolbar-brand">
			<IconLogo size={26} />
			<span>Rackarr</span>
		</div>
	</div>

	<!-- Center section: Main actions -->
	<div class="toolbar-section toolbar-center">
		<Tooltip text="New Rack" shortcut="N" position="bottom">
			<ToolbarButton label="New Rack" onclick={onnewrack}>
				<IconPlus />
			</ToolbarButton>
		</Tooltip>

		<div class="separator" aria-hidden="true"></div>

		<Tooltip text="Save Layout" shortcut="Ctrl+S" position="bottom">
			<ToolbarButton label="Save" onclick={onsave}>
				<IconSave />
			</ToolbarButton>
		</Tooltip>

		<Tooltip text="Load Layout" shortcut="Ctrl+O" position="bottom">
			<ToolbarButton label="Load" onclick={onload}>
				<IconLoad />
			</ToolbarButton>
		</Tooltip>

		<Tooltip text="Export Image" shortcut="Ctrl+E" position="bottom">
			<ToolbarButton label="Export" onclick={onexport}>
				<IconExport />
			</ToolbarButton>
		</Tooltip>

		<div class="separator" aria-hidden="true"></div>

		<Tooltip text="Display Mode: {displayModeLabel}" shortcut="I" position="bottom">
			<ToolbarButton label="Display Mode: {displayModeLabel}" onclick={ontoggledisplaymode}>
				{#if displayMode === 'label'}
					<IconLabel />
				{:else}
					<IconImage />
				{/if}
			</ToolbarButton>
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

		<Tooltip text="Delete Selected" shortcut="Del" position="bottom">
			<ToolbarButton label="Delete" disabled={!hasSelection} onclick={ondelete}>
				<IconTrash />
			</ToolbarButton>
		</Tooltip>
	</div>

	<!-- Right section: Zoom, theme, help -->
	<div class="toolbar-section toolbar-right">
		<Tooltip text="Zoom Out" shortcut="-" position="bottom">
			<ToolbarButton label="Zoom Out" disabled={!canvasStore.canZoomOut} onclick={onzoomout}>
				<IconZoomOut />
			</ToolbarButton>
		</Tooltip>

		<span class="zoom-display">{canvasStore.zoomPercentage}%</span>

		<Tooltip text="Zoom In" shortcut="+" position="bottom">
			<ToolbarButton label="Zoom In" disabled={!canvasStore.canZoomIn} onclick={onzoomin}>
				<IconZoomIn />
			</ToolbarButton>
		</Tooltip>

		<Tooltip text="Fit All Racks" shortcut="F" position="bottom">
			<ToolbarButton label="Fit All" onclick={onfitall}>
				<IconFitAll />
			</ToolbarButton>
		</Tooltip>

		<div class="separator" aria-hidden="true"></div>

		<Tooltip text="Toggle Theme" position="bottom">
			<ToolbarButton label="Toggle Theme" onclick={ontoggletheme}>
				{#if theme === 'dark'}
					<IconSun />
				{:else}
					<IconMoon />
				{/if}
			</ToolbarButton>
		</Tooltip>

		<Tooltip text="Help & Shortcuts" shortcut="?" position="bottom">
			<ToolbarButton label="Help" onclick={onhelp}>
				<IconHelp />
			</ToolbarButton>
		</Tooltip>
	</div>
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
		justify-content: center;
	}

	.toolbar-right {
		flex: 0 0 auto;
	}

	.toolbar-brand {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--colour-text);
		padding: var(--space-2) var(--space-4);
	}

	.separator {
		width: 1px;
		height: var(--space-6);
		background: var(--colour-border);
		margin: 0 var(--space-2);
	}

	.zoom-display {
		min-width: var(--space-12);
		text-align: center;
		font-size: var(--font-size-sm);
		color: var(--colour-text-muted);
		font-variant-numeric: tabular-nums;
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
