<!--
  DevicePaletteItem Component
  Displays a single device in the device palette
  Draggable for placement into racks
-->
<script lang="ts">
	import type { Device } from '$lib/types';
	import IconGrip from './icons/IconGrip.svelte';
	import { createPaletteDragData, serializeDragData } from '$lib/utils/dragdrop';

	interface Props {
		device: Device;
		librarySelected?: boolean;
		onselect?: (event: CustomEvent<{ device: Device }>) => void;
	}

	let { device, librarySelected = false, onselect }: Props = $props();

	// Track dragging state for visual feedback
	let isDragging = $state(false);

	function handleClick() {
		onselect?.(new CustomEvent('select', { detail: { device } }));
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onselect?.(new CustomEvent('select', { detail: { device } }));
		}
	}

	function handleDragStart(event: DragEvent) {
		if (!event.dataTransfer) return;

		const dragData = createPaletteDragData(device);
		event.dataTransfer.setData('application/json', serializeDragData(dragData));
		event.dataTransfer.effectAllowed = 'copy';

		isDragging = true;
	}

	function handleDragEnd() {
		isDragging = false;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="device-palette-item"
	class:dragging={isDragging}
	class:library-selected={librarySelected}
	role="listitem"
	tabindex="0"
	draggable="true"
	onclick={handleClick}
	onkeydown={handleKeyDown}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	aria-label="{device.name}, {device.height}U {device.category}"
>
	<span class="drag-handle" aria-hidden="true">
		<IconGrip size={16} />
	</span>
	<span class="category-indicator" style="background-color: {device.colour}"></span>
	<span class="device-name">{device.name}</span>
	<span class="device-height">{device.height}U</span>
</div>

<style>
	.device-palette-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		cursor: grab;
		transition:
			transform var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.device-palette-item:hover {
		background-color: var(--colour-surface-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.device-palette-item:active,
	.device-palette-item.dragging {
		cursor: grabbing;
		transform: translateY(-2px) scale(1.02);
		box-shadow: var(--shadow-lg);
		z-index: 100;
	}

	.device-palette-item:focus-visible {
		outline: 2px solid var(--colour-focus-ring);
		outline-offset: var(--space-1);
	}

	.device-palette-item.library-selected {
		background-color: color-mix(in srgb, var(--colour-selection) 15%, transparent);
		border: 1px solid var(--colour-selection);
	}

	.drag-handle {
		color: var(--colour-text-muted);
		opacity: 0.5;
		transition: opacity var(--duration-fast) var(--ease-out);
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.device-palette-item:hover .drag-handle {
		opacity: 1;
	}

	.category-indicator {
		width: 4px;
		height: 100%;
		min-height: 24px;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.device-name {
		flex: 1;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--colour-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.device-height {
		background-color: var(--colour-surface-raised);
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--colour-text-muted);
		flex-shrink: 0;
	}
</style>
