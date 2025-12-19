<!--
  DevicePalette Component
  Displays the device library with search and category grouping
  Uses exclusive accordion (only one section open at a time)
-->
<script lang="ts">
	import { Accordion } from 'bits-ui';
	import { getLayoutStore } from '$lib/stores/layout.svelte';
	import { getToastStore } from '$lib/stores/toast.svelte';
	import {
		searchDevices,
		groupDevicesByCategory,
		getCategoryDisplayName
	} from '$lib/utils/deviceFilters';
	import { parseDeviceLibraryImport } from '$lib/utils/import';
	import { getBrandPacks } from '$lib/data/brandPacks';
	import DevicePaletteItem from './DevicePaletteItem.svelte';
	import BrandIcon from './BrandIcon.svelte';
	import type { DeviceType } from '$lib/types';

	interface Props {
		onadddevice?: () => void;
		ondeviceselect?: (event: CustomEvent<{ device: DeviceType }>) => void;
	}

	let { onadddevice, ondeviceselect }: Props = $props();

	const layoutStore = getLayoutStore();
	const toastStore = getToastStore();

	// Search state
	let searchQuery = $state('');

	// Accordion state - 'generic' is expanded by default
	let expandedSection = $state<string>('generic');

	// File import ref
	let fileInputRef: HTMLInputElement;

	/**
	 * Device section definition for collapsible groups
	 */
	interface DeviceSection {
		id: string;
		title: string;
		devices: DeviceType[];
		defaultExpanded: boolean;
		/** simple-icons slug for brand logo */
		icon?: string;
	}

	// Get brand packs
	const brandPacks = getBrandPacks();

	// Filter generic devices (from layout store)
	const filteredGenericDevices = $derived(searchDevices(layoutStore.device_types, searchQuery));
	const groupedGenericDevices = $derived(groupDevicesByCategory(filteredGenericDevices));

	// Filter brand pack devices by search
	const filteredBrandPacks = $derived(
		brandPacks.map((pack) => ({
			...pack,
			devices: searchDevices(pack.devices, searchQuery)
		}))
	);

	// Define all sections: Generic first, then brand packs
	const sections = $derived<DeviceSection[]>([
		{
			id: 'generic',
			title: 'Generic',
			devices: filteredGenericDevices,
			defaultExpanded: true
		},
		...filteredBrandPacks
	]);

	// Check if any section has devices (filtered by search)
	const totalDevicesCount = $derived(sections.reduce((acc, s) => acc + s.devices.length, 0));
	const hasDevices = $derived(layoutStore.device_types.length > 0);
	const hasResults = $derived(totalDevicesCount > 0);

	function handleAddDevice() {
		onadddevice?.();
	}

	function handleDeviceSelect(event: CustomEvent<{ device: DeviceType }>) {
		ondeviceselect?.(event);
	}

	function handleImportClick() {
		fileInputRef?.click();
	}

	async function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		try {
			const text = await file.text();

			// Get existing device slugs for duplicate detection
			const existingSlugs = layoutStore.device_types.map((d) => d.slug);

			// Parse and validate the import (returns DeviceType[])
			const result = parseDeviceLibraryImport(text, existingSlugs);

			// Add imported devices to library
			for (const deviceType of result.devices) {
				layoutStore.addDeviceTypeRaw(deviceType);
			}

			// Show success toast
			const message =
				result.skipped > 0
					? `Imported ${result.devices.length} devices (${result.skipped} skipped)`
					: `Imported ${result.devices.length} ${result.devices.length === 1 ? 'device' : 'devices'}`;

			toastStore.showToast(message, 'success');
		} catch {
			toastStore.showToast('Failed to import device library', 'error');
		} finally {
			// Reset file input
			input.value = '';
		}
	}
</script>

<div class="device-palette">
	<!-- Search -->
	<div class="search-container">
		<input
			type="search"
			class="search-input"
			placeholder="Search devices..."
			bind:value={searchQuery}
			aria-label="Search devices"
			data-testid="search-devices"
		/>
	</div>

	<!-- Device List -->
	<div class="device-list">
		{#if !hasDevices}
			<div class="empty-state">
				<p class="empty-message">No devices in library</p>
				<p class="empty-hint">Add a device to get started</p>
			</div>
		{:else if !hasResults}
			<div class="empty-state">
				<p class="empty-message">No devices match your search</p>
			</div>
		{:else}
			<Accordion.Root type="single" bind:value={expandedSection}>
				{#each sections as section (section.id)}
					<Accordion.Item value={section.id} class="accordion-item">
						<Accordion.Header>
							<Accordion.Trigger class="accordion-trigger">
								<span class="section-header">
									{#if section.icon || section.id === 'apc'}
										<BrandIcon slug={section.icon} size={16} />
									{/if}
									<span class="section-title">{section.title}</span>
								</span>
								<span class="section-count">({section.devices.length})</span>
							</Accordion.Trigger>
						</Accordion.Header>
						<Accordion.Content class="accordion-content">
							<div class="accordion-content-inner">
								{#if section.id === 'generic'}
									<!-- Generic section uses category grouping -->
									{#each [...groupedGenericDevices.entries()] as [category, devices] (category)}
										<div class="category-group">
											<h3 class="category-header">{getCategoryDisplayName(category)}</h3>
											<div class="category-devices">
												{#each devices as device (device.slug)}
													<DevicePaletteItem {device} onselect={handleDeviceSelect} />
												{/each}
											</div>
										</div>
									{/each}
								{:else}
									<!-- Brand sections show devices in a flat list -->
									<div class="brand-devices">
										{#each section.devices as device (device.slug)}
											<DevicePaletteItem {device} onselect={handleDeviceSelect} />
										{/each}
									</div>
								{/if}
							</div>
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		{/if}
	</div>

	<!-- Hidden file input for import -->
	<input
		bind:this={fileInputRef}
		type="file"
		accept=".json,application/json"
		onchange={handleFileChange}
		style="display: none;"
		aria-label="Import device library file"
	/>

	<!-- Actions -->
	<div class="actions">
		<div class="actions-row">
			<button
				class="import-button"
				type="button"
				onclick={handleImportClick}
				aria-label="Import device library"
				data-testid="btn-import-devices"
			>
				<span class="import-icon">↓</span>
				Import
			</button>
			<button
				class="add-device-button"
				type="button"
				onclick={handleAddDevice}
				data-testid="btn-add-device"
			>
				<span class="add-icon">+</span>
				Add Device
			</button>
		</div>
	</div>
</div>

<style>
	.device-palette {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.search-container {
		padding: var(--space-4) var(--space-2) var(--space-3);
	}

	.search-input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font-size: var(--font-size-sm);
		color: var(--colour-text);
		background-color: var(--input-bg);
		border: 1px solid var(--input-border);
		border-radius: var(--radius-sm);
		outline: none;
		transition: border-color 0.15s ease;
	}

	.search-input::placeholder {
		color: var(--input-placeholder);
	}

	.search-input:focus {
		border-color: var(--colour-selection);
	}

	.device-list {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-2) 0;
	}

	/* Accordion Trigger Styling */
	:global(.accordion-trigger) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: calc(100% - var(--space-4));
		padding: var(--space-2) var(--space-3);
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-align: left;
		background: var(--colour-surface-secondary);
		border: none;
		border-radius: var(--radius-sm);
		margin: var(--space-1) var(--space-2);
		cursor: pointer;
		color: var(--colour-text);
		transition:
			background-color 150ms ease,
			color 150ms ease;
	}

	:global(.accordion-trigger:hover) {
		background: var(--colour-surface-hover);
	}

	:global(.accordion-trigger:focus-visible) {
		outline: 2px solid var(--colour-selection);
		outline-offset: -2px;
	}

	:global(.accordion-trigger[data-state='open']) {
		background: var(--colour-surface-active);
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex: 1;
	}

	.section-title {
		flex: 1;
	}

	.section-count {
		margin-left: var(--space-2);
		font-weight: 400;
		color: var(--colour-text-muted);
	}

	/* Accordion Content Styling with CSS Grid animation */
	:global(.accordion-content) {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 200ms ease-out;
		overflow: hidden;
	}

	:global(.accordion-content[data-state='open']) {
		grid-template-rows: 1fr;
	}

	:global(.accordion-content[data-state='closed']) {
		grid-template-rows: 0fr;
	}

	:global(.accordion-content-inner) {
		min-height: 0;
		overflow: hidden;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		:global(.accordion-content) {
			transition: none;
		}
	}

	.category-group {
		margin-bottom: var(--space-2);
	}

	.category-header {
		margin: 0;
		padding: var(--space-2) var(--space-3) 4px;
		font-size: var(--font-size-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--colour-text-muted);
	}

	.category-devices {
		display: flex;
		flex-direction: column;
	}

	.brand-devices {
		display: flex;
		flex-direction: column;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-6);
		text-align: center;
	}

	.empty-message {
		margin: 0;
		font-size: var(--font-size-base);
		color: var(--colour-text);
	}

	.empty-hint {
		margin: 4px 0 0;
		font-size: var(--font-size-sm);
		color: var(--colour-text-muted);
	}

	.actions {
		padding: var(--space-3);
	}

	.actions-row {
		display: flex;
		gap: var(--space-2);
	}

	.import-button,
	.add-device-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-1-5);
		flex: 1;
		padding: 10px var(--space-3);
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--colour-text);
		background-color: var(--button-bg);
		border: 1px solid var(--button-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			transform 0.1s ease;
	}

	.import-button:hover,
	.add-device-button:hover {
		background-color: var(--button-bg-hover);
	}

	.import-button:active,
	.add-device-button:active {
		transform: scale(0.98);
	}

	.import-button:focus,
	.add-device-button:focus {
		outline: 2px solid var(--colour-selection);
		outline-offset: 2px;
	}

	.import-icon,
	.add-icon {
		font-size: var(--font-size-base);
		font-weight: bold;
	}
</style>
