/**
 * Layout Store
 * Central state management for the application using Svelte 5 runes
 */

import type { Layout, Rack, Device, DeviceCategory } from '$lib/types';
import { DEFAULT_DEVICE_FACE } from '$lib/types/constants';
import { createLayout } from '$lib/utils/serialization';
import { createRack, duplicateRack as duplicateRackUtil } from '$lib/utils/rack';
import { generateId } from '$lib/utils/device';
import { canPlaceDevice, findCollisions } from '$lib/utils/collision';
import { migrateLayout } from '$lib/utils/migration';

// Maximum number of racks allowed
const MAX_RACKS = 6;

// Module-level state (using $state rune)
let layout = $state<Layout>(createLayout('Untitled'));
let isDirty = $state(false);

// Derived values (using $derived rune)
const racks = $derived(layout.racks);
const deviceLibrary = $derived(layout.deviceLibrary);
const rackCount = $derived(layout.racks.length);
const canAddRack = $derived(layout.racks.length < MAX_RACKS);

/**
 * Reset the store to initial state (primarily for testing)
 */
export function resetLayoutStore(): void {
	layout = createLayout('Untitled');
	isDirty = false;
}

/**
 * Get access to the layout store
 * @returns Store object with state and actions
 */
export function getLayoutStore() {
	return {
		// State getters
		get layout() {
			return layout;
		},
		get isDirty() {
			return isDirty;
		},
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
		resetLayout: resetLayoutStore,

		// Rack actions
		addRack,
		updateRack,
		updateRackView,
		deleteRack,
		reorderRacks,
		duplicateRack,

		// Device library actions
		addDeviceToLibrary,
		updateDeviceInLibrary,
		deleteDeviceFromLibrary,

		// Placement actions
		placeDevice,
		moveDevice,
		moveDeviceToRack,
		removeDeviceFromRack,
		updateDeviceFace,

		// Dirty tracking
		markDirty,
		markClean
	};
}

/**
 * Create a new layout with the given name
 * @param name - Layout name
 */
function createNewLayout(name: string): void {
	layout = createLayout(name);
	isDirty = false;
}

/**
 * Load an existing layout
 * Automatically migrates from older versions
 * @param layoutData - Layout to load
 */
function loadLayout(layoutData: Layout): void {
	layout = migrateLayout(layoutData);
	isDirty = false;
}

/**
 * Add a new rack to the layout
 * @param name - Rack name
 * @param height - Rack height in U
 * @returns The created rack, or null if max racks reached
 */
function addRack(name: string, height: number): Rack | null {
	if (layout.racks.length >= MAX_RACKS) {
		return null;
	}

	const rack = createRack(name, height);
	rack.position = layout.racks.length;

	layout.racks = [...layout.racks, rack];
	isDirty = true;

	return rack;
}

/**
 * Update a rack's properties
 * @param id - Rack ID
 * @param updates - Properties to update
 */
function updateRack(id: string, updates: Partial<Rack>): void {
	const index = layout.racks.findIndex((r) => r.id === id);
	if (index === -1) return;

	layout.racks = layout.racks.map((rack) => (rack.id === id ? { ...rack, ...updates } : rack));
	isDirty = true;
}

/**
 * Update a rack's view (front/rear)
 * @param id - Rack ID
 * @param view - New view
 */
function updateRackView(id: string, view: 'front' | 'rear'): void {
	updateRack(id, { view });
}

/**
 * Delete a rack from the layout
 * @param id - Rack ID
 */
function deleteRack(id: string): void {
	const index = layout.racks.findIndex((r) => r.id === id);
	if (index === -1) return;

	// Remove the rack and update positions of remaining racks
	layout.racks = layout.racks
		.filter((r) => r.id !== id)
		.map((rack, idx) => ({
			...rack,
			position: idx
		}));
	isDirty = true;
}

/**
 * Reorder racks by swapping positions
 * @param fromIndex - Source position
 * @param toIndex - Target position
 */
function reorderRacks(fromIndex: number, toIndex: number): void {
	if (
		fromIndex < 0 ||
		fromIndex >= layout.racks.length ||
		toIndex < 0 ||
		toIndex >= layout.racks.length
	) {
		return;
	}

	// Sort racks by position first
	const sortedRacks = [...layout.racks].sort((a, b) => a.position - b.position);

	// Get the racks at the two positions
	const rackAtFrom = sortedRacks[fromIndex];
	const rackAtTo = sortedRacks[toIndex];

	if (!rackAtFrom || !rackAtTo) return;

	// Swap positions by updating the position property
	layout.racks = layout.racks.map((rack) => {
		if (rack.id === rackAtFrom.id) {
			return { ...rack, position: toIndex };
		}
		if (rack.id === rackAtTo.id) {
			return { ...rack, position: fromIndex };
		}
		return rack;
	});

	isDirty = true;
}

/**
 * Duplicate a rack with all its devices
 * @param id - Rack ID to duplicate
 * @returns Success object or error message
 */
function duplicateRack(id: string): { error?: string } {
	// Check max racks limit
	if (layout.racks.length >= MAX_RACKS) {
		return { error: 'Maximum of 6 racks allowed' };
	}

	// Find the rack to duplicate
	const originalRack = layout.racks.find((r) => r.id === id);
	if (!originalRack) {
		return { error: 'Rack not found' };
	}

	// Create duplicate using utility function
	const duplicate = duplicateRackUtil(originalRack);

	// Insert duplicate after original and update positions
	const insertPosition = originalRack.position + 1;
	const updatedRacks = layout.racks.map((rack) => {
		// Shift positions of racks after the insertion point
		if (rack.position >= insertPosition) {
			return { ...rack, position: rack.position + 1 };
		}
		return rack;
	});

	// Add the duplicate at the insertion position
	layout.racks = [...updatedRacks, { ...duplicate, position: insertPosition }];
	isDirty = true;

	return {};
}

/**
 * Add a device to the library
 * @param deviceData - Device data without ID
 * @returns The created device
 */
function addDeviceToLibrary(deviceData: {
	name: string;
	height: number;
	category: DeviceCategory;
	colour: string;
	notes?: string;
}): Device {
	const device: Device = {
		id: generateId(),
		name: deviceData.name,
		height: deviceData.height,
		category: deviceData.category,
		colour: deviceData.colour,
		notes: deviceData.notes
	};

	layout.deviceLibrary = [...layout.deviceLibrary, device];
	isDirty = true;

	return device;
}

/**
 * Update a device in the library
 * @param id - Device ID
 * @param updates - Properties to update
 */
function updateDeviceInLibrary(id: string, updates: Partial<Device>): void {
	layout.deviceLibrary = layout.deviceLibrary.map((device) =>
		device.id === id ? { ...device, ...updates } : device
	);
	isDirty = true;
}

/**
 * Delete a device from the library
 * @param id - Device ID
 */
function deleteDeviceFromLibrary(id: string): void {
	layout.deviceLibrary = layout.deviceLibrary.filter((d) => d.id !== id);
	isDirty = true;
}

/**
 * Place a device from the library into a rack
 * @param rackId - Target rack ID
 * @param libraryId - Device library ID
 * @param position - U position (bottom of device)
 * @param face - Optional face assignment (defaults to DEFAULT_DEVICE_FACE)
 * @returns true if placed successfully, false otherwise
 */
function placeDevice(
	rackId: string,
	libraryId: string,
	position: number,
	face: 'front' | 'rear' | 'both' = DEFAULT_DEVICE_FACE
): boolean {
	const rackIndex = layout.racks.findIndex((r) => r.id === rackId);
	if (rackIndex === -1) return false;

	const rack = layout.racks[rackIndex]!;
	const device = layout.deviceLibrary.find((d) => d.id === libraryId);
	if (!device) return false;

	// Check if placement is valid
	if (!canPlaceDevice(rack, layout.deviceLibrary, device.height, position)) {
		return false;
	}

	// Add device to rack
	const updatedRack = {
		...rack,
		devices: [...rack.devices, { libraryId, position, face }]
	};

	layout.racks = layout.racks.map((r) => (r.id === rackId ? updatedRack : r));
	isDirty = true;

	return true;
}

/**
 * Move a device within the same rack
 * @param rackId - Rack ID
 * @param deviceIndex - Index of device in rack's devices array
 * @param newPosition - New U position
 * @returns true if moved successfully, false otherwise
 */
function moveDevice(rackId: string, deviceIndex: number, newPosition: number): boolean {
	const rackIndex = layout.racks.findIndex((r) => r.id === rackId);
	if (rackIndex === -1) return false;

	const rack = layout.racks[rackIndex]!;
	if (deviceIndex < 0 || deviceIndex >= rack.devices.length) return false;

	const placedDevice = rack.devices[deviceIndex]!;
	const device = layout.deviceLibrary.find((d) => d.id === placedDevice.libraryId);
	if (!device) return false;

	// Check for collisions (excluding the device being moved)
	const collisions = findCollisions(
		rack,
		layout.deviceLibrary,
		device.height,
		newPosition,
		deviceIndex
	);
	if (collisions.length > 0) return false;

	// Check bounds
	if (newPosition < 1 || newPosition + device.height - 1 > rack.height) {
		return false;
	}

	// Update device position
	const updatedDevices = rack.devices.map((d, idx) =>
		idx === deviceIndex ? { ...d, position: newPosition } : d
	);

	layout.racks = layout.racks.map((r) => (r.id === rackId ? { ...r, devices: updatedDevices } : r));
	isDirty = true;

	return true;
}

/**
 * Move a device from one rack to another
 * @param fromRackId - Source rack ID
 * @param deviceIndex - Index of device in source rack
 * @param toRackId - Target rack ID
 * @param newPosition - Position in target rack
 * @returns true if moved successfully, false otherwise
 */
function moveDeviceToRack(
	fromRackId: string,
	deviceIndex: number,
	toRackId: string,
	newPosition: number
): boolean {
	// Same rack? Use moveDevice instead
	if (fromRackId === toRackId) {
		return moveDevice(fromRackId, deviceIndex, newPosition);
	}

	const fromRackIndex = layout.racks.findIndex((r) => r.id === fromRackId);
	const toRackIndex = layout.racks.findIndex((r) => r.id === toRackId);
	if (fromRackIndex === -1 || toRackIndex === -1) return false;

	const fromRack = layout.racks[fromRackIndex]!;
	const toRack = layout.racks[toRackIndex]!;

	if (deviceIndex < 0 || deviceIndex >= fromRack.devices.length) return false;

	const placedDevice = fromRack.devices[deviceIndex]!;
	const device = layout.deviceLibrary.find((d) => d.id === placedDevice.libraryId);
	if (!device) return false;

	// Check if placement is valid in target rack
	if (!canPlaceDevice(toRack, layout.deviceLibrary, device.height, newPosition)) {
		return false;
	}

	// Remove from source rack
	const updatedFromDevices = fromRack.devices.filter((_, idx) => idx !== deviceIndex);

	// Add to target rack (preserve face from source device)
	const updatedToDevices = [
		...toRack.devices,
		{ libraryId: placedDevice.libraryId, position: newPosition, face: placedDevice.face }
	];

	// Update both racks
	layout.racks = layout.racks.map((r) => {
		if (r.id === fromRackId) {
			return { ...r, devices: updatedFromDevices };
		}
		if (r.id === toRackId) {
			return { ...r, devices: updatedToDevices };
		}
		return r;
	});
	isDirty = true;

	return true;
}

/**
 * Remove a device from a rack
 * @param rackId - Rack ID
 * @param deviceIndex - Index of device in rack's devices array
 */
function removeDeviceFromRack(rackId: string, deviceIndex: number): void {
	const rackIndex = layout.racks.findIndex((r) => r.id === rackId);
	if (rackIndex === -1) return;

	const rack = layout.racks[rackIndex]!;
	if (deviceIndex < 0 || deviceIndex >= rack.devices.length) return;

	const updatedDevices = rack.devices.filter((_, idx) => idx !== deviceIndex);
	layout.racks = layout.racks.map((r) => (r.id === rackId ? { ...r, devices: updatedDevices } : r));
	isDirty = true;
}

/**
 * Update a device's face property
 * @param rackId - Rack ID
 * @param deviceIndex - Index of device in rack's devices array
 * @param face - New face value ('front' | 'rear' | 'both')
 */
function updateDeviceFace(
	rackId: string,
	deviceIndex: number,
	face: 'front' | 'rear' | 'both'
): void {
	const rackIndex = layout.racks.findIndex((r) => r.id === rackId);
	if (rackIndex === -1) return;

	const rack = layout.racks[rackIndex]!;
	if (deviceIndex < 0 || deviceIndex >= rack.devices.length) return;

	const updatedDevices = rack.devices.map((d, idx) => (idx === deviceIndex ? { ...d, face } : d));

	layout.racks = layout.racks.map((r) => (r.id === rackId ? { ...r, devices: updatedDevices } : r));
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
