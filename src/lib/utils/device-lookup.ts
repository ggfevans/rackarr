/**
 * Device Type Lookup Utility
 * Unified lookup across all device sources with clear priority order
 */

import type { DeviceType } from '$lib/types';
import { findStarterDevice } from '$lib/data/starterLibrary';
import { findBrandDevice } from '$lib/data/brandPacks';

/**
 * Find a device type by slug across all sources
 *
 * Priority order:
 * 1. Layout device_types (user's custom/imported types)
 * 2. Starter pack (generic devices)
 * 3. Brand packs (vendor-specific devices)
 *
 * @param slug - Device type slug to find
 * @param layoutDeviceTypes - Device types from the current layout (optional)
 * @returns DeviceType or undefined if not found
 */
export function findDeviceType(
	slug: string,
	layoutDeviceTypes: DeviceType[] = []
): DeviceType | undefined {
	// 1. Check layout's device_types first (user's custom/imported)
	const layoutDevice = layoutDeviceTypes.find((dt) => dt.slug === slug);
	if (layoutDevice) {
		return layoutDevice;
	}

	// 2. Check starter pack
	const starterDevice = findStarterDevice(slug);
	if (starterDevice) {
		return starterDevice;
	}

	// 3. Check brand packs
	const brandDevice = findBrandDevice(slug);
	if (brandDevice) {
		return brandDevice;
	}

	return undefined;
}

/**
 * Find a device type in a specific device library array
 * Simpler version for when you already have the combined library
 *
 * @param deviceLibrary - Array of device types to search
 * @param slug - Device type slug to find
 * @returns DeviceType or undefined if not found
 */
export function findDeviceInLibrary(
	deviceLibrary: DeviceType[],
	slug: string
): DeviceType | undefined {
	return deviceLibrary.find((dt) => dt.slug === slug);
}
