<!--
  Rack SVG Component
  Renders a rack visualization with U labels, grid lines, and selection state
-->
<script lang="ts">
	import type { Rack as RackType, Device } from '$lib/types';

	interface Props {
		rack: RackType;
		deviceLibrary: Device[];
		selected: boolean;
		zoom: number;
		onselect?: (event: CustomEvent<{ rackId: string }>) => void;
	}

	// deviceLibrary will be used in a future PR for rendering devices
	let { rack, deviceLibrary: _deviceLibrary, selected, zoom, onselect }: Props = $props();

	// CSS custom property values (fallbacks match app.css)
	const U_HEIGHT = 22;
	const RACK_WIDTH = 220;
	const RAIL_WIDTH = 24;
	const RACK_PADDING = 4;
	const NAME_HEIGHT = 28;

	// Calculated dimensions
	const totalHeight = $derived(rack.height * U_HEIGHT);
	const viewBoxHeight = $derived(totalHeight + NAME_HEIGHT);
	const interiorWidth = $derived(RACK_WIDTH - RAIL_WIDTH * 2);
	const zoomScale = $derived(zoom / 100);

	// Generate U labels (1 at bottom, rack.height at top)
	const uLabels = $derived(
		Array.from({ length: rack.height }, (_, i) => {
			const uNumber = rack.height - i;
			const yPosition = i * U_HEIGHT + U_HEIGHT / 2 + RACK_PADDING;
			return { uNumber, yPosition };
		})
	);

	function handleClick() {
		onselect?.(new CustomEvent('select', { detail: { rackId: rack.id } }));
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onselect?.(new CustomEvent('select', { detail: { rackId: rack.id } }));
		}
	}
</script>

<div class="rack-container" style="transform: scale({zoomScale}); transform-origin: top left;">
	<!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
	<svg
		width={RACK_WIDTH}
		height={viewBoxHeight}
		viewBox="0 0 {RACK_WIDTH} {viewBoxHeight}"
		role="img"
		aria-label="{rack.name}, {rack.height}U rack"
		tabindex="0"
		onclick={handleClick}
		onkeydown={handleKeyDown}
	>
		<!-- Rack background (interior) -->
		<rect
			x={RAIL_WIDTH}
			y={RACK_PADDING}
			width={interiorWidth}
			height={totalHeight}
			class="rack-interior"
		/>

		<!-- Left rail -->
		<rect x="0" y={RACK_PADDING} width={RAIL_WIDTH} height={totalHeight} class="rack-rail" />

		<!-- Right rail -->
		<rect
			x={RACK_WIDTH - RAIL_WIDTH}
			y={RACK_PADDING}
			width={RAIL_WIDTH}
			height={totalHeight}
			class="rack-rail"
		/>

		<!-- Horizontal grid lines (U dividers) -->
		{#each Array(rack.height + 1).fill(null) as _gridLine, i (i)}
			<line
				x1={RAIL_WIDTH}
				y1={i * U_HEIGHT + RACK_PADDING}
				x2={RACK_WIDTH - RAIL_WIDTH}
				y2={i * U_HEIGHT + RACK_PADDING}
				class="rack-grid-line"
			/>
		{/each}

		<!-- U labels on left rail -->
		{#each uLabels as { uNumber, yPosition } (uNumber)}
			<text x={RAIL_WIDTH / 2} y={yPosition} class="u-label" dominant-baseline="middle">
				{uNumber}
			</text>
		{/each}

		<!-- Rail mounting holes (3 per U on each rail) -->
		{#each Array(rack.height).fill(null) as _hole, i (i)}
			{@const baseY = i * U_HEIGHT + RACK_PADDING + 4}
			<!-- Left rail holes -->
			<circle cx={RAIL_WIDTH / 2} cy={baseY} r="2" class="rack-hole" />
			<circle cx={RAIL_WIDTH / 2} cy={baseY + 7} r="2" class="rack-hole" />
			<circle cx={RAIL_WIDTH / 2} cy={baseY + 14} r="2" class="rack-hole" />
			<!-- Right rail holes -->
			<circle cx={RACK_WIDTH - RAIL_WIDTH / 2} cy={baseY} r="2" class="rack-hole" />
			<circle cx={RACK_WIDTH - RAIL_WIDTH / 2} cy={baseY + 7} r="2" class="rack-hole" />
			<circle cx={RACK_WIDTH - RAIL_WIDTH / 2} cy={baseY + 14} r="2" class="rack-hole" />
		{/each}

		<!-- Selection outline -->
		{#if selected}
			<rect
				x="1"
				y={RACK_PADDING + 1}
				width={RACK_WIDTH - 2}
				height={totalHeight - 2}
				class="rack-selection"
			/>
		{/if}

		<!-- Rack name below -->
		<text x={RACK_WIDTH / 2} y={totalHeight + RACK_PADDING + NAME_HEIGHT / 2 + 4} class="rack-name">
			{rack.name}
		</text>
	</svg>
</div>

<style>
	.rack-container {
		display: inline-block;
	}

	svg {
		cursor: pointer;
	}

	svg:focus {
		outline: 2px solid var(--colour-selection, #0066ff);
		outline-offset: 2px;
	}

	.rack-interior {
		fill: var(--colour-rack-interior, #2d2d2d);
	}

	.rack-rail {
		fill: var(--colour-rack-rail, #404040);
	}

	.rack-grid-line {
		stroke: var(--colour-rack-border, #505050);
		stroke-width: 1;
	}

	.u-label {
		fill: var(--colour-text-secondary, #a0a0a0);
		font-size: 10px;
		text-anchor: middle;
		font-family: var(--font-family, system-ui, sans-serif);
		user-select: none;
	}

	.rack-hole {
		fill: var(--colour-rack-border, #505050);
	}

	.rack-selection {
		fill: none;
		stroke: var(--colour-selection, #0066ff);
		stroke-width: 2;
	}

	.rack-name {
		fill: var(--colour-text, #ffffff);
		font-size: var(--font-size-device, 13px);
		text-anchor: middle;
		font-family: var(--font-family, system-ui, sans-serif);
	}
</style>
