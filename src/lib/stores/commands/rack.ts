/**
 * Rack Commands for Undo/Redo
 */

import type { Command } from './types';
import type { Rack, PlacedDevice } from '$lib/types';

/**
 * Rack settings that can be updated
 */
export type RackSettings = Omit<Rack, 'devices' | 'view'>;

/**
 * Interface for layout store operations needed by rack commands
 */
export interface RackCommandStore {
	updateRackRaw(updates: Partial<RackSettings>): void;
	replaceRackRaw(rack: Rack): void;
	clearRackDevicesRaw(): PlacedDevice[];
	restoreRackDevicesRaw(devices: PlacedDevice[]): void;
	getRack(): Rack;
}

/**
 * Create a command to update rack settings
 */
export function createUpdateRackCommand(
	before: Partial<RackSettings>,
	after: Partial<RackSettings>,
	store: RackCommandStore
): Command {
	return {
		type: 'UPDATE_RACK',
		description: 'Update rack settings',
		timestamp: Date.now(),
		execute() {
			store.updateRackRaw(after);
		},
		undo() {
			store.updateRackRaw(before);
		}
	};
}

/**
 * Create a command to replace the entire rack
 * Used for bulk operations or loading from file
 */
export function createReplaceRackCommand(
	oldRack: Rack,
	newRack: Rack,
	store: RackCommandStore
): Command {
	// Deep copy to avoid mutation issues
	const oldRackCopy = JSON.parse(JSON.stringify(oldRack)) as Rack;
	const newRackCopy = JSON.parse(JSON.stringify(newRack)) as Rack;

	return {
		type: 'REPLACE_RACK',
		description: 'Replace rack',
		timestamp: Date.now(),
		execute() {
			store.replaceRackRaw(newRackCopy);
		},
		undo() {
			store.replaceRackRaw(oldRackCopy);
		}
	};
}

/**
 * Create a command to clear all devices from the rack
 */
export function createClearRackCommand(devices: PlacedDevice[], store: RackCommandStore): Command {
	// Store copies of all devices for restoration
	const devicesCopy = devices.map((d) => ({ ...d }));

	return {
		type: 'CLEAR_RACK',
		description: `Clear rack (${devices.length} device${devices.length === 1 ? '' : 's'})`,
		timestamp: Date.now(),
		execute() {
			store.clearRackDevicesRaw();
		},
		undo() {
			store.restoreRackDevicesRaw(devicesCopy);
		}
	};
}
