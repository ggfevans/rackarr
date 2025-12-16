<!--
  RackDevice SVG Component
  Renders a device within a rack at the specified U position
-->
<script lang="ts">
	import type { DeviceType, DisplayMode, RackView } from '$lib/types';
	import { createRackDeviceDragData, serializeDragData } from '$lib/utils/dragdrop';
	import CategoryIcon from './CategoryIcon.svelte';
	import AirflowIndicator from './AirflowIndicator.svelte';
	import { IconGrip } from './icons';
	import { getImageStore } from '$lib/stores/images.svelte';
	import { debug } from '$lib/utils/debug';

	interface Props {
		device: DeviceType;
		position: number;
		rackHeight: number;
		rackId: string;
		deviceIndex: number;
		selected: boolean;
		uHeight: number;
		rackWidth: number;
		displayMode?: DisplayMode;
		rackView?: RackView;
		showLabelsOnImages?: boolean;
		placedDeviceName?: string;
		airflowMode?: boolean;
		hasConflict?: boolean;
		onselect?: (event: CustomEvent<{ slug: string; position: number }>) => void;
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
		displayMode = 'label',
		rackView = 'front',
		showLabelsOnImages = false,
		placedDeviceName,
		airflowMode = false,
		hasConflict = false,
		onselect,
		ondragstart: ondragstartProp,
		ondragend: ondragendProp
	}: Props = $props();

	// Device display name: model or slug
	const deviceName = $derived(device.model ?? device.slug);

	// Display name: custom name if set, otherwise device type name
	const displayName = $derived(placedDeviceName ?? deviceName);

	// Debug airflow rendering
	$effect(() => {
		if (airflowMode) {
			debug.log('RackDevice airflow check:', {
				deviceName,
				airflowMode,
				deviceAirflow: device.airflow,
				shouldRender: airflowMode && device.airflow
			});
		}
	});

	const imageStore = getImageStore();

	// Check if display mode shows images (either 'image' or 'image-label')
	const isImageMode = $derived(displayMode === 'image' || displayMode === 'image-label');

	// Get the device image URL for the current view
	const deviceImageUrl = $derived.by(() => {
		if (!isImageMode) return null;
		const face = rackView === 'rear' ? 'rear' : 'front';
		return imageStore.getImageUrl(device.slug, face);
	});

	// Should show image or fall back to label
	const showImage = $derived(isImageMode && deviceImageUrl);

	// Track dragging state for visual feedback
	let isDragging = $state(false);

	// Rail width (matches Rack.svelte)
	const RAIL_WIDTH = 17;

	// Position calculation (SVG y-coordinate, origin at top)
	// y = (rackHeight - position - device.u_height + 1) * uHeight
	const yPosition = $derived((rackHeight - position - device.u_height + 1) * uHeight);
	const deviceHeight = $derived(device.u_height * uHeight);
	const deviceWidth = $derived(rackWidth - RAIL_WIDTH * 2);

	// Aria label for accessibility
	const ariaLabel = $derived(
		`${deviceName}, ${device.u_height}U ${device.rackarr.category} at U${position}${selected ? ', selected' : ''}`
	);

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		onselect?.(new CustomEvent('select', { detail: { slug: device.slug, position } }));
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			event.stopPropagation();
			onselect?.(new CustomEvent('select', { detail: { slug: device.slug, position } }));
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
	data-device-id={device.slug}
	transform="translate({RAIL_WIDTH}, {yPosition})"
	class="rack-device"
	class:selected
	class:dragging={isDragging}
>
	<!-- Device rectangle -->
	<rect
		class="device-rect"
		x="0"
		y="0"
		width={deviceWidth}
		height={deviceHeight}
		fill={device.rackarr.colour}
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

	<!-- Airflow conflict border -->
	{#if airflowMode && hasConflict}
		<rect
			class="airflow-conflict"
			x="1"
			y="1"
			width={deviceWidth - 2}
			height={deviceHeight - 2}
			rx="2"
			ry="2"
		/>
	{/if}

	<!-- Device content: Image or Label -->
	{#if showImage}
		<!-- Device image -->
		<image
			class="device-image"
			x="0"
			y="0"
			width={deviceWidth}
			height={deviceHeight}
			href={deviceImageUrl}
			preserveAspectRatio="xMidYMid slice"
		/>
		<!-- Label overlay when showLabelsOnImages is true -->
		{#if showLabelsOnImages}
			<foreignObject
				x="0"
				y="0"
				width={deviceWidth}
				height={deviceHeight}
				class="label-overlay-wrapper"
			>
				<div class="label-overlay">{displayName}</div>
			</foreignObject>
		{/if}
	{:else}
		<!-- Device name (centered) -->
		<text
			class="device-name"
			x={deviceWidth / 2}
			y={deviceHeight / 2}
			dominant-baseline="middle"
			text-anchor="middle"
		>
			{displayName}
		</text>

		<!-- Category icon (vertically centered) -->
		{#if deviceHeight >= 22}
			<foreignObject x="8" y="0" width="16" height={deviceHeight} class="category-icon-wrapper">
				<div class="icon-container">
					<CategoryIcon category={device.rackarr.category} size={14} />
				</div>
			</foreignObject>
		{/if}
	{/if}

	<!-- Airflow indicator overlay -->
	{#if airflowMode && device.airflow}
		<g class="airflow-overlay">
			<AirflowIndicator
				airflow={device.airflow}
				view={rackView}
				width={deviceWidth}
				height={deviceHeight}
			/>
		</g>
	{/if}

	<!-- Invisible HTML overlay for drag-and-drop (rendered last to be on top for click events) -->
	<foreignObject x="0" y="0" width={deviceWidth} height={deviceHeight} class="drag-overlay">
		<div
			class="drag-handle"
			role="button"
			aria-label={ariaLabel}
			aria-pressed={selected}
			tabindex="0"
			draggable="true"
			onclick={handleClick}
			onkeydown={handleKeyDown}
			ondragstart={handleDragStart}
			ondragend={handleDragEnd}
		>
			<!-- Grip icon for drag affordance -->
			<div class="grip-icon-container">
				<IconGrip size={12} />
			</div>
		</div>
	</foreignObject>
</g>

<style>
	.rack-device {
		/* Enable GPU-accelerated filter animations */
		will-change: filter;
		transition: filter var(--anim-drag-settle, 0.15s) ease-out;
	}

	.rack-device.dragging {
		opacity: 0.7;
		/* Drop shadow provides visual feedback during drag.
		   Note: CSS transform: scale() is NOT used here because SVG <g> elements
		   with existing transform="translate()" attributes will have their
		   CSS transform-origin calculated incorrectly, causing a visual position
		   jump when dragging starts. See Issue #5. */
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
	}

	/* Hover state: subtle lift before dragging */
	.rack-device:hover:not(.dragging) {
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
	}

	.drag-overlay {
		overflow: visible;
	}

	.drag-handle {
		position: relative;
		width: 100%;
		height: 100%;
		cursor: grab;
		background: transparent;
		border: none;
		padding: 0;
		margin: 0;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.drag-handle:focus {
		outline: none;
	}

	.rack-device:focus-within .device-rect {
		stroke: var(--colour-selection);
		stroke-width: 2;
	}

	.device-rect {
		stroke: rgba(0, 0, 0, 0.2);
		stroke-width: 1;
		pointer-events: none;
	}

	.device-selection {
		fill: none;
		stroke: var(--colour-selection);
		stroke-width: 2;
		pointer-events: none;
	}

	.airflow-conflict {
		fill: none;
		stroke: var(--colour-airflow-conflict);
		stroke-width: 2;
		pointer-events: none;
	}

	.device-name {
		fill: var(--neutral-50);
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
		display: flex;
		align-items: center;
		height: 100%;
		color: rgba(255, 255, 255, 0.8);
		filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
	}

	.grip-icon-container {
		position: absolute;
		right: 4px;
		top: 50%;
		transform: translateY(-50%);
		opacity: 0;
		transition:
			opacity var(--duration-fast, 100ms) var(--ease-out, ease-out),
			transform var(--duration-fast, 100ms) var(--ease-out, ease-out);
		color: rgba(255, 255, 255, 0.6);
		pointer-events: none;
	}

	.drag-handle:hover .grip-icon-container,
	.drag-handle:focus .grip-icon-container {
		opacity: 1;
	}

	.drag-handle:active .grip-icon-container {
		opacity: 1;
		transform: translateY(-50%) scale(0.9);
	}

	.label-overlay-wrapper {
		overflow: visible;
		pointer-events: none;
	}

	.label-overlay {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		height: 100%;
		padding-bottom: 2px;
		font-size: var(--font-size-device, 12px);
		font-family: var(--font-family, system-ui, sans-serif);
		font-weight: 500;
		color: var(--neutral-50);
		text-shadow:
			0 1px 2px rgba(0, 0, 0, 0.8),
			0 0 4px rgba(0, 0, 0, 0.5);
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.6) 0%,
			rgba(0, 0, 0, 0.3) 50%,
			transparent 100%
		);
		user-select: none;
	}

	.airflow-overlay {
		pointer-events: none;
	}

	.device-image {
		pointer-events: none;
	}

	/* Respect reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.rack-device {
			transition: none;
		}

		.rack-device.dragging {
			transform: none;
		}
	}
</style>
