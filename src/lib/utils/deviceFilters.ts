/**
 * Device Filters
 * Utility functions for searching and grouping devices
 */

import type { DeviceType, DeviceCategory } from '$lib/types';

/**
 * Search device types by model/slug (case-insensitive)
 * @param devices - Array of device types to search
 * @param query - Search query string
 * @returns Filtered array of device types matching the query
 */
export function searchDevices(devices: DeviceType[], query: string): DeviceType[] {
	if (!query.trim()) {
		return devices;
	}

	const normalizedQuery = query.toLowerCase().trim();

	return devices.filter((device) => {
		const name = device.model ?? device.slug;
		return name.toLowerCase().includes(normalizedQuery);
	});
}

/**
 * Group device types by category
 * @param devices - Array of device types to group
 * @returns Map of category to device types in that category
 */
export function groupDevicesByCategory(devices: DeviceType[]): Map<DeviceCategory, DeviceType[]> {
	const groups = new Map<DeviceCategory, DeviceType[]>();

	for (const device of devices) {
		const existing = groups.get(device.category) ?? [];
		groups.set(device.category, [...existing, device]);
	}

	return groups;
}

/**
 * Get the first device matching a search query
 * @param devices - Array of device types to search
 * @param query - Search query string
 * @returns First matching device or null if no matches
 */
export function getFirstMatch(devices: DeviceType[], query: string): DeviceType | null {
	const matches = searchDevices(devices, query);
	return matches.length > 0 ? matches[0] : null;
}

/**
 * Get display name for a device category
 * @param category - Device category
 * @returns Human-readable category name
 */
export function getCategoryDisplayName(category: DeviceCategory): string {
	const names: Record<DeviceCategory, string> = {
		server: 'Servers',
		network: 'Network',
		'patch-panel': 'Patch Panels',
		power: 'Power',
		storage: 'Storage',
		kvm: 'KVM',
		'av-media': 'AV/Media',
		cooling: 'Cooling',
		shelf: 'Shelves',
		blank: 'Blanks',
		'cable-management': 'Cable Management',
		other: 'Other'
	};

	return names[category] ?? category;
}

/**
 * Sort devices by manufacturer (brand) first, then by model within each brand
 * Devices without a manufacturer are sorted last, then by model
 * @param devices - Array of device types to sort
 * @returns New sorted array (does not mutate original)
 */
export function sortDevicesByBrandThenModel(devices: DeviceType[]): DeviceType[] {
	return [...devices].sort((a, b) => {
		const aManufacturer = a.manufacturer?.toLowerCase() ?? '';
		const bManufacturer = b.manufacturer?.toLowerCase() ?? '';

		// Devices with manufacturer come before those without
		if (aManufacturer && !bManufacturer) return -1;
		if (!aManufacturer && bManufacturer) return 1;

		// Sort by manufacturer first
		if (aManufacturer !== bManufacturer) {
			return aManufacturer.localeCompare(bManufacturer);
		}

		// Then sort by model
		const aModel = (a.model ?? a.slug).toLowerCase();
		const bModel = (b.model ?? b.slug).toLowerCase();
		return aModel.localeCompare(bModel);
	});
}

/**
 * Sort devices alphabetically by model name (A-Z)
 * Falls back to slug if model is not defined
 * @param devices - Array of device types to sort
 * @returns New sorted array (does not mutate original)
 */
export function sortDevicesAlphabetically(devices: DeviceType[]): DeviceType[] {
	return [...devices].sort((a, b) => {
		const aName = (a.model ?? a.slug).toLowerCase();
		const bName = (b.model ?? b.slug).toLowerCase();
		return aName.localeCompare(bName);
	});
}
