<!--
  RackDevice SVG Component
  Renders a device within a rack at the specified U position
-->
<script lang="ts">
	import type { Device } from '$lib/types';
	import { createRackDeviceDragData, serializeDragData } from '$lib/utils/dragdrop';
	import CategoryIcon from './CategoryIcon.svelte';

	interface Props {
		device: Device;
		position: number;
		rackHeight: number;
		rackId: string;
		deviceIndex: number;
		selected: boolean;
		uHeight: number;
		rackWidth: number;
		onselect?: (event: CustomEvent<{ libraryId: string; position: number }>) => void;
		ondragstart?: (event: CustomEvent<{ rackId: string; deviceIndex: number }>) => void;
		ondragend?: () => void;
	}

	let {
		device,
		position,
		rackHeight,
		rackId,
		deviceIndex,
		selected,
		uHeight,
		rackWidth,
		onselect,
		ondragstart: ondragstartProp,
		ondragend: ondragendProp
	}: Props = $props();

	// Track dragging state for visual feedback
	let isDragging = $state(false);

	// Rail width (matches Rack.svelte)
	const RAIL_WIDTH = 24;

	// Type for draggable attribute spread
	type DraggableAttr = Record<string, unknown>;

	// Position calculation (SVG y-coordinate, origin at top)
	// y = (rackHeight - position - device.height + 1) * uHeight
	const yPosition = $derived((rackHeight - position - device.height + 1) * uHeight);
	const deviceHeight = $derived(device.height * uHeight);
	const deviceWidth = $derived(rackWidth - RAIL_WIDTH * 2);

	// Aria label for accessibility
	const ariaLabel = $derived(
		`${device.name}, ${device.height}U ${device.category} at U${position}${selected ? ', selected' : ''}`
	);

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		onselect?.(new CustomEvent('select', { detail: { libraryId: device.id, position } }));
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			event.stopPropagation();
			onselect?.(new CustomEvent('select', { detail: { libraryId: device.id, position } }));
		}
	}

	function handleDragStart(event: DragEvent) {
		if (!event.dataTransfer) return;

		const dragData = createRackDeviceDragData(device, rackId, deviceIndex);
		event.dataTransfer.setData('application/json', serializeDragData(dragData));
		event.dataTransfer.effectAllowed = 'move';

		isDragging = true;
		ondragstartProp?.(new CustomEvent('dragstart', { detail: { rackId, deviceIndex } }));
	}

	function handleDragEnd() {
		isDragging = false;
		ondragendProp?.();
	}
</script>

<g
	transform="translate({RAIL_WIDTH}, {yPosition})"
	role="button"
	aria-label={ariaLabel}
	aria-pressed={selected}
	tabindex="0"
	{...{ draggable: 'true' } as DraggableAttr}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	class="rack-device"
	class:dragging={isDragging}
>
	<!-- Device rectangle -->
	<rect
		class="device-rect"
		x="0"
		y="0"
		width={deviceWidth}
		height={deviceHeight}
		fill={device.colour}
		rx="2"
		ry="2"
	/>

	<!-- Selection outline -->
	{#if selected}
		<rect
			class="device-selection"
			x="1"
			y="1"
			width={deviceWidth - 2}
			height={deviceHeight - 2}
			rx="2"
			ry="2"
		/>
	{/if}

	<!-- Device name (centered) -->
	<text
		class="device-name"
		x={deviceWidth / 2}
		y={deviceHeight / 2}
		dominant-baseline="middle"
		text-anchor="middle"
	>
		{device.name}
	</text>

	<!-- Category icon (top-left corner) -->
	{#if deviceHeight >= 22}
		<foreignObject x="4" y="2" width="14" height="14" class="category-icon-wrapper">
			<div class="icon-container">
				<CategoryIcon category={device.category} size={12} />
			</div>
		</foreignObject>
	{/if}
</g>

<style>
	.rack-device {
		cursor: grab;
	}

	.rack-device:active {
		cursor: grabbing;
	}

	.rack-device.dragging {
		opacity: 0.5;
	}

	.rack-device:focus {
		outline: none;
	}

	.rack-device:focus .device-rect {
		stroke: var(--colour-selection, #0066ff);
		stroke-width: 2;
	}

	.device-rect {
		stroke: rgba(0, 0, 0, 0.2);
		stroke-width: 1;
	}

	.device-selection {
		fill: none;
		stroke: var(--colour-selection, #0066ff);
		stroke-width: 2;
	}

	.device-name {
		fill: #ffffff;
		font-size: var(--font-size-device, 13px);
		font-family: var(--font-family, system-ui, sans-serif);
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		pointer-events: none;
		user-select: none;
	}

	.category-icon-wrapper {
		pointer-events: none;
		overflow: visible;
	}

	.icon-container {
		color: rgba(255, 255, 255, 0.8);
		filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
	}
</style>
