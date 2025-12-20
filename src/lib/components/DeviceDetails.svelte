<!--
  DeviceDetails Component
  Displays detailed information about a device
  Used in bottom sheet (mobile) and potentially edit panel (desktop)
-->
<script lang="ts">
	import type { PlacedDevice, DeviceType, RackView } from '$lib/types';
	import CategoryIcon from './CategoryIcon.svelte';

	interface Props {
		device: PlacedDevice;
		deviceType: DeviceType;
		rackView?: RackView;
		rackHeight?: number;
	}

	let { device, deviceType, rackView: _rackView = 'front', rackHeight: _rackHeight }: Props = $props();

	// Display name: custom name if set, otherwise device type model/slug
	const displayName = $derived(device.name ?? deviceType.model ?? deviceType.slug);

	// Format position display (e.g., "U12-U13, Front")
	const positionDisplay = $derived.by(() => {
		const topU = device.position + deviceType.u_height - 1;
		const positionStr =
			deviceType.u_height === 1 ? `U${device.position}` : `U${device.position}-U${topU}`;
		const faceStr = device.face === 'both' ? 'Both Faces' : device.face === 'front' ? 'Front' : 'Rear';
		return `${positionStr}, ${faceStr}`;
	});

	// Height display (e.g., "2U")
	const heightDisplay = $derived(`${deviceType.u_height}U`);
</script>

<div class="device-details">
	<!-- Device Name -->
	<div class="detail-section name-section">
		<h3 class="device-name">{displayName}</h3>
	</div>

	<!-- Primary Info (Height, Category, Position) -->
	<div class="detail-section info-section">
		<div class="info-row">
			<span class="info-label">Height</span>
			<span class="info-value">{heightDisplay}</span>
		</div>

		<div class="info-row">
			<span class="info-label">Category</span>
			<span class="info-value category-value">
				<CategoryIcon category={deviceType.category} size={16} />
				<span>{deviceType.category}</span>
			</span>
		</div>

		<div class="info-row">
			<span class="info-label">Position</span>
			<span class="info-value">{positionDisplay}</span>
		</div>
	</div>

	<!-- Optional Info (Manufacturer, Part Number) -->
	{#if deviceType.manufacturer || deviceType.part_number}
		<div class="detail-section optional-section">
			{#if deviceType.manufacturer}
				<div class="info-row">
					<span class="info-label">Manufacturer</span>
					<span class="info-value">{deviceType.manufacturer}</span>
				</div>
			{/if}

			{#if deviceType.part_number}
				<div class="info-row">
					<span class="info-label">Part Number</span>
					<span class="info-value">{deviceType.part_number}</span>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Notes -->
	{#if device.notes}
		<div class="detail-section notes-section">
			<span class="info-label">Notes</span>
			<p class="notes-text">{device.notes}</p>
		</div>
	{/if}
</div>

<style>
	.device-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-size: 0.875rem;
	}

	.detail-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.name-section {
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.device-name {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: var(--color-text);
	}

	.info-section,
	.optional-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.info-label {
		font-weight: 500;
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.info-value {
		text-align: right;
		color: var(--color-text);
		flex-grow: 1;
	}

	.category-value {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.notes-section {
		padding-top: 0.5rem;
		border-top: 1px solid var(--color-border);
	}

	.notes-text {
		margin: 0;
		color: var(--color-text);
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
