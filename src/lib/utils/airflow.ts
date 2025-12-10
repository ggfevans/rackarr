/**
 * Airflow Utilities
 * Conflict detection and airflow analysis for rack devices
 */

import type { Rack, DeviceType, Airflow, PlacedDevice } from '$lib/types';

/**
 * Airflow conflict information
 */
export interface AirflowConflict {
	/** Position (U) where conflict occurs */
	position: number;
	/** Device causing the conflict (lower device) */
	lowerDevice: PlacedDevice;
	/** Device affected by the conflict (upper device) */
	upperDevice: PlacedDevice;
	/** Type of conflict */
	type: 'exhaust-to-intake' | 'intake-to-exhaust';
	/** Which face the conflict occurs on */
	face: 'front' | 'rear';
}

/**
 * Get the exhaust/intake direction for a given airflow type and face
 * Returns 'exhaust', 'intake', or 'neutral'
 */
export function getAirflowDirection(
	airflow: Airflow | undefined,
	face: 'front' | 'rear'
): 'exhaust' | 'intake' | 'neutral' {
	if (!airflow || airflow === 'passive') return 'neutral';

	switch (airflow) {
		case 'front-to-rear':
			return face === 'front' ? 'intake' : 'exhaust';
		case 'rear-to-front':
			return face === 'rear' ? 'intake' : 'exhaust';
		case 'side-to-rear':
			// Side intake, rear exhaust
			return face === 'front' ? 'intake' : 'exhaust';
		default:
			return 'neutral';
	}
}

/**
 * Check if two adjacent devices have conflicting airflow
 * A conflict occurs when the lower device exhausts and the upper device intakes on the same face
 */
export function hasAirflowConflict(
	lowerAirflow: Airflow | undefined,
	upperAirflow: Airflow | undefined,
	face: 'front' | 'rear'
): boolean {
	const lowerDirection = getAirflowDirection(lowerAirflow, face);
	const upperDirection = getAirflowDirection(upperAirflow, face);

	// Conflict: lower exhausts, upper intakes (hot air rises into cold intake)
	return lowerDirection === 'exhaust' && upperDirection === 'intake';
}

/**
 * Find all airflow conflicts in a rack
 * @param rack - The rack to check
 * @param deviceLibrary - Device library for airflow info
 * @returns Array of conflicts found
 */
export function findAirflowConflicts(rack: Rack, deviceLibrary: DeviceType[]): AirflowConflict[] {
	const conflicts: AirflowConflict[] = [];

	// Sort devices by position (ascending)
	const sortedDevices = [...rack.devices].sort((a, b) => a.position - b.position);

	// Check each pair of adjacent devices
	for (let i = 0; i < sortedDevices.length - 1; i++) {
		const lowerDevice = sortedDevices[i];
		const upperDevice = sortedDevices[i + 1];

		// Type guard (should never be undefined with our loop bounds)
		if (!lowerDevice || !upperDevice) continue;

		// Get device info from library
		const lowerInfo = deviceLibrary.find((d) => d.slug === lowerDevice.device_type);
		const upperInfo = deviceLibrary.find((d) => d.slug === upperDevice.device_type);

		if (!lowerInfo || !upperInfo) continue;

		// Check if devices are actually adjacent (touching)
		const lowerTop = lowerDevice.position + lowerInfo.u_height - 1;
		const upperBottom = upperDevice.position;

		if (upperBottom !== lowerTop + 1) continue; // Not adjacent

		// Check both faces for conflicts
		for (const face of ['front', 'rear'] as const) {
			// Only check if both devices are visible on this face
			const lowerVisible = lowerDevice.face === face || lowerDevice.face === 'both';
			const upperVisible = upperDevice.face === face || upperDevice.face === 'both';

			if (!lowerVisible || !upperVisible) continue;

			if (hasAirflowConflict(lowerInfo.airflow, upperInfo.airflow, face)) {
				conflicts.push({
					position: upperBottom,
					lowerDevice,
					upperDevice,
					type: 'exhaust-to-intake',
					face
				});
			}
		}
	}

	return conflicts;
}

/**
 * Check if a specific device has any airflow conflicts
 * @param rack - The rack containing the device
 * @param deviceLibrary - Device library for airflow info
 * @param placedDevice - The placed device to check
 * @returns Array of conflicts involving this device
 */
export function getDeviceAirflowConflicts(
	rack: Rack,
	deviceLibrary: DeviceType[],
	placedDevice: PlacedDevice
): AirflowConflict[] {
	const allConflicts = findAirflowConflicts(rack, deviceLibrary);
	return allConflicts.filter(
		(c) => c.lowerDevice === placedDevice || c.upperDevice === placedDevice
	);
}
