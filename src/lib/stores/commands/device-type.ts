/**
 * Device Type Commands for Undo/Redo
 */

import type { Command } from './types';
import type { DeviceTypeV02, DeviceV02 } from '$lib/types/v02';

/**
 * Interface for layout store operations needed by device type commands
 */
export interface DeviceTypeCommandStore {
	addDeviceTypeRaw(deviceType: DeviceTypeV02): void;
	removeDeviceTypeRaw(slug: string): void;
	updateDeviceTypeRaw(slug: string, updates: Partial<DeviceTypeV02>): void;
	placeDeviceRaw(device: DeviceV02): number;
	removeDeviceAtIndexRaw(index: number): void;
	getPlacedDevicesForType(slug: string): DeviceV02[];
}

/**
 * Create a command to add a device type
 */
export function createAddDeviceTypeCommand(
	deviceType: DeviceTypeV02,
	store: DeviceTypeCommandStore
): Command {
	return {
		type: 'ADD_DEVICE_TYPE',
		description: `Add ${deviceType.model ?? deviceType.slug}`,
		timestamp: Date.now(),
		execute() {
			store.addDeviceTypeRaw(deviceType);
		},
		undo() {
			store.removeDeviceTypeRaw(deviceType.slug);
		}
	};
}

/**
 * Create a command to update a device type
 */
export function createUpdateDeviceTypeCommand(
	slug: string,
	before: Partial<DeviceTypeV02>,
	after: Partial<DeviceTypeV02>,
	store: DeviceTypeCommandStore
): Command {
	return {
		type: 'UPDATE_DEVICE_TYPE',
		description: `Update ${slug}`,
		timestamp: Date.now(),
		execute() {
			store.updateDeviceTypeRaw(slug, after);
		},
		undo() {
			store.updateDeviceTypeRaw(slug, before);
		}
	};
}

/**
 * Create a command to delete a device type (including placed instances)
 */
export function createDeleteDeviceTypeCommand(
	deviceType: DeviceTypeV02,
	placedDevices: DeviceV02[],
	store: DeviceTypeCommandStore
): Command {
	// Store device indices for restoration (in reverse order for proper undo)
	const deviceData = placedDevices.map((d) => ({ ...d }));

	return {
		type: 'DELETE_DEVICE_TYPE',
		description: `Delete ${deviceType.model ?? deviceType.slug}`,
		timestamp: Date.now(),
		execute() {
			// Remove device type (this should also remove placed instances via store logic)
			store.removeDeviceTypeRaw(deviceType.slug);
		},
		undo() {
			// First restore the device type
			store.addDeviceTypeRaw(deviceType);
			// Then restore all placed instances
			deviceData.forEach((device) => {
				store.placeDeviceRaw(device);
			});
		}
	};
}
