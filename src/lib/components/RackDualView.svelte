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

	// Now using faceFilter prop instead of virtual racks

	function handleSelect() {
		onselect?.(new CustomEvent('select', { detail: { rackId: rack.id } }));
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleSelect();
		}
	}

	// Note: Selection is handled by the Rack component's onselect callback
	// No need for separate click handlers on wrapper divs

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
		<div class="rack-front" role="presentation">
			<Rack
				{rack}
				{deviceLibrary}
				selected={false}
				{selectedDeviceId}
				{displayMode}
				{showLabelsOnImages}
				faceFilter="front"
				hideRackName={true}
				viewLabel="FRONT"
				onselect={() => handleSelect()}
				{ondeviceselect}
				ondevicedrop={handleFrontDeviceDrop}
				{ondevicemove}
				{ondevicemoverack}
			/>
		</div>

		<!-- Rear view -->
		<div class="rack-rear" role="presentation">
			<Rack
				{rack}
				{deviceLibrary}
				selected={false}
				{selectedDeviceId}
				{displayMode}
				{showLabelsOnImages}
				faceFilter="rear"
				hideRackName={true}
				viewLabel="REAR"
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
		font-size: 20px;
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
