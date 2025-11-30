<!--
  Rack SVG Component
  Renders a rack visualization with U labels, grid lines, and selection state
  Accepts device drops for placement
-->
<script lang="ts">
	import type { Rack as RackType, Device, RackView } from '$lib/types';
	import RackDevice from './RackDevice.svelte';
	import RackViewToggle from './RackViewToggle.svelte';
	import {
		parseDragData,
		calculateDropPosition,
		getDropFeedback,
		type DropFeedback
	} from '$lib/utils/dragdrop';
	import { screenToSVG } from '$lib/utils/coordinates';
	import { getCanvasStore } from '$lib/stores/canvas.svelte';

	const canvasStore = getCanvasStore();

	interface Props {
		rack: RackType;
		deviceLibrary: Device[];
		selected: boolean;
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
		onrackdragstart?: (event: CustomEvent<{ rackId: string }>) => void;
		onrackviewchange?: (event: CustomEvent<{ rackId: string; view: RackView }>) => void;
	}

	let {
		rack,
		deviceLibrary,
		selected,
		selectedDeviceId = null,
		onselect,
		ondeviceselect,
		ondevicedrop,
		ondevicemove,
		ondevicemoverack,
		onrackdragstart,
		onrackviewchange
	}: Props = $props();

	// Track which device is being dragged (for internal moves)
	let draggingDeviceIndex = $state<number | null>(null);
	// Track if we just finished dragging a device (to prevent rack selection on release)
	let justFinishedDrag = $state(false);

	// Look up device by libraryId
	function getDeviceById(libraryId: string): Device | undefined {
		return deviceLibrary.find((d) => d.id === libraryId);
	}

	// CSS custom property values (fallbacks match app.css)
	const U_HEIGHT = 22;
	const RACK_WIDTH = 220;
	const RAIL_WIDTH = 17;
	const RACK_PADDING = 18; // Space at top for rack name (13px font + margin)

	// Calculated dimensions
	const totalHeight = $derived(rack.height * U_HEIGHT);
	const viewBoxHeight = $derived(totalHeight + RACK_PADDING);
	const interiorWidth = $derived(RACK_WIDTH - RAIL_WIDTH * 2);

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

	// Filter devices by rack view and device face
	const visibleDevices = $derived(
		rack.devices.filter((placedDevice) => {
			const { face } = placedDevice;
			if (face === 'both') return true; // Both-face devices visible in all views
			return face === rack.view; // Show front devices in front view, rear in rear view
		})
	);

	function handleClick(_event: MouseEvent) {
		// Don't select rack if we just finished panning
		if (canvasStore.isPanning) return;
		// Don't select rack if we just finished dragging a device
		if (justFinishedDrag) {
			justFinishedDrag = false;
			return;
		}

		onselect?.(new CustomEvent('select', { detail: { rackId: rack.id } }));
	}

	function handleViewChange(newView: RackView) {
		onrackviewchange?.(
			new CustomEvent('rackviewchange', {
				detail: { rackId: rack.id, view: newView }
			})
		);
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

		// Calculate target position from mouse Y using transform-aware coordinates
		const svg = event.currentTarget as SVGSVGElement;
		const svgCoords = screenToSVG(svg, event.clientX, event.clientY);
		const mouseY = svgCoords.y - RACK_PADDING;

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
		// Set flag to prevent rack selection on the click that follows drag end
		justFinishedDrag = true;
		// Reset the flag after a short delay (in case no click event follows)
		setTimeout(() => {
			justFinishedDrag = false;
		}, 100);
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

		// Calculate target position using transform-aware coordinates
		const svg = event.currentTarget as SVGSVGElement;
		const svgCoords = screenToSVG(svg, event.clientX, event.clientY);
		const mouseY = svgCoords.y - RACK_PADDING;

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

	// Rack drag handle for reordering
	function handleRackDragStart(event: DragEvent) {
		event.stopPropagation();
		if (!event.dataTransfer) return;

		event.dataTransfer.setData(
			'application/json',
			JSON.stringify({ type: 'rack-reorder', rackId: rack.id })
		);
		event.dataTransfer.effectAllowed = 'move';

		onrackdragstart?.(
			new CustomEvent('rackdragstart', {
				detail: { rackId: rack.id }
			})
		);
	}
</script>

<div
	class="rack-container"
	tabindex="0"
	aria-selected={selected}
	role="option"
	onkeydown={handleKeyDown}
	onclick={handleClick}
>
	<!-- Drag handle for rack reordering - only shown when selected -->
	{#if selected}
		<div
			class="rack-drag-handle"
			draggable="true"
			ondragstart={handleRackDragStart}
			role="button"
			aria-label="Drag to reorder {rack.name}"
			tabindex="-1"
		>
			<span class="drag-handle-icon">&#x2630;</span>
		</div>
	{/if}
	<svg
		class="rack-svg"
		width={RACK_WIDTH}
		height={viewBoxHeight}
		viewBox="0 0 {RACK_WIDTH} {viewBoxHeight}"
		role="img"
		aria-label="{rack.name}, {rack.height}U rack{selected ? ', selected' : ''}"
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

		<!-- Rail mounting holes (3 per U on each rail) - rendered first so labels appear on top -->
		{#each Array(rack.height).fill(null) as _hole, i (i)}
			{@const baseY = i * U_HEIGHT + RACK_PADDING + 4}
			<!-- Right rail holes only - left rail has labels -->
			<circle cx={RACK_WIDTH - RAIL_WIDTH / 2} cy={baseY} r="1.8" class="rack-hole" />
			<circle cx={RACK_WIDTH - RAIL_WIDTH / 2} cy={baseY + 7} r="1.8" class="rack-hole" />
			<circle cx={RACK_WIDTH - RAIL_WIDTH / 2} cy={baseY + 14} r="1.8" class="rack-hole" />
		{/each}

		<!-- U labels on left rail (rendered after holes for better visibility) -->
		{#each uLabels as { uNumber, yPosition } (uNumber)}
			<text x={RAIL_WIDTH / 2} y={yPosition} class="u-label" dominant-baseline="middle">
				{uNumber}
			</text>
		{/each}

		<!-- Devices -->
		<g transform="translate(0, {RACK_PADDING})">
			{#each visibleDevices as placedDevice, deviceIndex (placedDevice.libraryId + '-' + placedDevice.position)}
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

		<!-- Rack name at top -->
		<text
			x={RACK_WIDTH / 2}
			y="0"
			class="rack-name"
			text-anchor="middle"
			dominant-baseline="text-before-edge"
		>
			{rack.name}
		</text>

		<!-- View toggle in lower right corner -->
		<foreignObject
			x={RACK_WIDTH - 60}
			y={totalHeight + RACK_PADDING - 26}
			width="56"
			height="22"
			class="view-toggle-overlay"
		>
			<div class="view-toggle-wrapper">
				<RackViewToggle view={rack.view} onchange={handleViewChange} />
			</div>
		</foreignObject>
	</svg>
</div>

<style>
	.rack-container {
		display: inline-block;
		position: relative;
		cursor: inherit; /* Inherit cursor from panzoom-container (grab/grabbing) */
		touch-action: inherit; /* Allow panzoom to handle touches */
	}

	.rack-container:focus {
		outline: 2px solid var(--colour-selection, #0066ff);
		outline-offset: 2px;
	}

	.rack-container[aria-selected='true'] {
		outline: 2px solid var(--colour-selection, #0066ff);
		outline-offset: 2px;
	}

	.view-toggle-overlay {
		pointer-events: none;
	}

	.view-toggle-wrapper {
		pointer-events: all;
		opacity: 0.9;
		transition: opacity 0.15s ease;
	}

	.view-toggle-wrapper:hover {
		opacity: 1;
	}

	.rack-drag-handle {
		position: absolute;
		bottom: -24px;
		left: 50%;
		transform: translateX(-50%);
		width: 32px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--colour-panel, #2d2d2d);
		border: 1px solid var(--colour-border, #404040);
		border-radius: 4px;
		cursor: grab;
		opacity: 0.6;
		transition: opacity 0.15s ease;
		z-index: 10;
	}

	.rack-drag-handle:hover {
		opacity: 1;
		background: var(--colour-hover, #3d3d3d);
	}

	.rack-drag-handle:active {
		cursor: grabbing;
	}

	.drag-handle-icon {
		color: var(--colour-text-muted, #808080);
		font-size: 12px;
		line-height: 1;
	}

	svg {
		pointer-events: auto;
		touch-action: inherit; /* Allow panzoom to handle touches */
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
		fill: var(--colour-text-muted, #b0b0b0);
		font-size: 10px;
		text-anchor: middle;
		font-family: var(--font-family, system-ui, sans-serif);
		user-select: none;
	}

	.rack-hole {
		fill: var(--colour-rack-border, #505050);
	}

	.rack-name {
		fill: var(--colour-text, #ffffff);
		font-size: 15px;
		font-weight: 500;
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
