<!--
  EditPanel Component
  Right drawer for editing selected racks and viewing device info
-->
<script lang="ts">
	import Drawer from './Drawer.svelte';
	import ColourSwatch from './ColourSwatch.svelte';
	import { getLayoutStore } from '$lib/stores/layout.svelte';
	import { getSelectionStore } from '$lib/stores/selection.svelte';
	import { getUIStore } from '$lib/stores/ui.svelte';
	import { getCanvasStore } from '$lib/stores/canvas.svelte';
	import { getCategoryDisplayName } from '$lib/utils/deviceFilters';
	import { COMMON_RACK_HEIGHTS } from '$lib/types/constants';
	import type { Rack, DeviceType, PlacedDevice, DeviceFace } from '$lib/types';

	// Synthetic rack ID for single-rack mode
	const RACK_ID = 'rack-0';

	const layoutStore = getLayoutStore();
	const selectionStore = getSelectionStore();
	const uiStore = getUIStore();
	const canvasStore = getCanvasStore();

	// Local state for form fields
	let rackName = $state('');
	let rackHeight = $state(42);

	// State for device name editing
	let editingDeviceName = $state(false);
	let deviceNameInput = $state('');

	// Get the selected rack if any (single-rack mode)
	const selectedRack = $derived.by(() => {
		if (!selectionStore.isRackSelected || selectionStore.selectedId !== RACK_ID) return null;
		return layoutStore.rack;
	});

	// Get the selected device info if any (single-rack mode)
	const selectedDeviceInfo = $derived.by(
		(): {
			device: DeviceType;
			placedDevice: PlacedDevice;
			rack: Rack;
		} | null => {
			if (!selectionStore.isDeviceSelected) return null;
			if (
				selectionStore.selectedRackId === null ||
				selectionStore.selectedDeviceIndex === null ||
				selectionStore.selectedId === null
			)
				return null;

			const rack = layoutStore.rack;
			if (!rack) return null;

			const placedDevice = rack.devices[selectionStore.selectedDeviceIndex];
			if (!placedDevice) return null;

			const device = layoutStore.device_types.find((d) => d.slug === selectionStore.selectedId);
			if (!device) return null;

			return { device, placedDevice, rack };
		}
	);

	// Auto-open drawer on selection, close on deselection
	$effect(() => {
		if (selectionStore.hasSelection) {
			uiStore.openRightDrawer();
		} else {
			uiStore.closeRightDrawer();
		}
	});

	// Sync local state with selected rack
	$effect(() => {
		if (selectedRack) {
			rackName = selectedRack.name;
			rackHeight = selectedRack.height;
		}
	});

	// Check if rack has devices (prevents height editing)
	const rackHasDevices = $derived(selectedRack ? selectedRack.devices.length > 0 : false);

	// Update rack name on blur
	function handleNameBlur() {
		if (selectedRack && rackName !== selectedRack.name) {
			layoutStore.updateRack(RACK_ID, { name: rackName });
		}
	}

	// Update rack name on Enter
	function handleNameKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			(event.target as HTMLInputElement).blur();
		}
	}

	// Update rack height
	function handleHeightChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const newHeight = parseInt(target.value, 10);
		if (selectedRack && !rackHasDevices && newHeight >= 1 && newHeight <= 100) {
			layoutStore.updateRack(RACK_ID, { height: newHeight });
			// Reset view to center the resized rack
			canvasStore.fitAll(layoutStore.rack ? [layoutStore.rack] : []);
		}
	}

	// Delete selected rack
	function handleDeleteRack() {
		if (selectedRack) {
			layoutStore.deleteRack(RACK_ID);
			selectionStore.clearSelection();
		}
	}

	// Remove device from rack
	function handleRemoveDevice() {
		if (selectionStore.selectedRackId !== null && selectionStore.selectedDeviceIndex !== null) {
			layoutStore.removeDeviceFromRack(
				selectionStore.selectedRackId,
				selectionStore.selectedDeviceIndex
			);
			selectionStore.clearSelection();
		}
	}

	// Update device face
	function handleFaceChange(face: DeviceFace) {
		if (selectionStore.selectedRackId !== null && selectionStore.selectedDeviceIndex !== null) {
			layoutStore.updateDeviceFace(
				selectionStore.selectedRackId,
				selectionStore.selectedDeviceIndex,
				face
			);
		}
	}

	// Start editing device name
	function startEditingDeviceName() {
		if (selectedDeviceInfo) {
			const deviceName = selectedDeviceInfo.device.model ?? selectedDeviceInfo.device.slug;
			deviceNameInput = selectedDeviceInfo.placedDevice.name ?? deviceName;
			editingDeviceName = true;
		}
	}

	// Save device name
	function saveDeviceName() {
		if (
			selectionStore.selectedRackId !== null &&
			selectionStore.selectedDeviceIndex !== null &&
			selectedDeviceInfo
		) {
			const newName = deviceNameInput.trim();
			const deviceName = selectedDeviceInfo.device.model ?? selectedDeviceInfo.device.slug;
			// If same as device type name, clear the custom name
			const nameToSave = newName === deviceName || newName === '' ? undefined : newName;
			layoutStore.updateDeviceName(
				selectionStore.selectedRackId,
				selectionStore.selectedDeviceIndex,
				nameToSave
			);
		}
		editingDeviceName = false;
	}

	// Handle device name input keydown
	function handleDeviceNameKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			saveDeviceName();
		} else if (event.key === 'Escape') {
			editingDeviceName = false;
		}
	}

	// Close drawer
	function handleClose() {
		uiStore.closeRightDrawer();
		selectionStore.clearSelection();
	}
</script>

<Drawer
	side="right"
	open={uiStore.rightDrawerOpen}
	title="Edit"
	showClose={false}
	onclose={handleClose}
>
	{#if selectedRack}
		<!-- Rack editing form -->
		<div class="edit-form">
			<div class="form-group">
				<label for="rack-name">Name</label>
				<input
					type="text"
					id="rack-name"
					class="input-field"
					bind:value={rackName}
					onblur={handleNameBlur}
					onkeydown={handleNameKeydown}
				/>
			</div>

			<div class="form-group">
				<label for="rack-height">Height</label>
				{#if rackHasDevices}
					<input type="number" id="rack-height" class="input-field" value={rackHeight} disabled />
					<p class="helper-text warning">Remove all devices to resize</p>
				{:else}
					<input
						type="number"
						id="rack-height"
						class="input-field"
						bind:value={rackHeight}
						onchange={handleHeightChange}
						min="1"
						max="100"
					/>
					<div class="height-presets">
						{#each COMMON_RACK_HEIGHTS as preset (preset)}
							<button
								type="button"
								class="preset-btn"
								class:active={rackHeight === preset}
								onclick={() => {
									rackHeight = preset;
									if (selectedRack) {
										layoutStore.updateRack(RACK_ID, { height: preset });
										// Reset view to center the resized rack
										canvasStore.fitAll(layoutStore.rack ? [layoutStore.rack] : []);
									}
								}}
							>
								{preset}U
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="info-section">
				<div class="info-row">
					<span class="info-label">Devices</span>
					<span class="info-value">{selectedRack.devices.length}</span>
				</div>
			</div>

			<div class="actions">
				<button
					type="button"
					class="btn-danger"
					onclick={handleDeleteRack}
					aria-label="Delete rack"
				>
					Delete Rack
				</button>
			</div>
		</div>
	{:else if selectedDeviceInfo}
		<!-- Device view -->
		<div class="device-view">
			<div class="device-header">
				<ColourSwatch colour={selectedDeviceInfo.device.colour} size={24} />
				<span class="device-name"
					>{selectedDeviceInfo.device.model ?? selectedDeviceInfo.device.slug}</span
				>
			</div>

			<!-- Display Name (click-to-edit) -->
			<div class="display-name-section">
				<span class="info-label">Display Name</span>
				{#if editingDeviceName}
					<input
						type="text"
						class="display-name-input"
						bind:value={deviceNameInput}
						onblur={saveDeviceName}
						onkeydown={handleDeviceNameKeydown}
					/>
				{:else}
					<button
						type="button"
						class="display-name-display"
						onclick={startEditingDeviceName}
						aria-label="Edit display name"
					>
						<span class="display-name-text">
							{selectedDeviceInfo.placedDevice.name ??
								selectedDeviceInfo.device.model ??
								selectedDeviceInfo.device.slug}
						</span>
						<svg
							class="edit-icon"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
							<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
						</svg>
					</button>
				{/if}
			</div>

			<div class="info-section">
				<div class="info-row">
					<span class="info-label">Height</span>
					<span class="info-value">{selectedDeviceInfo.device.u_height}U</span>
				</div>
				<div class="info-row">
					<span class="info-label">Category</span>
					<span class="info-value"
						>{getCategoryDisplayName(selectedDeviceInfo.device.category)}</span
					>
				</div>
				<div class="info-row">
					<span class="info-label">Position</span>
					<span class="info-value">U{selectedDeviceInfo.placedDevice.position}</span>
				</div>
				<div class="info-row">
					<span class="info-label">Colour</span>
					<span class="info-value colour-info">
						<ColourSwatch colour={selectedDeviceInfo.device.colour} size={16} />
						{selectedDeviceInfo.device.colour}
					</span>
				</div>
			</div>

			<!-- Face selector -->
			<fieldset class="face-selector" aria-label="Mounted face">
				<legend>Mounted Face</legend>
				<div class="radio-group">
					<label>
						<input
							type="radio"
							name="device-face"
							value="front"
							checked={selectedDeviceInfo.placedDevice.face === 'front'}
							onchange={() => handleFaceChange('front')}
						/>
						Front
					</label>
					<label>
						<input
							type="radio"
							name="device-face"
							value="rear"
							checked={selectedDeviceInfo.placedDevice.face === 'rear'}
							onchange={() => handleFaceChange('rear')}
						/>
						Rear
					</label>
					<label>
						<input
							type="radio"
							name="device-face"
							value="both"
							checked={selectedDeviceInfo.placedDevice.face === 'both'}
							onchange={() => handleFaceChange('both')}
						/>
						Both (full-depth)
					</label>
				</div>
			</fieldset>

			<!-- Power device properties -->
			{#if selectedDeviceInfo.device.category === 'power' && (selectedDeviceInfo.device.outlet_count || selectedDeviceInfo.device.va_rating)}
				<div class="info-section">
					{#if selectedDeviceInfo.device.outlet_count}
						<div class="info-row">
							<span class="info-label">Outlets</span>
							<span class="info-value">{selectedDeviceInfo.device.outlet_count}</span>
						</div>
					{/if}
					{#if selectedDeviceInfo.device.va_rating}
						<div class="info-row">
							<span class="info-label">VA Rating</span>
							<span class="info-value">{selectedDeviceInfo.device.va_rating}</span>
						</div>
					{/if}
				</div>
			{/if}

			{#if selectedDeviceInfo.device.notes}
				<div class="notes-section">
					<span class="info-label">Notes</span>
					<p class="notes-text">{selectedDeviceInfo.device.notes}</p>
				</div>
			{/if}

			<div class="actions">
				<button
					type="button"
					class="btn-danger"
					onclick={handleRemoveDevice}
					aria-label="Remove from rack"
				>
					Remove from Rack
				</button>
			</div>
		</div>
	{/if}
</Drawer>

<style>
	.edit-form,
	.device-view {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1-5);
	}

	.form-group label {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--colour-text);
	}

	.form-group input {
		padding: var(--space-2) var(--space-3);
		background: var(--input-bg);
		border: 1px solid var(--input-border);
		border-radius: var(--radius-sm);
		color: var(--colour-text);
		font-size: var(--font-size-base);
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--colour-selection);
	}

	.form-group input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.helper-text {
		font-size: var(--font-size-sm);
		margin: 0;
		color: var(--colour-text-muted);
	}

	.helper-text.warning {
		color: var(--colour-warning);
	}

	.height-presets {
		display: flex;
		gap: var(--space-2);
		margin-top: 4px;
	}

	.preset-btn {
		padding: 4px var(--space-2);
		background: var(--button-bg);
		border: 1px solid var(--colour-border);
		border-radius: var(--radius-sm);
		color: var(--colour-text);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: background-color var(--duration-fast);
	}

	.preset-btn:hover {
		background: var(--button-bg-hover);
	}

	.preset-btn.active {
		background: var(--colour-selection);
		border-color: var(--colour-selection);
		color: white;
	}

	.info-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--colour-surface);
		border-radius: var(--radius-sm);
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.info-label {
		font-size: var(--font-size-sm);
		color: var(--colour-text-muted);
	}

	.info-value {
		font-size: var(--font-size-base);
		color: var(--colour-text);
	}

	.colour-info {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: monospace;
	}

	.device-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--colour-border);
	}

	.device-name {
		font-size: var(--font-size-md);
		font-weight: 600;
	}

	.display-name-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-1-5);
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--colour-border);
	}

	.display-name-display {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: var(--colour-surface);
		border: 1px solid var(--colour-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		text-align: left;
		color: var(--colour-text);
		font-size: var(--font-size-base);
		transition: border-color 0.15s ease;
	}

	.display-name-display:hover {
		border-color: var(--colour-selection);
	}

	.display-name-display:focus {
		outline: 2px solid var(--colour-selection);
		outline-offset: 2px;
	}

	.display-name-text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.edit-icon {
		flex-shrink: 0;
		opacity: 0.6;
	}

	.display-name-display:hover .edit-icon {
		opacity: 1;
	}

	.display-name-input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font-size: var(--font-size-base);
		border: 1px solid var(--colour-selection);
		border-radius: var(--radius-sm);
		background: var(--colour-bg);
		color: var(--colour-text);
		outline: none;
	}

	.display-name-input:focus {
		box-shadow: var(--glow-pink-sm);
	}

	.notes-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-1-5);
	}

	.notes-text {
		font-size: var(--font-size-base);
		margin: 0;
		padding: var(--space-3);
		background: var(--colour-surface);
		border-radius: var(--radius-sm);
		white-space: pre-wrap;
	}

	.actions {
		margin-top: auto;
		padding-top: var(--space-4);
		border-top: 1px solid var(--colour-border);
	}

	.btn-danger {
		width: 100%;
		padding: 10px var(--space-4);
		background: var(--colour-error);
		border: none;
		border-radius: var(--radius-sm);
		color: white;
		font-size: var(--font-size-base);
		font-weight: 500;
		cursor: pointer;
		transition: background-color var(--duration-fast);
	}

	.btn-danger:hover {
		background: var(--colour-error-hover);
	}

	.face-selector {
		border: 1px solid var(--colour-border);
		border-radius: var(--radius-sm);
		padding: var(--space-3);
		margin: 0;
	}

	.face-selector legend {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--colour-text);
		padding: 0 4px;
	}

	.radio-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.radio-group label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--font-size-base);
		color: var(--colour-text);
		cursor: pointer;
	}

	.radio-group input[type='radio'] {
		width: 16px;
		height: 16px;
		cursor: pointer;
	}
</style>
