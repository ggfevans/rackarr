/**
 * Blocked Slots Utility
 *
 * Calculates which U slots are blocked by devices on the opposite face.
 * Used for rendering visual indicators in dual-view mode.
 */

import type { Rack, DeviceType, RackView } from '$lib/types';

/**
 * Represents a range of U positions (inclusive)
 */
export interface URange {
	bottom: number; // Lower U position
	top: number; // Upper U position
}

/**
 * Calculate which U slots are blocked for a given view.
 *
 * A slot is blocked when:
 * - A device on the OPPOSITE face has is_full_depth=true (or undefined, which defaults to true)
 * - A device with face='both' occupies that slot
 *
 * @param rack - The rack containing devices
 * @param view - The view to calculate blocked slots for ('front' or 'rear')
 * @param deviceLibrary - Array of device types to look up device heights
 * @returns Array of U ranges that are blocked
 */
export function getBlockedSlots(rack: Rack, view: RackView, deviceLibrary: DeviceType[]): URange[] {
	const blocked: URange[] = [];

	for (const placedDevice of rack.devices) {
		// Skip devices on the same face (they don't block the view we're checking)
		if (placedDevice.face === view) continue;

		// Find the device type to get height and full-depth info
		const deviceType = deviceLibrary.find((d) => d.slug === placedDevice.device_type);
		if (!deviceType) continue;

		// Check if this device blocks the opposite face
		// A device blocks the opposite face if:
		// 1. It has face='both' (always blocks both)
		// 2. It is full-depth (is_full_depth=true or undefined, which defaults to true)
		const isFullDepth = deviceType.is_full_depth !== false; // undefined or true = full depth

		// If not full-depth and not 'both' face, it doesn't block
		if (!isFullDepth && placedDevice.face !== 'both') continue;

		// Calculate the U range this device blocks
		const bottom = placedDevice.position;
		const top = placedDevice.position + deviceType.u_height - 1;

		blocked.push({ bottom, top });
	}

	return blocked;
}

/**
 * Check if a specific U position is blocked
 *
 * @param blockedSlots - Array of blocked U ranges
 * @param position - The U position to check
 * @returns true if the position is blocked
 */
export function isPositionBlocked(blockedSlots: URange[], position: number): boolean {
	return blockedSlots.some((range) => position >= range.bottom && position <= range.top);
}

/**
 * Check if a device at a given position would overlap with blocked slots
 *
 * @param blockedSlots - Array of blocked U ranges
 * @param position - Starting U position for the device
 * @param height - Height of the device in U
 * @returns true if any part of the device would be in a blocked slot
 */
export function wouldOverlapBlocked(
	blockedSlots: URange[],
	position: number,
	height: number
): boolean {
	const deviceTop = position + height - 1;

	return blockedSlots.some(
		(range) =>
			// Device starts within blocked range
			(position >= range.bottom && position <= range.top) ||
			// Device ends within blocked range
			(deviceTop >= range.bottom && deviceTop <= range.top) ||
			// Device spans entire blocked range
			(position < range.bottom && deviceTop > range.top)
	);
}
