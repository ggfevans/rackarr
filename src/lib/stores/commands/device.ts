/**
 * Device Commands for Undo/Redo
 */

import type { Command } from './types';
import type { DeviceV02 } from '$lib/types/v02';

/**
 * Interface for layout store operations needed by device commands
 */
export interface DeviceCommandStore {
	placeDeviceRaw(device: DeviceV02): number;
	removeDeviceAtIndexRaw(index: number): DeviceV02 | undefined;
	moveDeviceRaw(index: number, newPosition: number): boolean;
	updateDeviceFaceRaw(index: number, face: 'front' | 'rear'): void;
	getDeviceAtIndex(index: number): DeviceV02 | undefined;
}

/**
 * Create a command to place a device
 */
export function createPlaceDeviceCommand(
	device: DeviceV02,
	store: DeviceCommandStore,
	deviceName: string = 'device'
): Command {
	let placedIndex: number = -1;

	return {
		type: 'PLACE_DEVICE',
		description: `Place ${deviceName}`,
		timestamp: Date.now(),
		execute() {
			placedIndex = store.placeDeviceRaw(device);
		},
		undo() {
			if (placedIndex >= 0) {
				store.removeDeviceAtIndexRaw(placedIndex);
			}
		}
	};
}

/**
 * Create a command to move a device
 */
export function createMoveDeviceCommand(
	index: number,
	oldPosition: number,
	newPosition: number,
	store: DeviceCommandStore,
	deviceName: string = 'device'
): Command {
	return {
		type: 'MOVE_DEVICE',
		description: `Move ${deviceName}`,
		timestamp: Date.now(),
		execute() {
			store.moveDeviceRaw(index, newPosition);
		},
		undo() {
			store.moveDeviceRaw(index, oldPosition);
		}
	};
}

/**
 * Create a command to remove a device
 */
export function createRemoveDeviceCommand(
	index: number,
	device: DeviceV02,
	store: DeviceCommandStore,
	deviceName: string = 'device'
): Command {
	// Store a copy of the device for restoration
	const deviceCopy = { ...device };

	return {
		type: 'REMOVE_DEVICE',
		description: `Remove ${deviceName}`,
		timestamp: Date.now(),
		execute() {
			store.removeDeviceAtIndexRaw(index);
		},
		undo() {
			store.placeDeviceRaw(deviceCopy);
		}
	};
}

/**
 * Create a command to update a device's display face
 */
export function createUpdateDeviceFaceCommand(
	index: number,
	oldFace: 'front' | 'rear',
	newFace: 'front' | 'rear',
	store: DeviceCommandStore,
	deviceName: string = 'device'
): Command {
	return {
		type: 'UPDATE_DEVICE_FACE',
		description: `Flip ${deviceName}`,
		timestamp: Date.now(),
		execute() {
			store.updateDeviceFaceRaw(index, newFace);
		},
		undo() {
			store.updateDeviceFaceRaw(index, oldFace);
		}
	};
}
