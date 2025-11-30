/**
 * Device Library Import Utilities
 * Validation and parsing for importing device libraries from JSON
 */

import type { Device, DeviceCategory } from '$lib/types';
import { generateId, getDefaultColour } from './device';

// Valid device categories for validation
const VALID_CATEGORIES: DeviceCategory[] = [
	'server',
	'network',
	'patch-panel',
	'power',
	'storage',
	'kvm',
	'av-media',
	'cooling',
	'blank',
	'other'
];

// Import validation allows broader height range than UI (0.5U-100U)
const IMPORT_MIN_HEIGHT = 0.5;
const IMPORT_MAX_HEIGHT = 100;

/**
 * Raw device data from import (before validation and ID assignment)
 */
interface RawImportDevice {
	name?: string;
	height?: number;
	category?: string;
	colour?: string;
	notes?: string;
}

/**
 * Validate a device object for import
 * More permissive than UI validation (allows 0.5U-100U)
 */
export function validateImportDevice(device: unknown): boolean {
	// Must be an object
	if (!device || typeof device !== 'object') {
		return false;
	}

	const rawDevice = device as Record<string, unknown>;

	// Validate name exists and is non-empty
	if (typeof rawDevice.name !== 'string' || rawDevice.name.trim() === '') {
		return false;
	}

	// Validate height is a number in valid range
	if (typeof rawDevice.height !== 'number') {
		return false;
	}
	if (rawDevice.height < IMPORT_MIN_HEIGHT || rawDevice.height > IMPORT_MAX_HEIGHT) {
		return false;
	}

	// Validate category is valid
	if (typeof rawDevice.category !== 'string') {
		return false;
	}
	if (!VALID_CATEGORIES.includes(rawDevice.category as DeviceCategory)) {
		return false;
	}

	return true;
}

/**
 * Result of parsing device library import
 */
export interface ParseDeviceLibraryResult {
	/** Successfully imported devices with IDs and colours assigned */
	devices: Device[];
	/** Count of invalid devices that were skipped */
	skipped: number;
}

/**
 * Generate a unique device name by adding (imported N) suffix if needed
 */
function generateUniqueName(baseName: string, existingNames: string[]): string {
	if (!existingNames.includes(baseName)) {
		return baseName;
	}

	// Try (imported)
	const candidateName = `${baseName} (imported)`;
	if (!existingNames.includes(candidateName)) {
		return candidateName;
	}

	// Try (imported N) for incrementing N
	let counter = 2;
	while (existingNames.includes(`${baseName} (imported ${counter})`)) {
		counter++;
	}

	return `${baseName} (imported ${counter})`;
}

/**
 * Parse and validate device library import from JSON
 * Assigns UUIDs and colours to imported devices
 * Renames duplicates with (imported) suffix
 */
export function parseDeviceLibraryImport(
	json: string,
	existingNames: string[] = []
): ParseDeviceLibraryResult {
	let data: unknown;

	// Parse JSON
	try {
		data = JSON.parse(json);
	} catch {
		return { devices: [], skipped: 0 };
	}

	// Check for devices array
	if (!data || typeof data !== 'object' || !('devices' in data) || !Array.isArray(data.devices)) {
		return { devices: [], skipped: 0 };
	}

	const devices: Device[] = [];
	let skipped = 0;
	const allNames = [...existingNames];

	for (const rawDevice of data.devices as RawImportDevice[]) {
		// Validate device
		if (!validateImportDevice(rawDevice)) {
			skipped++;
			continue;
		}

		// Generate unique name if duplicate
		const uniqueName = generateUniqueName(rawDevice.name!, allNames);
		allNames.push(uniqueName);

		// Create device with assigned ID and colour
		const device: Device = {
			id: generateId(),
			name: uniqueName,
			height: rawDevice.height!,
			category: rawDevice.category as DeviceCategory,
			colour: rawDevice.colour ?? getDefaultColour(rawDevice.category as DeviceCategory),
			notes: rawDevice.notes
		};

		devices.push(device);
	}

	return { devices, skipped };
}
