/**
 * Rack Utility Functions
 * Pure functions for rack operations
 */

import type { Device, Rack, RackView } from '$lib/types';
import {
	MIN_RACK_HEIGHT,
	MAX_RACK_HEIGHT,
	STANDARD_RACK_WIDTH,
	DEFAULT_RACK_VIEW
} from '$lib/types/constants';
import { generateId } from './device';

/**
 * Create a new rack with sensible defaults
 */
export function createRack(name: string, height: number, view?: RackView): Rack {
	return {
		id: generateId(),
		name,
		height,
		width: STANDARD_RACK_WIDTH,
		position: 0,
		view: view ?? DEFAULT_RACK_VIEW,
		devices: []
	};
}

/**
 * Validation result for a rack
 */
export interface RackValidationResult {
	valid: boolean;
	errors: string[];
}

/**
 * Validate a rack object
 */
export function validateRack(rack: Rack): RackValidationResult {
	const errors: string[] = [];

	// Validate name
	if (!rack.name || rack.name.trim() === '') {
		errors.push('Name is required');
	}

	// Validate height
	if (rack.height < MIN_RACK_HEIGHT || rack.height > MAX_RACK_HEIGHT) {
		errors.push(`Height must be between ${MIN_RACK_HEIGHT} and ${MAX_RACK_HEIGHT}`);
	}

	// Validate width (must be 19 inches for v0.1)
	if (rack.width !== STANDARD_RACK_WIDTH) {
		errors.push(`Width must be ${STANDARD_RACK_WIDTH} inches`);
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Get all U positions occupied by devices in a rack
 * @param rack - The rack to check
 * @param deviceLibrary - The device library to look up device heights
 * @returns Set of occupied U positions
 */
export function getOccupiedUs(rack: Rack, deviceLibrary: Device[]): Set<number> {
	const occupied = new Set<number>();

	for (const placedDevice of rack.devices) {
		const device = deviceLibrary.find((d) => d.id === placedDevice.libraryId);
		if (device) {
			// Device at position P with height H occupies Us P through P+H-1
			for (let u = placedDevice.position; u < placedDevice.position + device.height; u++) {
				occupied.add(u);
			}
		}
	}

	return occupied;
}

/**
 * Check if a specific U position is available in a rack
 * @param rack - The rack to check
 * @param deviceLibrary - The device library to look up device heights
 * @param uPosition - The U position to check
 * @returns true if the position is available, false if occupied
 */
export function isUAvailable(rack: Rack, deviceLibrary: Device[], uPosition: number): boolean {
	const occupied = getOccupiedUs(rack, deviceLibrary);
	return !occupied.has(uPosition);
}

/**
 * Create a deep copy of a rack with a new ID
 * @param rack - The rack to duplicate
 * @returns A new rack with a new ID, copied name, and copied devices
 */
export function duplicateRack(rack: Rack): Rack {
	return {
		...rack,
		id: generateId(),
		name: `${rack.name} (Copy)`,
		position: rack.position + 1,
		devices: rack.devices.map((device) => ({ ...device }))
	};
}
