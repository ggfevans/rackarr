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
	import { COMMON_RACK_HEIGHTS } from '$lib/types/constants';
	import type { Rack, Device, PlacedDevice, DeviceFace } from '$lib/types';

	const layoutStore = getLayoutStore();
	const selectionStore = getSelectionStore();
	const uiStore = getUIStore();

	// Local state for form fields
	let rackName = $state('');
	let rackHeight = $state(42);

	// State for device name editing
	let editingDeviceName = $state(false);
	let deviceNameInput = $state('');

	// Get the selected rack if any
	const selectedRack = $derived.by(() => {
		if (!selectionStore.isRackSelected || !selectionStore.selectedId) return null;
		return layoutStore.racks.find((r) => r.id === selectionStore.selectedId) || null;
	});

	// Get the selected device info if any
	const selectedDeviceInfo = $derived.by(
		(): {
			device: Device;
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

			const rack = layoutStore.racks.find((r) => r.id === selectionStore.selectedRackId);
			if (!rack) return null;

			const placedDevice = rack.devices[selectionStore.selectedDeviceIndex];
			if (!placedDevice) return null;

			const device = layoutStore.deviceLibrary.find((d) => d.id === selectionStore.selectedId);
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
			layoutStore.updateRack(selectedRack.id, { name: rackName });
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
			layoutStore.updateRack(selectedRack.id, { height: newHeight });
		}
	}

	// Delete selected rack
	function handleDeleteRack() {
		if (selectedRack) {
			layoutStore.deleteRack(selectedRack.id);
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
			deviceNameInput = selectedDeviceInfo.placedDevice.name ?? selectedDeviceInfo.device.name;
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
			// If same as device type name, clear the custom name
			const nameToSave =
				newName === selectedDeviceInfo.device.name || newName === '' ? undefined : newName;
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

	// Format category name for display
	function formatCategory(category: string): string {
		return category
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}
</script>

<Drawer side="right" open={uiStore.rightDrawerOpen} title="Edit" onclose={handleClose}>
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
										layoutStore.updateRack(selectedRack.id, { height: preset });
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
				<span class="device-name">{selectedDeviceInfo.device.name}</span>
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
							{selectedDeviceInfo.placedDevice.name ?? selectedDeviceInfo.device.name}
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
					<span class="info-value">{selectedDeviceInfo.device.height}U</span>
				</div>
				<div class="info-row">
					<span class="info-label">Category</span>
					<span class="info-value">{formatCategory(selectedDeviceInfo.device.category)}</span>
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
		gap: 16px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-group label {
		font-size: 12px;
		font-weight: 600;
		color: var(--colour-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.form-group input {
		padding: 8px 12px;
		background: var(--input-bg);
		border: 1px solid var(--input-border);
		border-radius: 4px;
		color: var(--colour-text);
		font-size: 14px;
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
		font-size: 12px;
		margin: 0;
		color: var(--colour-text-muted);
	}

	.helper-text.warning {
		color: var(--colour-warning, #f59e0b);
	}

	.height-presets {
		display: flex;
		gap: 8px;
		margin-top: 4px;
	}

	.preset-btn {
		padding: 4px 8px;
		background: var(--button-bg);
		border: 1px solid var(--colour-border);
		border-radius: 4px;
		color: var(--colour-text);
		font-size: 12px;
		cursor: pointer;
		transition: background-color var(--transition-fast);
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
		gap: 8px;
		padding: 12px;
		background: var(--colour-surface);
		border-radius: 4px;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.info-label {
		font-size: 12px;
		color: var(--colour-text-muted);
	}

	.info-value {
		font-size: 14px;
		color: var(--colour-text);
	}

	.colour-info {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: monospace;
	}

	.device-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--colour-border);
	}

	.device-name {
		font-size: 16px;
		font-weight: 600;
	}

	.display-name-section {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px 0;
		border-bottom: 1px solid var(--colour-border);
	}

	.display-name-display {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		width: 100%;
		padding: 8px 12px;
		background: var(--colour-surface);
		border: 1px solid var(--colour-border);
		border-radius: 4px;
		cursor: pointer;
		text-align: left;
		color: var(--colour-text);
		font-size: 14px;
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
		padding: 8px 12px;
		font-size: 14px;
		border: 1px solid var(--colour-selection);
		border-radius: 4px;
		background: var(--colour-bg);
		color: var(--colour-text);
		outline: none;
	}

	.display-name-input:focus {
		box-shadow: 0 0 0 2px var(--colour-selection-muted, rgba(0, 102, 255, 0.2));
	}

	.notes-section {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.notes-text {
		font-size: 14px;
		margin: 0;
		padding: 12px;
		background: var(--colour-surface);
		border-radius: 4px;
		white-space: pre-wrap;
	}

	.actions {
		margin-top: auto;
		padding-top: 16px;
		border-top: 1px solid var(--colour-border);
	}

	.btn-danger {
		width: 100%;
		padding: 10px 16px;
		background: var(--colour-danger, #dc2626);
		border: none;
		border-radius: 4px;
		color: white;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color var(--transition-fast);
	}

	.btn-danger:hover {
		background: var(--colour-danger-hover, #b91c1c);
	}

	.face-selector {
		border: 1px solid var(--colour-border);
		border-radius: 4px;
		padding: 12px;
		margin: 0;
	}

	.face-selector legend {
		font-size: 12px;
		font-weight: 600;
		color: var(--colour-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 0 4px;
	}

	.radio-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.radio-group label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: var(--colour-text);
		cursor: pointer;
	}

	.radio-group input[type='radio'] {
		width: 16px;
		height: 16px;
		cursor: pointer;
	}
</style>
