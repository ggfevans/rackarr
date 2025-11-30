<!--
  Toolbar Component
  Main application toolbar with actions, zoom controls, and theme toggle
-->
<script lang="ts">
	import ToolbarButton from './ToolbarButton.svelte';
	import {
		IconPlus,
		IconPalette,
		IconSave,
		IconLoad,
		IconExport,
		IconTrash,
		IconZoomIn,
		IconZoomOut,
		IconFitAll,
		IconSun,
		IconMoon,
		IconHelp
	} from './icons';
	import { getCanvasStore } from '$lib/stores/canvas.svelte';

	interface Props {
		hasSelection?: boolean;
		paletteOpen?: boolean;
		theme?: 'dark' | 'light';
		onnewrack?: () => void;
		ontogglepalette?: () => void;
		onsave?: () => void;
		onload?: () => void;
		onexport?: () => void;
		ondelete?: () => void;
		onzoomin?: () => void;
		onzoomout?: () => void;
		onfitall?: () => void;
		ontoggletheme?: () => void;
		onhelp?: () => void;
	}

	let {
		hasSelection = false,
		paletteOpen = false,
		theme = 'dark',
		onnewrack,
		ontogglepalette,
		onsave,
		onload,
		onexport,
		ondelete,
		onzoomin,
		onzoomout,
		onfitall,
		ontoggletheme,
		onhelp
	}: Props = $props();

	const canvasStore = getCanvasStore();
</script>

<header class="toolbar">
	<!-- Left section: Logo and app name -->
	<div class="toolbar-section toolbar-left">
		<button
			type="button"
			class="logo-button"
			onclick={onhelp}
			aria-label="Rackarr - Click for help"
		>
			<span class="logo-text">Rackarr</span>
		</button>
	</div>

	<!-- Center section: Main actions -->
	<div class="toolbar-section toolbar-center">
		<ToolbarButton label="New Rack" onclick={onnewrack}>
			<IconPlus />
		</ToolbarButton>

		<ToolbarButton
			label="Device Palette"
			active={paletteOpen}
			expanded={paletteOpen}
			onclick={ontogglepalette}
		>
			<IconPalette />
		</ToolbarButton>

		<div class="separator" aria-hidden="true"></div>

		<ToolbarButton label="Save" onclick={onsave}>
			<IconSave />
		</ToolbarButton>

		<ToolbarButton label="Load" onclick={onload}>
			<IconLoad />
		</ToolbarButton>

		<ToolbarButton label="Export" onclick={onexport}>
			<IconExport />
		</ToolbarButton>

		<div class="separator" aria-hidden="true"></div>

		<ToolbarButton label="Delete" disabled={!hasSelection} onclick={ondelete}>
			<IconTrash />
		</ToolbarButton>
	</div>

	<!-- Right section: Zoom, theme, help -->
	<div class="toolbar-section toolbar-right">
		<ToolbarButton label="Zoom Out" disabled={!canvasStore.canZoomOut} onclick={onzoomout}>
			<IconZoomOut />
		</ToolbarButton>

		<span class="zoom-display">{canvasStore.zoomPercentage}%</span>

		<ToolbarButton label="Zoom In" disabled={!canvasStore.canZoomIn} onclick={onzoomin}>
			<IconZoomIn />
		</ToolbarButton>

		<ToolbarButton label="Fit All" onclick={onfitall}>
			<IconFitAll />
		</ToolbarButton>

		<div class="separator" aria-hidden="true"></div>

		<ToolbarButton label="Toggle Theme" onclick={ontoggletheme}>
			{#if theme === 'dark'}
				<IconSun />
			{:else}
				<IconMoon />
			{/if}
		</ToolbarButton>

		<ToolbarButton label="Help" onclick={onhelp}>
			<IconHelp />
		</ToolbarButton>
	</div>
</header>

<style>
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--toolbar-height, 52px);
		padding: 0 16px;
		background: var(--colour-toolbar-bg);
		border-bottom: 1px solid var(--colour-border);
		flex-shrink: 0;
	}

	.toolbar-section {
		display: flex;
		align-items: center;
		gap: 4px;
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

	.logo-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		border-radius: 6px;
		background: transparent;
		color: var(--colour-text);
		cursor: pointer;
		transition: background-color var(--transition-fast);
	}

	.logo-button:hover {
		background: var(--colour-surface-hover);
	}

	.logo-text {
		font-size: 18px;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.separator {
		width: 1px;
		height: 24px;
		background: var(--colour-border);
		margin: 0 8px;
	}

	.zoom-display {
		min-width: 48px;
		text-align: center;
		font-size: 13px;
		color: var(--colour-text-secondary);
		font-variant-numeric: tabular-nums;
	}
</style>
