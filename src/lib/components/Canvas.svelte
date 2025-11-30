<!--
  Canvas Component
  Main content area displaying all racks in a horizontal layout
  Uses panzoom for zoom and pan functionality
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import panzoom from 'panzoom';
	import { getLayoutStore } from '$lib/stores/layout.svelte';
	import { getSelectionStore } from '$lib/stores/selection.svelte';
	import { getCanvasStore, ZOOM_MIN, ZOOM_MAX } from '$lib/stores/canvas.svelte';
	import { debug } from '$lib/utils/debug';
	import Rack from './Rack.svelte';
	import WelcomeScreen from './WelcomeScreen.svelte';

	interface Props {
		onnewrack?: () => void;
		onload?: () => void;
		onrackselect?: (event: CustomEvent<{ rackId: string }>) => void;
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
		onnewrack,
		onload,
		onrackselect,
		ondeviceselect,
		ondevicedrop,
		ondevicemove,
		ondevicemoverack
	}: Props = $props();

	const layoutStore = getLayoutStore();
	const selectionStore = getSelectionStore();
	const canvasStore = getCanvasStore();

	// Sort racks by position
	const sortedRacks = $derived([...layoutStore.racks].sort((a, b) => a.position - b.position));
	const hasRacks = $derived(layoutStore.rackCount > 0);

	// Panzoom container reference
	let panzoomContainer: HTMLDivElement | null = $state(null);
	let canvasContainer: HTMLDivElement | null = $state(null);

	// Set canvas element for viewport measurements
	onMount(() => {
		if (canvasContainer) {
			canvasStore.setCanvasElement(canvasContainer);
		}
	});

	// Initialize panzoom reactively when container becomes available
	$effect(() => {
		if (panzoomContainer) {
			const instance = panzoom(panzoomContainer, {
				minZoom: ZOOM_MIN,
				maxZoom: ZOOM_MAX,
				smoothScroll: false,
				// Disable default zoom on double-click (we handle zoom via toolbar)
				zoomDoubleClickSpeed: 1,
				// Allow panning only when not interacting with drag targets
				beforeMouseDown: (e: MouseEvent) => {
					// Allow drag-and-drop to work - don't initiate pan on draggable elements
					const target = e.target as HTMLElement;

					// Check if target or any parent is draggable
					// For SVGElements, we need to check the draggable attribute differently
					const isDraggableElement =
						(target as HTMLElement).draggable === true ||
						target.getAttribute?.('draggable') === 'true' ||
						target.closest?.('[draggable="true"]') !== null;

					debug.log('beforeMouseDown:', {
						target: target.tagName,
						className: target.className,
						draggable: (target as HTMLElement).draggable,
						draggableAttr: target.getAttribute?.('draggable'),
						closestDraggable: target.closest?.('[draggable="true"]'),
						isDraggableElement,
						willPan: !isDraggableElement
					});

					// Don't pan if on a draggable element
					if (isDraggableElement) {
						return true; // Block panning, let drag-drop work
					}

					// Allow panning on empty space and non-interactive elements
					return false;
				},
				// Filter out drag events from panzoom handling
				filterKey: () => true
			});

			debug.log('Panzoom initialized on container:', panzoomContainer);
			canvasStore.setPanzoomInstance(instance);

			// Center content on initial load
			requestAnimationFrame(() => {
				canvasStore.fitAll(layoutStore.racks);
			});

			return () => {
				debug.log('Disposing panzoom');
				canvasStore.disposePanzoom();
			};
		}
	});

	function handleCanvasClick(event: MouseEvent) {
		// Only clear selection if clicking directly on the canvas (not on a rack)
		if (event.target === event.currentTarget) {
			selectionStore.clearSelection();
		}
	}

	function handleRackSelect(event: CustomEvent<{ rackId: string }>) {
		selectionStore.selectRack(event.detail.rackId);
		onrackselect?.(event);
	}

	function handleDeviceSelect(
		event: CustomEvent<{ libraryId: string; position: number }>,
		rackId: string
	) {
		// Find the device index in the rack
		const rack = layoutStore.racks.find((r) => r.id === rackId);
		if (rack) {
			const deviceIndex = rack.devices.findIndex(
				(d) => d.libraryId === event.detail.libraryId && d.position === event.detail.position
			);
			if (deviceIndex !== -1) {
				selectionStore.selectDevice(rackId, deviceIndex, event.detail.libraryId);
			}
		}
		ondeviceselect?.(event);
	}

	function handleNewRack() {
		onnewrack?.();
	}

	function handleDeviceDrop(
		event: CustomEvent<{ rackId: string; libraryId: string; position: number }>
	) {
		const { rackId, libraryId, position } = event.detail;
		layoutStore.placeDevice(rackId, libraryId, position);
		ondevicedrop?.(event);
	}

	function handleDeviceMove(
		event: CustomEvent<{ rackId: string; deviceIndex: number; newPosition: number }>
	) {
		const { rackId, deviceIndex, newPosition } = event.detail;
		layoutStore.moveDevice(rackId, deviceIndex, newPosition);
		ondevicemove?.(event);
	}

	function handleDeviceMoveRack(
		event: CustomEvent<{
			sourceRackId: string;
			sourceIndex: number;
			targetRackId: string;
			targetPosition: number;
		}>
	) {
		const { sourceRackId, sourceIndex, targetRackId, targetPosition } = event.detail;
		layoutStore.moveDeviceToRack(sourceRackId, sourceIndex, targetRackId, targetPosition);
		ondevicemoverack?.(event);
	}

	function handleRackViewChange(event: CustomEvent<{ rackId: string; view: 'front' | 'rear' }>) {
		const { rackId, view } = event.detail;
		layoutStore.updateRackView(rackId, view);
	}

	// Rack reordering state (prefixed with _ as they're for future visual feedback)
	let _rackDragOverId = $state<string | null>(null);
	let _rackDragSourceId = $state<string | null>(null);

	function handleRackRowDragOver(event: DragEvent) {
		if (!event.dataTransfer) return;

		const data = event.dataTransfer.getData('application/json');
		if (!data) {
			// Data might not be available during dragover in some browsers
			// Check if we have effectAllowed set to 'move' (set by rack drag)
			if (event.dataTransfer.effectAllowed === 'move') {
				event.preventDefault();
				event.dataTransfer.dropEffect = 'move';
			}
			return;
		}

		try {
			const parsed = JSON.parse(data);
			if (parsed.type === 'rack-reorder') {
				event.preventDefault();
				event.dataTransfer.dropEffect = 'move';
				_rackDragSourceId = parsed.rackId;

				// Find which rack we're over based on mouse position
				const rackRow = event.currentTarget as HTMLElement;
				const rackElements = rackRow.querySelectorAll('.rack-container');
				let targetRackId: string | null = null;

				for (const el of rackElements) {
					const rect = el.getBoundingClientRect();
					if (event.clientX >= rect.left && event.clientX <= rect.right) {
						const rackId = sortedRacks.find((r) => {
							// Match by position in the DOM
							const rackIndex = Array.from(rackElements).indexOf(el);
							return rackIndex !== -1 && sortedRacks[rackIndex]?.id === r.id;
						})?.id;
						if (rackId) {
							targetRackId = rackId;
							break;
						}
					}
				}

				_rackDragOverId = targetRackId;
			}
		} catch {
			// Invalid JSON, ignore
		}
	}

	function handleRackRowDragLeave() {
		_rackDragOverId = null;
	}

	function handleRackRowDrop(event: DragEvent) {
		event.preventDefault();
		_rackDragOverId = null;

		if (!event.dataTransfer) return;

		const data = event.dataTransfer.getData('application/json');
		if (!data) return;

		try {
			const parsed = JSON.parse(data);
			if (parsed.type === 'rack-reorder' && parsed.rackId) {
				const sourceRackId = parsed.rackId;

				// Find target rack based on drop position
				const rackRow = event.currentTarget as HTMLElement;
				const rackElements = rackRow.querySelectorAll('.rack-container');
				let targetIndex = -1;

				for (let i = 0; i < rackElements.length; i++) {
					const rect = rackElements[i].getBoundingClientRect();
					const midX = rect.left + rect.width / 2;

					if (event.clientX < midX) {
						targetIndex = i;
						break;
					}
				}

				// If we didn't find a position, drop at the end
				if (targetIndex === -1) {
					targetIndex = sortedRacks.length - 1;
				}

				// Find source rack index
				const sourceIndex = sortedRacks.findIndex((r) => r.id === sourceRackId);
				if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
					// Adjust target index if dragging from before the target
					const adjustedTarget = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
					if (sourceIndex !== adjustedTarget) {
						layoutStore.reorderRacks(sourceIndex, adjustedTarget);
					}
				}
			}
		} catch {
			// Invalid JSON, ignore
		}

		_rackDragSourceId = null;
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="canvas" role="application" bind:this={canvasContainer} onclick={handleCanvasClick}>
	{#if hasRacks}
		<div class="panzoom-container" bind:this={panzoomContainer}>
			<div
				class="rack-row"
				ondragover={handleRackRowDragOver}
				ondragleave={handleRackRowDragLeave}
				ondrop={handleRackRowDrop}
				role="list"
			>
				{#each sortedRacks as rack (rack.id)}
					<Rack
						{rack}
						deviceLibrary={layoutStore.deviceLibrary}
						selected={selectionStore.selectedType === 'rack' &&
							selectionStore.selectedId === rack.id}
						selectedDeviceId={selectionStore.selectedType === 'device'
							? selectionStore.selectedId
							: null}
						onselect={(e) => handleRackSelect(e)}
						ondeviceselect={(e) => handleDeviceSelect(e, rack.id)}
						ondevicedrop={(e) => handleDeviceDrop(e)}
						ondevicemove={(e) => handleDeviceMove(e)}
						ondevicemoverack={(e) => handleDeviceMoveRack(e)}
						onrackviewchange={(e) => handleRackViewChange(e)}
					/>
				{/each}
			</div>
		</div>
	{:else}
		<WelcomeScreen onnewrack={handleNewRack} {onload} />
	{/if}
</div>

<style>
	.canvas {
		flex: 1;
		overflow: hidden;
		background-color: var(--colour-bg, #1a1a1a);
		min-height: 0;
		position: relative;
	}

	.panzoom-container {
		/* No flexbox centering - panzoom controls all positioning */
		/* fitAll() centers content on load and when toolbar button clicked */
		min-width: 100%;
		min-height: 100%;
		transform-origin: 0 0;
		touch-action: none;
		cursor: grab;
	}

	.panzoom-container:active {
		cursor: grabbing;
	}

	.rack-row {
		display: flex;
		flex-direction: row;
		align-items: flex-end;
		gap: 24px;
		padding: 16px;
	}
</style>
