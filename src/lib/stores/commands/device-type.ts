/**
 * Device Type Commands for Undo/Redo
 */

import type { Command } from './types';
import type { DeviceType, PlacedDevice } from '$lib/types';

/**
 * Interface for layout store operations needed by device type commands
 */
export interface DeviceTypeCommandStore {
	addDeviceTypeRaw(deviceType: DeviceType): void;
	removeDeviceTypeRaw(slug: string): void;
	updateDeviceTypeRaw(slug: string, updates: Partial<DeviceType>): void;
	placeDeviceRaw(device: PlacedDevice): number;
	removeDeviceAtIndexRaw(index: number): void;
	getPlacedDevicesForType(slug: string): PlacedDevice[];
}

/**
 * Create a command to add a device type
 */
export function createAddDeviceTypeCommand(
	deviceType: DeviceType,
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
	before: Partial<DeviceType>,
	after: Partial<DeviceType>,
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
	deviceType: DeviceType,
	placedDevices: PlacedDevice[],
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
