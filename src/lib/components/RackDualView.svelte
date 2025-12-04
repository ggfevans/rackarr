<!--
  RackDualView Component
  Renders front and rear views of a rack side-by-side
  Replaces single-view Rack with toggle
-->
<script lang="ts">
	import type { Rack as RackType, Device, DisplayMode } from '$lib/types';
	import Rack from './Rack.svelte';

	interface Props {
		rack: RackType;
		deviceLibrary: Device[];
		selected: boolean;
		selectedDeviceId?: string | null;
		displayMode?: DisplayMode;
		showLabelsOnImages?: boolean;
		onselect?: (event: CustomEvent<{ rackId: string }>) => void;
		ondeviceselect?: (event: CustomEvent<{ libraryId: string; position: number }>) => void;
		ondevicedrop?: (
			event: CustomEvent<{
				rackId: string;
				libraryId: string;
				position: number;
				face: 'front' | 'rear';
			}>
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
		selectedDeviceId = null,
		displayMode = 'label',
		showLabelsOnImages = false,
		onselect,
		ondeviceselect,
		ondevicedrop,
		ondevicemove,
		ondevicemoverack
	}: Props = $props();

	// Create virtual racks with different views for rendering
	// This is a temporary approach until Rack.svelte is updated with faceFilter prop
	const frontRack = $derived<RackType>({
		...rack,
		view: 'front'
	});

	const rearRack = $derived<RackType>({
		...rack,
		view: 'rear'
	});

	function handleSelect() {
		onselect?.(new CustomEvent('select', { detail: { rackId: rack.id } }));
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleSelect();
		}
	}

	function handleFrontClick(event: MouseEvent) {
		// Prevent bubbling so we can control selection at dual-view level
		event.stopPropagation();
		handleSelect();
	}

	function handleRearClick(event: MouseEvent) {
		event.stopPropagation();
		handleSelect();
	}

	// Handle device drop on front view - add face: 'front' to the event
	function handleFrontDeviceDrop(
		event: CustomEvent<{ rackId: string; libraryId: string; position: number }>
	) {
		ondevicedrop?.(
			new CustomEvent('devicedrop', {
				detail: {
					...event.detail,
					face: 'front' as const
				}
			})
		);
	}

	// Handle device drop on rear view - add face: 'rear' to the event
	function handleRearDeviceDrop(
		event: CustomEvent<{ rackId: string; libraryId: string; position: number }>
	) {
		ondevicedrop?.(
			new CustomEvent('devicedrop', {
				detail: {
					...event.detail,
					face: 'rear' as const
				}
			})
		);
	}
</script>

<div
	class="rack-dual-view"
	class:selected
	tabindex="0"
	role="option"
	aria-selected={selected}
	aria-label="{rack.name}, {rack.height}U rack, front and rear view{selected ? ', selected' : ''}"
	onkeydown={handleKeyDown}
>
	<!-- Rack name centered above both views -->
	<div class="rack-dual-view-name">{rack.name}</div>

	<div class="rack-dual-view-container">
		<!-- Front view -->
		<div class="rack-front" onclick={handleFrontClick} role="presentation">
			<div class="rack-view-label">FRONT</div>
			<Rack
				rack={frontRack}
				{deviceLibrary}
				selected={false}
				{selectedDeviceId}
				{displayMode}
				{showLabelsOnImages}
				onselect={() => handleSelect()}
				{ondeviceselect}
				ondevicedrop={handleFrontDeviceDrop}
				{ondevicemove}
				{ondevicemoverack}
			/>
		</div>

		<!-- Rear view -->
		<div class="rack-rear" onclick={handleRearClick} role="presentation">
			<div class="rack-view-label">REAR</div>
			<Rack
				rack={rearRack}
				{deviceLibrary}
				selected={false}
				{selectedDeviceId}
				{displayMode}
				{showLabelsOnImages}
				onselect={() => handleSelect()}
				{ondeviceselect}
				ondevicedrop={handleRearDeviceDrop}
				{ondevicemove}
				{ondevicemoverack}
			/>
		</div>
	</div>
</div>

<style>
	.rack-dual-view {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm, 8px);
		padding: var(--spacing-md, 12px);
		border-radius: var(--radius-md, 8px);
		background: transparent;
		cursor: inherit;
	}

	.rack-dual-view:focus {
		outline: 2px solid var(--colour-selection, #0066ff);
		outline-offset: 2px;
	}

	.rack-dual-view[aria-selected='true'],
	.rack-dual-view.selected {
		outline: 2px solid var(--colour-selection, #0066ff);
		outline-offset: 4px;
	}

	.rack-dual-view-name {
		font-size: 15px;
		font-weight: 500;
		color: var(--colour-text);
		font-family: var(--font-family, system-ui, sans-serif);
		text-align: center;
		margin-bottom: var(--spacing-xs, 4px);
	}

	.rack-dual-view-container {
		display: flex;
		gap: var(--spacing-lg, 24px);
		align-items: flex-start;
	}

	.rack-front,
	.rack-rear {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs, 4px);
	}

	.rack-view-label {
		font-size: 11px;
		font-weight: 500;
		color: var(--colour-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-family: var(--font-family, system-ui, sans-serif);
	}

	/* Hide the rack name inside individual Rack components since we show it at the container level */
	.rack-front :global(.rack-name),
	.rack-rear :global(.rack-name) {
		display: none;
	}

	/* Hide the view toggle since we're showing both views */
	.rack-front :global(.view-toggle-overlay),
	.rack-rear :global(.view-toggle-overlay) {
		display: none;
	}

	/* Remove individual rack selection styling since we handle it at container level */
	.rack-front :global(.rack-container),
	.rack-rear :global(.rack-container) {
		outline: none !important;
	}

	.rack-front :global(.rack-container:focus),
	.rack-rear :global(.rack-container:focus) {
		outline: none !important;
	}
</style>
