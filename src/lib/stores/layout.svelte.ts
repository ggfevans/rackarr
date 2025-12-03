/**
 * Layout Store (v0.2)
 * Central state management for the application using Svelte 5 runes
 * Uses v0.2 types with slug-based device identification
 */

import type { FormFactor, DeviceCategory, Layout, Device } from '$lib/types';
import type {
	LayoutV02,
	RackV02,
	DeviceTypeV02,
	DeviceV02,
	DeviceFaceV02,
	RackView
} from '$lib/types/v02';
import { DEFAULT_DEVICE_FACE } from '$lib/types/constants';
import { createLayoutV02, createRackV02 } from '$lib/utils/serialization-v02';
import {
	createDeviceType as createDeviceTypeHelper,
	findDeviceType,
	addDeviceTypeToLayout,
	removeDeviceTypeFromLayout,
	placeDeviceInRack,
	removeDeviceFromRack as removeDeviceFromRackHelper,
	type CreateDeviceTypeInput
} from '$lib/stores/layout-helpers-v02';
import { migrateToV02 } from '$lib/utils/migrate-v02';
import { migrateLayout } from '$lib/utils/migration';
import { getHistoryStore } from './history.svelte';
import {
	createAddDeviceTypeCommand,
	createUpdateDeviceTypeCommand,
	createDeleteDeviceTypeCommand,
	createPlaceDeviceCommand,
	createMoveDeviceCommand,
	createRemoveDeviceCommand,
	createUpdateDeviceFaceCommand,
	createUpdateRackCommand,
	createClearRackCommand,
	type DeviceTypeCommandStore,
	type DeviceCommandStore,
	type RackCommandStore
} from './commands';

// Module-level state (using $state rune)
let layout = $state<LayoutV02>(createLayoutV02('Untitled'));
let isDirty = $state(false);

// Derived values (using $derived rune)
const rack = $derived(layout.rack);
const device_types = $derived(layout.device_types);
const hasRack = $derived(layout.rack.devices !== undefined);

// Compatibility getters for transition period
// TODO: Remove after all components are updated
const racks = $derived([
	{
		...layout.rack,
		id: 'rack-0', // Synthetic ID for compatibility
		view: layout.rack.view ?? 'front', // Ensure view is always defined
		// Map v0.2 devices to legacy PlacedDevice format
		devices: layout.rack.devices.map((d) => ({
			libraryId: d.device_type,
			position: d.position,
			face: d.face
		}))
	}
]);
const deviceLibrary = $derived(
	layout.device_types.map((dt) => ({
		id: dt.slug,
		name: dt.model ?? dt.slug,
		height: dt.u_height,
		category: dt.rackarr.category,
		colour: dt.rackarr.colour,
		notes: dt.comments
	}))
);
const rackCount = $derived(1); // Always 1 in v0.2
const canAddRack = $derived(false); // No multi-rack in v0.2

/**
 * Reset the store to initial state (primarily for testing)
 */
export function resetLayoutStore(): void {
	layout = createLayoutV02('Untitled');
	isDirty = false;
}

/**
 * Get access to the layout store
 * @returns Store object with state and actions
 */
export function getLayoutStore() {
	return {
		// State getters (v0.2)
		get layout() {
			return layout;
		},
		get isDirty() {
			return isDirty;
		},
		get rack() {
			return rack;
		},
		get device_types() {
			return device_types;
		},
		get hasRack() {
			return hasRack;
		},

		// Compatibility getters (for transition period)
		// TODO: Remove after all components are updated
		get racks() {
			return racks;
		},
		get deviceLibrary() {
			return deviceLibrary;
		},
		get rackCount() {
			return rackCount;
		},
		get canAddRack() {
			return canAddRack;
		},

		// Layout actions
		createNewLayout,
		loadLayout,
		loadLayoutV02,
		resetLayout: resetLayoutStore,

		// Rack actions (simplified for single rack)
		addRack,
		updateRack,
		updateRackView,
		deleteRack,
		reorderRacks, // No-op in v0.2
		duplicateRack, // Not supported in v0.2

		// Device type actions (v0.2 naming)
		addDeviceType,
		updateDeviceType,
		deleteDeviceType,

		// Legacy device library actions (compatibility)
		// TODO: Remove after all components are updated
		addDeviceToLibrary,
		updateDeviceInLibrary,
		deleteDeviceFromLibrary,

		// Placement actions
		placeDevice,
		moveDevice,
		moveDeviceToRack,
		removeDeviceFromRack,
		updateDeviceFace,

		// Settings actions
		updateDisplayMode,
		updateShowLabelsOnImages,

		// Dirty tracking
		markDirty,
		markClean,

		// Raw actions for undo/redo system (bypass dirty tracking)
		addDeviceTypeRaw,
		removeDeviceTypeRaw,
		updateDeviceTypeRaw,
		placeDeviceRaw,
		removeDeviceAtIndexRaw,
		moveDeviceRaw,
		updateDeviceFaceRaw,
		getDeviceAtIndex,
		getPlacedDevicesForType,
		updateRackRaw,
		replaceRackRaw,
		clearRackDevicesRaw,
		restoreRackDevicesRaw,

		// Recorded actions (use undo/redo)
		addDeviceTypeRecorded,
		updateDeviceTypeRecorded,
		deleteDeviceTypeRecorded,
		placeDeviceRecorded,
		moveDeviceRecorded,
		removeDeviceRecorded,
		updateDeviceFaceRecorded,
		updateRackRecorded,
		clearRackRecorded,

		// Undo/Redo
		undo,
		redo,
		clearHistory,
		get canUndo() {
			return getHistoryStore().canUndo;
		},
		get canRedo() {
			return getHistoryStore().canRedo;
		},
		get undoDescription() {
			return getHistoryStore().undoDescription;
		},
		get redoDescription() {
			return getHistoryStore().redoDescription;
		}
	};
}

/**
 * Create a new layout with the given name
 * @param name - Layout name
 */
function createNewLayout(name: string): void {
	layout = createLayoutV02(name);
	isDirty = false;
}

/**
 * Load a v0.2 layout directly
 * @param layoutData - v0.2 layout to load
 */
function loadLayoutV02(layoutData: LayoutV02): void {
	// Ensure runtime view is set
	layout = {
		...layoutData,
		rack: {
			...layoutData.rack,
			view: layoutData.rack.view ?? 'front'
		}
	};
	isDirty = false;
}

/**
 * Load an existing layout (legacy format)
 * Automatically migrates from older versions to v0.2
 * @param layoutData - Legacy layout to load
 * @returns Number of racks that were in the original file (for toast display)
 */
function loadLayout(layoutData: Layout): number {
	// First apply legacy migrations (v0.1.0 → v0.3.0)
	const migrated = migrateLayout(layoutData);
	const originalRackCount = migrated.racks.length;

	// Then migrate to v0.2
	const { layout: v02Layout } = migrateToV02(migrated);

	// Ensure runtime view is set
	layout = {
		...v02Layout,
		rack: {
			...v02Layout.rack,
			view: 'front'
		}
	};
	isDirty = false;

	return originalRackCount;
}

/**
 * Add a new rack to the layout (replaces existing in v0.2)
 * In v0.2, there's only one rack, so this replaces it
 * @param name - Rack name
 * @param height - Rack height in U
 * @param width - Rack width in inches (10 or 19)
 * @param form_factor - Rack form factor
 * @param desc_units - Whether units are numbered top-down
 * @param starting_unit - First U number
 * @returns The created rack object (with id for compatibility)
 */
function addRack(
	name: string,
	height: number,
	width?: number,
	form_factor?: FormFactor,
	desc_units?: boolean,
	starting_unit?: number
): (RackV02 & { id: string }) | null {
	const newRack = createRackV02(
		name,
		height,
		(width as 10 | 19) ?? 19,
		form_factor ?? '4-post-cabinet',
		desc_units ?? false,
		starting_unit ?? 1
	);

	layout = {
		...layout,
		name, // Sync layout name with rack name
		rack: newRack
	};
	isDirty = true;

	// Return with synthetic id for compatibility
	return { ...newRack, id: 'rack-0' };
}

/**
 * Update a rack's properties
 * In v0.2, there's only one rack, so id is ignored
 * @param _id - Rack ID (ignored in v0.2)
 * @param updates - Properties to update
 */
function updateRack(_id: string, updates: Partial<RackV02>): void {
	layout = {
		...layout,
		rack: { ...layout.rack, ...updates }
	};

	// Sync layout name with rack name
	if (updates.name !== undefined) {
		layout = { ...layout, name: updates.name };
	}

	isDirty = true;
}

/**
 * Update a rack's view (front/rear)
 * @param _id - Rack ID (ignored in v0.2)
 * @param view - New view
 */
function updateRackView(_id: string, view: RackView): void {
	updateRack(_id, { view });
}

/**
 * Delete a rack from the layout
 * In v0.2, this resets the rack to empty
 * @param _id - Rack ID (ignored in v0.2)
 */
function deleteRack(_id: string): void {
	layout = {
		...layout,
		rack: {
			...layout.rack,
			devices: []
		}
	};
	isDirty = true;
}

/**
 * Reorder racks by swapping positions
 * No-op in v0.2 (single rack only)
 */
function reorderRacks(_fromIndex: number, _toIndex: number): void {
	// No-op in v0.2 - single rack only
}

/**
 * Duplicate a rack with all its devices
 * Not supported in v0.2 (single rack only)
 * @param _id - Rack ID
 * @returns Error message
 */
function duplicateRack(_id: string): { error?: string } {
	return { error: 'Maximum of 1 rack allowed' };
}

/**
 * Add a device type to the library
 * @param data - Device type data
 * @returns The created device type
 */
function addDeviceType(data: CreateDeviceTypeInput): DeviceTypeV02 {
	const deviceType = createDeviceTypeHelper(data);

	try {
		layout = addDeviceTypeToLayout(layout, deviceType);
		isDirty = true;
		return deviceType;
	} catch {
		// Slug collision - try with modified slug
		const modifiedData = { ...data, name: `${data.name} (copy)` };
		const modifiedDeviceType = createDeviceTypeHelper(modifiedData);
		layout = addDeviceTypeToLayout(layout, modifiedDeviceType);
		isDirty = true;
		return modifiedDeviceType;
	}
}

/**
 * Update a device type in the library
 * @param slug - Device type slug
 * @param updates - Properties to update
 */
function updateDeviceType(slug: string, updates: Partial<DeviceTypeV02>): void {
	layout = {
		...layout,
		device_types: layout.device_types.map((dt) => (dt.slug === slug ? { ...dt, ...updates } : dt))
	};
	isDirty = true;
}

/**
 * Delete a device type from the library
 * Also removes all placed devices referencing it
 * @param slug - Device type slug
 */
function deleteDeviceType(slug: string): void {
	layout = removeDeviceTypeFromLayout(layout, slug);
	isDirty = true;
}

// Legacy device library actions (compatibility wrappers)
// TODO: Remove after all components are updated

/**
 * Add a device to the library (legacy compatibility)
 * @deprecated Use addDeviceType instead
 */
function addDeviceToLibrary(deviceData: {
	name: string;
	height: number;
	category: DeviceCategory;
	colour: string;
	notes?: string;
}): Device {
	const deviceType = addDeviceType({
		name: deviceData.name,
		u_height: deviceData.height,
		category: deviceData.category,
		colour: deviceData.colour,
		comments: deviceData.notes,
		model: deviceData.name // Store name as model for lookup compatibility
	});

	// Return legacy format for compatibility
	return {
		id: deviceType.slug,
		name: deviceType.model ?? deviceType.slug,
		height: deviceType.u_height,
		category: deviceType.rackarr.category,
		colour: deviceType.rackarr.colour,
		notes: deviceType.comments
	};
}

/**
 * Update a device in the library (legacy compatibility)
 * @deprecated Use updateDeviceType instead
 */
function updateDeviceInLibrary(id: string, updates: Partial<Device>): void {
	const typeUpdates: Partial<DeviceTypeV02> = {};

	if (updates.height !== undefined) {
		typeUpdates.u_height = updates.height;
	}
	if (updates.notes !== undefined) {
		typeUpdates.comments = updates.notes;
	}
	if (updates.colour !== undefined || updates.category !== undefined) {
		const existing = findDeviceType(layout.device_types, id);
		if (existing) {
			typeUpdates.rackarr = {
				...existing.rackarr,
				...(updates.colour !== undefined && { colour: updates.colour }),
				...(updates.category !== undefined && { category: updates.category })
			};
		}
	}

	updateDeviceType(id, typeUpdates);
}

/**
 * Delete a device from the library (legacy compatibility)
 * @deprecated Use deleteDeviceType instead
 */
function deleteDeviceFromLibrary(id: string): void {
	deleteDeviceType(id);
}

/**
 * Place a device from the library into the rack
 * @param _rackId - Target rack ID (ignored in v0.2)
 * @param deviceTypeSlug - Device type slug (or legacy libraryId)
 * @param position - U position (bottom of device)
 * @param face - Optional face assignment (defaults to DEFAULT_DEVICE_FACE)
 * @returns true if placed successfully, false otherwise
 */
function placeDevice(
	_rackId: string,
	deviceTypeSlug: string,
	position: number,
	face: DeviceFaceV02 = DEFAULT_DEVICE_FACE
): boolean {
	const deviceType = findDeviceType(layout.device_types, deviceTypeSlug);
	if (!deviceType) return false;

	// Check bounds
	if (position < 1 || position + deviceType.u_height - 1 > layout.rack.height) {
		return false;
	}

	// Check for collisions
	for (const existingDevice of layout.rack.devices) {
		const existingType = findDeviceType(layout.device_types, existingDevice.device_type);
		if (!existingType) continue;

		const existingStart = existingDevice.position;
		const existingEnd = existingDevice.position + existingType.u_height - 1;
		const newStart = position;
		const newEnd = position + deviceType.u_height - 1;

		if (newStart <= existingEnd && newEnd >= existingStart) {
			return false; // Collision
		}
	}

	// Create the device placement
	const device: DeviceV02 = {
		device_type: deviceTypeSlug,
		position,
		face
	};

	try {
		layout = placeDeviceInRack(layout, device);
		isDirty = true;
		return true;
	} catch {
		return false;
	}
}

/**
 * Move a device within the rack
 * @param _rackId - Rack ID (ignored in v0.2)
 * @param deviceIndex - Index of device in rack's devices array
 * @param newPosition - New U position
 * @returns true if moved successfully, false otherwise
 */
function moveDevice(_rackId: string, deviceIndex: number, newPosition: number): boolean {
	if (deviceIndex < 0 || deviceIndex >= layout.rack.devices.length) return false;

	const device = layout.rack.devices[deviceIndex]!;
	const deviceType = findDeviceType(layout.device_types, device.device_type);
	if (!deviceType) return false;

	// Check bounds
	if (newPosition < 1 || newPosition + deviceType.u_height - 1 > layout.rack.height) {
		return false;
	}

	// Check for collisions (excluding the device being moved)
	for (let i = 0; i < layout.rack.devices.length; i++) {
		if (i === deviceIndex) continue;

		const existingDevice = layout.rack.devices[i]!;
		const existingType = findDeviceType(layout.device_types, existingDevice.device_type);
		if (!existingType) continue;

		const existingStart = existingDevice.position;
		const existingEnd = existingDevice.position + existingType.u_height - 1;
		const newStart = newPosition;
		const newEnd = newPosition + deviceType.u_height - 1;

		if (newStart <= existingEnd && newEnd >= existingStart) {
			return false; // Collision
		}
	}

	// Update device position
	layout = {
		...layout,
		rack: {
			...layout.rack,
			devices: layout.rack.devices.map((d, idx) =>
				idx === deviceIndex ? { ...d, position: newPosition } : d
			)
		}
	};
	isDirty = true;

	return true;
}

/**
 * Move a device from one rack to another
 * In v0.2, this just delegates to moveDevice (single rack)
 */
function moveDeviceToRack(
	fromRackId: string,
	deviceIndex: number,
	toRackId: string,
	newPosition: number
): boolean {
	// In v0.2, there's only one rack
	if (fromRackId !== toRackId) {
		console.debug('Cross-rack move blocked in single-rack mode');
		return false;
	}
	return moveDevice(fromRackId, deviceIndex, newPosition);
}

/**
 * Remove a device from the rack
 * @param _rackId - Rack ID (ignored in v0.2)
 * @param deviceIndex - Index of device in rack's devices array
 */
function removeDeviceFromRack(_rackId: string, deviceIndex: number): void {
	if (deviceIndex < 0 || deviceIndex >= layout.rack.devices.length) return;

	layout = removeDeviceFromRackHelper(layout, deviceIndex);
	isDirty = true;
}

/**
 * Update a device's face property
 * @param _rackId - Rack ID (ignored in v0.2)
 * @param deviceIndex - Index of device in rack's devices array
 * @param face - New face value
 */
function updateDeviceFace(_rackId: string, deviceIndex: number, face: DeviceFaceV02): void {
	if (deviceIndex < 0 || deviceIndex >= layout.rack.devices.length) return;

	layout = {
		...layout,
		rack: {
			...layout.rack,
			devices: layout.rack.devices.map((d, idx) => (idx === deviceIndex ? { ...d, face } : d))
		}
	};
	isDirty = true;
}

/**
 * Mark the layout as having unsaved changes
 */
function markDirty(): void {
	isDirty = true;
}

/**
 * Mark the layout as saved (no unsaved changes)
 */
function markClean(): void {
	isDirty = false;
}

/**
 * Update the display mode in layout settings
 * @param mode - Display mode to set ('label' or 'image')
 */
function updateDisplayMode(mode: 'label' | 'image'): void {
	layout = {
		...layout,
		settings: { ...layout.settings, display_mode: mode }
	};
	isDirty = true;
}

/**
 * Update the showLabelsOnImages setting
 * @param value - Boolean value to set
 */
function updateShowLabelsOnImages(value: boolean): void {
	layout = {
		...layout,
		settings: { ...layout.settings, show_labels_on_images: value }
	};
	isDirty = true;
}

// =============================================================================
// Raw Actions for Undo/Redo System
// These bypass dirty tracking and validation - used by the command pattern
// =============================================================================

/**
 * Add a device type directly (raw)
 * @param deviceType - Device type to add
 */
function addDeviceTypeRaw(deviceType: DeviceTypeV02): void {
	layout = {
		...layout,
		device_types: [...layout.device_types, deviceType]
	};
}

/**
 * Remove a device type directly (raw)
 * Also removes any placed devices of this type
 * @param slug - Device type slug to remove
 */
function removeDeviceTypeRaw(slug: string): void {
	layout = {
		...layout,
		device_types: layout.device_types.filter((dt) => dt.slug !== slug),
		rack: {
			...layout.rack,
			devices: layout.rack.devices.filter((d) => d.device_type !== slug)
		}
	};
}

/**
 * Update a device type directly (raw)
 * @param slug - Device type slug to update
 * @param updates - Properties to update
 */
function updateDeviceTypeRaw(slug: string, updates: Partial<DeviceTypeV02>): void {
	layout = {
		...layout,
		device_types: layout.device_types.map((dt) => (dt.slug === slug ? { ...dt, ...updates } : dt))
	};
}

/**
 * Place a device directly (raw) - no validation
 * @param device - Device to place
 * @returns Index where device was placed
 */
function placeDeviceRaw(device: DeviceV02): number {
	const newDevices = [...layout.rack.devices, device];
	layout = {
		...layout,
		rack: {
			...layout.rack,
			devices: newDevices
		}
	};
	return newDevices.length - 1;
}

/**
 * Remove a device at index directly (raw)
 * @param index - Device index to remove
 * @returns The removed device or undefined
 */
function removeDeviceAtIndexRaw(index: number): DeviceV02 | undefined {
	if (index < 0 || index >= layout.rack.devices.length) return undefined;

	const removed = layout.rack.devices[index];
	layout = {
		...layout,
		rack: {
			...layout.rack,
			devices: layout.rack.devices.filter((_, i) => i !== index)
		}
	};
	return removed;
}

/**
 * Move a device directly (raw) - no collision checking
 * @param index - Device index
 * @param newPosition - New position
 * @returns true if moved
 */
function moveDeviceRaw(index: number, newPosition: number): boolean {
	if (index < 0 || index >= layout.rack.devices.length) return false;

	layout = {
		...layout,
		rack: {
			...layout.rack,
			devices: layout.rack.devices.map((d, i) =>
				i === index ? { ...d, position: newPosition } : d
			)
		}
	};
	return true;
}

/**
 * Update a device's face directly (raw)
 * @param index - Device index
 * @param face - New face value
 */
function updateDeviceFaceRaw(index: number, face: 'front' | 'rear'): void {
	if (index < 0 || index >= layout.rack.devices.length) return;

	layout = {
		...layout,
		rack: {
			...layout.rack,
			devices: layout.rack.devices.map((d, i) => (i === index ? { ...d, face } : d))
		}
	};
}

/**
 * Get a device at a specific index
 * @param index - Device index
 * @returns The device or undefined
 */
function getDeviceAtIndex(index: number): DeviceV02 | undefined {
	return layout.rack.devices[index];
}

/**
 * Get all placed devices for a device type
 * @param slug - Device type slug
 * @returns Array of placed devices
 */
function getPlacedDevicesForType(slug: string): DeviceV02[] {
	return layout.rack.devices.filter((d) => d.device_type === slug);
}

/**
 * Update rack settings directly (raw)
 * @param updates - Settings to update
 */
function updateRackRaw(updates: Partial<Omit<RackV02, 'devices' | 'view'>>): void {
	layout = {
		...layout,
		rack: { ...layout.rack, ...updates }
	};
	// Sync layout name with rack name
	if (updates.name !== undefined) {
		layout = { ...layout, name: updates.name };
	}
}

/**
 * Replace the entire rack directly (raw)
 * @param newRack - New rack data
 */
function replaceRackRaw(newRack: RackV02): void {
	layout = {
		...layout,
		rack: newRack,
		name: newRack.name
	};
}

/**
 * Clear all devices from the rack directly (raw)
 * @returns The removed devices
 */
function clearRackDevicesRaw(): DeviceV02[] {
	const removed = [...layout.rack.devices];
	layout = {
		...layout,
		rack: {
			...layout.rack,
			devices: []
		}
	};
	return removed;
}

/**
 * Restore devices to the rack directly (raw)
 * @param devices - Devices to restore
 */
function restoreRackDevicesRaw(devices: DeviceV02[]): void {
	layout = {
		...layout,
		rack: {
			...layout.rack,
			devices: [...devices]
		}
	};
}

// =============================================================================
// Command Store Adapter
// Creates an adapter that implements the command store interfaces
// =============================================================================

function getCommandStoreAdapter(): DeviceTypeCommandStore & DeviceCommandStore & RackCommandStore {
	return {
		// DeviceTypeCommandStore
		addDeviceTypeRaw,
		removeDeviceTypeRaw,
		updateDeviceTypeRaw,
		placeDeviceRaw,
		removeDeviceAtIndexRaw,
		getPlacedDevicesForType,

		// DeviceCommandStore
		moveDeviceRaw,
		updateDeviceFaceRaw,
		getDeviceAtIndex,

		// RackCommandStore
		updateRackRaw,
		replaceRackRaw,
		clearRackDevicesRaw,
		restoreRackDevicesRaw,
		getRack: () => layout.rack
	};
}

// =============================================================================
// Recorded Actions (with Undo/Redo support)
// These create commands and execute them through the history system
// =============================================================================

/**
 * Add a device type with undo/redo support
 */
function addDeviceTypeRecorded(data: CreateDeviceTypeInput): DeviceTypeV02 {
	const deviceType = createDeviceTypeHelper(data);
	const history = getHistoryStore();
	const adapter = getCommandStoreAdapter();

	const command = createAddDeviceTypeCommand(deviceType, adapter);
	history.execute(command);
	isDirty = true;

	return deviceType;
}

/**
 * Update a device type with undo/redo support
 */
function updateDeviceTypeRecorded(slug: string, updates: Partial<DeviceTypeV02>): void {
	const existing = findDeviceType(layout.device_types, slug);
	if (!existing) return;

	// Capture before state for the fields being updated
	const before: Partial<DeviceTypeV02> = {};
	for (const key of Object.keys(updates) as (keyof DeviceTypeV02)[]) {
		before[key] = existing[key] as never;
	}

	const history = getHistoryStore();
	const adapter = getCommandStoreAdapter();

	const command = createUpdateDeviceTypeCommand(slug, before, updates, adapter);
	history.execute(command);
	isDirty = true;
}

/**
 * Delete a device type with undo/redo support
 */
function deleteDeviceTypeRecorded(slug: string): void {
	const existing = findDeviceType(layout.device_types, slug);
	if (!existing) return;

	const placedDevices = getPlacedDevicesForType(slug);
	const history = getHistoryStore();
	const adapter = getCommandStoreAdapter();

	const command = createDeleteDeviceTypeCommand(existing, placedDevices, adapter);
	history.execute(command);
	isDirty = true;
}

/**
 * Place a device with undo/redo support
 * @returns true if placed successfully
 */
function placeDeviceRecorded(
	deviceTypeSlug: string,
	position: number,
	face: DeviceFaceV02 = DEFAULT_DEVICE_FACE
): boolean {
	const deviceType = findDeviceType(layout.device_types, deviceTypeSlug);
	if (!deviceType) return false;

	// Validate bounds
	if (position < 1 || position + deviceType.u_height - 1 > layout.rack.height) {
		return false;
	}

	// Check for collisions
	for (const existingDevice of layout.rack.devices) {
		const existingType = findDeviceType(layout.device_types, existingDevice.device_type);
		if (!existingType) continue;

		const existingStart = existingDevice.position;
		const existingEnd = existingDevice.position + existingType.u_height - 1;
		const newStart = position;
		const newEnd = position + deviceType.u_height - 1;

		if (newStart <= existingEnd && newEnd >= existingStart) {
			return false; // Collision
		}
	}

	const device: DeviceV02 = {
		device_type: deviceTypeSlug,
		position,
		face
	};

	const history = getHistoryStore();
	const adapter = getCommandStoreAdapter();
	const deviceName = deviceType.model ?? deviceType.slug;

	const command = createPlaceDeviceCommand(device, adapter, deviceName);
	history.execute(command);
	isDirty = true;

	return true;
}

/**
 * Move a device with undo/redo support
 * @returns true if moved successfully
 */
function moveDeviceRecorded(deviceIndex: number, newPosition: number): boolean {
	if (deviceIndex < 0 || deviceIndex >= layout.rack.devices.length) return false;

	const device = layout.rack.devices[deviceIndex]!;
	const deviceType = findDeviceType(layout.device_types, device.device_type);
	if (!deviceType) return false;

	// Validate bounds
	if (newPosition < 1 || newPosition + deviceType.u_height - 1 > layout.rack.height) {
		return false;
	}

	// Check for collisions (excluding device being moved)
	for (let i = 0; i < layout.rack.devices.length; i++) {
		if (i === deviceIndex) continue;

		const existingDevice = layout.rack.devices[i]!;
		const existingType = findDeviceType(layout.device_types, existingDevice.device_type);
		if (!existingType) continue;

		const existingStart = existingDevice.position;
		const existingEnd = existingDevice.position + existingType.u_height - 1;
		const newStart = newPosition;
		const newEnd = newPosition + deviceType.u_height - 1;

		if (newStart <= existingEnd && newEnd >= existingStart) {
			return false; // Collision
		}
	}

	const oldPosition = device.position;
	const history = getHistoryStore();
	const adapter = getCommandStoreAdapter();
	const deviceName = deviceType.model ?? deviceType.slug;

	const command = createMoveDeviceCommand(
		deviceIndex,
		oldPosition,
		newPosition,
		adapter,
		deviceName
	);
	history.execute(command);
	isDirty = true;

	return true;
}

/**
 * Remove a device with undo/redo support
 */
function removeDeviceRecorded(deviceIndex: number): void {
	if (deviceIndex < 0 || deviceIndex >= layout.rack.devices.length) return;

	const device = layout.rack.devices[deviceIndex]!;
	const deviceType = findDeviceType(layout.device_types, device.device_type);
	const deviceName = deviceType?.model ?? deviceType?.slug ?? 'device';

	const history = getHistoryStore();
	const adapter = getCommandStoreAdapter();

	const command = createRemoveDeviceCommand(deviceIndex, device, adapter, deviceName);
	history.execute(command);
	isDirty = true;
}

/**
 * Update device face with undo/redo support
 */
function updateDeviceFaceRecorded(deviceIndex: number, face: DeviceFaceV02): void {
	if (deviceIndex < 0 || deviceIndex >= layout.rack.devices.length) return;

	const device = layout.rack.devices[deviceIndex]!;
	const oldFace = device.face ?? 'front';
	const deviceType = findDeviceType(layout.device_types, device.device_type);
	const deviceName = deviceType?.model ?? deviceType?.slug ?? 'device';

	const history = getHistoryStore();
	const adapter = getCommandStoreAdapter();

	const command = createUpdateDeviceFaceCommand(deviceIndex, oldFace, face, adapter, deviceName);
	history.execute(command);
	isDirty = true;
}

/**
 * Update rack settings with undo/redo support
 */
function updateRackRecorded(updates: Partial<Omit<RackV02, 'devices' | 'view'>>): void {
	// Capture before state
	const before: Partial<Omit<RackV02, 'devices' | 'view'>> = {};
	for (const key of Object.keys(updates) as (keyof Omit<RackV02, 'devices' | 'view'>)[]) {
		before[key] = layout.rack[key] as never;
	}

	const history = getHistoryStore();
	const adapter = getCommandStoreAdapter();

	const command = createUpdateRackCommand(before, updates, adapter);
	history.execute(command);
	isDirty = true;
}

/**
 * Clear rack devices with undo/redo support
 */
function clearRackRecorded(): void {
	if (layout.rack.devices.length === 0) return;

	const devices = [...layout.rack.devices];
	const history = getHistoryStore();
	const adapter = getCommandStoreAdapter();

	const command = createClearRackCommand(devices, adapter);
	history.execute(command);
	isDirty = true;
}

// =============================================================================
// Undo/Redo Functions
// =============================================================================

/**
 * Undo the last action
 * @returns true if undo was performed
 */
function undo(): boolean {
	const history = getHistoryStore();
	const result = history.undo();
	if (result) {
		isDirty = true;
	}
	return result;
}

/**
 * Redo the last undone action
 * @returns true if redo was performed
 */
function redo(): boolean {
	const history = getHistoryStore();
	const result = history.redo();
	if (result) {
		isDirty = true;
	}
	return result;
}

/**
 * Clear all undo/redo history
 */
function clearHistory(): void {
	getHistoryStore().clear();
}
