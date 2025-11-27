<!--
  Rack SVG Component
  Renders a rack visualization with U labels, grid lines, and selection state
  Accepts device drops for placement
-->
<script lang="ts">
	import type { Rack as RackType, Device } from '$lib/types';
	import RackDevice from './RackDevice.svelte';
	import {
		parseDragData,
		calculateDropPosition,
		getDropFeedback,
		type DropFeedback
	} from '$lib/utils/dragdrop';

	interface Props {
		rack: RackType;
		deviceLibrary: Device[];
		selected: boolean;
		zoom: number;
		selectedDeviceId?: string | null;
		onselect?: (event: CustomEvent<{ rackId: string }>) => void;
		ondeviceselect?: (event: CustomEvent<{ libraryId: string; position: number }>) => void;
		ondevicedrop?: (
			event: CustomEvent<{ rackId: string; libraryId: string; position: number }>
		) => void;
		ondevicemove?: (
			event: CustomEvent<{ rackId: string; deviceIndex: number; newPosition: number }>
		) => void;
		ondevicemoverack?: (
			event: CustomEvent<{
				sourceRackId: string;
				sourceIndex: number;
				targetRackId: string;
				targetPosition: number;
			}>
		) => void;
	}

	let {
		rack,
		deviceLibrary,
		selected,
		zoom,
		selectedDeviceId = null,
		onselect,
		ondeviceselect,
		ondevicedrop,
		ondevicemove,
		ondevicemoverack
	}: Props = $props();

	// Track which device is being dragged (for internal moves)
	let draggingDeviceIndex = $state<number | null>(null);

	// Look up device by libraryId
	function getDeviceById(libraryId: string): Device | undefined {
		return deviceLibrary.find((d) => d.id === libraryId);
	}

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

	// Drop preview state
	let dropPreview = $state<{
		position: number;
		height: number;
		feedback: DropFeedback;
	} | null>(null);

	// Generate U labels (1 at bottom, rack.height at top)
	const uLabels = $derived(
		Array.from({ length: rack.height }, (_, i) => {
			const uNumber = rack.height - i;
			const yPosition = i * U_HEIGHT + U_HEIGHT / 2 + RACK_PADDING;
			return { uNumber, yPosition };
		})
	);

	// Calculate drop preview Y position (SVG coordinate)
	const dropPreviewY = $derived(
		dropPreview
			? (rack.height - dropPreview.position - dropPreview.height + 1) * U_HEIGHT + RACK_PADDING
			: 0
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

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (!event.dataTransfer) return;

		const data = event.dataTransfer.getData('application/json');
		if (!data) {
			// Data not available during dragover in some browsers, allow drop anyway
			event.dataTransfer.dropEffect = draggingDeviceIndex !== null ? 'move' : 'copy';
			return;
		}

		const dragData = parseDragData(data);
		if (!dragData) return;

		// Determine if this is an internal move (same rack)
		const isInternalMove =
			dragData.type === 'rack-device' &&
			dragData.sourceRackId === rack.id &&
			dragData.sourceIndex !== undefined;

		event.dataTransfer.dropEffect = isInternalMove ? 'move' : 'copy';

		// Calculate target position from mouse Y
		const svg = event.currentTarget as SVGElement;
		const rect = svg.getBoundingClientRect();
		const mouseY = (event.clientY - rect.top) / zoomScale - RACK_PADDING;

		const targetU = calculateDropPosition(mouseY, rack.height, U_HEIGHT, RACK_PADDING);

		// For internal moves, exclude the source device from collision checks
		const excludeIndex = isInternalMove ? dragData.sourceIndex : undefined;
		const feedback = getDropFeedback(
			rack,
			deviceLibrary,
			dragData.device.height,
			targetU,
			excludeIndex
		);

		dropPreview = {
			position: targetU,
			height: dragData.device.height,
			feedback
		};
	}

	function handleDragEnter(event: DragEvent) {
		event.preventDefault();
	}

	function handleDragLeave(event: DragEvent) {
		// Only clear if leaving the SVG entirely
		const svg = event.currentTarget as SVGElement;
		const relatedTarget = event.relatedTarget as Node | null;
		if (!relatedTarget || !svg.contains(relatedTarget)) {
			dropPreview = null;
		}
	}

	function handleDeviceDragStart(deviceIndex: number) {
		draggingDeviceIndex = deviceIndex;
	}

	function handleDeviceDragEnd() {
		draggingDeviceIndex = null;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dropPreview = null;
		draggingDeviceIndex = null;

		if (!event.dataTransfer) return;

		const data = event.dataTransfer.getData('application/json');
		const dragData = parseDragData(data);
		if (!dragData) return;

		// Determine if this is an internal move (same rack)
		const isInternalMove =
			dragData.type === 'rack-device' &&
			dragData.sourceRackId === rack.id &&
			dragData.sourceIndex !== undefined;

		// Determine if this is a cross-rack move (from different rack)
		const isCrossRackMove =
			dragData.type === 'rack-device' &&
			dragData.sourceRackId !== rack.id &&
			dragData.sourceIndex !== undefined;

		// Calculate target position
		const svg = event.currentTarget as SVGElement;
		const rect = svg.getBoundingClientRect();
		const mouseY = (event.clientY - rect.top) / zoomScale - RACK_PADDING;

		const targetU = calculateDropPosition(mouseY, rack.height, U_HEIGHT, RACK_PADDING);

		// For internal moves, exclude the source device from collision checks
		// Cross-rack and palette drops don't need exclusion
		const excludeIndex = isInternalMove ? dragData.sourceIndex : undefined;
		const feedback = getDropFeedback(
			rack,
			deviceLibrary,
			dragData.device.height,
			targetU,
			excludeIndex
		);

		if (feedback === 'valid') {
			if (isInternalMove && dragData.sourceIndex !== undefined) {
				// Internal move within same rack
				ondevicemove?.(
					new CustomEvent('devicemove', {
						detail: {
							rackId: rack.id,
							deviceIndex: dragData.sourceIndex,
							newPosition: targetU
						}
					})
				);
			} else if (isCrossRackMove && dragData.sourceIndex !== undefined && dragData.sourceRackId) {
				// Cross-rack move from a different rack
				ondevicemoverack?.(
					new CustomEvent('devicemoverack', {
						detail: {
							sourceRackId: dragData.sourceRackId,
							sourceIndex: dragData.sourceIndex,
							targetRackId: rack.id,
							targetPosition: targetU
						}
					})
				);
			} else {
				// External drop from palette (library-device type)
				ondevicedrop?.(
					new CustomEvent('devicedrop', {
						detail: {
							rackId: rack.id,
							libraryId: dragData.device.id,
							position: targetU
						}
					})
				);
			}
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
		ondragover={handleDragOver}
		ondragenter={handleDragEnter}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
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

		<!-- Devices -->
		<g transform="translate(0, {RACK_PADDING})">
			{#each rack.devices as placedDevice, deviceIndex (placedDevice.libraryId + '-' + placedDevice.position)}
				{@const device = getDeviceById(placedDevice.libraryId)}
				{#if device}
					<RackDevice
						{device}
						position={placedDevice.position}
						rackHeight={rack.height}
						rackId={rack.id}
						{deviceIndex}
						selected={selectedDeviceId === placedDevice.libraryId}
						uHeight={U_HEIGHT}
						rackWidth={RACK_WIDTH}
						onselect={ondeviceselect}
						ondragstart={() => handleDeviceDragStart(deviceIndex)}
						ondragend={handleDeviceDragEnd}
					/>
				{/if}
			{/each}
		</g>

		<!-- Drop preview -->
		{#if dropPreview}
			<rect
				x={RAIL_WIDTH + 2}
				y={dropPreviewY}
				width={interiorWidth - 4}
				height={dropPreview.height * U_HEIGHT - 2}
				class="drop-preview"
				class:drop-valid={dropPreview.feedback === 'valid'}
				class:drop-invalid={dropPreview.feedback === 'invalid'}
				class:drop-blocked={dropPreview.feedback === 'blocked'}
				rx="2"
				ry="2"
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

	.drop-preview {
		pointer-events: none;
	}

	.drop-valid {
		fill: rgba(0, 200, 0, 0.3);
		stroke: #00c800;
		stroke-width: 2;
	}

	.drop-invalid {
		fill: rgba(200, 0, 0, 0.3);
		stroke: #c80000;
		stroke-width: 2;
	}

	.drop-blocked {
		fill: rgba(200, 100, 0, 0.3);
		stroke: #c86400;
		stroke-width: 2;
	}
</style>
