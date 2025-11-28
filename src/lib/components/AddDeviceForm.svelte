<!--
  AddDeviceForm Component
  Form dialog for adding a new device to the library
-->
<script lang="ts">
	import Dialog from './Dialog.svelte';
	import type { DeviceCategory } from '$lib/types';
	import {
		ALL_CATEGORIES,
		CATEGORY_COLOURS,
		MIN_DEVICE_HEIGHT,
		MAX_DEVICE_HEIGHT
	} from '$lib/types/constants';
	import { getDefaultColour } from '$lib/utils/device';

	interface Props {
		open: boolean;
		onadd?: (data: {
			name: string;
			height: number;
			category: DeviceCategory;
			colour: string;
			notes: string;
		}) => void;
		oncancel?: () => void;
	}

	let { open, onadd, oncancel }: Props = $props();

	// Form state
	let name = $state('');
	let height = $state(1);
	let category = $state<DeviceCategory>('server');
	let colour = $state(getDefaultColour('server'));
	let notes = $state('');
	let userChangedColour = $state(false);

	// Validation errors
	let nameError = $state('');
	let heightError = $state('');

	// Reset form when dialog opens
	$effect(() => {
		if (open) {
			name = '';
			height = 1;
			category = 'server';
			colour = getDefaultColour('server');
			notes = '';
			userChangedColour = false;
			nameError = '';
			heightError = '';
		}
	});

	// Update colour when category changes (unless user manually changed it)
	function handleCategoryChange(event: Event) {
		const newCategory = (event.target as HTMLSelectElement).value as DeviceCategory;
		category = newCategory;
		if (!userChangedColour) {
			colour = getDefaultColour(newCategory);
		}
	}

	function handleColourChange(event: Event) {
		colour = (event.target as HTMLInputElement).value;
		userChangedColour = true;
	}

	function getCategoryLabel(cat: DeviceCategory): string {
		const labels: Record<DeviceCategory, string> = {
			server: 'Server',
			network: 'Network',
			'patch-panel': 'Patch Panel',
			power: 'Power',
			storage: 'Storage',
			kvm: 'KVM',
			'av-media': 'AV/Media',
			cooling: 'Cooling',
			blank: 'Blank Panel',
			other: 'Other'
		};
		return labels[cat];
	}

	function validate(): boolean {
		let valid = true;
		nameError = '';
		heightError = '';

		if (!name.trim()) {
			nameError = 'Name is required';
			valid = false;
		}

		if (height < MIN_DEVICE_HEIGHT || height > MAX_DEVICE_HEIGHT) {
			heightError = `Height must be between ${MIN_DEVICE_HEIGHT} and ${MAX_DEVICE_HEIGHT}`;
			valid = false;
		}

		return valid;
	}

	function handleSubmit() {
		if (validate()) {
			onadd?.({
				name: name.trim(),
				height,
				category,
				colour,
				notes: notes.trim()
			});
		}
	}

	function handleCancel() {
		oncancel?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && event.target instanceof HTMLTextAreaElement === false) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<Dialog {open} title="Add Device" onclose={handleCancel}>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<form class="add-device-form" onsubmit={(e) => e.preventDefault()} onkeydown={handleKeyDown}>
		<div class="form-group">
			<label for="device-name">Name</label>
			<input
				type="text"
				id="device-name"
				bind:value={name}
				placeholder="e.g., Dell PowerEdge R740"
				class:error={nameError}
			/>
			{#if nameError}
				<span class="error-message">{nameError}</span>
			{/if}
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="device-height">Height (U)</label>
				<input
					type="number"
					id="device-height"
					bind:value={height}
					min={MIN_DEVICE_HEIGHT}
					max={MAX_DEVICE_HEIGHT}
					class:error={heightError}
				/>
				{#if heightError}
					<span class="error-message">{heightError}</span>
				{/if}
			</div>

			<div class="form-group">
				<label for="device-category">Category</label>
				<select id="device-category" value={category} onchange={handleCategoryChange}>
					{#each ALL_CATEGORIES as cat (cat)}
						<option value={cat}>{getCategoryLabel(cat)}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="form-group">
			<label for="device-colour">Colour</label>
			<div class="colour-input-wrapper">
				<input
					type="color"
					id="device-colour"
					value={colour}
					onchange={handleColourChange}
					class="colour-input"
				/>
				<span class="colour-hex">{colour}</span>
			</div>
			<div class="colour-presets">
				{#each ALL_CATEGORIES as cat (cat)}
					<button
						type="button"
						class="colour-preset"
						style="background-color: {CATEGORY_COLOURS[cat]}"
						title={getCategoryLabel(cat)}
						onclick={() => {
							colour = CATEGORY_COLOURS[cat];
							userChangedColour = true;
						}}
						aria-label="Use {getCategoryLabel(cat)} colour"
					></button>
				{/each}
			</div>
		</div>

		<div class="form-group">
			<label for="device-notes">Notes (optional)</label>
			<textarea
				id="device-notes"
				bind:value={notes}
				placeholder="Additional notes about the device..."
				rows="3"
			></textarea>
		</div>

		<div class="form-actions">
			<button type="button" class="btn btn-secondary" onclick={handleCancel}> Cancel </button>
			<button type="submit" class="btn btn-primary" onclick={handleSubmit}> Add </button>
		</div>
	</form>
</Dialog>

<style>
	.add-device-form {
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
		font-weight: 500;
		color: var(--colour-text);
		font-size: 14px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 16px;
	}

	.form-group input[type='text'],
	.form-group input[type='number'],
	.form-group select,
	.form-group textarea {
		padding: 10px 12px;
		background: var(--colour-input-bg, var(--colour-bg));
		border: 1px solid var(--colour-border);
		border-radius: 6px;
		color: var(--colour-text);
		font-size: 14px;
		font-family: inherit;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 60px;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--colour-selection);
		box-shadow: 0 0 0 2px var(--colour-selection-bg, rgba(74, 144, 217, 0.2));
	}

	.form-group input.error {
		border-color: var(--colour-error, #e74c3c);
	}

	.error-message {
		font-size: 13px;
		color: var(--colour-error, #e74c3c);
	}

	.colour-input-wrapper {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.colour-input {
		width: 50px;
		height: 36px;
		padding: 2px;
		border: 1px solid var(--colour-border);
		border-radius: 4px;
		background: transparent;
		cursor: pointer;
	}

	.colour-input::-webkit-color-swatch {
		border: none;
		border-radius: 2px;
	}

	.colour-hex {
		font-family: monospace;
		font-size: 14px;
		color: var(--colour-text-muted);
	}

	.colour-presets {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		margin-top: 8px;
	}

	.colour-preset {
		width: 24px;
		height: 24px;
		border: 1px solid var(--colour-border);
		border-radius: 4px;
		cursor: pointer;
		padding: 0;
		transition: transform var(--transition-fast);
	}

	.colour-preset:hover {
		transform: scale(1.1);
	}

	.colour-preset:focus-visible {
		outline: 2px solid var(--colour-selection);
		outline-offset: 2px;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 8px;
	}

	.btn {
		padding: 10px 20px;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn-secondary {
		background: var(--colour-button-bg, #3a3a3a);
		color: var(--colour-text);
	}

	.btn-secondary:hover {
		background: var(--colour-button-hover);
	}

	.btn-primary {
		background: var(--colour-selection);
		color: white;
	}

	.btn-primary:hover {
		background: var(--colour-selection-hover, #3a7bbf);
	}
</style>
