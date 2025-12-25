<!--
  DevicePaletteItemGroup Component
  Displays a device with multiple U-height variants as inline size chips
  Each chip is individually draggable for placement into racks
-->
<script lang="ts">
	import type { DeviceType } from '$lib/types';
	import IconGrip from './icons/IconGrip.svelte';
	import CategoryIcon from './CategoryIcon.svelte';
	import ImageIndicator from './ImageIndicator.svelte';
	import { createPaletteDragData, serializeDragData } from '$lib/utils/dragdrop';
	import { highlightMatch } from '$lib/utils/searchHighlight';

	interface Props {
		variants: DeviceType[];
		searchQuery?: string;
		onselect?: (event: CustomEvent<{ device: DeviceType }>) => void;
	}

	let { variants, searchQuery = '', onselect }: Props = $props();

	// Use first variant for shared properties (model, category, colour)
	const firstVariant = $derived(variants[0]);
	const deviceName = $derived(firstVariant.model ?? firstVariant.slug);
	const highlightedSegments = $derived(highlightMatch(deviceName, searchQuery));

	// Check if any variant has images
	const hasImages = $derived(variants.some((v) => v.front_image || v.rear_image));

	// Track which chip is being dragged
	let draggingIndex = $state<number | null>(null);

	function handleChipClick(device: DeviceType) {
		onselect?.(new CustomEvent('select', { detail: { device } }));
	}

	function handleChipKeyDown(event: KeyboardEvent, device: DeviceType) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onselect?.(new CustomEvent('select', { detail: { device } }));
		}
	}

	function handleDragStart(event: DragEvent, device: DeviceType, index: number) {
		if (!event.dataTransfer) return;

		const dragData = createPaletteDragData(device);
		event.dataTransfer.setData('application/json', serializeDragData(dragData));
		event.dataTransfer.effectAllowed = 'copy';

		draggingIndex = index;
	}

	function handleDragEnd() {
		draggingIndex = null;
	}
</script>

<div
	class="device-palette-item-group"
	role="listitem"
	data-testid="device-palette-item-group"
	aria-label="{deviceName}, {variants.length} size options"
>
	<span class="drag-handle" aria-hidden="true">
		<IconGrip size={16} />
	</span>
	<span class="category-icon-indicator" style="color: {firstVariant.colour}">
		<CategoryIcon category={firstVariant.category} size={16} />
	</span>
	<span class="device-name">
		{#each highlightedSegments as segment, i (i)}
			{#if segment.isMatch}
				<strong>{segment.text}</strong>
			{:else}
				{segment.text}
			{/if}
		{/each}
	</span>
	{#if hasImages}
		<ImageIndicator
			front={variants.some((v) => v.front_image)}
			rear={variants.some((v) => v.rear_image)}
			size={14}
		/>
	{/if}
	<div class="size-chips">
		{#each variants as variant, index (variant.slug)}
			<button
				class="size-chip"
				class:dragging={draggingIndex === index}
				draggable="true"
				onclick={() => handleChipClick(variant)}
				onkeydown={(e) => handleChipKeyDown(e, variant)}
				ondragstart={(e) => handleDragStart(e, variant, index)}
				ondragend={handleDragEnd}
				aria-label="{variant.u_height}U {deviceName}"
			>
				{variant.u_height}U
			</button>
		{/each}
	</div>
</div>

<style>
	.device-palette-item-group {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
	}

	.device-palette-item-group:hover {
		background-color: var(--colour-surface-hover);
	}

	.drag-handle {
		color: var(--colour-text-muted);
		opacity: 0.5;
		transition: opacity var(--duration-fast) var(--ease-out);
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.device-palette-item-group:hover .drag-handle {
		opacity: 1;
	}

	.category-icon-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
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

	.size-chips {
		display: flex;
		gap: var(--space-1);
		flex-shrink: 0;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.size-chip {
		background-color: var(--colour-surface-active);
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--colour-text);
		border: none;
		cursor: grab;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.size-chip:hover {
		background-color: var(--colour-surface-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.size-chip:active,
	.size-chip.dragging {
		cursor: grabbing;
		transform: translateY(-2px) scale(1.05);
		box-shadow: var(--shadow-lg);
		z-index: 100;
	}

	.size-chip:focus-visible {
		outline: 2px solid var(--colour-focus-ring);
		outline-offset: 1px;
	}
</style>
